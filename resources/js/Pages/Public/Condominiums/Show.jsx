import { useState } from 'react';
import PublicLayout from '../../../Components/Layout/PublicLayout';
import Container from '../../../Components/UI/Container';
import Carousel from '../../../Components/UI/Carousel';
import SeoHead from '../../../Components/SEO/SeoHead';
import ConstructionProgress from '../../../Components/RealEstate/ConstructionProgress';
import Map from '../../../Components/RealEstate/Map';
import { featuredMedia, galleryMedia, WhatsAppCTA } from '../../../Components/RealEstate/DetailSections';
import FeatureIcon from '../../../Components/RealEstate/FeatureIcon';
import MediaLightbox, { MediaLightboxTrigger, MediaTile } from '../../../Components/RealEstate/MediaLightbox';

const fixedFaqs = [
    ['O empreendimento possui toda a infraestrutura necessaria?', 'Sim. Os condominios sao planejados com infraestrutura completa, areas de lazer, seguranca e conforto.'],
    ['Qual e a previsao de entrega da infraestrutura?', 'A previsao acompanha o cronograma de cada empreendimento e pode ser consultada no andamento da obra.'],
    ['O loteamento esta regularizado?', 'Todos os empreendimentos sao desenvolvidos conforme a legislacao vigente, garantindo seguranca juridica.'],
    ['Posso construir imediatamente apos a compra?', 'O inicio depende do estagio do empreendimento e das liberacoes aplicaveis. Nossa equipe orienta sobre cada prazo.'],
    ['E possivel financiar a compra do lote?', 'As condicoes variam por empreendimento. Nossa equipe apresenta as alternativas disponiveis.'],
    ['Quais documentos receberei na compra?', 'A documentacao correspondente a modalidade de aquisicao e entregue com transparencia em todas as etapas.'],
];

const SectionContainer = ({ children, className = '' }) => <Container className={`max-w-[1120px] ${className}`}>{children}</Container>;
const Eyebrow = ({ children }) => <p className="text-xs font-normal uppercase tracking-[.04em] text-brand tablet:text-sm">{children}</p>;
const SectionTitle = ({ children, className = '' }) => <h2 className={`mt-3 text-[2rem] font-light leading-[1.08] tracking-[-.02em] text-ink tablet:text-[2.75rem] desktop:text-[3.15rem] ${className}`}>{children}</h2>;

function CondominiumHero({ item, image, globalWhatsapp }) {
    const whatsapp = String(item.whatsapp_contact || globalWhatsapp || '').replace(/\D/g, '');
    return <section className="relative flex min-h-[570px] items-center overflow-hidden bg-ink pb-24 pt-32 text-white tablet:min-h-[590px]">
        {image && <img src={image.url} alt={image.alt_text || item.title} className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.78)_0%,rgba(0,0,0,.58)_42%,rgba(0,0,0,.2)_78%,rgba(0,0,0,.36)_100%)]" />
        <SectionContainer className="relative z-10">
            <div className="max-w-[510px]">
                <div className="mb-4 flex flex-wrap gap-1.5 text-[.62rem] font-medium uppercase"><span className="rounded-sm bg-brand px-3 py-1.5">{item.city?.name || 'Condom\u00ednio'}</span>{item.development_status?.name && <span className="rounded-sm bg-white px-3 py-1.5 text-ink">{item.development_status.name}</span>}</div>
                <h1 className="max-w-[560px] text-[2.55rem] font-light leading-[.98] tracking-[-.035em] tablet:text-[3.5rem] desktop:text-[3.75rem]">{item.title}</h1>
                {item.excerpt && <p className="mt-6 max-w-[600px] text-base font-light leading-[1.7] text-white/90 tablet:text-lg">{item.excerpt}</p>}
                {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="brand-button mt-6 gap-2"><svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current"><path d="M12 2a9.7 9.7 0 0 0-8.4 14.6L2.3 21.7l5.2-1.3A9.7 9.7 0 1 0 12 2Zm0 17.5a7.7 7.7 0 0 1-3.9-1.1l-.3-.2-3.1.8.8-3-.2-.3A7.7 7.7 0 1 1 12 19.5Zm4.2-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1l-.7.9c-.1.2-.3.2-.5.1-1.4-.7-2.4-1.3-3.4-3-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.8.8-1.1 1.9-.8 3 .4 2.2 2 4.2 4.1 5.5 1.6 1 4.1 1.9 5.5.7.4-.4.7-1 .8-1.6 0-.2 0-.4-.2-.5l-.9-.6Z" /></svg>Falar no WhatsApp</a>}
            </div>
        </SectionContainer>
    </section>;
}

