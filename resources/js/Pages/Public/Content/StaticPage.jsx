import { Link } from '@inertiajs/react';
import PublicLayout from '../../../Components/Layout/PublicLayout';
import SeoHead from '../../../Components/SEO/SeoHead';
import Container from '../../../Components/UI/Container';
import LeadForm from '../../../Components/RealEstate/LeadForm';

const fallbackAbout = [
    {
        type: 'history',
        label: 'Uma história',
        title: 'Uma história construída com trabalho, confiança e visão de futuro.',
        content:
            'A Pascoal Loteamentos nasceu em 2002, idealizada pelos irmãos Edson Pascoal e Hudson Paes Pascoal, com o propósito de desenvolver empreendimentos que transformam vidas e contribuem para o crescimento das cidades. Desde o início, cada projeto é conduzido com qualidade, planejamento e responsabilidade.\n\nAo longo de mais de 20 anos de atuação, a empresa consolidou sua presença na região, conquistando a confiança de clientes, investidores e parceiros por meio de um trabalho pautado na transparência, credibilidade e excelência em cada etapa do desenvolvimento imobiliário.\n\nHoje, seguimos construindo uma história sólida, desenvolvendo empreendimentos que geram oportunidades, valorização e qualidade de vida para milhares de famílias, sempre mantendo os valores que nos trouxeram até aqui e olhando para o futuro com a mesma dedicação do primeiro projeto.',
        image: '/reference-assets/about-team.webp',
    },
    {
        type: 'numbers',
        label: 'Nossos números',
        title: 'Resultados que contam a nossa história',
        subtitle: 'Indicadores institucionais da Pascoal.',
        content: [
            { prefix: '+', value: '20', suffix: 'anos', description: 'de experiência no mercado.' },
            { prefix: '', value: '2', suffix: 'cidades', description: 'com empreendimentos desenvolvidos.' },
            { prefix: '', value: '2', suffix: 'distritos', description: 'atendidos.' },
        ],
    },
    {
        type: 'purpose',
        title: 'Nosso Propósito',
        content:
            'Mais do que desenvolver loteamentos, construímos oportunidades.\n\nSabemos que adquirir um terreno ou investir em um empreendimento é uma das decisões mais importantes da vida de uma família.\n\nPor isso, cada projeto nasce com planejamento, responsabilidade e uma visão de longo prazo, oferecendo infraestrutura completa e soluções que promovem qualidade de vida, segurança e valorização patrimonial.\n\nNosso compromisso é entregar muito mais do que um espaço urbano: queremos contribuir para que pessoas construam histórias, conquistem patrimônio e realizem sonhos.',
    },
    {
        type: 'mission',
        title: 'Missão',
        content:
            'Desenvolver empreendimentos planejados com qualidade, segurança e infraestrutura completa, proporcionando valorização, bem-estar e qualidade de vida aos nossos clientes.',
        image: '/reference-assets/blog-city.jpg',
    },
    {
        type: 'vision',
        title: 'Visão',
        content:
            'Ser referência em loteamentos e empreendimentos imobiliários no Oeste do Paraná, reconhecida pela excelência, credibilidade e desenvolvimento sustentável.',
        image: '/reference-assets/about-plans.jpg',
    },
    {
        type: 'values',
        title: 'Valores',
        content:
            'Nossos valores se refletem no compromisso com a qualidade, no respeito às pessoas, na transparência das relações e na responsabilidade em cada empreendimento que desenvolvemos.',
        image: '/reference-assets/about-meeting.jpg',
    },
    {
        type: 'differential',
        title: 'Nosso Diferencial',
        content:
            'Cada empreendimento é desenvolvido pensando no futuro.\n\nDesde a escolha da localização até a entrega da infraestrutura, cada etapa é conduzida por uma equipe comprometida com a qualidade, segurança e valorização do investimento de nossos clientes.\n\nAcreditamos que bons empreendimentos não apenas transformam terrenos, mas impulsionam o crescimento urbano, movimentam a economia local e melhoram a qualidade de vida das pessoas.\n\nÉ essa visão que nos motiva diariamente a desenvolver projetos que deixem um legado positivo para as próximas gerações.',
        image: '/reference-assets/about-team.webp',
    },
    {
        type: 'cta',
        title: 'Vamos construir o próximo capítulo dessa história juntos.',
        content:
            'Se você procura um loteamento para morar, investir ou desenvolver seu patrimônio com segurança, conte com a experiência e a credibilidade da Pascoal Loteamentos.',
        button_label: 'Conheça nossos empreendimentos',
        button_url: '/imoveis',
    },
];

