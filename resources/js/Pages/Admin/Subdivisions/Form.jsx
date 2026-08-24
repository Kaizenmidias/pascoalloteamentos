import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import FeatureChoices from '../../../Components/Forms/FeatureChoices';
import Field from '../../../Components/Forms/Field';
import SelectField from '../../../Components/Forms/SelectField';
import ContentManager, { contentDefaults } from '../../../Components/Admin/ContentManager';
import LocationFields from '../../../Components/Forms/LocationFields';
import PromotionManager from '../../../Components/Admin/CondominiumPromotions';
import Map from '../../../Components/RealEstate/Map';
import AsyncMediaUploader from '../../../Components/Admin/AsyncMediaUploader';
import { ProductFormLayout, PublicationCard, SeoCard, SidebarMediaIntro } from '../../../Components/Admin/ProductFormUI';

const text = {
    subdivision: 'loteamento',
    title: 'T\u00edtulo do loteamento',
    initialText: 'Breve resumo',
    address: 'Endere\u00e7o',
    business: 'Tipo de neg\u00f3cio',
};
const summaryLimit = 400;
const slugify = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const fieldLabels = {
    title: 'TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­tulo', slug: 'Slug', reference_code: 'CÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³digo de referÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªncia', subdivision_type_id: 'Tipo de loteamento',
    development_status_id: 'Status do empreendimento', business_type_id: 'Tipo de negÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³cio', city_id: 'Cidade',
    summary: 'Breve resumo', lots_info_url: 'Link das informações dos lotes', address: 'EndereÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o', address_number: 'NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºmero', complement: 'Complemento',
    neighborhood: 'Bairro', postal_code: 'CEP', latitude: 'Latitude', longitude: 'Longitude', regular_price: 'PreÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o regular',
    sale_price: 'PreÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o de venda', minimum_lot_area: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Ârea mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­nima', maximum_lot_area: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Ârea mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡xima', total_lots: 'Total de lotes',
    available_lots: 'Lotes disponÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­veis', expected_delivery_date: 'Data prevista de entrega', status: 'Status de publicaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o',
};
const errorLabel = (key) => {
    const root = key.replace(/\.\d+\..*$/, '');
    if (root === 'promotions') return 'PromoÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o';
    if (root === 'construction_stages') return 'Andamento da obra';
    return fieldLabels[root] || root.replaceAll('_', ' ');
};
const friendlyError = (key, message) => message?.startsWith('validation.')
    ? `O campo ${errorLabel(key)} ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© obrigatÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rio.`
    : message;

