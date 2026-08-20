import { usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const buttons = [
    ['bold', 'B'], ['italic', 'I'], ['underline', 'U'], ['strikeThrough', 'S'],
    ['insertUnorderedList', '• Lista'], ['insertOrderedList', '1. Lista'],
    ['justifyLeft', 'Esq.'], ['justifyCenter', 'Centro'], ['justifyRight', 'Dir.'],
    ['undo', '↶'], ['redo', '↷'], ['removeFormat', 'Limpar'],
];

export default function RichContentEditor({ label, value = '', onChange, error, minHeight = 280 }) {
    const editor = useRef(null);
    const imageInput = useRef(null);
    const { mediaUpload = {} } = usePage().props;
    const [uploading, setUploading] = useState(false);
    useEffect(() => { if (editor.current && editor.current.innerHTML !== value) editor.current.innerHTML = value || ''; }, [value]);
    const run = (command, argument = null) => { editor.current?.focus(); document.execCommand(command, false, argument); onChange(editor.current?.innerHTML || ''); };
    const uploadImage = async (file) => {
        if (!file) return;
        setUploading(true);
        try {
            const body = new FormData(); body.append('file', file);
            const token = decodeURIComponent(document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)?.[1] || '');
            const endpoint = `${String(mediaUpload.url || '').replace(/\/$/, '')}/admin/media-uploads`;
            const response = await fetch(endpoint, { method: 'POST', body, credentials: 'include', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...(token ? { 'X-XSRF-TOKEN': token } : {}) } });
            const payload = await response.json();
            if (!response.ok || !payload.media?.url) throw new Error(payload.message || 'Falha ao enviar imagem.');
            run('insertHTML', `<figure><img src="${payload.media.url}" alt="" style="max-width:100%;height:auto"><figcaption></figcaption></figure><p><br></p>`);
        } catch (uploadError) { window.alert(uploadError.message); } finally { setUploading(false); }
    };
    return <label className="block"><span className="admin-label">{label}</span><div className="overflow-hidden rounded-xl border border-line bg-white focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10"><div className="flex flex-wrap gap-1 border-b border-line bg-surface p-2">{buttons.map(([command, text]) => <button key={command} type="button" onMouseDown={(event) => { event.preventDefault(); run(command); }} className="rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-medium hover:border-brand">{text}</button>)}<select aria-label="Formato" className="rounded-md border border-line bg-white px-2 text-xs" defaultValue="p" onChange={(event) => run('formatBlock', event.target.value)}><option value="p">Parágrafo</option><option value="h2">H2</option><option value="h3">H3</option><option value="h4">H4</option><option value="blockquote">Citação</option></select><button type="button" onMouseDown={(event) => { event.preventDefault(); const url = window.prompt('URL do link'); if (url) run('createLink', url); }} className="rounded-md border border-line bg-white px-2.5 py-1.5 text-xs">Link</button><button type="button" disabled={uploading} onClick={() => imageInput.current?.click()} className="rounded-md bg-brand px-3 py-1.5 text-xs text-white">{uploading ? 'Enviando...' : 'Inserir imagem'}</button><input ref={imageInput} type="file" accept="image/jpeg,image/png,image/webp,.heic,.heif" className="sr-only" onChange={(event) => { uploadImage(event.target.files?.[0]); event.target.value = ''; }} /></div><div ref={editor} contentEditable suppressContentEditableWarning className="prose max-w-none overflow-y-auto p-4 text-sm leading-7 outline-none [&_img]:my-5 [&_img]:max-w-full [&_img]:rounded-lg" style={{ minHeight }} onInput={(event) => onChange(event.currentTarget.innerHTML)} /></div>{error && <span className="mt-1 block text-xs text-red-700">{error}</span>}</label>;
}
