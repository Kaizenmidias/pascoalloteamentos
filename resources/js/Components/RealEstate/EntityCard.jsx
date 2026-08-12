import { Link } from '@inertiajs/react';
import ResponsiveImage from './ResponsiveImage';

export default function EntityCard({ item, href, compact = false }) {
    const image = item.media_assets?.find((media) => media.pivot?.is_featured) || item.media_assets?.[0];
    const type = item.property_type?.name || item.condominium_type?.name || item.subdivision_type?.name;
    const status = item.development_status?.name;
    const city = item.city?.name;

    return (
        <article className="group min-w-0 overflow-hidden rounded-card border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-card">
            <Link href={href} className="block">
                <div className={`relative overflow-hidden bg-surface ${compact ? 'aspect-[4/3]' : 'aspect-[.94]'}`}>
                    <ResponsiveImage src={image?.url} alt={image?.alt_text || item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                    <div className="absolute left-3 top-3 flex flex-wrap gap-1 text-[.625rem] font-medium uppercase">
                        {type && <span className="rounded-full bg-brand px-2 py-1 text-white">{type}</span>}
                        {city && <span className="rounded-full bg-white px-2 py-1 text-ink">{city}</span>}
                        {status && <span className="rounded-full bg-white px-2 py-1 text-ink">{status}</span>}
                    </div>
                    {item.construction_progress != null && <div className="absolute inset-x-0 top-0 h-1 bg-brand" />}
                </div>
                <div className="p-5">
                    <h2 className="text-base font-medium uppercase leading-[1.3] text-ink">{item.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm font-light leading-6 text-muted">{item.excerpt || [item.neighborhood, city, item.city?.state?.code].filter(Boolean).join(' · ')}</p>
                </div>
            </Link>
        </article>
    );
}
