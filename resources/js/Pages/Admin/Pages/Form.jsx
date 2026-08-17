import { useMemo, useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import Field from '../../../Components/Forms/Field';
import SelectField from '../../../Components/Forms/SelectField';
import Button from '../../../Components/UI/Button';

const baseSection = (type, label) => ({
    type,
    label,
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

const presets = {
    home: [
        baseSection('hero', 'Hero / Carrossel'),
        baseSection('filter', 'Filtro de Empreendimentos'),
        baseSection('numbers', 'Nossos Números'),
        baseSection('differentials', 'Diferenciais'),
    ],
    'sobre-nos': [
        baseSection('hero', 'Hero'),
        baseSection('history', 'História'),
        baseSection('institucional', 'Missão, Visão e Valores'),
        baseSection('cta', 'CTA'),
    ],
    condominios: [
        baseSection('hero', 'Cabeçalho da Página'),
        baseSection('filters', 'Filtros'),
    ],
    loteamentos: [
        baseSection('hero', 'Cabeçalho da Página'),
        baseSection('filters', 'Filtros'),
    ],
    imoveis: [
        baseSection('hero', 'Cabeçalho da Página'),
        baseSection('filters', 'Filtros'),
    ],
    contato: [
        baseSection('hero', 'Cabeçalho da Página'),
        baseSection('contact-data', 'Dados de Contato'),
        baseSection('contact-form', 'Formulário'),
        baseSection('social', 'Redes Sociais'),
    ],
};

const structuredTemplates = new Set(['home', 'institutional', 'listing', 'contact']);

const createSection = (type = 'content', label = 'Conteúdo') => ({
    type,
    label,
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

const formatSectionContent = (section) => {
    if (Array.isArray(section?.data?.content)) {
        return JSON.stringify(section.data.content, null, 2);
    }

    return section?.data?.content || '';
};

const structuredContentTypes = new Set(['institucional', 'contact-data', 'social', 'contact-form']);

export default function Form({ item }) {
    const editing = Boolean(item);
    const isStructured = structuredTemplates.has(item?.template) || presets[item?.slug];
    const canAddSections = !isStructured;
    const initialSections = useMemo(() => {
        if (presets[item?.slug]?.length) {
            return presets[item.slug].map((section, index) => ({ ...section, sort_order: index }));
        }

        if (item?.sections?.length) {
            return item.sections.map((section, index) => ({
                type: section.type || 'content',
                label: section.data?.label || section.type || 'Conteúdo',
                title: section.data?.title || '',
                subtitle: section.data?.subtitle || '',
                content: formatSectionContent(section),
                image: section.data?.image || '',
                button_label: section.data?.button_label || '',
                button_url: section.data?.button_url || '',
                layout: section.data?.layout || '',
                sort_order: section.sort_order ?? index,
                is_active: Boolean(section.is_active ?? true),
            }));
        }

        return [createSection('content', 'Conteúdo')];
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
    const [activeTab, setActiveTab] = useState('general');

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
        <AdminLayout title={editing ? `Editar página: ${item.title}` : 'Nova página'}>
            <form onSubmit={submit} className="space-y-6">
                <div className="flex flex-wrap gap-2">
                    {[
                        ['general', 'Geral'],
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

                {activeTab === 'general' && (
                    <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">Dados gerais</h2>
                            <p className="text-sm text-gray-500">Nome, slug, template e estado da página.</p>
                        </div>
                        <div className="grid gap-5 tablet:grid-cols-2">
                            <Field label="Título" value={data.title} onChange={(event) => setData('title', event.target.value)} error={errors.title} />
                            <Field label="Slug" value={data.slug} onChange={(event) => setData('slug', event.target.value)} error={errors.slug} />
                            <SelectField
                                label="Template"
                                options={[
                                    { id: 'home', name: 'Home' },
                                    { id: 'institutional', name: 'Institucional' },
                                    { id: 'listing', name: 'Listagem' },
                                    { id: 'contact', name: 'Contato' },
                                    { id: 'page', name: 'Página livre' },
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
                            {isStructured ? (
                                <div className="tablet:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                                    Esta é uma página estruturada. A edição principal acontece nas seções abaixo, não no HTML bruto.
                                </div>
                            ) : (
                                <div className="tablet:col-span-2">
                                    <Field label="Conteúdo" as="textarea" rows="14" value={data.content} onChange={(event) => setData('content', event.target.value)} />
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeTab === 'sections' && (
                    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Seções da página</h2>
                                <p className="text-sm text-gray-500">Cada bloco tem nome claro e controla uma parte específica do site.</p>
                            </div>
                            {canAddSections && <Button type="button" onClick={addSection}>Adicionar seção</Button>}
                        </div>

                        <div className="space-y-5">
                            {data.sections.map((section, index) => (
                                <div key={`${section.type}-${index}`} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Field label="Nome da seção" value={section.label || ''} onChange={(event) => updateSection(index, 'label', event.target.value)} />
                                            {canAddSections && (
                                                <SelectField
                                                    label={`Tipo ${index + 1}`}
                                                    options={[
                                                        { id: 'hero', name: 'Hero' },
                                                        { id: 'filter', name: 'Filtro' },
                                                        { id: 'numbers', name: 'Números' },
                                                        { id: 'differentials', name: 'Diferenciais' },
                                                        { id: 'history', name: 'História' },
                                                        { id: 'institucional', name: 'Institucional' },
                                                        { id: 'cta', name: 'CTA' },
                                                        { id: 'contact-data', name: 'Dados de contato' },
                                                        { id: 'contact-form', name: 'Formulário' },
                                                        { id: 'social', name: 'Redes sociais' },
                                                        { id: 'content', name: 'Conteúdo' },
                                                    ]}
                                                    value={section.type}
                                                    onChange={(event) => updateSection(index, 'type', event.target.value)}
                                                />
                                            )}
                                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                                <input type="checkbox" checked={section.is_active} onChange={(event) => updateSection(index, 'is_active', event.target.checked)} />
                                                Ativa
                                            </label>
                                        </div>
                                        <button type="button" onClick={() => removeSection(index)} className="text-sm font-medium text-red-700">Excluir</button>
                                    </div>

                                    <div className="grid gap-4 tablet:grid-cols-2">
                                        <Field label="Título" value={section.title} onChange={(event) => updateSection(index, 'title', event.target.value)} />
                                        <Field label="Subtítulo" value={section.subtitle} onChange={(event) => updateSection(index, 'subtitle', event.target.value)} />
                                        <Field label="Imagem" value={section.image} onChange={(event) => updateSection(index, 'image', event.target.value)} />
                                        {section.type !== 'numbers' && section.type !== 'social' && section.type !== 'contact-data' && <Field label="Texto do botão" value={section.button_label} onChange={(event) => updateSection(index, 'button_label', event.target.value)} />}
                                        {section.type === 'hero' && <Field label="Link do botão" value={section.button_url} onChange={(event) => updateSection(index, 'button_url', event.target.value)} />}
                                        {canAddSections && <Field label="Layout" value={section.layout} onChange={(event) => updateSection(index, 'layout', event.target.value)} />}
                                        <div className="tablet:col-span-2">
                                            <Field
                                                label={structuredContentTypes.has(section.type) ? 'Conteúdo estruturado' : 'Texto'}
                                                as="textarea"
                                                rows={structuredContentTypes.has(section.type) ? '10' : '8'}
                                                value={section.content}
                                                onChange={(event) => updateSection(index, 'content', event.target.value)}
                                            />
                                            {structuredContentTypes.has(section.type) && (
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Para estas seções, o campo aceita texto simples ou JSON válido quando houver lista de itens.
                                                </p>
                                            )}
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

                <div className="flex flex-wrap gap-3">
                    <Button type="submit" disabled={processing}>Salvar página</Button>
                    {editing && isStructured && <Link href={`/admin/pages/${item.slug}/edit`} className="brand-button inline-flex">Recarregar</Link>}
                </div>
            </form>
        </AdminLayout>
    );
}
