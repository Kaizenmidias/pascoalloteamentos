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

const titleFor = (entityType) => (entityType === 'subdivision' ? 'Loteamentos' : entityType === 'condominium' ? 'Condomínios' : 'Imóveis');

const listDocuments = (documents = []) => documents.filter((document) => document.media_asset?.url || document.url || document.file_url);

const introTitleFor = (entityType, item) => {
    if (entityType === 'property') return 'Detalhes do imóvel';
    if (entityType === 'condominium') return item.about_title || 'Apresentação do condomínio';
    return item.about_title || 'Apresentação do loteamento';
};

const featureTitleFor = (entityType) => {
    if (entityType === 'property') return 'Características que valorizam o imóvel';
    if (entityType === 'condominium') return 'Infraestrutura e diferenciais do condomínio';
    return 'Infraestrutura e diferenciais do loteamento';
};

const plansTitleFor = (entityType) => {
    if (entityType === 'property') return 'Plantas e tipologias';
    if (entityType === 'condominium') return 'Plantas do condomínio';
    return 'Plantas e quadras';
};

const progressTitleFor = () => 'Acompanhe nosso projeto em andamento';

export default function EntityDetail({ item, entityType, priceKey }) {
    const media = item.media_assets || [];
    const galleryItems = media.length ? media : [{ id: 'fallback', url: '/reference-assets/hero-home.jpg', alt_text: item.title }];
    const isProperty = entityType === 'property';
    const label = titleFor(entityType);
    const info = infoFor(item, entityType).filter(([, value]) => value !== null && value !== undefined && value !== '');

    return (
        <PublicLayout>
            <SeoHead title={item.seo?.title || item.title} description={item.seo?.description || item.excerpt} />

            <section className="bg-white pt-24">
                <Container className="space-y-8">
                    <div className="grid gap-8 desktop:grid-cols-[1.25fr_0.75fr] desktop:items-start">
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 text-[.625rem] font-medium uppercase">
                                <span className="rounded-full bg-brand px-3 py-1 text-white">{item.city?.name || label}</span>
                                {item.development_status?.name && <span className="rounded-full bg-surface px-3 py-1 text-ink">{item.development_status.name}</span>}
                                {item.property_type?.name && <span className="rounded-full bg-surface px-3 py-1 text-ink">{item.property_type.name}</span>}
                                {item.condominium_type?.name && <span className="rounded-full bg-surface px-3 py-1 text-ink">{item.condominium_type.name}</span>}
                                {item.subdivision_type?.name && <span className="rounded-full bg-surface px-3 py-1 text-ink">{item.subdivision_type.name}</span>}
                            </div>
                            <h1 className="section-title mt-1">{item.title}</h1>
                            {!isProperty && <p className="max-w-3xl text-base font-light leading-7 text-muted">{item.excerpt}</p>}
                        </div>
                        <div className="rounded-card bg-white p-6 shadow-card">
                            {priceKey && <PriceDisplay value={item[priceKey]} prefix={item.regular_price ? `De ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.regular_price)}` : 'Por apenas'} />}
                            {isProperty && <p className="mt-4 text-sm leading-6 text-muted">{[item.address, item.address_number, item.neighborhood, item.city?.name].filter(Boolean).join(', ')}</p>}
                            {!isProperty && <a className="brand-button mt-6 inline-flex w-full justify-center" href={`https://wa.me/${item.whatsapp_contact || '5545999999999'}`}>Falar no WhatsApp</a>}
                        </div>
                    </div>

                    <Gallery items={galleryItems} />

                    {info.length > 0 && (
                        <div className="grid gap-3 rounded-card bg-white p-4 shadow-card tablet:grid-cols-2 desktop:grid-cols-4">
                            {info.map(([name, value]) => (
                                <div key={name} className="rounded-xl border border-line p-4">
                                    <span className="block text-[.67rem] uppercase text-muted">{name}</span>
                                    <strong className="mt-1 block text-base font-medium text-brand">{value ?? '—'}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </Container>
            </section>

            {isProperty ? (
                <Container className="py-[var(--section-space)]">
                    <div className="grid gap-8 desktop:grid-cols-[1fr_23rem]">
                        <div className="space-y-7">
                            <section className="rounded-card bg-white p-7 shadow-card">
                                <p className="eyebrow">Detalhes do imóvel</p>
                                <h2 className="section-title mt-3 text-[2rem]">{item.title}</h2>
                                <p className="mt-2 text-sm text-muted">{[item.address, item.address_number, item.neighborhood, item.city?.name].filter(Boolean).join(', ')}</p>
                                {item.excerpt && <p className="mt-4 text-sm leading-6 text-muted">{item.excerpt}</p>}
                                {item.description && <p className="mt-5 whitespace-pre-line text-sm leading-7 text-muted">{item.description}</p>}
                            </section>
                            <section className="rounded-card bg-white p-7 shadow-card">
                                <h2 className="text-xl font-normal text-ink">Descrição do Imóvel</h2>
                                <p className="mt-5 whitespace-pre-line text-sm leading-6 text-muted">{item.description || item.excerpt}</p>
                            </section>
                            {item.features?.length > 0 && (
                                <section className="rounded-card bg-white p-7 shadow-card">
                                    <p className="eyebrow">Características</p>
                                    <h2 className="section-title mt-2">{featureTitleFor(entityType)}</h2>
                                    <div className="mt-6">
                                        <FeatureGrid items={item.features} />
                                    </div>
                                </section>
                            )}
                            {item.floor_plans?.length > 0 && (
                                <section className="rounded-card bg-white p-7 shadow-card">
                                    <p className="eyebrow">Plantas</p>
                                    <h2 className="section-title mt-2">{plansTitleFor(entityType)}</h2>
                                    <div className="mt-6 grid gap-4 tablet:grid-cols-2">
                                        {item.floor_plans.map((plan) => (
                                            <article key={plan.id} className="overflow-hidden rounded-card border border-line bg-surface">
                                                <img src={plan.media_asset?.url || '/reference-assets/blog-city.jpg'} alt={plan.title || 'Planta'} className="aspect-[16/10] w-full object-cover" />
                                                <div className="p-4">
                                                    <h3 className="text-sm font-medium text-ink">{plan.title || 'Planta'}</h3>
                                                    {plan.area && <p className="mt-1 text-sm text-muted">{Number(plan.area).toLocaleString('pt-BR')} m²</p>}
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            )}
                            {item.documents?.length > 0 && (
                                <section className="rounded-card bg-white p-7 shadow-card">
                                    <p className="eyebrow">Documentos</p>
                                    <h2 className="section-title mt-2">Materiais disponíveis</h2>
                                    <div className="mt-6 grid gap-3">
                                        {listDocuments(item.documents).map((document) => (
                                            <a key={document.id} href={document.media_asset?.url || document.url || document.file_url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm text-ink transition hover:border-brand">
                                                <span>{document.title || document.name || 'Documento'}</span>
                                                <span className="text-brand">Abrir</span>
                                            </a>
                                        ))}
                                    </div>
                                </section>
                            )}
                            <section className="rounded-card bg-white p-7 shadow-card">
                                <h2 className="text-xl font-normal text-ink">Condições Comerciais</h2>
                                <div className="mt-5 grid gap-3 tablet:grid-cols-2">
                                    {[
                                        ['Aceita permuta', item.accepts_exchange],
                                        ['Aceita financiamento', item.accepts_financing],
                                        ['Mobiliado', item.furnished],
                                        ['Imóvel novo', item.is_new],
                                    ].map(([name, value]) => <div key={name} className="flex justify-between rounded-xl border border-line p-3 text-xs uppercase"><span>{name}</span><strong className="text-brand">{value ? 'Sim' : 'Não'}</strong></div>)}
                                </div>
                            </section>
                            <Link href="/imoveis" className="brand-button">← Voltar</Link>
                        </div>
                        <aside className="space-y-5">
                            <div className="rounded-card bg-white p-6 shadow-card">
                                <PriceDisplay value={item[priceKey]} prefix={item.regular_price ? `De ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.regular_price)}` : 'Por apenas'} />
                            </div>
                            <LeadForm entityType={entityType} entityId={item.id} />
                        </aside>
                    </div>
                </Container>
            ) : (
                <>
                    <section className="py-[var(--section-space)]">
                        <Container className="grid gap-12 desktop:grid-cols-2 desktop:items-center">
                            <div>
                                <p className="eyebrow">Sobre o empreendimento</p>
                                <h2 className="section-title mt-3">{introTitleFor(entityType, item)}</h2>
                                <p className="mt-6 whitespace-pre-line text-base font-light leading-[1.7] text-muted desktop:text-lg">{item.about_text || item.description}</p>
                            </div>
                            <img src={media[1]?.url || galleryItems[0]?.url} alt="" className="aspect-[16/10] w-full rounded-card object-cover" />
                        </Container>
                    </section>
                    {item.features?.length > 0 && (
                        <section className="pb-[var(--section-space)]">
                            <Container>
                                <p className="eyebrow">Diferenciais</p>
                                <h2 className="section-title mt-2">{featureTitleFor(entityType)}</h2>
                                <div className="mt-7">
                                    <FeatureGrid items={item.features} />
                                </div>
                            </Container>
                        </section>
                    )}
                    {item.floor_plans?.length > 0 && (
                        <section className="pb-[var(--section-space)]">
                            <Container>
                                <p className="eyebrow">Plantas</p>
                                <h2 className="section-title mt-2">{plansTitleFor(entityType)}</h2>
                                <div className="mt-7 grid gap-5 tablet:grid-cols-2 desktop:grid-cols-3">
                                    {item.floor_plans.map((plan) => (
                                        <article key={plan.id} className="overflow-hidden rounded-card border border-line bg-white shadow-card">
                                            <img src={plan.media_asset?.url || '/reference-assets/blog-city.jpg'} alt={plan.title || 'Planta'} className="aspect-[16/10] w-full object-cover" />
                                            <div className="p-5">
                                                <h3 className="text-base font-medium text-ink">{plan.title || 'Planta'}</h3>
                                                {plan.area && <p className="mt-1 text-sm text-muted">{Number(plan.area).toLocaleString('pt-BR')} m²</p>}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </Container>
                        </section>
                    )}
                    {item.documents?.length > 0 && (
                        <section className="bg-surface py-[var(--section-space)]">
                            <Container>
                                <p className="eyebrow">Documentos</p>
                                <h2 className="section-title mt-3">Arquivos e materiais úteis</h2>
                                <div className="mt-7 grid gap-3 tablet:grid-cols-2">
                                    {listDocuments(item.documents).map((document) => (
                                        <a key={document.id} href={document.media_asset?.url || document.url || document.file_url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-4 text-sm text-ink transition hover:border-brand">
                                            <span>{document.title || document.name || 'Documento'}</span>
                                            <span className="text-brand">Abrir</span>
                                        </a>
                                    ))}
                                </div>
                            </Container>
                        </section>
                    )}
                    <section className="bg-surface py-[var(--section-space)]">
                        <Container>
                            <p className="eyebrow">Galeria</p>
                            <h2 className="section-title mt-3">Conheça cada detalhe do empreendimento</h2>
                            <div className="mx-auto mt-8 max-w-6xl">
                                <Gallery items={galleryItems} />
                            </div>
                        </Container>
                    </section>
                    <section className="py-[var(--section-space)]">
                        <Container className="grid gap-12 desktop:grid-cols-2 desktop:items-center">
                            <div>
                                <p className="eyebrow">Localização</p>
                                <h2 className="section-title mt-3">Localização estratégica para facilitar seu dia a dia</h2>
                                <p className="mt-5 text-base font-light leading-[1.7] text-muted desktop:text-lg">Próximo aos principais acessos da cidade, com infraestrutura urbana consolidada e fácil deslocamento para serviços, comércio e lazer.</p>
                                <a className="brand-button mt-7" href={`https://wa.me/${item.whatsapp_contact || '5545999999999'}`}>Falar no WhatsApp</a>
                            </div>
                            <Map latitude={item.latitude == null ? null : Number(item.latitude)} longitude={item.longitude == null ? null : Number(item.longitude)} />
                        </Container>
                    </section>
                    {!isProperty && item.construction_stages?.some((stage) => stage.is_public !== false) && (
                        <section className="bg-surface py-[var(--section-space)]">
                            <Container>
                                <p className="eyebrow">Andamento da obra</p>
                                <h2 className="section-title mt-2">{progressTitleFor(entityType)}</h2>
                                <div className="mt-8 rounded-[18px] border border-line bg-white p-6 shadow-card tablet:p-8">
                                    <ConstructionProgress items={item.construction_stages} completionDate={item.expected_delivery_date} />
                                </div>
                            </Container>
                        </section>
                    )}
                    <section className="py-[var(--section-space)]">
                        <Container className="text-center">
                            <p className="eyebrow">Perguntas frequentes</p>
                            <h2 className="section-title mt-2">Esclareça suas principais dúvidas</h2>
                            <div className="mx-auto mt-7 grid max-w-5xl gap-x-8 text-left tablet:grid-cols-2">
                                {(item.faqs?.length ? item.faqs : [
                                    { id: 1, question: `O ${label.toLowerCase()} possui infraestrutura completa?`, answer: 'Entre em contato com nossa equipe para conhecer todos os detalhes.' },
                                    { id: 2, question: 'Quais são as condições comerciais?', answer: 'Nossa equipe apresentará as opções disponíveis.' },
                                ]).map((faq) => (
                                    <details key={faq.id} className="border-b border-line py-4">
                                        <summary className="cursor-pointer text-sm font-medium text-ink">{faq.question}</summary>
                                        <p className="mt-3 text-sm leading-6 text-muted">{faq.answer}</p>
                                    </details>
                                ))}
                            </div>
                        </Container>
                    </section>
                </>
            )}
        </PublicLayout>
    );
}
