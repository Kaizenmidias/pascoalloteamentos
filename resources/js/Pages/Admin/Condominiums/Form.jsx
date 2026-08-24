import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import FeatureChoices from '../../../Components/Forms/FeatureChoices';
import Field from '../../../Components/Forms/Field';
import SelectField from '../../../Components/Forms/SelectField';
import ContentManager, { contentDefaults } from '../../../Components/Admin/ContentManager';
import LocationFields from '../../../Components/Forms/LocationFields';
import CondominiumPromotions from '../../../Components/Admin/CondominiumPromotions';
import Map from '../../../Components/RealEstate/Map';
import AsyncMediaUploader from '../../../Components/Admin/AsyncMediaUploader';
import { ProductFormLayout, PublicationCard, SeoCard, SidebarMediaIntro } from '../../../Components/Admin/ProductFormUI';

const text = {
    condominium: 'condom\u00ednio',
    title: 'T\u00edtulo do condom\u00ednio',
    initialText: 'Breve resumo',
    section: 'Se\u00e7\u00e3o inicial',
    description: 'Descri\u00e7\u00e3o',
    address: 'Endere\u00e7o',
    business: 'Tipo de neg\u00f3cio',
};
const summaryLimit = 400;
const slugify = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function Form({ item, options }) {
    const editing = Boolean(item);
    const featuredImage = item?.media_assets?.find((asset) => asset.pivot?.is_featured);
    const { data, setData, post, processing, errors } = useForm({
        _method: editing ? 'put' : undefined,
        title: item?.title || '', slug: item?.slug || '', reference_code: item?.reference_code || '',
        condominium_type_id: item?.condominium_type_id || '', development_status_id: item?.development_status_id || '',
        business_type_id: item?.business_type_id || '', city_id: item?.city_id || '', summary: item?.summary || item?.excerpt || '',
        description: item?.description || '', address: item?.address || '', address_number: item?.address_number || '',
        complement: item?.complement || '', neighborhood: item?.neighborhood || '', postal_code: item?.postal_code || '',
        latitude: item?.latitude || '', longitude: item?.longitude || '', whatsapp_contact: item?.whatsapp_contact || '',
        commercial_purpose: item?.commercial_purpose || '', commercial_status: item?.commercial_status || '',
        floor_plans_support_text: item?.floor_plans_support_text || '', floor_plans_title: item?.floor_plans_title || '',
        promotion_headline: item?.promotion_headline || '', promotion_url: item?.promotion_url || '',
        expected_delivery_date: item?.expected_delivery_date ? String(item.expected_delivery_date).slice(0, 10) : '',
        status: item?.status || 'draft', featured: Boolean(item?.featured), price_on_request: Boolean(item?.price_on_request),
        feature_ids: item?.features?.map((feature) => feature.id) || [], promotions: item?.promotions || [],
        uploaded_media_ids: [],
        ...contentDefaults(item, options.stageDefinitions),
    });

    const submit = (event) => {
        event.preventDefault();
        post(editing ? `/admin/condominiums/${item.slug}` : '/admin/condominiums', { forceFormData: true });
    };

    return <AdminLayout title={editing ? `Editar ${text.condominium}` : `Novo ${text.condominium}`}>
        <ProductFormLayout onSubmit={submit} errors={errors} processing={processing} submitLabel={`Salvar ${text.condominium}`} sidebar={<><PublicationCard data={data} setData={setData} errors={errors} flags={[["featured", "Destaque"], ["price_on_request", "Preço sob consulta"]]} /><SidebarMediaIntro image={featuredImage} help="Usada no card, Hero e seções principais." /><AsyncMediaUploader compact existing={item?.media_assets || []} removed={data.remove_media_ids || []} data={data} setData={setData} /><SeoCard data={data} setData={setData} /></>}>
            <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-2">
                <div className="tablet:col-span-2"><p className="text-xs font-medium uppercase tracking-[.08em] text-brand">{text.section}</p><h2 className="mt-2 text-lg font-medium text-ink">Hero do {text.condominium}</h2><p className="mt-1 text-sm text-muted">Estes campos formam a abertura da p&aacute;gina. Estado e cidade s&atilde;o selecionados no bloco seguinte.</p></div>
                <Field label={text.title} value={data.title} onChange={(event) => { const title = event.target.value; setData((current) => ({ ...current, title, slug: !editing && (!current.slug || current.slug === slugify(current.title)) ? slugify(title) : current.slug })); }} error={errors.title} />
                <SelectField label="Status da obra" options={options.statuses} value={data.development_status_id} onChange={(event) => setData('development_status_id', event.target.value)} />
                <div className="tablet:col-span-2">
                    <label className="block space-y-2">
                        <span className="text-sm font-medium text-slate-700">{text.initialText}</span>
                        <textarea
                            value={data.summary}
                            onChange={(event) => setData('summary', event.target.value)}
                            rows={4}
                            maxLength={summaryLimit}
                            className={`w-full rounded-2xl border px-4 py-3 text-sm shadow-sm transition focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100 ${errors.summary ? 'border-red-300' : 'border-slate-200'}`}
                            placeholder="Escreva um resumo curto sobre o empreendimento."
                        />
                        <div className="text-right text-xs text-slate-500">{data.summary?.length || 0}/{summaryLimit}</div>
                        {errors.summary && <p className="text-sm text-red-600">{errors.summary}</p>}
                    </label>
                </div>
                <Field label={'WhatsApp espec\u00edfico (opcional)'} value={data.whatsapp_contact} onChange={(event) => setData('whatsapp_contact', event.target.value)} />
            </section>

            <LocationFields states={options.states} initialCity={item?.city} cityId={data.city_id} onCityChange={(cityId) => setData('city_id', cityId)} error={errors.city_id} />

            <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-2">
                <div className="tablet:col-span-2"><h2 className="text-lg font-medium text-ink">Informa&ccedil;&otilde;es gerais</h2><p className="mt-1 text-sm text-muted">Identifica&ccedil;&atilde;o interna e classifica&ccedil;&otilde;es do {text.condominium}.</p></div>
                <div><Field label="Slug" value={data.slug} onChange={(event) => setData('slug', slugify(event.target.value))} error={errors.slug} /><button type="button" onClick={() => setData('slug', slugify(data.title))} className="mt-2 text-xs font-medium text-brand">Gerar novamente</button></div>
                <Field label={'C\u00f3digo de refer\u00eancia'} value={data.reference_code} onChange={(event) => setData('reference_code', event.target.value)} error={errors.reference_code} />
                <SelectField label={`Tipo de ${text.condominium}`} options={options.types} value={data.condominium_type_id} onChange={(event) => setData('condominium_type_id', event.target.value)} />
                <SelectField label={text.business} options={options.businessTypes} value={data.business_type_id} onChange={(event) => setData('business_type_id', event.target.value)} />
                <Field label={text.address} value={data.address} onChange={(event) => setData('address', event.target.value)} error={errors.address} />
                <Field label={text.description} as="textarea" value={data.description} onChange={(event) => setData('description', event.target.value)} />
            </section>

            <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-3">
                <div className="tablet:col-span-3"><h2 className="text-lg font-medium text-ink">{text.address} e mapa</h2><p className="mt-1 text-sm text-muted">Informe o endere&ccedil;o normalmente. O mapa ser&aacute; localizado por esses dados.</p></div>
                <Field label={'N\u00famero'} value={data.address_number} onChange={(event) => setData('address_number', event.target.value)} /><Field label="Bairro" value={data.neighborhood} onChange={(event) => setData('neighborhood', event.target.value)} /><Field label="CEP" value={data.postal_code} onChange={(event) => setData('postal_code', event.target.value)} />
                <details className="tablet:col-span-3 rounded-xl border border-line p-4"><summary className="cursor-pointer text-sm font-medium text-ink">Coordenadas avan&ccedil;adas (opcional)</summary><div className="mt-4 grid gap-4 tablet:grid-cols-2"><Field label="Latitude" type="number" step="any" value={data.latitude} onChange={(event) => setData('latitude', event.target.value)} /><Field label="Longitude" type="number" step="any" value={data.longitude} onChange={(event) => setData('longitude', event.target.value)} /></div></details>
                <div className="tablet:col-span-3"><Map latitude={data.latitude} longitude={data.longitude} address={[data.address, data.address_number, data.neighborhood, item?.city?.name, item?.city?.state?.code, data.postal_code].filter(Boolean).join(', ')} title={'Pr\u00e9via da localiza\u00e7\u00e3o'} /></div>
            </section>

            <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-2"><div className="tablet:col-span-2"><h2 className="text-lg font-medium text-ink">Sobre o empreendimento</h2><p className="mt-1 text-sm text-muted">A imagem usada ser&aacute; automaticamente a imagem principal.</p></div><Field label={'T\u00edtulo'} value={data.about_title} onChange={(event) => setData('about_title', event.target.value)} /><Field label="Texto" as="textarea" value={data.about_text} onChange={(event) => setData('about_text', event.target.value)} /></section>
            <section className="rounded-card bg-white p-6 shadow-card"><FeatureChoices features={options.features} selected={data.feature_ids} onChange={(ids) => setData('feature_ids', ids)} /></section>
            <CondominiumPromotions rows={data.promotions} onChange={(rows) => setData('promotions', rows)} />
            <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-2"><div className="tablet:col-span-2"><h2 className="text-lg font-medium text-ink">Se&ccedil;&atilde;o Plantas</h2></div><Field label={'T\u00edtulo'} value={data.floor_plans_title} onChange={(event) => setData('floor_plans_title', event.target.value)} /><Field label="Texto de apoio" as="textarea" value={data.floor_plans_support_text} onChange={(event) => setData('floor_plans_support_text', event.target.value)} /></section>
            <div className="[&>section:has(input[accept*='video/mp4'])]:hidden"><ContentManager data={data} setData={setData} item={item} showSpecialImages={false} showFaqs={false} showDocuments={false} showSeo={false} /></div>

        </ProductFormLayout>
    </AdminLayout>;
}
