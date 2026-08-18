import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import Button from '../../../Components/UI/Button';
import FeatureChoices from '../../../Components/Forms/FeatureChoices';
import Field from '../../../Components/Forms/Field';
import SelectField from '../../../Components/Forms/SelectField';
import ContentManager, { contentDefaults } from '../../../Components/Admin/ContentManager';
import LocationFields from '../../../Components/Forms/LocationFields';
import CondominiumPromotions from '../../../Components/Admin/CondominiumPromotions';
import Map from '../../../Components/RealEstate/Map';

export default function Form({ item, options }) {
    const editing = Boolean(item);
    const { data, setData, post, processing, errors } = useForm({
        _method: editing ? 'put' : undefined,
        title: item?.title || '',
        slug: item?.slug || '',
        reference_code: item?.reference_code || '',
        condominium_type_id: item?.condominium_type_id || '',
        development_status_id: item?.development_status_id || '',
        business_type_id: item?.business_type_id || '',
        city_id: item?.city_id || '',
        excerpt: item?.excerpt || '',
        description: item?.description || '',
        address: item?.address || '',
        address_number: item?.address_number || '',
        complement: item?.complement || '',
        neighborhood: item?.neighborhood || '',
        postal_code: item?.postal_code || '',
        latitude: item?.latitude || '',
        longitude: item?.longitude || '',
        whatsapp_contact: item?.whatsapp_contact || '',
        commercial_purpose: item?.commercial_purpose || '',
        commercial_status: item?.commercial_status || '',
        starting_price: item?.starting_price || '',
        promotion_price: item?.promotion_price || '',
        minimum_unit_area: item?.minimum_unit_area || '',
        about_title: item?.about_title || '',
        about_text: item?.about_text || '',
        floor_plans_support_text: item?.floor_plans_support_text || '',
        floor_plans_title: item?.floor_plans_title || '',
        promotion_headline: item?.promotion_headline || '',
        promotion_url: item?.promotion_url || '',
        expected_delivery_date: item?.expected_delivery_date ? String(item.expected_delivery_date).slice(0, 10) : '',
        status: item?.status || 'draft',
        featured: Boolean(item?.featured),
        price_on_request: Boolean(item?.price_on_request),
        feature_ids: item?.features?.map((f) => f.id) || [],
        promotions: item?.promotions || [],
        ...contentDefaults(item, options.stageDefinitions),
    });
    const submit = (e) => { e.preventDefault(); post(editing ? `/admin/condominiums/${item.slug}` : '/admin/condominiums', { forceFormData: true }); };
    return <AdminLayout title={editing ? 'Editar condomínio' : 'Novo condomínio'}><form onSubmit={submit} className="space-y-8">
        <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-2">
            <div className="tablet:col-span-2"><h2 className="text-lg font-medium text-ink">Geral e hero</h2><p className="mt-1 text-sm text-muted">Identificação, conteúdo inicial e classificações do condomínio.</p></div>
            <Field label="Título" value={data.title} onChange={e => setData('title', e.target.value)} error={errors.title} /><Field label="Slug" value={data.slug} onChange={e => setData('slug', e.target.value)} error={errors.slug} />
            <Field label="Código de referência" value={data.reference_code} onChange={e => setData('reference_code', e.target.value)} error={errors.reference_code} /><Field label="WhatsApp" value={data.whatsapp_contact} onChange={e => setData('whatsapp_contact', e.target.value)} />
            <SelectField label="Tipo de condomínio" options={options.types} value={data.condominium_type_id} onChange={e => setData('condominium_type_id', e.target.value)} /><SelectField label="Estágio" options={options.statuses} value={data.development_status_id} onChange={e => setData('development_status_id', e.target.value)} />
            <SelectField label="Tipo de negócio" options={options.businessTypes} value={data.business_type_id} onChange={e => setData('business_type_id', e.target.value)} />
            <Field label="Endereço" value={data.address} onChange={e => setData('address', e.target.value)} /><Field label="Resumo" as="textarea" value={data.excerpt} onChange={e => setData('excerpt', e.target.value)} />
            <Field label="Descrição" as="textarea" value={data.description} onChange={e => setData('description', e.target.value)} />
        </section>
        <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-4">{[['starting_price', 'Preço inicial'], ['promotion_price', 'Preço promocional'], ['minimum_unit_area', 'Área mínima']].map(([key, label]) => <Field key={key} label={label} type="number" step="0.01" min="0" value={data[key]} onChange={e => setData(key, e.target.value)} error={errors[key]} />)}</section>
        <LocationFields states={options.states} initialCity={item?.city} cityId={data.city_id} onCityChange={(cityId) => setData('city_id', cityId)} error={errors.city_id} />
        <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-3"><div className="tablet:col-span-3"><h2 className="text-lg font-medium text-ink">Endereço e mapa</h2><p className="mt-1 text-sm text-muted">O mapa prioriza latitude e longitude; o endereço serve como apoio.</p></div><Field label="Número" value={data.address_number} onChange={e => setData('address_number', e.target.value)} /><Field label="Bairro" value={data.neighborhood} onChange={e => setData('neighborhood', e.target.value)} /><Field label="CEP" value={data.postal_code} onChange={e => setData('postal_code', e.target.value)} /><Field label="Latitude" type="number" step="any" value={data.latitude} onChange={e => setData('latitude', e.target.value)} /><Field label="Longitude" type="number" step="any" value={data.longitude} onChange={e => setData('longitude', e.target.value)} /><div className="tablet:col-span-3"><Map latitude={data.latitude === '' ? null : Number(data.latitude)} longitude={data.longitude === '' ? null : Number(data.longitude)} title="Prévia da localização" /></div></section>
        <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-2"><div className="tablet:col-span-2"><h2 className="text-lg font-medium text-ink">Sobre o empreendimento</h2><p className="mt-1 text-sm text-muted">A imagem usada será automaticamente a imagem de destaque.</p></div><Field label="Título" value={data.about_title} onChange={e => setData('about_title', e.target.value)} /><Field label="Texto" as="textarea" value={data.about_text} onChange={e => setData('about_text', e.target.value)} /></section>
        <section className="rounded-card bg-white p-6 shadow-card"><FeatureChoices features={options.features} selected={data.feature_ids} onChange={ids => setData('feature_ids', ids)} /></section>
        <CondominiumPromotions rows={data.promotions} onChange={(rows) => setData('promotions', rows)} />
        <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-2"><div className="tablet:col-span-2"><h2 className="text-lg font-medium text-ink">Seção Plantas</h2></div><Field label="Título" value={data.floor_plans_title} onChange={e => setData('floor_plans_title', e.target.value)} /><Field label="Texto de apoio" as="textarea" value={data.floor_plans_support_text} onChange={e => setData('floor_plans_support_text', e.target.value)} /></section>
        <ContentManager data={data} setData={setData} item={item} showSpecialImages={false} showFaqs={false} showDocuments={false} showFeaturedUpload />
        <section className="flex flex-wrap items-end gap-5 rounded-card bg-white p-6 shadow-card"><SelectField label="Status" options={[{ id: 'draft', name: 'Rascunho' }, { id: 'published', name: 'Publicado' }, { id: 'archived', name: 'Arquivado' }]} value={data.status} onChange={e => setData('status', e.target.value)} /><SelectField label="Negócio" options={[{ id: 'sale', name: 'Venda' }, { id: 'rent', name: 'Locação' }, { id: 'season', name: 'Temporada' }]} value={data.commercial_purpose} onChange={e => setData('commercial_purpose', e.target.value)} />{[['featured', 'Destaque'], ['price_on_request', 'Preço sob consulta']].map(([key, label]) => <label key={key} className="flex gap-2 pb-3"><input type="checkbox" checked={data[key]} onChange={e => setData(key, e.target.checked)} />{label}</label>)}<Button type="submit" disabled={processing}>Salvar condomínio</Button></section>
    </form></AdminLayout>;
}
