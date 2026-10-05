import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Pascoal Loteamentos';

function ProductTracking({ initialProps }) {
    useEffect(() => {
        const track = (page) => {
            if (window.location.pathname.startsWith('/admin')) return;
            if (typeof window.fbq !== 'function') {
                const queue = function () { queue.callMethod ? queue.callMethod.apply(queue, arguments) : queue.queue.push(arguments); };
                queue.push = queue;
                queue.loaded = true;
                queue.version = '2.0';
                queue.queue = [];
                window.fbq = queue;
                const script = document.createElement('script');
                script.async = true;
                script.src = 'https://connect.facebook.net/en_US/fbevents.js';
                document.head.appendChild(script);
            }
            const pixels = Array.isArray(page?.props?.item?.tracking_pixels) ? page.props.item.tracking_pixels : [];
            const globalIds = new Set(Array.isArray(window.__pascoalMetaPixelIds) ? window.__pascoalMetaPixelIds : []);
            const ids = pixels.filter((pixel) => pixel?.is_active !== false && pixel?.pixel_id && !globalIds.has(pixel.pixel_id)).map((pixel) => pixel.pixel_id);
            [...new Set(ids)].forEach((id) => { window.fbq('init', id); window.fbq('trackSingle', id, 'PageView'); });
        };
        track({ props: initialProps });
        return router.on('navigate', (event) => track(event.detail.page));
    }, [initialProps]);

    return null;
}

createInertiaApp({
    title: (title) => (title ? `${title} | ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        createRoot(el).render(<><ProductTracking initialProps={props} /><App {...props} /></>);
    },
    progress: {
        color: '#971C20',
    },
});
