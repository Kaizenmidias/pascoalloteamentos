import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function Pill({ active, children, onClick, className = '' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`shrink-0 rounded-full border px-4 py-3 text-xs font-medium uppercase tracking-[.08em] transition ${
                active
                    ? 'border-brand bg-brand text-white shadow-[0_10px_24px_rgba(151,28,32,.22)]'
                    : 'border-line bg-white text-ink hover:border-brand/50 hover:text-brand'
            } ${className}`}
        >
            {children}
        </button>
    );
}

function FilterSection({ label, value, options = [], placeholder = 'Todos', onChange }) {
    if (!options.length) {
        return null;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
                <p className="text-[.72rem] font-medium uppercase tracking-[.16em] text-muted">{label}</p>
                {value && (
                    <button type="button" onClick={() => onChange('')} className="text-[.7rem] font-medium uppercase tracking-[.12em] text-brand transition hover:text-brand-dark">
                        Limpar
                    </button>
                )}
            </div>
            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <Pill active={!value} onClick={() => onChange('')} className="px-4">
                    {placeholder}
                </Pill>
                {options.map((option) => (
                    <Pill key={option.slug} active={value === option.slug} onClick={() => onChange(option.slug)} className="px-4">
                        {option.name}
                    </Pill>
                ))}
            </div>
        </div>
    );
}

