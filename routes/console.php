<?php

use App\Import\WordPress\DomainImportRunner;
use App\Import\WordPress\LegacyEntity;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;

foreach (['properties' => LegacyEntity::Property, 'condominiums' => LegacyEntity::Condominium, 'subdivisions' => LegacyEntity::Subdivision] as $command => $entity) {
    Artisan::command("wordpress:import-{$command} {--commit}", function () use ($entity) {
        if ($this->option('commit')) {
            $this->error('Escrita bloqueada nesta fase: os mappers ainda precisam de homologação.');

            return 1;
        }
        foreach (app(DomainImportRunner::class)->preview($entity) as $key => $value) {
            $this->line("{$key}: {$value}");
        }

        return 0;
    })->purpose('Executa somente o dry-run estrutural do domínio WordPress');
}

foreach (['taxonomies', 'media', 'pages', 'blog', 'redirects'] as $source) {
    Artisan::command("wordpress:import-{$source} {--commit}", function () use ($source) {
        $this->line("{$source}: estrutura preparada; escrita bloqueada até a homologação do mapper.");

        return $this->option('commit') ? 1 : 0;
    })->purpose('Placeholder seguro da futura etapa de importação');
}

Artisan::command('wordpress:verify', function () {
    $required = ['properties', 'condominiums', 'subdivisions', 'legacy_imports', 'media_assets', 'redirects'];
    $missing = array_values(array_filter($required, fn ($table) => ! Schema::hasTable($table)));
    if ($missing) {
        $this->error('Tabelas ausentes: '.implode(', ', $missing));

        return 1;
    }
    $this->info('Estrutura de destino íntegra. Nenhum dado WordPress foi gravado.');

    return 0;
})->purpose('Verifica a estrutura de destino sem importar dados');
Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
