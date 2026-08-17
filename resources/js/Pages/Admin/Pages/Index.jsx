import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import AdminTable from '../../../Components/Admin/AdminTable';

export default function Index({ items }) {
    return (
        <AdminLayout title="Páginas">
            <div className="mb-6 grid gap-4 tablet:grid-cols-3">
                {[
                    ['Home', '/admin/pages/create', 'Estruture a home com seções, hero, números e diferenciais.'],
                    ['Sobre nós', '/admin/pages/create', 'Organize história, imagens, CTA e blocos institucionais.'],
                    ['Contato / Institucionais', '/admin/pages/create', 'Centralize os conteúdos de apoio e páginas fixas.'],
                ].map(([title, href, text]) => (
                    <div key={title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold uppercase text-gray-900">{title}</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-500">{text}</p>
                        <Link href={href} className="mt-4 inline-flex text-sm font-medium text-brand">Nova página</Link>
                    </div>
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
