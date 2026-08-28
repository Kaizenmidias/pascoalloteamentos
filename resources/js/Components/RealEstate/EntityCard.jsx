import { Link } from '@inertiajs/react';
import OverallProgressBar from './OverallProgressBar';
import ResponsiveImage from './ResponsiveImage';

export default function EntityCard({ item, href, hideType = false }) {
    const image = item.media_assets?.find((media) => media.pivot?.is_featured) || item.media_assets?.[0];
    const type = item.property_type?.name || item.condominium_type?.name || item.subdivision_type?.name;
    const status = item.development_status?.name;
    const city = item.city?.name;
    const showProgress = item.category !== 'properties' && item.overall_progress !== null && item.overall_progress !== undefined;
    const summary = item.card_summary || [item.neighborhood, city, item.city?.state?.code].filter(Boolean).join(' · ');

    return (
        <article className="group min-w-0 overflow-hidden rounded-[18px] border border-line bg-white shadow-[0_4px_12px_rgba(17,17,17,0.05)] transition-[box-shadow,border-color] duration-300 hover:border-[#d9d9d9] hover:shadow-[0_6px_16px_rgba(17,17,17,0.07)]">
            <Link href={href} className="block">
                {showProgress && <OverallProgressBar value={item.overall_progress} completionDate={item.expected_delivery_date} compact />}
                <div className="relative aspect-[1.12] overflow-hidden bg-surface">
                    <ResponsiveImage src={image?.url} alt={image?.alt_text || item.title} className="h-full w-full object-cover" />
                    <div className="absolute left-3 top-3 flex flex-wrap gap-1 text-[.625rem] font-medium uppercase">
                        {!hideType && type && <span className="rounded-[6px] bg-brand px-2.5 py-1 text-white">{type}</span>}
                        {city && <span className="rounded-[6px] bg-white/95 px-2.5 py-1 text-ink">{city}</span>}
                        {status && <span className="rounded-[6px] bg-white/95 px-2.5 py-1 text-ink">{status}</span>}
                    </div>
                </div>
                <div className="p-5 tablet:p-6">
                    <h2 className="text-[1.15rem] font-semibold leading-[1.28] text-ink desktop:text-[1.3rem]">{item.title}</h2>
                    <p className="mt-3 line-clamp-2 min-h-12 text-sm font-light leading-6 text-muted">{summary}</p>
                    <span className="mt-6 inline-block text-xs font-medium uppercase tracking-[.06em] text-brand">Ver detalhes</span>
                </div>
            </Link>
        </article>
    );
}
