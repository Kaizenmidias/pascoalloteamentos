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
            try {
                $integrations = \App\Models\SiteSetting::where('group', 'integrations')->pluck('value', 'key');
            } catch (\Throwable) {
                $integrations = collect();
            }
        @endphp
        @if($integrations->get('google_analytics_id'))
            <script async src="https://www.googletagmanager.com/gtag/js?id={{ rawurlencode($integrations->get('google_analytics_id')) }}"></script>
            <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',@json($integrations->get('google_analytics_id')));</script>
        @endif
    </head>
    <body class="bg-white font-sans text-text antialiased">
        @inertia
    </body>
</html>
