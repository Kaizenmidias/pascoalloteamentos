import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
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

    const updateTitle = (value) => {
        const previousAutomaticSlug = slugify(data.title);
        setData((current) => ({ ...current, title: value, slug: !current.slug || current.slug === previousAutomaticSlug ? slugify(value) : current.slug }));
    };
    const submit = (event) => {
        event.preventDefault();
        post(editing ? `/admin/blog/posts/${item.slug}` : '/admin/blog/posts', { forceFormData: true, preserveScroll: true });
    };

    return <AdminLayout title={editing ? 'Editar postagem' : 'Nova postagem'}>
        <form onSubmit={submit} className="space-y-6">
            {Object.keys(errors).length > 0 && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Não foi possível salvar. Revise os campos destacados abaixo.</div>}
            {recentlySuccessful && <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">Postagem salva com sucesso.</div>}
            <section className="grid gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm tablet:grid-cols-2">
                <Field label="Título" value={data.title} onChange={(event) => updateTitle(event.target.value)} error={errors.title} />
                <Field label="Slug" value={data.slug} onChange={(event) => setData('slug', slugify(event.target.value))} error={errors.slug} placeholder="Gerado automaticamente pelo título" />
                <Field label="Resumo" as="textarea" value={data.excerpt} onChange={(event) => setData('excerpt', event.target.value)} error={errors.excerpt} />
                <div><span className="admin-label">Categorias</span><div className="flex flex-wrap gap-3">{categories.map((category) => <label key={category.id} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm"><input type="checkbox" checked={data.category_ids.includes(category.id)} onChange={(event) => setData('category_ids', event.target.checked ? [...data.category_ids, category.id] : data.category_ids.filter((id) => id !== category.id))} />{category.name}</label>)}</div>{errors.category_ids && <span className="mt-1 block text-xs text-red-700">{errors.category_ids}</span>}</div>
                <div className="tablet:col-span-2"><Field label="Conteúdo da postagem" as="textarea" rows="18" value={data.content} onChange={(event) => setData('content', event.target.value)} error={errors.content} /></div>
                <label><span className="admin-label">Imagem destacada</span>{item?.featured_media?.url && <img src={item.featured_media.url} alt="" className="mb-3 h-36 rounded-lg object-cover" />}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setData('featured_image', event.target.files?.[0] || null)} className="admin-input" />{errors.featured_image && <span className="mt-1 block text-xs text-red-700">{errors.featured_image}</span>}</label>
                <SelectField label="Status" options={[{ id: 'draft', name: 'Rascunho' }, { id: 'published', name: 'Publicado' }, { id: 'archived', name: 'Arquivado' }]} value={data.status} onChange={(event) => setData('status', event.target.value)} error={errors.status} />
                <Field label="Publicar em" type="datetime-local" value={data.published_at} onChange={(event) => setData('published_at', event.target.value)} error={errors.published_at} />
            </section>
            <section className="grid gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm tablet:grid-cols-2"><Field label="Título SEO" value={data.seo_title} onChange={(event) => setData('seo_title', event.target.value)} error={errors.seo_title} /><Field label="Descrição SEO" as="textarea" value={data.seo_description} onChange={(event) => setData('seo_description', event.target.value)} error={errors.seo_description} /></section>
            <Button type="submit" disabled={processing}>{processing ? (data.featured_image ? 'Enviando e salvando...' : 'Salvando...') : data.status === 'published' ? 'Publicar postagem' : 'Salvar postagem'}</Button>
        </form>
    </AdminLayout>;
}
