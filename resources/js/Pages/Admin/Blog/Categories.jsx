import { router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import Button from '../../../Components/UI/Button';
import Field from '../../../Components/Forms/Field';

const slugify = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function CategoryRow({ category }) {
    const { data, setData, put, processing, errors } = useForm({ name: category.name, slug: category.slug });
    const submit = (event) => { event.preventDefault(); put(`/admin/blog/categories/${category.slug}`, { preserveScroll: true }); };
    const remove = () => {
        if (category.posts_count > 0) return;
        if (confirm(`Excluir a categoria "${category.name}"?`)) router.delete(`/admin/blog/categories/${category.slug}`, { preserveScroll: true });
    };
    return <tr className="border-b border-line last:border-0"><td className="px-5 py-3"><form id={`category-${category.id}`} onSubmit={submit} /><input form={`category-${category.id}`} className="admin-input min-w-52" value={data.name} onChange={(event) => setData('name', event.target.value)} aria-label="Nome da categoria" />{errors.name && <span className="mt-1 block text-xs text-red-700">{errors.name}</span>}</td><td className="px-5 py-3"><input form={`category-${category.id}`} className="admin-input min-w-52" value={data.slug} onChange={(event) => setData('slug', slugify(event.target.value))} aria-label="Slug da categoria" />{errors.slug && <span className="mt-1 block text-xs text-red-700">{errors.slug}</span>}</td><td className="px-5 py-3"><span className="rounded-full bg-surface px-3 py-1 text-xs text-muted">{category.posts_count} {category.posts_count === 1 ? 'post' : 'posts'}</span></td><td className="px-5 py-3"><div className="flex justify-end gap-3"><button form={`category-${category.id}`} disabled={processing} className="text-xs font-medium text-brand">Salvar</button><button type="button" onClick={remove} disabled={category.posts_count > 0} title={category.posts_count > 0 ? 'Remova ou realoque os posts antes de excluir.' : 'Excluir categoria'} className="text-xs font-medium text-red-700 disabled:cursor-not-allowed disabled:text-gray-300">Excluir</button></div></td></tr>;
}

export default function Categories({ categories = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({ name: '', slug: '' });
    const updateName = (name) => setData((current) => ({ ...current, name, slug: !current.slug || current.slug === slugify(current.name) ? slugify(name) : current.slug }));
    const submit = (event) => { event.preventDefault(); post('/admin/blog/categories', { preserveScroll: true, onSuccess: () => reset() }); };
    return <AdminLayout title="Categorias do Blog"><div className="mx-auto max-w-[1400px] space-y-5"><section className="rounded-xl border border-line bg-white p-5 shadow-sm"><div className="mb-5"><h2 className="font-medium text-ink">Nova categoria</h2><p className="mt-1 text-xs text-muted">As categorias criadas aqui ficam disponiveis imediatamente nos posts e no filtro publico do Blog.</p></div><form onSubmit={submit} className="grid items-end gap-4 tablet:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"><Field label="Nome" value={data.name} onChange={(event) => updateName(event.target.value)} error={errors.name} /><Field label="Slug" value={data.slug} onChange={(event) => setData('slug', slugify(event.target.value))} error={errors.slug} /><Button type="submit" disabled={processing}>{processing ? 'Criando...' : 'Nova categoria'}</Button></form></section><section className="overflow-x-auto rounded-xl border border-line bg-white shadow-sm"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-line bg-surface text-[.7rem] uppercase tracking-[.05em] text-muted"><tr><th className="px-5 py-3">Nome</th><th className="px-5 py-3">Slug</th><th className="px-5 py-3">Quantidade de posts</th><th className="px-5 py-3 text-right">Acoes</th></tr></thead><tbody>{categories.length ? categories.map((category) => <CategoryRow key={category.id} category={category} />) : <tr><td colSpan="4" className="px-5 py-10 text-center text-sm text-muted">Nenhuma categoria cadastrada.</td></tr>}</tbody></table></section></div></AdminLayout>;
}
