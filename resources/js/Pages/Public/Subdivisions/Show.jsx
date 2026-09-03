import { useState } from 'react';
import PublicLayout from '../../../Components/Layout/PublicLayout';
import Container from '../../../Components/UI/Container';
import Carousel from '../../../Components/UI/Carousel';
import SeoHead from '../../../Components/SEO/SeoHead';
import ConstructionProgress from '../../../Components/RealEstate/ConstructionProgress';
import Map from '../../../Components/RealEstate/Map';
import { featuredMedia, galleryMedia } from '../../../Components/RealEstate/DetailSections';
import MediaLightbox, { MediaLightboxTrigger } from '../../../Components/RealEstate/MediaLightbox';
import VisualSection from '../../../Components/RealEstate/VisualSection';
import { whatsappUrl } from '../../../Support/whatsapp';
import LeadForm from '../../../Components/RealEstate/LeadForm';
import PublicMediaGallery from '../../../Components/RealEstate/PublicMediaGallery';
import FeatureIcon from '../../../Components/RealEstate/FeatureIcon';

const SectionContainer = ({ children, className = '' }) => <Container className={`max-w-[1280px] ${className}`}>{children}</Container>;
const Eyebrow = ({ children, className = '' }) => <p className={`text-sm font-light uppercase tracking-[.03em] text-brand ${className}`}>{children}</p>;
const Title = ({ children, className = '' }) => <h2 className={`mt-3 text-[2rem] font-light leading-[1.08] tracking-[-.025em] text-ink tablet:text-[2.7rem] desktop:text-[3.15rem] ${className}`}>{children}</h2>;
const hasValue = (value) => value !== null && value !== undefined && value !== '';
const quickLinkIcons = {
    sobre: 'M4 20V8l8-4 8 4v12M9 20v-6h6v6',
    diferenciais: 'm12 3 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4L7.5 16l.9-5L4.8 8.2l5-.7L12 3Z',
    galeria: 'M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6',
    plantas: 'M4 4h16v16H4zM8 4v16M4 10h16',
    visual: 'M9.5 9a2.7 2.7 0 1 1 4.2 2.2c-1 .7-1.7 1.1-1.7 2.3M12 18h.01M4 4h16v16H4z',
    localizacao: 'M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    andamento: 'M4 19V9m5 10V5m5 14v-7m5 7V3',
    'lotes-info': 'M9.5 9a2.7 2.7 0 1 1 4.2 2.2c-1 .7-1.7 1.1-1.7 2.3M12 18h.01M4 4h16v16H4z',
};

function QuickLinkIcon({ id }) {
    const path = quickLinkIcons[id];

    if (!path) return null;

    return <svg viewBox="0 0 24 24" aria-hidden="true" className="mx-auto mb-2 size-6 fill-none stroke-brand stroke-[1.35]" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>;
}

function WhatsAppButton({ item, className = '' }) {
    return <a href={whatsappUrl({ type: 'subdivision', title: item.title })} target="_blank" rel="noreferrer" className={`brand-button ${className}`}>Falar no WhatsApp</a>;
}

