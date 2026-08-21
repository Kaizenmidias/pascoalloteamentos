import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export const isVideoMedia = (item) => item?.type === 'video' || item?.mime_type?.startsWith('video/');

const captionFor = (item) => {
    if (item?.caption) return item.caption;
    const alt = item?.alt_text?.trim();
    if (!alt || /[\\/]|\.(jpe?g|png|webp|heic|heif|mov|mp4)$/i.test(alt)) return '';
    return alt;
};

export function MediaTile({ item, className = '' }) {
    const video = isVideoMedia(item);
    return (
        <span className={`relative block h-full w-full overflow-hidden bg-ink ${className}`}>
            {video ? (
                item.poster_url
                    ? <img src={item.poster_url} alt={item.alt_text || ''} className="h-full w-full object-cover" />
                    : <video src={item.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
            ) : <img src={item?.url} alt={item?.alt_text || ''} className="h-full w-full object-cover" />}
            {video && <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/65 pl-1 text-2xl text-white shadow-lg" aria-hidden="true">&#9654;</span>}
            <span className="absolute bottom-3 right-3 grid size-8 place-items-center rounded-full bg-black/55 text-lg text-white opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true">&#8599;</span>
        </span>
    );
}

export function MediaLightboxTrigger({ children, index, onOpen, className = '', label = 'Ampliar mídia' }) {
    const origin = useRef(null);
    const dragged = useRef(false);

    const pointerDown = (event) => {
        origin.current = { x: event.clientX, y: event.clientY };
        dragged.current = false;
    };
    const pointerMove = (event) => {
        if (!origin.current) return;
        if (Math.hypot(event.clientX - origin.current.x, event.clientY - origin.current.y) > 8) dragged.current = true;
    };
    const pointerUp = () => {
        if (origin.current && !dragged.current) onOpen(index);
        origin.current = null;
    };

    return (
        <button type="button" aria-label={label} className={`group block cursor-zoom-in text-left ${className}`} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={() => { origin.current = null; }} onClick={(event) => { if (event.detail === 0) onOpen(index); }}>
            {children}
        </button>
    );
}

export default function MediaLightbox({ items = [], open, initialIndex = 0, onClose }) {
    const [active, setActive] = useState(initialIndex);
    const closeButton = useRef(null);
    const dialog = useRef(null);
    const opener = useRef(null);
    const touchStart = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        setActive(initialIndex);
        opener.current = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        const previousPadding = document.body.style.paddingRight;
        const scrollbar = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
        requestAnimationFrame(() => closeButton.current?.focus());
        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.paddingRight = previousPadding;
            opener.current?.focus?.();
        };
    }, [initialIndex, open]);

    useEffect(() => {
        if (!open) return undefined;
        const keydown = (event) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName) || event.target.isContentEditable) return;
            if (event.key === 'Escape') onClose();
            if (event.key === 'ArrowLeft') setActive((current) => (current - 1 + items.length) % items.length);
            if (event.key === 'ArrowRight') setActive((current) => (current + 1) % items.length);
            if (event.key === 'Tab') {
                const focusable = [...dialog.current.querySelectorAll('button, video, [tabindex]:not([tabindex="-1"])')].filter((element) => !element.disabled);
                if (!focusable.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
        };
        document.addEventListener('keydown', keydown);
        return () => document.removeEventListener('keydown', keydown);
    }, [items.length, onClose, open]);

    if (!open || !items.length || typeof document === 'undefined') return null;
    const item = items[active];
    const video = isVideoMedia(item);
    const caption = captionFor(item);
    const move = (direction) => setActive((current) => (current + direction + items.length) % items.length);

    return createPortal(
        <div ref={dialog} role="dialog" aria-modal="true" aria-label="Visualização ampliada da galeria" className="media-lightbox fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 p-3 text-white tablet:p-8" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX; }} onTouchEnd={(event) => { const end = event.changedTouches[0]?.clientX; if (touchStart.current != null && end != null && Math.abs(end - touchStart.current) > 55) move(end < touchStart.current ? 1 : -1); touchStart.current = null; }}>
            <button ref={closeButton} type="button" onClick={onClose} aria-label="Fechar galeria" className="absolute right-3 top-3 z-20 grid size-12 place-items-center rounded-full bg-black/65 text-3xl leading-none text-white transition hover:bg-brand tablet:right-6 tablet:top-6">&times;</button>
            {items.length > 1 && <button type="button" onClick={() => move(-1)} aria-label="Mídia anterior" className="absolute left-2 top-1/2 z-20 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-3xl text-white transition hover:bg-brand tablet:left-6">&#8249;</button>}
            <figure className="flex max-h-[94vh] max-w-[90vw] flex-col items-center justify-center" onMouseDown={(event) => event.stopPropagation()}>
                {video ? (
                    <video key={`${item.id || item.url}-${active}`} src={item.url} poster={item.poster_url || undefined} controls playsInline preload="metadata" className="max-h-[85vh] max-w-[90vw] object-contain" />
                ) : (
                    <img key={`${item.id || item.url}-${active}`} src={item.url} alt={item.alt_text || ''} className="max-h-[88vh] max-w-[90vw] object-contain" />
                )}
                {caption && <figcaption className="mt-3 max-w-3xl text-center text-sm text-white/75">{caption}</figcaption>}
            </figure>
            {items.length > 1 && <button type="button" onClick={() => move(1)} aria-label="Próxima mídia" className="absolute right-2 top-1/2 z-20 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-3xl text-white transition hover:bg-brand tablet:right-6">&#8250;</button>}
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white/80 tablet:bottom-5">{active + 1} / {items.length}</span>
        </div>,
        document.body,
    );
}
