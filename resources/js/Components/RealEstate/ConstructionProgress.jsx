import OverallProgressBar from './OverallProgressBar';

const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0));

export default function ConstructionProgress({ items = [], completionDate = null }) {
    const publicItems = items.filter((item) => item.is_public !== false);
    if (!publicItems.length) return null;

    const overall = publicItems.reduce((total, item) => total + clamp(item.progress_percent), 0) / publicItems.length;

    return (
        <div>
            <div className="grid gap-x-10 gap-y-9 tablet:grid-cols-2 desktop:grid-cols-3">
                {publicItems.map((item) => {
                    const percentage = clamp(item.progress_percent);
                    return <div key={item.id || item.name}>
                        <div className="mb-2 flex items-end justify-between gap-3 text-sm font-medium text-ink"><span>{item.name}</span><span className="text-xs text-brand">{Math.round(percentage)}%</span></div>
                        <div className="h-3 overflow-hidden rounded-full bg-[#ead7d8]"><div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${percentage}%` }} /></div>
                        <div className="mt-2 flex justify-between text-[.6rem] text-muted"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>
                    </div>;
                })}
            </div>
            <div className="mt-12 border-t border-line pt-7"><OverallProgressBar value={overall} completionDate={completionDate} /></div>
        </div>
    );
}
