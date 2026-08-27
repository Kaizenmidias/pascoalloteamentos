import { Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../../Components/Layout/AdminLayout';

const STATUS_ORDER = ['new', 'contacted', 'qualified', 'won', 'lost'];
const STATUS_FALLBACK_LABELS = {
    new: 'Novo Lead',
    contacted: 'Contato Feito',
    qualified: 'Visita agendada',
    won: 'Venda concluída',
    lost: 'Realizar novo contato',
};

const TAB_FALLBACK_LABELS = {
    all: 'Leads',
    sell: 'Leads Venda seu Imóvel',
};

const STATUS_BADGES = {
    new: 'bg-sky-50 text-sky-700 border-sky-100',
    contacted: 'bg-amber-50 text-amber-700 border-amber-100',
    qualified: 'bg-violet-50 text-violet-700 border-violet-100',
    won: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    lost: 'bg-rose-50 text-rose-700 border-rose-100',
};

const COLUMN_ACCENTS = {
    new: 'border-sky-200',
    contacted: 'border-amber-200',
    qualified: 'border-violet-200',
    won: 'border-emerald-200',
    lost: 'border-rose-200',
};

const CARD_BORDER = 'border-line';

const formatDateTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
};

const toDateTimeLocalValue = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

const normalizePhone = (value) => {
    const digits = String(value || '').replace(/\D+/g, '');
    if (!digits) return '';
    if (digits.startsWith('55') && digits.length >= 12) return digits;
    if (digits.length === 10 || digits.length === 11) return `55${digits}`;
    return digits;
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

const buildWhatsAppMessage = (lead) => {
    const product = lead.entity_title || lead.product_name || '';
    const productText = product ? ` referente ao seu interesse em ${product}` : '';
    return `Olá, ${lead.name}. Estou entrando em contato${productText} enviado pelo site da Pascoal Loteamentos.`;
};

const buildWhatsAppUrl = (lead) => {
    const phone = normalizePhone(lead.phone);
    if (!phone) return null;
    return `https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppMessage(lead))}`;
};

const leadMatchesSellTab = (lead) => {
    const source = [lead.lead_type, lead.source_type, lead.source_label, lead.product_name, lead.source_url, lead.origin_label].filter(Boolean).join(' ').toLowerCase();
    return source.includes('venda seu imóvel') || source.includes('venda seu imovel') || source.includes('venda-seu-imovel') || source.includes('sell your property');
};

const CardAction = ({ href, onClick, colorClass, children, label }) => {
    const baseClass = `inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${colorClass}`;
    if (href) {
        return <a href={href} target="_blank" rel="noreferrer" aria-label={label} onClick={(event) => event.stopPropagation()} className={baseClass}>{children}</a>;
    }

    return <button type="button" onClick={(event) => { event.stopPropagation(); onClick?.(event); }} aria-label={label} className={baseClass}>{children}</button>;
};

const IconButton = ({ children, className = '', ...props }) => (
    <button type="button" {...props} onClick={(event) => { event.stopPropagation(); props.onClick?.(event); }} className={`inline-flex items-center justify-center rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${className}`}>
        {children}
    </button>
);

const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current"><path d="M12.04 2a9.95 9.95 0 0 0-8.56 15.03L2 22l5.15-1.34A10 10 0 1 0 12.04 2Zm5.79 14.24c-.24.68-1.41 1.27-1.94 1.34-.5.06-1.15.09-1.86-.14-.43-.14-.97-.32-1.67-.62-2.94-1.27-4.85-4.2-5-4.39-.14-.19-1.19-1.58-1.19-3.02s.75-2.14 1.02-2.44c.24-.27.64-.42 1.03-.42h.74c.23 0 .56-.08.87.66.33.8 1.13 2.77 1.23 2.97.1.2.17.44.03.69-.14.25-.22.41-.44.63-.22.22-.45.5-.65.67-.22.19-.45.39-.19.85.26.45 1.18 1.95 2.53 3.16 1.74 1.56 3.02 2.05 3.48 2.26.45.2.72.17.99-.1.27-.27 1.15-1.34 1.46-1.8.3-.46.61-.39 1.02-.23.41.16 2.61 1.23 3.06 1.45.45.22.75.33.86.52.11.19.11 1.09-.13 1.77Z"/></svg>
);

const MailIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current"><path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v.25l8 5.33 8-5.33V7H4Zm16 10V9.24l-7.44 4.96a1 1 0 0 1-1.12 0L4 9.24V17h16Z"/></svg>
);

const CalendarIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current"><path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm12 8H5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9ZM6 8h12V7a1 1 0 0 0-1-1h-1v1a1 1 0 1 1-2 0V6H8v1a1 1 0 1 1-2 0V6H5a1 1 0 0 0-1 1v1Z"/></svg>
);

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 stroke-current stroke-[2.25] fill-none"><path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const GripIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current"><path d="M9 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm10 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM9 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm10 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM9 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm10 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/></svg>
);

