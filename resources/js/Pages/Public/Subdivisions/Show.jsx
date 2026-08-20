import PublicLayout from '../../../Components/Layout/PublicLayout';
import SeoHead from '../../../Components/SEO/SeoHead';
import Container from '../../../Components/UI/Container';
import Carousel from '../../../Components/UI/Carousel';
import ConstructionProgress from '../../../Components/RealEstate/ConstructionProgress';
import FeatureIcon from '../../../Components/RealEstate/FeatureIcon';
import Map from '../../../Components/RealEstate/Map';
import { featuredMedia, galleryMedia } from '../../../Components/RealEstate/DetailSections';

const defaultFaqs = [
    ['O loteamento possui infraestrutura completa?', 'Os loteamentos s\u00e3o planejados com infraestrutura urbana completa. Consulte nossa equipe para conhecer os itens deste empreendimento.'],
    ['\u00c9 poss\u00edvel financiar a compra de um lote?', 'As condi\u00e7\u00f5es variam por empreendimento. Nossa equipe apresenta as alternativas dispon\u00edveis.'],
    ['Os lotes possuem escritura?', 'A documenta\u00e7\u00e3o e as condi\u00e7\u00f5es de escritura s\u00e3o apresentadas com transpar\u00eancia durante o atendimento.'],
    ['Posso construir logo ap\u00f3s adquirir o lote?', 'O in\u00edcio depende do est\u00e1gio e das libera\u00e7\u00f5es aplic\u00e1veis ao empreendimento.'],
    ['Quais s\u00e3o os tamanhos dos lotes dispon\u00edveis?', 'As medidas dispon\u00edveis podem ser consultadas nos materiais do empreendimento ou diretamente com nossa equipe.'],
    ['Os loteamentos possuem \u00e1reas de lazer ou espa\u00e7os p\u00fablicos?', 'Cada projeto possui caracter\u00edsticas pr\u00f3prias, exibidas na se\u00e7\u00e3o de diferenciais.'],
];

const SectionContainer = ({ children, className = '' }) => <Container className={`max-w-[1280px] ${className}`}>{children}</Container>;
const Eyebrow = ({ children, className = '' }) => <p className={`text-sm font-light uppercase tracking-[.03em] text-brand ${className}`}>{children}</p>;
const Title = ({ children, className = '' }) => <h2 className={`mt-3 text-[2rem] font-light leading-[1.08] tracking-[-.025em] text-ink tablet:text-[2.7rem] desktop:text-[3.15rem] ${className}`}>{children}</h2>;
const whatsappNumber = (item, fallback) => String(item.whatsapp_contact || fallback || '').replace(/\D/g, '');

function WhatsAppButton({ item, fallback, className = '' }) {
    const number = whatsappNumber(item, fallback);
    if (!number) return null;
    return <a href={`https://wa.me/${number}`} target="_blank" rel="noreferrer" className={`brand-button ${className}`}>Falar no WhatsApp</a>;
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
            {item.excerpt && <p className="mt-6 max-w-[630px] whitespace-pre-line text-base font-light leading-[1.65] text-white/90 tablet:text-lg">{item.excerpt}</p>}
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
    return <article className="grid min-h-[330px] overflow-hidden rounded-xl border border-line bg-white tablet:grid-cols-[1fr_.9fr]"><div className="flex flex-col justify-center p-7 tablet:p-10"><Eyebrow>{promotion.product_name || 'Oportunidade'}</Eyebrow><h3 className="mt-3 text-[1.8rem] font-light leading-[1.08] tablet:text-[2.3rem]">{promotion.title}</h3>{promotion.text && <p className="mt-4 text-sm leading-6 text-muted">{promotion.text}</p>}<div className="mt-5">{promotion.original_price && <span className="block text-xs text-muted line-through">De {money(promotion.original_price)}</span>}<strong className="text-2xl font-medium text-brand">{money(promotion.promotional_price) || 'Consulte'}</strong></div>{promotion.button_url && <a href={promotion.button_url} className="brand-button mt-5 w-fit">{promotion.button_text || 'Tenho interesse'}</a>}</div>{promotion.media_asset && <img src={promotion.media_asset.url} alt={promotion.title} className="h-full min-h-64 w-full object-cover" />}</article>;
}
function Promotions({ items = [] }) {
    const visible = items.filter((item) => item.is_active !== false && item.title);
    if (!visible.length) return null;
    return <section className="py-14 tablet:py-16"><SectionContainer>{visible.length === 1 ? <PromotionCard promotion={visible[0]} /> : <Carousel label="Promo&ccedil;&otilde;es de lotes" itemClassName="w-[94%] tablet:w-[86%]">{visible.map((promotion) => <PromotionCard key={promotion.id} promotion={promotion} />)}</Carousel>}</SectionContainer></section>;
}

