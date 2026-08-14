<?php

use App\Import\WordPress\WordPressImportService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

$renderRows = function (array $rows): array {
    return array_map(
        fn (array $row) => [
            $row['id'] ?? '',
            $row['post_type'] ?? '',
            $row['title'] ?? '',
            $row['slug'] ?? '',
            $row['status'] ?? '',
            $row['reason'] ?? '',
        ],
        $rows
    );
};

$renderPending = function (array $groups): array {
    $rows = [];
    foreach ($groups as $group) {
        foreach ($group['items'] ?? [] as $item) {
            $rows[] = [
                $item['id'] ?? '',
                $item['post_type'] ?? '',
                $item['title'] ?? '',
                $item['slug'] ?? '',
                $item['status'] ?? '',
                $group['category'] ?? '',
                $group['reason'] ?? '',
            ];
        }
    }

    return $rows;
};

Artisan::command('wordpress:inspect', function (WordPressImportService $service) {
    $report = $service->preview(config('wordpress.sql_path'), config('wordpress.table_prefix'));

    $this->info('Dump: '.$report['dump']['path']);
    $this->line('Prefix: '.$report['dump']['prefix']);
    $this->line('Posts found: '.$report['counts']['posts']);
    $this->line('Attachments: '.$report['counts']['attachments']);
    $this->line('Taxonomies: '.$report['counts']['taxonomies']);
    $this->line('Postmeta: '.$report['counts']['postmeta']);
    $this->table(['Post type', 'Count'], collect($report['post_types'])->map(fn ($count, $type) => [$type ?: '(empty)', $count])->values()->all());

    return self::SUCCESS;
})->purpose('Inspecta o dump WordPress sem gravar dados');

Artisan::command('wordpress:preview {entity?} {--details} {--type=} {--importable}', function (WordPressImportService $service) use ($renderRows, $renderPending) {
    $report = $service->preview(config('wordpress.sql_path'), config('wordpress.table_prefix'));
    $type = (string) $this->option('type');
    $details = (bool) $this->option('details');
    $importableOnly = (bool) $this->option('importable');

    $this->info('WordPress found');
    $this->line('Properties: '.$report['summary']['properties']['found']);
    $this->line('Condominiums: '.$report['summary']['condominiums']['found']);
    $this->line('Subdivisions: '.$report['summary']['subdivisions']['found']);
    $this->line('Pending: '.$report['summary']['pending']['found']);
    $this->line('Attachments: '.$report['counts']['attachments']);
    $this->line('Taxonomies: '.$report['counts']['taxonomies']);

    $view = $report['details'];
    if ($importableOnly) {
        $view = [
            'properties' => $report['details']['importable']['properties'],
            'condominiums' => $report['details']['importable']['condominiums'],
            'subdivisions' => $report['details']['importable']['subdivisions'],
            'pending' => [],
            'duplicate_groups' => $report['details']['duplicate_groups'],
            'ignored' => $report['details']['ignored'],
        ];
    }

    if ($type === 'pending') {
        $this->line('');
        $this->info('Pending');
        $this->table(['ID', 'post_type', 'title', 'slug', 'status', 'category', 'reason'], $renderPending($view['pending'] ?? []));

        return self::SUCCESS;
    }

    if ($type === 'properties') {
        $this->line('');
        $this->info($importableOnly ? 'Importable Properties' : 'Properties');
        $this->table(['ID', 'post_type', 'title', 'slug', 'status', 'reason'], $renderRows($view['properties'] ?? []));

        return self::SUCCESS;
    }

    if ($type === 'condominiums') {
        $this->line('');
        $this->info($importableOnly ? 'Importable Condominiums' : 'Condominiums');
        $this->table(['ID', 'post_type', 'title', 'slug', 'status', 'reason'], $renderRows($view['condominiums'] ?? []));

        return self::SUCCESS;
    }

    if ($type === 'subdivisions') {
        $this->line('');
        $this->info($importableOnly ? 'Importable Subdivisions' : 'Subdivisions');
        $this->table(['ID', 'post_type', 'title', 'slug', 'status', 'reason'], $renderRows($view['subdivisions'] ?? []));

        return self::SUCCESS;
    }

    $this->line('');
    $this->info('Import status summary');
    $this->table(
        ['Type', 'Found', 'Importable', 'Ignored', 'Possible duplicates'],
        [
            ['Properties', $report['summary']['properties']['found'], $report['summary']['properties']['importable'], $report['summary']['properties']['ignored'], $report['summary']['properties']['possible_duplicates']],
            ['Condominiums', $report['summary']['condominiums']['found'], $report['summary']['condominiums']['importable'], $report['summary']['condominiums']['ignored'], $report['summary']['condominiums']['possible_duplicates']],
            ['Subdivisions', $report['summary']['subdivisions']['found'], $report['summary']['subdivisions']['importable'], $report['summary']['subdivisions']['ignored'], $report['summary']['subdivisions']['possible_duplicates']],
            ['Pending', $report['summary']['pending']['found'], $report['summary']['pending']['importable'], $report['summary']['pending']['ignored'], $report['summary']['pending']['possible_duplicates']],
        ]
    );

    if ($details || $importableOnly) {
        $this->line('');
        $this->info($importableOnly ? 'Importable Properties' : 'Properties');
        $this->table(['ID', 'post_type', 'title', 'slug', 'status', 'reason'], $renderRows($view['properties'] ?? []));

        $this->line('');
        $this->info($importableOnly ? 'Importable Condominiums' : 'Condominiums');
        $this->table(['ID', 'post_type', 'title', 'slug', 'status', 'reason'], $renderRows($view['condominiums'] ?? []));

        $this->line('');
        $this->info($importableOnly ? 'Importable Subdivisions' : 'Subdivisions');
        $this->table(['ID', 'post_type', 'title', 'slug', 'status', 'reason'], $renderRows($view['subdivisions'] ?? []));

        $this->line('');
        $this->info('Pending');
        $this->table(['ID', 'post_type', 'title', 'slug', 'status', 'category', 'reason'], $renderPending($view['pending'] ?? []));

        $this->line('');
        $this->info('Duplicate groups');
        foreach ($view['duplicate_groups'] ?? [] as $group) {
            $this->line($group['key'].' ('.count($group['items']).')');
        }

        if (! empty($view['ignored'])) {
            $this->line('');
            $this->info('Ignored');
            foreach ($view['ignored'] as $bucket => $rows) {
                $this->line(strtoupper($bucket));
                $this->table(['ID', 'post_type', 'title', 'slug', 'status', 'reason'], $renderRows($rows));
            }
        }
    }

    return self::SUCCESS;
})->purpose('Shows a dry-run of the WordPress importer without persistence');

Artisan::command('wordpress:import {entity?} {--execute} {--force}', function (WordPressImportService $service) {
    if (! $this->option('execute') && ! $this->option('force')) {
        $this->warn('Execution blocked. Use --execute to import for real or --force in automation.');
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
    $this->info('Import finished.');
    $this->line('Imported: '.json_encode($result['imported'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    $this->line('Pending: '.count($result['pending']));
    $this->line('Ignored: '.count($result['ignored']));

    return self::SUCCESS;
})->purpose('Imports the legacy WordPress data when explicitly executed');

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
