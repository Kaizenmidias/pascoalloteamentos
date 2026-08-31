import { Link } from '@inertiajs/react';
import { useState } from 'react';
import PublicLayout from '../../../Components/Layout/PublicLayout';
import Container from '../../../Components/UI/Container';
import SeoHead from '../../../Components/SEO/SeoHead';
import LeadForm from '../../../Components/RealEstate/LeadForm';
import EntityCard from '../../../Components/RealEstate/EntityCard';
import FeatureIcon from '../../../Components/RealEstate/FeatureIcon';
import Map from '../../../Components/RealEstate/Map';
import { galleryMedia } from '../../../Components/RealEstate/DetailSections';
import MediaLightbox, { MediaLightboxTrigger, MediaTile } from '../../../Components/RealEstate/MediaLightbox';
import { whatsappUrl } from '../../../Support/whatsapp';

const money = (value) => value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value)) : null;
const formatNumber = (value) => Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const present = (value) => value !== null && value !== undefined && value !== '';
const normalize = (value = '') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function PropertyGallery({ items = [] }) {
    const media = Array.isArray(items) ? items.filter(Boolean) : [];
    const [lightbox, setLightbox] = useState(null);

    if (!media.length) return <div className="grid min-h-[360px] place-items-center rounded-2xl bg-surface text-sm text-muted">Imagens em atualização</div>;

    const visible = media.slice(0, 7);
    const [featured, ...secondary] = visible;
    const desktopColumns = secondary.length === 1 ? 'grid-cols-1' : secondary.length === 2 ? 'grid-cols-2' : secondary.length === 3 ? 'grid-cols-3' : secondary.length === 4 ? 'grid-cols-2' : 'grid-cols-3';
    const renderTile = (asset, index, showMore = false, className = '') => <MediaLightboxTrigger key={asset.id || asset.url || index} index={index} onOpen={setLightbox} className={`relative h-full min-h-0 w-full overflow-hidden ${className}`} label={`Ampliar mídia ${index + 1}`}><MediaTile item={asset} />{showMore && <span className="absolute inset-0 grid place-items-center bg-black/55 px-4 text-center text-sm font-medium text-white">Ver mais fotos</span>}</MediaLightboxTrigger>;

    return <div className="w-full overflow-hidden bg-ink">
        <div className="flex h-[300px] snap-x snap-mandatory gap-[3px] overflow-x-auto tablet:hidden">
            {visible.map((asset, index) => renderTile(asset, index, media.length > visible.length && index === visible.length - 1, visible.length === 1 ? 'w-full shrink-0' : 'w-[86vw] shrink-0 snap-center first:w-[94vw]'))}
        </div>

        <div className={`hidden h-[420px] gap-[3px] tablet:grid desktop:hidden ${secondary.length > 0 ? 'grid-cols-[45%_55%]' : 'grid-cols-1'}`}>
            {renderTile(featured, 0)}
            {secondary.length > 0 && <div className={`grid min-h-0 gap-[3px] ${secondary.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} ${secondary.length <= 2 ? 'grid-rows-1' : 'grid-rows-2'}`}>
                {secondary.slice(0, 4).map((asset, index, tabletMedia) => renderTile(asset, index + 1, media.length > 5 && index === tabletMedia.length - 1))}
            </div>}
        </div>

        <div className={`hidden h-[clamp(420px,27vw,520px)] gap-[3px] desktop:grid ${secondary.length > 0 ? 'grid-cols-[40%_60%]' : 'grid-cols-1'}`}>
            {renderTile(featured, 0)}
            {secondary.length > 0 && <div className={`grid min-h-0 gap-[3px] ${desktopColumns} ${secondary.length <= 3 ? 'grid-rows-1' : 'grid-rows-2'}`}>
                {secondary.map((asset, index) => renderTile(asset, index + 1, media.length > visible.length && index === secondary.length - 1))}
            </div>}
        </div>

        <MediaLightbox items={media} open={lightbox !== null} initialIndex={lightbox || 0} onClose={() => setLightbox(null)} />
    </div>;
}

function Fact({ label, value, icon }) {
    if (!present(value)) return null;
    return <div className="flex items-start gap-3 border-b border-line pb-4"><svg viewBox="0 0 24 24" aria-hidden="true" className="mt-1 size-5 shrink-0 fill-none stroke-brand stroke-[1.6]" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg><div><strong className="block text-lg font-medium text-ink">{value}</strong><span className="mt-1 block text-[.65rem] uppercase tracking-[.04em] text-muted">{label}</span></div></div>;
}

