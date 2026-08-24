import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import SortableCollection from './SortableCollection';

const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'mp4', 'mov'];
const maxItemsFallback = 50;
const xsrfToken = () => {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
};
const fileKey = (file) => `${file.name}-${file.size}-${file.lastModified}`;
const uniqueIds = (values = []) => [...new Set(values.filter((value) => value !== undefined && value !== null && value !== ''))];

export default function AsyncMediaUploader({ existing = [], removed = [], data, setData, compact = false }) {
    const { mediaUpload = {} } = usePage().props;
    const [uploaded, setUploaded] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const endpoint = `${String(mediaUpload.url || '').replace(/\/$/, '')}/admin/media-uploads`;
    const maxBytes = Number(mediaUpload.maxKb || 524288) * 1024;
    const maxItems = Number(mediaUpload.maxItems || maxItemsFallback);
    const visibleExisting = existing.filter((asset) => !removed.includes(asset.id));
    const media = [...visibleExisting, ...uploaded];
    const order = data.media_order?.length ? data.media_order : media.map((asset) => asset.id);
    const ordered = [...media].sort((a, b) => {
        const aIndex = order.indexOf(a.id);
        const bIndex = order.indexOf(b.id);
        return (aIndex < 0 ? media.length : aIndex) - (bIndex < 0 ? media.length : bIndex);
    });

    const updateTask = (key, changes) => setTasks((current) => current.map((task) => task.key === key ? { ...task, ...changes } : task));
    const addErrorTask = (key, name, error) => setTasks((current) => current.some((task) => task.key === key)
        ? current.map((task) => task.key === key ? { ...task, status: 'Erro', error } : task)
        : [...current, { key, name, progress: 0, status: 'Erro', error }]);

    const upload = (file) => new Promise((resolve, reject) => {
        const key = fileKey(file);
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            reject(new Error('Formato não permitido. Envie JPG, JPEG, PNG, WebP, HEIC, HEIF, MP4 ou MOV.'));
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
        request.upload.onload = () => updateTask(key, { progress: 100, status: 'Processando mídia...' });
        request.onerror = () => reject(new Error('Não foi possível acessar o servidor de upload.'));
        request.onload = () => {
            let payload = {};
            try { payload = JSON.parse(request.responseText || '{}'); } catch { /* Proxy errors can return HTML. */ }
            if (request.status >= 200 && request.status < 300 && payload.media) {
                updateTask(key, { status: 'Concluído' });
                resolve(payload.media);
                return;
            }
            const validation = payload.errors?.file?.[0];
            const message = request.status === 413
                ? 'O servidor de upload recusou o arquivo por tamanho. Confira MEDIA_MAX_UPLOAD_KB e os limites do subdomínio.'
                : validation || payload.message || 'Falha ao enviar ou processar a mídia.';
            reject(new Error(message));
        };
        const body = new FormData();
        body.append('file', file);
        request.send(body);
    });

    const appendAsset = (asset) => {
        setUploaded((current) => current.some((item) => item.id === asset.id) ? current : [...current, asset]);
        setData((current) => {
            const uploadedIds = uniqueIds([...(current.uploaded_media_ids || []), asset.id]);
            const currentOrder = current.media_order || visibleExisting.map((item) => item.id);
            const mediaOrder = uniqueIds([...currentOrder, asset.id]);
            return {
                ...current,
                uploaded_media_ids: uploadedIds,
                media_order: mediaOrder,
            };
        });
    };

    const selectFiles = async (files) => {
        const queue = Array.from(files || []);
        if (!queue.length) return;

        const knownIds = new Set(media.map((asset) => asset.id));
        for (const file of queue) {
            const key = fileKey(file);
            if (knownIds.size >= maxItems) {
                addErrorTask(key, file.name, `Você pode enviar no máximo ${maxItems} arquivos nesta galeria.`);
                continue;
            }

            try {
                const asset = await upload(file);
                knownIds.add(asset.id);
                appendAsset(asset);
            } catch (error) {
                addErrorTask(key, file.name, error.message);
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

    const handleDrop = (event) => {
        event.preventDefault();
        setDragActive(false);
        selectFiles(Array.from(event.dataTransfer.files || []));
    };

    return <section className={`rounded-xl border border-line bg-white shadow-sm ${compact ? 'p-5' : 'p-6'}`}>
        <h2 className="text-lg font-medium text-ink">Upload individual de mídia</h2>
        <p className="mt-1 text-sm text-muted">Cada arquivo é enviado e processado separadamente. O formulário final envia somente os IDs.</p>
        <label
            className={`mt-4 block cursor-pointer rounded-xl border border-dashed text-center transition ${dragActive ? 'border-brand bg-brand/10 ring-2 ring-brand/20' : 'border-brand/40 bg-brand/5'} ${compact ? 'p-4' : 'p-6'}`}
            onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
            onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
            onDragLeave={(event) => { event.preventDefault(); setDragActive(false); }}
            onDrop={handleDrop}
        >
            <span className="text-sm font-medium text-brand">{dragActive ? 'Solte os arquivos aqui' : 'Arraste ou clique para enviar'}</span>
            <span className="mt-1 block text-[.65rem] text-muted">JPG, PNG, WebP, HEIC, HEIF, MP4 ou MOV. Limite de {Math.round(maxBytes / 1024 / 1024)} MB por arquivo e até {maxItems} itens.</span>
            <input type="file" multiple accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.mp4,.mov" className="sr-only" onChange={(event) => { selectFiles(Array.from(event.target.files || [])); event.target.value = ''; }} />
        </label>
        {tasks.length > 0 && <div className="mt-4 space-y-3">{tasks.map((task) => <div key={task.key} className="rounded-lg bg-surface p-3 text-xs"><div className="flex justify-between gap-3"><span className="truncate">{task.name}</span><span className={task.error ? 'text-red-700' : 'text-muted'}>{task.status}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full bg-brand transition-[width]" style={{ width: `${task.progress}%` }} /></div>{task.error && <p className="mt-2 text-red-700">{task.error}</p>}</div>)}</div>}
        {ordered.length > 0 && <SortableCollection items={ordered} getKey={(asset) => asset.id} label="mídia" onChange={(items) => setData('media_order', items.map((asset) => asset.id))} onRemove={remove} gridClass={compact ? 'mt-4 grid grid-cols-2 gap-2' : 'mt-5 grid grid-cols-2 gap-3 tablet:grid-cols-4 desktop:grid-cols-[repeat(auto-fill,minmax(150px,1fr))]'} itemClass={compact ? 'min-w-0' : 'min-w-0 max-w-[180px]'} renderItem={(asset, index) => { const video = asset.type === 'video' || asset.mime_type?.startsWith('video/'); return <><div className="relative">{video ? <img src={asset.poster_url || ''} alt="" className="aspect-square w-full bg-ink object-cover" /> : <img src={asset.url} alt={asset.alt_text || ''} className="aspect-square w-full object-cover" />}{video && <div className="absolute inset-0 grid place-items-center bg-black/15"><span className="grid size-9 place-items-center rounded-full bg-black/70 text-sm text-white">&#9654;</span></div>}</div><div className="flex min-h-10 items-center justify-between gap-1 p-2 text-[.65rem]"><span className="truncate text-muted">{video ? 'Vídeo' : 'Foto'} #{String(index + 1).padStart(2, '0')}</span>{!video && <button type="button" onClick={() => setData('featured_media_id', asset.id)} className={String(data.featured_media_id) === String(asset.id) ? 'font-medium text-brand' : 'text-muted'}>{String(data.featured_media_id) === String(asset.id) ? 'Capa' : 'Capa?'}</button>}</div></>; }} />}
    </section>;
}