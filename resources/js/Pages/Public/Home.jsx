import { Link } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
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

const formatPostDate = (value) => value
    ? new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

function HomeBlogCard({ post }) {
    const publishedAt = formatPostDate(post.published_at);
    const category = post.categories?.[0]?.name;

    return (
        <Link href={`/blog/${post.slug}`} className="group flex min-h-full flex-col overflow-hidden rounded-[14px] border border-line bg-white transition-[border-color,box-shadow] duration-300 hover:border-[#d5d5d5] hover:shadow-[0_6px_18px_rgba(17,17,17,0.06)]">
            <div className="overflow-hidden bg-surface">
                <img src={post.featured_media?.url || '/reference-assets/blog-city.jpg'} alt={post.title} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]" />
            </div>
            <div className="flex flex-1 flex-col px-5 pb-4 pt-5">
                <h3 className="line-clamp-3 min-h-[4.35rem] text-[1.15rem] font-normal leading-[1.28] text-ink">{post.title}</h3>
                <span className="mt-5 text-xs font-medium uppercase tracking-[.05em] text-brand">Leia mais</span>
                {(publishedAt || category) && (
                    <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-line pt-4 text-[.7rem] font-light text-muted">
                        {publishedAt && <time dateTime={post.published_at}>{publishedAt}</time>}
                        {publishedAt && category && <span aria-hidden="true">&bull;</span>}
                        {category && <span>{category}</span>}
                    </div>
                )}
            </div>
        </Link>
    );
}

function HomeHero({ slides = [], hero = {} }) {
    const items = slides.length ? slides : [{ title: hero.title || defaultHero.title, excerpt: hero.description || defaultHero.description, media_assets: [] }];
    const [active, setActive] = useState(0);
    const [reducedMotion, setReducedMotion] = useState(false);
    const touchStart = useRef(null);
    const activeItem = items[active] || items[0];
    const managedSlide = Object.prototype.hasOwnProperty.call(activeItem, 'is_active');

    useEffect(() => {
        setActive((current) => Math.min(current, Math.max(0, items.length - 1)));
    }, [items.length]);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReducedMotion(query.matches);
        update();
        query.addEventListener?.('change', update);
        return () => query.removeEventListener?.('change', update);
    }, []);

    useEffect(() => {
        if (items.length < 2 || reducedMotion) return undefined;
        const timer = window.setTimeout(() => setActive((current) => (current + 1) % items.length), 4000);
        return () => window.clearTimeout(timer);
    }, [active, items.length, reducedMotion]);

    const move = (direction) => setActive((current) => (current + direction + items.length) % items.length);
    const finishSwipe = (event) => {
        if (touchStart.current === null) return;
        const distance = event.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(distance) > 45) move(distance < 0 ? 1 : -1);
        touchStart.current = null;
    };

    return (
        <section
            className="relative overflow-hidden text-white"
            onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
            onTouchEnd={finishSwipe}
        >
            <div className="relative min-h-[75svh]">
                {items.map((item, index) => (
                    <picture key={item.media_id || item.id || item.image || index}>
                        {item.mobile_image && <source media="(max-width: 767px)" srcSet={item.mobile_image} />}
                        <img
                            src={item.image || item.media_assets?.[0]?.url || '/reference-assets/hero-home.jpg'}
                            alt={item.title || 'Empreendimento'}
                            className={['absolute inset-0 h-full w-full object-cover transition-opacity', reducedMotion ? 'duration-0' : 'duration-500', index === active ? 'opacity-100' : 'opacity-0'].join(' ')}
                        />
                    </picture>
                ))}
                <div className="hero-overlay absolute inset-0" />
                <div className="relative z-10 mx-auto flex min-h-[75svh] max-w-[80rem] items-center px-5 pt-20 text-center">
                    <div className="mx-auto max-w-[980px]" aria-live="off">
                        <h1 className="mx-auto max-w-[1120px] text-[2.125rem] font-light leading-[1.06] tracking-[-.025em] tablet:text-[3.25rem] desktop:text-[clamp(3.75rem,4.1vw,4.25rem)]">{(managedSlide && activeItem.title) || hero.title || defaultHero.title}</h1>
                        <p className="mx-auto mt-5 max-w-[760px] text-[1.125rem] font-light leading-[1.45] text-white/90 desktop:text-[1.4375rem]">{(managedSlide && activeItem.excerpt) || hero.description || defaultHero.description}</p>
                        {managedSlide && activeItem.button_text && activeItem.button_url && <Link href={activeItem.button_url} className="brand-button mt-7 inline-flex">{activeItem.button_text}</Link>}
                    </div>
                </div>
                {items.length > 1 && (
                    <>
                        <button type="button" onClick={() => move(-1)} aria-label="Slide anterior" className="absolute left-4 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-2xl text-white backdrop-blur-sm transition hover:bg-black/50">&#8249;</button>
                        <button type="button" onClick={() => move(1)} aria-label="Próximo slide" className="absolute right-4 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-2xl text-white backdrop-blur-sm transition hover:bg-black/50">&#8250;</button>
                    </>
                )}
                <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center gap-2">
                    {items.map((_, index) => <button key={index} type="button" aria-label={'Ir para slide ' + (index + 1)} onClick={() => setActive(index)} className={['h-2.5 rounded-full transition-all', index === active ? 'w-8 bg-white' : 'w-2.5 bg-white/50'].join(' ')} />)}
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
                <Container className="grid items-start gap-9 desktop:grid-cols-[minmax(220px,25%)_minmax(0,75%)] desktop:gap-10">
                    <div className="desktop:sticky desktop:top-32">
                        <p className="eyebrow">Blog</p>
                        <h2 className="mt-3 max-w-[18rem] text-[clamp(2rem,3.4vw,46px)] font-light leading-[1.08] tracking-[-.025em] text-ink">Conteúdos que inspiram decisões</h2>
                        <Link href="/blog" className="mt-7 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[.055em] text-brand transition-colors hover:text-brand-dark">Ver todos os artigos <span aria-hidden="true">&rarr;</span></Link>
                    </div>
                    <div className="grid gap-5 tablet:grid-cols-2 desktop:grid-cols-3">
                        {posts.slice(0, 3).map((post) => <HomeBlogCard key={post.id} post={post} />)}
                    </div>
                </Container>
            </section>
        </PublicLayout>
    );
}