function InternalMenu() {
    const links = [['sobre', 'Empreendimento'], ['diferenciais', 'Diferenciais'], ['galeria', 'Galeria'], ['plantas', 'Plantas'], ['localizacao', 'Localiza\u00e7\u00e3o'], ['andamento', 'Andamento da obra'], ['faq', 'FAQ']];
    const paths = ['M4 20V8l8-4 8 4v12M9 20v-6h6v6', 'm12 3 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4L7.5 16l.9-5L4.8 8.2l5-.7L12 3Z', 'M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6', 'M4 4h16v16H4zM8 4v16M4 10h16', 'M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z', 'M4 19V9m5 10V5m5 14v-7m5 7V3', 'M9.5 9a2.7 2.7 0 1 1 4.2 2.2c-1 .7-1.7 1.1-1.7 2.3M12 18h.01M4 4h16v16H4z'];
    return <SectionContainer className="relative z-30 -mt-12"><nav aria-label="Secoes do condominio" className="flex min-h-24 overflow-x-auto rounded-xl bg-white px-4 shadow-[0_10px_28px_rgba(0,0,0,.1)] [scrollbar-width:none]">{links.map(([id, label], index) => <a key={id} href={`#${id}`} className="grid min-w-28 flex-1 place-items-center border-r border-line px-3 py-5 text-center text-[.62rem] font-normal text-muted transition hover:text-brand last:border-r-0"><span><svg viewBox="0 0 24 24" aria-hidden="true" className="mx-auto mb-2 size-6 fill-none stroke-brand stroke-[1.35]" strokeLinecap="round" strokeLinejoin="round"><path d={paths[index]} /></svg>{label}</span></a>)}</nav></SectionContainer>;
}

function About({ item, image }) {
    if (!item.about_title && !item.about_text) return null;
    return <section id="sobre" className="scroll-mt-28 py-14 tablet:py-[72px]"><SectionContainer className="grid gap-10 tablet:grid-cols-[.88fr_1.12fr] tablet:items-center"><div><Eyebrow>Sobre o empreendimento</Eyebrow><SectionTitle>{item.about_title}</SectionTitle>{item.about_text && <p className="mt-5 whitespace-pre-line text-sm font-light leading-[1.75] text-muted">{item.about_text}</p>}</div>{image && <img src={image.url} alt={image.alt_text || item.about_title || item.title} className="aspect-[1.45/1] w-full rounded-xl object-cover" />}</SectionContainer></section>;
}

function Features({ items = [] }) {
    if (!items.length) return null;
    return <section id="diferenciais" className="scroll-mt-28 pb-14 tablet:pb-16"><SectionContainer><Eyebrow>Diferenciais</Eyebrow><SectionTitle>Projetado para superar expectativas</SectionTitle><div className="mt-7 grid grid-cols-2 gap-3 tablet:grid-cols-4 desktop:grid-cols-5">{items.map((feature) => <article key={feature.id} className="grid min-h-28 place-items-center rounded-xl border border-line bg-white p-4 text-center shadow-[0_5px_18px_rgba(17,17,17,.055)]"><div><span className="mx-auto mb-3 grid min-h-9 place-items-center text-xl text-brand"><FeatureIcon feature={feature} className="size-9" /></span><h3 className="text-[.68rem] font-light leading-[1.3] text-ink">{feature.name}</h3></div></article>)}</div></SectionContainer></section>;
}

const money = (value) => value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) : null;

function PromotionCard({ promotion }) {
    return <article className="grid min-h-[320px] overflow-hidden rounded-xl border border-line bg-white shadow-[0_8px_28px_rgba(17,17,17,.05)] tablet:grid-cols-[1fr_.9fr]"><div className="flex flex-col justify-center p-7 tablet:p-10"><Eyebrow>{promotion.product_name || 'Condominio'}</Eyebrow><h3 className="mt-3 max-w-md text-[1.75rem] font-light leading-[1.08] text-ink tablet:text-[2.1rem]">{promotion.title}</h3>{promotion.text && <p className="mt-4 max-w-md text-sm leading-6 text-muted">{promotion.text}</p>}<div className="mt-5 w-full max-w-[330px] rounded-lg border border-line px-4 py-3">{promotion.original_price && <span className="block text-[.65rem] text-muted line-through">De {money(promotion.original_price)}</span>}<span className="text-[.65rem] uppercase text-muted">A partir de</span><strong className="block text-2xl font-medium text-brand">{money(promotion.promotional_price) || 'Consulte'}</strong></div>{promotion.button_url && <a href={promotion.button_url} className="brand-button mt-5 w-fit">{promotion.button_text || 'Conhecer o condominio'}</a>}</div>{promotion.media_asset && <img src={promotion.media_asset.url} alt={promotion.title} className="h-full min-h-64 w-full object-cover" />}</article>;
}

