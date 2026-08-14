<?php

use App\Import\WordPress\WordPressImportService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

$renderRecords = function (array $rows): array {
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

Artisan::command('wordpress:preview {entity?} {--details} {--type=} {--importable}', function (WordPressImportService $service) use ($renderRecords) {
    $entity = $this->argument('entity');
    $report = $service->preview(config('wordpress.sql_path'), config('wordpress.table_prefix'));
    $details = (bool) $this->option('details');
    $type = (string) $this->option('type');
    $importableOnly = (bool) $this->option('importable');

    $this->info('WordPress found');
    $this->line('Properties: '.$report['summary']['properties']['found']);
    $this->line('Condominiums: '.$report['summary']['condominiums']['found']);
    $this->line('Subdivisions: '.$report['summary']['subdivisions']['found']);
    $this->line('Pending: '.$report['summary']['pending']['found']);
    $this->line('Attachments: '.$report['counts']['attachments']);
    $this->line('Taxonomies: '.$report['counts']['taxonomies']);

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

    if ($entity && in_array($entity, ['property', 'condominium', 'subdivision'], true)) {
        $this->line('Mode: dry-run for '.$entity);
    }

    $detailsBag = $report['details'];
    if ($importableOnly) {
        $detailsBag = [
            'properties' => $detailsBag['importable']['properties'],
            'condominiums' => $detailsBag['importable']['condominiums'],
            'subdivisions' => $detailsBag['importable']['subdivisions'],
            'pending' => [],
            'duplicate_groups' => $detailsBag['duplicate_groups'],
        ];
    }

    if ($type !== '' && $type !== 'pending' && isset($detailsBag[$type])) {
        $this->line('');
        $this->info('Details for '.$type);
        $this->table(['ID', 'post_type', 'title', 'slug', 'status', 'reason'], $renderRecords($detailsBag[$type]));
    }

    if ($type === 'pending') {
        $this->line('');
        $this->info('Pending groups');
        foreach ($detailsBag['pending'] as $group) {
            $this->line($group['category'].' - '.$group['reason'].' ('.count($group['items']).')');
            foreach ($group['items'] as $item) {
                $this->line('  - '.($item['id'] ?? 'n/a').' | '.($item['title'] ?? '').' | '.($item['post_type'] ?? '').' | '.($item['status'] ?? ''));
            }
        }
    }

    if ($details || $importableOnly) {
        $this->line('');
        $this->info($importableOnly ? 'Importable records' : 'Properties');
        $this->table(['ID', 'post_type', 'title', 'slug', 'status', 'reason'], $renderRecords($detailsBag['properties']));

        $this->line('');
        $this->info('Condominiums');
        $this->table(['ID', 'post_type', 'title', 'slug', 'status', 'reason'], $renderRecords($detailsBag['condominiums']));

        $this->line('');
        $this->info('Subdivisions');
        $this->table(['ID', 'post_type', 'title', 'slug', 'status', 'reason'], $renderRecords($detailsBag['subdivisions']));

        $this->line('');
        $this->info('Pending groups');
        foreach ($detailsBag['pending'] as $group) {
            $this->line($group['category'].' - '.$group['reason'].' ('.count($group['items']).')');
        }

        $this->line('');
        $this->info('Possible duplicates');
        foreach ($detailsBag['duplicate_groups'] as $group) {
            $this->line($group['key'].' ('.count($group['items']).')');
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
