import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import SortableCollection from './SortableCollection';

const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'mp4', 'mov'];
const xsrfToken = () => {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
};

export default function AsyncMediaUploader({ existing = [], removed = [], data, setData }) {
    const { mediaUpload = {} } = usePage().props;
    const [uploaded, setUploaded] = useState([]);
    const [tasks, setTasks] = useState([]);
    const endpoint = `${String(mediaUpload.url || '').replace(/\/$/, '')}/admin/media-uploads`;
    const maxBytes = Number(mediaUpload.maxKb || 524288) * 1024;
    const visibleExisting = existing.filter((asset) => !removed.includes(asset.id));
    const media = [...visibleExisting, ...uploaded];
    const order = data.media_order?.length ? data.media_order : media.map((asset) => asset.id);
    const ordered = [...media].sort((a, b) => {
        const aIndex = order.indexOf(a.id);
        const bIndex = order.indexOf(b.id);
        return (aIndex < 0 ? media.length : aIndex) - (bIndex < 0 ? media.length : bIndex);
    });

    const updateTask = (key, changes) => setTasks((current) => current.map((task) => task.key === key ? { ...task, ...changes } : task));
    const upload = (file) => new Promise((resolve, reject) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            reject(new Error('Formato n\u00e3o permitido. Envie JPG, JPEG, PNG, WebP, HEIC, HEIF, MP4 ou MOV.'));
            return;
        }
        if (file.size > maxBytes) {
            reject(new Error(`O arquivo ${file.name} ultrapassa o limite de ${Math.round(maxBytes / 1024 / 1024)} MB.`));
            return;
        }

        setTasks((current) => [...current, { key, name: file.name, progress: 0, status: 'Enviando...' }]);
        const request = new XMLHttpRequest();
        request.open('POST', endpoint);
        request.withCredentials = true;
        request.setRequestHeader('Accept', 'application/json');
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        const token = xsrfToken();
        if (token) request.setRequestHeader('X-XSRF-TOKEN', token);
        request.upload.onprogress = (event) => event.lengthComputable && updateTask(key, { progress: Math.round((event.loaded / event.total) * 100) });
        request.upload.onload = () => updateTask(key, { progress: 100, status: 'Processando m\u00eddia...' });
        request.onerror = () => reject(new Error('N\u00e3o foi poss\u00edvel acessar o servidor de upload.'));
        request.onload = () => {
            let payload = {};
            try { payload = JSON.parse(request.responseText || '{}'); } catch { /* Proxy errors can return HTML. */ }
            if (request.status >= 200 && request.status < 300 && payload.media) {
                updateTask(key, { status: 'Conclu\u00eddo' });
                resolve(payload.media);
                return;
            }
            const validation = payload.errors?.file?.[0];
            const message = request.status === 413
                ? 'O servidor de upload recusou o arquivo por tamanho. Confira MEDIA_MAX_UPLOAD_KB e os limites do subdom\u00ednio.'
                : validation || payload.message || 'Falha ao enviar ou processar a m\u00eddia.';
            reject(new Error(message));
        };
        const body = new FormData();
        body.append('file', file);
        request.send(body);
    });

    const selectFiles = async (files) => {
        for (const file of files) {
            try {
                const asset = await upload(file);
                setUploaded((current) => [...current, asset]);
                setData((current) => ({
                    ...current,
                    uploaded_media_ids: [...(current.uploaded_media_ids || []), asset.id],
                    media_order: [...(current.media_order || visibleExisting.map((item) => item.id)), asset.id],
                }));
            } catch (error) {
                const key = `${file.name}-${file.size}-${file.lastModified}`;
                setTasks((current) => current.some((task) => task.key === key)
                    ? current.map((task) => task.key === key ? { ...task, status: 'Erro', error: error.message } : task)
                    : [...current, { key, name: file.name, progress: 0, status: 'Erro', error: error.message }]);
            }
        }
    };
    const remove = (asset) => {
        if (uploaded.some((item) => item.id === asset.id)) {
            setUploaded((current) => current.filter((item) => item.id !== asset.id));
            setData((current) => ({ ...current, uploaded_media_ids: (current.uploaded_media_ids || []).filter((id) => id !== asset.id), media_order: (current.media_order || []).filter((id) => id !== asset.id) }));
        } else {
            setData((current) => ({ ...current, remove_media_ids: [...new Set([...(current.remove_media_ids || []), asset.id])], media_order: (current.media_order || []).filter((id) => id !== asset.id) }));
        }
    };
    return <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-ink">Upload individual de m\u00eddia</h2>
        <p className="mt-1 text-sm text-muted">Cada arquivo é enviado e processado separadamente. O formulário final envia somente os IDs.</p>
        <label className="mt-5 block rounded-xl border border-dashed border-brand/40 bg-brand/5 p-6 text-center"><span className="font-medium text-brand">Selecionar imagens ou v\u00eddeos</span><input type="file" multiple accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.mp4,.mov" className="sr-only" onChange={(event) => { selectFiles(Array.from(event.target.files || [])); event.target.value = ''; }} /></label>
        {tasks.length > 0 && <div className="mt-4 space-y-3">{tasks.map((task) => <div key={task.key} className="rounded-lg bg-surface p-3 text-xs"><div className="flex justify-between gap-3"><span className="truncate">{task.name}</span><span className={task.error ? 'text-red-700' : 'text-muted'}>{task.status}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full bg-brand transition-[width]" style={{ width: `${task.progress}%` }} /></div>{task.error && <p className="mt-2 text-red-700">{task.error}</p>}</div>)}</div>}
        {ordered.length > 0 && <SortableCollection items={ordered} getKey={(asset) => asset.id} label="m\u00eddia" onChange={(items) => setData('media_order', items.map((asset) => asset.id))} onRemove={remove} gridClass="mt-5 grid grid-cols-2 gap-3 tablet:grid-cols-4 desktop:grid-cols-[repeat(auto-fill,minmax(150px,1fr))]" itemClass="min-w-0 max-w-[180px]" renderItem={(asset) => { const video = asset.type === 'video' || asset.mime_type?.startsWith('video/'); return <><div className="relative">{video ? <img src={asset.poster_url || ''} alt="" className="aspect-square w-full bg-ink object-cover" /> : <img src={asset.url} alt={asset.alt_text || ''} className="aspect-square w-full object-cover" />}{video && <div className="absolute inset-0 grid place-items-center bg-black/15"><span className="grid size-9 place-items-center rounded-full bg-black/70 text-sm text-white">&#9654;</span></div>}</div><div className="flex min-h-12 items-center justify-between gap-2 p-2 text-[.65rem]"><span className="truncate text-muted">{video ? 'V\u00eddeo' : 'Imagem'}</span>{!video && <button type="button" onClick={() => setData('featured_media_id', asset.id)} className={String(data.featured_media_id) === String(asset.id) ? 'font-medium text-brand' : 'text-muted'}>{String(data.featured_media_id) === String(asset.id) ? 'Capa' : 'Definir capa'}</button>}</div></>; }} />}
    </section>;
}
