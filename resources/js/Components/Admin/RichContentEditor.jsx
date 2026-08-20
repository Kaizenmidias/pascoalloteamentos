import { usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const commands = [['bold', 'B'], ['italic', 'I'], ['underline', 'U'], ['strikeThrough', 'S'], ['insertUnorderedList', 'Lista'], ['insertOrderedList', '1. Lista'], ['justifyLeft', 'Esq.'], ['justifyCenter', 'Centro'], ['justifyRight', 'Dir.']];

export default function RichContentEditor({ label, value = '', onChange, error, minHeight = 280 }) {
    const editor = useRef(null);
    const imageInput = useRef(null);
    const savedRange = useRef(null);
    const { mediaUpload = {} } = usePage().props;
    const [uploading, setUploading] = useState(false);
    const [active, setActive] = useState({ formatBlock: 'p' });

    useEffect(() => { if (editor.current && editor.current.innerHTML !== value) editor.current.innerHTML = value || ''; }, [value]);
    const updateActive = () => {
        const next = {};
        for (const [command] of commands) next[command] = document.queryCommandState(command);
        const block = String(document.queryCommandValue('formatBlock') || 'p').replace(/[<>]/g, '').toLowerCase();
        next.formatBlock = ['p', 'h2', 'h3', 'h4', 'blockquote'].includes(block) ? block : 'p';
        setActive(next);
    };
    const rememberSelection = () => {
        const selection = window.getSelection();
        if (!selection?.rangeCount || !editor.current?.contains(selection.anchorNode)) return;
        savedRange.current = selection.getRangeAt(0).cloneRange();
        updateActive();
    };
    const restoreSelection = () => {
        editor.current?.focus();
        if (!savedRange.current) return;
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange.current);
    };
    const sync = () => { onChange(editor.current?.innerHTML || ''); rememberSelection(); };
    const run = (command, argument = null) => { restoreSelection(); document.execCommand(command, false, argument); sync(); };
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
    const buttonClass = (selected = false) => `rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${selected ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink hover:border-brand'}`;

    return <div><span className="admin-label">{label}</span><div className="overflow-hidden rounded-xl border border-line bg-white focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10"><div className="flex flex-wrap gap-1 border-b border-line bg-surface p-2" onMouseDown={(event) => event.preventDefault()}>{commands.map(([command, text]) => <button key={command} type="button" aria-pressed={Boolean(active[command])} onClick={() => run(command)} className={buttonClass(active[command])}>{text}</button>)}<select aria-label="Formato" className="rounded-md border border-line bg-white px-2 text-xs" value={active.formatBlock || 'p'} onChange={(event) => run('formatBlock', `<${event.target.value}>`)}><option value="p">Paragrafo</option><option value="h2">H2</option><option value="h3">H3</option><option value="h4">H4</option><option value="blockquote">Citacao</option></select><button type="button" onClick={() => { const url = window.prompt('URL do link'); if (url) run('createLink', url); }} className={buttonClass()}>Link</button><button type="button" onClick={() => run('removeFormat')} className={buttonClass()}>Limpar</button><button type="button" onClick={() => run('undo')} className={buttonClass()}>Desfazer</button><button type="button" onClick={() => run('redo')} className={buttonClass()}>Refazer</button><button type="button" disabled={uploading} onClick={() => { restoreSelection(); imageInput.current?.click(); }} className="rounded-md bg-brand px-3 py-1.5 text-xs text-white disabled:opacity-60">{uploading ? 'Enviando...' : 'Inserir imagem'}</button><input ref={imageInput} type="file" accept="image/jpeg,image/png,image/webp,.heic,.heif" className="sr-only" onChange={(event) => { uploadImage(event.target.files?.[0]); event.target.value = ''; }} /></div><div ref={editor} contentEditable suppressContentEditableWarning className="prose max-w-none overflow-y-auto p-4 text-sm leading-7 outline-none [&_img]:my-5 [&_img]:max-w-full [&_img]:rounded-lg" style={{ minHeight }} onInput={sync} onKeyUp={rememberSelection} onMouseUp={rememberSelection} onFocus={rememberSelection} /></div>{error && <span className="mt-1 block text-xs text-red-700">{error}</span>}</div>;
}
