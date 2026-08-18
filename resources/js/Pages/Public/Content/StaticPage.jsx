import { Link } from '@inertiajs/react';
import PublicLayout from '../../../Components/Layout/PublicLayout';
import SeoHead from '../../../Components/SEO/SeoHead';
import Container from '../../../Components/UI/Container';
import LeadForm from '../../../Components/RealEstate/LeadForm';

const fallbackAbout = [
    {
        type: 'history',
        label: 'HistÃ³ria',
        title: 'Uma histÃ³ria construÃ­da com trabalho, confianÃ§a e visÃ£o de futuro.',
        content: 'A Pascoal Loteamentos nasceu em 2002, idealizada pelos irmÃ£os Edson Pascoal e Hudson Paes Pascoal, com o propÃ³sito de desenvolver empreendimentos que transformam vidas e contribuem para o crescimento das cidades. Desde o inÃ­cio, cada projeto Ã© conduzido com qualidade, planejamento e responsabilidade.\n\nAo longo de mais de 20 anos de atuaÃ§Ã£o, a empresa consolidou sua presenÃ§a na regiÃ£o, conquistando a confianÃ§a de clientes, investidores e parceiros por meio de um trabalho pautado na transparÃªncia, credibilidade e excelÃªncia em cada etapa do desenvolvimento imobiliÃ¡rio.\n\nHoje, seguimos construindo uma histÃ³ria sÃ³lida, desenvolvendo empreendimentos que geram oportunidades, valorizaÃ§Ã£o e qualidade de vida para milhares de famÃ­lias, sempre mantendo os valores que nos trouxeram atÃ© aqui e olhando para o futuro com a mesma dedicaÃ§Ã£o do primeiro projeto.',
        image: '/reference-assets/about-team.webp',
    },
    {
        type: 'numbers',
        label: 'Nossos nÃºmeros',
        title: 'Resultados que contam a nossa histÃ³ria',
        subtitle: 'Indicadores institucionais da Pascoal.',
        content: [
            { value: '20+', title: 'Anos de experiÃªncia', description: 'de atuaÃ§Ã£o no mercado.' },
            { value: '2', title: 'Cidades', description: 'com empreendimentos desenvolvidos.' },
            { value: '2', title: 'Distritos', description: 'atendidos pela empresa.' },
        ],
    },
    {
        type: 'purpose',
        title: 'Nosso PropÃ³sito',
        content: 'Mais do que desenvolver loteamentos, construÃ­mos oportunidades.\nSabemos que adquirir um terreno ou investir em um empreendimento Ã© uma das decisÃµes mais importantes da vida de uma famÃ­lia.\n\nPor isso, cada projeto nasce com planejamento, responsabilidade e uma visÃ£o de longo prazo, oferecendo infraestrutura completa e soluÃ§Ãµes que promovem qualidade de vida, seguranÃ§a e valorizaÃ§Ã£o patrimonial.\n\nNosso compromisso Ã© entregar muito mais do que um espaÃ§o urbano: queremos contribuir para que pessoas construam histÃ³rias, conquistem patrimÃ´nio e realizem sonhos.',
    },
    {
        type: 'mission',
        title: 'MissÃ£o',
        content: 'Desenvolver empreendimentos planejados com qualidade, seguranÃ§a e infraestrutura completa, proporcionando valorizaÃ§Ã£o, bem-estar e qualidade de vida aos nossos clientes.',
        image: '/reference-assets/blog-city.jpg',
    },
    {
        type: 'vision',
        title: 'VisÃ£o',
        content: 'Ser referÃªncia em loteamentos e empreendimentos imobiliÃ¡rios no Oeste do ParanÃ¡, reconhecida pela excelÃªncia, credibilidade e desenvolvimento sustentÃ¡vel.',
        image: '/reference-assets/about-plans.jpg',
    },
    {
        type: 'values',
        title: 'Valores',
        content: 'Nossos valores se refletem no compromisso com a qualidade, no respeito Ã s pessoas, na transparÃªncia das relaÃ§Ãµes e na responsabilidade em cada empreendimento que desenvolvemos.',
        image: '/reference-assets/about-meeting.jpg',
    },
    {
        type: 'differential',
        title: 'Nosso Diferencial',
        content: 'Cada empreendimento Ã© desenvolvido pensando no futuro.\nDesde a escolha da localizaÃ§Ã£o atÃ© a entrega da infraestrutura, cada etapa Ã© conduzida por uma equipe comprometida com a qualidade, seguranÃ§a e valorizaÃ§Ã£o do investimento de nossos clientes.\n\nAcreditamos que bons empreendimentos nÃ£o apenas transformam terrenos, mas impulsionam o crescimento urbano, movimentam a economia local e melhoram a qualidade de vida das pessoas.\n\nÃ‰ essa visÃ£o que nos motiva diariamente a desenvolver projetos que deixem um legado positivo para as prÃ³ximas geraÃ§Ãµes.',
        image: '/reference-assets/about-team.webp',
    },
    {
        type: 'cta',
        title: 'Vamos construir o prÃ³ximo capÃ­tulo dessa histÃ³ria juntos.',
        content: 'Se vocÃª procura um loteamento para morar, investir ou desenvolver seu patrimÃ´nio com seguranÃ§a, conte com a experiÃªncia e a credibilidade da Pascoal Loteamentos.',
        button_label: 'ConheÃ§a nossos empreendimentos',
        button_url: '/imoveis',
    },
];

