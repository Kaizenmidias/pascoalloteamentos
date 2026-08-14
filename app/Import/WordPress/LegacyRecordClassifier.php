<?php

namespace App\Import\WordPress;

class LegacyRecordClassifier
{
    public function classify(string $postType, array $meta = []): LegacyEntity
    {
        return $this->explain($postType, $meta)['entity'];
    }

    /**
     * @return array{entity: LegacyEntity, reason: string, source: string, matched_value: ?string}
     */
    public function explain(string $postType, array $meta = []): array
    {
        return match ($postType) {
            'imoveis' => [
                'entity' => LegacyEntity::Property,
                'reason' => 'post_type = imoveis',
                'source' => 'post_type',
                'matched_value' => 'imoveis',
            ],
            'condominios' => [
                'entity' => LegacyEntity::Condominium,
                'reason' => 'post_type = condominios',
                'source' => 'post_type',
                'matched_value' => 'condominios',
            ],
            'loteamentos' => [
                'entity' => LegacyEntity::Subdivision,
                'reason' => 'post_type = loteamentos',
                'source' => 'post_type',
                'matched_value' => 'loteamentos',
            ],
            'page' => [
                'entity' => LegacyEntity::Page,
                'reason' => 'post_type = page',
                'source' => 'post_type',
                'matched_value' => 'page',
            ],
            'post' => [
                'entity' => LegacyEntity::BlogPost,
                'reason' => 'post_type = post',
                'source' => 'post_type',
                'matched_value' => 'post',
            ],
            'diferenciais' => [
                'entity' => LegacyEntity::Feature,
                'reason' => 'post_type = diferenciais',
                'source' => 'post_type',
                'matched_value' => 'diferenciais',
            ],
            'catalogo' => $this->explainCatalog($meta),
            'revision', 'attachment', 'nav_menu_item', 'elementor_library', 'elementor_snippet', 'jet-engine', 'jet-smart-filters', 'wpcode', 'wp_global_styles', 'custom_css', 'oembed_cache', 'wp_navigation' => [
                'entity' => LegacyEntity::Ignore,
                'reason' => "post_type = {$postType}",
                'source' => 'post_type',
                'matched_value' => $postType,
            ],
            default => [
                'entity' => LegacyEntity::Review,
                'reason' => "unclassified post_type = {$postType}",
                'source' => 'heuristic',
                'matched_value' => $postType,
            ],
        };
    }

    /**
     * @return array{entity: LegacyEntity, reason: string, source: string, matched_value: ?string}
     */
    private function explainCatalog(array $meta): array
    {
        $value = strtolower(trim((string) ($meta['tipo_item'] ?? $meta['tipo-categoria'] ?? '')));

        return match ($value) {
            'imovel', 'imoveis' => [
                'entity' => LegacyEntity::Property,
                'reason' => 'post_type = catalogo and meta tipo_item = imovel',
                'source' => 'meta.tipo_item',
                'matched_value' => $value,
            ],
            'condominio', 'condominios' => [
                'entity' => LegacyEntity::Condominium,
                'reason' => 'post_type = catalogo and meta tipo_item = condominio',
                'source' => 'meta.tipo_item',
                'matched_value' => $value,
            ],
            'loteamento', 'loteamentos' => [
                'entity' => LegacyEntity::Subdivision,
                'reason' => 'post_type = catalogo and meta tipo_item = loteamento',
                'source' => 'meta.tipo_item',
                'matched_value' => $value,
            ],
            default => [
                'entity' => LegacyEntity::Review,
                'reason' => 'post_type = catalogo but tipo_item not mapped',
                'source' => 'meta.tipo_item',
                'matched_value' => $value === '' ? null : $value,
            ],
        };
    }
}
