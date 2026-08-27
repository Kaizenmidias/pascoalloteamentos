import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import Field from '../Forms/Field';
import OverallProgressBar from '../RealEstate/OverallProgressBar';
import Button from '../UI/Button';
import SortableCollection from './SortableCollection';

const blankPlan = { name: '', description: '', area: '', bedrooms: '', suites: '', bathrooms: '', parking_spaces: '', external_url: '', media_asset_id: '' };
const normalize = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

export const fixedStageDefaults = (item, definitions = []) => definitions.map((definition) => {
    const candidates = [definition.name, ...(definition.aliases || [])].map(normalize);
    const existing = item?.construction_stages?.find((stage) => stage.code === definition.code || candidates.includes(normalize(stage.name)));
    return { id: existing?.id, code: definition.code, name: definition.name, progress_percent: existing?.progress_percent ?? '' };
});

function Repeater({ title, rows, onChange, blank, render }) {
    const update = (index, key, value) => onChange(rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));
    return <section className="rounded-xl border border-line bg-white p-6 shadow-sm"><div className="mb-5 flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-lg font-medium text-ink">{title}</h2><p className="mt-1 text-sm text-muted">Arraste os itens para definir a ordem exibida no site.</p></div><Button type="button" onClick={() => onChange([...rows, { ...blank, _key: crypto.randomUUID() }])}>Adicionar</Button></div><SortableCollection items={rows} onChange={onChange} getKey={(row, index) => row.id || row._key || `existing-${index}`} label="item" onRemove={(_, index) => onChange(rows.filter((__, rowIndex) => rowIndex !== index))} renderItem={(row, index) => <div className="bg-surface p-4">{render(row, index, update)}</div>} /></section>;
}

function ConstructionStageGrid({ data, setData }) {
    const stages = data.construction_stages || [];
    const filled = stages.filter((stage) => stage.progress_percent !== '' && stage.progress_percent != null);
    const overall = filled.length ? Math.round(filled.reduce((total, stage) => total + Math.max(0, Math.min(100, Number(stage.progress_percent) || 0)), 0) / filled.length) : null;
    return <section className="rounded-xl border border-line bg-white p-6 shadow-sm"><div className="mb-6"><h2 className="text-lg font-medium text-ink">Andamento da obra</h2><p className="mt-1 text-sm text-muted">Preencha apenas as etapas iniciadas. Campos vazios não entram no cálculo.</p></div><div className="grid gap-5 tablet:grid-cols-2 desktop:grid-cols-4">{stages.map((stage, index) => <label key={stage.code} className="block rounded-lg bg-surface p-4"><span className="mb-2 block min-h-10 text-sm font-medium text-ink">{stage.name}</span><div className="flex items-center gap-2"><input className="admin-input" type="number" min="0" max="100" value={stage.progress_percent} onChange={(event) => setData('construction_stages', stages.map((row, rowIndex) => rowIndex === index ? { ...row, progress_percent: event.target.value } : row))} /><span>%</span></div><div className="mt-3"><span className="admin-label">Data da atualização</span><input className="admin-input" type="date" value={stage.reference_date ? String(stage.reference_date).slice(0, 10) : ""} onChange={(event) => setData("construction_stages", stages.map((row, rowIndex) => rowIndex === index ? { ...row, reference_date: event.target.value } : row))} /></div><div className="mt-3"><span className="admin-label">Fotos da atualização</span><input className="admin-input" type="file" accept="image/jpeg,image/png,image/webp,.heic,.heif" multiple onChange={(event) => setData("construction_stages", stages.map((row, rowIndex) => rowIndex === index ? { ...row, photos: Array.from(event.target.files || []) } : row))} />{stage.media_assets?.length > 0 && <p className="mt-1 text-xs text-muted">{stage.media_assets.length} foto(s) salva(s)</p>}</div></label>)}</div><div className="mt-8 grid gap-6 border-t border-line pt-6 tablet:grid-cols-[18rem_1fr] tablet:items-end"><Field label="Data prevista de conclusão" type="date" value={data.expected_delivery_date || ''} onChange={(event) => setData('expected_delivery_date', event.target.value)} />{overall == null ? <p className="text-sm text-muted">Preencha ao menos uma etapa para calcular a conclusão geral.</p> : <OverallProgressBar value={overall} completionDate={data.expected_delivery_date} />}</div></section>;
}