function Hero({ item, image, globalWhatsapp }) {
    const facts = [
        ['Total de lotes', item.total_lots, 'M4 6h9M4 12h9M4 18h9M17 5h3v6h-3m0 8h3m-3-3h3'],
        ['Lotes disponÃ­veis', item.available_lots, 'm4 6 2 2 4-5M4 13l2 2 4-5m3-4h7m-7 7h7m-7 7h7'],
        ['Ãrea mÃ­nima', item.minimum_lot_area && Number(item.minimum_lot_area).toLocaleString('pt-BR'), 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 4 4M3 8V3h5M14 3h5v5'],
        ['Ãrea mÃ¡xima', item.maximum_lot_area && Number(item.maximum_lot_area).toLocaleString('pt-BR'), 'M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm4 10 6 6m-10-9V7m-2 2h4M2 8V3h5'],
    ].filter(([, value]) => hasValue(value));

    return <>
        <section className="relative flex min-h-[650px] items-center overflow-hidden bg-ink pb-24 pt-32 text-white tablet:min-h-[720px]">
            {image && <img src={image.url} alt={image.alt_text || item.title} className="absolute inset-0 h-full w-full object-cover" />}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.76)_0%,rgba(0,0,0,.58)_45%,rgba(0,0,0,.28)_100%)]" />
            <SectionContainer className="relative z-10 w-full">
                <div className="max-w-[650px]">
                    <div className="mb-5 flex flex-wrap gap-1 text-[.65rem] font-medium uppercase">
                        <span className="rounded-sm bg-brand px-3 py-1.5">{item.city?.name || 'Loteamento'}</span>
                        {item.development_status?.name && <span className="rounded-sm bg-white px-3 py-1.5 text-ink">{item.development_status.name}</span>}
                    </div>
                    <h1 className="text-[2.7rem] font-light leading-[.98] tracking-[-.035em] tablet:text-[3.8rem] desktop:text-[4.35rem]">{item.title}</h1>
                    {item.card_summary && <p className="mt-6 max-w-[630px] whitespace-pre-line text-base font-light leading-[1.65] text-white/90 tablet:text-lg">{item.card_summary}</p>}
                    <WhatsAppButton item={item} className="mt-7" />
                </div>
            </SectionContainer>
        </section>
    </>;
}

