import { useState } from 'react';
import PublicLayout from '../../../Components/Layout/PublicLayout';
import SeoHead from '../../../Components/SEO/SeoHead';
import Container from '../../../Components/UI/Container';
import Carousel from '../../../Components/UI/Carousel';
import ConstructionProgress from '../../../Components/RealEstate/ConstructionProgress';
import FeatureIcon from '../../../Components/RealEstate/FeatureIcon';
import Map from '../../../Components/RealEstate/Map';
import { featuredMedia, galleryMedia } from '../../../Components/RealEstate/DetailSections';
import MediaLightbox, { MediaLightboxTrigger, MediaTile } from '../../../Components/RealEstate/MediaLightbox';
import { whatsappUrl } from '../../../Support/whatsapp';
import LeadForm from '../../../Components/RealEstate/LeadForm';


const SectionContainer = ({ children, className = '' }) => <Container className={`max-w-[1280px] ${className}`}>{children}</Container>;
const Eyebrow = ({ children, className = '' }) => <p className={`text-sm font-light uppercase tracking-[.03em] text-brand ${className}`}>{children}</p>;
const Title = ({ children, className = '' }) => <h2 className={`mt-3 text-[2rem] font-light leading-[1.08] tracking-[-.025em] text-ink tablet:text-[2.7rem] desktop:text-[3.15rem] ${className}`}>{children}</h2>;
function WhatsAppButton({ item, fallback, className = '' }) {
    return <a href={whatsappUrl({ type: 'subdivision', title: item.title })} target="_blank" rel="noreferrer" className={`brand-button ${className}`}>Falar no WhatsApp</a>;
}

