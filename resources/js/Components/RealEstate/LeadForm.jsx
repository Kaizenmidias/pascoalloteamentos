import { useForm } from '@inertiajs/react';

export default function LeadForm({ entityType, entityId, title = 'Tenho interesse' }) {
    const idKey = entityType ? `${entityType}_id` : null;
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({ name: '', email: '', phone: '', message: '', consent: true, ...(idKey ? { [idKey]: entityId } : {}) });
    const submit = (event) => { event.preventDefault(); post('/contato', { preserveScroll: true, onSuccess: () => reset('name', 'email', 'phone', 'message') }); };
    return (
        <form onSubmit={submit} className="space-y-3 rounded-card bg-white p-6 shadow-card">
            <h2 className="text-xl font-normal text-ink">{title}</h2>
            {recentlySuccessful && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Contato enviado com sucesso.</p>}
            {[['name', 'Nome', 'text'], ['email', 'E-mail', 'email'], ['phone', 'Telefone', 'tel']].map(([key, label, type]) => <label key={key} className="block"><span className="sr-only">{label}</span><input type={type} className="admin-input bg-surface" value={data[key]} onChange={(event) => setData(key, event.target.value)} placeholder={label} required={key !== 'email'} />{errors[key] && <span className="text-xs text-red-700">{errors[key]}</span>}</label>)}
            <label className="block"><span className="sr-only">Mensagem</span><textarea className="admin-input min-h-28 bg-surface" value={data.message} onChange={(event) => setData('message', event.target.value)} placeholder="Mensagem" /></label>
            <label className="flex gap-2 text-[.65rem] text-muted"><input type="checkbox" checked={data.consent} onChange={(event) => setData('consent', event.target.checked)} required /> Autorizo o uso dos dados para retorno do contato.</label>
            <button type="submit" disabled={processing} className="brand-button w-full">Enviar</button>
        </form>
    );
}
