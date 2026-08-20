import { useDeferredValue, useState } from 'react';

export default function FeatureChoices({ features = [], selected = [], onChange }) {
    const [search, setSearch] = useState('');
    const query = useDeferredValue(search).trim().toLocaleLowerCase('pt-BR');
    const visible = query ? features.filter((feature) => feature.name.toLocaleLowerCase('pt-BR').includes(query)) : features;
    const toggle = (id) => onChange(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);
    return <fieldset><legend className="admin-label">Diferenciais</legend><input className="admin-input mb-4" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar diferencial..." /><div className="grid max-h-96 gap-3 overflow-y-auto tablet:grid-cols-2">{visible.map((feature) => { const checked = selected.includes(feature.id); return <label key={feature.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${checked ? 'border-brand bg-brand/5 text-ink' : 'border-line bg-white hover:border-brand/40'}`}><input type="checkbox" checked={checked} onChange={() => toggle(feature.id)} className="sr-only" /><span aria-hidden="true" className={`grid size-5 shrink-0 place-items-center rounded border text-xs ${checked ? 'border-brand bg-brand text-white' : 'border-line'}`}>{checked ? '\u2713' : ''}</span><span>{feature.icon && <span className="mr-2 text-brand">{feature.icon}</span>}{feature.name}</span></label>; })}</div>{visible.length === 0 && <p className="py-6 text-center text-sm text-muted">Nenhum diferencial encontrado.</p>}</fieldset>;
}
