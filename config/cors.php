<?php

$appUrl = (string) env('APP_URL', '');
$appScheme = parse_url($appUrl, PHP_URL_SCHEME);
$appHost = parse_url($appUrl, PHP_URL_HOST);
$appOrigin = $appScheme && $appHost ? $appScheme.'://'.$appHost : null;

return [
    'paths' => ['admin/media-uploads'],
    'allowed_methods' => ['POST', 'OPTIONS'],
    'allowed_origins' => array_values(array_filter([$appOrigin])),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Content-Type', 'X-Requested-With', 'X-XSRF-TOKEN', 'Accept', 'Origin'],
    'exposed_headers' => [],
    'max_age' => 3600,
    'supports_credentials' => true,
];
