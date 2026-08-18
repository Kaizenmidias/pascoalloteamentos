import { Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const primaryLinks = [
    ['Home', '/'],
    ['Sobre nós', '/sobre-nos'],
    ['Condomínios', '/condominios'],
    ['Loteamentos', '/loteamentos'],
    ['Imóveis', '/imoveis'],
    ['Blog', '/blog'],
    ['Contato', '/contato'],
];

const pathnameFromUrl = (url = '/') => {
    try {
        return new URL(url, 'https://inertia.local').pathname.replace(/\/$/, '') || '/';
    } catch {
        return url.split(/[?#]/, 1)[0].replace(/\/$/, '') || '/';
    }
};

function DropdownGroup({ label, href, items = [] }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <Link href={href} className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[.01em] transition hover:text-brand">
                {label}
                <span className="text-[10px]">▾</span>
            </Link>
            {open && items.length > 0 && (
                <div className="absolute left-0 top-full z-20 mt-3 w-72 overflow-hidden rounded-2xl border border-line bg-white p-2 text-ink shadow-header">
                    {items.map((item) => <Link key={item.slug} href={`/${href.replace('/', '')}/${item.slug}`} className="block rounded-xl px-4 py-3 text-sm font-light transition hover:bg-surface">{item.title}</Link>)}
                </div>
            )}
        </div>
    );
}

function MobileGroup({ label, href, items = [] }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b border-line py-4">
            <button type="button" className="flex w-full items-center justify-between text-lg font-light uppercase" onClick={() => setOpen(!open)}>
                <span>{label}</span>
                <span className={`text-xs transition ${open ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {open && (
                <div className="mt-3 space-y-2 pl-2">
                    <Link href={href} className="block rounded-lg bg-surface px-4 py-3 text-sm uppercase tracking-wide">Ver todos</Link>
                    {items.map((item) => <Link key={item.slug} href={`/${href.replace('/', '')}/${item.slug}`} className="block rounded-lg px-4 py-3 text-sm font-light">{item.title}</Link>)}
                </div>
            )}
        </div>
    );
}

export default function SiteHeader() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { url, props } = usePage();
    const pathname = pathnameFromUrl(url);
    const lightPages = ['/sobre-nos', '/condominios', '/loteamentos', '/imoveis'];
    const lightHeader = lightPages.some((path) => pathname === path || pathname.startsWith(`${path}/`));
    const realEstate = props.realEstate || {};
    const menuGroups = useMemo(() => ({
        condominios: realEstate.menuGroups?.condominiums || [],
        loteamentos: realEstate.menuGroups?.subdivisions || [],
        imoveis: realEstate.menuGroups?.properties || [],
    }), [realEstate.menuGroups]);

    useEffect(() => {
        const update = () => setScrolled(window.scrollY > 36);
        update();
        addEventListener('scroll', update, { passive: true });
        return () => removeEventListener('scroll', update);
    }, []);

    useEffect(() => {
        const isHome = pathname === '/';
        document.body.dataset.publicPage = isHome ? 'false' : 'true';
        document.body.dataset.scrolled = scrolled ? 'true' : 'false';
        return () => {
            delete document.body.dataset.publicPage;
            delete document.body.dataset.scrolled;
        };
    }, [pathname, scrolled]);

    useEffect(() => setOpen(false), [url]);
    useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);

    return (
        <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${lightHeader || scrolled || open ? 'bg-white text-ink shadow-header' : 'bg-transparent text-white'}`}>
            <div className="mx-auto flex h-[86px] max-w-[89.375rem] items-center justify-between px-5 desktop:px-8">
                <Link href="/" className="relative z-10" aria-label="Pascoal Loteamentos">
                    <img src="/reference-assets/logo.png" alt="Pascoal Loteamentos" className={`h-auto w-[145px] transition ${(lightHeader || scrolled || open) ? '' : 'brightness-0 invert'}`} />
                </Link>

                <nav className="hidden items-center gap-[1.4rem] desktop:flex" aria-label="Principal">
                    {primaryLinks.slice(0, 2).map(([label, href]) => <Link key={href} href={href} className={`text-xs font-medium uppercase tracking-[.01em] transition hover:text-brand ${pathname === href ? 'text-brand' : ''}`}>{label}</Link>)}
                    <DropdownGroup label="Condomínios" href="/condominios" items={menuGroups.condominios} />
                    <DropdownGroup label="Loteamentos" href="/loteamentos" items={menuGroups.loteamentos} />
                    <DropdownGroup label="Imóveis" href="/imoveis" items={menuGroups.imoveis} />
                    {primaryLinks.slice(5).map(([label, href]) => <Link key={href} href={href} className={`text-xs font-medium uppercase tracking-[.01em] transition hover:text-brand ${pathname === href ? 'text-brand' : ''}`}>{label}</Link>)}
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
                    {primaryLinks.slice(0, 2).map(([label, href]) => <Link key={href} href={href} className="block border-b border-line py-4 text-lg font-light uppercase">{label}</Link>)}
                    <MobileGroup label="Condomínios" href="/condominios" items={menuGroups.condominios} />
                    <MobileGroup label="Loteamentos" href="/loteamentos" items={menuGroups.loteamentos} />
                    <MobileGroup label="Imóveis" href="/imoveis" items={menuGroups.imoveis} />
                    {primaryLinks.slice(5).map(([label, href]) => <Link key={href} href={href} className="block border-b border-line py-4 text-lg font-light uppercase">{label}</Link>)}
                </nav>
            )}
        </header>
    );
}