const fallbackContact = [
    {
        type: 'hero',
        label: 'Hero',
        title: 'Estamos prontos para ajudar você a encontrar o empreendimento ideal.',
        content:
            'Nossa equipe está à disposição para esclarecer dúvidas, apresentar oportunidades e oferecer o suporte necessário para que você faça um investimento com segurança e tranquilidade.',
        image: '/reference-assets/hero-contact.webp',
    },
    {
        type: 'contact-form',
        label: 'Formulário',
        title: 'Fale com Nossa Equipe',
        subtitle: 'Estamos disponíveis para atender você.',
        content: 'Preencha o formulário abaixo e nossa equipe entrará em contato o mais breve possível para esclarecer suas dúvidas ou apresentar as melhores oportunidades disponíveis.',
        button_label: 'Enviar mensagem',
    },
];

function Paragraphs({ content, className = '' }) {
    if (typeof content !== 'string') return null;

    const paragraphs = content
        .split(/\r?\n\s*\r?\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    return (
        <div className={className}>
            {paragraphs.map((paragraph, index) => (
                <p key={`${paragraph.slice(0, 48)}-${index}`} className={index ? 'mt-5' : ''}>
                    {paragraph}
                </p>
            ))}
        </div>
    );
}

function SectionRenderer({ section, kind, reverse = false }) {
    if (!section) return null;

    const type = section.type || 'content';
    const data = section.data || section;

    if (section.is_active === false) return null;

    if (type === 'hero') {
        return (
            <section className="relative flex min-h-[520px] items-center overflow-hidden px-5 pt-[80px] text-center text-white tablet:min-h-[600px] desktop:min-h-[645px]">
                <img
                    src={data.image || (kind === 'contact' ? '/reference-assets/hero-contact.webp' : '/reference-assets/hero-home.jpg')}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="red-overlay absolute inset-0" />
                <div className="relative z-10 mx-auto w-full max-w-[80rem]">
                    {data.subtitle && <p className="eyebrow mx-auto mb-3 text-white/80">{data.subtitle}</p>}
                    <h1 className="mx-auto max-w-[80rem] text-[34px] font-light leading-[1.1] tracking-[-.015em] tablet:text-[46px] desktop:text-[57px]">{data.title}</h1>
                    {data.content && (
                        <p className="mx-auto mt-5 max-w-none text-base font-extralight leading-[1.5] text-white/90 tablet:max-w-[80rem] tablet:text-[18px] desktop:max-w-[70%] desktop:text-[22px]">
                            {data.content}
                        </p>
                    )}
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
                            <h2 className={`section-title mt-2 ${type === 'history' ? 'text-[28px] leading-[1.15] tablet:text-[36px] desktop:text-[42px] desktop:leading-[1.1]' : ''}`}>
                                {data.title}
                            </h2>
                        )}
                        {data.content && (
                            <Paragraphs
                                content={data.content}
                                className={`mt-5 text-[16px] leading-7 text-muted ${type === 'purpose' || type === 'differential' ? 'desktop:max-w-[92%]' : ''}`}
                            />
                        )}
                    </div>
                </Container>
            </section>
        );
    }

    if (type === 'numbers') {
        const items = (() => {
            if (Array.isArray(data.content)) return data.content;
            if (typeof data.content === 'string') {
                try {
                    const parsed = JSON.parse(data.content);
                    return Array.isArray(parsed) ? parsed : [];
                } catch {
                    return [];
                }
            }
            return [];
        })()
            .slice(0, 3)
            .map((item) => ({
                prefix: item?.prefix ?? '',
                value: item?.value ?? '',
                suffix: item?.suffix ?? item?.title ?? '',
                description: item?.description ?? '',
            }));

        return (
            <section className="bg-white py-12 tablet:py-14">
                <Container className="max-w-[86rem]">
                    <div className="mx-auto rounded-[18px] bg-[#f7f7f7] px-8 py-10 tablet:px-12 tablet:py-12 desktop:px-16">
                        <div className="grid gap-10 text-center desktop:grid-cols-3 desktop:gap-10">
                            {items.map((item) => (
                                <article key={`${item.prefix}-${item.value}-${item.suffix}-${item.description}`} className="flex h-full flex-col items-center justify-center">
                                    <div className="text-[28px] font-light leading-none text-ink tablet:text-[34px] desktop:text-[36px]">
                                        {item.prefix && <span>{item.prefix} </span>}
                                        <span>{item.value}</span>
                                        {item.suffix && <span> {item.suffix}</span>}
                                    </div>
                                    <p className="mt-3 max-w-[18rem] text-[16px] font-light leading-6 text-muted">{item.description}</p>
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
                    <p className="mt-4 max-w-[22rem] text-[16px] leading-7 text-white/90">{data.content}</p>
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
        const defaultSchedule = [
            { title: 'Segunda a Sexta-feira', text: '08h00 às 18h00' },
            { title: 'Sábados', text: '08h00 às 12h00' },
            { title: 'Domingos e Feriados', text: 'Plantão de vendas mediante agendamento' },
        ];
        const blocks = Array.isArray(data.content_blocks) ? data.content_blocks : Array.isArray(data.content) ? data.content : defaultSchedule;
        const legacySupportText = typeof data.content === 'string' && data.content.startsWith('Preencha o formul');
        const supportText = legacySupportText
            ? 'Preencha o formulário abaixo e nossa equipe entrará em contato o mais breve possível para esclarecer suas dúvidas ou apresentar as melhores oportunidades disponíveis.'
            : data.content;
        const sectionTitle = typeof data.title === 'string' && data.title.startsWith('Fale com Nossa Equipe') ? 'Fale com Nossa Equipe' : data.title;
        const scheduleTitle = typeof data.subtitle === 'string' && data.subtitle.startsWith('Estamos dispon') ? 'Estamos disponíveis para atender você.' : data.subtitle;
        return (
            <section className="py-[var(--section-space)]">
                <Container className="grid gap-12 desktop:grid-cols-[1fr_1.1fr] desktop:items-start">
                    <div>
                        {sectionTitle && <h2 className="section-title">{sectionTitle}</h2>}
                        {supportText && <p className="mt-4 max-w-lg text-sm leading-6 text-muted">{supportText}</p>}
                        {scheduleTitle && <h3 className="mt-8 text-xs font-bold uppercase text-ink">{scheduleTitle}</h3>}
                        <span className="my-3 block h-px w-20 bg-brand" />
                        <div className="grid gap-5 text-sm text-muted tablet:grid-cols-2">
                            {blocks.map((row) => (
                                <p key={row.title}>
                                    <strong className="font-semibold text-ink">{row.title}</strong>
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
                    {data.title && <h2 className="mx-auto max-w-none text-[27px] font-light leading-[1.16] text-brand tablet:max-w-2xl tablet:text-3xl desktop:max-w-[59%] desktop:text-[46px] desktop:leading-[1.12]">{data.title}</h2>}
                    {data.content && <p className="mx-auto mt-4 max-w-none text-[16px] font-light leading-7 text-muted tablet:max-w-2xl desktop:max-w-[76%]">{data.content}</p>}
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
    const explicitCardTypes = new Set(source.filter((section) => ['mission', 'vision', 'values'].includes(section.type)).map((section) => section.type));
    const normalized = source.flatMap((section) => {
        const type = section?.type || 'content';
        const title = `${section?.data?.title || section?.title || ''}`.toLowerCase();

        if (type === 'hero') return [];
        if (title.includes('crescimento que gera desenvolvimento')) return [];

        if (type === 'institucional') {
            const blocks = Array.isArray(section?.data?.content) ? section.data.content : [];

            if (!blocks.length) return [];

            return blocks.slice(0, 3).flatMap((block, index) => {
                const cardType = ['mission', 'vision', 'values'][index];
                if (explicitCardTypes.has(cardType)) return [];

                return [{
                    type: cardType,
                    data: {
                        title: block.title || ['Missão', 'Visão', 'Valores'][index],
                        content: block.text || '',
                        image: block.image || '',
                    },
                    sort_order: (section.sort_order ?? 0) + index * 0.01,
                    is_active: section.is_active,
                }];
            });
        }

        if (type === 'content' && title === 'nosso propósito') return [{ ...section, type: 'purpose' }];
        if (type === 'content' && title === 'nosso diferencial') return [{ ...section, type: 'differential' }];
        if (type !== 'numbers' && title.includes('nossos números')) return [{ ...section, type: 'numbers' }];

        return [section];
    });

    const seen = new Set();
    return normalized.filter((section) => {
        if (!['mission', 'vision', 'values'].includes(section.type)) return true;
        if (seen.has(section.type)) return false;
        seen.add(section.type);
        return true;
    });
}

function About({ page }) {
    const sections = page?.sections?.length ? normalizeAboutSections(page.sections) : fallbackAbout;
    const orderedSections = [...sections].sort((left, right) => {
        const order = { hero: 0, history: 1, numbers: 2, content: 3, purpose: 4, mission: 5, vision: 6, values: 7, differential: 8, cta: 9 };
        return (order[left.type] ?? 99) - (order[right.type] ?? 99);
    });
    const findSection = (type) => orderedSections.find((section) => section.type === type);
    const cards = ['mission', 'vision', 'values'].map(findSection).filter(Boolean);
    const history = findSection('history');
    const numbers = findSection('numbers');
    const purpose = findSection('purpose') || orderedSections.find((section) => section.type === 'content');
    const differential = findSection('differential');
    const cta = findSection('cta');

    return (
        <>
            <SectionRenderer section={history || fallbackAbout.find((section) => section.type === 'history')} kind="about" />
            <SectionRenderer section={numbers || fallbackAbout.find((section) => section.type === 'numbers')} kind="about" />
            <SectionRenderer section={purpose || fallbackAbout.find((section) => section.type === 'purpose')} kind="about" reverse />
            <section className="py-[var(--section-space)]">
                <Container className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
                    {(cards.length ? cards : fallbackAbout.filter((section) => ['mission', 'vision', 'values'].includes(section.type))).map((section) => (
                        <SectionRenderer key={section.id || section.type} section={section} kind="about" />
                    ))}
                </Container>
            </section>
            <SectionRenderer section={differential || fallbackAbout.find((section) => section.type === 'differential')} kind="about" reverse />
            <SectionRenderer section={cta || fallbackAbout.find((section) => section.type === 'cta')} kind="about" />
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
            <SeoHead
                title={page?.seo?.title || title}
                description={page?.seo?.description || (kind === 'about' ? 'Conheça a história da Pascoal Loteamentos.' : 'Entre em contato com a Pascoal Loteamentos.')}
            />
            {kind === 'about' ? <About page={page} /> : <Contact page={page} />}
        </PublicLayout>
    );
}
