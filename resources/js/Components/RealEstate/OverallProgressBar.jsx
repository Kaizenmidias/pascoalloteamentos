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
            {compact && date && <div className="py-1 pl-[10px] text-[.62rem] font-medium leading-4 text-muted">{date}</div>}
            <div className={`relative w-full overflow-hidden bg-[#e3e5e6] ${compact ? 'h-[14px] rounded-none' : 'h-5 rounded-full'}`}>
                <div className="relative h-full bg-brand transition-[width] duration-500" style={{ width: `${percentage}%` }}>
                    <span className="absolute inset-0 grid translate-x-[10px] place-items-center whitespace-nowrap text-[.6rem] font-semibold leading-none text-white">{percentage}%</span>
                </div>
            </div>
        </div>
    );
}
