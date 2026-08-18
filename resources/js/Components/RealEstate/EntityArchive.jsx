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
            <section className="bg-white pt-28">
                <Container className="space-y-6">
                    <div className="mx-auto max-w-4xl text-center">
                        <p className="eyebrow">{eyebrow}</p>
                        <h1 className="section-title mt-3">{title}</h1>
                        <span className="mx-auto mt-3 block h-px w-16 bg-brand" />
                        <p className="mx-auto mt-5 max-w-3xl text-base font-light leading-7 text-muted">{description}</p>
                    </div>
                    <HeroSearch action={basePath} entity={entity} filters={filters} cities={cities} types={types} statuses={statuses} />
                </Container>
            </section>
            <Container className="py-[var(--section-space)]">
                {items.data.length ? (
                    <Carousel key={`${entity}-${filters.city || ''}-${filters.status || ''}-${filters.type || ''}`} label="Resultados da busca">
                        {items.data.map((item) => (
                            <EntityCard key={item.id} item={item} href={`${basePath}/${item.slug}`} />
                        ))}
                    </Carousel>
                ) : (
                    <EmptyState title="Nenhum empreendimento encontrado" actionLabel="Limpar filtros" onAction={() => router.get(basePath, {}, { preserveScroll: true, replace: true })}>Tente selecionar outra cidade, status ou tipo.</EmptyState>
                )}
                {items.links?.length > 3 && <nav className="mt-10 flex justify-center gap-2">{items.links.map((link, index) => <Link key={index} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`grid min-h-10 min-w-10 place-items-center rounded-md border px-3 text-sm ${link.active ? 'border-brand bg-brand text-white' : 'border-line'}`} />)}</nav>}
            </Container>
        </PublicLayout>
    );
}
