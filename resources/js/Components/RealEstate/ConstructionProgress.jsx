import { useEffect, useRef, useState } from 'react';
import MediaLightbox, { MediaLightboxTrigger, MediaTile } from './MediaLightbox';

const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0));
const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const mediaKey = (asset, fallback) => asset?.id != null ? `id:${asset.id}` : asset?.url ? `url:${asset.url}` : fallback;

function periodDetails(value) {
    const match = String(value || '').match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (year < 1 || month < 1 || month > 12) return null;
    return { value: `${match[1]}-${match[2]}`, label: `${monthLabels[month - 1]}/${match[1]}` };
}

function uniqueMedia(items = []) {
    const seen = new Set();
    return (Array.isArray(items) ? items : []).filter((asset, index) => {
        if (!asset) return false;
        const key = mediaKey(asset, `anonymous:${index}`);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export function prepareProgressMedia(updates = [], stages = []) {
    const invalidUpdateMedia = [];
    const rawPeriods = (Array.isArray(updates) ? updates : []).reduce((result, update, index) => {
        const media = uniqueMedia(update?.media_assets);
        const period = periodDetails(update?.progress_date);
        if (!period) {
            invalidUpdateMedia.push(...media);
            return result;
        }
        if (!media.length) return result;
        result.push({
            id: update?.id ?? `${period.value}-${index}`,
            period: period.value,
            label: period.label,
            media,
        });
        return result;
    }, []);
    const periodsByDate = new Map();
    rawPeriods.forEach((period) => {
        const existing = periodsByDate.get(period.period);
        periodsByDate.set(period.period, existing ? { ...existing, media: uniqueMedia([...existing.media, ...period.media]) } : period);
    });
    const periods = [...periodsByDate.values()].sort((left, right) => right.period.localeCompare(left.period));

    const legacyMedia = uniqueMedia([
        ...invalidUpdateMedia,
        ...(Array.isArray(stages) ? stages : []).flatMap((stage) => Array.isArray(stage?.media_assets) ? stage.media_assets : []),
    ]);

    return { periods, legacyMedia };
}

function CircularStage({ item }) {
    const percentage = clamp(item?.progress_percent);
    const status = percentage === 100 ? 'Concluído' : percentage > 0 ? 'Em andamento' : 'Não iniciado';
    return <article className="w-28 shrink-0 text-center">
        <div className="mx-auto grid size-24 place-items-center rounded-full" style={{ background: `conic-gradient(var(--color-brand, #8f1d2c) ${percentage * 3.6}deg, #eadfe1 0deg)` }}><div className="grid size-[4.9rem] place-items-center rounded-full bg-white"><strong className="text-lg font-medium text-brand">{Math.round(percentage)}%</strong></div></div>
        <h3 className="mt-3 text-xs font-medium leading-4 text-ink">{item?.name || 'Etapa da obra'}</h3>
        <span className="mt-1 block text-[.6rem] uppercase text-muted">{status}</span>
    </article>;
}

function PeriodSelector({ periods, activeId, onSelect }) {
    const track = useRef(null);
    const move = (direction) => track.current?.scrollBy({ left: direction * Math.max(220, track.current.clientWidth * 0.7), behavior: 'smooth' });

    return <div className="mt-9 border-t border-line pt-7">
        <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-medium uppercase tracking-[.08em] text-brand">Selecionar o período</p>
            {periods.length > 3 && <div className="flex shrink-0 gap-2"><button type="button" onClick={() => move(-1)} aria-label="Períodos anteriores" className="grid size-9 place-items-center rounded-lg bg-brand text-xl text-white">&#8249;</button><button type="button" onClick={() => move(1)} aria-label="Próximos períodos" className="grid size-9 place-items-center rounded-lg bg-brand text-xl text-white">&#8250;</button></div>}
        </div>
        <div ref={track} className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]" role="tablist" aria-label="Períodos do andamento da obra">
            {periods.map((period) => {
                const active = String(period.id) === String(activeId);
                return <button key={period.id} type="button" role="tab" aria-selected={active} onClick={() => onSelect(period.id)} className={`shrink-0 snap-start rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${active ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-muted hover:border-brand hover:text-ink'}`}>{period.label}</button>;
            })}
        </div>
    </div>;
}

function ProgressMediaGallery({ items, setLightbox }) {
    const [active, setActive] = useState(0);
    const media = Array.isArray(items) ? items : [];

    if (!media.length) return null;
    const activeIndex = Math.min(active, media.length - 1);
    const current = media[activeIndex];
    const move = (direction) => setActive((index) => (index + direction + media.length) % media.length);

    return <div className="mt-6">
        <div className="relative overflow-hidden rounded-2xl bg-ink">
            {media.length > 1 && <button type="button" onClick={() => move(-1)} aria-label="Mídia anterior" className="absolute left-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-2xl text-white transition hover:bg-brand tablet:left-5">&#8249;</button>}
            {media.length > 1 && <button type="button" onClick={() => move(1)} aria-label="Próxima mídia" className="absolute right-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-2xl text-white transition hover:bg-brand tablet:right-5">&#8250;</button>}
            <MediaLightboxTrigger index={activeIndex} onOpen={setLightbox} className="block" label={`Ampliar mídia ${activeIndex + 1}`}>
                <div className="aspect-[16/10] w-full bg-ink tablet:aspect-[16/9]"><MediaTile item={current} /></div>
            </MediaLightboxTrigger>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white/90">{activeIndex + 1} / {media.length}</span>
        </div>
        {media.length > 1 && <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">{media.map((asset, index) => <button key={mediaKey(asset, index)} type="button" onClick={() => setActive(index)} aria-label={`Exibir mídia ${index + 1}`} className={`shrink-0 overflow-hidden rounded-lg border-2 ${index === activeIndex ? 'border-brand' : 'border-transparent opacity-75'}`}><div className="h-20 w-28"><MediaTile item={asset} /></div></button>)}</div>}
    </div>;
}

export default function ConstructionProgress({ items = [], updates = [] }) {
    const sourceItems = Array.isArray(items) ? items.filter(Boolean) : [];
    const publicItems = sourceItems.filter((item) => item?.is_public !== false);
    const { periods, legacyMedia } = prepareProgressMedia(updates, sourceItems);
    const [activeId, setActiveId] = useState(periods[0]?.id ?? null);
    const [lightbox, setLightbox] = useState(null);

    useEffect(() => {
        setActiveId((current) => periods.some((period) => String(period.id) === String(current)) ? current : (periods[0]?.id ?? null));
        setLightbox(null);
    }, [periods.length, periods[0]?.id]);

    if (!publicItems.length && !periods.length && !legacyMedia.length) return null;

    const overall = publicItems.length ? Math.round(publicItems.reduce((total, item) => total + clamp(item?.progress_percent), 0) / publicItems.length) : null;
    const activePeriod = periods.find((period) => String(period.id) === String(activeId)) || periods[0] || null;
    const activeMedia = activePeriod?.media || (periods.length ? [] : legacyMedia);

    return <div className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(17,17,17,.06)] tablet:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-medium uppercase tracking-[.08em] text-brand">Construção</p><h2 className="mt-2 text-[2rem] font-light leading-none text-ink tablet:text-[2.6rem]">Andamento da Obra</h2></div>
            {overall !== null && <p className="text-sm text-muted">Andamento geral da obra: <strong className="text-xl font-medium text-brand">{overall}%</strong></p>}
        </div>
        {publicItems.length > 0 && <div className="mt-9 flex gap-5 overflow-x-auto pb-4 [scrollbar-width:thin]">{publicItems.map((item, index) => <CircularStage key={item.id || item.code || item.name || index} item={item} />)}</div>}
        {periods.length > 0 && <PeriodSelector periods={periods} activeId={activePeriod?.id} onSelect={(id) => { setActiveId(id); setLightbox(null); }} />}
        {activeMedia.length > 0 && <ProgressMediaGallery key={activePeriod?.id || 'legacy'} items={activeMedia} setLightbox={setLightbox} />}
        <MediaLightbox items={activeMedia} open={lightbox !== null} initialIndex={lightbox || 0} onClose={() => setLightbox(null)} />
    </div>;
}
