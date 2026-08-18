import Field from '../Forms/Field';
import OverallProgressBar from '../RealEstate/OverallProgressBar';

const blankPlan = { name: '', description: '', area: '', bedrooms: '', suites: '', bathrooms: '', parking_spaces: '' };
const blankFaq = { question: '', answer: '' };
const normalize = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

export const fixedStageDefaults = (item, definitions = []) => definitions.map((definition) => {
    const candidates = [definition.name, ...(definition.aliases || [])].map(normalize);
    const existing = item?.construction_stages?.find((stage) => stage.code === definition.code || candidates.includes(normalize(stage.name)));
    return { id: existing?.id, code: definition.code, name: definition.name, progress_percent: existing?.progress_percent ?? '' };
});

function Repeater({ title, rows, onChange, blank, render }) {
    const update = (index, key, value) => onChange(rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));
    return <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-lg font-medium text-ink">{title}</h2><p className="mt-1 text-sm text-muted">Os itens são exibidos no site na ordem abaixo.</p></div><button type="button" onClick={() => onChange([...rows, { ...blank }])} className="rounded-lg border border-brand px-4 py-2 text-xs font-medium uppercase text-brand hover:bg-brand hover:text-white">Adicionar</button></div>
        <div className="space-y-4">{rows.map((row, index) => <div key={row.id || index} className="rounded-xl bg-surface p-4"><div className="mb-3 flex justify-between text-xs font-medium uppercase text-muted"><span>Item {index + 1}</span><button type="button" onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))} className="text-red-700">Remover</button></div>{render(row, index, update)}</div>)}</div>
    </section>;
}

function ConstructionStageGrid({ data, setData }) {
    const stages = data.construction_stages || [];
    const filledStages = stages.filter((stage) => stage.progress_percent !== '' && stage.progress_percent !== null && stage.progress_percent !== undefined);
    const overall = filledStages.length ? Math.round(filledStages.reduce((total, stage) => total + Math.max(0, Math.min(100, Number(stage.progress_percent) || 0)), 0) / filledStages.length) : null;
    const updateStage = (index, value) => setData('construction_stages', stages.map((stage, stageIndex) => stageIndex === index ? { ...stage, progress_percent: value } : stage));

    return <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <div className="mb-6"><h2 className="text-lg font-medium text-ink">Andamento da obra</h2><p className="mt-1 text-sm text-muted">Preencha apenas as etapas iniciadas. Campos vazios não entram no cálculo.</p></div>
        <div className="grid gap-5 tablet:grid-cols-2 desktop:grid-cols-4">{stages.map((stage, index) => <label key={stage.code} className="block rounded-lg bg-surface p-4"><span className="mb-2 block min-h-10 text-sm font-medium leading-5 text-ink">{stage.name}</span><div className="flex items-center gap-2"><input className="admin-input" type="number" min="0" max="100" step="1" value={stage.progress_percent} onChange={(event) => updateStage(index, event.target.value)} /><span className="text-sm text-muted">%</span></div><span className="mt-1 block text-[.65rem] text-muted">0 a 100</span></label>)}</div>
        <div className="mt-8 grid gap-6 border-t border-line pt-6 tablet:grid-cols-[18rem_1fr] tablet:items-end">
            <Field label="Data prevista de conclusão" type="date" value={data.expected_delivery_date || ''} onChange={(event) => setData('expected_delivery_date', event.target.value)} />
            {overall === null ? <p className="text-sm text-muted">Preencha ao menos uma etapa para calcular a conclusão geral.</p> : <OverallProgressBar value={overall} completionDate={data.expected_delivery_date} />}
        </div>
    </section>;
}