const EmptyState = ({ title, text }) => (
    <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-line bg-white/60 px-4 text-center">
        <div>
            <p className="text-sm font-medium text-ink">{title}</p>
            <p className="mt-2 text-xs leading-6 text-muted">{text}</p>
        </div>
    </div>
);

function LeadCard({ lead, onOpen, onDragState }) {
    const whatsappHref = buildWhatsAppUrl(lead);
    const emailHref = isValidEmail(lead.email) ? `mailto:${lead.email}` : null;

    return (
        <article
            className={`group rounded-2xl border ${CARD_BORDER} bg-white p-4 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:shadow-md`}
            onClick={() => onOpen(lead.id)}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{lead.name}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">{lead.origin_label}</p>
                    {lead.product_name && <p className="mt-1 truncate text-[11px] uppercase tracking-[0.08em] text-brand/80">{lead.product_name}</p>}
                </div>
                <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_BADGES[lead.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>{lead.status_label}</span>
                    <IconButton
                        draggable
                        aria-label={`Arrastar ${lead.name}`}
                        title="Arraste para alterar o status"
                        onDragStart={(event) => {
                            onDragState('start', lead.id);
                            event.dataTransfer.effectAllowed = 'move';
                            event.dataTransfer.setData('text/plain', String(lead.id));
                        }}
                        onDragEnd={() => onDragState('end', lead.id)}
                        className="cursor-grab rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink active:cursor-grabbing"
                    >
                        <GripIcon />
                    </IconButton>
                </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
                <a href={`tel:${normalizePhone(lead.phone) || lead.phone}`} onClick={(event) => event.stopPropagation()} className="block font-medium text-ink hover:text-brand">{lead.phone}</a>
                {emailHref ? <a href={emailHref} onClick={(event) => event.stopPropagation()} className="block text-xs text-muted hover:text-brand">{lead.email}</a> : <span className="block text-xs text-muted/60">Sem e-mail</span>}
                <p className="text-xs text-muted">{lead.created_at_label || formatDateTime(lead.created_at)}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {whatsappHref && (
                    <CardAction href={whatsappHref} colorClass="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white focus-visible:ring-emerald-300" label={`Conversar com ${lead.name} pelo WhatsApp`}>
                        <WhatsAppIcon />
                        WhatsApp
                    </CardAction>
                )}
                {emailHref && (
                    <CardAction href={emailHref} colorClass="border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-900 hover:text-white focus-visible:ring-slate-300" label={`Enviar e-mail para ${lead.name}`}>
                        <MailIcon />
                        E-mail
                    </CardAction>
                )}
            </div>
        </article>
    );
}

function Info({ label, value }) {
    if (!value) return null;
    return (
        <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</p>
            <p className="mt-1 text-sm font-medium text-ink">{value}</p>
        </div>
    );
}

function LeadModal({ lead, draft, setDraft, onClose, onSave, saving }) {
    const whatsappHref = buildWhatsAppUrl(lead);
    const emailHref = isValidEmail(lead.email) ? `mailto:${lead.email}` : null;
    const relatedTitle = lead.entity_title || lead.product_name || null;

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', onKeyDown);
        document.body.classList.add('overflow-hidden');

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.classList.remove('overflow-hidden');
        };
    }, [onClose]);

    return (
        <div role="dialog" aria-modal="true" aria-labelledby="lead-modal-title" className="fixed inset-0 z-[200] grid place-items-center bg-black/55 p-4 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
            <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Lead</p>
                        <h2 id="lead-modal-title" className="truncate text-xl font-semibold text-ink">{lead.name}</h2>
                        <p className="mt-1 text-sm text-muted">{lead.origin_label}</p>
                    </div>
                    <button type="button" aria-label="Fechar modal" onClick={onClose} className="rounded-full border border-line p-2 text-muted transition hover:bg-surface hover:text-ink">
                        <CloseIcon />
                    </button>
                </div>

                <div className="grid gap-6 overflow-y-auto px-5 py-5 sm:px-6 lg:grid-cols-[1.08fr_.92fr]">
                    <div className="space-y-5">
                        <section className="rounded-2xl border border-line bg-surface/40 p-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Info label="Telefone" value={lead.phone} />
                                <Info label="E-mail" value={lead.email || 'Sem e-mail'} />
                                <Info label="Criado em" value={lead.created_at_label || formatDateTime(lead.created_at)} />
                                <Info label="Tipo do lead" value={lead.origin_label} />
                                {relatedTitle ? <Info label={lead.entity_type ? 'Produto relacionado' : 'Produto'} value={relatedTitle} /> : null}
                                {lead.entity_type ? <Info label="Categoria" value={lead.entity_type === 'property' ? 'Imóvel' : lead.entity_type === 'condominium' ? 'Condomínio' : 'Loteamento'} /> : null}
                            </div>
                            {lead.entity_url && (
                                <div className="mt-4">
                                    <Link href={lead.entity_url} className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline">
                                        Ver empreendimento
                                    </Link>
                                </div>
                            )}
                        </section>

                        <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink">Mensagem</h3>
                            <div className="mt-3 rounded-xl bg-surface p-4">
                                <p className="whitespace-pre-line text-sm leading-6 text-muted">{lead.message || 'Nenhuma mensagem informada.'}</p>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-5">
                        <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink">Ações</h3>
                            <div className="mt-4 flex flex-wrap gap-3">
                                {whatsappHref && (
                                    <CardAction href={whatsappHref} colorClass="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white focus-visible:ring-emerald-300" label={`Conversar com ${lead.name} pelo WhatsApp`}>
                                        <WhatsAppIcon />
                                        WhatsApp
                                    </CardAction>
                                )}
                                {emailHref && (
                                    <CardAction href={emailHref} colorClass="border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-900 hover:text-white focus-visible:ring-slate-300" label={`Enviar e-mail para ${lead.name}`}>
                                        <MailIcon />
                                        E-mail
                                    </CardAction>
                                )}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink">Editar lead</h3>
                            <div className="mt-4 space-y-4">
                                <label className="block">
                                    <span className="admin-label">Status</span>
                                    <select className="admin-input bg-white" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
                                        {STATUS_ORDER.map((status) => <option key={status} value={status}>{draft.statusLabels?.[status] || STATUS_FALLBACK_LABELS[status]}</option>)}
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="admin-label">Próximo contato</span>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted"><CalendarIcon /></span>
                                        <input
                                            type="datetime-local"
                                            className="admin-input bg-white pl-10"
                                            value={draft.next_contact_at_input}
                                            onChange={(event) => setDraft({ ...draft, next_contact_at_input: event.target.value })}
                                        />
                                    </div>
                                </label>
                                <p className="text-xs leading-6 text-muted">O status movimenta o card entre as colunas do CRM. O próximo contato fica salvo no lead para retomar depois.</p>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line bg-surface/40 px-5 py-4 sm:px-6">
                    <button type="button" onClick={onClose} className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface">Descartar</button>
                    <button type="button" onClick={onSave} disabled={saving} className="brand-button min-h-11 px-5 disabled:opacity-60">{saving ? 'Salvando...' : 'Salvar'}</button>
                </div>
            </div>
        </div>
    );
}

