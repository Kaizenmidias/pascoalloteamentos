import Container from '../UI/Container';
import Gallery from './Gallery';
import ConstructionProgress from './ConstructionProgress';
import Map from './Map';
import Carousel from '../UI/Carousel';

export const featuredMedia = (item) => item.media_assets?.find((asset) => asset.pivot?.is_featured) || item.media_assets?.[0];
export const galleryMedia = (item) => item.media_assets?.filter((asset) => !asset.pivot?.collection || asset.pivot.collection === 'gallery') || [];

export function WhatsAppCTA({ item, label = 'Falar no WhatsApp', className = '' }) {
    const number = String(item.whatsapp_contact || '5545999999999').replace(/\D/g, '');
    return <a href={`https://wa.me/${number}`} target="_blank" rel="noreferrer" className={`brand-button inline-flex justify-center ${className}`}>{label}</a>;
}

export function ProductHero({ item, eyebrow, facts = [] }) {
    const image = featuredMedia(item);
    return <section className="relative flex min-h-[680px] items-end overflow-hidden bg-ink pt-36 text-white">
        {image && <img src={image.url} alt={image.alt_text || item.title} className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
        <Container className="relative z-10 pb-16">
            <div className="max-w-3xl">
                <div className="mb-6 flex flex-wrap gap-2 text-xs font-medium uppercase"><span className="rounded-full bg-brand px-4 py-2">{item.city?.name || eyebrow}</span>{item.development_status?.name && <span className="rounded-full bg-white/90 px-4 py-2 text-ink">{item.development_status.name}</span>}</div>
                <p className="eyebrow text-white/75">{eyebrow}</p><h1 className="mt-3 text-[2.5rem] font-normal leading-[1.08] tablet:text-[3.75rem] desktop:text-[4.25rem]">{item.title}</h1>
                {item.excerpt && <p className="mt-6 max-w-2xl text-lg font-light leading-8 text-white/85">{item.excerpt}</p>}
                <WhatsAppCTA item={item} className="mt-8" />
            </div>
            {facts.filter(([, value]) => value !== null && value !== undefined && value !== '').length > 0 && <div className="mt-12 grid overflow-hidden rounded-card bg-white text-ink shadow-card tablet:grid-cols-2 desktop:grid-cols-4">{facts.filter(([, value]) => value !== null && value !== undefined && value !== '').map(([label, value]) => <div key={label} className="border-b border-line p-6 tablet:border-r"><span className="text-xs uppercase text-muted">{label}</span><strong className="mt-2 block text-xl font-normal text-brand">{value}</strong></div>)}</div>}
        </Container>
    </section>;
}

export function AboutSection({ item, label, useFeaturedImage = false }) {
    const image = useFeaturedImage ? featuredMedia(item) : (item.about_media || featuredMedia(item));
    if (!item.about_title && !item.about_text) return null;
    return <section id="sobre" className="py-[var(--section-space)]"><Container className="grid gap-10 desktop:grid-cols-2 desktop:items-center"><div><p className="eyebrow">{label}</p><h2 className="section-title mt-3">{item.about_title}</h2><p className="mt-6 whitespace-pre-line text-base font-light leading-8 text-muted">{item.about_text}</p></div>{image && <img src={image.url} alt={image.alt_text || item.about_title} className="aspect-[4/3] w-full rounded-card object-cover" />}</Container></section>;
}

export function DifferentialsGrid({ items = [] }) {
    if (!items.length) return null;
    return <section id="diferenciais" className="bg-surface py-[var(--section-space)]"><Container><p className="eyebrow">Diferenciais</p><h2 className="section-title mt-3">Projetado para superar expectativas</h2><div className="mt-10 grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">{items.map((item) => <article key={item.id} className="rounded-card bg-white p-6 shadow-card"><h3 className="text-lg font-medium text-ink">{item.icon && <span className="mr-2">{item.icon}</span>}{item.name}</h3>{item.description && <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>}</article>)}</div></Container></section>;
}

export function PromotionSection({ item, areaLabel = 'Área a partir de' }) {
    if (!item.promotion_headline && !item.promotion_price && !item.sale_price && !item.promotion_media) return null;
    const price = item.promotion_price || item.sale_price;
    return <section className="bg-brand py-[var(--section-space)] text-white"><Container className="grid gap-10 desktop:grid-cols-2 desktop:items-center"><div><p className="text-xs uppercase tracking-widest text-white/70">Oportunidade</p><h2 className="mt-3 text-4xl font-normal">{item.promotion_headline || item.title}</h2>{price && <p className="mt-6 text-3xl">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}</p>}{(item.minimum_unit_area || item.minimum_lot_area) && <p className="mt-2 text-white/75">{areaLabel}: {Number(item.minimum_unit_area || item.minimum_lot_area).toLocaleString('pt-BR')} m²</p>}{item.promotion_url && <a href={item.promotion_url} className="mt-8 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-medium uppercase text-brand">Quero saber mais</a>}</div>{item.promotion_media && <img src={item.promotion_media.url} alt="" className="aspect-[4/3] w-full rounded-card object-cover" />}</Container></section>;
}

