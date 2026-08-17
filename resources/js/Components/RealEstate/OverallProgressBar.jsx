export default function OverallProgressBar({ value, compact = false }) {
    if (value === null || value === undefined) return null;

    const percentage = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

    return (
        <div className={compact ? 'bg-brand-dark px-4 py-2 text-white' : ''}>
            <div className={`flex items-center justify-between uppercase ${compact ? 'mb-1 text-[.65rem] font-medium' : 'mb-2 text-sm text-brand'}`}>
                <span>Conclusão da obra</span>
                <strong className={compact ? 'font-semibold' : 'font-medium'}>{percentage}%</strong>
            </div>
            <div className={`overflow-hidden rounded-full ${compact ? 'h-1.5 bg-white/25' : 'h-3 bg-[#ead7d8]'}`}>
                <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}
