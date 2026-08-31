import { useDeferredValue, useMemo, useState } from 'react';
import FeatureIcon from '../RealEstate/FeatureIcon';

const normalize = (value = '') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const featureBuckets = [
    {
        key: 'external_features',
        title: 'Características externas',
        match: (feature) => feature.category === 'external_features' || /extern|infraestrutura|condomin|jardim|paisag|portaria|elevador|interfone|seguranca|monitoramento|acesso|estacionamento|agua|gas|pcd|entrada|hall|deposito|biciclet|zelador|cameras|cerca|controle|fechadura|fibra|internet|energia|gerador/.test(normalize(`${feature.category} ${feature.name}`)),
    },
    {
        key: 'leisure_features',
        title: 'Lazer',
        match: (feature) => feature.category === 'leisure_features' || /lazer|leisure|recrea|amenidade|piscina|academia|churrasqueira|playground|salao|quadra|sauna|spa|gourmet|fitness|brinquedoteca|pet|coworking|cinema|biblioteca|terraço|terraco|lounge|praça|praca/.test(normalize(`${feature.category} ${feature.name}`)),
    },
];

function FeatureItem({ feature, checked, onToggle }) {
    return (
        <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${checked ? 'border-brand bg-brand/5 text-ink' : 'border-line bg-white hover:border-brand/40'}`}>
            <input type="checkbox" checked={checked} onChange={onToggle} className="sr-only" />
            <span aria-hidden="true" className={`grid size-5 shrink-0 place-items-center rounded border text-xs ${checked ? 'border-brand bg-brand text-white' : 'border-line'}`}>{checked ? '✓' : ''}</span>
            <FeatureIcon feature={feature} className="size-8 shrink-0" />
            <span>{feature.name}</span>
        </label>
    );
}

function FeatureGroup({ title, features, selected, onToggle }) {
    if (!features.length) return null;

    return (
        <section className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[.08em] text-brand">{title}</p>
            <div className="max-h-[320px] overflow-y-auto overflow-x-hidden pr-1">
                <div className="grid gap-3 tablet:grid-cols-2 desktop:grid-cols-3">
                    {features.map((feature) => (
                        <FeatureItem
                            key={feature.id}
                            feature={feature}
                            checked={selected.includes(feature.id)}
                            onToggle={() => onToggle(feature.id)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function FeatureChoices({ features = [], selected = [], onChange }) {
    const [search, setSearch] = useState('');
    const query = useDeferredValue(search).trim().toLocaleLowerCase('pt-BR');

    const visible = useMemo(() => {
        const source = query ? features.filter((feature) => feature.name.toLocaleLowerCase('pt-BR').includes(query)) : features;
        return {
            external: source.filter((feature) => featureBuckets[0].match(feature)),
            leisure: source.filter((feature) => featureBuckets[1].match(feature)),
            other: source.filter((feature) => !featureBuckets.some((bucket) => bucket.match(feature))),
        };
    }, [features, query]);

    const toggle = (id) => onChange(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);

    return (
        <fieldset className="space-y-6">
            <legend className="admin-label">Diferenciais</legend>
            <input
                className="admin-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar diferencial..."
            />
            <div className="space-y-6">
                <FeatureGroup title={featureBuckets[0].title} features={visible.external} selected={selected} onToggle={toggle} />
                {visible.leisure.length > 0 && visible.external.length > 0 && <div className="border-t border-gray-200" aria-hidden="true" />}
                <FeatureGroup title={featureBuckets[1].title} features={visible.leisure} selected={selected} onToggle={toggle} />
                {visible.other.length > 0 && (visible.external.length > 0 || visible.leisure.length > 0) && <div className="border-t border-gray-200" aria-hidden="true" />}
                {visible.other.length > 0 && (
                    <FeatureGroup
                        title="Outros diferenciais"
                        features={visible.other}
                        selected={selected}
                        onToggle={toggle}
                    />
                )}
            </div>
            {!visible.external.length && !visible.leisure.length && !visible.other.length && <p className="py-6 text-center text-sm text-muted">Nenhum diferencial encontrado.</p>}
        </fieldset>
    );
}
