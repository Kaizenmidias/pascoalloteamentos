import { Link, usePage } from '@inertiajs/react';
import Container from '../UI/Container';
import SocialLinks from '../UI/SocialLinks';
import { WHATSAPP_NUMBER } from '../../Support/whatsapp';

const FooterLink = ({ href, children, external = false }) => external
    ? <a href={href} target="_blank" rel="noopener noreferrer" className="block py-1.5 text-xs font-light uppercase text-white/60 transition hover:text-white">{children}</a>
    : <Link href={href} className="block py-1.5 text-xs font-light uppercase text-white/60 transition hover:text-white">{children}</Link>;

export default function SiteFooter() {
    const { socialLinks = {} } = usePage().props;

    return (
        <footer className="mt-auto bg-footer text-white">
            <section className="relative overflow-hidden border-b border-white/5 py-10">
                <img src="/reference-assets/hero-home.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-10" />
                <Container className="relative flex flex-col items-start justify-between gap-6 desktop:flex-row desktop:items-center">
                    <div><h2 className="text-[2.125rem] font-light">Vamos conversar?</h2><p className="mt-3 max-w-2xl text-base font-light leading-7 text-white/70">Nossa equipe está pronta para apresentar o empreendimento ideal para você. Fale com nossos especialistas e descubra as melhores oportunidades.</p></div>
                    <Link href="/contato" className="brand-button min-w-72">Fale conosco</Link>
                </Container>
            </section>

            <Container className="py-14">
                <div className="grid gap-10 tablet:grid-cols-2 desktop:grid-cols-[1.35fr_1fr_1fr_1fr]">
                    <div>
                        <img src="/reference-assets/logo.png" alt="Pascoal Loteamentos" className="w-44" />
                        <p className="mt-5 max-w-[16rem] text-sm font-light leading-6 text-white/60">Construindo lugares onde pessoas vivem, investem e criam histórias há mais de três décadas.</p>
                        <SocialLinks links={socialLinks} className="mt-4" linkClassName="border border-white/20 text-white/70 hover:border-white/50 hover:bg-white/10 hover:text-white focus-visible:outline-white/70" />
                    </div>
                    <div><h3 className="mb-4 text-xs font-bold uppercase">Institucional</h3><span className="mb-3 block h-px w-10 bg-brand" /><FooterLink href="/">Home</FooterLink><FooterLink href="/sobre-nos">Sobre nós</FooterLink><FooterLink href="/condominios">Condomínios</FooterLink><FooterLink href="/loteamentos">Loteamentos</FooterLink><FooterLink href="/imoveis">Imóveis</FooterLink><FooterLink href="/blog">Blog</FooterLink><FooterLink href="/contato">Contato</FooterLink></div>
                    <div><h3 className="mb-4 text-xs font-bold uppercase">Empreendimentos</h3><span className="mb-3 block h-px w-10 bg-brand" /><FooterLink href="/condominios">Condomínios</FooterLink><FooterLink href="/loteamentos">Loteamentos</FooterLink><FooterLink href="/imoveis">Imóveis</FooterLink></div>
                    <div><h3 className="mb-4 text-xs font-bold uppercase">Atendimento</h3><span className="mb-3 block h-px w-10 bg-brand" /><FooterLink href={`https://wa.me/${WHATSAPP_NUMBER}`} external>WhatsApp</FooterLink><FooterLink href="/contato">Contato</FooterLink></div>
                </div>
                <div className="mt-12 border-t border-white/10 pt-6 text-center text-[.68rem] text-white/55">© 2026 Pascoal Loteamentos. Todos os direitos reservados. Política de Privacidade.</div>
            </Container>
        </footer>
    );
}
