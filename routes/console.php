<?php

use App\Import\WordPress\LegacyEntity;
use App\Import\WordPress\WordPressImportService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('wordpress:inspect', function (WordPressImportService $service) {
    $report = $service->preview(config('wordpress.sql_path'), config('wordpress.table_prefix'));

    $this->info('Dump: '.$report['dump']['path']);
    $this->line('Prefixo: '.$report['dump']['prefix']);
    $this->line('Posts encontrados: '.$report['counts']['posts']);
    $this->line('Attachments: '.$report['counts']['attachments']);
    $this->line('Taxonomias: '.$report['counts']['taxonomies']);
    $this->line('Postmeta: '.$report['counts']['postmeta']);
    $this->table(['Post type', 'Quantidade'], collect($report['post_types'])->map(fn ($count, $type) => [$type ?: '(vazio)', $count])->values()->all());

    return self::SUCCESS;
})->purpose('Inspeciona o dump WordPress sem gravar dados');

Artisan::command('wordpress:preview {entity?}', function (WordPressImportService $service) {
    $entity = $this->argument('entity');
    $report = $service->preview(config('wordpress.sql_path'), config('wordpress.table_prefix'));

    $this->info('WordPress encontrado');
    $this->line('Imóveis: '.count($report['classified']['properties']));
    $this->line('Condomínios: '.count($report['classified']['condominiums']));
    $this->line('Loteamentos: '.count($report['classified']['subdivisions']));
    $this->line('Pendências: '.count($report['classified']['pending']));
    $this->line('Attachments: '.$report['counts']['attachments']);
    $this->line('Taxonomias: '.$report['counts']['taxonomies']);

    if ($entity && in_array($entity, ['property', 'condominium', 'subdivision'], true)) {
        $this->line('Modo: dry-run para '.$entity);
    }

    return self::SUCCESS;
})->purpose('Mostra um dry-run do importador WordPress sem persistência');

Artisan::command('wordpress:import {entity?} {--execute} {--force}', function (WordPressImportService $service) {
    if (! $this->option('execute') && ! $this->option('force')) {
        $this->warn('Execução bloqueada. Use --execute para importar de verdade ou --force em automação.');
        return self::SUCCESS;
    }

    $entity = $this->argument('entity');
    $target = null;
    if ($entity) {
        $target = match ($entity) {
            'property', 'properties' => 'properties',
            'condominium', 'condominiums' => 'condominiums',
            'subdivision', 'subdivisions' => 'subdivisions',
            default => null,
        };
    }

    $result = $service->import(config('wordpress.sql_path'), config('wordpress.table_prefix'), $target, $this->option('force'));
    $this->info('Importação concluída.');
    $this->line('Importados: '.json_encode($result['imported'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    $this->line('Pendências: '.count($result['pending']));
    $this->line('Ignorados: '.count($result['ignored']));

    return self::SUCCESS;
})->purpose('Importa o WordPress legado quando executado explicitamente');

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
