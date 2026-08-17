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
    recipient_email: '',
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
    recipient_email: '',
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

    const imagePreview = (value) => (value ? value : '/reference-assets/hero-home.jpg');
    const sectionPreview = (section) => section.image || '/reference-assets/hero-home.jpg';

const structuredContentTypes = new Set(['institucional', 'contact-data', 'social', 'contact-form']);
const structuredSchemas = {
    home: {
        title: 'Home',
        description: 'Edite os blocos principais da página inicial com segurança e sem campos técnicos desnecessários.',
        sections: ['hero', 'filter', 'numbers', 'differentials'],
    },
    'sobre-nos': {
        title: 'Sobre nós',
        description: 'Organize a apresentação institucional da empresa com blocos reais da página.',
        sections: ['hero', 'history', 'history', 'numbers', 'content', 'mission', 'vision', 'values', 'content'],
    },
    contato: {
        title: 'Contato',
        description: 'Atualize os dados de contato, o formulário e as redes sociais exibidas no site.',
        sections: ['hero', 'contact-data', 'contact-form', 'social'],
    },
    condominios: {
        title: 'Condomínios',
        description: 'Ajuste apenas o cabeçalho da página de listagem. Os empreendimentos continuam vindo da base.',
        sections: ['hero'],
    },
    loteamentos: {
        title: 'Loteamentos',
        description: 'Edite apenas o texto da primeira seção. Filtros e cards vêm do módulo de empreendimentos.',
        sections: ['hero'],
    },
    imoveis: {
        title: 'Imóveis',
        description: 'Edite apenas o texto da primeira seção. Os imóveis continuam sendo gerenciados em Empreendimentos.',
        sections: ['hero'],
    },
};

