import { Link, router } from '@inertiajs/react';
import PublicLayout from '../Layout/PublicLayout';
import Container from '../UI/Container';
import Carousel from '../UI/Carousel';
import EmptyState from '../UI/EmptyState';
import SeoHead from '../SEO/SeoHead';
import EntityCard from './EntityCard';
import HeroSearch from './HeroSearch';

const copy = {
    properties: {
        eyebrow: 'IMÓVEIS',
        title: 'Encontre o imóvel ideal para o seu estilo de vida',
        description: 'Explore nossa seleção de casas, apartamentos, salas comerciais e terrenos.',
    },
    condominiums: {
        eyebrow: 'CONDOMÍNIOS',
        title: 'Conheça nossos condomínios e encontre seu novo lar',
        description: 'Explore condomínios planejados para oferecer conforto, segurança e qualidade de vida.',
    },
    subdivisions: {
        eyebrow: 'LOTEAMENTOS',
        title: 'Descubra os melhores loteamentos para investir e construir',
        description: 'Conheça nossos loteamentos planejados, com infraestrutura completa e excelente potencial de valorização.',
    },
};

export default function EntityArchive({ entity, items, basePath, filters, cities, types, statuses, businessTypes = [], pageCms = null }) {
    const fallback = copy[entity];
    const heroSection = pageCms?.sections?.find((section) => section.type === 'hero' || section.type === 'filter') || null;
    const { eyebrow, title, description } = {
        eyebrow: heroSection?.data?.subtitle || fallback.eyebrow,
        title: heroSection?.data?.title || fallback.title,
        description: heroSection?.data?.content || fallback.description,
    };

    return (
        <PublicLayout>
            <SeoHead title={pageCms?.seo?.title || (eyebrow.charAt(0) + eyebrow.slice(1).toLowerCase())} description={pageCms?.seo?.description || description} />
            <section className="bg-white pt-[160px]">
                <Container className="space-y-5">
                    <div className="mx-auto max-w-[75rem] text-center">
                        <p className="eyebrow">{eyebrow}</p>
                        <h1 className="mt-3 text-[clamp(2.4rem,4vw,3.25rem)] font-light leading-[1.08] tracking-[-.02em] text-ink desktop:text-[52px]">{title}</h1>
                        <p className="mx-auto mt-4 max-w-[60rem] text-[1.125rem] font-light leading-[1.7] text-muted tablet:text-[1.25rem] desktop:text-[20px]">{description}</p>
                        <span className="mx-auto mt-6 block h-px w-[5.5rem] bg-line" />
                    </div>
                    <HeroSearch action={basePath} entity={entity} filters={filters} cities={cities} types={types} statuses={statuses} />
                </Container>
            </section>
            <Container className="pb-[var(--section-space)] pt-6">
                {items.data.length ? (
                    <Carousel key={`${entity}-${filters.city || ''}-${filters.status || ''}-${filters.type || ''}`} label="Resultados da busca">
                        {items.data.map((item) => (
                            <EntityCard key={item.id} item={item} href={`${basePath}/${item.slug}`} />
                        ))}
                    </Carousel>
                ) : (
                    <EmptyState title="Nenhum empreendimento encontrado" actionLabel="Limpar filtros" onAction={() => router.get(basePath, {}, { preserveScroll: true, replace: true })}>Tente selecionar outra cidade, status ou tipo.</EmptyState>
                )}
                {items.links?.length > 3 && <nav className="mt-10 flex justify-center gap-2">{items.links.map((link, index) => link.url ? <Link key={index} href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} className={`grid min-h-10 min-w-10 place-items-center rounded-md border px-3 text-sm ${link.active ? 'border-brand bg-brand text-white' : 'border-line'}`} /> : <span key={index} className="grid min-h-10 min-w-10 place-items-center rounded-md border border-line px-3 text-sm text-muted/40" dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>}
            </Container>
        </PublicLayout>
    );
}
