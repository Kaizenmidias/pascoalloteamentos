import { Link } from '@inertiajs/react';
import PublicLayout from '../../../Components/Layout/PublicLayout';
import SeoHead from '../../../Components/SEO/SeoHead';
import Container from '../../../Components/UI/Container';
import LeadForm from '../../../Components/RealEstate/LeadForm';

const fallbackAbout = [
    {
        type: 'hero',
        label: 'Hero',
        title: 'Construindo cidades, realizando sonhos e deixando um legado para as próximas gerações.',
        content: 'Descubra empreendimentos inovadores, feitos com cuidado e com alto padrão, que valorizam a arte, a natureza e a funcionalidade.',
        image: '/reference-assets/hero-home.jpg',
    },
    {
        type: 'history',
        label: 'História',
        title: 'Uma história construída com trabalho, confiança e visão de futuro.',
        content: 'A Pascoal Loteamentos nasceu em 2002, idealizada pelos irmãos Edson Pascoal e Hudson Paes Pascoal, com o propósito de desenvolver empreendimentos que transformam vidas e contribuem para o crescimento das cidades.\n\nAo longo de mais de 20 anos de atuação, a empresa consolidou sua presença na região, conquistando a confiança de clientes, investidores e parceiros por meio de um trabalho pautado na transparência, credibilidade e excelência.',
        image: '/reference-assets/about-team.webp',
    },
    {
        type: 'history',
        label: 'Crescimento',
        title: 'Crescimento que gera desenvolvimento',
        content: 'O compromisso com a qualidade fez da Pascoal uma referência regional no desenvolvimento de loteamentos e empreendimentos imobiliários. Nossa atuação já contribuiu para a expansão urbana de diversas regiões.\n\nCada empreendimento é pensado para oferecer segurança, infraestrutura completa, excelente localização e potencial de valorização.',
        image: '/reference-assets/about-engineer.webp',
    },
];

const fallbackContact = [
    {
        type: 'hero',
        label: 'Hero',
        title: 'Estamos prontos para ajudar você a encontrar o empreendimento ideal.',
        content: 'Nossa equipe está à disposição para esclarecer dúvidas, apresentar oportunidades e oferecer o suporte necessário para que você faça um investimento com segurança e tranquilidade.',
        image: '/reference-assets/hero-contact.webp',
    },
];

function SectionRenderer({ section, kind }) {
    if (!section) return null;
    const type = section.type || 'content';
    const data = section.data || section;

    if (!section.is_active && section.is_active !== undefined) return null;

    if (type === 'hero') {
        return (
            <section className="relative flex min-h-[600px] items-center overflow-hidden px-5 pt-[80px] text-center text-white">
                <img src={data.image || (kind === 'contact' ? '/reference-assets/hero-contact.webp' : '/reference-assets/hero-home.jpg')} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="red-overlay absolute inset-0" />
                <div className="relative z-10 mx-auto w-full max-w-[80rem]">
                    {data.subtitle && <p className="eyebrow mx-auto mb-3 text-white/80">{data.subtitle}</p>}
                    <h1 className="mx-auto max-w-[80rem] text-[46px] font-light leading-[1.12] tracking-[-.015em]">{data.title}</h1>
                    {data.content && <p className="mx-auto mt-5 max-w-[80rem] text-base font-light leading-7 text-white/90 desktop:text-lg">{data.content}</p>}
                </div>
            </section>
        );
    }

    if (type === 'history' || type === 'content') {
        return (
            <section className="py-[var(--section-space)]">
                <Container className="grid gap-10 desktop:grid-cols-2 desktop:items-center">
                    {data.image && <img src={data.image} alt={data.title || ''} className="mx-auto max-h-[480px] rounded-card object-cover" />}
                    <div>
                        {data.label && <p className="eyebrow">{data.label}</p>}
                        {data.title && <h2 className="section-title mt-2">{data.title}</h2>}
                        {data.content && <p className="mt-5 whitespace-pre-line text-sm leading-6 text-muted">{data.content}</p>}
                    </div>
                </Container>
            </section>
        );
    }

    if (type === 'institucional') {
        const blocks = Array.isArray(data.content) ? data.content : [];
        return (
            <section className="grid gap-4 py-[var(--section-space)] tablet:grid-cols-3">
                {blocks.map((block) => (
                    <article key={block.title} className="group relative min-h-[24rem] overflow-hidden rounded-card shadow-card">
                        <img src={block.image || '/reference-assets/blog-city.jpg'} alt={block.title || ''} className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition duration-500 ease-out" />
                        <div className="absolute inset-x-0 bottom-0 z-10 p-6 tablet:p-7">
                            <span className="text-sm font-medium uppercase tracking-[0.08em] text-white">{block.title}</span>
                            <div className="mt-3 h-px w-10 bg-brand" />
                            <p className="mt-4 max-w-[22rem] text-sm leading-6 text-white/90">{block.text}</p>
                        </div>
                    </article>
                ))}
            </section>
        );
    }

    if (type === 'contact-data') {
        return (
            <section className="py-14">
                <Container className="grid gap-8 tablet:grid-cols-3">
                    {(Array.isArray(data.content) ? data.content : []).map(([title, text]) => (
                        <div key={title}>
                            <h2 className="text-xs font-bold uppercase text-ink">{title}</h2>
                            <span className="my-3 block h-px w-14 bg-brand" />
                            <p className="whitespace-pre-line text-sm leading-6 text-muted">{text}</p>
                        </div>
                    ))}
                </Container>
            </section>
        );
    }

    if (type === 'contact-form') {
        return (
            <section className="py-[var(--section-space)]">
                <Container className="grid gap-12 desktop:grid-cols-[1fr_1.1fr] desktop:items-start">
                    <div>
                        {data.title && <h2 className="section-title">{data.title}</h2>}
                        {data.content && <p className="mt-4 max-w-lg text-sm leading-6 text-muted">{data.content}</p>}
                        {data.subtitle && <h3 className="mt-8 text-xs font-bold uppercase text-ink">{data.subtitle}</h3>}
                        <span className="my-3 block h-px w-20 bg-brand" />
                        <div className="grid gap-5 text-sm text-muted tablet:grid-cols-2">
                            {(Array.isArray(data.content_blocks) ? data.content_blocks : []).map((row) => (
                                <p key={row.title}>{row.title}<br />{row.text}</p>
                            ))}
                        </div>
                    </div>
                    <LeadForm title={data.button_label || 'Envie sua mensagem'} />
                </Container>
            </section>
        );
    }

    if (type === 'cta') {
        return (
            <section className="bg-surface py-16 text-center">
                <Container>
                    {data.title && <h2 className="mx-auto max-w-2xl text-3xl font-normal text-brand">{data.title}</h2>}
                    {data.content && <p className="mx-auto mt-4 max-w-2xl text-sm text-muted">{data.content}</p>}
                    {data.button_label && data.button_url && <Link href={data.button_url} className="brand-button mt-6 inline-flex">{data.button_label}</Link>}
                </Container>
            </section>
        );
    }

    return null;
}