function Hero({ item, image, globalWhatsapp }) {
    const facts = [
        ['Total de lotes', item.total_lots, 'M4 6h9M4 12h9M4 18h9M17 5h3v6h-3m0 8h3m-3-3h3'],
        ['Lotes dispon\u00edveis', item.available_lots, 'm4 6 2 2 4-5M4 13l2 2 4-5m3-4h7m-7 7h7m-7 7h7'],
        ['\u00c1rea m\u00ednima', item.minimum_lot_area && Number(item.minimum_lot_area).toLocaleString('pt-BR'), 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 4 4M3 8V3h5M14 3h5v5'],
        ['\u00c1rea m\u00e1xima', item.maximum_lot_area && Number(item.maximum_lot_area).toLocaleString('pt-BR'), 'M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm4 10 6 6m-10-9V7m-2 2h4M2 8V3h5'],
    ].filter(([, value]) => value !== null && value !== undefined && value !== '');

    return <><section className="relative flex min-h-[650px] items-center overflow-hidden bg-ink pb-24 pt-32 text-white tablet:min-h-[720px]">
        {image && <img src={image.url} alt={image.alt_text || item.title} className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.76)_0%,rgba(0,0,0,.58)_45%,rgba(0,0,0,.28)_100%)]" />
        <SectionContainer className="relative z-10 w-full"><div className="max-w-[650px]">
            <div className="mb-5 flex flex-wrap gap-1 text-[.65rem] font-medium uppercase"><span className="rounded-sm bg-brand px-3 py-1.5">{item.city?.name || 'Loteamento'}</span>{item.development_status?.name && <span className="rounded-sm bg-white px-3 py-1.5 text-ink">{item.development_status.name}</span>}</div>
            <h1 className="text-[2.7rem] font-light leading-[.98] tracking-[-.035em] tablet:text-[3.8rem] desktop:text-[4.35rem]">{item.title}</h1>
            {item.card_summary && <p className="mt-6 max-w-[630px] whitespace-pre-line text-base font-light leading-[1.65] text-white/90 tablet:text-lg">{item.card_summary}</p>}
            <WhatsAppButton item={item} fallback={globalWhatsapp} className="mt-7" />
        </div></SectionContainer>
    </section>{facts.length > 0 && <SectionContainer className="relative z-20 -mt-12"><div className="grid overflow-hidden rounded-xl bg-white p-3 shadow-[0_12px_32px_rgba(17,17,17,.1)] tablet:grid-cols-2 desktop:grid-cols-4">{facts.map(([label, value, path]) => <article key={label} className="flex min-h-24 items-center gap-4 rounded-lg border border-line px-5 py-4"><svg viewBox="0 0 24 24" className="size-8 shrink-0 fill-none stroke-brand stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg><div><span className="block text-[.65rem] uppercase text-muted">{label}</span><strong className="mt-1 block text-lg font-medium text-brand">{value}</strong></div></article>)}</div></SectionContainer>}</>;
}

function About({ item, image }) {
    if (!item.about_title && !item.about_text) return null;
    return <section className="py-14 tablet:py-[72px]"><SectionContainer className="grid gap-10 tablet:grid-cols-[.82fr_1.18fr] tablet:items-center"><div><Eyebrow>Loteamentos</Eyebrow><Title>{item.about_title}</Title>{item.about_text && <p className="mt-5 whitespace-pre-line text-base font-light leading-[1.72] text-muted">{item.about_text}</p>}</div>{image && <img src={image.url} alt={image.alt_text || item.about_title || item.title} className="aspect-[1.65/1] w-full rounded-xl object-cover" />}</SectionContainer></section>;
}

function Features({ items = [] }) {
    if (!items.length) return null;
    return <section className="bg-surface py-14 tablet:py-16"><SectionContainer><div className="text-center"><Eyebrow>Diferenciais</Eyebrow><Title>Tudo o que voc&ecirc; precisa em um s&oacute; lugar</Title></div><div className="mt-8 grid grid-cols-2 gap-3 tablet:grid-cols-4 desktop:grid-cols-6">{items.map((feature) => <article key={feature.id} className="grid min-h-28 place-items-center rounded-xl bg-white p-4 text-center shadow-[0_5px_18px_rgba(17,17,17,.05)]"><div><FeatureIcon feature={feature} className="mx-auto mb-3 size-9" /><h3 className="text-xs font-normal leading-5 text-ink">{feature.name}</h3></div></article>)}</div></SectionContainer></section>;
}

const money = (value) => value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) : null;
function PromotionCard({ promotion }) {
    return <article className="grid min-h-[330px] overflow-hidden rounded-xl border border-line bg-white tablet:grid-cols-[1fr_.9fr]"><div className="flex flex-col justify-center p-7 tablet:p-10"><Eyebrow>{promotion.product_name || 'Oportunidade'}</Eyebrow><h3 className="mt-3 text-[1.8rem] font-light leading-[1.08] tablet:text-[2.3rem]">{promotion.title}</h3>{promotion.text && <p className="mt-4 text-sm leading-6 text-muted">{promotion.text}</p>}<div className="mt-5">{promotion.original_price && <span className="block text-xs text-muted line-through">De {money(promotion.original_price)}</span>}<strong className="text-2xl font-medium text-brand">{money(promotion.promotional_price) || 'Consulte'}</strong></div><a href={whatsappUrl({ type: 'subdivision', title: promotion.product_name || promotion.title })} target="_blank" rel="noreferrer" className="brand-button mt-5 w-fit">{promotion.button_text || 'Tenho interesse'}</a></div>{promotion.media_asset && <img src={promotion.media_asset.url} alt={promotion.title} className="h-full min-h-64 w-full object-cover" />}</article>;
}
function Promotions({ items = [] }) {
    const visible = items.filter((item) => item.is_active !== false && item.title);
    if (!visible.length) return null;
    return <section className="py-14 tablet:py-16"><SectionContainer>{visible.length === 1 ? <PromotionCard promotion={visible[0]} /> : <Carousel label="Promo&ccedil;&otilde;es de lotes" itemClassName="w-[94%] tablet:w-[86%]">{visible.map((promotion) => <PromotionCard key={promotion.id} promotion={promotion} />)}</Carousel>}</SectionContainer></section>;
}

function Location({ item, globalWhatsapp }) {
    if (!item.address && !item.latitude && !item.longitude) return null;
    const address = [item.address, item.address_number, item.neighborhood, item.city?.name, item.city?.state?.code].filter(Boolean).join(', ');
    return <section className="bg-surface py-14 tablet:py-[72px]"><SectionContainer className="grid gap-10 tablet:grid-cols-[.82fr_1.18fr] tablet:items-center"><div><Eyebrow>Localiza&ccedil;&atilde;o</Eyebrow><Title>Localiza&ccedil;&atilde;o estrat&eacute;gica para facilitar seu dia a dia</Title>{address && <p className="mt-5 max-w-xl text-base leading-7 text-muted">{address}</p>}<WhatsAppButton item={item} fallback={globalWhatsapp} className="mt-7" /></div><div className="min-h-[360px] overflow-hidden rounded-xl"><Map latitude={item.latitude} longitude={item.longitude} address={address} title={`Localiza\u00e7\u00e3o de ${item.title}`} /></div></SectionContainer></section>;
}

function Progress({ item }) {
    if (!item.construction_stages?.length) return null;
    return <section className="py-14 tablet:py-[72px]"><SectionContainer><Eyebrow>Andamento da obra</Eyebrow><Title>Acompanhe nosso projeto em andamento</Title><div className="mt-8 rounded-xl border border-line bg-white p-6 shadow-[0_6px_22px_rgba(17,17,17,.05)] tablet:p-8"><ConstructionProgress items={item.construction_stages} completionDate={item.expected_delivery_date} /></div></SectionContainer></section>;
}

function Gallery({ item }) {
    const [lightbox, setLightbox] = useState(null);
    const media = galleryMedia(item);
    if (!media.length) return null;
    return <section className="py-14 tablet:py-16"><SectionContainer><Eyebrow>Fotos</Eyebrow><Title>Conhe&ccedil;a cada detalhe do loteamento</Title><Carousel label="Fotos do loteamento" className="mt-7" itemClassName="w-[84%] tablet:w-[calc((100%-2.5rem)/3)]" paused={lightbox !== null}>{media.map((asset, index) => <MediaLightboxTrigger key={asset.id} index={index} onOpen={setLightbox} className="aspect-[1.16/1] w-full overflow-hidden rounded-lg bg-ink" label={`Ampliar mÃ­dia ${index + 1}`}><MediaTile item={asset} /></MediaLightboxTrigger>)}</Carousel></SectionContainer><MediaLightbox items={media} open={lightbox !== null} initialIndex={lightbox || 0} onClose={() => setLightbox(null)} /></section>;
}

function LotsInfoSection({ item }) {
    if (!item.lots_info_url) return null;
    return <section className="bg-surface py-14 tablet:py-[72px]"><SectionContainer className="grid gap-8 rounded-xl border border-line bg-white p-6 shadow-[0_6px_22px_rgba(17,17,17,.05)] tablet:grid-cols-[1.15fr_.85fr] tablet:items-center tablet:p-8"><div><Eyebrow>Informações dos lotes</Eyebrow><Title>Conheça as Plantas dos Lotes</Title><p className="mt-5 max-w-2xl text-base font-light leading-7 text-muted">Faça o download das plantas e tenha acesso aos detalhes do empreendimento, incluindo a divisão dos lotes, medidas e organização do projeto.</p></div><div className="rounded-2xl bg-ink p-6 text-white tablet:p-8"><p className="text-sm uppercase tracking-[.08em] text-white/70">Tudo o que você precisa em um só lugar</p><a href={item.lots_info_url} target="_blank" rel="noopener noreferrer" className="brand-button mt-5 inline-flex w-full justify-center tablet:w-auto">BAIXAR INFORMAÇÕES DOS LOTES</a></div></SectionContainer></section>;
}


export default function Show({ item, globalWhatsapp }) {
    const image = featuredMedia(item);
    return <PublicLayout><SeoHead title={item.seo?.title || item.title} description={item.seo?.description || item.card_summary} /><Hero item={item} image={image} globalWhatsapp={globalWhatsapp} /><About item={item} image={image} /><Features items={item.features} /><Promotions items={item.promotions} /><Location item={item} globalWhatsapp={globalWhatsapp} /><Progress item={item} /><Gallery item={item} /><LotsInfoSection item={item} /><section className="py-14 tablet:py-16"><SectionContainer className="max-w-2xl"><LeadForm entityType="subdivision" entityId={item.id} entityName={item.title} title="Tenho interesse neste loteamento" /></SectionContainer></section></PublicLayout>;
}