export default function Form({ item, options }) {
    const editing = Boolean(item);
    const featuredImage = item?.media_assets?.find((asset) => asset.pivot?.is_featured);
    const { data, setData, transform, post, processing, errors } = useForm({
        _method: editing ? 'put' : undefined,
        title: item?.title || '', slug: item?.slug || '', reference_code: item?.reference_code || '',
        subdivision_type_id: item?.subdivision_type_id || '', development_status_id: item?.development_status_id || '',
        business_type_id: item?.business_type_id || '', city_id: item?.city_id || '', summary: item?.summary || item?.excerpt || '', lots_info_url: item?.lots_info_url || '',
        address: item?.address || '', address_number: item?.address_number || '',
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
        documents: undefined,
    });

    const submit = (event) => {
        event.preventDefault();
        transform((payload) => {
            const { faqs, floor_plans, documents, description, ...cleanPayload } = payload;
            return cleanPayload;
        });
        post(editing ? `/admin/subdivisions/${item.slug}` : '/admin/subdivisions', {
            forceFormData: true,
            preserveScroll: true,
            onError: () => requestAnimationFrame(() => {
                const message = document.querySelector('[data-product-form] [role="alert"]');
                message?.closest('label')?.querySelector('input, select, textarea')?.focus();
                message?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }),
        });
    };

    return <AdminLayout title={editing ? `Editar ${text.subdivision}` : `Novo ${text.subdivision}`}>
        <ProductFormLayout onSubmit={submit} errors={errors} processing={processing} submitLabel={`Salvar ${text.subdivision}`} sidebar={<><PublicationCard data={data} setData={setData} errors={errors} flags={[["featured", "Destaque"], ["price_on_request", "PreÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o sob consulta"]]} /><SidebarMediaIntro image={featuredImage} help="Usada no card, Hero e seÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o Sobre o loteamento." /><AsyncMediaUploader compact existing={item?.media_assets || []} removed={data.remove_media_ids || []} data={data} setData={setData} /><SeoCard data={data} setData={setData} /></>}>
            <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-2">
                <div className="tablet:col-span-2"><p className="text-xs font-medium uppercase tracking-[.08em] text-brand">Se&ccedil;&atilde;o inicial</p><h2 className="mt-2 text-lg font-medium text-ink">Hero do {text.subdivision}</h2><p className="mt-1 text-sm text-muted">Estes campos formam a abertura da p&aacute;gina. Estado e cidade s&atilde;o selecionados no bloco seguinte.</p></div>
                <Field label={text.title} value={data.title} onChange={(event) => { const title = event.target.value; setData((current) => ({ ...current, title, slug: !editing && (!current.slug || current.slug === slugify(current.title)) ? slugify(title) : current.slug })); }} error={friendlyError('title', errors.title)} />
                <SelectField label="Status da obra" options={options.statuses} value={data.development_status_id} onChange={(event) => setData('development_status_id', event.target.value)} error={friendlyError('development_status_id', errors.development_status_id)} />
                <div className="tablet:col-span-2">
                    <label className="block space-y-2">
                        <span className="text-sm font-medium text-slate-700">{fieldLabels.summary}</span>
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

            <LocationFields states={options.states} initialCity={item?.city} cityId={data.city_id} onCityChange={(cityId) => setData('city_id', cityId)} error={friendlyError('city_id', errors.city_id)} />

            <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-2">
                <div className="tablet:col-span-2"><h2 className="text-lg font-medium text-ink">Identifica&ccedil;&atilde;o</h2><p className="mt-1 text-sm text-muted">Dados internos e classifica&ccedil;&otilde;es do {text.subdivision}.</p></div>
                <div><Field label="Slug" value={data.slug} onChange={(event) => setData('slug', slugify(event.target.value))} error={friendlyError('slug', errors.slug)} /><button type="button" onClick={() => setData('slug', slugify(data.title))} className="mt-2 text-xs font-medium text-brand">Gerar novamente</button></div>
                <Field label={'C\u00f3digo de refer\u00eancia'} value={data.reference_code} onChange={(event) => setData('reference_code', event.target.value)} error={errors.reference_code} />
                <SelectField label={`Tipo de ${text.subdivision}`} options={options.types} value={data.subdivision_type_id} onChange={(event) => setData('subdivision_type_id', event.target.value)} />
                <SelectField label={text.business} options={options.businessTypes} value={data.business_type_id} onChange={(event) => setData('business_type_id', event.target.value)} />
            </section>

            <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-2">
                <div className="tablet:col-span-2"><h2 className="text-lg font-medium text-ink">Sobre o loteamento</h2><p className="mt-1 text-sm text-muted">A imagem usada nesta se&ccedil;&atilde;o ser&aacute; automaticamente a imagem principal.</p></div>
                <Field label={'T\u00edtulo'} value={data.about_title} onChange={(event) => setData('about_title', event.target.value)} />
                <Field label="Texto" as="textarea" value={data.about_text} onChange={(event) => setData('about_text', event.target.value)} />
                <div className="tablet:col-span-2 space-y-2">
                    <Field label="Link das informa\u00e7\u00f5es dos lotes" type="url" value={data.lots_info_url} onChange={(event) => setData('lots_info_url', event.target.value)} error={errors.lots_info_url} placeholder="https://..." />
                    <p className="text-xs text-muted">Adicione o link do arquivo com as plantas, divis\u00e3o e informa\u00e7\u00f5es dos lotes.</p>
                </div>
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
            <div className="[&>section:has(input[accept*='video/mp4'])]:hidden"><ContentManager data={data} setData={setData} item={item} showPlans={false} showSpecialImages={false} showFaqs={false} showDocuments={false} showSeo={false} /></div>

        </ProductFormLayout>
    </AdminLayout>;
}