export default function Index({ items = [], statusLabels = {}, tabs = [] }) {
    const [leads, setLeads] = useState(items);
    const [activeTab, setActiveTab] = useState('all');
    const [draggingId, setDraggingId] = useState(null);
    const [dropStatus, setDropStatus] = useState(null);
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const [draft, setDraft] = useState(null);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        setLeads(items);
    }, [items]);

    useEffect(() => {
        if (!selectedLeadId) {
            setDraft(null);
            return;
        }

        const lead = leads.find((item) => item.id === selectedLeadId);
        if (!lead) return;

        setDraft({
            ...lead,
            next_contact_at_input: toDateTimeLocalValue(lead.next_contact_at),
            statusLabels,
        });
    }, [selectedLeadId, leads, statusLabels]);

    const activeTabs = tabs.length ? tabs : Object.entries(TAB_FALLBACK_LABELS).map(([key, label]) => ({ key, label }));
    const visibleLeads = useMemo(() => leads.filter((lead) => (activeTab === 'sell' ? leadMatchesSellTab(lead) : !leadMatchesSellTab(lead))), [leads, activeTab]);
    const tabCounts = useMemo(() => ({
        all: leads.filter((lead) => !leadMatchesSellTab(lead)).length,
        sell: leads.filter((lead) => leadMatchesSellTab(lead)).length,
    }), [leads]);
    const columns = useMemo(() => STATUS_ORDER.map((status) => ({
        status,
        label: statusLabels?.[status] || STATUS_FALLBACK_LABELS[status],
        leads: visibleLeads.filter((lead) => lead.status === status),
    })), [statusLabels, visibleLeads]);
    const selectedLead = selectedLeadId ? leads.find((lead) => lead.id === selectedLeadId) : null;

    const openLead = (leadId) => {
        if (draggingId !== null) return;
        setSelectedLeadId(leadId);
    };

    const patchLead = (leadId, payload, routeSuffix = '', afterSuccess = null) => {
        const previous = leads;
        const endpoint = routeSuffix ? `/admin/leads/${leadId}/${routeSuffix}` : `/admin/leads/${leadId}`;
        setFeedback('');
        setLeads((current) => current.map((lead) => (lead.id === leadId ? { ...lead, ...payload } : lead)));
        setSaving(true);

        router.patch(endpoint, payload, {
            preserveScroll: true,
            preserveState: true,
            onError: () => {
                setLeads(previous);
                setFeedback('Não foi possível atualizar o lead.');
            },
            onSuccess: () => {
                setFeedback(routeSuffix ? 'Status atualizado.' : 'Lead atualizado.');
                afterSuccess?.();
            },
            onFinish: () => {
                setSaving(false);
            },
        });
    };

    const handleDrop = (status) => (event) => {
        event.preventDefault();
        setDropStatus(null);

        const leadId = Number(event.dataTransfer.getData('text/plain') || draggingId);
        if (!leadId) return;

        const lead = leads.find((item) => item.id === leadId);
        if (!lead || lead.status === status) {
            setDraggingId(null);
            return;
        }

        patchLead(leadId, { status }, 'status');
        setDraggingId(null);
    };

    const handleModalSave = () => {
        if (!draft || !selectedLeadId) return;

        patchLead(selectedLeadId, {
            status: draft.status,
            next_contact_at: draft.next_contact_at_input || null,
        }, '', () => {
            setSelectedLeadId(null);
            setDraft(null);
        });
    };

    return (
        <AdminLayout title="Leads">
            <div className="space-y-6">
                {feedback && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{feedback}</div>}

                <section className="rounded-3xl border border-line bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-sm uppercase tracking-[0.16em] text-muted">CRM</p>
                            <h2 className="mt-1 text-2xl font-semibold text-ink">Leads</h2>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Organize os contatos em colunas, arraste os cards entre os status e abra os detalhes em um modal sem sair da página.</p>
                        </div>
                        <div className="flex flex-wrap gap-2 rounded-full bg-surface p-1">
                            {activeTabs.map((tab) => {
                                const count = tab.key === 'sell' ? tabCounts.sell : tabCounts.all;
                                const active = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${active ? 'bg-brand text-white shadow-sm' : 'text-muted hover:bg-white hover:text-ink'}`}
                                    >
                                        {tab.label} ({count})
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="overflow-x-auto pb-2">
                    <div className="grid min-w-[1380px] gap-4 xl:grid-cols-5">
                        {columns.map((column) => {
                            const isDropActive = dropStatus === column.status;
                            return (
                                <div
                                    key={column.status}
                                    className={`flex min-h-[72vh] flex-col rounded-3xl border bg-[#fafafa] p-3 shadow-sm ${COLUMN_ACCENTS[column.status] || 'border-line'} ${isDropActive ? 'ring-2 ring-brand ring-offset-2 ring-offset-transparent' : ''}`}
                                    onDragOver={(event) => {
                                        event.preventDefault();
                                        setDropStatus(column.status);
                                    }}
                                    onDragLeave={() => setDropStatus((current) => (current === column.status ? null : current))}
                                    onDrop={(event) => { event.stopPropagation(); handleDrop(column.status)(event); }}
                                >
                                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-sm">
                                        <div>
                                            <p className="text-sm font-semibold text-ink">{column.label}</p>
                                            <p className="mt-1 text-xs text-muted">{column.leads.length} lead{column.leads.length === 1 ? '' : 's'}</p>
                                        </div>
                                        <span className="grid size-10 place-items-center rounded-full border border-line bg-surface text-sm font-semibold text-ink">{column.leads.length}</span>
                                    </div>

                                    <div className="mt-4 flex flex-1 flex-col gap-3">
                                        {column.leads.length === 0 ? (
                                            <div className="flex flex-1 items-center">
                                                <div className="w-full" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.stopPropagation(); handleDrop(column.status)(event); }}>
                                                    <EmptyState title="Solte um lead aqui" text="Arraste um card para esta coluna para atualizar o status no banco." />
                                                </div>
                                            </div>
                                        ) : (
                                            column.leads.map((lead) => (
                                                <LeadCard
                                                    key={lead.id}
                                                    lead={lead}
                                                    onOpen={openLead}
                                                    onDragState={(phase, leadId) => {
                                                        if (phase === 'start') {
                                                            setDraggingId(leadId);
                                                        }
                                                        if (phase === 'end') {
                                                            setDraggingId(null);
                                                            setDropStatus(null);
                                                        }
                                                    }}
                                                />
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            {selectedLead && draft && (
                <LeadModal
                    lead={selectedLead}
                    draft={draft}
                    setDraft={setDraft}
                    onClose={() => {
                        setSelectedLeadId(null);
                        setDraft(null);
                    }}
                    onSave={handleModalSave}
                    saving={saving}
                />
            )}
        </AdminLayout>
    );
}