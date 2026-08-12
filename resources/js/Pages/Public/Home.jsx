import { Link } from '@inertiajs/react';
import PublicLayout from '../../Components/Layout/PublicLayout';
import SeoHead from '../../Components/SEO/SeoHead';
import Container from '../../Components/UI/Container';
import Carousel from '../../Components/UI/Carousel';
import EntityCard from '../../Components/RealEstate/EntityCard';
import HeroSearch from '../../Components/RealEstate/HeroSearch';

const SectionIntro = ({ eyebrow, title, description, href, carousel = false, children }) => (
    <section className="py-[var(--section-space)]">
        <Container className="grid gap-10 desktop:grid-cols-[19.5rem_minmax(0,1fr)] desktop:items-center desktop:gap-14">
            <div><p className="eyebrow">{eyebrow}</p><h2 className="section-title mt-3">{title}</h2><p className="mt-5 text-[1rem] font-light leading-[1.65] text-muted desktop:text-[1.125rem]">{description}</p><Link href={href} className="brand-button mt-6">Veja todos</Link></div>
            {carousel ? <Carousel label={title}>{children}</Carousel> : <div className="grid gap-5 tablet:grid-cols-3">{children}</div>}
        </Container>
    </section>
);

export default function Home({ featuredItems = [], properties = [], posts = [] }) {
    return (
        <PublicLayout>
            <SeoHead title="Pascoal Loteamentos" description="Empreendimentos de alto padrão, condomínios e loteamentos planejados para viver melhor." />
            <section className="relative flex min-h-[797px] items-center justify-center overflow-hidden px-5 pt-20 text-center text-white desktop:min-h-[100svh]">
                <img src="/reference-assets/hero-home.jpg" alt="Vista aérea de empreendimentos em Toledo" className="absolute inset-0 h-full w-full object-cover" />
                <div className="hero-overlay absolute inset-0" />
                <div className="relative z-10 w-full">
                    <h1 className="mx-auto max-w-[1000px] text-[2.125rem] font-light leading-[1.08] tracking-[-.02em] tablet:text-[3rem] desktop:text-[3.9375rem]">Encontre o lugar onde sua próxima história começa.</h1>
                    <p className="mx-auto mt-5 max-w-[760px] text-[1.125rem] font-light leading-[1.45] text-white/90 desktop:text-[1.4375rem]">Empreendimentos de alto padrão, condomínios e loteamentos planejados para viver melhor.</p>
                    <HeroSearch types={[{ name: 'Imóveis', slug: 'apartamento' }, { name: 'Condomínios', slug: 'condominio' }, { name: 'Loteamentos', slug: 'terreno' }]} cities={[{ name: 'Toledo', slug: 'toledo' }, { name: 'Palotina', slug: 'palotina' }]} statuses={[{ name: 'Concluído', slug: 'concluido' }, { name: 'Em obras', slug: 'em-obras' }]} />
                </div>
            </section>

            <SectionIntro eyebrow="Destaques" title="Projetos que inspiram" description="Projetos que unem localização estratégica, design e qualidade para transformar vidas." href="/condominios" carousel>
                {featuredItems.map((item) => <EntityCard key={item.href} item={item} href={item.href} compact />)}
            </SectionIntro>

            <section className="grid min-h-[440px] desktop:grid-cols-[1fr_1.05fr]">
                <div className="relative min-h-80 overflow-hidden bg-surface"><img src="/reference-assets/home-building.webp" alt="Maquete de empreendimento Pascoal" className="absolute inset-0 h-full w-full object-cover" /></div>
                <div className="flex items-center bg-white px-[var(--gutter)] py-16 desktop:px-20"><div className="max-w-xl"><p className="eyebrow">Sobre nós</p><h2 className="section-title mt-3">Mais de 30 anos criando espaços que valorizam pessoas.</h2><p className="mt-6 text-base font-light leading-[1.65] text-muted desktop:text-[1.125rem]">Planejamos e desenvolvemos empreendimentos com excelência, responsabilidade e visão de futuro. Nosso compromisso vai além da construção de imóveis: criamos espaços que proporcionam bem-estar, segurança e valorização.</p><Link href="/sobre-nos" className="brand-button mt-7">Conheça nossa história</Link></div></div>
            </section>

            <SectionIntro eyebrow="Imóveis" title="Encontre o imóvel ideal" description="Opções selecionadas para morar ou investir, com localização privilegiada, conforto e excelente potencial de valorização." href="/imoveis">
                {properties.map((item) => <EntityCard key={item.id} item={item} href={`/imoveis/${item.slug}`} priceKey="sale_price" compact />)}
            </SectionIntro>

            <section className="pb-[var(--section-space)]">
                <Container>
                    <div className="text-center"><p className="eyebrow">Diferenciais</p><h2 className="section-title mt-2">Excelência em cada detalhe.</h2></div>
                    <div className="mt-8 grid gap-2 tablet:grid-cols-2 desktop:grid-cols-3">{[
                        ['Arquitetura autoral', 'Projetos exclusivos desenvolvidos para unir estética, funcionalidade e conforto.'],
                        ['Localizações estratégicas', 'Empreendimentos em regiões com alto potencial de valorização.'],
                        ['Sustentabilidade', 'Práticas conscientes e soluções inteligentes para reduzir impactos ambientais.'],
                        ['Alto padrão construtivo', 'Materiais selecionados e processos rigorosos para garantir qualidade.'],
                        ['Equipe especializada', 'Profissionais experientes dedicados a entregar projetos com eficiência.'],
                        ['Atendimento personalizado', 'Relacionamento próximo, transparente e focado em compreender cada cliente.'],
                    ].map(([title, text]) => <article key={title} className="min-h-44 rounded-[7px] bg-brand p-8 text-white transition duration-300 hover:-translate-y-1 hover:bg-brand-dark hover:shadow-card"><h3 className="text-sm font-medium uppercase tracking-[.01em]">{title}</h3><p className="mt-5 text-sm font-light leading-6 text-white/80">{text}</p></article>)}</div>
                </Container>
            </section>

            <section className="bg-surface py-12"><Container className="grid gap-9 text-center tablet:grid-cols-4">{[['+20 anos', 'de experiência no mercado.'], ['+15 Mil', 'clientes satisfeitos.'], ['2 cidades', 'com empreendimentos desenvolvidos.'], ['2 distritos', 'atendidos.']].map(([value, label]) => <div key={value}><strong className="text-[2rem] font-light leading-none text-ink">{value}</strong><p className="mt-3 text-base font-light text-muted">{label}</p></div>)}</Container></section>

            <section className="py-[var(--section-space)]"><Container className="grid gap-10 desktop:grid-cols-[19.5rem_1fr] desktop:gap-14"><div><p className="eyebrow">Blog</p><h2 className="section-title mt-3">Conteúdos que inspiram decisões</h2><Link href="/blog" className="mt-6 inline-block text-sm font-medium uppercase text-brand">Ver todos os artigos →</Link></div><div className="grid gap-[1.875rem] tablet:grid-cols-3">{posts.map((post) => <Link href={`/blog/${post.slug}`} key={post.id} className="group overflow-hidden rounded-card border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-card"><div className="overflow-hidden"><img src={post.featured_media?.url || '/reference-assets/blog-city.jpg'} alt="" className="aspect-[1/.56] w-full object-cover transition duration-500 group-hover:scale-[1.03]" /></div><div className="p-5"><h3 className="text-[1.25rem] font-normal leading-[1.2] text-ink">{post.title}</h3><span className="mt-5 block text-base font-medium uppercase text-brand">Leia mais</span></div></Link>)}</div></Container></section>
        </PublicLayout>
    );
}
