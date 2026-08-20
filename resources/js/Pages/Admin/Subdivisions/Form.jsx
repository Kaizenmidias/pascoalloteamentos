import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import Button from '../../../Components/UI/Button';
import FeatureChoices from '../../../Components/Forms/FeatureChoices';
import Field from '../../../Components/Forms/Field';
import SelectField from '../../../Components/Forms/SelectField';
import ContentManager, { contentDefaults } from '../../../Components/Admin/ContentManager';
import LocationFields from '../../../Components/Forms/LocationFields';
import PromotionManager from '../../../Components/Admin/CondominiumPromotions';
import Map from '../../../Components/RealEstate/Map';
import AsyncMediaUploader from '../../../Components/Admin/AsyncMediaUploader';

const text = {
    subdivision: 'loteamento',
    title: 'T\u00edtulo do loteamento',
    initialText: 'Texto de apoio da se\u00e7\u00e3o inicial',
    description: 'Descri\u00e7\u00e3o',
    address: 'Endere\u00e7o',
    business: 'Tipo de neg\u00f3cio',
};
const slugify = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function Form({ item, options }) {
    const editing = Boolean(item);
    const featuredImage = item?.media_assets?.find((asset) => asset.pivot?.is_featured);
    const { data, setData, transform, post, processing, errors } = useForm({
        _method: editing ? 'put' : undefined,
        title: item?.title || '', slug: item?.slug || '', reference_code: item?.reference_code || '',
        subdivision_type_id: item?.subdivision_type_id || '', development_status_id: item?.development_status_id || '',
        business_type_id: item?.business_type_id || '', city_id: item?.city_id || '', excerpt: item?.excerpt || '',
        description: item?.description || '', address: item?.address || '', address_number: item?.address_number || '',
        complement: item?.complement || '', neighborhood: item?.neighborhood || '', postal_code: item?.postal_code || '',
        latitude: item?.latitude || '', longitude: item?.longitude || '', whatsapp_contact: item?.whatsapp_contact || '',
        commercial_purpose: item?.commercial_purpose || '', commercial_status: item?.commercial_status || '',
        regular_price: item?.regular_price || '', sale_price: item?.sale_price || '', minimum_lot_area: item?.minimum_lot_area || '',
        maximum_lot_area: item?.maximum_lot_area || '', total_lots: item?.total_lots || '', available_lots: item?.available_lots || '',
        about_title: item?.about_title || '', about_text: item?.about_text || '', promotion_headline: item?.promotion_headline || '',
        promotion_url: item?.promotion_url || '', expected_delivery_date: item?.expected_delivery_date ? String(item.expected_delivery_date).slice(0, 10) : '',
        status: item?.status || 'draft', featured: Boolean(item?.featured), price_on_request: Boolean(item?.price_on_request),
        feature_ids: item?.features?.map((feature) => feature.id) || [], promotions: item?.promotions || [], uploaded_media_ids: [],
        ...contentDefaults(item, options.stageDefinitions),
        floor_plans: undefined,
        faqs: undefined,
    });

    const submit = (event) => {
        event.preventDefault();
        transform((payload) => {
            const { faqs, floor_plans, ...cleanPayload } = payload;
            return cleanPayload;
        });
        post(editing ? `/admin/subdivisions/${item.slug}` : '/admin/subdivisions', {
            forceFormData: true,
            preserveScroll: true,
            onError: () => requestAnimationFrame(() => {
                const message = document.querySelector('[data-subdivision-form] [data-validation-error]');
                message?.closest('label')?.querySelector('input, select, textarea')?.focus();
                message?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }),
        });
    };

    const hasErrors = Object.keys(errors).length > 0;

    return <AdminLayout title={editing ? `Editar ${text.subdivision}` : `Novo ${text.subdivision}`}>
        <form onSubmit={submit} className="space-y-8" data-subdivision-form>
            {hasErrors && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><strong className="block font-medium">Revise os campos destacados antes de salvar.</strong><ul className="mt-2 list-disc space-y-1 pl-5">{Object.entries(errors).map(([key, message]) => <li key={key} data-validation-error>{message}</li>)}</ul></div>}
            <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-2">
                <div className="tablet:col-span-2"><p className="text-xs font-medium uppercase tracking-[.08em] text-brand">Se&ccedil;&atilde;o inicial</p><h2 className="mt-2 text-lg font-medium text-ink">Hero do {text.subdivision}</h2><p className="mt-1 text-sm text-muted">Estes campos formam a abertura da p&aacute;gina. Estado e cidade s&atilde;o selecionados no bloco seguinte.</p></div>
                <div className="tablet:col-span-2"><span className="admin-label">Imagem principal</span><p className="mb-3 text-xs text-muted">Envie a imagem no bloco de upload individual e clique em &quot;Definir capa&quot;. Ela ser&aacute; usada no card, Hero e Sobre o loteamento.</p>{featuredImage?.url && <img src={featuredImage.url} alt="" className="mb-4 aspect-video w-full max-w-xl rounded-card object-cover" />}</div>
                <Field label={text.title} value={data.title} onChange={(event) => { const title = event.target.value; setData((current) => ({ ...current, title, slug: current.slug || slugify(title) })); }} error={errors.title} />
                <SelectField label="Status da obra" options={options.statuses} value={data.development_status_id} onChange={(event) => setData('development_status_id', event.target.value)} />
                <div className="tablet:col-span-2"><Field label={text.initialText} as="textarea" value={data.excerpt} onChange={(event) => setData('excerpt', event.target.value)} /></div>
                <Field label={'WhatsApp espec\u00edfico (opcional)'} value={data.whatsapp_contact} onChange={(event) => setData('whatsapp_contact', event.target.value)} />
            </section>

            <LocationFields states={options.states} initialCity={item?.city} cityId={data.city_id} onCityChange={(cityId) => setData('city_id', cityId)} error={errors.city_id} />

            <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-2">
                <div className="tablet:col-span-2"><h2 className="text-lg font-medium text-ink">Identifica&ccedil;&atilde;o</h2><p className="mt-1 text-sm text-muted">Dados internos e classifica&ccedil;&otilde;es do {text.subdivision}.</p></div>
                <Field label="Slug" value={data.slug} onChange={(event) => setData('slug', event.target.value)} error={errors.slug} />
                <Field label={'C\u00f3digo de refer\u00eancia'} value={data.reference_code} onChange={(event) => setData('reference_code', event.target.value)} error={errors.reference_code} />
                <SelectField label={`Tipo de ${text.subdivision}`} options={options.types} value={data.subdivision_type_id} onChange={(event) => setData('subdivision_type_id', event.target.value)} />
                <SelectField label={text.business} options={options.businessTypes} value={data.business_type_id} onChange={(event) => setData('business_type_id', event.target.value)} />
                <div className="tablet:col-span-2"><Field label={text.description} as="textarea" value={data.description} onChange={(event) => setData('description', event.target.value)} /></div>
            </section>

            <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-2">
                <div className="tablet:col-span-2"><h2 className="text-lg font-medium text-ink">Sobre o loteamento</h2><p className="mt-1 text-sm text-muted">A imagem usada nesta se&ccedil;&atilde;o ser&aacute; automaticamente a imagem principal.</p></div>
                <Field label={'T\u00edtulo'} value={data.about_title} onChange={(event) => setData('about_title', event.target.value)} />
                <Field label="Texto" as="textarea" value={data.about_text} onChange={(event) => setData('about_text', event.target.value)} />
            </section>

            <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-2 desktop:grid-cols-4">
                <div className="tablet:col-span-2 desktop:col-span-4"><h2 className="text-lg font-medium text-ink">Informa&ccedil;&otilde;es do loteamento</h2><p className="mt-1 text-sm text-muted">Quantidades, dimens&otilde;es e condi&ccedil;&otilde;es comerciais apresentadas no produto.</p></div>
                {[['total_lots', 'Total de lotes', '1'], ['available_lots', 'Lotes dispon\u00edveis', '1'], ['minimum_lot_area', '\u00c1rea m\u00ednima (m\u00b2)', '0.01'], ['maximum_lot_area', '\u00c1rea m\u00e1xima (m\u00b2)', '0.01'], ['regular_price', 'Pre\u00e7o regular', '0.01'], ['sale_price', 'Pre\u00e7o de venda', '0.01']].map(([key, label, step]) => <Field key={key} label={label} type="number" step={step} min="0" value={data[key]} onChange={(event) => setData(key, event.target.value)} error={errors[key]} />)}
            </section>

            <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-3">
                <div className="tablet:col-span-3"><h2 className="text-lg font-medium text-ink">{text.address} e mapa</h2><p className="mt-1 text-sm text-muted">Informe o endere&ccedil;o normalmente. O mapa ser&aacute; localizado por esses dados.</p></div>
                <Field label={text.address} value={data.address} onChange={(event) => setData('address', event.target.value)} /><Field label={'N\u00famero'} value={data.address_number} onChange={(event) => setData('address_number', event.target.value)} /><Field label="Bairro" value={data.neighborhood} onChange={(event) => setData('neighborhood', event.target.value)} /><Field label="Complemento" value={data.complement} onChange={(event) => setData('complement', event.target.value)} /><Field label="CEP" value={data.postal_code} onChange={(event) => setData('postal_code', event.target.value)} />
                <details className="tablet:col-span-3 rounded-xl border border-line p-4"><summary className="cursor-pointer text-sm font-medium text-ink">Coordenadas avan&ccedil;adas (opcional)</summary><div className="mt-4 grid gap-4 tablet:grid-cols-2"><Field label="Latitude" type="number" step="any" value={data.latitude} onChange={(event) => setData('latitude', event.target.value)} /><Field label="Longitude" type="number" step="any" value={data.longitude} onChange={(event) => setData('longitude', event.target.value)} /></div></details>
                <div className="tablet:col-span-3"><Map latitude={data.latitude} longitude={data.longitude} address={[data.address, data.address_number, data.neighborhood, item?.city?.name, item?.city?.state?.code, data.postal_code].filter(Boolean).join(', ')} title={'Pr\u00e9via da localiza\u00e7\u00e3o'} /></div>
            </section>

            <section className="rounded-card bg-white p-6 shadow-card"><FeatureChoices features={options.features} selected={data.feature_ids} onChange={(ids) => setData('feature_ids', ids)} /></section>
            <PromotionManager rows={data.promotions} onChange={(rows) => setData('promotions', rows)} />
            <AsyncMediaUploader existing={item?.media_assets || []} removed={data.remove_media_ids || []} data={data} setData={setData} />
            <div className="[&>section:has(input[accept*='video/mp4'])]:hidden"><ContentManager data={data} setData={setData} item={item} showPlans={false} showSpecialImages={false} showFaqs={false} /></div>

            <section className="flex flex-wrap items-end gap-5 rounded-card bg-white p-6 shadow-card"><SelectField label="Status" options={[{ id: 'draft', name: 'Rascunho' }, { id: 'published', name: 'Publicado' }, { id: 'archived', name: 'Arquivado' }]} value={data.status} onChange={(event) => setData('status', event.target.value)} /><SelectField label={'Neg\u00f3cio'} options={[{ id: 'sale', name: 'Venda' }, { id: 'rent', name: 'Loca\u00e7\u00e3o' }, { id: 'season', name: 'Temporada' }]} value={data.commercial_purpose} onChange={(event) => setData('commercial_purpose', event.target.value)} />{[['featured', 'Destaque'], ['price_on_request', 'Pre\u00e7o sob consulta']].map(([key, label]) => <label key={key} className="flex gap-2 pb-3"><input type="checkbox" checked={data[key]} onChange={(event) => setData(key, event.target.checked)} />{label}</label>)}<Button type="submit" disabled={processing}>Salvar {text.subdivision}</Button></section>
        </form>
    </AdminLayout>;
}
