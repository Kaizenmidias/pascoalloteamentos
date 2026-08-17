import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function FilterGroup({ label, options = [], value, onChange, placeholder = 'Todos' }) {
    if (!options.length) {
        return null;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
                <p className="text-[.72rem] font-medium uppercase tracking-[.16em] text-muted">{label}</p>
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="text-[.7rem] font-medium uppercase tracking-[.12em] text-brand transition hover:text-brand-dark"
                    >
                        Limpar
                    </button>
                )}
            </div>
            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className={`shrink-0 rounded-full border px-4 py-3 text-xs font-medium uppercase tracking-[.08em] transition ${
                        !value
                            ? 'border-brand bg-brand text-white shadow-[0_10px_24px_rgba(151,28,32,.22)]'
                            : 'border-line bg-white text-ink hover:border-brand/50 hover:text-brand'
                    }`}
                >
                    {placeholder}
                </button>
                {options.map((option) => (
                    <button
                        key={option.slug}
                        type="button"
                        onClick={() => onChange(option.slug)}
                        className={`shrink-0 rounded-full border px-4 py-3 text-xs font-medium uppercase tracking-[.08em] transition ${
                            value === option.slug
                                ? 'border-brand bg-brand text-white shadow-[0_10px_24px_rgba(151,28,32,.22)]'
                                : 'border-line bg-white text-ink hover:border-brand/50 hover:text-brand'
                        }`}
                    >
                        {option.name}
                    </button>
                ))}
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
    const [values, setValues] = useState({
        category: filters.category || '',
        type: filters.type || '',
        city: filters.city || '',
        status: filters.status || '',
        business_type: filters.business_type || '',
    });

    const availableTypes = useMemo(() => {
        if (!includeCategory || !values.category) {
            return types;
        }

        const match = {
            properties: types,
            condominiums: types,
            subdivisions: types,
        };

        return match[values.category] || types;
    }, [includeCategory, types, values.category]);

    const navigate = (next) => {
        if (!autoSubmit) {
            return;
        }

        const payload = { ...next };
        if (!includeCategory) {
            delete payload.category;
        }

        router.get(action, payload, { preserveState: true, preserveScroll: true, replace: true });
    };

    const update = (key, nextValue) => {
        const next = { ...values, [key]: nextValue };
        setValues(next);
        onChange?.(next);
        navigate(next);
    };

    const clear = () => {
        const next = { category: '', type: '', city: '', status: '', business_type: '' };
        setValues(next);
        onChange?.(next);
        onClear?.();
        navigate(next);
    };

    return (
        <div className={`mx-auto ${compact ? 'max-w-[66rem]' : 'mt-8 max-w-[76rem] rounded-[28px] border border-line/70 bg-white p-5 shadow-[0_18px_45px_rgba(18,18,18,.05)] tablet:p-7'}`}>
            <div className="space-y-6">
                {includeCategory && (
                    <FilterGroup
                        label="Categoria"
                        value={values.category}
                        onChange={(nextValue) => update('category', nextValue)}
                        options={categories}
                        placeholder="Todos"
                    />
                )}
                <div className={`grid gap-6 ${compact ? 'desktop:grid-cols-3' : 'desktop:grid-cols-2'}`}>
                    {cities.length > 0 && (
                        <FilterGroup
                            label="Cidade"
                            value={values.city}
                            onChange={(nextValue) => update('city', nextValue)}
                            options={cities}
                            placeholder="Todas as cidades"
                        />
                    )}
                    {statuses.length > 0 && (
                        <FilterGroup
                            label="Status do empreendimento"
                            value={values.status}
                            onChange={(nextValue) => update('status', nextValue)}
                            options={statuses}
                            placeholder="Todos os status"
                        />
                    )}
                    {availableTypes.length > 0 && (
                        <FilterGroup
                            label={includeCategory ? 'Tipo' : 'Tipo de imóvel'}
                            value={values.type}
                            onChange={(nextValue) => update('type', nextValue)}
                            options={availableTypes}
                            placeholder="Todos os tipos"
                        />
                    )}
                    {businessTypes.length > 0 && (
                        <FilterGroup
                            label="Tipo de negócio"
                            value={values.business_type}
                            onChange={(nextValue) => update('business_type', nextValue)}
                            options={businessTypes}
                            placeholder="Todos"
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
