import Button from '../UI/Button';
import SelectField from '../Forms/SelectField';

const fieldNames = {
    title: 'Título', slug: 'Slug', city_id: 'Cidade', state_id: 'Estado', status: 'Status de publicação',
    reference_code: 'Código de referência', development_status_id: 'Status do empreendimento',
    property_type_id: 'Tipo de imóvel', condominium_type_id: 'Tipo de condomínio', subdivision_type_id: 'Tipo de loteamento',
};
const errorText = (field, message) => message?.startsWith('validation.')
    ? `O campo ${fieldNames[field] || field.replaceAll('_', ' ')} é obrigatório.`
    : message;

export function ProductFormLayout({ children, sidebar, onSubmit, errors = {}, processing, submitLabel }) {
    const hasErrors = Object.keys(errors).length > 0;
    return <form onSubmit={onSubmit} className="mx-auto w-full max-w-[1600px] space-y-4 [&_.admin-input]:min-h-10 [&_.admin-input]:rounded-lg [&_.admin-input]:px-3 [&_.admin-input]:py-2 [&_.admin-input]:text-sm [&_.admin-label]:mb-1 [&_.admin-label]:text-xs" data-product-form>
        {hasErrors && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><strong>Revise os campos destacados antes de salvar.</strong><ul className="mt-2 list-disc pl-5">{Object.entries(errors).map(([field, message]) => <li key={field} data-validation-error><strong>{fieldNames[field] || field.replaceAll('_', ' ')}:</strong> {errorText(field, message)}</li>)}</ul></div>}
        <div className="grid items-start gap-4 desktop:grid-cols-[minmax(0,2.1fr)_minmax(300px,.9fr)] widescreen:gap-5">
            <div className="min-w-0 space-y-4 [&>section]:rounded-xl [&>section]:border [&>section]:border-line [&>section]:p-5 [&>section]:shadow-sm [&>div>section]:rounded-xl [&>div>section]:border [&>div>section]:border-line [&>div>section]:p-5 [&>div>section]:shadow-sm">{children}</div>
            <aside className="min-w-0 space-y-4 desktop:sticky desktop:top-5">{sidebar}</aside>
        </div>
        <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 rounded-xl border border-line bg-white/95 px-5 py-3 shadow-[0_-8px_30px_rgba(15,23,42,.06)] backdrop-blur">
            <span className="mr-auto hidden text-xs text-muted tablet:block">As mídias são enviadas separadamente. Salve para aplicar os demais dados.</span>
            <Button type="submit" disabled={processing}>{processing ? 'Salvando...' : submitLabel}</Button>
        </div>
    </form>;
}

export function ProductCard({ title, description, children, className = '' }) {
    return <section className={`rounded-xl border border-line bg-white p-5 shadow-sm ${className}`}>
        {(title || description) && <header className="mb-4"><h2 className="text-base font-medium text-ink">{title}</h2>{description && <p className="mt-1 text-xs leading-5 text-muted">{description}</p>}</header>}
        {children}
    </section>;
}

export function PublicationCard({ data, setData, errors = {}, flags = [] }) {
    return <ProductCard title="Publicação" description="Controle a visibilidade e os destaques do produto.">
        <div className="space-y-4">
            <SelectField label="Status" options={[{ id: 'draft', name: 'Rascunho' }, { id: 'published', name: 'Publicado' }, { id: 'archived', name: 'Arquivado' }]} value={data.status} onChange={(event) => setData('status', event.target.value)} error={errors.status} />
            <SelectField label="Finalidade" options={[{ id: 'sale', name: 'Venda' }, { id: 'rent', name: 'Locação' }, { id: 'sale_rent', name: 'Venda e locação' }, { id: 'season', name: 'Temporada' }]} value={data.commercial_purpose} onChange={(event) => setData('commercial_purpose', event.target.value)} />
            <div className="grid gap-2">{flags.map(([key, label]) => <label key={key} className="flex min-h-10 items-center gap-3 rounded-lg border border-line px-3 text-sm text-ink"><input type="checkbox" checked={Boolean(data[key])} onChange={(event) => setData(key, event.target.checked)} />{label}</label>)}</div>
        </div>
    </ProductCard>;
}

export function SidebarMediaIntro({ image, help }) {
    return <ProductCard title="Imagem de destaque" description={help}>
        {image?.url ? <div className="overflow-hidden rounded-lg border border-line"><img src={image.url} alt="" className="aspect-video max-h-56 w-full object-cover" /><div className="flex items-center justify-between px-3 py-2 text-xs"><span className="truncate text-muted">{image.original_name || 'Imagem atual'}</span><span className="font-medium text-brand">Capa</span></div></div> : <div className="rounded-lg border border-dashed border-line p-5 text-center text-xs text-muted">Envie uma mídia na galeria abaixo e escolha “Definir capa”.</div>}
    </ProductCard>;
}

export function SeoCard({ data, setData }) {
    return <ProductCard title="SEO" description="Informações exibidas nos mecanismos de busca."><div className="space-y-3"><label><span className="admin-label">Título SEO</span><input className="admin-input" value={data.seo_title || ''} onChange={(event) => setData('seo_title', event.target.value)} /></label><label><span className="admin-label">Descrição SEO</span><textarea className="admin-input min-h-20" value={data.seo_description || ''} onChange={(event) => setData('seo_description', event.target.value)} /></label><label><span className="admin-label">URL canônica</span><input className="admin-input" type="url" value={data.seo_canonical_url || ''} onChange={(event) => setData('seo_canonical_url', event.target.value)} /></label></div></ProductCard>;
}
