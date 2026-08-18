export default function EmptyState({ title = 'Nenhum conteúdo encontrado', children, actionLabel = null, onAction = null }) {
    return <div className="rounded-card border border-line bg-surface p-8 text-center">
        <h2 className="text-xl font-bold text-ink">{title}</h2>
        {children && <p className="mt-2 text-muted">{children}</p>}
        {actionLabel && onAction && <button type="button" onClick={onAction} className="mt-5 text-xs font-medium uppercase tracking-[.08em] text-brand underline underline-offset-4">{actionLabel}</button>}
    </div>;
}
