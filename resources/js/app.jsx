import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeProductTracking, trackProductEvent } from './Support/productTracking';

const appName = import.meta.env.VITE_APP_NAME || 'Pascoal Loteamentos';

function ProductTracking({ initialProps }) {
    useEffect(() => {
        const track = (page) => {
            if (window.location.pathname.startsWith('/admin')) return;
            const pixels = Array.isArray(page?.props?.item?.tracking_pixels) ? page.props.item.tracking_pixels : [];
            initializeProductTracking(pixels, page?.props?.item || {});
        };
        track({ props: initialProps });
        const unlisten = router.on('navigate', (event) => track(event.detail.page));
        const onClick = (event) => {
            const link = event.target.closest?.('a[href*="wa.me"]');
            if (link) trackProductEvent('cta_click', { cta: 'whatsapp' });
        };
        document.addEventListener('click', onClick);
        return () => { unlisten(); document.removeEventListener('click', onClick); };
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
