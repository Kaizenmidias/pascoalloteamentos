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
        baseSection('numbers', 'Nossos NÃƒÆ’Ã‚Âºmeros'),
        baseSection('differentials', 'Diferenciais'),
    ],
    'sobre-nos': [
        baseSection('hero', 'Hero'),
        baseSection('history', 'HistÃƒÆ’Ã‚Â³ria'),
        baseSection('mission', 'MissÃƒÆ’Ã‚Â£o'),
        baseSection('vision', 'VisÃƒÆ’Ã‚Â£o'),
        baseSection('values', 'Valores'),
        baseSection('cta', 'CTA'),
    ],
    condominios: [
        baseSection('hero', 'CabeÃƒÆ’Ã‚Â§alho da PÃƒÆ’Ã‚Â¡gina'),
        baseSection('filters', 'Filtros'),
    ],
    loteamentos: [
        baseSection('hero', 'CabeÃƒÆ’Ã‚Â§alho da PÃƒÆ’Ã‚Â¡gina'),
        baseSection('filters', 'Filtros'),
    ],
    imoveis: [
        baseSection('hero', 'CabeÃƒÆ’Ã‚Â§alho da PÃƒÆ’Ã‚Â¡gina'),
        baseSection('filters', 'Filtros'),
    ],
    contato: [
        baseSection('hero', 'CabeÃƒÆ’Ã‚Â§alho da PÃƒÆ’Ã‚Â¡gina'),
        baseSection('contact-data', 'Dados de Contato'),
        baseSection('contact-form', 'FormulÃƒÆ’Ã‚Â¡rio'),
        baseSection('social', 'Redes Sociais'),
    ],
};

const structuredTemplates = new Set(['home', 'institutional', 'listing', 'contact']);

