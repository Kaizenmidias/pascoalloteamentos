<?php

namespace App\Import\WordPress;

class LegacyRecordClassifier
{
    public function classify(string $postType, array $meta = []): LegacyEntity
    {
        return match ($postType) {
            'imoveis' => LegacyEntity::Property, 'condominios' => LegacyEntity::Condominium, 'loteamentos' => LegacyEntity::Subdivision,
            'page' => LegacyEntity::Page, 'post' => LegacyEntity::BlogPost, 'diferenciais' => LegacyEntity::Feature,
            'catalogo' => $this->classifyCatalog($meta), 'revision','attachment','nav_menu_item','elementor_library' => LegacyEntity::Ignore,
            default => LegacyEntity::Review,
        };
    }

    private function classifyCatalog(array $meta): LegacyEntity
    {
        $value = strtolower(trim((string) ($meta['tipo_item'] ?? $meta['tipo-categoria'] ?? '')));

        return match ($value) {
            'imovel','imóveis','imoveis' => LegacyEntity::Property, 'condominio','condomínio','condominios' => LegacyEntity::Condominium, 'loteamento','loteamentos' => LegacyEntity::Subdivision, default => LegacyEntity::Review
        };
    }
}
