import { useState } from 'react';
import Carousel from '../UI/Carousel';
import MediaLightbox, { MediaLightboxTrigger, MediaTile } from './MediaLightbox';

export default function PublicMediaGallery({ items = [], label, itemClassName }) {
    const media = Array.isArray(items) ? items.filter(Boolean) : [];
    const [lightbox, setLightbox] = useState(null);

    if (!media.length) return null;

    const header = <div className="min-w-0 text-left">
        <p className="text-xs font-normal uppercase tracking-[.04em] text-brand tablet:text-sm">Fotos</p>
        <h2 className="mt-2 max-w-[760px] text-[1.8rem] font-light leading-[1.08] tracking-[-.02em] text-ink tablet:text-[2.15rem] desktop:text-[2.35rem]">Conheça cada detalhe do empreendimento</h2>
    </div>;

    return <>
        <Carousel header={header} label={label} itemClassName={itemClassName} paused={lightbox !== null} autoPlay={false}>
            {media.map((asset, index) => <MediaLightboxTrigger key={asset.id || asset.url || index} index={index} onOpen={setLightbox} className="aspect-[1.16/1] w-full overflow-hidden rounded-lg bg-ink" label={`Ampliar mídia ${index + 1}`}><MediaTile item={asset} /></MediaLightboxTrigger>)}
        </Carousel>
        <MediaLightbox items={media} open={lightbox !== null} initialIndex={lightbox || 0} onClose={() => setLightbox(null)} />
    </>;
}
