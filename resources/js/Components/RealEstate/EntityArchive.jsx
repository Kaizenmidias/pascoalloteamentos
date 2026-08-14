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
        description: (
            <>
                Explore nossa seleção de casas, apartamentos, salas comerciais,
                <br />
                terrenos e outros imóveis. Encontre a opção perfeita para morar, investir ou expandir seus negócios.
            </>
        ),
        image: '/reference-assets/property-livorno.jpeg',
        overlay: '',
    },
    condominiums: {
        eyebrow: 'CONDOMÍNIOS',
        title: 'Conheça nossos condomínios e encontre seu novo lar',
        description: (
            <>
                Explore condomínios planejados para oferecer conforto, segurança e qualidade de vida.
                <br />
                Encontre o empreendimento ideal para você e sua família.
            </>
        ),
        image: '/reference-assets/condominium-vale.webp',
        overlay: '',
    },
    subdivisions: {
        eyebrow: 'LOTEAMENTOS',
        title: 'Descubra os melhores loteamentos para investir e construir',
        description: (
            <>
                Conheça nossos loteamentos planejados, com infraestrutura completa,
                <br />
                localização estratégica e excelente potencial de valorização.
            </>
        ),
        image: '/reference-assets/subdivision-brisa.jpg',
        overlay: '',
    },
};

export default function EntityArchive({ entity, items, basePath, filters, cities, types, statuses }) {
    const { eyebrow, title, description, image, overlay } = copy[entity];
    const heroTitlePadding = entity === 'subdivisions' ? 'desktop:px-[70px]' : 'desktop:px-0';

    return (
        <PublicLayout>
            <SeoHead title={eyebrow.charAt(0) + eyebrow.slice(1).toLowerCase()} description={description} />
            <section className="relative flex min-h-[600px] items-center overflow-hidden px-5 pt-[80px] text-center text-white">
                <img src={image} alt="Empreendimento residencial" className="absolute inset-0 h-full w-full object-cover" />
                <div className="red-overlay absolute inset-0" />
                {overlay ? <div className={`absolute inset-0 ${overlay}`} /> : null}
                <div className="relative z-10 mx-auto w-full max-w-[80rem] px-5 text-center">
                    <p className="text-base font-light uppercase desktop:text-xl">{eyebrow}</p>
                    <div className={`mx-auto max-w-[80rem] px-0 ${heroTitlePadding}`}>
                        <h1 className="mx-auto mt-3 text-[46px] font-light leading-[1.08] tracking-[-.02em]">{title}</h1>
                        <p className="mx-auto mt-5 text-base font-light leading-7 text-white/90 desktop:text-lg">{description}</p>
                    </div>
                    <HeroSearch action={basePath} filters={filters} cities={cities} types={types} statuses={statuses} />
                </div>
            </section>
            <Container className="py-[var(--section-space)]">
                {items.data.length ? <div className="grid gap-6 tablet:grid-cols-2 desktop:grid-cols-3">{items.data.map((item) => <EntityCard key={item.id} item={item} href={`${basePath}/${item.slug}`} />)}</div> : <EmptyState>Nenhum empreendimento encontrado com os filtros selecionados.</EmptyState>}
                {items.links?.length > 3 && <nav className="mt-10 flex justify-center gap-2">{items.links.map((link, index) => <Link key={index} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`grid min-h-10 min-w-10 place-items-center rounded-md border px-3 text-sm ${link.active ? 'border-brand bg-brand text-white' : 'border-line'}`} />)}</nav>}
            </Container>
        </PublicLayout>
    );
}
