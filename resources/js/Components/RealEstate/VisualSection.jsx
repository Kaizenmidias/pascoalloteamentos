export default function VisualSection({ image, title = '', sectionId = 'visual' }) {
    const sectionTitle = String(title || '').trim();
    if (!image?.url && !sectionTitle) return null;

    return (
        <section id={sectionId} className="scroll-mt-28 py-14 tablet:py-[72px]">
            {sectionTitle && <div className="mx-auto mb-7 max-w-[1280px] px-5 tablet:px-8"><h2 className="text-[2rem] font-light leading-[1.08] tracking-[-.025em] text-ink tablet:text-[2.7rem] desktop:text-[3.15rem]">{sectionTitle}</h2></div>}
            {image?.url && <div
                className="relative h-[300px] bg-cover bg-center bg-no-repeat tablet:h-[400px] desktop:h-[500px]"
                style={{ backgroundImage: `url(${image.url})` }}
            >
                <div className="absolute inset-0 bg-black/25" />
            </div>}
        </section>
    );
}
