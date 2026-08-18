import { useDeferredValue, useState } from 'react';

export default function FeatureChoices({ features = [], selected = [], onChange }) {
    const [search, setSearch] = useState('');
    const query = useDeferredValue(search).trim().toLocaleLowerCase('pt-BR');
    const visible = query ? features.filter((feature) => feature.name.toLocaleLowerCase('pt-BR').includes(query)) : features;
    const toggle = (id) => onChange(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);
    return <fieldset><legend className="admin-label">Diferenciais</legend><input className="admin-input mb-4" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar diferencial..." /><div className="grid max-h-96 gap-2 overflow-y-auto tablet:grid-cols-2">{visible.map((feature) => <label key={feature.id} className="flex gap-2 rounded-xl border border-line p-3"><input type="checkbox" checked={selected.includes(feature.id)} onChange={() => toggle(feature.id)} /><span>{feature.icon && <span className="mr-2 text-brand">{feature.icon}</span>}{feature.name}</span></label>)}</div></fieldset>;
}