function Promotions({ promotions }) {
    if (!promotions.length) return null;
    return <section id="promocoes" className="scroll-mt-28 pb-14 tablet:pb-16"><SectionContainer>{promotions.length === 1 ? <PromotionCard promotion={promotions[0]} /> : <Carousel label="Promocoes" itemClassName="w-[94%] tablet:w-[86%]">{promotions.map((promotion) => <PromotionCard key={promotion.id} promotion={promotion} />)}</Carousel>}</SectionContainer></section>;
}

function GalleryItem({ asset, index, onOpen }) {
    return <MediaLightboxTrigger index={index} onOpen={onOpen} className="aspect-[1.16/1] w-full overflow-hidden rounded-lg bg-ink" label={`Ampliar mídia ${index + 1}`}><MediaTile item={asset} /></MediaLightboxTrigger>;
}

function GallerySection({ items }) {
    const [lightbox, setLightbox] = useState(null);
    if (!items.length) return null;
    return <section id="galeria" className="scroll-mt-28 bg-surface py-14 tablet:py-16"><SectionContainer><Eyebrow>Galeria</Eyebrow><SectionTitle>Conhe&ccedil;a cada detalhe do empreendimento</SectionTitle><Carousel label="Galeria do condominio" className="mt-7" itemClassName="w-[82%] tablet:w-[calc((100%-2.5rem)/3)]" paused={lightbox !== null}>{items.map((asset, index) => <GalleryItem key={asset.id} asset={asset} index={index} onOpen={setLightbox} />)}</Carousel></SectionContainer><MediaLightbox items={items} open={lightbox !== null} initialIndex={lightbox || 0} onClose={() => setLightbox(null)} /></section>;
}

function PlanCard({ plan, mediaIndex, onOpen }) {
    return <article className="overflow-hidden rounded-xl border border-line bg-white"><div className="p-4"><span className="rounded-sm bg-brand px-2 py-1 text-[.58rem] uppercase text-white">Planta</span><h3 className="mt-2 text-sm font-normal text-ink">{plan.name}</h3></div>{plan.media_asset && <MediaLightboxTrigger index={mediaIndex} onOpen={onOpen} className="aspect-[1.22/1] w-full p-4" label={`Ampliar planta ${plan.name}`}><img src={plan.media_asset.url} alt={plan.name} className="h-full w-full object-contain" /></MediaLightboxTrigger>}<div className="grid grid-cols-2 border-t border-line tablet:grid-cols-4">{[['Area privativa', plan.area && `${Number(plan.area).toLocaleString('pt-BR')} m2`], ['Quartos', plan.bedrooms], ['Banheiros', plan.bathrooms], ['Vagas', plan.parking_spaces]].filter(([, value]) => value).map(([label, value]) => <div key={label} className="border-r border-line p-3 text-center last:border-r-0"><span className="block text-[.55rem] uppercase text-muted">{label}</span><strong className="mt-1 block text-xs font-normal text-ink">{value}</strong></div>)}</div></article>;
}

function Plans({ item }) {
    const [lightbox, setLightbox] = useState(null);
    const plans = (item.floor_plans || []).filter((plan) => plan.is_active !== false);
    const media = plans.map((plan) => plan.media_asset && ({ ...plan.media_asset, alt_text: plan.media_asset.alt_text || plan.name })).filter(Boolean);
    if (!plans.length) return null;
    let mediaIndex = -1;
    return <section id="plantas" className="scroll-mt-28 py-14 tablet:py-[72px]"><SectionContainer className="grid gap-10 tablet:grid-cols-[.9fr_1.1fr] tablet:items-center"><div><Eyebrow>Plantas</Eyebrow><SectionTitle>{item.floor_plans_title || 'Conhe\u00e7a as plantas dispon\u00edveis'}</SectionTitle>{item.floor_plans_support_text && <p className="mt-5 text-sm font-light leading-7 text-muted">{item.floor_plans_support_text}</p>}</div><Carousel label="Plantas disponiveis" itemClassName="w-[94%]" paused={lightbox !== null}>{plans.map((plan) => { if (plan.media_asset) mediaIndex += 1; return <PlanCard key={plan.id} plan={plan} mediaIndex={mediaIndex} onOpen={setLightbox} />; })}</Carousel></SectionContainer><MediaLightbox items={media} open={lightbox !== null} initialIndex={lightbox || 0} onClose={() => setLightbox(null)} /></section>;
}

