import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const Select = ({ value, onChange, label, options = [], placeholder = label }) => (
    <label className="relative min-w-0 flex-1">
        <span className="sr-only">{label}</span>
        <select value={value} onChange={onChange} className="h-14 w-full appearance-none border-0 bg-white px-4 pr-9 text-xs font-medium uppercase text-text outline-none">
            <option value="">{placeholder}</option>
            {options.map((option) => <option key={option.slug} value={option.slug}>{option.name}</option>)}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs">▾</span>
    </label>
);

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

    const update = (key) => (event) => {
        const next = { ...values, [key]: event.target.value };
        setValues(next);
        onChange?.(next);
    };

    const submit = (event) => {
        event.preventDefault();
        const payload = { ...values };
        if (!includeCategory) {
            delete payload.category;
        }
        router.get(action, payload, { preserveState: true, preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className={`glass-card mx-auto flex max-w-[66rem] flex-col gap-0 overflow-hidden rounded-[10px] p-1.5 tablet:flex-row ${compact ? '' : 'mt-8'}`}>
            {includeCategory && <Select label="Categoria" value={values.category} onChange={update('category')} options={categories} placeholder="Categoria do empreendimento" />}
            {types.length > 0 && <Select label="Tipo" value={values.type} onChange={update('type')} options={availableTypes} placeholder={includeCategory ? 'Selecione o empreendimento' : 'Tipo de imóvel'} />}
            {businessTypes.length > 0 && <Select label="Tipo de negócio" value={values.business_type} onChange={update('business_type')} options={businessTypes} />}
            <Select label="Cidade" value={values.city} onChange={update('city')} options={cities} placeholder="Selecione uma cidade" />
            {statuses.length > 0 && <Select label="Status" value={values.status} onChange={update('status')} options={statuses} placeholder="Status do empreendimento" />}
            <button className="brand-button m-1 min-h-12 shrink-0 font-medium tablet:min-w-48" type="submit">Aplicar filtros</button>
        </form>
    );
}
