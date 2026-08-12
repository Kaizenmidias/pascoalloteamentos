<?php

namespace App\Console\Commands;

use App\Import\WordPress\DomainImportRunner;
use App\Import\WordPress\LegacyEntity;
use Illuminate\Console\Command;

class WordPressDomainPreviewCommand extends Command
{
    protected $signature = 'wordpress:preview {entity : property, condominium ou subdivision}';

    protected $description = 'Pré-visualiza uma futura importação, sempre sem escrita';

    public function handle(DomainImportRunner $runner): int
    {
        $entity = LegacyEntity::tryFrom((string) $this->argument('entity'));
        if (! $entity || ! in_array($entity, [LegacyEntity::Property, LegacyEntity::Condominium, LegacyEntity::Subdivision], true)) {
            $this->error('Entidade inválida.');

            return self::FAILURE;
        } $this->table(['Campo', 'Valor'], collect($runner->preview($entity))->map(fn ($v, $k) => [$k, $v])->values()->all());

        return self::SUCCESS;
    }
}
