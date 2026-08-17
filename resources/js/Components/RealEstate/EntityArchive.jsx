import { Link } from '@inertiajs/react';
import PublicLayout from '../Layout/PublicLayout';
import Container from '../UI/Container';
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

export default function EntityArchive({ entity, items, basePath, filters, cities, types, statuses, businessTypes = [] }) {
    const { eyebrow, title, description } = copy[entity];
    return (
        <PublicLayout>
            <SeoHead title={eyebrow.charAt(0) + eyebrow.slice(1).toLowerCase()} description={description} />
            <section className="bg-surface py-10 pt-28">
                <Container className="space-y-8">
                    <div className="max-w-4xl">
                        <p className="eyebrow">{eyebrow}</p>
                        <h1 className="section-title mt-3">{title}</h1>
                        <p className="mt-5 max-w-3xl text-base font-light leading-7 text-muted">{description}</p>
                    </div>
                    <HeroSearch action={basePath} filters={filters} cities={cities} types={types} statuses={statuses} businessTypes={businessTypes} />
                </Container>
            </section>
            <Container className="py-[var(--section-space)]">
                {items.data.length ? <div className="grid gap-6 tablet:grid-cols-2 desktop:grid-cols-3">{items.data.map((item) => <EntityCard key={item.id} item={item} href={`${basePath}/${item.slug}`} />)}</div> : <EmptyState>Nenhum empreendimento encontrado com os filtros selecionados.</EmptyState>}
                {items.links?.length > 3 && <nav className="mt-10 flex justify-center gap-2">{items.links.map((link, index) => <Link key={index} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`grid min-h-10 min-w-10 place-items-center rounded-md border px-3 text-sm ${link.active ? 'border-brand bg-brand text-white' : 'border-line'}`} />)}</nav>}
            </Container>
        </PublicLayout>
    );
}
