import { useEffect, useState } from 'react';
import Carousel from '../UI/Carousel';
import MediaLightbox, { MediaLightboxTrigger, MediaTile } from './MediaLightbox';

const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0));
const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const formatMonth = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return monthFormatter.format(date).replace('.', '').replace(' de ', '/').replace(/^./, (letter) => letter.toUpperCase());
};

function CircularStage({ item }) {
    const percentage = clamp(item.progress_percent);
    const status = percentage === 100 ? 'Concluído' : percentage > 0 ? 'Em andamento' : 'Não iniciado';
    return <article className="w-28 shrink-0 text-center">
        <div className="mx-auto grid size-24 place-items-center rounded-full" style={{ background: `conic-gradient(var(--color-brand, #8f1d2c) ${percentage * 3.6}deg, #eadfe1 0deg)` }}><div className="grid size-[4.9rem] place-items-center rounded-full bg-white"><strong className="text-lg font-medium text-brand">{Math.round(percentage)}%</strong></div></div>
        <h3 className="mt-3 text-xs font-medium leading-4 text-ink">{item.name}</h3>
        <span className="mt-1 block text-[.6rem] uppercase text-muted">{status}</span>
    </article>;
}

function MediaCard({ asset, index, onOpen }) {
    return <MediaLightboxTrigger key={asset.id} index={index} onOpen={onOpen} className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface" label={`Ampliar mídia ${index + 1}`}>
        <MediaTile item={asset} />
    </MediaLightboxTrigger>;
}

export default function ConstructionProgress({ items = [], updates = [] }) {
    const sourceItems = Array.isArray(items) ? items : [];
    const publicItems = sourceItems.filter((item) => item.is_public !== false);
    const legacyUpdates = sourceItems
        .filter((item) => item.media_assets?.length && (item.reference_date || item.updated_at))
        .map((item) => ({
            id: `stage-${item.id}`,
            progress_date: item.reference_date || item.updated_at,
            media_assets: item.media_assets,
        }));
    const visibleUpdates = [...(updates.length ? updates : legacyUpdates)]
        .filter((update) => update.media_assets?.length && update.progress_date)
        .sort((left, right) => String(right.progress_date).localeCompare(String(left.progress_date)));
    const [activeId, setActiveId] = useState(visibleUpdates[0]?.id || null);
    const [lightbox, setLightbox] = useState(null);
    useEffect(() => { setActiveId(visibleUpdates[0]?.id || null); }, [visibleUpdates.length, visibleUpdates[0]?.id]);
    if (!publicItems.length && !visibleUpdates.length) return null;

    const overall = publicItems.length ? Math.round(publicItems.reduce((total, item) => total + clamp(item.progress_percent), 0) / publicItems.length) : null;
    const activeUpdate = visibleUpdates.find((update) => String(update.id) === String(activeId)) || visibleUpdates[0];
    const activeMedia = activeUpdate?.media_assets || [];

    return (
        <div className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(17,17,17,.06)] tablet:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div><p className="text-xs font-medium uppercase tracking-[.08em] text-brand">Construção</p><h2 className="mt-2 text-[2rem] font-light leading-none text-ink tablet:text-[2.6rem]">Andamento da Obra</h2></div>
                {overall !== null && <p className="text-sm text-muted">Andamento geral da obra: <strong className="text-xl font-medium text-brand">{overall}%</strong></p>}
            </div>
            {publicItems.length > 0 && <div className="mt-9 flex gap-5 overflow-x-auto pb-4 [scrollbar-width:thin]">{publicItems.map((item) => <CircularStage key={item.id || item.name} item={item} />)}</div>}
            {visibleUpdates.length > 0 && <div className="mt-9 border-t border-line pt-7">
                <div className="text-center"><p className="text-xs font-medium uppercase tracking-[.08em] text-brand">Selecionar o período</p></div>
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2" role="tablist" aria-label="Atualizações da obra">{visibleUpdates.map((update) => { const active = String(update.id) === String(activeUpdate?.id); const monthLabel = formatMonth(update.progress_date) || 'Atualização'; return <button key={update.id} type="button" role="tab" aria-selected={active} onClick={() => { setActiveId(update.id); setLightbox(null); }} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${active ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-muted hover:border-brand hover:text-ink'}`}>{monthLabel}</button>; })}</div>
                <Carousel key={activeUpdate?.id || 'progress'} label={`Fotos do andamento de ${formatMonth(activeUpdate?.progress_date) || 'obra'}`} className="mt-6" itemClassName="w-[88%] tablet:w-[calc((100%-1.25rem)/2)] desktop:w-[calc((100%-2.5rem)/3)]" paused={lightbox !== null} autoPlay={false}>{activeMedia.map((asset, index) => <MediaCard key={asset.id} asset={asset} index={index} onOpen={setLightbox} />)}</Carousel>
                <MediaLightbox items={activeMedia} open={lightbox !== null} initialIndex={lightbox || 0} onClose={() => setLightbox(null)} />
            </div>}
        </div>
    );
}
