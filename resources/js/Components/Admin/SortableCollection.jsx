import { useState } from 'react';

export default function SortableCollection({ items = [], onChange, renderItem, getKey = (item, index) => item.id || index, onRemove, label = 'item', gridClass = 'space-y-4', itemClass = '' }) {
    const [dragging, setDragging] = useState(null);
    const move = (from, to) => {
        if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
        const copy = [...items];
        const [moved] = copy.splice(from, 1);
        copy.splice(to, 0, moved);
        onChange(copy);
    };
    const dragOver = (event, index) => {
        event.preventDefault();
        const from = items.findIndex((item, itemIndex) => String(getKey(item, itemIndex)) === String(dragging));
        if (from !== -1 && from !== index) move(from, index);
    };

    return <div className={gridClass}>{items.map((item, index) => {
        const key = getKey(item, index);
        const active = String(dragging) === String(key);
        return <article key={key} onDragOver={(event) => dragOver(event, index)} className={`overflow-hidden rounded-xl border border-line bg-white transition-[opacity,box-shadow,border-color] duration-150 ${active ? 'border-brand opacity-65 shadow-lg' : 'shadow-sm'} ${itemClass}`}>
            <div className="flex h-9 items-center justify-between gap-2 border-b border-line bg-surface px-2 text-xs text-muted">
                <div className="flex items-center gap-2"><button type="button" draggable aria-label={`Reordenar ${label} ${index + 1}`} title="Arraste para reordenar" onDragStart={(event) => { setDragging(key); event.dataTransfer.effectAllowed = 'move'; }} onDragEnd={() => setDragging(null)} onKeyDown={(event) => { if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); move(index, index - 1); } if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); move(index, index + 1); } }} className="cursor-grab rounded px-2 py-1 text-base leading-none hover:bg-line active:cursor-grabbing">&#8942;&#8942;</button><span aria-label={`Posi\u00e7\u00e3o ${index + 1}`} className="grid size-5 place-items-center rounded-full bg-white font-medium text-ink">{index + 1}</span></div>
                <div className="flex items-center gap-2"><button type="button" disabled={index === 0} aria-label={`Mover ${label} para tr\u00e1s`} onClick={() => move(index, index - 1)} className="disabled:opacity-25">&#8592;</button><button type="button" disabled={index === items.length - 1} aria-label={`Mover ${label} para frente`} onClick={() => move(index, index + 1)} className="disabled:opacity-25">&#8594;</button>{onRemove && <button type="button" aria-label={`Remover ${label} ${index + 1}`} onClick={() => onRemove(item, index)} className="grid size-6 place-items-center rounded-full bg-black/70 text-sm text-white">&times;</button>}</div>
            </div>
            {renderItem(item, index)}
        </article>;
    })}</div>;
}
