function activeScripts(entries = []) {
    return Array.isArray(entries) ? entries.filter((entry) => entry?.is_active !== false) : [];
}

function ensureGoogle() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
}

function ensureMeta() {
    if (typeof window.fbq === 'function') return;
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

function ensureGtm(id) {
    if (!id || document.querySelector(`script[data-pascoal-gtm="${id}"]`)) return;
    ensureGoogle();
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    const script = document.createElement('script');
    script.async = true;
    script.dataset.pascoalGtm = id;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
}

export function initializeProductTracking(entries = [], item = {}) {
    const scripts = activeScripts(entries);
    const context = { product_id: item?.id || null, product_type: item?.entity_type || null, product_name: item?.title || null };
    window.__pascoalProductTracking = { scripts, context };

    const metaIds = scripts.filter((entry) => entry.type === 'meta_pixel' && (entry.pixel_id || entry.identifier)).map((entry) => entry.pixel_id || entry.identifier).filter(Boolean);
    if (metaIds.length) {
        ensureMeta();
        window.__pascoalProductMetaIds = [...new Set(metaIds)];
        window.__pascoalProductMetaIds.forEach((id) => { window.fbq('init', id); window.fbq('trackSingle', id, 'PageView'); });
    }

    const googleEntries = scripts.filter((entry) => ['google_analytics', 'google_ads', 'google_tag'].includes(entry.type) && entry.identifier);
    if (googleEntries.length) {
        ensureGoogle();
        googleEntries.forEach((entry) => window.gtag('config', entry.identifier));
    }

    scripts.filter((entry) => entry.type === 'google_tag_manager' && entry.identifier).forEach((entry) => ensureGtm(entry.identifier));
}

export function trackProductEvent(eventName, parameters = {}) {
    const tracking = window.__pascoalProductTracking || { scripts: [], context: {} };
    const payload = { ...tracking.context, ...parameters };
    const metaIds = [...new Set(tracking.scripts.filter((entry) => entry.type === 'meta_pixel' && (entry.pixel_id || entry.identifier)).map((entry) => entry.pixel_id || entry.identifier).filter(Boolean))];
    if (typeof window.fbq === 'function') metaIds.forEach((id) => window.fbq('trackSingle', id, eventName === 'cta_click' ? 'Contact' : 'Lead', payload));

    const googleAds = tracking.scripts.filter((entry) => entry.type === 'google_ads' && entry.identifier).map((entry) => entry.identifier);
    if (typeof window.gtag === 'function') {
        googleAds.forEach((id) => window.gtag('event', 'conversion', { ...payload, send_to: id }));
        window.gtag('event', eventName, payload);
    }

    if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: eventName, ...payload });
}