const createSection = (type = 'content', label = 'ConteÃƒÆ’Ã‚Âºdo') => ({
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

const structuredSchemas = {
    home: {
        title: 'Home',
        description: 'Edite os blocos principais da pÃƒÆ’Ã‚Â¡gina inicial com seguranÃƒÆ’Ã‚Â§a e sem campos tÃƒÆ’Ã‚Â©cnicos desnecessÃƒÆ’Ã‚Â¡rios.',
        sections: ['hero', 'filter', 'numbers', 'differentials'],
    },
    'sobre-nos': {
        title: 'Sobre nÃƒÆ’Ã‚Â³s',
        description: 'Organize a apresentaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o institucional da empresa com blocos reais da pÃƒÆ’Ã‚Â¡gina.',
        sections: ['hero', 'history', 'numbers', 'content', 'mission', 'vision', 'values', 'differential', 'cta'],
    },
    contato: {
        title: 'Contato',
        description: 'Atualize os dados de contato, o formulÃƒÆ’Ã‚Â¡rio e as redes sociais exibidas no site.',
        sections: ['hero', 'contact-data', 'contact-form', 'social'],
    },
    condominios: {
        title: 'CondomÃƒÆ’Ã‚Â­nios',
        description: 'Ajuste apenas o cabeÃƒÆ’Ã‚Â§alho da pÃƒÆ’Ã‚Â¡gina de listagem. Os empreendimentos continuam vindo da base.',
        sections: ['hero'],
    },
    loteamentos: {
        title: 'Loteamentos',
        description: 'Edite apenas o texto da primeira seÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o. Filtros e cards vÃƒÆ’Ã‚Âªm do mÃƒÆ’Ã‚Â³dulo de empreendimentos.',
        sections: ['hero'],
    },
    imoveis: {
        title: 'ImÃƒÆ’Ã‚Â³veis',
        description: 'Edite apenas o texto da primeira seÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o. Os imÃƒÆ’Ã‚Â³veis continuam sendo gerenciados em Empreendimentos.',
        sections: ['hero'],
    },
};

export default function Form({ item }) {
    const editing = Boolean(item);
    const schema = structuredSchemas[item?.slug] || null;
    const isStructured = structuredTemplates.has(item?.template) || Boolean(schema);
    const canAddSections = !schema;
    const initialSections = useMemo(() => {
        if (item?.sections?.length) {
            return item.sections.flatMap((section, index) => {
                if (item?.slug === 'sobre-nos') {
                    const legacyInstitutional = section.type === 'institucional' || (section.type === 'history' && /miss[aÃƒÂ£]o|vis[aÃƒÂ£]o|valores/i.test(`${section.data?.label || ''} ${section.data?.title || ''}`));

                    if (legacyInstitutional && Array.isArray(section.data?.content)) {
                        return section.data.content.slice(0, 3).map((block, blockIndex) => ({
                            type: ['mission', 'vision', 'values'][blockIndex],
                            title: block.title || ['MISSÃƒÆ’O', 'VISÃƒÆ’O', 'VALORES'][blockIndex],
                            content: block.text || '',
                            image: block.image || '',
                            recipient_email: '',
                            layout: '',
                            sort_order: (section.sort_order ?? index) + (blockIndex * 0.01),
                            is_active: Boolean(section.is_active ?? true),
                        }));
                    }

                    if (legacyInstitutional && typeof section.data?.content === 'string') {
                        return [
                            {
                                type: 'mission',
                                title: 'MISSÃƒÆ’O',
                                content: 'Desenvolver empreendimentos planejados com qualidade, seguranÃƒÂ§a e infraestrutura completa, proporcionando valorizaÃƒÂ§ÃƒÂ£o, bem-estar e qualidade de vida aos nossos clientes.',
                                image: '/reference-assets/blog-city.jpg',
                                recipient_email: '',
                                layout: '',
                                sort_order: (section.sort_order ?? index) + 0.01,
                                is_active: Boolean(section.is_active ?? true),
                            },
                            {
                                type: 'vision',
                                title: 'VISÃƒÆ’O',
                                content: 'Ser referÃƒÂªncia em loteamentos e empreendimentos imobiliÃƒÂ¡rios no Oeste do ParanÃƒÂ¡, reconhecida pela excelÃƒÂªncia, credibilidade e desenvolvimento sustentÃƒÂ¡vel.',
                                image: '/reference-assets/about-plans.jpg',
                                recipient_email: '',
                                layout: '',
                                sort_order: (section.sort_order ?? index) + 0.02,
                                is_active: Boolean(section.is_active ?? true),
                            },
                            {
                                type: 'values',
                                title: 'VALORES',
                                content: 'Nossos valores se refletem no compromisso com a qualidade, no respeito ÃƒÂ s pessoas, na transparÃƒÂªncia das relaÃƒÂ§ÃƒÂµes e na responsabilidade em cada empreendimento que desenvolvemos.',
                                image: '/reference-assets/about-meeting.jpg',
                                recipient_email: '',
                                layout: '',
                                sort_order: (section.sort_order ?? index) + 0.03,
                                is_active: Boolean(section.is_active ?? true),
                            },
                        ];
                    }
                }

                return [{
                    type: section.type || 'content',
                    label: section.data?.label || section.type || 'ConteÃƒÂºdo',
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

        if (presets[item?.slug]?.length) {
            return presets[item.slug].map((section, index) => ({
                ...section,
                sort_order: index,
                is_active: true,
            }));
        }

        return [createSection('content', 'ConteÃƒÂºdo')];
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
        hero: 'SeÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o / Hero',
        filter: 'SeÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o / Filtro',
        filters: 'SeÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o / Filtros',
        numbers: 'SeÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o / Nossos nÃƒÆ’Ã‚Âºmeros',
        differentials: 'SeÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o / Diferenciais',
        history: 'SeÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o / HistÃƒÆ’Ã‚Â³ria',
        content: 'SeÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o / ConteÃƒÆ’Ã‚Âºdo',
        mission: 'SeÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o / MissÃƒÆ’Ã‚Â£o',
        vision: 'SeÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o / VisÃƒÆ’Ã‚Â£o',
        values: 'SeÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o / Valores',
        cta: 'SeÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o / CTA',
        'contact-data': 'SeÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o / Dados de contato',
        'contact-form': 'SeÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o / FormulÃƒÆ’Ã‚Â¡rio',
        social: 'SeÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o / Redes sociais',
    })[sectionType] || 'SeÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o';

    const sectionDescription = (sectionType) => ({
        hero: 'TÃƒÆ’Ã‚Â­tulo principal e texto de abertura da pÃƒÆ’Ã‚Â¡gina.',
        filter: 'Texto de apoio do filtro da Home.',
        filters: 'Texto de apoio da listagem.',
        numbers: 'Blocos numÃƒÆ’Ã‚Â©ricos exibidos em destaque.',
        differentials: 'Cards com os principais diferenciais.',
        history: 'ConteÃƒÆ’Ã‚Âºdo editorial com imagem e texto.',
        content: 'ConteÃƒÆ’Ã‚Âºdo complementar da pÃƒÆ’Ã‚Â¡gina.',
        mission: 'Card da missÃƒÆ’Ã‚Â£o da empresa.',
        vision: 'Card da visÃƒÆ’Ã‚Â£o da empresa.',
        values: 'Card dos valores da empresa.',
        cta: 'Chamada para aÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o com botÃƒÆ’Ã‚Â£o.',
        'contact-data': 'InformaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes de endereÃƒÆ’Ã‚Â§o, telefone e e-mail.',
        'contact-form': 'Texto do formulÃƒÆ’Ã‚Â¡rio e e-mail de destino.',
        social: 'Links para redes sociais.',
    })[sectionType] || 'ConteÃƒÆ’Ã‚Âºdo desta seÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o.';

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
                            <Field label="Label da seÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o" value={section.label} onChange={(event) => updateSection(index, 'label', event.target.value)} />
                            <Field label="TÃƒÆ’Ã‚Â­tulo" value={section.title} onChange={(event) => updateSection(index, 'title', event.target.value)} />
                            <Field label="SubtÃƒÆ’Ã‚Â­tulo" value={section.subtitle} onChange={(event) => updateSection(index, 'subtitle', event.target.value)} />
                            <Field label="Texto introdutÃƒÆ’Ã‚Â³rio" as="textarea" rows="6" value={section.content} onChange={(event) => updateSection(index, 'content', event.target.value)} />
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
                            <Field label="Label da seÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o" value={section.label} onChange={(event) => updateSection(index, 'label', event.target.value)} />
                            <Field label="TÃƒÆ’Ã‚Â­tulo" value={section.title} onChange={(event) => updateSection(index, 'title', event.target.value)} />
                            <Field label="Texto" as="textarea" rows="8" value={section.content} onChange={(event) => updateSection(index, 'content', event.target.value)} />
                            <Field label="Imagem" value={section.image} onChange={(event) => updateSection(index, 'image', event.target.value)} />
                            {sectionType === 'cta' && <Field label="Texto do botÃƒÆ’Ã‚Â£o" value={section.button_label} onChange={(event) => updateSection(index, 'button_label', event.target.value)} />}
                            {sectionType === 'cta' && <Field label="Link do botÃƒÆ’Ã‚Â£o" value={section.button_url} onChange={(event) => updateSection(index, 'button_url', event.target.value)} />}
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
                                <Field label="TÃƒÆ’Ã‚Â­tulo" value={section.title} onChange={(event) => updateSection(index, 'title', event.target.value)} />
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
                                <Field label="TÃƒÆ’Ã‚Â­tulo" value={section.title} onChange={(event) => updateSection(index, 'title', event.target.value)} />
                                <Field label="Texto" as="textarea" rows="8" value={section.content} onChange={(event) => updateSection(index, 'content', event.target.value)} />
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
                                    <img src={imagePreview(section.image)} alt={section.title || ''} className="h-52 w-full object-cover" />
                                </div>
                                <Field label="Trocar imagem" value={section.image} onChange={(event) => updateSection(index, 'image', event.target.value)} />
                                <p className="text-xs text-gray-500">Use a imagem atual do card ou substitua pela URL de outra imagem jÃƒÆ’Ã‚Â¡ cadastrada.</p>
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
                            <Field label="Label da seÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o" value={section.label} onChange={(event) => updateSection(index, 'label', event.target.value)} />
                            <Field label="TÃƒÆ’Ã‚Â­tulo" value={section.title} onChange={(event) => updateSection(index, 'title', event.target.value)} />
                            <Field label="SubtÃƒÆ’Ã‚Â­tulo" value={section.subtitle} onChange={(event) => updateSection(index, 'subtitle', event.target.value)} />
                            <Field label="NÃƒÆ’Ã‚Âºmeros" as="textarea" rows="8" value={section.content} onChange={(event) => updateSection(index, 'content', event.target.value)} />
                            <p className="tablet:col-span-2 text-xs text-gray-500">Use JSON com lista de itens, preservando os nÃƒÆ’Ã‚Âºmeros atuais da pÃƒÆ’Ã‚Â¡gina.</p>
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
                        <Field label="Label da seÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o" value={section.label} onChange={(event) => updateSection(index, 'label', event.target.value)} />
                        {rows.map((row, rowIndex) => (
                            <div key={rowIndex} className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 tablet:grid-cols-2">
                                <Field label="TÃƒÆ’Ã‚Â­tulo" value={row[0] || ''} onChange={(event) => setRow(rowIndex, 0, event.target.value)} />
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
                            <Field label="Label da seÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o" value={section.label} onChange={(event) => updateSection(index, 'label', event.target.value)} />
                            <Field label="TÃƒÆ’Ã‚Â­tulo" value={section.title} onChange={(event) => updateSection(index, 'title', event.target.value)} />
                            <Field label="SubtÃƒÆ’Ã‚Â­tulo" value={section.subtitle} onChange={(event) => updateSection(index, 'subtitle', event.target.value)} />
                            <Field label="Texto de apoio" as="textarea" rows="6" value={section.content} onChange={(event) => updateSection(index, 'content', event.target.value)} />
                            <Field label="E-mail destinatÃƒÆ’Ã‚Â¡rio" value={section.recipient_email || ''} onChange={(event) => updateSection(index, 'recipient_email', event.target.value)} />
                            <Field label="Texto do botÃƒÆ’Ã‚Â£o" value={section.button_label} onChange={(event) => updateSection(index, 'button_label', event.target.value)} />
                        </div>
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-[.08em] text-gray-500">Resumo do formulÃƒÆ’Ã‚Â¡rio</p>
                                <p className="text-sm text-gray-600">DestinatÃƒÆ’Ã‚Â¡rio: {section.recipient_email || 'nÃƒÆ’Ã‚Â£o definido'}</p>
                            </div>
                            <div className="p-4 text-sm text-gray-600">
                                <p className="font-medium text-gray-900">{section.title || 'Fale com Nossa Equipe'}</p>
                                <p className="mt-2 whitespace-pre-line">{section.content || 'Texto de apoio do formulÃƒÆ’Ã‚Â¡rio.'}</p>
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
                        <Field label="Label da seÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o" value={section.label} onChange={(event) => updateSection(index, 'label', event.target.value)} />
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
                        <p className="text-xs font-semibold uppercase tracking-[.08em] text-brand">SeÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o / CabeÃƒÆ’Ã‚Â§alho</p>
                        <p className="mt-1 text-sm text-gray-500">Apenas o texto da primeira seÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o pode ser alterado aqui.</p>
                    </div>
                    <div className="grid gap-6 tablet:grid-cols-[1fr_0.9fr]">
                        <div className="space-y-4">
                            <Field label="Label da seÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o" value={section.label} onChange={(event) => updateSection(index, 'label', event.target.value)} />
                            <Field label="TÃƒÆ’Ã‚Â­tulo" value={section.title} onChange={(event) => updateSection(index, 'title', event.target.value)} />
                            <Field label="Texto introdutÃƒÆ’Ã‚Â³rio" as="textarea" rows="6" value={section.content} onChange={(event) => updateSection(index, 'content', event.target.value)} />
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
        <AdminLayout title={editing ? `Editar pÃƒÆ’Ã‚Â¡gina: ${item.title}` : 'Nova pÃƒÆ’Ã‚Â¡gina'}>
            <form onSubmit={submit} className="space-y-6">
                <div className="flex flex-wrap gap-2">
                    {[
                        ['general', 'Geral'],
                        ['sections', 'SeÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes'],
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
                            <p className="text-sm text-gray-500">Nome, slug, template e estado da pÃƒÆ’Ã‚Â¡gina.</p>
                        </div>
                        <div className="grid gap-5 tablet:grid-cols-2">
                            <Field label="TÃƒÆ’Ã‚Â­tulo" value={data.title} onChange={(event) => setData('title', event.target.value)} error={errors.title} />
                            <Field label="Slug" value={data.slug} onChange={(event) => setData('slug', event.target.value)} error={errors.slug} />
                            <SelectField
                                label="Template"
                                options={[
                                    { id: 'home', name: 'Home' },
                                    { id: 'institutional', name: 'Institucional' },
                                    { id: 'listing', name: 'Listagem' },
                                    { id: 'contact', name: 'Contato' },
                                    { id: 'page', name: 'PÃƒÆ’Ã‚Â¡gina livre' },
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
                                    Esta ÃƒÆ’Ã‚Â© uma pÃƒÆ’Ã‚Â¡gina estruturada. A ediÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o principal acontece nas seÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes abaixo, nÃƒÆ’Ã‚Â£o no HTML bruto.
                                </div>
                            ) : (
                                <div className="tablet:col-span-2">
                                    <Field label="ConteÃƒÆ’Ã‚Âºdo" as="textarea" rows="14" value={data.content} onChange={(event) => setData('content', event.target.value)} />
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeTab === 'sections' && (
                    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">SeÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes da pÃƒÆ’Ã‚Â¡gina</h2>
                                <p className="text-sm text-gray-500">Cada bloco tem nome claro e controla uma parte especÃƒÆ’Ã‚Â­fica do site.</p>
                            </div>
                            {canAddSections && <Button type="button" onClick={addSection}>Adicionar seÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o</Button>}
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
                                                <Field label="Nome da seÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o" value={section.label || ''} onChange={(event) => updateSection(index, 'label', event.target.value)} />
                                            )}
                                            {canAddSections && (
                                                <SelectField
                                                    label={`Tipo ${index + 1}`}
                                                    options={[
                                                        { id: 'hero', name: 'Hero' },
                                                        { id: 'filter', name: 'Filtro' },
                                                        { id: 'numbers', name: 'NÃƒÆ’Ã‚Âºmeros' },
                                                        { id: 'differentials', name: 'Diferenciais' },
                                                        { id: 'history', name: 'HistÃƒÆ’Ã‚Â³ria' },
                                                        { id: 'institucional', name: 'Institucional' },
                                                        { id: 'cta', name: 'CTA' },
                                                        { id: 'contact-data', name: 'Dados de contato' },
                                                        { id: 'contact-form', name: 'FormulÃƒÆ’Ã‚Â¡rio' },
                                                        { id: 'social', name: 'Redes sociais' },
                                                        { id: 'content', name: 'ConteÃƒÆ’Ã‚Âºdo' },
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
                                                Editor especÃƒÆ’Ã‚Â­fico desta pÃƒÆ’Ã‚Â¡gina estruturada. SÃƒÆ’Ã‚Â³ os campos reais do layout aparecem aqui.
                                            </div>
                                            {renderStructuredFields(section, index)}
                                        </div>
                                    ) : (
                                        <div className="grid gap-4 tablet:grid-cols-2">
                                            <Field label="TÃƒÆ’Ã‚Â­tulo" value={section.title} onChange={(event) => updateSection(index, 'title', event.target.value)} />
                                            <Field label="SubtÃƒÆ’Ã‚Â­tulo" value={section.subtitle} onChange={(event) => updateSection(index, 'subtitle', event.target.value)} />
                                            <Field label="Imagem" value={section.image} onChange={(event) => updateSection(index, 'image', event.target.value)} />
                                            {section.type === 'hero' && <Field label="Link do botÃƒÆ’Ã‚Â£o" value={section.button_url} onChange={(event) => updateSection(index, 'button_url', event.target.value)} />}
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
                        <Field label="TÃƒÆ’Ã‚Â­tulo SEO" value={data.seo_title} onChange={(event) => setData('seo_title', event.target.value)} />
                        <Field label="DescriÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o SEO" as="textarea" value={data.seo_description} onChange={(event) => setData('seo_description', event.target.value)} />
                    </section>
                )}

                <div className="flex flex-wrap gap-3">
                    <Button type="submit" disabled={processing}>Salvar pÃƒÆ’Ã‚Â¡gina</Button>
                    {editing && isStructured && <Link href={`/admin/pages/${item.slug}/edit`} className="brand-button inline-flex">Recarregar</Link>}
                </div>
            </form>
        </AdminLayout>
    );
}
