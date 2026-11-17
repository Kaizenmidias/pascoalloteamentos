import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeProductTracking, trackProductEvent } from '../../resources/js/Support/productTracking.js';

const destination = 'AW-18482697900/SjP9CPajqbodEKytnu1E';

test('global WhatsApp conversion preserves the exact label without tracking page views or forms as conversions', () => {
    const calls = [];
    globalThis.window = { gtag: (...args) => calls.push(args), __pascoalGoogleAdsConversions: [destination] };
    initializeProductTracking();
    assert.equal(calls.length, 0);
    trackProductEvent('cta_click', { cta: 'whatsapp' });
    assert.deepEqual(calls.filter((call) => call[1] === 'conversion').map((call) => call[2].send_to), [destination]);
    calls.length = 0;
    trackProductEvent('lead_submitted', { cta: 'lead_form' });
    assert.equal(calls.filter((call) => call[1] === 'conversion').length, 0);
});

test('product tags use the base ID for config, deduplicate conversion destinations and respect product scope', () => {
    const calls = [];
    globalThis.window = { gtag: (...args) => calls.push(args), __pascoalGoogleAdsConversions: [destination] };
    initializeProductTracking([
        { type: 'google_ads', identifier: destination },
        { type: 'google_ads', identifier: 'AW-18482697900' },
        { type: 'google_ads', identifier: 'AW-123/Disabled', is_active: false },
    ]);
    assert.deepEqual(calls, [['config', 'AW-18482697900']]);
    trackProductEvent('cta_click', { cta: 'whatsapp' });
    assert.deepEqual(calls.filter((call) => call[1] === 'conversion').map((call) => call[2].send_to), [destination]);
    calls.length = 0;
    window.__pascoalGoogleAdsConversions = [];
    initializeProductTracking();
    trackProductEvent('cta_click', { cta: 'whatsapp' });
    assert.equal(calls.filter((call) => call[1] === 'conversion').length, 0);
});
