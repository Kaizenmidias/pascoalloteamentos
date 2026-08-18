import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import ContentManager, { contentDefaults } from '../../../Components/Admin/ContentManager';
import Button from '../../../Components/UI/Button';
import FeatureChoices from '../../../Components/Forms/FeatureChoices';
import Field from '../../../Components/Forms/Field';
import SelectField from '../../../Components/Forms/SelectField';
import LocationFields from '../../../Components/Forms/LocationFields';

const numericFields = [['regular_price', 'Preço regular'], ['sale_price', 'Preço de venda'], ['rent_price', 'Preço de locação'], ['condominium_fee', 'Condomínio'], ['iptu', 'IPTU'], ['usable_area', 'Área útil'], ['total_area', 'Área total'], ['built_area', 'Área construída'], ['land_area', 'Área do terreno'], ['bedrooms', 'Quartos'], ['suites', 'Suítes'], ['bathrooms', 'Banheiros'], ['lavatories', 'Lavabos'], ['parking_spaces', 'Vagas'], ['rooms', 'Salas']];

export default function Form({ item, options }) {
    const editing = Boolean(item);
    const { data, setData, post, processing, errors } = useForm({
        _method: editing ? 'put' : undefined,
        title: item?.title || '',
        slug: item?.slug || '',
        reference_code: item?.reference_code || '',
        property_type_id: item?.property_type_id || '',
        development_status_id: item?.development_status_id || '',
        business_type_id: item?.business_type_id || '',
        city_id: item?.city_id || '',
        condominium_id: item?.condominium_id || '',
        excerpt: item?.excerpt || '',
        description: item?.description || '',
        address: item?.address || '',
        neighborhood: item?.neighborhood || '',
        postal_code: item?.postal_code || '',
        address_number: item?.address_number || '',
        complement: item?.complement || '',
        latitude: item?.latitude || '',
        longitude: item?.longitude || '',
        whatsapp_contact: item?.whatsapp_contact || '',
        commercial_purpose: item?.commercial_purpose || 'sale',
        commercial_status: item?.commercial_status || '',
        status: item?.status || 'draft',
        featured: Boolean(item?.featured),
        price_on_request: Boolean(item?.price_on_request),
        furnished: Boolean(item?.furnished),
        accepts_financing: Boolean(item?.accepts_financing),
        accepts_exchange: Boolean(item?.accepts_exchange),
        is_new: Boolean(item?.is_new),
        feature_ids: item?.features?.map((feature) => feature.id) || [],
        ...Object.fromEntries(numericFields.map(([key]) => [key, item?.[key] || ''])),
        ...contentDefaults(item),
    });

    const submit = (event) => {
        event.preventDefault();
        post(editing ? `/admin/properties/${item.slug}` : '/admin/properties', { forceFormData: true });
    };

    return (
        <AdminLayout title={editing ? 'Editar imóvel' : 'Novo imóvel'}>
            <form onSubmit={submit} className="space-y-6">
                <section className="grid gap-5 rounded-xl border border-line bg-white p-6 shadow-sm tablet:grid-cols-2">
                    <Field label="Título" value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} />
                    <Field label="Slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} error={errors.slug} />
                    <Field label="Código de referência" value={data.reference_code} onChange={(e) => setData('reference_code', e.target.value)} error={errors.reference_code} />
                    <SelectField label="Tipo de imóvel" options={options.types} value={data.property_type_id} onChange={(e) => setData('property_type_id', e.target.value)} />
                    <SelectField label="Estágio" options={options.statuses} value={data.development_status_id} onChange={(e) => setData('development_status_id', e.target.value)} />
                    <SelectField label="Tipo de negócio" options={options.businessTypes} value={data.business_type_id} onChange={(e) => setData('business_type_id', e.target.value)} />
                    <SelectField label="Condomínio relacionado" options={options.condominiums} labelKey="title" value={data.condominium_id} onChange={(e) => setData('condominium_id', e.target.value)} />
                    <Field label="Status comercial" value={data.commercial_status} onChange={(e) => setData('commercial_status', e.target.value)} />
                    <Field label="Resumo para cards" as="textarea" value={data.excerpt} onChange={(e) => setData('excerpt', e.target.value)} />
                    <Field label="Descrição completa" as="textarea" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                </section>
                <LocationFields states={options.states} initialCity={item?.city} cityId={data.city_id} onCityChange={(cityId) => setData('city_id', cityId)} error={errors.city_id} />
                <section className="grid gap-5 rounded-xl border border-line bg-white p-6 shadow-sm tablet:grid-cols-3">
                    <Field label="Endereço" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                    <Field label="Número" value={data.address_number} onChange={(e) => setData('address_number', e.target.value)} />
                    <Field label="Complemento" value={data.complement} onChange={(e) => setData('complement', e.target.value)} />
                    <Field label="Bairro" value={data.neighborhood} onChange={(e) => setData('neighborhood', e.target.value)} />
                    <Field label="CEP" value={data.postal_code} onChange={(e) => setData('postal_code', e.target.value)} />
                    <Field label="WhatsApp responsável" value={data.whatsapp_contact} onChange={(e) => setData('whatsapp_contact', e.target.value)} />
                    <Field label="Latitude" type="number" step="any" value={data.latitude} onChange={(e) => setData('latitude', e.target.value)} />
                    <Field label="Longitude" type="number" step="any" value={data.longitude} onChange={(e) => setData('longitude', e.target.value)} />
                </section>
                <section className="grid gap-5 rounded-xl border border-line bg-white p-6 shadow-sm tablet:grid-cols-3">
                    {numericFields.map(([key, label]) => <Field key={key} label={label} type="number" step="0.01" min="0" value={data[key]} onChange={(e) => setData(key, e.target.value)} error={errors[key]} />)}
                </section>
                <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
                    <FeatureChoices features={options.features} selected={data.feature_ids} onChange={(ids) => setData('feature_ids', ids)} />
                </section>
                <ContentManager data={data} setData={setData} item={item} showStages={false} />
                <section className="flex flex-wrap items-end gap-5 rounded-xl border border-line bg-white p-6 shadow-sm">
                    <SelectField label="Status" options={[{ id: 'draft', name: 'Rascunho' }, { id: 'published', name: 'Publicado' }, { id: 'archived', name: 'Arquivado' }]} value={data.status} onChange={(e) => setData('status', e.target.value)} />
                    <SelectField label="Negócio" options={[{ id: 'sale', name: 'Venda' }, { id: 'rent', name: 'Locação' }, { id: 'season', name: 'Temporada' }]} value={data.commercial_purpose} onChange={(e) => setData('commercial_purpose', e.target.value)} />
                    {[['featured', 'Destaque'], ['price_on_request', 'Preço sob consulta'], ['furnished', 'Mobiliado'], ['accepts_financing', 'Aceita financiamento'], ['accepts_exchange', 'Aceita permuta'], ['is_new', 'Imóvel novo']].map(([key, label]) => <label key={key} className="flex gap-2 pb-3"><input type="checkbox" checked={data[key]} onChange={(e) => setData(key, e.target.checked)} />{label}</label>)}
                    <Button type="submit" disabled={processing}>Salvar imóvel</Button>
                </section>
            </form>
        </AdminLayout>
    );
}
