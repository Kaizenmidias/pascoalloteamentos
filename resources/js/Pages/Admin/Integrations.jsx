import { useForm } from '@inertiajs/react';
import AdminLayout from '../../Components/Layout/AdminLayout';
import Field from '../../Components/Forms/Field';
import Button from '../../Components/UI/Button';

const positions = { head: 'HEAD', body_start: 'BODY - INÍCIO', body_end: 'BODY - FINAL' };
const defaultTypes = { meta_pixel: 'Meta Pixel', google_analytics: 'Google Analytics (GA4)', google_ads: 'Google Ads', google_tag: 'Google Tag', google_tag_manager: 'Google Tag Manager', custom_script: 'Script personalizado' };

function blank(type = 'custom_script') {
    return { name: '', type, identifier: '', code: '', position: 'head', is_active: true, sort_order: 0 };
}

export default function Integrations({ settings = {}, trackingScripts = [], trackingTypes = defaultTypes, rdStationConnected = false }) {
    const { data, setData, put, processing, errors } = useForm({
        google_maps_key: settings.google_maps_key || '', recaptcha_site_key: settings.recaptcha_site_key || '',
        scripts: trackingScripts.map((script, index) => ({ ...script, sort_order: script.sort_order ?? index * 10 })),
    });
    const updateScript = (index, key, value) => setData('scripts', data.scripts.map((script, current) => current === index ? { ...script, [key]: value } : script));
    const addScript = (type) => setData('scripts', [...data.scripts, { ...blank(type), name: trackingTypes[type], sort_order: data.scripts.length * 10 }]);
    const removeScript = (index) => setData('scripts', data.scripts.filter((_, current) => current !== index));
    const moveScript = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= data.scripts.length) return;
        const scripts = [...data.scripts]; [scripts[index], scripts[target]] = [scripts[target], scripts[index]];
        setData('scripts', scripts.map((script, current) => ({ ...script, sort_order: current * 10 })));
    };

    return <AdminLayout title="Integrações"><div className="space-y-5"><form onSubmit={(event) => { event.preventDefault(); put('/admin/integrations'); }} className="max-w-6xl space-y-6">
        <section className="rounded-xl border border-line bg-white p-6 shadow-sm"><div className="mb-5"><h2 className="text-lg font-medium text-ink">Pixels, tags e scripts</h2><p className="mt-1 text-sm text-muted">Cadastre várias integrações, controle o status e defina o ponto de instalação. Somente itens ativos são publicados.</p></div>
            <div className="space-y-4">{data.scripts.map((script, index) => <article key={script.id || `new-${index}`} className="rounded-lg border border-line bg-surface/30 p-4"><div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-[1.2fr_1fr_1fr_1fr_auto]"><Field label="Nome" value={script.name} onChange={(e) => updateScript(index, 'name', e.target.value)} /><label className="block text-sm"><span className="mb-1 block text-xs font-medium text-muted">Tipo</span><select className="field-control" value={script.type} onChange={(e) => updateScript(index, 'type', e.target.value)}>{Object.entries(trackingTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="block text-sm"><span className="mb-1 block text-xs font-medium text-muted">Posição</span><select className="field-control" value={script.position} onChange={(e) => updateScript(index, 'position', e.target.value)}>{Object.entries(positions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>{script.type === 'custom_script' ? <div className="tablet:col-span-2 desktop:col-span-1"><Field label="Código" as="textarea" rows="3" value={script.code || ''} onChange={(e) => updateScript(index, 'code', e.target.value)} /></div> : <Field label="Identificador" value={script.identifier || ''} onChange={(e) => updateScript(index, 'identifier', e.target.value.toUpperCase())} placeholder={script.type === 'meta_pixel' ? '123456789' : script.type === 'google_analytics' ? 'G-XXXXXXXXXX' : script.type === 'google_ads' ? 'AW-XXXXXXXXX' : script.type === 'google_tag' ? 'GT-XXXXXXXX' : 'GTM-XXXXXXX'} />}<div className="flex items-end gap-2"><label className="flex items-center gap-2 pb-2 text-xs text-muted"><input type="checkbox" checked={!!script.is_active} onChange={(e) => updateScript(index, 'is_active', e.target.checked)} /> Ativo</label><button type="button" className="pb-2 text-xs text-muted" onClick={() => moveScript(index, -1)} aria-label="Mover para cima">↑</button><button type="button" className="pb-2 text-xs text-muted" onClick={() => moveScript(index, 1)} aria-label="Mover para baixo">↓</button><button type="button" className="pb-2 text-xs text-red-700" onClick={() => removeScript(index)}>Remover</button></div></div>{script.type === 'google_tag_manager' && <p className="mt-3 text-xs text-muted">O GTM sempre instala o loader no HEAD e o fallback necessário no início do BODY, conforme a especificação da plataforma.</p>}</article>)}</div>
            {errors.scripts && <p className="mt-3 text-sm text-red-700">{errors.scripts}</p>}
            <div className="mt-5 flex flex-wrap gap-2"><Button type="button" onClick={() => addScript('meta_pixel')}>+ Adicionar Pixel Meta</Button><Button type="button" onClick={() => addScript('google_analytics')}>+ Adicionar Google</Button><Button type="button" onClick={() => addScript('custom_script')}>+ Adicionar Script</Button></div>
        </section>
        <section className="grid gap-5 rounded-xl border border-line bg-white p-6 shadow-sm tablet:grid-cols-2"><div className="tablet:col-span-2"><h2 className="text-lg font-medium text-ink">Outros serviços</h2><p className="mt-1 text-sm text-muted">Estas credenciais permanecem compatíveis com a configuração anterior.</p></div><Field label="Google Maps API Key" value={data.google_maps_key} onChange={(e) => setData('google_maps_key', e.target.value)} /><Field label="reCAPTCHA Site Key" value={data.recaptcha_site_key} onChange={(e) => setData('recaptcha_site_key', e.target.value)} /></section>
        <Button type="submit" disabled={processing}>{processing ? 'Salvando...' : 'Salvar integrações'}</Button>
    </form><section className="max-w-6xl rounded-xl border border-line bg-white p-6 shadow-sm"><h2 className="text-lg font-medium text-ink">RD Station CRM</h2><p className="mt-1 text-sm text-muted">Status: {rdStationConnected ? 'Conectado' : 'Não conectado'}</p>{!rdStationConnected && <a href="/admin/integrations/rd-station/connect" className="brand-button mt-4 inline-flex">Conectar RD Station CRM</a>}</section></div></AdminLayout>;
}
