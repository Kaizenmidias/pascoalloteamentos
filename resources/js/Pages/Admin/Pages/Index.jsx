import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import AdminTable from '../../../Components/Admin/AdminTable';

const structural = ['home', 'sobre-nos', 'condominios', 'loteamentos', 'imoveis', 'contato'];

export default function Index({ items = [] }) {
    const structure = items.filter((item) => structural.includes(item.slug));
    const pages = items.filter((item) => !structural.includes(item.slug));

    return (
        <AdminLayout title="Páginas">
            <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-medium text-gray-900">Páginas</h2>
                <p className="mt-2 text-sm text-gray-500">Lista de Páginas</p>
            </div>

            <section className="mb-8">
                <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Estruturais</h3>
                        <p className="text-sm text-gray-500">Home, páginas institucionais e listagens principais do site.</p>
                    </div>
                </div>
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Página</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Slug</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {structure.map((item) => (
                                <tr key={item.slug}>
                                    <td className="px-5 py-4 font-medium text-gray-900">{item.title}</td>
                                    <td className="px-5 py-4 text-gray-500">/{item.slug}</td>
                                    <td className="px-5 py-4">
                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Ativo</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <Link href={item.edit_url} className="text-brand">Editar</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Páginas livres</h3>
                        <p className="text-sm text-gray-500">Páginas institucionais adicionais criadas pelo usuário.</p>
                    </div>
                    <Link href="/admin/pages/create" className="brand-button">Nova página</Link>
                </div>

                <AdminTable
                    headers={['Página', 'Slug', 'Status', 'Ações']}
                    items={pages}
                    renderRow={(item) => (
                        <tr key={item.id}>
                            <td className="px-5 py-4 font-medium text-gray-900">{item.title}</td>
                            <td className="px-5 py-4 text-gray-500">/{item.slug}</td>
                            <td className="px-5 py-4">
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">{item.status}</span>
                            </td>
                            <td className="px-5 py-4">
                                <div className="flex gap-3">
                                    <Link href={`/admin/pages/${item.slug}/edit`} className="text-brand">Editar</Link>
                                    {!item.locked && <button onClick={() => confirm('Remover esta página?') && router.delete(`/admin/pages/${item.slug}`)} className="text-red-700">Excluir</button>}
                                </div>
                            </td>
                        </tr>
                    )}
                />
            </section>
        </AdminLayout>
    );
}
