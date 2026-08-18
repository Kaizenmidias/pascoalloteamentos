import { Children, useCallback, useEffect, useRef, useState } from 'react';

export default function Carousel({ children, label = 'Destaques', className = '', itemClassName = 'w-[88%] tablet:w-[48%] desktop:w-[calc((100%-2.5rem)/3)]' }) {
    const track = useRef(null);
    const items = Children.toArray(children);
    const [position, setPosition] = useState({ start: true, end: items.length < 2 });

    const updatePosition = useCallback(() => {
        const element = track.current;
        if (!element) return;
        setPosition({
            start: element.scrollLeft < 8,
            end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 8,
        });
    }, []);

    useEffect(() => {
        track.current?.scrollTo({ left: 0 });
        updatePosition();
        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
    }, [items.length, updatePosition]);

    const move = (direction) => {
        const element = track.current;
        if (!element) return;
        const card = element.firstElementChild;
        element.scrollBy({ left: direction * ((card?.clientWidth || element.clientWidth) + 20), behavior: 'smooth' });
    };

    return (
        <div className={className} role="region" aria-label={label}>
            {items.length > 1 && <div className="mb-5 flex justify-end gap-2">
                <button type="button" onClick={() => move(-1)} disabled={position.start} aria-label="Item anterior" className="grid size-10 place-items-center rounded-[7px] bg-brand text-lg text-white transition hover:bg-brand-dark disabled:cursor-default disabled:bg-line disabled:text-muted">&#8592;</button>
                <button type="button" onClick={() => move(1)} disabled={position.end} aria-label="Próximo item" className="grid size-10 place-items-center rounded-[7px] bg-brand text-lg text-white transition hover:bg-brand-dark disabled:cursor-default disabled:bg-line disabled:text-muted">&#8594;</button>
            </div>}
            <div ref={track} onScroll={updatePosition} className="-mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {items.map((child, index) => <div key={child.key ?? index} className={`${itemClassName} shrink-0 snap-start`}>{child}</div>)}
            </div>
        </div>
    );
}
