import { useState } from 'react';
import ResponsiveImage from './ResponsiveImage';

export default function Gallery({ items = [] }) {
    const [active, setActive] = useState(0);
    if (!items.length) return null;

    const move = (direction) => setActive((current) => (current + direction + items.length) % items.length);

    return (
        <section aria-label="Galeria" className="group">
            <div className="relative overflow-hidden rounded-card bg-surface">
                <ResponsiveImage src={items[active]?.url} alt={items[active]?.alt_text || ''} className="aspect-[16/9] w-full object-cover transition duration-500" />
                {items.length > 1 && <>
                    <button type="button" onClick={() => move(-1)} aria-label="Imagem anterior" className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-[7px] bg-brand text-xl text-white shadow-card transition hover:bg-brand-dark">&#8592;</button>
                    <button type="button" onClick={() => move(1)} aria-label="Próxima imagem" className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-[7px] bg-brand text-xl text-white shadow-card transition hover:bg-brand-dark">&#8594;</button>
                    <span className="absolute bottom-4 right-4 rounded-full bg-black/55 px-3 py-1 text-xs text-white">{active + 1} / {items.length}</span>
                </>}
            </div>
            {items.length > 1 && <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">{items.map((item, index) => <button type="button" key={item.id || index} onClick={() => setActive(index)} aria-label={`Exibir imagem ${index + 1}`} className={`shrink-0 snap-start rounded-[9px] border-2 transition ${index === active ? 'border-brand' : 'border-transparent opacity-75 hover:opacity-100'}`}><ResponsiveImage src={item.url} alt="" className="h-20 w-28 rounded-[6px] object-cover" /></button>)}</div>}
        </section>
    );
}
