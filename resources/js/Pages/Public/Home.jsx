import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import PublicLayout from '../../Components/Layout/PublicLayout';
import SeoHead from '../../Components/SEO/SeoHead';
import Container from '../../Components/UI/Container';
import Carousel from '../../Components/UI/Carousel';
import EntityCard from '../../Components/RealEstate/EntityCard';
import HomeEntityFilter from '../../Components/RealEstate/HomeEntityFilter';
import EmptyState from '../../Components/UI/EmptyState';

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
                        <h1 className="mx-auto max-w-[1120px] text-[2.125rem] font-light leading-[1.06] tracking-[-.025em] tablet:text-[3.25rem] desktop:text-[clamp(3.75rem,4.1vw,4.25rem)]">{hero.title || defaultHero.title}</h1>
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

export default function Home({ featuredItems = [], homeEntities = [], posts = [], homeNumbers = [], homeHero = null, homeDifferentials = [] }) {
    const [filters, setFilters] = useState({ category: 'condominiums', cityId: '' });
    const safeDifferentials = Array.isArray(homeDifferentials) ? homeDifferentials : [];
    const safeNumbers = Array.isArray(homeNumbers) ? homeNumbers : [];

    const categories = [
        { name: 'Condomínios de Lotes', slug: 'condominiums' },
        { name: 'Loteamentos', slug: 'subdivisions' },
        { name: 'Imóveis', slug: 'properties' },
    ];

    const previewItems = useMemo(() => {
        let items = homeEntities.filter((item) => !filters.category || item.category === filters.category);
        if (filters.cityId) items = items.filter((item) => String(item.city?.id) === String(filters.cityId));
        return items;
    }, [filters, homeEntities]);

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
                    <HomeEntityFilter
                        categories={categories}
                        items={homeEntities}
                        onChange={setFilters}
                    />
                </Container>
            </section>

            <section className="pb-[var(--section-space)]">
                <Container>
                    {previewItems.length ? (
                        <Carousel key={`${filters.category}-${filters.cityId}`} label="Empreendimentos em destaque">
                            {previewItems.map((item) => <EntityCard key={`${item.category}-${item.id}`} item={item} href={item.href} />)}
                        </Carousel>
                    ) : (
                        <EmptyState title="Nenhum empreendimento encontrado">Tente selecionar outra categoria ou cidade.</EmptyState>
                    )}
                </Container>
            </section>

            <section className="pb-[var(--section-space)]">
                <Container>
                    <div className="text-center">
                        <p className="eyebrow">Diferenciais</p>
                        <h2 className="section-title mt-2">Excelência em cada detalhe.</h2>
                        <p className="mx-auto mt-5 max-w-4xl text-base leading-8 text-muted">Projetos exclusivos pensados para unir qualidade, valorização e bem-estar em cada detalhe.</p>
                    </div>
                    <div className="mt-8 grid gap-2 tablet:grid-cols-2 desktop:grid-cols-3">{(safeDifferentials.length ? safeDifferentials : [
                        ['Arquitetura autoral', 'Projetos exclusivos desenvolvidos para unir estética, funcionalidade e conforto.'],
                        ['Localizações estratégicas', 'Empreendimentos em regiões com alto potencial de valorização.'],
                        ['Sustentabilidade', 'Práticas conscientes e soluções inteligentes para reduzir impactos ambientais.'],
                        ['Alto padrão construtivo', 'Materiais selecionados e processos rigorosos para garantir qualidade.'],
                        ['Equipe especializada', 'Profissionais experientes dedicados a entregar projetos com eficiência.'],
                        ['Atendimento personalizado', 'Relacionamento próximo, transparente e focado em compreender cada cliente.'],
                    ]).map((item) => Array.isArray(item) ? <article key={item[0]} className="min-h-44 rounded-[7px] bg-brand p-8 text-white shadow-[0_4px_12px_rgba(17,17,17,0.05)] transition-[box-shadow,background-color,border-color] duration-300 hover:bg-brand-dark hover:shadow-[0_6px_16px_rgba(17,17,17,0.07)]"><h3 className="text-sm font-medium uppercase tracking-[.01em]">{item[0]}</h3><p className="mt-5 text-sm font-light leading-6 text-white/80">{item[1]}</p></article> : <article key={item.title} className="min-h-44 rounded-[7px] bg-brand p-8 text-white shadow-[0_4px_12px_rgba(17,17,17,0.05)] transition-[box-shadow,background-color,border-color] duration-300 hover:bg-brand-dark hover:shadow-[0_6px_16px_rgba(17,17,17,0.07)]"><h3 className="text-sm font-medium uppercase tracking-[.01em]">{item.title}</h3><p className="mt-5 text-sm font-light leading-6 text-white/80">{item.text}</p></article>)}</div>
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
                    <div className="grid gap-[1.875rem] tablet:grid-cols-3">{posts.map((post) => <Link href={`/blog/${post.slug}`} key={post.id} className="group overflow-hidden rounded-card border border-line bg-white shadow-[0_4px_12px_rgba(17,17,17,0.05)] transition-[box-shadow,border-color] duration-300 hover:border-[#d9d9d9] hover:shadow-[0_6px_16px_rgba(17,17,17,0.07)]"><div className="overflow-hidden"><img src={post.featured_media?.url || '/reference-assets/blog-city.jpg'} alt="" className="aspect-[1/.56] w-full object-cover transition duration-500 group-hover:scale-[1.03]" /></div><div className="p-5"><h3 className="text-[1.25rem] font-normal leading-[1.2] text-ink">{post.title}</h3><span className="mt-5 block text-base font-medium uppercase text-brand">Leia mais</span></div></Link>)}</div>
                </Container>
            </section>
        </PublicLayout>
    );
}
