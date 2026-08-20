import { Link } from '@inertiajs/react';
import PublicLayout from '../../../Components/Layout/PublicLayout';
import SeoHead from '../../../Components/SEO/SeoHead';
import Container from '../../../Components/UI/Container';

const date = (value) => value ? new Date(value).toLocaleDateString('pt-BR') : '';

export default function Show({ post, related = [] }) {
    const image = post.featured_media?.url || '/reference-assets/blog-city.jpg';
    return <PublicLayout><SeoHead title={post.seo?.title || post.title} description={post.seo?.description || post.excerpt} />
        <header className="bg-surface px-5 pb-24 pt-40 text-center tablet:pb-32 tablet:pt-48"><div className="mx-auto max-w-[980px]"><p className="text-xs font-medium uppercase tracking-[.14em] text-brand">{post.categories?.[0]?.name || 'Mercado imobiliario'}</p><h1 className="mt-5 text-[clamp(2.4rem,5vw,4.75rem)] font-light leading-[1.05] tracking-[-.03em] text-ink">{post.title}</h1>{post.excerpt && <p className="mx-auto mt-6 max-w-[760px] text-lg font-light leading-8 text-muted">{post.excerpt}</p>}<p className="mt-6 text-xs uppercase tracking-[.08em] text-muted">{date(post.published_at)} · Pascoal Loteamentos</p></div></header>
        <Container className="-mt-16 pb-[var(--section-space)]"><img src={image} alt={post.title} className="mx-auto aspect-[16/8] w-full max-w-[1120px] rounded-2xl object-cover" /><article className="rich-public-content mx-auto mt-14 max-w-[820px] text-[17px] font-light leading-[1.75] text-muted" dangerouslySetInnerHTML={{ __html: post.content }} />
        {related.length > 0 && <section className="mx-auto mt-20 max-w-[1120px] border-t border-line pt-12"><p className="eyebrow">Continue lendo</p><h2 className="section-title mt-2">Conteudos relacionados</h2><div className="mt-8 grid gap-6 tablet:grid-cols-2 desktop:grid-cols-3">{related.map((item) => <Link key={item.id} href={`/blog/${item.slug}`} className="group overflow-hidden rounded-xl border border-line bg-white"><div className="overflow-hidden"><img src={item.featured_media?.url || '/reference-assets/blog-city.jpg'} alt="" className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.025]" /></div><div className="p-5"><p className="text-xs text-muted">{date(item.published_at)}</p><h3 className="mt-2 text-xl font-normal leading-tight text-ink">{item.title}</h3><span className="mt-5 block text-xs font-medium uppercase tracking-wide text-brand">Ler mais</span></div></Link>)}</div></section>}
        </Container></PublicLayout>;
}
