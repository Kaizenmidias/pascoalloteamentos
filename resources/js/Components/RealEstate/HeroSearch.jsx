import { router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

function MainTab({ active, children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`min-h-14 shrink-0 rounded-[18px] border px-6 py-3 text-sm font-medium transition tablet:px-8 tablet:text-base ${
                active
                    ? 'border-brand text-brand'
                    : 'border-[#d9d9d9] text-[#7b7b7b]'
            } bg-white`}
        >
            {children}
        </button>
    );
}

function OptionLine({ options = [], value, onChange, compactLabel = false }) {
    if (!options.length) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm tablet:gap-x-8">
            <button
                type="button"
                onClick={() => onChange('')}
                className={`transition ${!value ? 'font-semibold text-brand' : 'font-normal text-[#7d7d7d] hover:text-ink'}`}
            >
                Todos
            </button>
            {options.map((option) => (
                <button
                    key={option.slug}
                    type="button"
                    onClick={() => onChange(option.slug)}
                    className={`transition ${value === option.slug ? 'font-semibold text-brand' : 'font-normal text-[#7d7d7d] hover:text-ink'}`}
                >
                    {compactLabel ? option.short_name || option.name : option.name}
                </button>
            ))}
        </div>
    );
}

function useInitialTab(includeCategory, categories, cities, statuses, types) {
    if (includeCategory && categories.length) {
        return 'category';
    }
    if (cities.length) return 'city';
    if (statuses.length) return 'status';
    if (types.length) return 'type';
    return 'city';
}

export default function HeroSearch({
    action = '/imoveis',
    filters = {},
    cities = [],
    types = [],
    statuses = [],
    businessTypes = [],
    categories = [],
    includeCategory = false,
    onChange = null,
    autoSubmit = true,
    onClear = null,
}) {
    const [values, setValues] = useState({
        category: filters.category || '',
        type: filters.type || '',
        city: filters.city || '',
        status: filters.status || '',
        business_type: filters.business_type || '',
    });

    const [activeTab, setActiveTab] = useState(useInitialTab(includeCategory, categories, cities, statuses, types));

    useEffect(() => {
        setActiveTab(useInitialTab(includeCategory, categories, cities, statuses, types));
    }, [includeCategory, categories, cities, statuses, types]);

    const availableTypes = useMemo(() => {
        if (!includeCategory || !values.category) return types;
        const match = {
            properties: types,
            condominiums: types,
            subdivisions: types,
        };
        return match[values.category] || types;
    }, [includeCategory, types, values.category]);

    const submit = (next) => {
        if (!autoSubmit) return;
        const payload = { ...next };
        if (!includeCategory) delete payload.category;
        router.get(action, payload, { preserveState: true, preserveScroll: true, replace: true });
    };

    const update = (key, nextValue) => {
        const next = { ...values, [key]: nextValue };
        setValues(next);
        onChange?.(next);
        submit(next);
    };

    const clear = () => {
        const next = { category: '', type: '', city: '', status: '', business_type: '' };
        setValues(next);
        onChange?.(next);
        onClear?.();
        submit(next);
    };

    const sections = includeCategory
        ? [
            { key: 'category', label: 'Categorias', options: categories, value: values.category, placeholder: 'Todos', compactLabel: true },
            { key: 'city', label: 'Cidade', options: cities, value: values.city, placeholder: 'Todos' },
            { key: 'type', label: 'Tipo de imóvel', options: availableTypes, value: values.type, placeholder: 'Todos' },
            ...(businessTypes.length ? [{ key: 'business_type', label: 'Tipo de negócio', options: businessTypes, value: values.business_type, placeholder: 'Todos' }] : []),
        ]
        : [
            { key: 'city', label: 'Cidade', options: cities, value: values.city, placeholder: 'Todos' },
            ...(statuses.length ? [{ key: 'status', label: 'Status do empreendimento', options: statuses, value: values.status, placeholder: 'Todos' }] : []),
            ...(types.length ? [{ key: 'type', label: 'Tipo de imóvel', options: availableTypes, value: values.type, placeholder: 'Todos' }] : []),
        ];

    const activeSection = sections.find((section) => section.key === activeTab) || sections[0];

    const mainTabs = includeCategory
        ? [
            { key: 'category', label: 'Residenciais' },
            { key: 'city', label: 'Cidade' },
            ...(businessTypes.length ? [{ key: 'business_type', label: 'Tipo de negócio' }] : []),
        ]
        : [
            { key: 'city', label: 'Cidade' },
            ...(statuses.length ? [{ key: 'status', label: 'Status do empreendimento' }] : []),
            ...(types.length ? [{ key: 'type', label: 'Tipo de imóvel' }] : []),
        ];

    return (
        <div className="mx-auto mt-10 max-w-[76rem]">
            <div className="space-y-7">
                <div className="flex flex-nowrap gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden tablet:gap-4">
                    {mainTabs.map((tab) => (
                        <MainTab key={tab.key} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)}>
                            {tab.label}
                        </MainTab>
                    ))}
                </div>
                <div className="min-h-[4rem]">
                    {activeSection && (
                        <OptionLine
                            options={activeSection.options}
                            value={values[activeSection.key]}
                            onChange={(nextValue) => update(activeSection.key, nextValue)}
                            compactLabel={activeSection.key === 'category'}
                        />
                    )}
                </div>
                {onClear && (
                    <div className="flex justify-end">
                        <button type="button" onClick={clear} className="text-xs font-medium uppercase tracking-[.08em] text-brand transition hover:text-brand-dark">
                            Limpar filtros
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
