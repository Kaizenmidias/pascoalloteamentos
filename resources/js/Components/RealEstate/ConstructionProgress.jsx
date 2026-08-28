import { useEffect, useState } from 'react';
import MediaLightbox, { MediaLightboxTrigger, MediaTile } from './MediaLightbox';

const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0));

function CircularStage({ item }) {
    const percentage = clamp(item.progress_percent);
    const status = percentage === 100 ? 'Concluído' : percentage > 0 ? 'Em andamento' : 'Não iniciado';
    return <article className="w-28 shrink-0 text-center">
        <div className="mx-auto grid size-24 place-items-center rounded-full" style={{ background: `conic-gradient(var(--color-brand, #8f1d2c) ${percentage * 3.6}deg, #eadfe1 0deg)` }}><div className="grid size-[4.9rem] place-items-center rounded-full bg-white"><strong className="text-lg font-medium text-brand">{Math.round(percentage)}%</strong></div></div>
        <h3 className="mt-3 text-xs font-medium leading-4 text-ink">{item.name}</h3>
        <span className="mt-1 block text-[.6rem] uppercase text-muted">{status}</span>
    </article>;
}

const dateValue = (value) => {
    const timestamp = Date.parse(value || '');
    return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
};
const sortByDateDesc = (left, right) => dateValue(right?.progress_date) - dateValue(left?.progress_date);
const mediaKey = (asset, fallback) => asset?.id != null ? `id:${asset.id}` : asset?.url ? `url:${asset.url}` : fallback;

export function combineProgressMedia(updates = [], stages = []) {
    const periods = Array.isArray(updates) ? [...updates].sort(sortByDateDesc) : [];
    const legacy = (Array.isArray(stages) ? stages : []).map((stage) => ({
        id: `stage-${stage?.id ?? stage?.code ?? stage?.name ?? 'legacy'}`,
        progress_date: stage?.reference_date || stage?.updated_at || '',
        media_assets: stage?.media_assets,
    }));
    const seen = new Set();

    return [...periods, ...legacy].flatMap((period) => Array.isArray(period?.media_assets) ? period.media_assets : [])
        .filter((asset, index) => {
            if (!asset) return false;
            const key = mediaKey(asset, `anonymous:${index}`);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
}

function ProgressMediaGallery({ items, setLightbox }) {
    const [active, setActive] = useState(0);
    const media = items || [];

    useEffect(() => { setActive(0); }, [media.length]);

    if (!media.length) return null;

    const activeIndex = Math.min(active, media.length - 1);
    const current = media[activeIndex];
    const move = (direction) => setActive((index) => (index + direction + media.length) % media.length);

    return <div className="mt-9">
        <div className="relative overflow-hidden rounded-2xl bg-ink">
            {media.length > 1 && <button type="button" onClick={() => move(-1)} aria-label="Mídia anterior" className="absolute left-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-2xl text-white transition hover:bg-brand tablet:left-5">&#8249;</button>}
            {media.length > 1 && <button type="button" onClick={() => move(1)} aria-label="Próxima mídia" className="absolute right-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-2xl text-white transition hover:bg-brand tablet:right-5">&#8250;</button>}
            <MediaLightboxTrigger index={activeIndex} onOpen={setLightbox} className="block" label={`Ampliar mídia ${activeIndex + 1}`}>
                <div className="aspect-[16/10] w-full bg-ink tablet:aspect-[16/9]">{current && <MediaTile item={current} />}</div>
            </MediaLightboxTrigger>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white/90">{activeIndex + 1} / {media.length}</span>
        </div>
        {media.length > 1 && <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">{media.map((asset, index) => <button key={mediaKey(asset, index)} type="button" onClick={() => setActive(index)} aria-label={`Exibir mídia ${index + 1}`} className={`shrink-0 overflow-hidden rounded-lg border-2 ${index === activeIndex ? 'border-brand' : 'border-transparent opacity-75'}`}><div className="h-20 w-28"><MediaTile item={asset} /></div></button>)}</div>}
    </div>;
}

export default function ConstructionProgress({ items = [], updates = [] }) {
    const sourceItems = Array.isArray(items) ? items : [];
    const publicItems = sourceItems.filter((item) => item.is_public !== false);
    const flattenedMedia = combineProgressMedia(updates, sourceItems);
    const [lightbox, setLightbox] = useState(null);
    if (!publicItems.length && !flattenedMedia.length) return null;

    const overall = publicItems.length ? Math.round(publicItems.reduce((total, item) => total + clamp(item.progress_percent), 0) / publicItems.length) : null;

    return (
        <div className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(17,17,17,.06)] tablet:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div><p className="text-xs font-medium uppercase tracking-[.08em] text-brand">Construção</p><h2 className="mt-2 text-[2rem] font-light leading-none text-ink tablet:text-[2.6rem]">Andamento da Obra</h2></div>
                {overall !== null && <p className="text-sm text-muted">Andamento geral da obra: <strong className="text-xl font-medium text-brand">{overall}%</strong></p>}
            </div>
            {publicItems.length > 0 && <div className="mt-9 flex gap-5 overflow-x-auto pb-4 [scrollbar-width:thin]">{publicItems.map((item) => <CircularStage key={item.id || item.name} item={item} />)}</div>}
            {flattenedMedia.length > 0 && <ProgressMediaGallery items={flattenedMedia} setLightbox={setLightbox} />}
            <MediaLightbox items={flattenedMedia} open={lightbox !== null} initialIndex={lightbox || 0} onClose={() => setLightbox(null)} />
        </div>
    );
}
