import { Link } from '@inertiajs/react';
import PublicLayout from '../../../Components/Layout/PublicLayout';
import SeoHead from '../../../Components/SEO/SeoHead';
import Container from '../../../Components/UI/Container';
import EmptyState from '../../../Components/UI/EmptyState';

const PostCard = ({ post, large = false }) => (
    <Link href={`/blog/${post.slug}`} className={`group block overflow-hidden rounded-card bg-white ${large ? '' : 'border border-line'}`}>
        <div className="relative">
            <img src={post.featured_media?.url || '/reference-assets/blog-city.jpg'} alt="" className={`w-full object-cover transition duration-500 group-hover:scale-[1.02] ${large ? 'aspect-[16/9]' : 'aspect-[4/3]'}`} />
            {large && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />}
        </div>
        <div className={large ? 'relative -mt-32 p-7 text-white' : 'p-4'}>
            <p className="text-[.65rem] opacity-70">{new Date(post.published_at).toLocaleDateString('pt-BR')}</p>
            <h3 className="mt-2 text-lg font-medium">{post.title}</h3>
            <p className={`mt-2 line-clamp-2 text-xs leading-5 ${large ? 'text-white/75' : 'text-muted'}`}>{post.excerpt}</p>
            <span className={`mt-4 block text-[.68rem] font-bold uppercase ${large ? 'text-white' : 'text-brand'}`}>Leia mais</span>
        </div>
    </Link>
);

export default function Index({ posts }) {
    const [featured, ...rest] = posts.data;

    return (
        <PublicLayout>
            <SeoHead title="Blog" description="Conteúdos para quem deseja morar, investir e acompanhar o mercado imobiliário." />
            <section className="relative flex min-h-[600px] items-center overflow-hidden px-5 pt-[80px] text-center text-white">
                <img src="/reference-assets/blog-people.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="red-overlay absolute inset-0" />
                <div className="absolute inset-0 bg-[#6f1116]/22" />
                <div className="relative z-10 mx-auto w-full max-w-[80rem]">
                    <h1 className="mx-auto max-w-[72rem] text-[46px] font-normal uppercase leading-[1.08] tracking-[-.015em]">
                        Conteúdos para quem deseja morar, investir e acompanhar o mercado imobiliário.
                    </h1>
                    <p className="mx-auto mt-4 max-w-[72rem] text-sm leading-6 text-white/80">
                        Notícias, dicas, tendências e conteúdos exclusivos sobre loteamentos, empreendimentos e investimentos imobiliários.
                    </p>
                </div>
            </section>
            <Container className="py-[var(--section-space)]">
                {featured ? (
                    <>
                        <h2 className="section-title text-brand">Mercado Imobiliário</h2>
                        <div className="mt-6 grid gap-5 desktop:grid-cols-[1.25fr_1fr]">
                            <PostCard post={featured} large />
                            <div className="grid gap-5 tablet:grid-cols-2">{rest.slice(0, 4).map((post) => <PostCard key={post.id} post={post} />)}</div>
                        </div>
                        {rest.length > 4 && <div className="mt-16 grid gap-6 tablet:grid-cols-2 desktop:grid-cols-3">{rest.slice(4).map((post) => <PostCard key={post.id} post={post} />)}</div>}
                    </>
                ) : (
                    <EmptyState>Os artigos serão publicados em breve.</EmptyState>
                )}
            </Container>
        </PublicLayout>
    );
}
