const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('pt-BR').format(date);
};

export default function OverallProgressBar({ value, compact = false, completionDate = null }) {
    if (value === null || value === undefined) return null;

    const percentage = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
    const date = formatDate(completionDate);

    return (
        <div className={compact ? 'px-4 py-3' : ''}>
            <div className={`mb-2 flex flex-wrap items-center justify-between gap-2 ${compact ? 'text-[.7rem] text-muted' : 'text-sm'}`}>
                <span className={compact ? '' : 'font-medium uppercase text-brand'}>
                    {compact ? (date ? `Conclusão prevista: ${date}` : 'Conclusão da obra') : 'Conclusão geral'}
                </span>
                {!compact && date && <span className="text-muted">Conclusão prevista: {date}</span>}
            </div>
            <div className={`flex items-center gap-3 ${compact ? 'text-[.7rem] text-muted' : 'text-xs text-muted'}`}>
                {compact && date && <span className="shrink-0 whitespace-nowrap">{date}</span>}
                <div className="relative h-5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#e3e5e6]">
                    <div className="relative h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${percentage}%` }}>
                        <span className="absolute inset-0 grid place-items-center whitespace-nowrap text-[.65rem] font-semibold text-white">{percentage}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
