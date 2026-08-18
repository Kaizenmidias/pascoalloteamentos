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
        <div className={compact ? 'w-full' : ''}>
            {compact && date && <div className="px-3 pb-2 text-[.68rem] font-medium text-muted">{date}</div>}
            <div className="relative h-5 w-full overflow-hidden rounded-full bg-[#e3e5e6]">
                <div className="relative h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${percentage}%` }}>
                    <span className="absolute inset-0 grid place-items-center whitespace-nowrap text-[.65rem] font-semibold text-white">{percentage}%</span>
                </div>
            </div>
        </div>
    );
}
