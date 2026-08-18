import PublicLayout from '../../../Components/Layout/PublicLayout';
import Container from '../../../Components/UI/Container';
import SeoHead from '../../../Components/SEO/SeoHead';
import Gallery from '../../../Components/RealEstate/Gallery';
import LeadForm from '../../../Components/RealEstate/LeadForm';
import { FAQSection, PlansSection, WhatsAppCTA, galleryMedia } from '../../../Components/RealEstate/DetailSections';

const money = (value) => value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) : null;
const Fact = ({ label, value }) => value !== null && value !== undefined && value !== '' ? <div className="border-b border-line py-4"><span className="text-xs uppercase text-muted">{label}</span><strong className="mt-1 block text-lg font-normal text-ink">{value}</strong></div> : null;

export default function Show({ item }) {
    const gallery = galleryMedia(item);
    const address = [item.address, item.address_number, item.neighborhood, item.city?.name, item.city?.state?.code].filter(Boolean).join(', ');
    const quickFacts = [['Quartos', item.bedrooms], ['Suítes', item.suites], ['Banheiros', item.bathrooms], ['Lavabos', item.lavatories], ['Vagas', item.parking_spaces], ['Salas', item.rooms]];
    const areas = [['Área total', item.total_area], ['Área útil', item.usable_area], ['Área construída', item.built_area], ['Área do terreno', item.land_area]];
    const conditions = [['Aceita permuta', item.accepts_exchange], ['Aceita financiamento', item.accepts_financing], ['Mobiliado', item.furnished], ['Imóvel novo', item.is_new]];

    return <PublicLayout>
        <SeoHead title={item.seo?.title || item.title} description={item.seo?.description || item.excerpt} />
        <section className="bg-white pb-14 pt-32"><Container><Gallery items={gallery} /><div className="mt-10 flex flex-wrap gap-2 text-xs uppercase"><span className="rounded-full bg-brand px-4 py-2 text-white">{item.property_type?.name || 'Imóvel'}</span>{item.business_type?.name && <span className="rounded-full bg-surface px-4 py-2">{item.business_type.name}</span>}</div><h1 className="mt-5 max-w-4xl text-4xl font-normal leading-tight tablet:text-6xl">{item.title}</h1>{address && <p className="mt-4 text-lg text-muted">{address}</p>}<div className="mt-10 grid overflow-hidden rounded-card border border-line tablet:grid-cols-3 desktop:grid-cols-6">{quickFacts.map(([label, value]) => <Fact key={label} label={label} value={value} />)}</div></Container></section>
        <section className="bg-surface py-[var(--section-space)]"><Container className="grid gap-10 desktop:grid-cols-[1fr_23rem] desktop:items-start"><main className="space-y-8"><article className="rounded-card bg-white p-7 shadow-card"><p className="eyebrow">Descrição do imóvel</p><div className="mt-5 whitespace-pre-line text-base font-light leading-8 text-muted">{item.description || item.excerpt}</div></article><article className="grid gap-8 rounded-card bg-white p-7 shadow-card tablet:grid-cols-2"><div><h2 className="text-2xl font-normal">Condições comerciais</h2>{conditions.map(([label, value]) => <Fact key={label} label={label} value={value ? 'Sim' : 'Não'} />)}</div><div><h2 className="text-2xl font-normal">Áreas</h2>{areas.map(([label, value]) => <Fact key={label} label={label} value={value && `${Number(value).toLocaleString('pt-BR')} m²`} />)}</div></article>{item.features?.length > 0 && <article className="rounded-card bg-white p-7 shadow-card"><h2 className="text-2xl font-normal">Características</h2><div className="mt-6 grid gap-3 tablet:grid-cols-2">{item.features.map((feature) => <div key={feature.id} className="rounded-xl border border-line p-4">{feature.name}</div>)}</div></article>}<PlansSection item={item} title="Planta do imóvel" /></main><aside className="space-y-5 desktop:sticky desktop:top-28"><div className="rounded-card bg-ink p-7 text-white"><p className="text-xs uppercase text-white/60">{item.development_status?.name || 'Valor'}</p>{item.regular_price && item.sale_price && <p className="mt-5 text-sm text-white/55 line-through">{money(item.regular_price)}</p>}<p className="mt-2 text-3xl">{item.price_on_request ? 'Sob consulta' : money(item.sale_price || item.regular_price || item.rent_price)}</p>{item.condominium_fee && <p className="mt-6 text-sm text-white/70">Condomínio: {money(item.condominium_fee)}</p>}{item.iptu && <p className="mt-2 text-sm text-white/70">IPTU: {money(item.iptu)}</p>}<WhatsAppCTA item={item} className="mt-7 w-full" /></div><LeadForm entityType="property" entityId={item.id} title="Tenho interesse" /></aside></Container></section>
        <FAQSection items={item.faqs} />
    </PublicLayout>;
}
