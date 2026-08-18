import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function FilterTab({ active, children, onClick }) {
    return <button type="button" onClick={onClick} className={`min-h-[5.2rem] min-w-[12rem] shrink-0 rounded-[10px] border bg-white px-6 py-4 text-[1.1rem] transition tablet:min-w-[12.8rem] tablet:text-[1.25rem] ${active ? 'border-[#1f4e5f] text-[#1f4e5f]' : 'border-[#dedede] text-[#78909a] hover:border-[#9eb0b7]'}`}>{children}</button>;
}

function FilterOptions({ options, value, onChange }) {
    return <div className="flex flex-wrap gap-x-9 gap-y-3 text-[1.05rem] tablet:gap-x-12">
        {options.map((option) => <button key={option.slug} type="button" onClick={() => onChange(option.slug)} className={`transition ${value === option.slug ? 'font-semibold text-[#123f4e]' : 'text-[#78909a] hover:text-[#123f4e]'}`}>{option.name}</button>)}
    </div>;
}

export default function HeroSearch({ action, entity, filters = {}, cities = [], types = [], statuses = [] }) {
    const secondary = entity === 'properties'
        ? { key: 'type', label: 'Tipo de imóvel', options: types }
        : { key: 'status', label: 'Status do empreendimento', options: statuses };
    const sections = [{ key: 'city', label: 'Cidade', options: cities }, secondary];
    const [activeTab, setActiveTab] = useState('city');
    const [values, setValues] = useState({ city: filters.city || '', type: filters.type || '', status: filters.status || '' });

    useEffect(() => {
        setValues({ city: filters.city || '', type: filters.type || '', status: filters.status || '' });
    }, [filters.city, filters.status, filters.type]);

    const navigate = (next) => router.get(action, Object.fromEntries(Object.entries(next).filter(([, value]) => value)), {
        preserveScroll: true,
        preserveState: true,
        replace: true,
    });

    const update = (key, value) => {
        const next = { ...values, [key]: values[key] === value ? '' : value };
        setValues(next);
        navigate(next);
    };

    const clear = () => {
        const next = { city: '', type: '', status: '' };
        setValues(next);
        navigate(next);
    };

    const activeSection = sections.find((section) => section.key === activeTab) || sections[0];
    const hasFilters = Boolean(values.city || values.type || values.status);

    return (
        <div className="mx-auto mt-8 max-w-[80rem] pb-2">
            <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden tablet:gap-5">
                {sections.map((section) => <FilterTab key={section.key} active={activeTab === section.key} onClick={() => setActiveTab(section.key)}>{section.label}</FilterTab>)}
            </div>
            <div className="mt-8 border-t border-line pt-6">
                {activeSection.options.length ? <FilterOptions options={activeSection.options} value={values[activeSection.key]} onChange={(value) => update(activeSection.key, value)} /> : <p className="text-sm text-muted">Nenhuma opção disponível.</p>}
            </div>
            {hasFilters && <button type="button" onClick={clear} className="mt-5 text-xs font-medium uppercase tracking-[.08em] text-brand underline underline-offset-4">Limpar filtros</button>}
        </div>
    );
}
