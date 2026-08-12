import PublicLayout from '../../../Components/Layout/PublicLayout';
import SeoHead from '../../../Components/SEO/SeoHead';
import Container from '../../../Components/UI/Container';

export default function Page({ page }) {
    return <PublicLayout><SeoHead title={page.seo?.title || page.title} description={page.seo?.description || ''}/><section className="relative flex min-h-[360px] items-center bg-brand px-5 pt-20 text-center text-white"><Container><h1 className="text-[clamp(2rem,4vw,3.5rem)] font-light">{page.title}</h1></Container></section><Container className="py-[var(--section-space)]"><article className="mx-auto max-w-4xl whitespace-pre-line text-base leading-8 text-muted">{page.content}</article></Container></PublicLayout>;
}
