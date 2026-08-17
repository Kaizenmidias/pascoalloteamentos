import PublicLayout from '../../../Components/Layout/PublicLayout';
import SeoHead from '../../../Components/SEO/SeoHead';
import Container from '../../../Components/UI/Container';
import LeadForm from '../../../Components/RealEstate/LeadForm';

const values = [
    {
        title: 'Missão',
        image: '/reference-assets/blog-city.jpg',
        text: 'Desenvolver empreendimentos planejados com qualidade, segurança e infraestrutura completa, proporcionando valorização, bem-estar e qualidade de vida aos nossos clientes.',
    },
    {
        title: 'Visão',
        image: '/reference-assets/about-plans.jpg',
        text: 'Ser referência em loteamentos e empreendimentos imobiliários no Oeste do Paraná, reconhecida pela excelência, credibilidade e desenvolvimento sustentável.',
    },
    {
        title: 'Valores',
        image: '/reference-assets/about-meeting.jpg',
        text: 'Nossos valores se refletem no compromisso com a qualidade, no respeito às pessoas, na transparência das relações e na responsabilidade em cada empreendimento que desenvolvemos.',
    },
];

function About() {
    return (
        <>
            <section className="py-[var(--section-space)]">
                <Container className="space-y-20">
                    <div className="grid gap-10 desktop:grid-cols-2 desktop:items-center">
                        <div>
                            <h2 className="section-title">Uma história construída com trabalho, confiança e visão de futuro.</h2>
                            <p className="mt-5 text-sm leading-6 text-muted">A Pascoal Loteamentos nasceu em 2002, idealizada pelos irmãos Edson Pascoal e Hudson Paes Pascoal, com o propósito de desenvolver empreendimentos que transformam vidas e contribuem para o crescimento das cidades.</p>
                            <p className="mt-4 text-sm leading-6 text-muted">Ao longo de mais de 20 anos de atuação, a empresa consolidou sua presença na região, conquistando a confiança de clientes, investidores e parceiros por meio de um trabalho pautado na transparência, credibilidade e excelência.</p>
                        </div>
                        <img src="/reference-assets/about-team.webp" alt="Equipe Pascoal Loteamentos" className="mx-auto max-h-[480px] rounded-card object-cover" />
                    </div>
                    <div className="grid gap-10 desktop:grid-cols-2 desktop:items-center">
                        <img src="/reference-assets/about-engineer.webp" alt="Profissional da construção civil" className="mx-auto max-h-[480px] rounded-card object-cover desktop:order-first" />
                        <div>
                            <h2 className="section-title">Crescimento que gera desenvolvimento</h2>
                            <p className="mt-5 text-sm leading-6 text-muted">O compromisso com a qualidade fez da Pascoal uma referência regional no desenvolvimento de loteamentos e empreendimentos imobiliários. Nossa atuação já contribuiu para a expansão urbana de diversas regiões.</p>
                            <p className="mt-4 text-sm leading-6 text-muted">Cada empreendimento é pensado para oferecer segurança, infraestrutura completa, excelente localização e potencial de valorização.</p>
                        </div>
                    </div>
                    <div className="grid gap-6 rounded-card bg-surface p-8 text-center tablet:grid-cols-3">
                        {[
                            ['+20 anos', 'de experiência no mercado.'],
                            ['2 cidades', 'com empreendimentos desenvolvidos.'],
                            ['2 distritos', 'atendidos.'],
                        ].map(([value, text]) => (
                            <div key={value}>
                                <strong className="text-2xl font-normal text-ink">{value}</strong>
                                <p className="mt-2 text-xs text-muted">{text}</p>
                            </div>
                        ))}
                    </div>
                    <div className="grid gap-10 desktop:grid-cols-2 desktop:items-center">
                        <div>
                            <h2 className="section-title">Nosso Propósito</h2>
                            <p className="mt-5 text-sm leading-6 text-muted">Mais do que desenvolver loteamentos, construímos oportunidades. Sabemos que adquirir um terreno ou investir em um empreendimento é uma das decisões mais importantes da vida de uma família.</p>
                            <p className="mt-4 text-sm leading-6 text-muted">Por isso, cada projeto nasce com planejamento, responsabilidade e uma visão de longo prazo.</p>
                        </div>
                        <img src="/reference-assets/about-purpose.webp" alt="Engenheiro em uma obra" className="mx-auto max-h-[420px] rounded-card object-cover" />
                    </div>
                    <div className="grid gap-4 tablet:grid-cols-3">
                        {values.map(({ title, image, text }) => (
                            <article key={title} className="group relative min-h-[24rem] overflow-hidden rounded-card shadow-card">
                                <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition duration-500 ease-out group-hover:from-black/85 group-hover:via-black/45" />
                                <div className="absolute inset-x-0 bottom-0 z-10 p-6 tablet:p-7">
                                    <span className="text-sm font-medium uppercase tracking-[0.08em] text-white">{title}</span>
                                    <div className="mt-3 h-px w-10 bg-brand" />
                                    <p className="mt-4 max-w-[22rem] text-sm leading-6 text-white/90">{text}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </Container>
            </section>
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

function Contact() {
    return (
        <>
            <section className="py-14">
                <Container className="grid gap-8 tablet:grid-cols-3">
                    {[
                        ['Escritório administrativo', 'Av. Ministro Cirne Lima, nº 3951\nJardim Coopagro\nToledo - PR\nCEP 85904-460'],
                        ['Telefones', 'Telefone Comercial\n(45) 3252-7023\n\nPlantão de Vendas\n(45) 9 9111-9653'],
                        ['E-mail', 'contato@pascoalloteamentos.com.br'],
                    ].map(([title, text]) => (
                        <div key={title}>
                            <h2 className="text-xs font-bold uppercase text-ink">{title}</h2>
                            <span className="my-3 block h-px w-14 bg-brand" />
                            <p className="whitespace-pre-line text-sm leading-6 text-muted">{text}</p>
                        </div>
                    ))}
                </Container>
            </section>
            <section className="py-[var(--section-space)]">
                <Container className="grid gap-12 desktop:grid-cols-[1fr_1.1fr] desktop:items-start">
                    <div>
                        <h2 className="section-title">Fale com Nossa Equipe</h2>
                        <p className="mt-4 max-w-lg text-sm leading-6 text-muted">Preencha o formulário e nossa equipe entrará em contato o mais breve possível para esclarecer suas dúvidas ou apresentar as melhores oportunidades disponíveis.</p>
                        <h3 className="mt-8 text-xs font-bold uppercase text-ink">Estamos disponíveis para atender você.</h3>
                        <span className="my-3 block h-px w-20 bg-brand" />
                        <div className="grid gap-5 text-sm text-muted tablet:grid-cols-2">
                            <p>Segunda a Sexta-feira<br />08h00 às 18h00</p>
                            <p>Sábados<br />08h00 às 12h00</p>
                            <p>Domingos e Feriados<br />Plantão de vendas</p>
                            <p>Atendimento mediante agendamento.</p>
                        </div>
                    </div>
                    <LeadForm title="Envie sua mensagem" />
                </Container>
            </section>
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

export default function StaticPage({ title, kind }) {
    return <PublicLayout><SeoHead title={title} description={kind === 'about' ? 'Conheça a história da Pascoal Loteamentos.' : 'Entre em contato com a Pascoal Loteamentos.'} />{kind === 'about' ? <About /> : <Contact />}</PublicLayout>;
}