export default function ContentManager({ data, setData, item, showPlans = true, showStages = true }) {
    const media = item?.media_assets || [];
    const removed = data.remove_media_ids || [];
    const visibleMedia = media.filter((asset) => !removed.includes(asset.id));

    return <>
        <section className="rounded-xl border border-line bg-white p-6 shadow-sm"><h2 className="text-lg font-medium text-ink">Galeria e imagem de capa</h2><p className="mt-1 text-sm text-muted">Formatos JPG, PNG ou WebP. A imagem marcada como capa aparece nos cards e no hero.</p><input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => setData('gallery_images', Array.from(event.target.files || []))} className="mt-5 block w-full rounded-lg border border-line bg-surface p-3 text-sm" />{visibleMedia.length > 0 && <div className="mt-5 grid gap-4 tablet:grid-cols-3 desktop:grid-cols-4">{visibleMedia.map((asset) => <article key={asset.id} className="overflow-hidden rounded-xl border border-line"><img src={asset.url} alt={asset.alt_text || ''} className="aspect-[4/3] w-full object-cover" /><div className="space-y-2 p-3 text-xs"><label className="flex items-center gap-2"><input type="radio" name="featured_media_id" checked={String(data.featured_media_id || '') === String(asset.id)} onChange={() => setData('featured_media_id', asset.id)} /> Capa</label><button type="button" className="text-red-700" onClick={() => setData('remove_media_ids', [...removed, asset.id])}>Remover da galeria</button></div></article>)}</div>}</section>

        {showPlans && <Repeater title="Plantas" rows={data.floor_plans || []} onChange={(rows) => setData('floor_plans', rows)} blank={blankPlan} render={(row, index, update) => <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4"><Field label="Nome" value={row.name} onChange={(event) => update(index, 'name', event.target.value)} /><Field label="Área (m²)" type="number" min="0" step="0.01" value={row.area || ''} onChange={(event) => update(index, 'area', event.target.value)} /><Field label="Quartos" type="number" min="0" value={row.bedrooms || ''} onChange={(event) => update(index, 'bedrooms', event.target.value)} /><Field label="Suítes" type="number" min="0" value={row.suites || ''} onChange={(event) => update(index, 'suites', event.target.value)} /><Field label="Banheiros" type="number" min="0" value={row.bathrooms || ''} onChange={(event) => update(index, 'bathrooms', event.target.value)} /><Field label="Vagas" type="number" min="0" value={row.parking_spaces || ''} onChange={(event) => update(index, 'parking_spaces', event.target.value)} /><Field label="Descrição" as="textarea" value={row.description || ''} onChange={(event) => update(index, 'description', event.target.value)} /></div>} />}
        {showStages && <ConstructionStageGrid data={data} setData={setData} />}
        <Repeater title="Perguntas frequentes" rows={data.faqs || []} onChange={(rows) => setData('faqs', rows)} blank={blankFaq} render={(row, index, update) => <div className="grid gap-4 tablet:grid-cols-2"><Field label="Pergunta" value={row.question} onChange={(event) => update(index, 'question', event.target.value)} /><Field label="Resposta" as="textarea" value={row.answer} onChange={(event) => update(index, 'answer', event.target.value)} /></div>} />
        <section className="grid gap-5 rounded-xl border border-line bg-white p-6 shadow-sm tablet:grid-cols-2"><div className="tablet:col-span-2"><h2 className="text-lg font-medium text-ink">SEO</h2><p className="mt-1 text-sm text-muted">Se vazio, o site utiliza automaticamente o título e o resumo.</p></div><Field label="Título SEO" value={data.seo_title || ''} onChange={(event) => setData('seo_title', event.target.value)} /><Field label="URL canônica" type="url" value={data.seo_canonical_url || ''} onChange={(event) => setData('seo_canonical_url', event.target.value)} /><Field label="Descrição SEO" as="textarea" value={data.seo_description || ''} onChange={(event) => setData('seo_description', event.target.value)} /><Field label="Robots" value={data.seo_robots || 'index,follow'} onChange={(event) => setData('seo_robots', event.target.value)} /></section>
    </>;
}

export const contentDefaults = (item, stageDefinitions = null) => ({
    gallery_images: [], remove_media_ids: [], featured_media_id: item?.media_assets?.find((asset) => asset.pivot?.is_featured)?.id || '',
    floor_plans: item?.floor_plans || [], construction_stages: stageDefinitions ? fixedStageDefaults(item, stageDefinitions) : (item?.construction_stages || []), faqs: item?.faqs || [],
    seo_title: item?.seo?.title || '', seo_description: item?.seo?.description || '', seo_canonical_url: item?.seo?.canonical_url || '', seo_robots: item?.seo?.robots || 'index,follow',
});