function Location({ item }) {
    if (!item.address && item.latitude == null && item.longitude == null) return null;
    const address = [item.address, item.address_number, item.neighborhood, item.city?.name, item.city?.state?.code].filter(Boolean).join(', ');
    return <section id="localizacao" className="scroll-mt-28 bg-surface py-14 tablet:py-[72px]"><SectionContainer className="grid gap-10 tablet:grid-cols-[.9fr_1.1fr] tablet:items-center"><div><Eyebrow>Localiza&ccedil;&atilde;o</Eyebrow><SectionTitle>Localiza&ccedil;&atilde;o estrat&eacute;gica para facilitar seu dia a dia</SectionTitle>{address && <p className="mt-5 text-sm font-light leading-7 text-muted">{address}</p>}<WhatsAppCTA item={item} className="mt-6" /></div><div className="overflow-hidden rounded-xl [&_iframe]:min-h-[360px]"><Map latitude={item.latitude} longitude={item.longitude} address={address} title={`Localizacao de ${item.title}`} /></div></SectionContainer></section>;
}

function Progress({ item }) {
    if (!item.construction_stages?.length) return null;
    return <section id="andamento" className="scroll-mt-28 py-14 tablet:py-16"><SectionContainer><Eyebrow>Andamento da obra</Eyebrow><SectionTitle>Acompanhe nosso projeto em andamento</SectionTitle><div className="mt-8 rounded-xl border border-line bg-white p-6 shadow-[0_6px_22px_rgba(17,17,17,.05)] tablet:p-8"><ConstructionProgress items={item.construction_stages} completionDate={item.expected_delivery_date} /></div></SectionContainer></section>;
}

function Faq() {
    return <section id="faq" className="scroll-mt-28 bg-surface py-14 tablet:py-16"><SectionContainer><div className="text-center"><Eyebrow>Perguntas frequentes</Eyebrow><SectionTitle>Esclare&ccedil;a suas principais d&uacute;vidas</SectionTitle></div><div className="mt-10 grid gap-x-12 tablet:grid-cols-2">{fixedFaqs.map(([question, answer]) => <details key={question} className="group border-b border-line"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-xs font-normal text-ink"><span>{question}</span><span className="text-lg text-brand group-open:rotate-45">+</span></summary><p className="pb-5 text-xs font-light leading-6 text-muted">{answer}</p></details>)}</div></SectionContainer></section>;
}

export default function Show({ item, globalWhatsapp }) {
    const image = featuredMedia(item);
    const gallery = galleryMedia(item);
    let promotions = (item.promotions || []).filter((promotion) => promotion.is_active !== false && promotion.title);
    if (!promotions.length && (item.promotion_headline || item.promotion_price)) promotions = [{ id: 'legacy', product_name: item.title, title: item.promotion_headline || item.title, original_price: item.starting_price, promotional_price: item.promotion_price, button_text: 'Conhecer o condominio', button_url: item.promotion_url, media_asset: item.promotion_media }];
    return <PublicLayout><SeoHead title={item.seo?.title || item.title} description={item.seo?.description || item.excerpt} /><CondominiumHero item={item} image={image} globalWhatsapp={globalWhatsapp} /><InternalMenu /><About item={item} image={image} /><Features items={item.features} /><Promotions promotions={promotions} /><GallerySection items={gallery} /><Plans item={item} /><Location item={item} />{image && <section aria-label="Imagem do empreendimento" className="relative h-[300px] bg-cover bg-center bg-no-repeat [background-attachment:scroll] tablet:h-[400px] desktop:h-[500px] desktop:[background-attachment:fixed]" style={{ backgroundImage: `url(${image.url})` }}><div className="absolute inset-0 bg-black/30" /></section>}<Progress item={item} /><Faq /></PublicLayout>;
}
