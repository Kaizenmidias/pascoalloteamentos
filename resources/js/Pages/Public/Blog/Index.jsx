import { Link } from '@inertiajs/react';
import PublicLayout from '../../../Components/Layout/PublicLayout';
import SeoHead from '../../../Components/SEO/SeoHead';
import Container from '../../../Components/UI/Container';
import EmptyState from '../../../Components/UI/EmptyState';

const date = (value) => value ? new Date(value).toLocaleDateString('pt-BR') : '';

function PostCard({ post }) {
    return <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-[border-color,box-shadow] duration-300 hover:border-brand/25 hover:shadow-[0_8px_24px_rgba(17,17,17,.06)]"><div className="overflow-hidden"><img src={post.featured_media?.url || '/reference-assets/blog-city.jpg'} alt="" className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.025]" /></div><div className="flex flex-1 flex-col p-6"><div className="flex items-center justify-between gap-3 text-[.68rem] uppercase tracking-[.08em] text-muted"><span className="text-brand">{post.categories?.[0]?.name || 'Mercado imobiliario'}</span><time>{date(post.published_at)}</time></div><h2 className="mt-4 text-[1.45rem] font-normal leading-[1.2] text-ink">{post.title}</h2>{post.excerpt && <p className="mt-3 line-clamp-3 text-sm font-light leading-6 text-muted">{post.excerpt}</p>}<span className="mt-auto pt-6 text-xs font-medium uppercase tracking-[.08em] text-brand">Ler mais</span></div></Link>;
}

export default function Index({ posts }) {
    return <PublicLayout><SeoHead title="Blog" description="Conteudos para quem deseja morar, investir e acompanhar o mercado imobiliario." /><section className="relative flex min-h-[560px] items-center overflow-hidden px-5 pt-20 text-center text-white"><img src="/reference-assets/blog-people.webp" alt="" className="absolute inset-0 h-full w-full object-cover" /><div className="red-overlay absolute inset-0" /><div className="relative z-10 mx-auto max-w-[980px]"><p className="text-xs font-medium uppercase tracking-[.14em] text-white/75">Blog Pascoal</p><h1 className="mt-5 text-[clamp(2.6rem,5vw,4.5rem)] font-light leading-[1.06] tracking-[-.025em]">Conteudo para escolher, morar e investir melhor.</h1><p className="mx-auto mt-6 max-w-[760px] text-lg font-light leading-8 text-white/85">Noticias, guias e tendencias sobre empreendimentos e o mercado imobiliario.</p></div></section><Container className="py-[var(--section-space)]">{posts.data.length ? <div className="grid gap-7 tablet:grid-cols-2 desktop:grid-cols-3">{posts.data.map((post) => <PostCard key={post.id} post={post} />)}</div> : <EmptyState>Os artigos serao publicados em breve.</EmptyState>}</Container></PublicLayout>;
}