function LotFacts({ item }) {
    const facts = [
        ['Total de lotes', item.total_lots, 'M4 6h9M4 12h9M4 18h9M17 5h3v6h-3m0 8h3m-3-3h3'],
        ['Lotes disponíveis', item.available_lots, 'm4 6 2 2 4-5M4 13l2 2 4-5m3-4h7m-7 7h7m-7 7h7'],
        ['Área mínima', item.minimum_lot_area && Number(item.minimum_lot_area).toLocaleString('pt-BR'), 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0-14Zm5 12 4 4M3 8V3h5M14 3h5v5'],
        ['Área máxima', item.maximum_lot_area && Number(item.maximum_lot_area).toLocaleString('pt-BR'), 'M10 4a6 6 0 1 0 0 12 6 6 0 0 0-12Zm4 10 6 6m-10-9V7m-2 2h4M2 8V3h5'],
    ].filter(([, value]) => hasValue(value));
    if (!facts.length) return null;
    return <SectionContainer className="mt-8"><div className="grid gap-[10px] rounded-xl bg-white p-3 shadow-[0_12px_32px_rgba(17,17,17,.1)] tablet:grid-cols-2 desktop:grid-cols-4">{facts.map(([label, value, path]) => <article key={label} className="flex min-h-24 items-center gap-4 rounded-lg border border-line px-5 py-4"><svg viewBox="0 0 24 24" className="size-8 shrink-0 fill-none stroke-brand stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg><div><span className="block text-[.65rem] uppercase text-muted">{label}</span><strong className="mt-1 block text-lg font-medium text-brand">{value}</strong></div></article>)}</div></SectionContainer>;
}
function About({ item, image }) {
    if (!item.about_title && !item.about_text) return null;
    return <section id="sobre" className="scroll-mt-28 py-14 tablet:py-[72px]"><SectionContainer className="grid gap-10 tablet:grid-cols-[.82fr_1.18fr] tablet:items-center"><div><Eyebrow>Sobre o empreendimento</Eyebrow><Title>{item.about_title}</Title>{item.about_text && <p className="mt-5 whitespace-pre-line text-base font-light leading-[1.72] text-muted">{item.about_text}</p>}</div>{image && <img src={image.url} alt={image.alt_text || item.about_title || item.title} className="aspect-[1.65/1] w-full rounded-xl object-cover" />}</SectionContainer></section>;
}

function Features({ items = [] }) {
    if (!items.length) return null;
    return <section id="diferenciais" className="bg-surface py-14 tablet:py-16"><SectionContainer><div className="text-center"><Eyebrow>Diferenciais</Eyebrow><Title>Tudo o que vocÃª precisa em um sÃ³ lugar</Title></div><div className="mt-8 grid grid-cols-2 gap-3 tablet:grid-cols-4 desktop:grid-cols-6">{items.map((feature) => <article key={feature.id} className="grid min-h-28 place-items-center rounded-xl bg-white p-4 text-center shadow-[0_5px_18px_rgba(17,17,17,.05)]"><div><FeatureIcon feature={feature} className="mx-auto mb-3 size-9" /><h3 className="text-xs font-normal leading-5 text-ink">{feature.name}</h3></div></article>)}</div></SectionContainer></section>;
}

function InternalMenu({ item, hasGallery, hasPlans, hasVisual, hasLocation, hasProgress, hasLotsInfo }) {
    const links = [
        ['sobre', 'Sobre', !!(item.about_title || item.about_text)],
        ['diferenciais', 'Diferenciais', Array.isArray(item.features) && item.features.length > 0],
        ['galeria', 'Fotos', hasGallery],
        ['plantas', 'Plantas', hasPlans],
        ['visual', 'Imagem', hasVisual],
        ['localizacao', 'LocalizaÃ§Ã£o', hasLocation],
        ['andamento', 'Andamento da obra', hasProgress],
        ['lotes-info', 'Lotes', hasLotsInfo],
    ].filter(([, , visible]) => visible);

    if (!links.length) return null;

    return <SectionContainer className="relative z-30 mt-8"><nav aria-label="SeÃ§Ãµes do loteamento" className="flex min-h-24 overflow-x-auto rounded-xl bg-white px-4 shadow-[0_10px_28px_rgba(0,0,0,.1)] [scrollbar-width:none]">{links.map(([id, label]) => <a key={id} href={`#${id}`} className="grid min-w-28 flex-1 place-items-center border-r border-line px-3 py-5 text-center text-[.62rem] font-normal text-muted transition hover:text-brand last:border-r-0"><span><QuickLinkIcon id={id} />{label}</span></a>)}</nav></SectionContainer>;
}

const money = (value) => value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) : null;

function PromotionCard({ promotion }) {
    return <article className="grid min-h-[330px] overflow-hidden rounded-xl border border-line bg-white tablet:grid-cols-[1fr_.9fr]"><div className="flex flex-col justify-center p-7 tablet:p-10"><Eyebrow>{promotion.product_name || 'Oportunidade'}</Eyebrow><h3 className="mt-3 text-[1.8rem] font-light leading-[1.08] tablet:text-[2.3rem]">{promotion.title}</h3>{promotion.text && <p className="mt-4 text-sm leading-6 text-muted">{promotion.text}</p>}<div className="mt-5">{promotion.original_price && <span className="block text-xs text-muted line-through">De {money(promotion.original_price)}</span>}<strong className="text-2xl font-medium text-brand">{money(promotion.promotional_price) || 'Consulte'}</strong></div><a href={whatsappUrl({ type: 'subdivision', title: promotion.product_name || promotion.title })} target="_blank" rel="noreferrer" className="brand-button mt-5 w-fit">{promotion.button_text || 'Tenho interesse'}</a></div>{promotion.media_asset && <img src={promotion.media_asset.url} alt={promotion.title} className="h-full min-h-64 w-full object-cover" />}</article>;
}

function Promotions({ items = [] }) {
    const visible = items.filter((item) => item.is_active !== false && item.title);
    if (!visible.length) return null;
    return <section className="py-14 tablet:py-16"><SectionContainer>{visible.length === 1 ? <PromotionCard promotion={visible[0]} /> : <Carousel label="PromoÃ§Ãµes de lotes" itemClassName="w-[94%] tablet:w-[86%]">{visible.map((promotion) => <PromotionCard key={promotion.id} promotion={promotion} />)}</Carousel>}</SectionContainer></section>;
}

function Gallery({ item }) {
    const media = galleryMedia(item);
    if (!media.length) return null;
    return <section id="galeria" className="scroll-mt-28 bg-surface py-14 tablet:py-16"><SectionContainer><PublicMediaGallery items={media} label="Fotos do loteamento" itemClassName="w-[88%] tablet:w-[calc((100%-1.25rem)/2)]" /></SectionContainer></section>;
}

function Plans({ item }) {
    const [lightbox, setLightbox] = useState(null);
    const plans = (item.floor_plans || []).filter((plan) => plan && plan.is_active !== false);
    const media = plans.map((plan) => plan.media_asset && ({ ...plan.media_asset, alt_text: plan.media_asset.alt_text || plan.name })).filter(Boolean);
    if (!plans.length) return null;
    let mediaIndex = -1;
    const header = <div className="w-full text-center"><Eyebrow>Plantas</Eyebrow><h2 className="mx-auto mt-3 text-[1.8rem] font-light leading-[1.08] tracking-[-.02em] text-ink tablet:text-[2.15rem] desktop:text-[2.35rem]">ConheÃ§a as plantas disponÃ­veis</h2></div>;
    return <section id="plantas" className="scroll-mt-28 py-14 tablet:py-[72px]"><SectionContainer><Carousel header={header} className="mt-1" label="Plantas disponÃ­veis" itemClassName="w-full tablet:w-[calc((100%-1.25rem)/2)]" paused={lightbox !== null} autoPlay={false} edgeControls>{plans.map((plan) => { if (plan.media_asset) mediaIndex += 1; return <article key={plan.id} className="overflow-hidden rounded-xl border border-line bg-white"><div className="p-4"><span className="rounded-sm bg-brand px-2 py-1 text-[.58rem] uppercase text-white">Planta</span><h3 className="mt-2 text-sm font-normal text-ink">{plan.name}</h3></div>{plan.media_asset && <MediaLightboxTrigger index={mediaIndex} onOpen={setLightbox} className="aspect-[1.22/1] w-full p-4" label={`Ampliar planta ${plan.name}`}><img src={plan.media_asset.url} alt={plan.name} className="h-full w-full object-contain" /></MediaLightboxTrigger>}<div className="grid grid-cols-2 gap-[10px] border-t border-line p-3 tablet:grid-cols-4">{[['Ãrea privativa', plan.area && `${Number(plan.area).toLocaleString('pt-BR')} mÂ²`], ['Quartos', plan.bedrooms], ['Banheiros', plan.bathrooms], ['Vagas', plan.parking_spaces]].filter(([, value]) => hasValue(value)).map(([label, value]) => <div key={label} className="rounded-lg border border-line p-3 text-center"><span className="block text-[.55rem] uppercase text-muted">{label}</span><strong className="mt-1 block text-xs font-normal text-ink">{value}</strong></div>)}</div></article>; })}</Carousel></SectionContainer><MediaLightbox items={media} open={lightbox !== null} initialIndex={lightbox || 0} onClose={() => setLightbox(null)} /></section>;
}

function Location({ item, globalWhatsapp }) {
    if (!item.address && !item.latitude && !item.longitude) return null;
    const address = [item.address, item.address_number, item.neighborhood, item.city?.name, item.city?.state?.code].filter(Boolean).join(', ');
    return <section id="localizacao" className="scroll-mt-28 bg-surface py-14 tablet:py-[72px]"><SectionContainer className="grid gap-10 tablet:grid-cols-[.82fr_1.18fr] tablet:items-center"><div><Eyebrow>LocalizaÃ§Ã£o</Eyebrow><Title>LocalizaÃ§Ã£o estratÃ©gica para facilitar seu dia a dia</Title>{address && <p className="mt-5 max-w-xl text-base leading-7 text-muted">{address}</p>}<WhatsAppButton item={item} className="mt-7" /></div><div className="min-h-[360px] overflow-hidden rounded-xl"><Map latitude={item.latitude} longitude={item.longitude} address={address} title={`LocalizaÃ§Ã£o de ${item.title}`} /></div></SectionContainer></section>;
}

function Progress({ item }) {
    const stages = item.construction_stages || item.constructionStages || [];
    const updates = item.construction_progress_updates || item.constructionProgressUpdates || [];
    if (!stages.length && !updates.length) return null;
    return <section id="andamento" className="scroll-mt-28 bg-surface py-14 tablet:py-16"><SectionContainer><ConstructionProgress items={stages} updates={updates} /></SectionContainer></section>;
}

function LotsInfoSection({ item }) {
    if (!item.lots_info_url) return null;
    return <section id="lotes-info" className="scroll-mt-28 bg-surface py-14 tablet:py-[72px]"><SectionContainer className="grid gap-8 rounded-xl border border-line bg-white p-6 shadow-[0_6px_22px_rgba(17,17,17,.05)] tablet:grid-cols-[1.15fr_.85fr] tablet:items-center tablet:p-8"><div><Eyebrow>InformaÃ§Ãµes dos lotes</Eyebrow><Title>ConheÃ§a as Plantas dos Lotes</Title><p className="mt-5 max-w-2xl text-base font-light leading-7 text-muted">FaÃ§a o download das plantas e tenha acesso aos detalhes do empreendimento, incluindo a divisÃ£o dos lotes, medidas e organizaÃ§Ã£o do projeto.</p></div><div className="rounded-2xl bg-ink p-6 text-white tablet:p-8"><p className="text-sm uppercase tracking-[.08em] text-white/70">Tudo o que vocÃª precisa em um sÃ³ lugar</p><a href={item.lots_info_url} target="_blank" rel="noopener noreferrer" className="brand-button mt-5 inline-flex w-full justify-center tablet:w-auto">BAIXAR INFORMAÃ‡Ã•ES DOS LOTES</a></div></SectionContainer></section>;
}

export default function Show({ item, globalWhatsapp }) {
    const image = featuredMedia(item);
    const gallery = galleryMedia(item);
    const hasPlans = (item.floor_plans || []).some((plan) => plan && plan.is_active !== false);
    const hasProgress = (item.construction_stages || []).some((stage) => stage?.is_public !== false) || (item.construction_progress_updates || item.constructionProgressUpdates || []).length > 0;
    const hasLocation = !!(item.address || item.latitude || item.longitude);
    const hasVisual = !!(item.about_media || item.promotion_media);
    const hasFacts = [item.total_lots, item.available_lots, item.minimum_lot_area, item.maximum_lot_area].some(hasValue);
    const promotions = (item.promotions || []).filter((promotion) => promotion.is_active !== false && promotion.title);

    return <PublicLayout><SeoHead title={item.seo?.title || item.title} description={item.seo?.description || item.card_summary} /><Hero item={item} image={image} globalWhatsapp={globalWhatsapp} /><About item={item} image={image} /><LotFacts item={item} /><InternalMenu item={item} hasGallery={gallery.length > 0} hasPlans={hasPlans} hasVisual={hasVisual} hasLocation={hasLocation} hasProgress={hasProgress} hasLotsInfo={!!item.lots_info_url} /><Features items={item.features || []} /><Promotions items={promotions} /><Gallery item={item} /><Plans item={item} /><VisualSection image={item.about_media || item.promotion_media} /><Location item={item} globalWhatsapp={globalWhatsapp} /><Progress item={item} /><LotsInfoSection item={item} /><section className="py-14 tablet:py-16"><SectionContainer className="max-w-2xl"><LeadForm entityType="subdivision" entityId={item.id} entityName={item.title} title="Tenho interesse neste loteamento" /></SectionContainer></section></PublicLayout>;
}


