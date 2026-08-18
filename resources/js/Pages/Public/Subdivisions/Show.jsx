import PublicLayout from '../../../Components/Layout/PublicLayout';
import SeoHead from '../../../Components/SEO/SeoHead';
import { AboutSection, DifferentialsGrid, DocumentsSection, FAQSection, LocationSection, ProductGallery, ProductHero, ProgressSection, PromotionSection } from '../../../Components/RealEstate/DetailSections';

export default function Show({ item }) {
    const facts = [
        ['Total de lotes', item.total_lots],
        ['Lotes disponíveis', item.available_lots],
        ['Área mínima', item.minimum_lot_area && `${Number(item.minimum_lot_area).toLocaleString('pt-BR')} m²`],
        ['Área máxima', item.maximum_lot_area && `${Number(item.maximum_lot_area).toLocaleString('pt-BR')} m²`],
    ];
    return <PublicLayout>
        <SeoHead title={item.seo?.title || item.title} description={item.seo?.description || item.excerpt} />
        <ProductHero item={item} eyebrow="Loteamentos" facts={facts} />
        <AboutSection item={item} label="Loteamentos" />
        <DifferentialsGrid items={item.features} />
        <PromotionSection item={item} areaLabel="Lotes a partir de" />
        <DocumentsSection documents={item.documents} />
        <LocationSection item={item} />
        <ProgressSection item={item} />
        <ProductGallery item={item} title="Conheça cada detalhe do loteamento" />
        <FAQSection items={item.faqs} />
    </PublicLayout>;
}
