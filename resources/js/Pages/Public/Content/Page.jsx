import { Link } from '@inertiajs/react';
import PublicLayout from '../../../Components/Layout/PublicLayout';
import SeoHead from '../../../Components/SEO/SeoHead';
import Container from '../../../Components/UI/Container';

function SectionRenderer({ section }) {
    const data = section.data || {};

    if (!section.is_active) return null;

    if (section.type === 'hero') {
        return (
            <section className="relative flex min-h-[520px] items-center overflow-hidden px-5 pt-20 text-center text-white tablet:min-h-[600px]">
                {data.image ? <img src={data.image} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 bg-brand" />}
                <div className="red-overlay absolute inset-0" />
                <Container className="relative z-10">
                    {data.subtitle && <p className="eyebrow mx-auto mb-4 text-white/80">{data.subtitle}</p>}
                    <h1 className="mx-auto max-w-5xl text-[clamp(2rem,4vw,3.5rem)] font-light leading-tight">{data.title || section.page_title}</h1>
                    {data.content && <p className="mx-auto mt-5 max-w-4xl text-base font-light leading-7 text-white/90">{data.content}</p>}
                    {data.button_label && data.button_url && <Link href={data.button_url} className="brand-button mt-8 inline-flex">{data.button_label}</Link>}
                </Container>
            </section>
        );
    }

    if (section.type === 'image-text') {
        return (
            <section className="py-[var(--section-space)]">
                <Container className="grid gap-10 desktop:grid-cols-2 desktop:items-center">
                    {data.image && <img src={data.image} alt={data.title || ''} className="mx-auto max-h-[480px] rounded-card object-cover" />}
                    <div>
                        {data.subtitle && <p className="eyebrow">{data.subtitle}</p>}
                        <h2 className="section-title mt-2">{data.title}</h2>
                        {data.content && <div className="mt-5 whitespace-pre-line text-sm leading-7 text-muted">{data.content}</div>}
                        {data.button_label && data.button_url && <Link href={data.button_url} className="brand-button mt-8 inline-flex">{data.button_label}</Link>}
                    </div>
                </Container>
            </section>
        );
    }

    if (section.type === 'cta') {
        return (
            <section className="bg-surface py-16 text-center">
                <Container>
                    {data.title && <h2 className="mx-auto max-w-2xl text-3xl font-normal text-brand">{data.title}</h2>}
                    {data.content && <p className="mx-auto mt-4 max-w-2xl text-sm text-muted">{data.content}</p>}
                    {data.button_label && data.button_url && <Link href={data.button_url} className="brand-button mt-6 inline-flex">{data.button_label}</Link>}
                </Container>
            </section>
        );
    }

    if (section.type === 'stats') {
        const items = Array.isArray(data.content) ? data.content : [];
        return (
            <section className="bg-surface py-16">
                <Container className="grid gap-6 tablet:grid-cols-3">
                    {items.map((item, index) => (
                        <div key={`${item.title || index}`} className="text-center">
                            <strong className="text-3xl font-light text-ink">{item.value}</strong>
                            <p className="mt-2 text-sm font-medium text-ink">{item.title}</p>
                            {item.description && <p className="mt-1 text-sm text-muted">{item.description}</p>}
                        </div>
                    ))}
                </Container>
            </section>
        );
    }

    return (
        <section className="py-[var(--section-space)]">
            <Container>
                {data.title && <h2 className="section-title">{data.title}</h2>}
                {data.content && <article className="mx-auto mt-5 max-w-4xl whitespace-pre-line text-base leading-8 text-muted">{data.content}</article>}
            </Container>
        </section>
    );
}

export default function Page({ page }) {
    const sections = page.sections?.length ? page.sections : [];

    return (
        <PublicLayout>
            <SeoHead title={page.seo?.title || page.title} description={page.seo?.description || ''} />
            <section className="relative flex min-h-[520px] items-center overflow-hidden px-5 pt-20 text-center text-white tablet:min-h-[600px]">
                <div className="absolute inset-0 bg-brand" />
                <div className="red-overlay absolute inset-0" />
                <Container className="relative z-10">
                    <h1 className="mx-auto max-w-5xl text-[clamp(2rem,4vw,3.5rem)] font-light leading-tight">{page.title}</h1>
                </Container>
            </section>
            {sections.length > 0 ? sections.map((section) => <SectionRenderer key={section.id} section={{ ...section, page_title: page.title }} />) : (
                <Container className="py-[var(--section-space)]">
                    <article className="mx-auto max-w-4xl whitespace-pre-line text-base leading-8 text-muted">{page.content}</article>
                </Container>
            )}
        </PublicLayout>
    );
}
