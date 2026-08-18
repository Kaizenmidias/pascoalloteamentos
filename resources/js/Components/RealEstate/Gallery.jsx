import { useState } from 'react';
import ResponsiveImage from './ResponsiveImage';

const isVideo = (item) => item?.type === 'video' || item?.mime_type?.startsWith('video/');
const embedUrl = (url = '') => {
    const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/i);
    if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;
    const vimeo = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
    return vimeo ? `https://player.vimeo.com/video/${vimeo[1]}` : null;
};

function Media({ item, thumbnail = false }) {
    if (isVideo(item) && thumbnail && item.poster_url) return <span className="relative block h-20 w-28 overflow-hidden rounded-[6px] bg-ink"><img src={item.poster_url} alt="" className="h-full w-full object-cover opacity-75" /><span className="absolute inset-0 grid place-items-center text-xs font-medium uppercase text-white">Video</span></span>;
    if (!isVideo(item)) return <ResponsiveImage src={item?.url} alt={item?.alt_text || ''} className={thumbnail ? 'h-20 w-28 rounded-[6px] object-cover' : 'aspect-[16/9] w-full object-cover'} />;
    if (thumbnail) return <span className="grid h-20 w-28 place-items-center rounded-[6px] bg-ink text-xs font-medium uppercase text-white">Vídeo</span>;
    const embed = item.mime_type === 'video/external' ? embedUrl(item.url) : null;
    return embed
        ? <iframe src={embed} title={item.caption || 'Vídeo'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="aspect-[16/9] w-full border-0" />
        : <video src={item.url} poster={item.poster_url || undefined} controls playsInline preload="metadata" className="aspect-[16/9] w-full bg-black object-contain" />;
}

export default function Gallery({ items = [] }) {
    const [active, setActive] = useState(0);
    if (!items.length) return null;
    const move = (direction) => setActive((current) => (current + direction + items.length) % items.length);
    return <section aria-label="Galeria" className="group"><div className="relative overflow-hidden rounded-card bg-surface"><Media item={items[active]} />{items.length > 1 && <><button type="button" onClick={() => move(-1)} aria-label="Mídia anterior" className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-[7px] bg-brand text-xl text-white shadow-card">&#8592;</button><button type="button" onClick={() => move(1)} aria-label="Próxima mídia" className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-[7px] bg-brand text-xl text-white shadow-card">&#8594;</button><span className="absolute bottom-4 right-4 rounded-full bg-black/55 px-3 py-1 text-xs text-white">{active + 1} / {items.length}</span></>}</div>{items.length > 1 && <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2">{items.map((item, index) => <button type="button" key={item.id || index} onClick={() => setActive(index)} aria-label={`Exibir mídia ${index + 1}`} className={`shrink-0 rounded-[9px] border-2 ${index === active ? 'border-brand' : 'border-transparent opacity-75'}`}><Media item={item} thumbnail /></button>)}</div>}</section>;
}
