import { Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import PublicLayout from '../../Components/Layout/PublicLayout';
import SeoHead from '../../Components/SEO/SeoHead';
import Container from '../../Components/UI/Container';
import Carousel from '../../Components/UI/Carousel';
import EntityCard from '../../Components/RealEstate/EntityCard';
import HeroSearch from '../../Components/RealEstate/HeroSearch';

const defaultHero = {
    title: 'Encontre o lugar onde sua próxima história começa.',
    description: 'Empreendimentos de alto padrão, condomínios e loteamentos planejados para viver melhor.',
};

function HomeHero({ slides = [], hero = {} }) {
    const items = slides.length ? slides.slice(0, 5) : [{ title: hero.title || defaultHero.title, excerpt: hero.description || defaultHero.description, media_assets: [] }];
    const [active, setActive] = useState(0);

    return (
        <section className="relative overflow-hidden text-white">
            <div className="relative min-h-[75svh]">
                {items.map((item, index) => (
                    <img
                        key={item.id || index}
                        src={item.image || item.media_assets?.[0]?.url || '/reference-assets/hero-home.jpg'}
                        alt={item.title || 'Empreendimento'}
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === active ? 'opacity-100' : 'opacity-0'}`}
                    />
                ))}
                <div className="hero-overlay absolute inset-0" />
                <div className="relative z-10 mx-auto flex min-h-[75svh] max-w-[80rem] items-center px-5 pt-20 text-center">
                    <div className="mx-auto max-w-[980px]">
                        <h1 className="mx-auto max-w-[1000px] text-[2.125rem] font-light leading-[1.08] tracking-[-.02em] tablet:text-[3rem] desktop:text-[3.9375rem]">{hero.title || defaultHero.title}</h1>
                        <p className="mx-auto mt-5 max-w-[760px] text-[1.125rem] font-light leading-[1.45] text-white/90 desktop:text-[1.4375rem]">{hero.description || defaultHero.description}</p>
                    </div>
                </div>
                <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center gap-2">
                    {items.map((_, index) => <button key={index} type="button" aria-label={`Ir para slide ${index + 1}`} onClick={() => setActive(index)} className={`h-2.5 rounded-full transition-all ${index === active ? 'w-8 bg-white' : 'w-2.5 bg-white/50'}`} />)}
                </div>
            </div>
        </section>
    );
}

export default function Home({ featuredItems = [], properties = [], posts = [], homeNumbers = [], homeHero = null, homeDifferentials = [] }) {
    const { props } = usePage();
    const realEstate = props.realEstate || {};
    const [filters, setFilters] = useState({ category: '', city: '', type: '', status: '', business_type: '' });
    const safeDifferentials = Array.isArray(homeDifferentials) ? homeDifferentials : [];
    const safeNumbers = Array.isArray(homeNumbers) ? homeNumbers : [];

    const categories = [
        { name: 'Condomínios de Lotes', slug: 'condominiums' },
        { name: 'Loteamentos', slug: 'subdivisions' },
        { name: 'Imóveis', slug: 'properties' },
    ];

    const previewItems = useMemo(() => {
        let items = [...featuredItems, ...properties];
        if (filters.category === 'condominiums') items = items.filter((item) => String(item.href || '').includes('/condominios'));
        if (filters.category === 'subdivisions') items = items.filter((item) => String(item.href || '').includes('/loteamentos'));
        if (filters.category === 'properties') items = items.filter((item) => String(item.href || '').includes('/imoveis'));
        if (filters.city) items = items.filter((item) => item.city?.slug === filters.city);
        if (filters.type) items = items.filter((item) => item.property_type?.slug === filters.type || item.condominium_type?.slug === filters.type || item.subdivision_type?.slug === filters.type);
        if (filters.status) items = items.filter((item) => item.development_status?.slug === filters.status);
        return items.slice(0, 8);
    }, [featuredItems, filters, properties]);

    const numbers = safeNumbers.length ? safeNumbers : [
        { value: '20+', title: 'Anos de experiência', description: 'de atuação no mercado.' },
        { value: '15+', title: 'Empreendimentos', description: 'entregues com excelência.' },
        { value: '2+', title: 'Cidades', description: 'com presença consolidada.' },
        { value: '2', title: 'Distritos', description: 'atendidos pela empresa.' },
    ];

    return (
        <PublicLayout>
            <SeoHead title="Pascoal Loteamentos" description="Empreendimentos de alto padrão, condomínios e loteamentos planejados para viver melhor." />
            <HomeHero slides={Array.isArray(homeHero?.slides) && homeHero.slides.length ? homeHero.slides : featuredItems} hero={homeHero || defaultHero} />

            <section className="py-8">
                <Container>
                    <HeroSearch
                        action="/imoveis"
                        includeCategory
                        compact
                        autoSubmit={false}
                        categories={categories}
                        cities={realEstate.cities || []}
                        types={[...(realEstate.propertyTypes || []), ...(realEstate.condominiumTypes || []), ...(realEstate.subdivisionTypes || [])]}
                        statuses={realEstate.statuses || []}
                        businessTypes={realEstate.businessTypes || []}
                        onChange={setFilters}
                    />
                </Container>
            </section>

            <section className="pb-[var(--section-space)]">
                <Container>
                    {previewItems.length ? (
                        <Carousel label="Empreendimentos em destaque">
                            {previewItems.map((item) => <EntityCard key={item.href || item.id} item={item} href={item.href || `/imoveis/${item.slug}`} compact />)}
                        </Carousel>
                    ) : (
                        <div className="rounded-card border border-line bg-white p-8 text-center text-muted">Nenhum empreendimento encontrado para os filtros selecionados.</div>
                    )}
                </Container>
            </section>

            <section className="pb-[var(--section-space)]">
                <Container>
                    <div className="text-center">
                        <p className="eyebrow">Diferenciais</p>
                        <h2 className="section-title mt-2">Excelência em cada detalhe.</h2>
                        <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-muted">Projetos exclusivos pensados para unir qualidade, valorização e bem-estar em cada detalhe.</p>
                    </div>
                    <div className="mt-8 grid gap-2 tablet:grid-cols-2 desktop:grid-cols-3">{(safeDifferentials.length ? safeDifferentials : [
                        ['Arquitetura autoral', 'Projetos exclusivos desenvolvidos para unir estética, funcionalidade e conforto.'],
                        ['Localizações estratégicas', 'Empreendimentos em regiões com alto potencial de valorização.'],
                        ['Sustentabilidade', 'Práticas conscientes e soluções inteligentes para reduzir impactos ambientais.'],
                        ['Alto padrão construtivo', 'Materiais selecionados e processos rigorosos para garantir qualidade.'],
                        ['Equipe especializada', 'Profissionais experientes dedicados a entregar projetos com eficiência.'],
                        ['Atendimento personalizado', 'Relacionamento próximo, transparente e focado em compreender cada cliente.'],
                    ]).map((item) => Array.isArray(item) ? <article key={item[0]} className="min-h-44 rounded-[7px] bg-brand p-8 text-white transition duration-300 hover:-translate-y-1 hover:bg-brand-dark hover:shadow-card"><h3 className="text-sm font-medium uppercase tracking-[.01em]">{item[0]}</h3><p className="mt-5 text-sm font-light leading-6 text-white/80">{item[1]}</p></article> : <article key={item.title} className="min-h-44 rounded-[7px] bg-brand p-8 text-white transition duration-300 hover:-translate-y-1 hover:bg-brand-dark hover:shadow-card"><h3 className="text-sm font-medium uppercase tracking-[.01em]">{item.title}</h3><p className="mt-5 text-sm font-light leading-6 text-white/80">{item.text}</p></article>)}</div>
                </Container>
            </section>

            <section className="bg-surface py-12">
                <Container className="grid gap-9 text-center tablet:grid-cols-4">
                    {numbers.map((item, index) => (
                        <div key={item.id || index}>
                            <strong className="text-[2rem] font-light leading-none text-ink">{item.value}</strong>
                            <p className="mt-3 text-base font-medium text-ink">{item.title}</p>
                            {item.description && <p className="mt-1 text-sm font-light text-muted">{item.description}</p>}
                        </div>
                    ))}
                </Container>
            </section>

            <section className="py-[var(--section-space)]">
                <Container className="grid gap-10 desktop:grid-cols-[41%_59%] desktop:gap-14">
                    <div>
                        <p className="eyebrow">Blog</p>
                        <h2 className="section-title mt-3">Conteúdos que inspiram decisões</h2>
                        <Link href="/blog" className="mt-6 inline-block text-sm font-medium uppercase text-brand">Ver todos os artigos →</Link>
                    </div>
                    <div className="grid gap-[1.875rem] tablet:grid-cols-3">{posts.map((post) => <Link href={`/blog/${post.slug}`} key={post.id} className="group overflow-hidden rounded-card border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-card"><div className="overflow-hidden"><img src={post.featured_media?.url || '/reference-assets/blog-city.jpg'} alt="" className="aspect-[1/.56] w-full object-cover transition duration-500 group-hover:scale-[1.03]" /></div><div className="p-5"><h3 className="text-[1.25rem] font-normal leading-[1.2] text-ink">{post.title}</h3><span className="mt-5 block text-base font-medium uppercase text-brand">Leia mais</span></div></Link>)}</div>
                </Container>
            </section>
        </PublicLayout>
    );
}
