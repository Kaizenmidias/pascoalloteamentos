import { router } from '@inertiajs/react';
import { useState } from 'react';

const Select = ({ value, onChange, label, options = [] }) => (
    <label className="relative min-w-0 flex-1">
        <span className="sr-only">{label}</span>
        <select value={value} onChange={onChange} className="h-14 w-full appearance-none border-0 bg-white px-4 pr-9 text-xs font-light uppercase text-text outline-none">
            <option value="">{label}</option>
            {options.map((option) => <option key={option.slug} value={option.slug}>{option.name}</option>)}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs">⌄</span>
    </label>
);

export default function HeroSearch({ action = '/imoveis', filters = {}, types = [], cities = [], statuses = [], compact = false }) {
    const [values, setValues] = useState({ type: filters.type || '', city: filters.city || '', status: filters.status || '' });
    const update = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));
    const submit = (event) => { event.preventDefault(); router.get(action, values, { preserveState: true }); };

    return (
        <form onSubmit={submit} className={`glass-card mx-auto flex max-w-[66rem] flex-col overflow-hidden rounded-[10px] p-1.5 tablet:flex-row ${compact ? '' : 'mt-8'}`}>
            <Select label="Tipo de imóvel" value={values.type} onChange={update('type')} options={types} />
            <Select label="Selecione uma cidade" value={values.city} onChange={update('city')} options={cities} />
            <Select label="Status da obra" value={values.status} onChange={update('status')} options={statuses} />
            <button className="brand-button m-1 min-h-12 shrink-0 tablet:min-w-48" type="submit">Aplicar filtros</button>
        </form>
    );
}
