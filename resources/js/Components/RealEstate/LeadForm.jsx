import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { whatsappUrl } from '../../Support/whatsapp';

export default function LeadForm({ entityType, entityId, entityName = '', title = 'Tenho interesse' }) {
    const idKey = entityType ? `${entityType}_id` : null;
    const [submittedName, setSubmittedName] = useState('');
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({ name: '', email: '', phone: '', message: '', consent: true, source_url: typeof window === 'undefined' ? '' : window.location.href, ...(idKey ? { [idKey]: entityId } : {}) });
    const submit = (event) => { event.preventDefault(); const leadName = data.name; post('/contato', { preserveScroll: true, onSuccess: () => { setSubmittedName(leadName); reset('name', 'email', 'phone', 'message'); } }); };
    const followUp = entityType && entityName ? whatsappUrl({ type: entityType, title: entityName, name: submittedName }) : null;
    return (
        <form onSubmit={submit} className="space-y-3 rounded-card bg-white p-6 shadow-card">
            <h2 className="text-xl font-normal text-ink">{title}</h2>
            {recentlySuccessful && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800"><p>Recebemos seu contato. Nossa equipe falará com você em breve.</p>{followUp && <a href={followUp} target="_blank" rel="noreferrer" className="mt-3 inline-flex font-medium underline underline-offset-4">Falar agora pelo WhatsApp</a>}</div>}
            {[['name', 'Nome', 'text'], ['email', 'E-mail', 'email'], ['phone', 'Telefone', 'tel']].map(([key, label, type]) => <label key={key} className="block"><span className="sr-only">{label}</span><input type={type} className="admin-input bg-surface" value={data[key]} onChange={(event) => setData(key, event.target.value)} placeholder={label} required={key !== 'email'} />{errors[key] && <span className="text-xs text-red-700">{errors[key]}</span>}</label>)}
            <label className="block"><span className="sr-only">Mensagem</span><textarea className="admin-input min-h-28 bg-surface" value={data.message} onChange={(event) => setData('message', event.target.value)} placeholder="Mensagem" /></label>
            <label className="flex gap-2 text-[.65rem] text-muted"><input type="checkbox" checked={data.consent} onChange={(event) => setData('consent', event.target.checked)} required /> Autorizo o uso dos dados para retorno do contato.</label>
            <button type="submit" disabled={processing || recentlySuccessful} className="brand-button w-full">{processing ? 'Enviando...' : recentlySuccessful ? 'Contato enviado' : 'Enviar'}</button>
        </form>
    );
}
