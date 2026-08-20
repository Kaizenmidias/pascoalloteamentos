import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import RichContentEditor from '../../../Components/Admin/RichContentEditor';
import Field from '../../../Components/Forms/Field';
import SelectField from '../../../Components/Forms/SelectField';
import Button from '../../../Components/UI/Button';

const slugify = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function Form({ item, categories }) {
    const editing = Boolean(item);
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        _method: editing ? 'put' : undefined,
        title: item?.title || '', slug: item?.slug || '', excerpt: item?.excerpt || '', content: item?.content || '',
        status: item?.status || 'draft', published_at: item?.published_at?.slice(0, 16) || '',
        category_ids: item?.categories?.map((category) => category.id) || [], featured_image: null,
        seo_title: item?.seo?.title || '', seo_description: item?.seo?.description || '',
    });
    const updateTitle = (value) => { const automatic = slugify(data.title); setData((current) => ({ ...current, title: value, slug: !current.slug || current.slug === automatic ? slugify(value) : current.slug })); };
    const submit = (event) => { event.preventDefault(); post(editing ? `/admin/blog/posts/${item.slug}` : '/admin/blog/posts', { forceFormData: true, preserveScroll: true }); };

    return <AdminLayout title={editing ? 'Editar postagem' : 'Nova postagem'}><form onSubmit={submit} className="mx-auto max-w-[1500px] space-y-5">
        {Object.keys(errors).length > 0 && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Nao foi possivel salvar. Revise os campos destacados abaixo.</div>}
        {recentlySuccessful && <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">Postagem salva com sucesso.</div>}
        <div className="grid items-start gap-5 desktop:grid-cols-[minmax(0,2fr)_minmax(290px,.8fr)]">
            <main className="space-y-5"><section className="grid gap-5 rounded-xl border border-line bg-white p-6 shadow-sm tablet:grid-cols-2"><Field label="Titulo" value={data.title} onChange={(event) => updateTitle(event.target.value)} error={errors.title} /><Field label="Slug" value={data.slug} onChange={(event) => setData('slug', slugify(event.target.value))} error={errors.slug} /><div className="tablet:col-span-2"><Field label="Resumo" as="textarea" value={data.excerpt} onChange={(event) => setData('excerpt', event.target.value)} error={errors.excerpt} /></div></section><section className="rounded-xl border border-line bg-white p-6 shadow-sm"><RichContentEditor label="Conteudo da postagem" value={data.content} onChange={(value) => setData('content', value)} error={errors.content} minHeight={440} /></section></main>
            <aside className="space-y-5 desktop:sticky desktop:top-5"><section className="space-y-4 rounded-xl border border-line bg-white p-5 shadow-sm"><h2 className="font-medium text-ink">Publicacao</h2><SelectField label="Status" options={[{ id: 'draft', name: 'Rascunho' }, { id: 'published', name: 'Publicado' }, { id: 'archived', name: 'Arquivado' }]} value={data.status} onChange={(event) => setData('status', event.target.value)} error={errors.status} /><Field label="Publicar em" type="datetime-local" value={data.published_at} onChange={(event) => setData('published_at', event.target.value)} error={errors.published_at} /></section><section className="rounded-xl border border-line bg-white p-5 shadow-sm"><h2 className="mb-4 font-medium text-ink">Categorias</h2><div className="flex flex-wrap gap-2">{categories.map((category) => <label key={category.id} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm"><input type="checkbox" checked={data.category_ids.includes(category.id)} onChange={(event) => setData('category_ids', event.target.checked ? [...data.category_ids, category.id] : data.category_ids.filter((id) => id !== category.id))} />{category.name}</label>)}</div></section><section className="rounded-xl border border-line bg-white p-5 shadow-sm"><h2 className="mb-4 font-medium text-ink">Imagem principal</h2>{item?.featured_media?.url && <img src={item.featured_media.url} alt="" className="mb-3 aspect-video w-full rounded-lg object-cover" />}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setData('featured_image', event.target.files?.[0] || null)} className="admin-input" />{errors.featured_image && <span className="mt-1 block text-xs text-red-700">{errors.featured_image}</span>}</section><section className="space-y-4 rounded-xl border border-line bg-white p-5 shadow-sm"><h2 className="font-medium text-ink">SEO</h2><Field label="Titulo SEO" value={data.seo_title} onChange={(event) => setData('seo_title', event.target.value)} error={errors.seo_title} /><Field label="Descricao SEO" as="textarea" value={data.seo_description} onChange={(event) => setData('seo_description', event.target.value)} error={errors.seo_description} /></section></aside>
        </div><div className="flex justify-end"><Button type="submit" disabled={processing}>{processing ? 'Salvando...' : data.status === 'published' ? 'Publicar postagem' : 'Salvar postagem'}</Button></div>
    </form></AdminLayout>;
}
