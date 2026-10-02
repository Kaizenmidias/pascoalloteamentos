<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#971C20">
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
        @php
            try { $trackingHead = app(\App\Services\Tracking\TrackingManager::class)->head(); }
            catch (\Throwable) { $trackingHead = collect(); }
        @endphp
        @foreach($trackingHead as $trackingCode)
            {!! $trackingCode !!}
        @endforeach
        <script>
            (function () {
                var lastUrl = window.location.href;
                document.addEventListener('inertia:navigate', function () {
                    if (window.location.href === lastUrl) return;
                    lastUrl = window.location.href;
                    if (typeof window.fbq === 'function') window.fbq('track', 'PageView');
                    if (typeof window.gtag === 'function' && Array.isArray(window.__pascoalGoogleAnalyticsIds)) window.gtag('event', 'page_view', {send_to: window.__pascoalGoogleAnalyticsIds, page_path: window.location.pathname + window.location.search});
                });
            })();
        </script>
    </head>
    <body class="bg-white font-sans text-text antialiased">
        @php
            try { $trackingManager = app(\App\Services\Tracking\TrackingManager::class); $trackingBodyStart = $trackingManager->bodyStart(); $trackingBodyEnd = $trackingManager->bodyEnd(); }
            catch (\Throwable) { $trackingBodyStart = collect(); $trackingBodyEnd = collect(); }
        @endphp
        @foreach($trackingBodyStart as $trackingCode)
            {!! $trackingCode !!}
        @endforeach
        @inertia
        @foreach($trackingBodyEnd as $trackingCode)
            {!! $trackingCode !!}
        @endforeach
    </body>
</html>
