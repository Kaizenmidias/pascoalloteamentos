import { useDeferredValue, useEffect, useId, useState } from 'react';
import SelectField from './SelectField';

export default function LocationFields({ states = [], initialCity = null, cityId, onCityChange, error = null }) {
    const listId = useId();
    const [stateId, setStateId] = useState(initialCity?.state_id || initialCity?.state?.id || '');
    const [search, setSearch] = useState(initialCity?.name || '');
    const [cities, setCities] = useState(initialCity ? [initialCity] : []);
    const [loading, setLoading] = useState(false);
    const deferredSearch = useDeferredValue(search);

    useEffect(() => {
        if (!stateId) {
            setCities([]);
            return undefined;
        }

        const controller = new AbortController();
        const params = new URLSearchParams({ state_id: stateId });
        if (deferredSearch.trim()) params.set('q', deferredSearch.trim());
        setLoading(true);

        fetch(`/admin/locations/cities?${params}`, { headers: { Accept: 'application/json' }, signal: controller.signal })
            .then((response) => response.ok ? response.json() : Promise.reject(new Error('Não foi possível carregar as cidades.')))
            .then((payload) => setCities(payload.cities || []))
            .catch((error) => { if (error.name !== 'AbortError') setCities([]); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });

        return () => controller.abort();
    }, [deferredSearch, stateId]);

    const changeState = (event) => {
        setStateId(event.target.value);
        setSearch('');
        setCities([]);
        onCityChange('');
    };

    const changeCity = (event) => {
        const value = event.target.value;
        setSearch(value);
        const selected = cities.find((city) => city.name.localeCompare(value, 'pt-BR', { sensitivity: 'base' }) === 0);
        onCityChange(selected?.id || '');
    };

    const selectedState = states.find((state) => String(state.id) === String(stateId));

    return <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <div className="mb-5"><h2 className="text-lg font-medium text-ink">Localização</h2><p className="mt-1 text-sm text-muted">Selecione o estado e pesquise o município.</p></div>
        <div className="grid gap-5 tablet:grid-cols-2">
            <SelectField label="Estado" options={states} value={stateId} onChange={changeState} placeholder="Selecione o estado" />
            <label className="block">
                <span className="admin-label">Cidade</span>
                <input list={listId} className="admin-input" value={search} onChange={changeCity} disabled={!stateId} placeholder={stateId ? 'Digite para pesquisar...' : 'Selecione primeiro o estado'} autoComplete="off" />
                <datalist id={listId}>{cities.map((city) => <option key={city.id} value={city.name} />)}</datalist>
                {loading && <span className="mt-1 block text-xs text-muted">Pesquisando cidades...</span>}
                {error && <span className="mt-1 block text-xs text-red-700">{error}</span>}
            </label>
        </div>
        {cityId && search && <p className="mt-4 text-sm font-medium text-brand">Local selecionado: {search}{selectedState?.code ? `/${selectedState.code}` : ''}</p>}
    </section>;
}
