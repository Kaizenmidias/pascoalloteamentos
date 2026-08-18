import PublicLayout from '../../../Components/Layout/PublicLayout';
import SeoHead from '../../../Components/SEO/SeoHead';
import { AboutSection, DifferentialsGrid, FAQSection, LocationSection, PlansSection, ProductGallery, ProductHero, ProgressSection, PromotionSection } from '../../../Components/RealEstate/DetailSections';

export default function Show({ item }) {
    const facts = [
        ['Área mínima', item.minimum_unit_area && `${Number(item.minimum_unit_area).toLocaleString('pt-BR')} m²`],
        ['Entrega', item.expected_delivery_date ? new Date(`${item.expected_delivery_date}T12:00:00`).toLocaleDateString('pt-BR') : null],
        ['Cidade', item.city?.name],
        ['Status', item.development_status?.name],
    ];

    return <PublicLayout>
        <SeoHead title={item.seo?.title || item.title} description={item.seo?.description || item.excerpt} />
        <ProductHero item={item} eyebrow="Empreendimento" facts={facts} />
        <AboutSection item={item} label="Sobre o empreendimento" />
        <DifferentialsGrid items={item.features} />
        <PromotionSection item={item} />
        <ProductGallery item={item} title="Conheça cada detalhe do empreendimento" />
        <PlansSection item={item} />
        <LocationSection item={item} />
        <ProgressSection item={item} />
        <FAQSection items={item.faqs} />
    </PublicLayout>;
}
