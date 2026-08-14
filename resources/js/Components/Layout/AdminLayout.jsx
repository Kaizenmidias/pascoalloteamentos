import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const Icon = ({ children }) => (
    <span className="grid size-5 place-items-center text-base" aria-hidden="true">
        {children}
    </span>
);

export default function AdminLayout({ title, children }) {
    const { auth, flash } = usePage().props;
    const { url } = usePage();
    const [open, setOpen] = useState(false);

    useEffect(() => setOpen(false), [url]);

    const initials = auth?.user?.name?.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'U';
    const active = (href) => (href === '/admin' ? url === '/admin' : url.startsWith(href));

    return (
        <div className="min-h-screen bg-[#f3f4f6] desktop:flex">
            {open && <button type="button" aria-label="Fechar menu" className="fixed inset-0 z-30 bg-black/60 desktop:hidden" onClick={() => setOpen(false)} />}
            <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col bg-[#111] text-white transition-transform duration-300 desktop:static desktop:w-64 desktop:max-w-none desktop:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="border-b border-white/5 p-6">
                    <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/5 text-sm font-medium">{initials}</div>
                        <div className="min-w-0">
                            <div className="text-xs text-white/50">Hello,</div>
                            <div className="truncate text-sm font-medium">{auth?.user?.name || 'User'}</div>
                        </div>
                    </div>
                    <img src="/reference-assets/logo.png" alt="Pascoal Loteamentos" className="mt-6 w-40" />
                </div>
                <nav className="flex-1 overflow-y-auto py-5 text-sm">
                    <Link href="/admin" className={`flex items-center gap-3 px-6 py-3 transition ${active('/admin') ? 'bg-brand text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                        <Icon>⌂</Icon>
                        Dashboard
                    </Link>
                    <Link href="/admin/pages" className={`flex items-center gap-3 px-6 py-3 transition ${active('/admin/pages') ? 'bg-brand text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                        <Icon>¤</Icon>
                        Pages
                    </Link>
                    <details open className="group">
                        <summary className="flex cursor-pointer list-none items-center gap-3 px-6 py-3 text-white/70 transition hover:bg-white/5 hover:text-white">
                            <Icon>⌂</Icon>
                            <span className="flex-1">Entrepreneurship</span>
                            <span className="text-xs transition group-open:rotate-180">⌄</span>
                        </summary>
                        <div className="pb-2 pl-14">
                            {[
                                ['Condominiums', '/admin/condominiums'],
                                ['Properties', '/admin/properties'],
                                ['Subdivisions', '/admin/subdivisions'],
                                ['Classifications', '/admin/classifications'],
                            ].map(([itemLabel, itemHref]) => (
                                <Link
                                    key={itemHref}
                                    href={itemHref}
                                    className={`block rounded-l-lg px-4 py-2.5 ${active(itemHref) ? 'bg-brand text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}
                                >
                                    {itemLabel}
                                </Link>
                            ))}
                        </div>
                    </details>
                    <Link href="/admin/blog/posts" className={`flex items-center gap-3 px-6 py-3 transition ${active('/admin/blog/posts') ? 'bg-brand text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                        <Icon>✎</Icon>
                        Blog
                    </Link>
                    <Link href="/admin/leads" className={`flex items-center gap-3 px-6 py-3 transition ${active('/admin/leads') ? 'bg-brand text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                        <Icon>✉</Icon>
                        Leads
                    </Link>
                    <Link href="/admin/settings" className={`flex items-center gap-3 px-6 py-3 transition ${active('/admin/settings') ? 'bg-brand text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                        <Icon>⚙</Icon>
                        Settings
                    </Link>
                    <Link href="/admin/integrations" className={`flex items-center gap-3 px-6 py-3 transition ${active('/admin/integrations') ? 'bg-brand text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                        <Icon>⌘</Icon>
                        Integrations
                    </Link>
                    <Link href="/admin/users" className={`flex items-center gap-3 px-6 py-3 transition ${active('/admin/users') ? 'bg-brand text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                        <Icon>♙</Icon>
                        Users
                    </Link>
                </nav>
                <div className="space-y-1 border-t border-white/10 p-5 text-sm">
                    <Link href="/logout" method="post" as="button" className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-white/60 hover:bg-white/5 hover:text-white">
                        <Icon>↪</Icon>
                        Logout
                    </Link>
                    <Link href="/" className="flex items-center gap-3 rounded-lg px-2 py-2 text-white/60 hover:bg-white/5 hover:text-white">
                        <Icon>←</Icon>
                        Back to site
                    </Link>
                </div>
            </aside>
            <main className="min-w-0 flex-1">
                <header className="flex min-h-[68px] items-center gap-3 border-b border-gray-200 bg-white px-4 shadow-sm desktop:px-7">
                    <button type="button" className="rounded-lg p-2 text-xl hover:bg-gray-100 desktop:hidden" onClick={() => setOpen(true)}>
                        ☰
                    </button>
                    <h1 className="truncate text-xl font-medium text-gray-800 desktop:text-2xl">{title}</h1>
                </header>
                <div className="p-4 desktop:p-7">
                    {flash?.success && <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">{flash.success}</div>}
                    {flash?.error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{flash.error}</div>}
                    {children}
                </div>
            </main>
        </div>
    );
}
