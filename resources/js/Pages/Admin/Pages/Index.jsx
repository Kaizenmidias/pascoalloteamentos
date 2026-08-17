import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import AdminTable from '../../../Components/Admin/AdminTable';

const cmsPages = [
    { title: 'Home', href: '/admin/pages/home', text: 'Hero, filtros, números e diferenciais.' },
    { title: 'Sobre nós', href: '/admin/pages/create', text: 'Conteúdo institucional, missão, visão e valores.' },
    { title: 'Condomínios', href: '/admin/pages/create', text: 'Texto editorial e SEO da listagem pública.' },
    { title: 'Loteamentos', href: '/admin/pages/create', text: 'Texto editorial e SEO da listagem pública.' },
    { title: 'Imóveis', href: '/admin/pages/create', text: 'Título, texto introdutório e SEO da listagem pública.' },
    { title: 'Contato', href: '/admin/pages/create', text: 'Dados de contato, horários e formulários.' },
];

export default function Index({ items }) {
    const { url } = usePage();

    return (
        <AdminLayout title="Páginas">
            <div className="mb-6 grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
                {cmsPages.map((page) => (
                    <Link key={page.title} href={page.href} className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card ${url === page.href ? 'border-brand' : 'border-gray-200'}`}>
                        <h2 className="text-sm font-semibold uppercase text-gray-900">{page.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-500">{page.text}</p>
                        <span className="mt-4 inline-flex text-sm font-medium text-brand">Abrir CMS</span>
                    </Link>
                ))}
            </div>

            <div className="mb-5 flex justify-end">
                <Link href="/admin/pages/create" className="brand-button">Nova página</Link>
            </div>

            <AdminTable
                headers={['Título', 'Slug', 'Template', 'Seções', 'Status', 'Ações']}
                items={items}
                renderRow={(item) => (
                    <tr key={item.id}>
                        <td className="px-5 py-4 font-medium text-gray-900">{item.title}</td>
                        <td className="px-5 py-4 text-gray-500">/{item.slug}</td>
                        <td className="px-5 py-4 text-gray-500">{item.template}</td>
                        <td className="px-5 py-4 text-gray-500">{item.sections_count || 0}</td>
                        <td className="px-5 py-4"><span className="rounded-full bg-gray-100 px-3 py-1 text-xs">{item.status}</span></td>
                        <td className="px-5 py-4">
                            <div className="flex gap-3">
                                <Link href={`/admin/pages/${item.slug}/edit`} className="text-brand">Editar</Link>
                                <button onClick={() => confirm('Remover esta página?') && router.delete(`/admin/pages/${item.slug}`)} className="text-red-700">Excluir</button>
                            </div>
                        </td>
                    </tr>
                )}
            />
        </AdminLayout>
    );
}
