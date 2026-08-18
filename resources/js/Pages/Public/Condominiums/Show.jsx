import PublicLayout from '../../../Components/Layout/PublicLayout';
import Container from '../../../Components/UI/Container';
import Carousel from '../../../Components/UI/Carousel';
import SeoHead from '../../../Components/SEO/SeoHead';
import { AboutSection, DifferentialsGrid, FAQSection, LocationSection, PlansSection, ProductGallery, ProductHero, ProgressSection, WhatsAppCTA, featuredMedia } from '../../../Components/RealEstate/DetailSections';

const fixedFaqs = [
    { id: 'infraestrutura', question: 'O condomínio possui infraestrutura completa?', answer: 'Sim. Os condomínios são planejados para oferecer infraestrutura completa, áreas de lazer, segurança e conforto para os moradores.' },
    { id: 'documentacao', question: 'O empreendimento possui documentação regularizada?', answer: 'Sim. Todos os empreendimentos são desenvolvidos em conformidade com a legislação vigente, garantindo segurança jurídica durante a aquisição.' },
    { id: 'pagamento', question: 'Existem condições facilitadas de pagamento?', answer: 'As condições variam conforme o empreendimento. Nossa equipe comercial apresenta as opções disponíveis e ajuda a encontrar a alternativa mais adequada.' },
    { id: 'entrega', question: 'Qual é a previsão de entrega?', answer: 'Cada condomínio possui um cronograma específico. A previsão e o andamento atualizado da obra são apresentados nesta página.' },
    { id: 'construcao', question: 'Quando será possível iniciar a construção?', answer: 'O início depende do estágio do empreendimento e das liberações aplicáveis. Nossa equipe orienta sobre os prazos de cada condomínio.' },
    { id: 'aquisicao', question: 'Como funciona a documentação após a aquisição?', answer: 'Após a formalização, o comprador recebe a documentação correspondente à modalidade de aquisição, com transparência em todas as etapas.' },
];

function InternalMenu() {
    const links = [['sobre', 'Sobre'], ['diferenciais', 'Diferenciais'], ['promocoes', 'Promoções'], ['galeria', 'Galeria'], ['plantas', 'Plantas'], ['localizacao', 'Localização'], ['andamento', 'Andamento'], ['faq', 'FAQ']];
    return <nav aria-label="Seções do condomínio" className="sticky top-[86px] z-40 border-b border-line bg-white/95 backdrop-blur"><Container className="flex gap-6 overflow-x-auto py-4 text-xs font-medium uppercase [scrollbar-width:none]">{links.map(([id, label]) => <a key={id} href={`#${id}`} className="shrink-0 text-muted transition hover:text-brand">{label}</a>)}</Container></nav>;
}

function PromotionCard({ promotion }) {
    const money = (value) => value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) : null;
    return <article className="grid h-full overflow-hidden rounded-card bg-brand text-white shadow-card tablet:grid-cols-2">{promotion.media_asset && <img src={promotion.media_asset.url} alt={promotion.title} className="h-full min-h-72 w-full object-cover" />}<div className="flex flex-col justify-center p-8"><p className="text-xs uppercase tracking-widest text-white/65">{promotion.product_name}</p><h3 className="mt-3 text-3xl font-normal leading-tight">{promotion.title}</h3>{promotion.text && <p className="mt-5 text-sm leading-7 text-white/80">{promotion.text}</p>}{promotion.original_price && <span className="mt-6 text-sm text-white/55 line-through">{money(promotion.original_price)}</span>}{promotion.promotional_price && <strong className="mt-1 text-3xl font-normal">{money(promotion.promotional_price)}</strong>}{promotion.button_url && <a href={promotion.button_url} className="mt-7 inline-flex w-fit rounded-lg bg-white px-5 py-3 text-xs font-medium uppercase text-brand">{promotion.button_text || 'Conhecer o condomínio'}</a>}</div></article>;
}

function Promotions({ item }) {
    let promotions = (item.promotions || []).filter((promotion) => promotion.is_active !== false && promotion.title);
    if (!promotions.length && (item.promotion_headline || item.promotion_price)) promotions = [{ id: 'legacy', product_name: item.title, title: item.promotion_headline || item.title, original_price: item.starting_price, promotional_price: item.promotion_price, button_text: 'Conhecer o condomínio', button_url: item.promotion_url, media_asset: item.promotion_media }];
    if (!promotions.length) return null;
    return <section id="promocoes" className="py-[var(--section-space)]"><Container><p className="eyebrow">Promoções</p><h2 className="section-title mt-3">Oportunidades em destaque</h2>{promotions.length === 1 ? <div className="mt-10"><PromotionCard promotion={promotions[0]} /></div> : <Carousel label="Promoções" className="mt-10" itemClassName="w-[94%] desktop:w-[82%]">{promotions.map((promotion) => <PromotionCard key={promotion.id} promotion={promotion} />)}</Carousel>}</Container></section>;
}

export default function Show({ item }) {
    const image = featuredMedia(item);
    const facts = [['Área mínima', item.minimum_unit_area && `${Number(item.minimum_unit_area).toLocaleString('pt-BR')} m²`], ['Entrega', item.expected_delivery_date ? new Date(`${item.expected_delivery_date}T12:00:00`).toLocaleDateString('pt-BR') : null], ['Cidade', item.city?.name], ['Status', item.development_status?.name]];
    return <PublicLayout><SeoHead title={item.seo?.title || item.title} description={item.seo?.description || item.excerpt} /><ProductHero item={item} eyebrow="Empreendimento" facts={facts} /><InternalMenu /><AboutSection item={item} label="Sobre o empreendimento" useFeaturedImage /><DifferentialsGrid items={item.features} /><Promotions item={item} /><ProductGallery item={item} title="Conheça cada detalhe do empreendimento" /><PlansSection item={item} carousel /> <LocationSection item={item} />{image && <section aria-label="Imagem do empreendimento" className="h-[300px] bg-cover bg-center tablet:h-[400px] desktop:h-[500px]" style={{ backgroundImage: `url("${image.url}")` }} />}<ProgressSection item={item} /><div id="faq"><FAQSection items={fixedFaqs} /></div><section className="bg-ink py-20 text-center text-white"><Container><h2 className="text-3xl font-normal tablet:text-5xl">Quer conhecer este condomínio?</h2><p className="mx-auto mt-5 max-w-2xl text-white/70">Converse com nossa equipe e receba todas as informações.</p><WhatsAppCTA item={item} className="mt-8" /></Container></section></PublicLayout>;
}
