import OverallProgressBar from './OverallProgressBar';

const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0));
const formatDate = (value) => value ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(value)) : null;

export default function ConstructionProgress({ items = [], completionDate = null }) {
    const publicItems = items.filter((item) => item.is_public !== false);
    if (!publicItems.length) return null;

    const overall = publicItems.reduce((total, item) => total + clamp(item.progress_percent), 0) / publicItems.length;

    return (
        <div>
            <OverallProgressBar value={overall} completionDate={completionDate} />
            <div className="mt-10 grid gap-4 tablet:grid-cols-2">
                {publicItems.map((item) => {
                    const percentage = clamp(item.progress_percent);
                    const completed = percentage === 100;
                    return (
                        <article key={item.id || item.name} className="rounded-xl border border-line bg-surface p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-ink">{item.name}</h3>
                                    {item.reference_date && <time className="mt-1 block text-xs text-muted" dateTime={item.reference_date}>Atualizado em {formatDate(item.reference_date)}</time>}
                                </div>
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[.62rem] font-medium uppercase ${completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                                    {completed && <span aria-hidden="true">&#10003;</span>}
                                    {completed ? 'Concluído' : 'Em andamento'}
                                </span>
                            </div>
                            <div className="mt-5 flex items-center gap-3">
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#ead7d8]"><div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${percentage}%` }} /></div>
                                <strong className="min-w-10 text-right text-sm text-brand">{Math.round(percentage)}%</strong>
                            </div>
                            {item.description && <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>}
                            {item.media_assets?.length > 0 && <div className="mt-4 grid grid-cols-2 gap-2">{item.media_assets.map((asset) => <img key={asset.id} src={asset.url} alt={asset.alt_text || `Andamento de ${item.name}`} className="aspect-[4/3] w-full rounded-lg object-cover" loading="lazy" />)}</div>}
                        </article>
                    );
                })}
            </div>
        </div>
    );
}
