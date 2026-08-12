import { Link } from '@inertiajs/react';
import PublicLayout from '../Layout/PublicLayout';
import Container from '../UI/Container';
import SeoHead from '../SEO/SeoHead';
import ConstructionProgress from './ConstructionProgress';
import FeatureGrid from './FeatureGrid';
import LeadForm from './LeadForm';
import Map from './Map';
import PriceDisplay from './PriceDisplay';
import Gallery from './Gallery';

const infoFor = (item, type) => {
    if (type === 'property') return [['Quartos', item.bedrooms], ['Suítes', item.suites], ['Banheiros', item.bathrooms], ['Lavabos', item.lavatories], ['Vagas', item.parking_spaces], ['Área total', item.total_area && `${Number(item.total_area).toLocaleString('pt-BR')}m²`]];
    if (type === 'subdivision') return [['Total de lotes', item.total_lots], ['Lotes disponíveis', item.available_lots], ['Área mínima', item.minimum_lot_area && `${Number(item.minimum_lot_area).toLocaleString('pt-BR')}m²`], ['Área máxima', item.maximum_lot_area && `${Number(item.maximum_lot_area).toLocaleString('pt-BR')}m²`]];
    return [['Área mínima', item.minimum_unit_area && `${Number(item.minimum_unit_area).toLocaleString('pt-BR')}m²`], ['Entrega', item.expected_delivery_date], ['Cidade', item.city?.name], ['Status', item.development_status?.name]];
};