export default function Form({ item }) {
    const editing = Boolean(item);
    const schema = structuredSchemas[item?.slug] || null;
    const isStructured = structuredTemplates.has(item?.template) || Boolean(schema);
    const canAddSections = !schema;
    const initialSections = useMemo(() => {
        if (presets[item?.slug]?.length) {
            return presets[item.slug].map((section, index) => ({
                ...section,
                sort_order: index,
                is_active: true,
            }));
        }

        if (item?.sections?.length) {
            return item.sections.flatMap((section, index) => {
                if (item?.slug === 'sobre-nos' && (section.type === 'institucional' || section.type === 'mission' || section.type === 'vision' || section.type === 'values') && Array.isArray(section.data?.content)) {
                    return section.data.content.slice(0, 3).map((block, blockIndex) => ({
                        type: ['mission', 'vision', 'values'][blockIndex],
                        label: block.title || ['Missão', 'Visão', 'Valores'][blockIndex],
                        title: block.title || ['Missão', 'Visão', 'Valores'][blockIndex].toUpperCase(),
                        content: block.text || '',
                        image: block.image || '',
                        recipient_email: '',
                        layout: '',
                        sort_order: (section.sort_order ?? index) + (blockIndex * 0.01),
                        is_active: Boolean(section.is_active ?? true),
                    }));
                }

                return [{
                type: section.type || 'content',
                label: section.data?.label || section.type || 'Conteúdo',
                title: section.data?.title || '',
                subtitle: section.data?.subtitle || '',
                content: formatSectionContent(section),
                image: section.data?.image || '',
                button_label: section.data?.button_label || '',
                button_url: section.data?.button_url || '',
                recipient_email: section.data?.recipient_email || '',
                layout: section.data?.layout || '',
                sort_order: section.sort_order ?? index,
                is_active: Boolean(section.is_active ?? true),
                }];
            }).flat();
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

    const prettySectionName = (sectionType) => ({
        hero: 'Seção / Hero',
        filter: 'Seção / Filtro',
        filters: 'Seção / Filtros',
        numbers: 'Seção / Nossos números',
        differentials: 'Seção / Diferenciais',
        history: 'Seção / História',
        content: 'Seção / Conteúdo',
        mission: 'Seção / Missão',
        vision: 'Seção / Visão',
        values: 'Seção / Valores',
        cta: 'Seção / CTA',
        'contact-data': 'Seção / Dados de contato',
        'contact-form': 'Seção / Formulário',
        social: 'Seção / Redes sociais',
    })[sectionType] || 'Seção';

    const sectionDescription = (sectionType) => ({
        hero: 'Título principal e texto de abertura da página.',
        filter: 'Texto de apoio do filtro da Home.',
        filters: 'Texto de apoio da listagem.',
        numbers: 'Blocos numéricos exibidos em destaque.',
        differentials: 'Cards com os principais diferenciais.',
        history: 'Conteúdo editorial com imagem e texto.',
        content: 'Conteúdo complementar da página.',
        mission: 'Card da missão da empresa.',
        vision: 'Card da visão da empresa.',
        values: 'Card dos valores da empresa.',
        cta: 'Chamada para ação com botão.',
        'contact-data': 'Informações de endereço, telefone e e-mail.',
        'contact-form': 'Texto do formulário e e-mail de destino.',
        social: 'Links para redes sociais.',
    })[sectionType] || 'Conteúdo desta seção.';

    const renderStructuredFields = (section, index) => {
        if (!schema) return null;

        if (item?.slug === 'sobre-nos') {
            const sectionType = schema.sections[index];

            if (sectionType === 'hero') {
                return (
                    <div className="space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-[.08em] text-brand">{prettySectionName(sectionType)}</p>
                            <p className="mt-1 text-sm text-gray-500">{sectionDescription(sectionType)}</p>
                        </div>
                        <div className="grid gap-4 tablet:grid-cols-2">
                            <Field label="Label da seção" value={section.label} onChange={(event) => updateSection(index, 'label', event.target.value)} />
                            <Field label="Título" value={section.title} onChange={(event) => updateSection(index, 'title', event.target.value)} />
                            <Field label="Subtítulo" value={section.subtitle} onChange={(event) => updateSection(index, 'subtitle', event.target.value)} />
                            <Field label="Texto introdutório" as="textarea" rows="6" value={section.content} onChange={(event) => updateSection(index, 'content', event.target.value)} />
                            <Field label="Imagem" value={section.image} onChange={(event) => updateSection(index, 'image', event.target.value)} />
                        </div>
                    </div>
                );
            }

            if (sectionType === 'history' || sectionType === 'content' || sectionType === 'cta') {
                return (
                    <div className="space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-[.08em] text-brand">{prettySectionName(sectionType)}</p>
                            <p className="mt-1 text-sm text-gray-500">{sectionDescription(sectionType)}</p>
                        </div>
                        <div className="grid gap-4 tablet:grid-cols-2">
                            <Field label="Label da seção" value={section.label} onChange={(event) => updateSection(index, 'label', event.target.value)} />
                            <Field label="Título" value={section.title} onChange={(event) => updateSection(index, 'title', event.target.value)} />
                            <Field label="Texto" as="textarea" rows="8" value={section.content} onChange={(event) => updateSection(index, 'content', event.target.value)} />
                            <Field label="Imagem" value={section.image} onChange={(event) => updateSection(index, 'image', event.target.value)} />
                            {sectionType === 'cta' && <Field label="Texto do botão" value={section.button_label} onChange={(event) => updateSection(index, 'button_label', event.target.value)} />}
                            {sectionType === 'cta' && <Field label="Link do botão" value={section.button_url} onChange={(event) => updateSection(index, 'button_url', event.target.value)} />}
                        </div>
                    </div>
                );
            }

            if (sectionType === 'filter' || sectionType === 'numbers' || sectionType === 'differentials') {
                return (
                    <div className="space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-[.08em] text-brand">{prettySectionName(sectionType)}</p>
                            <p className="mt-1 text-sm text-gray-500">{sectionDescription(sectionType)}</p>
                        </div>
                        <div className="grid gap-6 tablet:grid-cols-[1fr_0.9fr]">
                            <div className="space-y-4">
                                <Field label="Título" value={section.title} onChange={(event) => updateSection(index, 'title', event.target.value)} />
                                <Field label="Texto de apoio" as="textarea" rows="6" value={section.content} onChange={(event) => updateSection(index, 'content', event.target.value)} />
                            </div>
                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[.08em] text-gray-500">Preview</p>
                                        <p className="text-sm text-gray-600">{section.image ? 'Imagem associada' : 'Sem imagem'}</p>
                                    </div>
                                    <button type="button" className="text-sm font-medium text-red-700" onClick={() => updateSection(index, 'image', '')}>Remover imagem</button>
                                </div>
                                <img src={sectionPreview(section)} alt={section.alt || section.title || ''} className="h-48 w-full object-cover" />
                                <div className="p-4">
                                    <Field label="Imagem" value={section.image} onChange={(event) => updateSection(index, 'image', event.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            if (sectionType === 'mission' || sectionType === 'vision' || sectionType === 'values') {
                return (
                    <div className="space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-[.08em] text-brand">{prettySectionName(sectionType)}</p>
                            <p className="mt-1 text-sm text-gray-500">{sectionDescription(sectionType)}</p>
                        </div>
                        <div className="grid gap-6 tablet:grid-cols-[1.1fr_0.9fr]">
                            <div className="space-y-4">
                                <Field label="Título" value={section.title} onChange={(event) => updateSection(index, 'title', event.target.value)} />
                                <Field label="Texto" as="textarea" rows="8" value={section.content} onChange={(event) => updateSection(index, 'content', event.target.value)} />
                                <Field label="Alt da imagem" value={section.alt || ''} onChange={(event) => updateSection(index, 'alt', event.target.value)} />
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 text-sm text-gray-600">
                                        <input type="checkbox" checked={section.is_active} onChange={(event) => updateSection(index, 'is_active', event.target.checked)} />
                                        Ativa
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[.08em] text-gray-500">Imagem atual</p>
                                            <p className="text-sm text-gray-600">{section.image ? 'Preview carregado' : 'Sem imagem definida'}</p>
                                        </div>
                                        <button type="button" className="text-sm font-medium text-red-700" onClick={() => updateSection(index, 'image', '')}>Remover imagem</button>
                                    </div>
                                    <img src={imagePreview(section.image)} alt={section.alt || section.title || ''} className="h-52 w-full object-cover" />
                                </div>
                                <Field label="Imagem" value={section.image} onChange={(event) => updateSection(index, 'image', event.target.value)} />
                                <p className="text-xs text-gray-500">Cole a URL da imagem atual ou substitua por outra imagem do acervo.</p>
                            </div>
                        </div>
                    </div>
                );
            }

            if (sectionType === 'numbers') {
                return (
                    <div className="space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-[.08em] text-brand">{prettySectionName(sectionType)}</p>
                            <p className="mt-1 text-sm text-gray-500">{sectionDescription(sectionType)}</p>
                        </div>
                        <div className="grid gap-4 tablet:grid-cols-2">
                            <Field label="Label da seção" value={section.label} onChange={(event) => updateSection(index, 'label', event.target.value)} />
                            <Field label="Título" value={section.title} onChange={(event) => updateSection(index, 'title', event.target.value)} />
                            <Field label="Subtítulo" value={section.subtitle} onChange={(event) => updateSection(index, 'subtitle', event.target.value)} />
                            <Field label="Números" as="textarea" rows="8" value={section.content} onChange={(event) => updateSection(index, 'content', event.target.value)} />
                            <p className="tablet:col-span-2 text-xs text-gray-500">Use JSON com lista de itens, preservando os números atuais da página.</p>
                        </div>
                    </div>
                );
            }

            if (sectionType === 'contact-data') {
                const rows = (() => {
                    try {
                        return Array.isArray(JSON.parse(section.content || '[]')) ? JSON.parse(section.content || '[]') : [];
                    } catch {
                        return [];
                    }
                })();
                const setRow = (rowIndex, valueIndex, value) => {
                    const next = rows.map((row, currentIndex) => (currentIndex === rowIndex ? row.map((entry, entryIndex) => (entryIndex === valueIndex ? value : entry)) : row));
                    updateSection(index, 'content', JSON.stringify(next, null, 2));
                };
                return (
                    <div className="space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-[.08em] text-brand">{prettySectionName(sectionType)}</p>
                            <p className="mt-1 text-sm text-gray-500">{sectionDescription(sectionType)}</p>
                        </div>
                        <Field label="Label da seção" value={section.label} onChange={(event) => updateSection(index, 'label', event.target.value)} />
                        {rows.map((row, rowIndex) => (
                            <div key={rowIndex} className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 tablet:grid-cols-2">
                                <Field label="Título" value={row[0] || ''} onChange={(event) => setRow(rowIndex, 0, event.target.value)} />
                                <Field label="Texto" as="textarea" rows="5" value={row[1] || ''} onChange={(event) => setRow(rowIndex, 1, event.target.value)} />
                            </div>
                        ))}
                    </div>
                );
            }

            if (sectionType === 'contact-form') {
                return (
                    <div className="grid gap-6 tablet:grid-cols-[1fr_0.9fr]">
                        <div className="space-y-4">
                            <Field label="Label da seção" value={section.label} onChange={(event) => updateSection(index, 'label', event.target.value)} />
                            <Field label="Título" value={section.title} onChange={(event) => updateSection(index, 'title', event.target.value)} />
                            <Field label="Subtítulo" value={section.subtitle} onChange={(event) => updateSection(index, 'subtitle', event.target.value)} />
                            <Field label="Texto de apoio" as="textarea" rows="6" value={section.content} onChange={(event) => updateSection(index, 'content', event.target.value)} />
                            <Field label="E-mail destinatário" value={section.recipient_email || ''} onChange={(event) => updateSection(index, 'recipient_email', event.target.value)} />
                            <Field label="Texto do botão" value={section.button_label} onChange={(event) => updateSection(index, 'button_label', event.target.value)} />
                        </div>
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-[.08em] text-gray-500">Resumo do formulário</p>
                                <p className="text-sm text-gray-600">Destinatário: {section.recipient_email || 'não definido'}</p>
                            </div>
                            <div className="p-4 text-sm text-gray-600">
                                <p className="font-medium text-gray-900">{section.title || 'Fale com Nossa Equipe'}</p>
                                <p className="mt-2 whitespace-pre-line">{section.content || 'Texto de apoio do formulário.'}</p>
                            </div>
                        </div>
                    </div>
                );
            }

            if (sectionType === 'social') {
                const links = (() => {
                    try {
                        return Array.isArray(JSON.parse(section.content || '[]')) ? JSON.parse(section.content || '[]') : [];
                    } catch {
                        return [];
                    }
                })();
                const setLink = (linkIndex, valueIndex, value) => {
                    const next = links.map((row, currentIndex) => (currentIndex === linkIndex ? row.map((entry, entryIndex) => (entryIndex === valueIndex ? value : entry)) : row));
                    updateSection(index, 'content', JSON.stringify(next, null, 2));
                };
                return (
                    <div className="space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-[.08em] text-brand">{prettySectionName(sectionType)}</p>
                            <p className="mt-1 text-sm text-gray-500">{sectionDescription(sectionType)}</p>
                        </div>
                        <Field label="Label da seção" value={section.label} onChange={(event) => updateSection(index, 'label', event.target.value)} />
                        {links.map((row, linkIndex) => (
                            <div key={linkIndex} className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 tablet:grid-cols-2">
                                <Field label="Nome" value={row[0] || ''} onChange={(event) => setLink(linkIndex, 0, event.target.value)} />
                                <Field label="URL" value={row[1] || ''} onChange={(event) => setLink(linkIndex, 1, event.target.value)} />
                            </div>
                        ))}
                    </div>
                );
            }
        }

        if (['condominios', 'loteamentos', 'imoveis'].includes(item?.slug)) {
            return (
                <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[.08em] text-brand">Seção / Cabeçalho</p>
                        <p className="mt-1 text-sm text-gray-500">Apenas o texto da primeira seção pode ser alterado aqui.</p>
                    </div>
                    <div className="grid gap-6 tablet:grid-cols-[1fr_0.9fr]">
                        <div className="space-y-4">
                            <Field label="Label da seção" value={section.label} onChange={(event) => updateSection(index, 'label', event.target.value)} />
                            <Field label="Título" value={section.title} onChange={(event) => updateSection(index, 'title', event.target.value)} />
                            <Field label="Texto introdutório" as="textarea" rows="6" value={section.content} onChange={(event) => updateSection(index, 'content', event.target.value)} />
                        </div>
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[.08em] text-gray-500">Preview da capa</p>
                                    <p className="text-sm text-gray-600">{section.image ? 'Imagem carregada' : 'Sem imagem definida'}</p>
                                </div>
                                <button type="button" className="text-sm font-medium text-red-700" onClick={() => updateSection(index, 'image', '')}>Remover imagem</button>
                            </div>
                            <img src={sectionPreview(section)} alt={section.alt || section.title || ''} className="h-48 w-full object-cover" />
                            <div className="p-4">
                                <Field label="Imagem" value={section.image} onChange={(event) => updateSection(index, 'image', event.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

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
                                            {schema ? (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{prettySectionName(section.type)}</p>
                                                    <p className="text-xs text-gray-500">{sectionDescription(section.type)}</p>
                                                </div>
                                            ) : (
                                                <Field label="Nome da seção" value={section.label || ''} onChange={(event) => updateSection(index, 'label', event.target.value)} />
                                            )}
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
                                            {!schema && (
                                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                                    <input type="checkbox" checked={section.is_active} onChange={(event) => updateSection(index, 'is_active', event.target.checked)} />
                                                    Ativa
                                                </label>
                                            )}
                                            {schema && (
                                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                                    <input type="checkbox" checked={section.is_active} onChange={(event) => updateSection(index, 'is_active', event.target.checked)} />
                                                    Ativa
                                                </label>
                                            )}
                                        </div>
                                        {!schema && <button type="button" onClick={() => removeSection(index)} className="text-sm font-medium text-red-700">Excluir</button>}
                                    </div>

                                    {schema ? (
                                        <div className="space-y-4">
                                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                                                Editor específico desta página estruturada. Só os campos reais do layout aparecem aqui.
                                            </div>
                                            {renderStructuredFields(section, index)}
                                        </div>
                                    ) : (
                                        <div className="grid gap-4 tablet:grid-cols-2">
                                            <Field label="Título" value={section.title} onChange={(event) => updateSection(index, 'title', event.target.value)} />
                                            <Field label="Subtítulo" value={section.subtitle} onChange={(event) => updateSection(index, 'subtitle', event.target.value)} />
                                            <Field label="Imagem" value={section.image} onChange={(event) => updateSection(index, 'image', event.target.value)} />
                                            {section.type !== 'numbers' && section.type !== 'social' && section.type !== 'contact-data' && <Field label="Texto do botão" value={section.button_label} onChange={(event) => updateSection(index, 'button_label', event.target.value)} />}
                                            {section.type === 'hero' && <Field label="Link do botão" value={section.button_url} onChange={(event) => updateSection(index, 'button_url', event.target.value)} />}
                                            <Field label="Layout" value={section.layout} onChange={(event) => updateSection(index, 'layout', event.target.value)} />
                                            <div className="tablet:col-span-2">
                                                <Field label="Texto" as="textarea" rows="8" value={section.content} onChange={(event) => updateSection(index, 'content', event.target.value)} />
                                            </div>
                                        </div>
                                    )}
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