function MediaOrderManager({ items, setData }) {
    const move = (index, direction) => {
        const next = index + direction;
        if (next < 0 || next >= items.length) return;
        const reordered = [...items];
        [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
        setData('media_order', reordered.map((asset) => asset.id));
    };
    if (items.length < 2) return null;
    return <section className="rounded-xl border border-line bg-white p-6 shadow-sm"><h2 className="text-lg font-medium text-ink">Ordem da galeria</h2><p className="mt-1 text-sm text-muted">Organize imagens e videos na sequencia exibida no site.</p><div className="mt-5 grid gap-3 tablet:grid-cols-3 desktop:grid-cols-4">{items.map((asset, index) => <article key={asset.id} className="overflow-hidden rounded-xl border border-line"><div className="relative">{asset.type === 'video' || asset.mime_type?.startsWith('video/') ? <img src={asset.poster_url || ''} alt="" className="aspect-[4/3] w-full bg-ink object-cover" /> : <img src={asset.url} alt={asset.alt_text || ''} className="aspect-[4/3] w-full object-cover" />}{(asset.type === 'video' || asset.mime_type?.startsWith('video/')) && <span className="absolute inset-0 grid place-items-center text-xs font-medium uppercase text-white">Video</span>}</div><div className="flex justify-between p-3 text-xs"><button type="button" disabled={index === 0} onClick={() => move(index, -1)}>Subir</button><button type="button" disabled={index === items.length - 1} onClick={() => move(index, 1)}>Descer</button></div></article>)}</div></section>;
}

function UploadDropZone({ label, description, accept, multiple, limit, onFiles }) {
    const [dragActive, setDragActive] = useState(false);

    const handleChange = (event) => {
        onFiles(Array.from(event.target.files || []));
        event.target.value = '';
    };

    return <label
        className={`block cursor-pointer rounded-xl border border-dashed p-4 transition ${dragActive ? 'border-brand bg-brand/10 ring-2 ring-brand/20' : 'border-line bg-surface/30 hover:border-brand/50'}`}
        onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
        onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
        onDragLeave={(event) => { event.preventDefault(); setDragActive(false); }}
        onDrop={(event) => { event.preventDefault(); setDragActive(false); onFiles(Array.from(event.dataTransfer.files || [])); }}
    >
        <span className="admin-label">{label}</span>
        <span className="mt-1 block text-sm text-muted">{description}</span>
        <span className="mt-2 block text-xs font-medium text-brand">{dragActive ? 'Solte os arquivos aqui' : 'Clique ou arraste arquivos para enviar'}</span>
        <span className="mt-1 block text-[.65rem] text-muted">Limite por envio: {limit} arquivos.</span>
        <input type="file" multiple={multiple} accept={accept} className="sr-only" onChange={handleChange} />
    </label>;
}

export default function ContentManager({ data, setData, item, showPlans = true, showStages = true, showSpecialImages = true, showFaqs = true, showDocuments = true, showFeaturedUpload = false, showSeo = true }) {
    const { mediaUpload = {} } = usePage().props;
    const mediaLimit = Number(mediaUpload.maxItems || 50);
    const media = item?.media_assets || [];
    const removed = data.remove_media_ids || [];
    const order = data.media_order?.length ? data.media_order : media.map((asset) => asset.id);
    const visibleMedia = [...media].filter((asset) => !removed.includes(asset.id)).sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    return <>
        <MediaOrderManager items={visibleMedia} setData={setData} />
        {showSpecialImages && <section className="grid gap-5 rounded-xl border border-line bg-white p-6 shadow-sm tablet:grid-cols-2"><div className="tablet:col-span-2"><h2 className="text-lg font-medium text-ink">Imagens das seções</h2><p className="mt-1 text-sm text-muted">Imagens independentes da capa e da galeria.</p></div>{[['about_image', 'Imagem de Sobre', item?.about_media], ['promotion_image', 'Imagem promocional', item?.promotion_media]].map(([key, label, current]) => <label key={key}><span className="admin-label">{label}</span>{current?.url && <img src={current.url} alt="" className="mb-3 aspect-video w-full rounded-lg object-cover" />}<input type="file" accept="image/jpeg,image/png,image/webp,.heic,.heif" onChange={(event) => setData(key, event.target.files?.[0] || null)} className="admin-input" /></label>)}</section>}
        {showFeaturedUpload && <section className="rounded-xl border border-line bg-white p-6 shadow-sm"><h2 className="text-lg font-medium text-ink">Imagem de destaque</h2><p className="mt-1 text-sm text-muted">Usada no card, Hero, Sobre o empreendimento e banner em largura total.</p>{visibleMedia.find((asset) => asset.pivot?.is_featured) && <img src={visibleMedia.find((asset) => asset.pivot?.is_featured).url} alt="" className="mt-5 aspect-video w-full max-w-xl rounded-card object-cover" />}<input type="file" accept="image/jpeg,image/png,image/webp,.heic,.heif" onChange={(event) => setData('featured_image', event.target.files?.[0] || null)} className="admin-input mt-5" /></section>}
        <section className="rounded-xl border border-line bg-white p-6 shadow-sm"><h2 className="text-lg font-medium text-ink">Galeria multimídia</h2><p className="mt-1 text-sm text-muted">Imagens JPG, PNG, WebP ou HEIC convertido; vídeos MP4, WebM ou MOV.</p><div className="mt-5 grid gap-4 tablet:grid-cols-2"><UploadDropZone label="Imagens" description="JPG, PNG, WebP ou HEIC convertido." accept="image/jpeg,image/png,image/webp,.heic,.heif" multiple limit={mediaLimit} onFiles={(files) => setData('gallery_images', files.slice(0, mediaLimit))} /><UploadDropZone label="Vídeos" description="MP4, WebM ou MOV." accept="video/mp4,video/webm,video/quicktime" multiple limit={mediaLimit} onFiles={(files) => setData('gallery_videos', files.slice(0, mediaLimit))} /><label className="tablet:col-span-2"><span className="admin-label">URLs de vídeos externos, uma por linha</span><textarea className="admin-input min-h-24" value={(data.gallery_video_urls || []).join('\n')} onChange={(event) => setData('gallery_video_urls', event.target.value.split('\n').map((value) => value.trim()).filter(Boolean))} /></label></div>{visibleMedia.length > 0 && <div className="mt-5 grid gap-4 tablet:grid-cols-3 desktop:grid-cols-4">{visibleMedia.map((asset) => <article key={asset.id} className="overflow-hidden rounded-xl border border-line">{asset.mime_type?.startsWith('video/') ? <video src={asset.url} className="aspect-[4/3] w-full object-cover" muted /> : <img src={asset.url} alt={asset.alt_text || ''} className="aspect-[4/3] w-full object-cover" />}<div className="space-y-2 p-3 text-xs">{!asset.mime_type?.startsWith('video/') && <label className="flex gap-2"><input type="radio" checked={String(data.featured_media_id || '') === String(asset.id)} onChange={() => setData('featured_media_id', asset.id)} /> Destaque</label>}<button type="button" className="text-red-700" onClick={() => setData('remove_media_ids', [...removed, asset.id])}>Remover</button></div></article>)}</div>}</section>
        {showPlans && <Repeater title="Plantas disponíveis" rows={data.floor_plans || []} onChange={(rows) => setData('floor_plans', rows)} blank={{ ...blankPlan, is_active: true, image: null }} render={(row, index, update) => <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4"><Field label="Título da planta" value={row.name} onChange={(e) => update(index, 'name', e.target.value)} /><Field label="Área privativa (m²)" type="number" value={row.area || ''} onChange={(e) => update(index, 'area', e.target.value)} />{[['bedrooms', 'Quartos'], ['bathrooms', 'Banheiros'], ['parking_spaces', 'Vagas'], ['suites', 'Suítes']].map(([key, label]) => <Field key={key} label={label} type="number" value={row[key] || ''} onChange={(e) => update(index, key, e.target.value)} />)}<label><span className="admin-label">Imagem da planta</span>{row.media_asset?.url && <img src={row.media_asset.url} alt="" className="mb-2 aspect-[4/3] w-40 rounded-lg object-cover" />}<input type="file" accept="image/jpeg,image/png,image/webp,.heic,.heif" className="admin-input" onChange={(e) => update(index, 'image', e.target.files?.[0] || null)} /></label><Field label="Link/arquivo externo" type="url" value={row.external_url || ''} onChange={(e) => update(index, 'external_url', e.target.value)} /><label className="flex items-center gap-2"><input type="checkbox" checked={row.is_active !== false} onChange={(e) => update(index, 'is_active', e.target.checked)} /> Exibir no site</label><Field label="Descrição" as="textarea" value={row.description || ''} onChange={(e) => update(index, 'description', e.target.value)} /></div>} />}
        {showStages && <ConstructionStageGrid data={data} setData={setData} />}
        {showDocuments && <Repeater title="Documentos e downloads" rows={data.documents || []} onChange={(rows) => setData('documents', rows)} blank={{ title: '', kind: '', external_url: '', media_asset_id: '', file: null, is_public: true }} render={(row, index, update) => <div className="grid gap-4 tablet:grid-cols-2"><Field label="Título" value={row.title} onChange={(e) => update(index, 'title', e.target.value)} /><Field label="Tipo" value={row.kind || ''} onChange={(e) => update(index, 'kind', e.target.value)} /><Field label="Link externo" type="url" value={row.external_url || ''} onChange={(e) => update(index, 'external_url', e.target.value)} /><label><span className="admin-label">Arquivo</span><input className="admin-input" type="file" onChange={(e) => update(index, 'file', e.target.files?.[0] || null)} /></label><label className="flex items-center gap-2"><input type="checkbox" checked={row.is_public !== false} onChange={(e) => update(index, 'is_public', e.target.checked)} /> Exibir no site</label></div>} />}
        {showFaqs && <Repeater title="Perguntas frequentes" rows={data.faqs || []} onChange={(rows) => setData('faqs', rows)} blank={{ question: '', answer: '', is_active: true }} render={(row, index, update) => <div className="grid gap-4 tablet:grid-cols-2"><Field label="Pergunta" value={row.question} onChange={(e) => update(index, 'question', e.target.value)} /><Field label="Resposta" as="textarea" value={row.answer} onChange={(e) => update(index, 'answer', e.target.value)} /><label className="flex items-center gap-2"><input type="checkbox" checked={row.is_active !== false} onChange={(e) => update(index, 'is_active', e.target.checked)} /> Exibir no site</label></div>} />}
        {showSeo && <section className="grid gap-5 rounded-xl border border-line bg-white p-6 shadow-sm tablet:grid-cols-2"><div className="tablet:col-span-2"><h2 className="text-lg font-medium text-ink">SEO</h2></div><Field label="Título SEO" value={data.seo_title || ''} onChange={(e) => setData('seo_title', e.target.value)} /><Field label="URL canônica" type="url" value={data.seo_canonical_url || ''} onChange={(e) => setData('seo_canonical_url', e.target.value)} /><Field label="Descrição SEO" as="textarea" value={data.seo_description || ''} onChange={(e) => setData('seo_description', e.target.value)} /><Field label="Robots" value={data.seo_robots || 'index,follow'} onChange={(e) => setData('seo_robots', e.target.value)} /></section>}
    </>;
}

export const contentDefaults = (item, stageDefinitions = null) => ({
    gallery_media: [], gallery_images: [], gallery_videos: [], gallery_video_urls: [], media_order: item?.media_assets?.map((asset) => asset.id) || [], featured_image: null, about_image: null, promotion_image: null, remove_media_ids: [], featured_media_id: item?.media_assets?.find((asset) => asset.pivot?.is_featured)?.id || '',
    floor_plans: item?.floor_plans || [], documents: item?.documents || [], construction_stages: stageDefinitions ? fixedStageDefaults(item, stageDefinitions) : (item?.construction_stages || []), faqs: item?.faqs || [],
    seo_title: item?.seo?.title || '', seo_description: item?.seo?.description || '', seo_canonical_url: item?.seo?.canonical_url || '', seo_robots: item?.seo?.robots || 'index,follow',
});
