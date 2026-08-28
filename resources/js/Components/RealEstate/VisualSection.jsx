export default function VisualSection({ image, sectionId = 'visual' }) {
    if (!image?.url) return null;

    return (
        <section id={sectionId} className="scroll-mt-28">
            <div
                className="relative h-[300px] bg-cover bg-center bg-no-repeat tablet:h-[400px] desktop:h-[500px]"
                style={{ backgroundImage: `url(${image.url})` }}
            >
                <div className="absolute inset-0 bg-black/25" />
            </div>
        </section>
    );
}
