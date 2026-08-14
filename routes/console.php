<?php

use App\Import\WordPress\WordPressImportService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

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

Artisan::command('wordpress:preview {entity?} {--details} {--type=}', function (WordPressImportService $service) {
    $entity = $this->argument('entity');
    $report = $service->preview(config('wordpress.sql_path'), config('wordpress.table_prefix'));
    $details = (bool) $this->option('details');
    $type = (string) $this->option('type');

    $this->info('WordPress found');
    $this->line('Properties: '.count($report['classified']['properties']));
    $this->line('Condominiums: '.count($report['classified']['condominiums']));
    $this->line('Subdivisions: '.count($report['classified']['subdivisions']));
    $this->line('Pending: '.count($report['classified']['pending']));
    $this->line('Attachments: '.$report['counts']['attachments']);
    $this->line('Taxonomies: '.$report['counts']['taxonomies']);

    if ($entity && in_array($entity, ['property', 'condominium', 'subdivision'], true)) {
        $this->line('Mode: dry-run for '.$entity);
    }

    if ($type !== '' && isset($report['details'][$type])) {
        $this->line('');
        $this->info('Details for '.$type);
        $this->table(
            ['ID', 'post_type', 'title', 'slug', 'status', 'reason'],
            array_map(
                fn (array $row) => [$row['id'], $row['post_type'], $row['title'], $row['slug'], $row['status'], $row['reason']],
                $report['details'][$type]
            )
        );
    }

    if ($details) {
        $this->line('');
        $this->info('Properties');
        $this->table(
            ['ID', 'post_type', 'title', 'slug', 'status', 'reason'],
            array_map(
                fn (array $row) => [$row['id'], $row['post_type'], $row['title'], $row['slug'], $row['status'], $row['reason']],
                $report['details']['properties']
            )
        );

        $this->line('');
        $this->info('Condominiums');
        $this->table(
            ['ID', 'post_type', 'title', 'slug', 'status', 'reason'],
            array_map(
                fn (array $row) => [$row['id'], $row['post_type'], $row['title'], $row['slug'], $row['status'], $row['reason']],
                $report['details']['condominiums']
            )
        );

        $this->line('');
        $this->info('Subdivisions');
        $this->table(
            ['ID', 'post_type', 'title', 'slug', 'status', 'reason'],
            array_map(
                fn (array $row) => [$row['id'], $row['post_type'], $row['title'], $row['slug'], $row['status'], $row['reason']],
                $report['details']['subdivisions']
            )
        );

        $this->line('');
        $this->info('Pending groups');
        foreach ($report['details']['pending'] as $group) {
            $this->line($group['category'].' - '.$group['reason'].' ('.count($group['items']).')');
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
