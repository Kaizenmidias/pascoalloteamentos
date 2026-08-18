import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import Button from '../../../Components/UI/Button';
import FeatureChoices from '../../../Components/Forms/FeatureChoices';
import Field from '../../../Components/Forms/Field';
import SelectField from '../../../Components/Forms/SelectField';
import ContentManager, { contentDefaults } from '../../../Components/Admin/ContentManager';
import LocationFields from '../../../Components/Forms/LocationFields';

export default function Form({ item, options }) {
    const editing = Boolean(item);
    const { data, setData, post, processing, errors } = useForm({
        _method: editing ? 'put' : undefined,
        title: item?.title || '',
        slug: item?.slug || '',
        reference_code: item?.reference_code || '',
        subdivision_type_id: item?.subdivision_type_id || '',
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
        regular_price: item?.regular_price || '',
        sale_price: item?.sale_price || '',
        minimum_lot_area: item?.minimum_lot_area || '',
        maximum_lot_area: item?.maximum_lot_area || '',
        total_lots: item?.total_lots || '',
        available_lots: item?.available_lots || '',
        about_title: item?.about_title || '',
        about_text: item?.about_text || '',
        promotion_headline: item?.promotion_headline || '',
        promotion_url: item?.promotion_url || '',
        expected_delivery_date: item?.expected_delivery_date ? String(item.expected_delivery_date).slice(0, 10) : '',
        status: item?.status || 'draft',
        featured: Boolean(item?.featured),
        price_on_request: Boolean(item?.price_on_request),
        feature_ids: item?.features?.map((f) => f.id) || [],
        ...contentDefaults(item, options.stageDefinitions),
    });
    const submit = (e) => { e.preventDefault(); post(editing ? `/admin/subdivisions/${item.slug}` : '/admin/subdivisions', { forceFormData: true }); };
    return <AdminLayout title={editing ? 'Editar loteamento' : 'Novo loteamento'}><form onSubmit={submit} className="space-y-8">
        <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-2">
            <Field label="Título" value={data.title} onChange={e => setData('title', e.target.value)} error={errors.title} /><Field label="Slug" value={data.slug} onChange={e => setData('slug', e.target.value)} error={errors.slug} />
            <SelectField label="Tipo de loteamento" options={options.types} value={data.subdivision_type_id} onChange={e => setData('subdivision_type_id', e.target.value)} /><SelectField label="Estágio" options={options.statuses} value={data.development_status_id} onChange={e => setData('development_status_id', e.target.value)} />
            <SelectField label="Tipo de negócio" options={options.businessTypes} value={data.business_type_id} onChange={e => setData('business_type_id', e.target.value)} />
            <Field label="Endereço" value={data.address} onChange={e => setData('address', e.target.value)} /><Field label="Resumo" as="textarea" value={data.excerpt} onChange={e => setData('excerpt', e.target.value)} />
            <Field label="Descrição" as="textarea" value={data.description} onChange={e => setData('description', e.target.value)} /><Field label="Título da seção institucional" value={data.about_title} onChange={e => setData('about_title', e.target.value)} />
            <Field label="Texto institucional" as="textarea" value={data.about_text} onChange={e => setData('about_text', e.target.value)} /><Field label="Headline promocional" value={data.promotion_headline} onChange={e => setData('promotion_headline', e.target.value)} />
            <Field label="URL promocional" type="url" value={data.promotion_url} onChange={e => setData('promotion_url', e.target.value)} />
        </section>
        <section className="grid gap-5 rounded-card bg-white p-6 shadow-card tablet:grid-cols-4">{[['regular_price', 'Preço regular'], ['sale_price', 'Preço de venda'], ['minimum_lot_area', 'Área mínima'], ['maximum_lot_area', 'Área máxima'], ['total_lots', 'Total de lotes'], ['available_lots', 'Lotes disponíveis']].map(([key, label]) => <Field key={key} label={label} type="number" step="0.01" min="0" value={data[key]} onChange={e => setData(key, e.target.value)} error={errors[key]} />)}</section>
        <LocationFields states={options.states} initialCity={item?.city} cityId={data.city_id} onCityChange={(cityId) => setData('city_id', cityId)} error={errors.city_id} />
        <section className="rounded-card bg-white p-6 shadow-card"><FeatureChoices features={options.features} selected={data.feature_ids} onChange={ids => setData('feature_ids', ids)} /></section><ContentManager data={data} setData={setData} item={item} />
        <section className="flex flex-wrap items-end gap-5 rounded-card bg-white p-6 shadow-card"><SelectField label="Status" options={[{ id: 'draft', name: 'Rascunho' }, { id: 'published', name: 'Publicado' }, { id: 'archived', name: 'Arquivado' }]} value={data.status} onChange={e => setData('status', e.target.value)} /><SelectField label="Negócio" options={[{ id: 'sale', name: 'Venda' }, { id: 'rent', name: 'Locação' }, { id: 'season', name: 'Temporada' }]} value={data.commercial_purpose} onChange={e => setData('commercial_purpose', e.target.value)} />{[['featured', 'Destaque'], ['price_on_request', 'Preço sob consulta']].map(([key, label]) => <label key={key} className="flex gap-2 pb-3"><input type="checkbox" checked={data[key]} onChange={e => setData(key, e.target.checked)} />{label}</label>)}<Button type="submit" disabled={processing}>Salvar loteamento</Button></section>
    </form></AdminLayout>;
}