function About({ page }) {
    const sections = page?.sections?.length ? page.sections : fallbackAbout;

    return (
        <>
            {sections.map((section, index) => <SectionRenderer key={section.id || `${section.type}-${index}`} section={section} kind="about" />)}
            <section className="bg-surface py-16 text-center">
                <Container>
                    <h2 className="mx-auto max-w-2xl text-3xl font-normal text-brand">Vamos construir o próximo capítulo dessa história juntos.</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm text-muted">Conheça nossos projetos e encontre o lugar ideal para viver ou investir.</p>
                    <a href="/imoveis" className="brand-button mt-6 inline-flex">Conheça nossos empreendimentos</a>
                </Container>
            </section>
        </>
    );
}

function Contact({ page }) {
    const sections = page?.sections?.length ? page.sections : fallbackContact;

    return (
        <>
            {sections.map((section, index) => <SectionRenderer key={section.id || `${section.type}-${index}`} section={section} kind="contact" />)}
            <section className="pb-[var(--section-space)]">
                <Container>
                    <h2 className="section-title text-center">Perguntas Frequentes</h2>
                    <div className="mt-8">
                        {[
                            ['Como posso agendar uma visita?', 'Entre em contato pelo telefone, WhatsApp ou preencha o formulário desta página. Nossa equipe agendará o melhor horário para você.'],
                            ['Posso obter informações sobre financiamentos?', 'Sim. Nossa equipe pode orientar sobre as opções disponíveis.'],
                            ['Vocês atendem apenas Toledo?', 'Atuamos em Toledo e outras cidades da região.'],
                        ].map(([question, answer]) => (
                            <details key={question} className="border-b border-line py-5">
                                <summary className="cursor-pointer text-sm font-medium text-ink">{question}</summary>
                                <p className="mt-4 text-sm leading-6 text-muted">{answer}</p>
                            </details>
                        ))}
                    </div>
                </Container>
            </section>
        </>
    );
}

export default function StaticPage({ title, kind, page }) {
    return (
        <PublicLayout>
            <SeoHead title={page?.seo?.title || title} description={page?.seo?.description || (kind === 'about' ? 'Conheça a história da Pascoal Loteamentos.' : 'Entre em contato com a Pascoal Loteamentos.')} />
            {kind === 'about' ? <About page={page} /> : <Contact page={page} />}
        </PublicLayout>
    );
}