export default function EntityDetail({ item, entityType, priceKey }) {
    const title = item.title;
    const media = item.media_assets || [];
    const hero = media.find((asset) => asset.pivot?.is_featured) || media[0];
    const isProperty = entityType === 'property';
    const label = entityType === 'subdivision' ? 'Loteamentos' : entityType === 'condominium' ? 'Condomínios' : 'Imóveis';
    const info = infoFor(item, entityType).filter(([, value]) => value !== null && value !== undefined && value !== '');

    return (
        <PublicLayout>
            <SeoHead title={item.seo?.title || title} description={item.seo?.description || item.excerpt} />
            <section className={`relative overflow-hidden text-white ${isProperty ? 'min-h-[430px]' : 'min-h-[620px]'}`}>
                <img src={hero?.url || '/reference-assets/hero-home.jpg'} alt={hero?.alt_text || title} className="absolute inset-0 h-full w-full object-cover" />
                <div className="hero-overlay absolute inset-0" />
                <Container className={`relative z-10 flex min-h-[inherit] items-center pt-24 ${isProperty ? 'justify-center text-center' : ''}`}>
                    {!isProperty && <div className="max-w-2xl"><div className="flex gap-2 text-[.625rem] font-medium uppercase"><span className="rounded-full bg-brand px-3 py-1 text-white">{item.city?.name}</span><span className="rounded-full bg-white px-3 py-1 text-ink">{item.development_status?.name}</span></div><h1 className="mt-5 text-[clamp(2.6rem,5vw,4.5rem)] font-light leading-[1.02] tracking-[-.02em]">{title}</h1><p className="mt-6 max-w-xl text-base font-light leading-7 text-white/90 desktop:text-lg">{item.excerpt}</p><a className="brand-button mt-7" href={`https://wa.me/${item.whatsapp_contact || '5545999999999'}`}>Falar no WhatsApp</a></div>}
                </Container>
            </section>

            {info.length > 0 && <Container className={`relative z-20 ${isProperty ? '-mt-8' : '-mt-10'}`}><div className="grid gap-3 rounded-card bg-white p-4 shadow-card tablet:grid-cols-2 desktop:grid-cols-4">{info.map(([name, value]) => <div key={name} className="rounded-xl border border-line p-4"><span className="block text-[.67rem] uppercase text-muted">{name}</span><strong className="mt-1 block text-base font-medium text-brand">{value ?? '—'}</strong></div>)}</div></Container>}

            {isProperty ? (
                <Container className="py-[var(--section-space)]"><div className="grid gap-8 desktop:grid-cols-[1fr_23rem]"><div className="space-y-7"><section className="rounded-card bg-white p-7 shadow-card"><h1 className="section-title text-[2rem]">{title}</h1><p className="mt-2 text-sm text-muted">{[item.address, item.address_number, item.neighborhood, item.city?.name].filter(Boolean).join(', ')}</p></section><section className="rounded-card bg-white p-7 shadow-card"><h2 className="text-xl font-normal text-ink">Descrição do Imóvel</h2><p className="mt-5 whitespace-pre-line text-sm leading-6 text-muted">{item.description || item.excerpt}</p></section><section className="rounded-card bg-white p-7 shadow-card"><h2 className="text-xl font-normal text-ink">Condições Comerciais</h2><div className="mt-5 grid gap-3 tablet:grid-cols-2">{[['Aceita permuta', item.accepts_exchange], ['Aceita financiamento', item.accepts_financing], ['Mobiliado', item.furnished], ['Imóvel novo', item.is_new]].map(([name, value]) => <div key={name} className="flex justify-between rounded-xl border border-line p-3 text-xs uppercase"><span>{name}</span><strong className="text-brand">{value ? 'Sim' : 'Não'}</strong></div>)}</div></section><Link href="/imoveis" className="brand-button">← Voltar</Link></div><aside className="space-y-5"><div className="rounded-card bg-white p-6 shadow-card"><PriceDisplay value={item[priceKey]} prefix={item.regular_price ? `De ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.regular_price)}` : 'Por apenas'} /></div><LeadForm entityType={entityType} entityId={item.id} /></aside></div></Container>
            ) : (
                <>
                    <section className="py-[var(--section-space)]"><Container className="grid gap-12 desktop:grid-cols-2 desktop:items-center"><div><p className="eyebrow">Sobre o empreendimento</p><h2 className="section-title mt-3">{item.about_title || 'Infraestrutura completa para viver com mais conforto e qualidade de vida'}</h2><p className="mt-6 whitespace-pre-line text-base font-light leading-[1.7] text-muted desktop:text-lg">{item.about_text || item.description}</p></div><img src={media[1]?.url || hero?.url} alt="" className="aspect-[16/10] w-full rounded-card object-cover" /></Container></section>
                    {item.features?.length > 0 && <section className="pb-[var(--section-space)]"><Container><p className="eyebrow">Diferenciais</p><h2 className="section-title mt-2">Projetado para superar expectativas</h2><div className="mt-7"><FeatureGrid items={item.features} /></div></Container></section>}
                    <section className="bg-surface py-[var(--section-space)]"><Container><p className="eyebrow">Galeria</p><h2 className="section-title mt-3">Conheça cada detalhe do empreendimento</h2><div className="mx-auto mt-8 max-w-6xl"><Gallery items={media} /></div></Container></section>
                    <section className="py-[var(--section-space)]"><Container className="grid gap-12 desktop:grid-cols-2 desktop:items-center"><div><p className="eyebrow">Localização</p><h2 className="section-title mt-3">Localização estratégica para facilitar seu dia a dia</h2><p className="mt-5 text-base font-light leading-[1.7] text-muted desktop:text-lg">Próximo aos principais acessos da cidade, com infraestrutura urbana consolidada e fácil deslocamento para serviços, comércio e lazer.</p><a className="brand-button mt-7" href={`https://wa.me/${item.whatsapp_contact || '5545999999999'}`}>Falar no WhatsApp</a></div><Map latitude={item.latitude == null ? null : Number(item.latitude)} longitude={item.longitude == null ? null : Number(item.longitude)} /></Container></section>
                    {item.construction_stages?.length > 0 && <section className="bg-surface py-[var(--section-space)]"><Container><p className="eyebrow">Andamento da obra</p><h2 className="section-title mt-2">Acompanhe nosso projeto em andamento</h2><div className="mt-8 rounded-card bg-white p-7 shadow-card"><ConstructionProgress items={item.construction_stages} /></div></Container></section>}
                    <section className="py-[var(--section-space)]"><Container className="text-center"><p className="eyebrow">Perguntas frequentes</p><h2 className="section-title mt-2">Esclareça suas principais dúvidas</h2><div className="mx-auto mt-7 grid max-w-5xl gap-x-8 text-left tablet:grid-cols-2">{(item.faqs?.length ? item.faqs : [{ id: 1, question: `O ${label.toLowerCase()} possui infraestrutura completa?`, answer: 'Entre em contato com nossa equipe para conhecer todos os detalhes.' }, { id: 2, question: 'Quais são as condições comerciais?', answer: 'Nossa equipe apresentará as opções disponíveis.' }]).map((faq) => <details key={faq.id} className="border-b border-line py-4"><summary className="cursor-pointer text-sm font-medium text-ink">{faq.question}</summary><p className="mt-3 text-sm leading-6 text-muted">{faq.answer}</p></details>)}</div></Container></section>
                </>
            )}
        </PublicLayout>
    );
}