export function ProductGallery({ item, title }) {
    const media = galleryMedia(item);
    if (!media.length) return null;
    return <section id="galeria" className="py-[var(--section-space)]"><Container><p className="eyebrow">Galeria</p><h2 className="section-title mt-3">{title}</h2><div className="mt-10"><Gallery items={media} /></div></Container></section>;
}

export function PlansSection({ item, title = 'Conheça as plantas disponíveis', carousel = false }) {
    const plans = (item.floor_plans || []).filter((plan) => plan.is_active !== false);
    if (!plans.length) return null;
    const cards = plans.map((plan) => <article key={plan.id} className="h-full overflow-hidden rounded-card bg-white shadow-card">{plan.media_asset && <img src={plan.media_asset.url} alt={plan.name} className="aspect-[4/3] w-full object-cover" />}<div className="p-5"><h3 className="text-lg font-medium">{plan.name}</h3><div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">{plan.area && <span>{Number(plan.area).toLocaleString('pt-BR')} m²</span>}{plan.bedrooms && <span>{plan.bedrooms} quartos</span>}{plan.bathrooms && <span>{plan.bathrooms} banheiros</span>}{plan.suites && <span>{plan.suites} suítes</span>}{plan.parking_spaces && <span>{plan.parking_spaces} vagas</span>}</div>{plan.external_url && <a href={plan.external_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-medium text-brand">Abrir planta</a>}</div></article>);
    return <section id="plantas" className="bg-surface py-[var(--section-space)]"><Container><p className="eyebrow">Plantas</p><h2 className="section-title mt-3">{item.floor_plans_title || title}</h2>{item.floor_plans_support_text && <p className="mt-5 max-w-3xl text-base leading-7 text-muted">{item.floor_plans_support_text}</p>}{carousel ? <Carousel className="mt-10" label="Plantas disponíveis">{cards}</Carousel> : <div className="mt-10 grid gap-6 tablet:grid-cols-2 desktop:grid-cols-3">{cards}</div>}</Container></section>;
}

export function DocumentsSection({ documents = [] }) {
    const visible = documents.filter((document) => document.is_public !== false && (document.external_url || document.media_asset?.url));
    if (!visible.length) return null;
    return <section className="py-[var(--section-space)]"><Container><p className="eyebrow">Documentos e plantas</p><h2 className="section-title mt-3">Materiais para download</h2><div className="mt-8 grid gap-3">{visible.map((document) => <a key={document.id} href={document.external_url || document.media_asset.url} target="_blank" rel="noreferrer" className="flex justify-between rounded-xl border border-line px-5 py-4 text-ink hover:border-brand"><span>{document.title}</span><span className="text-brand">Baixar</span></a>)}</div></Container></section>;
}

export function LocationSection({ item }) {
    if (!item.address && !item.latitude && !item.longitude) return null;
    return <section id="localizacao" className="bg-surface py-[var(--section-space)]"><Container className="grid gap-10 desktop:grid-cols-[.8fr_1.2fr] desktop:items-center"><div><p className="eyebrow">Localização</p><h2 className="section-title mt-3">Localização estratégica para facilitar seu dia a dia</h2><p className="mt-5 text-base leading-7 text-muted">{[item.address, item.address_number, item.neighborhood, item.city?.name, item.city?.state?.code].filter(Boolean).join(', ')}</p><WhatsAppCTA item={item} className="mt-7" /></div><div className="min-h-96 overflow-hidden rounded-card"><Map latitude={item.latitude} longitude={item.longitude} address={item.address} /></div></Container></section>;
}

export function ProgressSection({ item }) {
    if (!item.construction_stages?.length) return null;
    return <section id="andamento" className="py-[var(--section-space)]"><Container><p className="eyebrow">Andamento da obra</p><h2 className="section-title mt-3">Acompanhe nosso projeto em andamento</h2><div className="mt-10"><ConstructionProgress items={item.construction_stages} completionDate={item.expected_delivery_date} /></div></Container></section>;
}

export function FAQSection({ items = [] }) {
    const visible = items.filter((item) => item.is_active !== false);
    if (!visible.length) return null;
    return <section className="bg-surface py-[var(--section-space)]"><Container><p className="eyebrow">Perguntas frequentes</p><h2 className="section-title mt-3">Esclareça suas principais dúvidas</h2><div className="mt-10 grid gap-3">{visible.map((item) => <details key={item.id} className="group rounded-xl bg-white p-5 shadow-sm"><summary className="cursor-pointer list-none pr-8 font-medium text-ink">{item.question}</summary><p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">{item.answer}</p></details>)}</div></Container></section>;
}
