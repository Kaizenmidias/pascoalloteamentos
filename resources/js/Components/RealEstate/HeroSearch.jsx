import { router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

function MainTab({ active, children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`min-h-[6.2rem] min-w-[12.8rem] shrink-0 rounded-[10px] border px-8 py-5 text-[1.35rem] font-normal transition tablet:min-w-[12.8rem] tablet:px-10 tablet:text-[1.35rem] ${
                active ? 'border-[#1f4e5f] text-[#1f4e5f]' : 'border-[#dedede] text-[#6f8b97]'
            } bg-white`}
        >
            {children}
        </button>
    );
}

function OptionLine({ options = [], value, onChange, compactLabel = false }) {
    if (!options.length) return null;

    return (
        <div className="flex flex-wrap gap-x-10 gap-y-3 text-[1.1rem] tablet:gap-x-12">
            {options.map((option) => (
                <button
                    key={option.slug}
                    type="button"
                    onClick={() => onChange(option.slug)}
                    className={`transition ${value === option.slug ? 'font-semibold text-[#1f4e5f]' : 'font-normal text-[#7a8d96] hover:text-[#1f4e5f]'}`}
                >
                    {compactLabel ? option.short_name || option.name : option.name}
                </button>
            ))}
        </div>
    );
}

function initialTab(includeCategory, categories, cities, statuses, types) {
    if (includeCategory && categories.length) return 'category';
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

    const [activeTab, setActiveTab] = useState(initialTab(includeCategory, categories, cities, statuses, types));

    useEffect(() => {
        setActiveTab(initialTab(includeCategory, categories, cities, statuses, types));
    }, [includeCategory, categories, cities, statuses, types]);

    const availableTypes = useMemo(() => {
        if (!includeCategory || !values.category) return types;
        return {
            properties: types,
            condominiums: types,
            subdivisions: types,
        }[values.category] || types;
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
            { key: 'category', options: categories, value: values.category, compactLabel: true },
            { key: 'city', options: cities, value: values.city },
            { key: 'type', options: availableTypes, value: values.type },
            ...(businessTypes.length ? [{ key: 'business_type', options: businessTypes, value: values.business_type }] : []),
        ]
        : [
            { key: 'city', options: cities, value: values.city },
            ...(statuses.length ? [{ key: 'status', options: statuses, value: values.status }] : []),
            ...(types.length ? [{ key: 'type', options: availableTypes, value: values.type }] : []),
        ];

    const activeSection = sections.find((section) => section.key === activeTab) || sections[0];

    const tabs = includeCategory
        ? [
            { key: 'category', label: 'Residenciais' },
            { key: 'type', label: 'Loteamentos' },
        ]
        : [
            { key: 'city', label: 'Cidade' },
            { key: 'status', label: 'Status do empreendimento' },
        ];

    return (
        <div className="mx-auto mt-10 max-w-[76rem]">
            <div className="space-y-12">
                <div className="flex flex-nowrap gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden tablet:gap-5">
                    {tabs.map((tab) => (
                        <MainTab key={tab.key} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)}>
                            {tab.label}
                        </MainTab>
                    ))}
                </div>
                <div className="min-h-[2.25rem]">
                    {activeSection && (
                        <OptionLine
                            options={activeSection.options}
                            value={values[activeSection.key]}
                            onChange={(nextValue) => update(activeSection.key, nextValue)}
                            compactLabel={activeSection.key === 'category'}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
