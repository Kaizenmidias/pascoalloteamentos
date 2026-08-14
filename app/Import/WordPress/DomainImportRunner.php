<?php

namespace App\Import\WordPress;

class DomainImportRunner
{
    public function __construct(private readonly WordPressImportService $service) {}

    public function preview(LegacyEntity $entity): array
    {
        return match ($entity) {
            LegacyEntity::Property => $this->service->preview(config('wordpress.sql_path'), config('wordpress.table_prefix')),
            LegacyEntity::Condominium => $this->service->preview(config('wordpress.sql_path'), config('wordpress.table_prefix')),
            LegacyEntity::Subdivision => $this->service->preview(config('wordpress.sql_path'), config('wordpress.table_prefix')),
            default => ['mode' => 'dry-run', 'message' => 'Entidade não suportada.'],
        };
    }
}