const fallbackContact = [
    {
        type: 'hero',
        label: 'Hero',
        title: 'Estamos prontos para ajudar vocÃª a encontrar o empreendimento ideal.',
        content: 'Nossa equipe estÃ¡ Ã  disposiÃ§Ã£o para esclarecer dÃºvidas, apresentar oportunidades e oferecer o suporte necessÃ¡rio para que vocÃª faÃ§a um investimento com seguranÃ§a e tranquilidade.',
        image: '/reference-assets/hero-contact.webp',
    },
];

function SectionRenderer({ section, kind, reverse = false }) {
    if (!section) return null;
    const type = section.type || 'content';
    const data = section.data || section;

    if (section.is_active === false) return null;

    if (type === 'hero') {
        return (
            <section className="relative flex min-h-[645px] items-center overflow-hidden px-5 pt-[80px] text-center text-white">
                <img
                    src={data.image || (kind === 'contact' ? '/reference-assets/hero-contact.webp' : '/reference-assets/hero-home.jpg')}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="red-overlay absolute inset-0" />
                <div className="relative z-10 mx-auto w-full max-w-[80rem]">
                    {data.subtitle && <p className="eyebrow mx-auto mb-3 text-white/80">{data.subtitle}</p>}
                    <h1 className="mx-auto max-w-[80rem] text-[57px] font-light leading-[1.08] tracking-[-.015em] tablet:text-[46px] mobile:text-[24px]">{data.title}</h1>
                    {data.content && <p className="mx-auto mt-5 max-w-[70%] text-[22px] font-extralight leading-[1.4] text-white/90 tablet:max-w-[80rem] tablet:text-[18px] mobile:max-w-none mobile:text-base">{data.content}</p>}
                </div>
            </section>
        );
    }

    if (type === 'history' || type === 'content' || type === 'purpose' || type === 'differential') {
        return (
            <section className={`py-[var(--section-space)] ${type === 'history' ? 'pt-20 desktop:pt-28' : ''}`}>
                <Container className="grid gap-10 desktop:grid-cols-2 desktop:items-center">
                    {data.image && (
                        <img
                            src={data.image}
                            alt={data.title || ''}
                            className={`mx-auto w-full max-h-[480px] rounded-card object-cover ${reverse ? 'desktop:order-2' : 'desktop:order-1'}`}
                        />
                    )}
                    <div className={reverse ? 'desktop:order-1' : 'desktop:order-2'}>
                        {!['purpose', 'differential'].includes(type) && data.label && <p className="eyebrow">{data.label}</p>}
                        {data.title && (
                            <h2 className={`section-title mt-2 ${type === 'history' ? 'text-[42px] leading-[1.1] tablet:text-[36px] mobile:text-[28px]' : ''}`}>
                                {data.title}
                            </h2>
                        )}
                        {data.content && <p className={`mt-5 whitespace-pre-line text-[18px] leading-8 text-muted ${type === 'purpose' || type === 'differential' ? 'desktop:max-w-[92%]' : ''}`}>{data.content}</p>}
                    </div>
                </Container>
            </section>
        );
    }

    if (type === 'numbers') {
        const items = Array.isArray(data.content) ? data.content : [];

        return (
            <section className="bg-surface py-14">
                <Container className="max-w-[76rem]">
                    <div className="mx-auto max-w-3xl text-center">
                        {data.label && <p className="eyebrow mx-auto">{data.label}</p>}
                        {data.title && <h2 className="section-title mt-2">{data.title}</h2>}
                        {data.subtitle && <p className="mt-4 text-base leading-7 text-muted">{data.subtitle}</p>}
                    </div>
                    <div className="mt-10 rounded-[18px] bg-[#f7f7f7] px-8 py-10 tablet:px-12 tablet:py-12 desktop:px-16">
                        <div className="grid gap-10 text-center desktop:grid-cols-3 desktop:gap-6">
                            {items.map((item) => (
                                <article key={item.title} className="flex h-full flex-col items-center justify-center">
                                    <div className="text-[32px] font-light leading-none text-ink tablet:text-[36px]">
                                        {item.value}{item.title === 'Anos de experiência' ? ' anos' : ''}
                                    </div>
                                    <p className="mt-4 max-w-[18rem] text-sm font-light leading-6 text-muted tablet:text-base">
                                        {item.description}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>
        );
    }

    if (type === 'mission' || type === 'vision' || type === 'values') {
        return (
            <article className="group relative min-h-[24rem] overflow-hidden rounded-card shadow-card">
                <img
                    src={data.image || '/reference-assets/blog-city.jpg'}
                    alt={data.alt || data.title || data.label || ''}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition duration-500 ease-out" />
                <div className="absolute inset-x-0 bottom-0 z-10 p-6 tablet:p-7">
                    <span className="text-[20px] font-medium uppercase tracking-[0.08em] text-white">{data.title || data.label || ''}</span>
                    <div className="mt-3 h-px w-10 bg-brand" />
                    <p className="mt-4 max-w-[22rem] text-[18px] leading-7 text-white/90">{data.content}</p>
                </div>
            </article>
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
        const blocks = Array.isArray(data.content_blocks) ? data.content_blocks : (Array.isArray(data.content) ? data.content : []);
        return (
            <section className="py-[var(--section-space)]">
                <Container className="grid gap-12 desktop:grid-cols-[1fr_1.1fr] desktop:items-start">
                    <div>
                        {data.title && <h2 className="section-title">{data.title}</h2>}
                        {data.content && <p className="mt-4 max-w-lg text-sm leading-6 text-muted">{data.content}</p>}
                        {data.subtitle && <h3 className="mt-8 text-xs font-bold uppercase text-ink">{data.subtitle}</h3>}
                        <span className="my-3 block h-px w-20 bg-brand" />
                        <div className="grid gap-5 text-sm text-muted tablet:grid-cols-2">
                            {blocks.map((row) => (
                                <p key={row.title}>
                                    {row.title}
                                    <br />
                                    {row.text}
                                </p>
                            ))}
                        </div>
                    </div>
                    <LeadForm title={data.button_label || 'Envie sua mensagem'} />
                </Container>
            </section>
        );
    }

    if (type === 'social') {
        const links = Array.isArray(data.content) ? data.content : [];
        return (
            <section className="pb-[var(--section-space)]">
                <Container>
                    {data.label && <p className="eyebrow">{data.label}</p>}
                    {data.title && <h2 className="section-title mt-2">{data.title}</h2>}
                    <div className="mt-8 flex flex-wrap gap-4">
                        {links.map(([label, href]) => (
                            <a key={label} href={href} target="_blank" rel="noreferrer" className="brand-button inline-flex">
                                {label}
                            </a>
                        ))}
                    </div>
                </Container>
            </section>
        );
    }

    if (type === 'cta') {
        return (
            <section className="bg-surface py-16 text-center">
                <Container>
                    {data.title && <h2 className="mx-auto max-w-[59%] text-[46px] font-light leading-[1.12] text-brand tablet:max-w-2xl tablet:text-3xl mobile:max-w-none mobile:text-[27px]">{data.title}</h2>}
                    {data.content && <p className="mx-auto mt-4 max-w-[76%] text-[20px] font-light leading-8 text-muted tablet:max-w-2xl tablet:text-base mobile:max-w-none mobile:text-base">{data.content}</p>}
                    {data.button_label && data.button_url && (
                        <Link href={data.button_url} className="brand-button mt-6 inline-flex">
                            {data.button_label}
                        </Link>
                    )}
                </Container>
            </section>
        );
    }

    return null;
}

function normalizeAboutSections(sections) {
    const source = Array.isArray(sections) ? sections : [];
    const hasExplicitCards = source.some((section) => ['mission', 'vision', 'values'].includes(section.type));
    const historyText = 'A Pascoal Loteamentos nasceu em 2002, idealizada pelos irmãos Edson Pascoal e Hudson Paes Pascoal, com o propósito de desenvolver empreendimentos que transformam vidas e contribuem para o crescimento das cidades. Desde o início, cada projeto é conduzido com qualidade, planejamento e responsabilidade.\n\nAo longo de mais de 20 anos de atuação, a empresa consolidou sua presença na região, conquistando a confiança de clientes, investidores e parceiros por meio de um trabalho pautado na transparência, credibilidade e excelência em cada etapa do desenvolvimento imobiliário.\n\nHoje, seguimos construindo uma história sólida, desenvolvendo empreendimentos que geram oportunidades, valorização e qualidade de vida para milhares de famílias, sempre mantendo os valores que nos trouxeram até aqui e olhando para o futuro com a mesma dedicação do primeiro projeto.';

    return source.flatMap((section) => {
        const type = section?.type || 'content';
        const title = `${section?.data?.title || section?.title || ''}`.toLowerCase();

        if (type === 'hero') return [];
        if (title.includes('crescimento que gera desenvolvimento')) return [];
        if (type === 'history') {
            return [{
                ...section,
                data: {
                    ...(section.data || {}),
                    label: 'Uma história',
                    title: 'Uma história construída com trabalho, confiança e visão de futuro.',
                    content: historyText,
                },
            }];
        }

        if (type === 'institucional') {
            const blocks = Array.isArray(section?.data?.content) ? section.data.content : [];

            if (!blocks.length) return [];
            if (hasExplicitCards) return [];

            return blocks.slice(0, 3).map((block, index) => ({
                type: ['mission', 'vision', 'values'][index],
                title: block.title || ['MissÃ£o', 'VisÃ£o', 'Valores'][index],
                content: block.text || '',
                image: block.image || '',
                sort_order: (section.sort_order ?? 0) + (index * 0.01),
                is_active: section.is_active,
            }));
        }

        return [section];
    });
}

function About({ page }) {
    const sections = page?.sections?.length ? normalizeAboutSections(page.sections) : fallbackAbout;
    const orderedSections = [...sections].sort((left, right) => {
        const order = { hero: 0, history: 1, numbers: 2, content: 3, purpose: 4, mission: 5, vision: 6, values: 7, differential: 8, cta: 9 };
        return (order[left.type] ?? 99) - (order[right.type] ?? 99);
    });
    const cards = orderedSections.filter((section) => ['mission', 'vision', 'values'].includes(section.type));
    const mainSections = orderedSections.filter((section) => !['mission', 'vision', 'values'].includes(section.type));

    return (
        <>
            {mainSections.map((section, index) => (
                <SectionRenderer
                    key={section.id || `${section.type}-${index}`}
                    section={section}
                    kind="about"
                    reverse={section.type === 'differential' || (['history', 'content', 'purpose'].includes(section.type) && index % 2 === 1)}
                />
            ))}
            <section className="py-[var(--section-space)]">
                <Container className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
                    {(cards.length ? cards : fallbackAbout.filter((section) => ['mission', 'vision', 'values'].includes(section.type))).map((section) => (
                        <SectionRenderer key={section.id || section.type} section={section} kind="about" />
                    ))}
                </Container>
            </section>
            {!mainSections.some((section) => section.type === 'differential') && (
                <section className="py-[var(--section-space)]">
                    <Container className="max-w-[76rem]">
                        <div className="grid gap-10 desktop:grid-cols-2 desktop:items-center">
                            <div>
                                <h2 className="section-title mt-2 text-[42px] leading-[1.1] tablet:text-[36px] mobile:text-[28px]">Nosso Diferencial</h2>
                                <p className="mt-5 whitespace-pre-line text-[18px] leading-8 text-muted">
                                    Cada empreendimento Ã© desenvolvido pensando no futuro.
                                    Desde a escolha da localizaÃ§Ã£o atÃ© a entrega da infraestrutura, cada etapa Ã© conduzida por uma equipe comprometida com a qualidade, seguranÃ§a e valorizaÃ§Ã£o do investimento de nossos clientes.

                                    Acreditamos que bons empreendimentos nÃ£o apenas transformam terrenos, mas impulsionam o crescimento urbano, movimentam a economia local e melhoram a qualidade de vida das pessoas.

                                    Ã‰ essa visÃ£o que nos motiva diariamente a desenvolver projetos que deixem um legado positivo para as prÃ³ximas geraÃ§Ãµes.
                                </p>
                            </div>
                            <img
                                src={fallbackAbout.find((section) => section.type === 'differential')?.image}
                                alt="Nosso diferencial"
                                className="mx-auto w-full max-h-[480px] rounded-card object-cover"
                            />
                        </div>
                    </Container>
                </section>
            )}
            <section className="bg-surface py-16 text-center">
                <Container>
                    <h2 className="mx-auto max-w-[59%] text-[46px] font-light leading-[1.12] text-brand tablet:max-w-2xl tablet:text-3xl mobile:max-w-none mobile:text-[27px]">Vamos construir o prÃ³ximo capÃ­tulo dessa histÃ³ria juntos.</h2>
                    <p className="mx-auto mt-4 max-w-[76%] text-[20px] font-light leading-8 text-muted tablet:max-w-2xl tablet:text-base mobile:max-w-none mobile:text-base">
                        Se vocÃª procura um loteamento para morar, investir ou desenvolver seu patrimÃ´nio com seguranÃ§a, conte com a experiÃªncia e a credibilidade da Pascoal Loteamentos.
                    </p>
                    <a href="/imoveis" className="brand-button mt-6 inline-flex">
                        ConheÃ§a nossos empreendimentos
                    </a>
                </Container>
            </section>
        </>
    );
}

function Contact({ page }) {
    const sections = page?.sections?.length ? page.sections : fallbackContact;

    return (
        <>
            {sections.map((section, index) => (
                <SectionRenderer key={section.id || `${section.type}-${index}`} section={section} kind="contact" />
            ))}
            <section className="pb-[var(--section-space)]">
                <Container>
                    <h2 className="section-title text-center">Perguntas Frequentes</h2>
                    <div className="mt-8">
                        {[
                            ['Como posso agendar uma visita?', 'Entre em contato pelo telefone, WhatsApp ou preencha o formulÃ¡rio desta pÃ¡gina. Nossa equipe agendarÃ¡ o melhor horÃ¡rio para vocÃª.'],
                            ['Posso obter informaÃ§Ãµes sobre financiamentos?', 'Sim. Nossa equipe pode orientar sobre as opÃ§Ãµes disponÃ­veis.'],
                            ['VocÃªs atendem apenas Toledo?', 'Atuamos em Toledo e outras cidades da regiÃ£o.'],
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
            <SeoHead
                title={page?.seo?.title || title}
                description={page?.seo?.description || (kind === 'about' ? 'ConheÃ§a a histÃ³ria da Pascoal Loteamentos.' : 'Entre em contato com a Pascoal Loteamentos.')}
            />
            {kind === 'about' ? <About page={page} /> : <Contact page={page} />}
        </PublicLayout>
    );
}