function CompactFilters({ action, filters, cities, types, statuses, businessTypes, categories, includeCategory, onChange, onClear, autoSubmit }) {
    const [values, setValues] = useState({
        category: filters.category || '',
        type: filters.type || '',
        city: filters.city || '',
        status: filters.status || '',
        business_type: filters.business_type || '',
    });

    const availableTypes = useMemo(() => {
        if (!includeCategory || !values.category) return types;
        const match = { properties: types, condominiums: types, subdivisions: types };
        return match[values.category] || types;
    }, [includeCategory, types, values.category]);

    const update = (key, nextValue) => {
        const next = { ...values, [key]: nextValue };
        setValues(next);
        onChange?.(next);
        if (!autoSubmit) return;
        const payload = { ...next };
        if (!includeCategory) delete payload.category;
        router.get(action, payload, { preserveState: true, preserveScroll: true, replace: true });
    };

    const clear = () => {
        const next = { category: '', type: '', city: '', status: '', business_type: '' };
        setValues(next);
        onChange?.(next);
        onClear?.();
        if (!autoSubmit) return;
        router.get(action, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <div className="mx-auto mt-8 max-w-[76rem] rounded-[28px] border border-line/70 bg-white p-5 shadow-[0_18px_45px_rgba(18,18,18,.05)] tablet:p-7">
            <div className="space-y-6">
                {includeCategory && (
                    <FilterSection label="Categoria" value={values.category} onChange={(next) => update('category', next)} options={categories} placeholder="Todos" />
                )}
                <div className="grid gap-6 desktop:grid-cols-2">
                    {cities.length > 0 && (
                        <FilterSection label="Cidade" value={values.city} onChange={(next) => update('city', next)} options={cities} placeholder="Todas as cidades" />
                    )}
                    {statuses.length > 0 && (
                        <FilterSection label="Status do empreendimento" value={values.status} onChange={(next) => update('status', next)} options={statuses} placeholder="Todos os status" />
                    )}
                    {availableTypes.length > 0 && (
                        <FilterSection label={includeCategory ? 'Tipo' : 'Tipo de imóvel'} value={values.type} onChange={(next) => update('type', next)} options={availableTypes} placeholder="Todos os tipos" />
                    )}
                    {businessTypes.length > 0 && (
                        <FilterSection label="Tipo de negócio" value={values.business_type} onChange={(next) => update('business_type', next)} options={businessTypes} placeholder="Todos" />
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

function HomeFilters({ action, filters, cities, types, statuses, businessTypes, categories, includeCategory, onChange, onClear, autoSubmit, compact }) {
    const [values, setValues] = useState({
        category: filters.category || '',
        type: filters.type || '',
        city: filters.city || '',
        status: filters.status || '',
        business_type: filters.business_type || '',
    });

    const availableTypes = useMemo(() => {
        if (!includeCategory || !values.category) return types;
        const match = { properties: types, condominiums: types, subdivisions: types };
        return match[values.category] || types;
    }, [includeCategory, types, values.category]);

    const push = (next) => {
        if (!autoSubmit) return;
        const payload = { ...next };
        if (!includeCategory) delete payload.category;
        router.get(action, payload, { preserveState: true, preserveScroll: true, replace: true });
    };

    const update = (key, nextValue) => {
        const next = { ...values, [key]: nextValue };
        setValues(next);
        onChange?.(next);
        push(next);
    };

    const clear = () => {
        const next = { category: '', type: '', city: '', status: '', business_type: '' };
        setValues(next);
        onChange?.(next);
        onClear?.();
        push(next);
    };

    const tabs = [
        { key: 'city', label: 'Cidade', options: cities, placeholder: 'Todas as cidades' },
        ...(statuses.length ? [{ key: 'status', label: 'Status do empreendimento', options: statuses, placeholder: 'Todos os status' }] : []),
        ...(availableTypes.length ? [{ key: 'type', label: includeCategory ? 'Tipo' : 'Tipo de imóvel', options: availableTypes, placeholder: 'Todos os tipos' }] : []),
        ...(businessTypes.length ? [{ key: 'business_type', label: 'Tipo de negócio', options: businessTypes, placeholder: 'Todos' }] : []),
    ];

    const [activeTab, setActiveTab] = useState(tabs[0]?.key || 'city');
    const active = tabs.find((tab) => tab.key === activeTab) || tabs[0];

    return (
        <div className={`mx-auto ${compact ? 'max-w-[66rem]' : 'mt-8 max-w-[76rem] rounded-[28px] border border-line/70 bg-white p-5 shadow-[0_18px_45px_rgba(18,18,18,.05)] tablet:p-7'}`}>
            <div className="space-y-6">
                {includeCategory && (
                    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {categories.map((category) => (
                            <Pill key={category.slug} active={values.category === category.slug} onClick={() => update('category', category.slug)} className="px-5 py-3.5">
                                {category.name}
                            </Pill>
                        ))}
                        <Pill active={!values.category} onClick={() => update('category', '')} className="px-5 py-3.5">
                            Todos
                        </Pill>
                    </div>
                )}
                <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {tabs.map((tab) => (
                        <Pill key={tab.key} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} className="px-5 py-3.5">
                            {tab.label}
                        </Pill>
                    ))}
                </div>
                {active && (
                    <FilterSection
                        label={active.label}
                        value={values[active.key]}
                        onChange={(next) => update(active.key, next)}
                        options={active.options}
                        placeholder={active.placeholder}
                    />
                )}
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

export default function HeroSearch({
    action = '/imoveis',
    filters = {},
    cities = [],
    types = [],
    statuses = [],
    businessTypes = [],
    categories = [],
    compact = false,
    includeCategory = false,
    onChange = null,
    autoSubmit = true,
    onClear = null,
}) {
    if (compact) {
        return (
            <HomeFilters
                action={action}
                filters={filters}
                cities={cities}
                types={types}
                statuses={statuses}
                businessTypes={businessTypes}
                categories={categories}
                includeCategory={includeCategory}
                onChange={onChange}
                onClear={onClear}
                autoSubmit={autoSubmit}
                compact
            />
        );
    }

    return (
        <CompactFilters
            action={action}
            filters={filters}
            cities={cities}
            types={types}
            statuses={statuses}
            businessTypes={businessTypes}
            categories={categories}
            includeCategory={includeCategory}
            onChange={onChange}
            onClear={onClear}
            autoSubmit={autoSubmit}
        />
    );
}
