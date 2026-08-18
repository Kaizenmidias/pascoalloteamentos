import { Link } from '@inertiajs/react';
import OverallProgressBar from './OverallProgressBar';
import ResponsiveImage from './ResponsiveImage';

export default function EntityCard({ item, href }) {
    const image = item.media_assets?.find((media) => media.pivot?.is_featured) || item.media_assets?.[0];
    const type = item.property_type?.name || item.condominium_type?.name || item.subdivision_type?.name;
    const status = item.development_status?.name;
    const city = item.city?.name;
    const showProgress = item.category !== 'properties' && item.overall_progress !== null && item.overall_progress !== undefined;

    return (
        <article className="group min-w-0 overflow-hidden rounded-[18px] border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-card">
            <Link href={href} className="block">
                {showProgress && <OverallProgressBar value={item.overall_progress} compact />}
                <div className="relative aspect-[1.08] overflow-hidden bg-surface">
                    <ResponsiveImage src={image?.url} alt={image?.alt_text || item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                    <div className="absolute left-3 top-3 flex flex-wrap gap-1 text-[.625rem] font-medium uppercase">
                        {type && <span className="rounded-[6px] bg-brand px-2.5 py-1 text-white">{type}</span>}
                        {city && <span className="rounded-[6px] bg-white/95 px-2.5 py-1 text-ink">{city}</span>}
                        {status && <span className="rounded-[6px] bg-white/95 px-2.5 py-1 text-ink">{status}</span>}
                    </div>
                </div>
                <div className="p-4 tablet:p-[1.125rem]">
                    <h2 className="text-[1.05rem] font-semibold leading-[1.25] text-ink">{item.title}</h2>
                    <p className="mt-2 line-clamp-2 min-h-10 text-sm font-light leading-5 text-muted">{item.excerpt || [item.neighborhood, city, item.city?.state?.code].filter(Boolean).join(' · ')}</p>
                    <span className="mt-5 inline-block text-xs font-medium uppercase tracking-[.06em] text-brand">Ver detalhes</span>
                </div>
            </Link>
        </article>
    );
}