function Documents({ documents = [] }) {
    const visible = documents.filter((document) => document.is_public !== false && (document.external_url || document.media_asset?.url));
    if (!visible.length) return null;
    return <section className="py-14 text-center tablet:py-[72px]"><SectionContainer><Eyebrow>Tudo o que voc&ecirc; precisa em um s&oacute; lugar</Eyebrow><Title>Conhe&ccedil;a as Plantas dos Lotes</Title><p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-muted">Fa&ccedil;a o download das plantas e tenha acesso aos detalhes do empreendimento, incluindo a divis&atilde;o dos lotes, medidas e organiza&ccedil;&atilde;o do projeto.</p><div className="mt-7 flex flex-wrap justify-center gap-3">{visible.map((document) => <a key={document.id} href={document.external_url || document.media_asset.url} target="_blank" rel="noreferrer" className="brand-button">{visible.length === 1 ? 'Baixar informa\u00e7\u00f5es dos lotes' : document.title}</a>)}</div></SectionContainer></section>;
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
    const media = galleryMedia(item);
    if (!media.length) return null;
    return <section className="py-14 tablet:py-16"><SectionContainer><Eyebrow>Galeria</Eyebrow><Title>Conhe&ccedil;a cada detalhe do loteamento</Title><Carousel label="Galeria do loteamento" className="mt-7" itemClassName="w-[84%] tablet:w-[calc((100%-2.5rem)/3)]">{media.map((asset) => { const video = asset.type === 'video' || asset.mime_type?.startsWith('video/'); return <div key={asset.id} className="aspect-[1.16/1] overflow-hidden rounded-lg bg-ink">{video ? <video src={asset.url} poster={asset.poster_url || undefined} controls playsInline preload="none" className="h-full w-full object-cover" /> : <img src={asset.url} alt={asset.alt_text || ''} className="h-full w-full object-cover" />}</div>; })}</Carousel></SectionContainer></section>;
}

function Faq() {
    return <section className="bg-surface py-14 tablet:py-16"><SectionContainer><div className="text-center"><Eyebrow>Perguntas frequentes</Eyebrow><Title>Esclare&ccedil;a suas principais d&uacute;vidas</Title></div><div className="mt-9 grid gap-x-12 tablet:grid-cols-2">{defaultFaqs.map(([question, answer]) => <details key={question} className="group border-b border-line"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-sm font-medium text-ink"><span>{question}</span><span className="text-xl text-brand group-open:rotate-45">+</span></summary><p className="pb-5 text-sm font-light leading-6 text-muted">{answer}</p></details>)}</div></SectionContainer></section>;
}

export default function Show({ item, globalWhatsapp }) {
    const image = featuredMedia(item);
    return <PublicLayout><SeoHead title={item.seo?.title || item.title} description={item.seo?.description || item.excerpt} /><Hero item={item} image={image} globalWhatsapp={globalWhatsapp} /><About item={item} image={image} /><Features items={item.features} /><Promotions items={item.promotions} /><Documents documents={item.documents} /><Location item={item} globalWhatsapp={globalWhatsapp} /><Progress item={item} /><Gallery item={item} /><Faq /></PublicLayout>;
}
