<?php

return [
    'sql_path' => env('WORDPRESS_SQL_PATH', base_path('../pascoalwordpre.sql')),
    'uploads_path' => env('WORDPRESS_UPLOADS_PATH', base_path('../wp-content/uploads')),
    'table_prefix' => env('WORDPRESS_TABLE_PREFIX', 'wp_d4c592_'),
    'legacy_base_url' => rtrim(env('WORDPRESS_LEGACY_BASE_URL', 'https://pascoalloteamentos.com.br'), '/'),
    'allowed_post_types' => [
        'properties' => ['imoveis', 'catalogo', 'empreendimento', 'empreendimentos'],
        'condominiums' => ['condominios', 'catalogo', 'empreendimento', 'empreendimentos'],
        'subdivisions' => ['loteamentos', 'catalogo', 'empreendimento', 'empreendimentos'],
    ],
];
