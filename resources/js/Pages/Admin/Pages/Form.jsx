import { useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import Field from '../../../Components/Forms/Field';
import SelectField from '../../../Components/Forms/SelectField';
import Button from '../../../Components/UI/Button';

const createSection = (type = 'content') => ({
    type,
    title: '',
    subtitle: '',
    content: '',
    image: '',
    button_label: '',
    button_url: '',
    layout: '',
    sort_order: 0,
    is_active: true,
});

export default function Form({ item }) {
    const editing = Boolean(item);
    const initialSections = useMemo(() => {
        if (!item?.sections?.length) {
            return [createSection('hero')];
        }

        return item.sections.map((section, index) => ({
            type: section.type || 'content',
            title: section.data?.title || '',
            subtitle: section.data?.subtitle || '',
            content: section.data?.content || '',
            image: section.data?.image || '',
            button_label: section.data?.button_label || '',
            button_url: section.data?.button_url || '',
            layout: section.data?.layout || '',
            sort_order: section.sort_order ?? index,
            is_active: Boolean(section.is_active ?? true),
        }));
    }, [item]);

    const { data, setData, post, processing, errors } = useForm({
        _method: editing ? 'put' : undefined,
        title: item?.title || '',
        slug: item?.slug || '',
        content: item?.content || '',
        template: item?.template || 'default',
        status: item?.status || 'draft',
        seo_title: item?.seo?.title || '',
        seo_description: item?.seo?.description || '',
        sections: initialSections,
    });
    const [activeTab, setActiveTab] = useState('content');

    const submit = (event) => {
        event.preventDefault();
        post(editing ? `/admin/pages/${item.slug}` : '/admin/pages');
    };

    const updateSection = (index, key, value) => {
        setData('sections', data.sections.map((section, sectionIndex) => (
            sectionIndex === index ? { ...section, [key]: value } : section
        )));
    };

    const addSection = () => setData('sections', [...data.sections, createSection()]);
    const removeSection = (index) => setData('sections', data.sections.filter((_, sectionIndex) => sectionIndex !== index));

    return (
        <AdminLayout title={editing ? 'Editar página' : 'Nova página'}>
            <form onSubmit={submit} className="space-y-6">
                <div className="flex flex-wrap gap-2">
                    {[
                        ['content', 'Conteúdo'],
                        ['sections', 'Seções'],
                        ['seo', 'SEO'],
                    ].map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setActiveTab(key)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === key ? 'bg-brand text-white' : 'bg-white text-gray-700 shadow-sm hover:bg-gray-50'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {activeTab === 'content' && (
                    <section className="grid gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm tablet:grid-cols-2">
                        <Field label="Título" value={data.title} onChange={(event) => setData('title', event.target.value)} error={errors.title} />
                        <Field label="Slug" value={data.slug} onChange={(event) => setData('slug', event.target.value)} error={errors.slug} />
                        <SelectField
                            label="Template"
                            options={[
                                { id: 'default', name: 'Padrão' },
                                { id: 'institutional', name: 'Institucional' },
                                { id: 'landing', name: 'Landing page' },
                            ]}
                            value={data.template}
                            onChange={(event) => setData('template', event.target.value)}
                        />
                        <SelectField
                            label="Status"
                            options={[
                                { id: 'draft', name: 'Rascunho' },
                                { id: 'published', name: 'Publicado' },
                                { id: 'archived', name: 'Arquivado' },
                            ]}
                            value={data.status}
                            onChange={(event) => setData('status', event.target.value)}
                        />
                        <div className="tablet:col-span-2">
                            <Field label="Conteúdo" as="textarea" rows="14" value={data.content} onChange={(event) => setData('content', event.target.value)} />
                        </div>
                    </section>
                )}

                {activeTab === 'sections' && (
                    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Seções da página</h2>
                                <p className="text-sm text-gray-500">Organize hero, blocos de conteúdo, CTA e imagens no layout da página.</p>
                            </div>
                            <Button type="button" onClick={addSection}>Adicionar seção</Button>
                        </div>

                        <div className="space-y-5">
                            {data.sections.map((section, index) => (
                                <div key={`${section.type}-${index}`} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <SelectField
                                                label={`Tipo ${index + 1}`}
                                                options={[
                                                    { id: 'hero', name: 'Hero' },
                                                    { id: 'content', name: 'Conteúdo' },
                                                    { id: 'image-text', name: 'Imagem + texto' },
                                                    { id: 'cta', name: 'CTA' },
                                                    { id: 'stats', name: 'Números' },
                                                ]}
                                                value={section.type}
                                                onChange={(event) => updateSection(index, 'type', event.target.value)}
                                            />
                                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                                <input type="checkbox" checked={section.is_active} onChange={(event) => updateSection(index, 'is_active', event.target.checked)} />
                                                Ativa
                                            </label>
                                        </div>
                                        <button type="button" onClick={() => removeSection(index)} className="text-sm font-medium text-red-700">Remover</button>
                                    </div>

                                    <div className="grid gap-4 tablet:grid-cols-2">
                                        <Field label="Título" value={section.title} onChange={(event) => updateSection(index, 'title', event.target.value)} />
                                        <Field label="Subtítulo" value={section.subtitle} onChange={(event) => updateSection(index, 'subtitle', event.target.value)} />
                                        <Field label="Imagem" value={section.image} onChange={(event) => updateSection(index, 'image', event.target.value)} />
                                        <Field label="Botão" value={section.button_label} onChange={(event) => updateSection(index, 'button_label', event.target.value)} />
                                        <Field label="URL do botão" value={section.button_url} onChange={(event) => updateSection(index, 'button_url', event.target.value)} />
                                        <Field label="Layout" value={section.layout} onChange={(event) => updateSection(index, 'layout', event.target.value)} />
                                        <div className="tablet:col-span-2">
                                            <Field label="Conteúdo" as="textarea" rows="8" value={section.content} onChange={(event) => updateSection(index, 'content', event.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {activeTab === 'seo' && (
                    <section className="grid gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm tablet:grid-cols-2">
                        <Field label="Título SEO" value={data.seo_title} onChange={(event) => setData('seo_title', event.target.value)} />
                        <Field label="Descrição SEO" as="textarea" value={data.seo_description} onChange={(event) => setData('seo_description', event.target.value)} />
                    </section>
                )}

                <Button type="submit" disabled={processing}>Salvar página</Button>
            </form>
        </AdminLayout>
    );
}
