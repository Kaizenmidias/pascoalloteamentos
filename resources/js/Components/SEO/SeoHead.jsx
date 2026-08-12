import { Head } from '@inertiajs/react';

export default function SeoHead({
    title,
    description,
    canonical,
    robots = 'index,follow',
    image,
    schema,
}) {
    return (
        <Head title={title}>
            {description && <meta name="description" content={description} />}
            <meta name="robots" content={robots} />
            {canonical && <link rel="canonical" href={canonical} />}
            <meta property="og:title" content={title} />
            {description && <meta property="og:description" content={description} />}
            {image && <meta property="og:image" content={image} />}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Head>
    );
}
