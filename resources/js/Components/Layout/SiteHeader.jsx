import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const links = [
    ['Home', '/'],
    ['Sobre nós', '/sobre-nos'],
    ['Condomínios', '/condominios'],
    ['Loteamentos', '/loteamentos'],
    ['Imóveis', '/imoveis'],
    ['Blog', '/blog'],
    ['Contato', '/contato'],
];

export default function SiteHeader() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { url } = usePage();

    useEffect(() => {
        const update = () => setScrolled(window.scrollY > 36);
        update();
        addEventListener('scroll', update, { passive: true });
        return () => removeEventListener('scroll', update);
    }, []);

    useEffect(() => {
        const isHome = url === '/';
        document.body.dataset.publicPage = isHome ? 'false' : 'true';
        document.body.dataset.scrolled = scrolled ? 'true' : 'false';
        return () => {
            delete document.body.dataset.publicPage;
            delete document.body.dataset.scrolled;
        };
    }, [url, scrolled]);

    useEffect(() => {
        setOpen(false);
    }, [url]);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled || open ? 'bg-white text-ink shadow-header' : 'bg-transparent text-white'}`}>
            <div className="mx-auto flex h-[86px] max-w-[89.375rem] items-center justify-between px-5 desktop:px-8">
                <Link href="/" className="relative z-10" aria-label="Pascoal Loteamentos">
                    <img src="/reference-assets/logo.png" alt="Pascoal Loteamentos" className={`h-auto w-[145px] transition ${scrolled || open ? '' : 'brightness-0 invert'}`} />
                </Link>

                <nav className="hidden items-center gap-[1.95rem] desktop:flex" aria-label="Principal">
                    {links.map(([label, href]) => (
                        <Link key={href} href={href} className={`text-xs font-medium uppercase tracking-[.01em] transition hover:text-brand ${url === href ? 'text-brand' : ''}`}>{label}</Link>
                    ))}
                    <Link href="/imoveis" className="brand-button min-w-48">Empreendimentos <span className="ml-2">⌕</span></Link>
                </nav>

                <button type="button" className="relative z-10 grid h-11 w-11 place-items-center rounded-full desktop:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu">
                    <span className="sr-only">Abrir menu</span>
                    <span className="space-y-1.5" aria-hidden="true">
                        <i className={`block h-0.5 w-6 bg-current transition ${open ? 'translate-y-2 rotate-45' : ''}`} />
                        <i className={`block h-0.5 w-6 bg-current transition ${open ? 'opacity-0' : ''}`} />
                        <i className={`block h-0.5 w-6 bg-current transition ${open ? '-translate-y-2 -rotate-45' : ''}`} />
                    </span>
                </button>
            </div>

            {open && (
                <nav id="mobile-menu" className="fixed inset-0 top-[86px] overflow-y-auto bg-white px-6 py-8 text-ink desktop:hidden" aria-label="Menu móvel">
                    {links.map(([label, href]) => <Link key={href} href={href} className="block border-b border-line py-4 text-lg font-light uppercase">{label}</Link>)}
                    <Link href="/imoveis" className="brand-button mt-7 w-full">Empreendimentos</Link>
                </nav>
            )}
        </header>
    );
}