function FeatureSection({ title, items }) {
    if (!items.length) return null;
    return <section className="border-t border-line pt-9"><p className="text-xs font-medium uppercase tracking-[.08em] text-brand">{title}</p><div className="mt-5 grid gap-x-8 gap-y-4 tablet:grid-cols-2 desktop:grid-cols-3">{items.map((feature) => <div key={feature.id || feature.slug || feature.name} className="flex items-center gap-3 text-sm text-ink"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand/10 text-brand"><FeatureIcon feature={feature} className="size-4" />{!feature.icon && !feature.icon_media && <span aria-hidden="true">&#10003;</span>}</span><span>{feature.name}</span></div>)}</div></section>;
}

function PriceBlock({ item }) {
    const salePrice = item.sale_price || item.regular_price;
    const showSale = item.commercial_purpose !== 'rent' && present(salePrice);
    const showRent = ['rent', 'sale_rent', 'season'].includes(item.commercial_purpose) && present(item.rent_price);

    return <div className="border-t border-line pt-6">{item.price_on_request ? <strong className="text-3xl font-medium text-brand">Valor sob consulta</strong> : <div className="space-y-4">{showSale && <div>{item.regular_price && item.sale_price && Number(item.regular_price) !== Number(item.sale_price) && <p className="text-sm text-muted line-through">{money(item.regular_price)}</p>}<span className="text-[.65rem] uppercase tracking-[.06em] text-muted">Venda</span><strong className="mt-1 block text-3xl font-medium text-brand">{money(salePrice)}</strong></div>}{showRent && <div><span className="text-[.65rem] uppercase tracking-[.06em] text-muted">Locação</span><strong className="mt-1 block text-3xl font-medium text-brand">{money(item.rent_price)} <small className="text-sm font-normal">/ mês</small></strong></div>}{!showSale && !showRent && <strong className="text-2xl font-medium text-brand">Valor sob consulta</strong>}</div>}{(present(item.condominium_fee) || present(item.iptu)) && <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4 text-sm">{present(item.condominium_fee) && <div><span className="block text-[.65rem] uppercase text-muted">Condomínio</span><strong className="mt-1 block font-medium">{money(item.condominium_fee)}</strong></div>}{present(item.iptu) && <div><span className="block text-[.65rem] uppercase text-muted">IPTU</span><strong className="mt-1 block font-medium">{money(item.iptu)}</strong></div>}</div>}</div>;
}

function SimilarSection({ similar = [] }) {
    if (!Array.isArray(similar) || !similar.length) return null;
    return <section className="bg-white py-14 tablet:py-20"><Container className="max-w-[1280px]"><div className="text-center"><p className="text-xs font-medium uppercase tracking-[.08em] text-brand">Continue explorando</p><h2 className="mt-3 text-[2rem] font-light tracking-[-.02em] text-ink tablet:text-[2.7rem]">Imóveis similares</h2></div><div className="mt-9 grid gap-6 tablet:grid-cols-2 desktop:grid-cols-4">{similar.map((property) => <EntityCard key={property.id} item={property} href={`/imoveis/${property.slug}`} />)}</div></Container></section>;
}

export default function Show({ item, similar = [] }) {
    const gallery = galleryMedia(item);
    const features = Array.isArray(item.features) ? item.features.filter((feature) => feature?.name) : [];
    const leisure = features.filter((feature) => /lazer|leisure|recrea|amenidade|piscina|academia|churrasqueira|playground|salao|quadra|sauna|spa|gourmet|fitness|brinquedoteca/.test(normalize(`${feature.category} ${feature.name}`)));
    const external = features.filter((feature) => !leisure.includes(feature) && /extern|infraestrutura|condomin|jardim|portaria|elevador|interfone|seguranca|monitoramento|acesso|estacionamento|agua|gas/.test(normalize(`${feature.category} ${feature.name}`)));
    const otherFeatures = features.filter((feature) => !leisure.includes(feature) && !external.includes(feature));
    const address = [item.address, item.address_number, item.neighborhood, item.city?.name, item.city?.state?.code, item.postal_code].filter(Boolean).join(', ');
    const facts = [
        ['Área privativa', item.usable_area && `${formatNumber(item.usable_area)} m²`, 'M4 9V4h16v16H4zM8 4v16M4 10h16'],
        ['Área total', item.total_area && `${formatNumber(item.total_area)} m²`, 'M4 9V4h16v16H4zM8 4v16M4 10h16'],
        ['Quartos', item.bedrooms, 'M4 6h16v12H4zM8 6v12M4 12h16'],
        ['Suítes', item.suites, 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm4 8h4'],
        ['Banheiros', item.bathrooms, 'M7 4h10v16H7zM10 8h4M10 12h4'],
        ['Lavabos', item.lavatories, 'M7 4h10v16H7zM10 8h4M10 12h4'],
        ['Salas', item.rooms, 'M4 5h16v14H4zM8 5v14M4 12h16'],
        ['Vagas', item.parking_spaces, 'M4 12h16M7 9h2m6 0h2M6 16h12'],
    ].filter(([, value]) => present(value));
    const conditions = [['Mobiliado', item.furnished], ['Aceita financiamento', item.accepts_financing], ['Aceita permuta', item.accepts_exchange], ['Imóvel novo', item.is_new]].filter(([, value]) => value);
    const areas = [['Área útil', item.usable_area], ['Área total', item.total_area], ['Área construída', item.built_area], ['Área do terreno', item.land_area]].filter(([, value]) => present(value));
    const planDocument = item.documents?.find((document) => document.kind === 'property_plan') || item.documents?.find((document) => document.media_asset?.mime_type === 'application/pdf');
    const planLink = planDocument?.media_asset?.url || item.floor_plans?.find((plan) => plan?.is_active !== false && plan?.external_url)?.external_url;
    const whatsapp = whatsappUrl({ type: 'property', title: item.title });
    const descriptionHtml = item.description || item.excerpt || '';
    const sidebarFacts = facts.slice(0, 4);

    return <PublicLayout>
        <SeoHead title={item.seo?.title || item.title} description={item.seo?.description || item.excerpt} />
        <section className="bg-white pt-[120px] tablet:pt-[150px]">
            <div className="w-full px-[3px]">
                <PropertyGallery items={gallery} />
            </div>
        </section>

        <section className="bg-white py-10 tablet:py-12">
            <Container className="max-w-[1280px]">
                <nav aria-label="Navegação estrutural" className="flex flex-wrap items-center gap-2 text-xs text-muted"><Link href="/" className="hover:text-brand">Home</Link><span aria-hidden="true">/</span><Link href="/imoveis" className="hover:text-brand">Imóveis</Link><span aria-hidden="true">/</span><span className="line-clamp-1 text-ink">{item.title}</span></nav>
                <div className="mt-6 flex flex-wrap gap-2 text-[.65rem] font-medium uppercase"><span className="rounded-md bg-brand px-3 py-1.5 text-white">{item.property_type?.name || 'Imóvel'}</span>{item.business_type?.name && <span className="rounded-md bg-surface px-3 py-1.5 text-ink">{item.business_type.name}</span>}{item.development_status?.name && <span className="rounded-md bg-surface px-3 py-1.5 text-ink">{item.development_status.name}</span>}</div>
                <h1 className="mt-5 max-w-4xl text-[2.35rem] font-light leading-[1.04] tracking-[-.03em] text-ink tablet:text-[3rem] desktop:text-[3.35rem]">{item.title}</h1>
                {address && <p className="mt-4 text-sm font-light leading-6 text-muted">{address}</p>}
                {(item.condominium?.title || item.condominium_name) && <p className="mt-2 text-sm text-muted">{item.condominium?.title || item.condominium_name}</p>}
            </Container>
        </section>

        <section className="bg-surface py-14 tablet:py-20">
            <Container className="max-w-[1280px]">
                <div className="grid gap-10 desktop:grid-cols-[minmax(0,1fr)_360px] desktop:items-start">
                    <div className="space-y-10">
                        {facts.length > 0 && <div className="grid gap-5 tablet:grid-cols-2 desktop:grid-cols-4">{facts.map(([label, value, icon]) => <Fact key={label} label={label} value={value} icon={icon} />)}</div>}
                        {descriptionHtml && <article><p className="text-xs font-medium uppercase tracking-[.08em] text-brand">Descrição do imóvel</p><div className="rich-public-content mt-5 max-w-[900px] text-base font-light leading-[1.8] text-muted" dangerouslySetInnerHTML={{ __html: descriptionHtml }} /></article>}
                        <FeatureSection title="Características externas" items={external} />
                        <FeatureSection title="Lazer" items={leisure} />
                        <FeatureSection title="Diferenciais do imóvel" items={otherFeatures} />
                        {(areas.length > 0 || conditions.length > 0) && <section className="grid gap-8 border-t border-line pt-9 tablet:grid-cols-2">{areas.length > 0 && <div><h2 className="text-xl font-light text-ink">Áreas</h2><dl className="mt-4 space-y-3">{areas.map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-line pb-2 text-sm"><dt className="text-muted">{label}</dt><dd className="font-medium text-ink">{formatNumber(value)} m²</dd></div>)}</dl></div>}{conditions.length > 0 && <div><h2 className="text-xl font-light text-ink">Condições</h2><div className="mt-4 flex flex-wrap gap-2">{conditions.map(([label]) => <span key={label} className="rounded-full border border-line bg-white px-4 py-2 text-sm text-ink">{label}</span>)}</div></div>}</section>}
                        {planLink && <section className="flex flex-wrap items-center justify-between gap-6 border-t border-line pt-9"><div><h2 className="text-xl font-light text-ink">Planta do imóvel</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{item.floor_plans_support_text || 'Consulte a distribuição, as medidas e a organização dos ambientes.'}</p></div><a href={planLink} target="_blank" rel="noreferrer" className="brand-button inline-flex">{planDocument ? 'Baixar planta' : 'Ver planta'}</a></section>}
                        {(address || item.latitude || item.longitude) && <section className="grid gap-7 border-t border-line pt-9 desktop:grid-cols-[.7fr_1.3fr] desktop:items-center"><div><p className="text-xs font-medium uppercase tracking-[.08em] text-brand">Localização</p>{address && <p className="mt-4 text-sm font-light leading-6 text-muted">{address}</p>}</div><div className="min-h-[340px] overflow-hidden rounded-2xl"><Map latitude={item.latitude} longitude={item.longitude} address={address} title={`Localização de ${item.title}`} /></div></section>}
                    </div>

                    <aside className="space-y-5 desktop:sticky desktop:top-28">
                        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(17,17,17,.10)]">
                            <div className="border-b border-line bg-brand px-6 py-5 text-white">
                                <p className="text-[.65rem] font-medium uppercase tracking-[.08em] text-white/70">Atendimento personalizado</p>
                                <h2 className="mt-2 text-2xl font-light leading-tight">Fale com a equipe Pascoal</h2>
                            </div>
                            <div className="space-y-6 px-6 py-6">
                                <PriceBlock item={item} />
                                <div className="space-y-3">
                                    {sidebarFacts.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3 text-sm"><span className="text-muted">{label}</span><strong className="text-ink">{value}</strong></div>)}
                                </div>
                                <a href={whatsapp} target="_blank" rel="noreferrer" className="brand-button flex justify-center">Falar no WhatsApp</a>
                                <div className="rounded-xl bg-surface p-4 text-sm leading-6 text-muted">Nos envie uma mensagem para confirmar disponibilidade, condições comerciais e tirar dúvidas sobre este imóvel.</div>
                            </div>
                        </div>

                        <LeadForm entityType="property" entityId={item.id} entityName={item.title} title="Tenho interesse neste imóvel" />
                    </aside>
                </div>
            </Container>
        </section>

        <section className="bg-brand py-14 text-white tablet:py-20">
            <Container className="grid max-w-[1120px] gap-8 tablet:grid-cols-[1fr_auto] tablet:items-center">
                <div>
                    <p className="text-xs uppercase tracking-[.1em] text-white/70">Atendimento personalizado</p>
                    <h2 className="mt-3 text-[2rem] font-light leading-tight tablet:text-[2.7rem]">Não encontrou o imóvel ideal?</h2>
                    <p className="mt-4 max-w-2xl font-light leading-7 text-white/80">Nossa equipe ajuda você a encontrar uma opção que combine com seus planos, necessidades e momento.</p>
                </div>
                <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex justify-center rounded-lg bg-white px-6 py-3 text-sm font-medium uppercase text-brand transition hover:bg-surface">Encontrar meu imóvel</a>
            </Container>
        </section>

        <SimilarSection similar={similar} />
    </PublicLayout>;
}
