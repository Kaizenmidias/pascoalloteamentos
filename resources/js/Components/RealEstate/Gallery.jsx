import { useEffect, useState } from 'react';
import MediaLightbox, { MediaLightboxTrigger, MediaTile } from './MediaLightbox';

function Media({ item, thumbnail = false }) {
    const video = item?.type === 'video' || item?.mime_type?.startsWith('video/');
    if (video) return <video src={item.url} poster={item.poster_url || undefined} controls={!thumbnail} muted={thumbnail} playsInline preload="metadata" className={thumbnail ? 'h-20 w-28 object-cover' : 'aspect-video w-full object-cover'} />;
    return <img src={item?.url} alt={item?.alt_text || ''} className={thumbnail ? 'h-20 w-28 object-cover' : 'aspect-video w-full object-cover'} />;
}

export default function Gallery({ items = [] }) {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const [lightbox, setLightbox] = useState(null);
    const move = (direction) => setActive((current) => (current + direction + items.length) % items.length);

    useEffect(() => {
        if (items.length < 2 || paused || lightbox !== null || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
        const timer = window.setInterval(() => move(1), 5000);
        return () => window.clearInterval(timer);
    }, [items.length, lightbox, paused]);

    if (!items.length) return null;

    return <section aria-label="Galeria" className="group" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)} onPlayCapture={() => setPaused(true)} onPauseCapture={() => setPaused(false)}>
        <div className="relative overflow-hidden rounded-card bg-surface">
            <MediaLightboxTrigger index={active} onOpen={setLightbox} className="aspect-video w-full" label={`Ampliar mídia ${active + 1}`}><MediaTile item={items[active]} /></MediaLightboxTrigger>
            {items.length > 1 && <><button type="button" onClick={() => move(-1)} aria-label="Midia anterior" className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-[7px] bg-brand text-xl text-white shadow-card">&#8592;</button><button type="button" onClick={() => move(1)} aria-label="Proxima midia" className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-[7px] bg-brand text-xl text-white shadow-card">&#8594;</button><span className="absolute bottom-4 right-4 rounded-full bg-black/55 px-3 py-1 text-xs text-white">{active + 1} / {items.length}</span></>}
        </div>
        {items.length > 1 && <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2">{items.map((item, index) => <button type="button" key={item.id || index} onClick={() => setActive(index)} aria-label={`Exibir midia ${index + 1}`} className={`shrink-0 overflow-hidden rounded-[9px] border-2 ${index === active ? 'border-brand' : 'border-transparent opacity-75'}`}><Media item={item} thumbnail /></button>)}</div>}
        <MediaLightbox items={items} open={lightbox !== null} initialIndex={lightbox || 0} onClose={() => setLightbox(null)} />
    </section>;
}
