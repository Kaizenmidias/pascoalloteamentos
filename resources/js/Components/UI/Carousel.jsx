import { Children, useCallback, useEffect, useRef, useState } from 'react';

const Arrow = ({ direction }) => <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round"><path d={direction < 0 ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} /></svg>;

export default function Carousel({ children, label = 'Destaques', title = '', header = null, className = '', itemClassName = 'w-[88%] tablet:w-[48%] desktop:w-[calc((100%-2.5rem)/3)]', paused: externallyPaused = false, autoPlay = true }) {
    const track = useRef(null);
    const items = Children.toArray(children);
    const [paused, setPaused] = useState(false);
    const move = useCallback((direction) => {
        const element = track.current;
        if (!element) return;
        const card = element.firstElementChild;
        const end = element.scrollLeft + element.clientWidth >= element.scrollWidth - 8;
        const start = element.scrollLeft < 8;
        if (direction > 0 && end) element.scrollTo({ left: 0, behavior: 'smooth' });
        else if (direction < 0 && start) element.scrollTo({ left: element.scrollWidth, behavior: 'smooth' });
        else element.scrollBy({ left: direction * ((card?.clientWidth || element.clientWidth) + 20), behavior: 'smooth' });
    }, []);
    useEffect(() => { track.current?.scrollTo({ left: 0 }); }, [items.length]);
    useEffect(() => {
        if (!autoPlay || items.length < 2 || paused || externallyPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
        const timer = window.setInterval(() => move(1), 5000);
        return () => window.clearInterval(timer);
    }, [autoPlay, externallyPaused, items.length, move, paused]);

    const controls = items.length > 1 && <div className="flex shrink-0 gap-2"><button type="button" onClick={() => move(-1)} aria-label="Item anterior" className="grid size-10 place-items-center rounded-[7px] bg-brand text-white transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"><Arrow direction={-1} /></button><button type="button" onClick={() => move(1)} aria-label="Próximo item" className="grid size-10 place-items-center rounded-[7px] bg-brand text-white transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"><Arrow direction={1} /></button></div>;

    return <div className={className} role="region" aria-label={label} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)} onPlayCapture={() => setPaused(true)} onPauseCapture={() => setPaused(false)}>
        {(header || title || controls) && <div className="mb-6 flex items-center justify-between gap-5">{header || (title && <h2 className="text-[1.8rem] font-light uppercase leading-none tracking-[-.02em] text-ink tablet:text-[2.15rem] desktop:text-[2.75rem]">{title}</h2>)}{controls}</div>}
        <div ref={track} className="-mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{items.map((child, index) => <div key={child.key ?? index} className={`${itemClassName} shrink-0 snap-start`}>{child}</div>)}</div>
    </div>;
}
