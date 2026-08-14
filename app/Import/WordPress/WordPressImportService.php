<?php

namespace App\Import\WordPress;

use App\Models\BusinessType;
use App\Models\City;
use App\Models\Condominium;
use App\Models\CondominiumType;
use App\Models\ConstructionStage;
use App\Models\DevelopmentStatus;
use App\Models\Feature;
use App\Models\LegacyTaxonomyAlias;
use App\Models\MediaAsset;
use App\Models\Property;
use App\Models\PropertyType;
use App\Models\SeoMeta;
use App\Models\State;
use App\Models\Subdivision;
use App\Models\SubdivisionType;
use App\Services\Media\MediaAssetService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class WordPressImportService
{
    public function __construct(
        private readonly WordPressDumpParser $parser,
        private readonly LegacyRecordClassifier $classifier,
        private readonly ImportCheckpointRepository $checkpoints,
        private readonly MediaAssetService $media,
    ) {}

    public function preview(string $path, string $prefix): array
    {
        $dump = $this->parser->parse($path, $prefix);

        $classified = $this->classifyPosts($dump);

        return [
            'dump' => ['path' => $dump->path, 'prefix' => $dump->prefix],
            'counts' => [
                'posts' => count($dump->posts),
                'attachments' => count($dump->attachments),
                'taxonomies' => count($dump->termTaxonomy),
                'postmeta' => count($dump->postmeta),
                'states' => count($this->findTermsByTaxonomy($dump, ['state', 'estado'])),
                'cities' => count($this->findTermsByTaxonomy($dump, ['city', 'cidade'])),
            ],
            'post_types' => $dump->postTypeCounts,
            'classified' => $classified,
            'pending' => $this->pendingFromClassified($classified),
        ];
    }

    public function import(string $path, string $prefix, ?string $entity = null, bool $force = false): array
    {
        $dump = $this->parser->parse($path, $prefix);
        $classified = $this->classifyPosts($dump);
        $targets = $entity ? [$entity] : ['properties', 'condominiums', 'subdivisions'];
        $result = ['imported' => [], 'pending' => [], 'ignored' => []];

        $this->importClassifications($dump, $force);
        $this->importMedia($dump);

        foreach ($targets as $target) {
            $records = $classified[$target] ?? [];
            foreach ($records as $record) {
                $result['imported'][$target] ??= 0;
                $entityResult = $this->importEntity($dump, $record, $target);
                $result['imported'][$target] += $entityResult['imported'] ? 1 : 0;
                foreach ($entityResult['pending'] as $pending) {
                    $result['pending'][] = $pending;
                }
                foreach ($entityResult['ignored'] as $ignored) {
                    $result['ignored'][] = $ignored;
                }
            }
        }

        return $result;
    }

    private function classifyPosts(WordPressDump $dump): array
    {
        $classified = ['properties' => [], 'condominiums' => [], 'subdivisions' => [], 'pending' => []];

        foreach ($dump->posts as $post) {
            $meta = $this->postMetaMap($dump, (int) $post['ID']);
            $entity = $this->classifier->classify((string) ($post['post_type'] ?? ''), $meta);
            $row = ['post' => $post, 'meta' => $meta];

            match ($entity) {
                LegacyEntity::Property => $classified['properties'][] = $row,
                LegacyEntity::Condominium => $classified['condominiums'][] = $row,
                LegacyEntity::Subdivision => $classified['subdivisions'][] = $row,
                LegacyEntity::Review => $classified['pending'][] = $row,
                default => null,
            };
        }

        return $classified;
    }

    private function pendingFromClassified(array $classified): array
    {
        return ['pending' => count($classified['pending'] ?? [])];
    }

    private function postMetaMap(WordPressDump $dump, int $postId): array
    {
        $meta = [];
        foreach ($dump->postmeta as $row) {
            if ((int) ($row['post_id'] ?? 0) !== $postId) {
                continue;
            }
            $meta[(string) $row['meta_key']] = $this->maybeUnserialize((string) ($row['meta_value'] ?? ''));
        }
        return $meta;
    }

    private function findTermsByTaxonomy(WordPressDump $dump, array $taxonomies): array
    {
        $ids = [];
        foreach ($dump->termTaxonomy as $row) {
            if (in_array((string) ($row['taxonomy'] ?? ''), $taxonomies, true)) {
                $ids[] = (int) $row['term_id'];
            }
        }
        return array_values(array_filter($dump->terms, fn ($row) => in_array((int) ($row['term_id'] ?? 0), $ids, true)));
    }

    private function importClassifications(WordPressDump $dump, bool $force): void
    {
        foreach (['property_types' => PropertyType::class, 'condominium_types' => CondominiumType::class, 'subdivision_types' => SubdivisionType::class, 'development_statuses' => DevelopmentStatus::class, 'business_types' => BusinessType::class] as $table => $model) {
            if (! Schema::hasTable($table)) {
                continue;
            }
            // seed from existing state if needed
        }

        foreach ($dump->terms as $term) {
            $slug = (string) ($term['slug'] ?? '');
            $name = (string) ($term['name'] ?? '');
            $taxonomyRows = array_values(array_filter($dump->termTaxonomy, fn ($row) => (int) ($row['term_id'] ?? 0) === (int) ($term['term_id'] ?? 0)));
            $taxonomy = (string) ($taxonomyRows[0]['taxonomy'] ?? '');

            if (in_array($taxonomy, ['category', 'post_tag', 'elementor_library'], true)) {
                continue;
            }

            if ($slug === '' || $name === '') {
                continue;
            }

            LegacyTaxonomyAlias::updateOrCreate(
                ['legacy_taxonomy' => $taxonomy, 'legacy_slug' => $slug],
                ['destination_type' => 'taxonomy', 'destination_id' => null, 'destination_url' => null, 'metadata' => ['name' => $name]]
            );
        }
    }

    private function importMedia(WordPressDump $dump): void
    {
        foreach ($dump->attachments as $attachment) {
            $this->ensureMediaAsset($attachment, []);
        }
    }

    private function importEntity(WordPressDump $dump, array $row, string $target): array
    {
        $post = $row['post'];
        $meta = $row['meta'];
        $pending = [];
        $ignored = [];
        $legacyId = (int) $post['ID'];
        $checksum = hash('sha256', json_encode([$post, $meta], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        if ($this->checkpoints->unchanged($this->targetEntity($target), $legacyId, $checksum)) {
            return ['imported' => false, 'pending' => [], 'ignored' => ['already imported']];
        }

        $checkpoint = $this->checkpoints->begin($this->targetEntity($target), $legacyId, (string) ($post['post_type'] ?? ''), $checksum);

        try {
            $model = $this->upsertEntity($target, $post, $meta, $legacyId);
            $this->importEntityRelations($dump, $model, $post, $meta);
            $this->checkpoints->complete($checkpoint, $model::class, (int) $model->id, ['slug' => $model->slug]);

            return ['imported' => true, 'pending' => $pending, 'ignored' => $ignored];
        } catch (\Throwable $error) {
            $this->checkpoints->fail($checkpoint, $error);
            $pending[] = ['legacy_id' => $legacyId, 'error' => $error->getMessage()];

            return ['imported' => false, 'pending' => $pending, 'ignored' => $ignored];
        }
    }

    private function targetEntity(string $target): LegacyEntity
    {
        return match ($target) {
            'properties' => LegacyEntity::Property,
            'condominiums' => LegacyEntity::Condominium,
            'subdivisions' => LegacyEntity::Subdivision,
            default => throw new \InvalidArgumentException("Target inválido: {$target}"),
        };
    }

    private function upsertEntity(string $target, array $post, array $meta, int $legacyId): Model
    {
        $data = $this->mapEntityData($target, $post, $meta, $legacyId);
        $query = match ($target) {
            'properties' => Property::query(),
            'condominiums' => Condominium::query(),
            'subdivisions' => Subdivision::query(),
            default => throw new \InvalidArgumentException("Target inválido: {$target}"),
        };

        $model = $query->firstOrNew([
            'legacy_source' => 'wordpress',
            'legacy_id' => $legacyId,
        ]);

        $model->fill($data);
        $model->save();

        return $model;
    }

    private function mapEntityData(string $target, array $post, array $meta, int $legacyId): array
    {
        $title = (string) ($post['post_title'] ?? '');
        $slug = $this->uniqueSlug($target, (string) ($post['post_name'] ?? Str::slug($title ?: 'wordpress-'.$legacyId)));
        $common = [
            'legacy_source' => 'wordpress',
            'legacy_id' => $legacyId,
            'title' => $title,
            'slug' => $slug,
            'excerpt' => $this->stringMeta($meta, ['_yoast_wpseo_metadesc', 'excerpt']) ?: (string) ($post['post_excerpt'] ?? ''),
            'description' => (string) ($post['post_content'] ?? ''),
            'status' => $this->statusFromLegacy((string) ($post['post_status'] ?? 'draft')),
            'published_at' => in_array(($post['post_status'] ?? ''), ['publish', 'published'], true) ? ($post['post_date'] ?? now()) : null,
            'commercial_purpose' => $this->commercialPurpose($meta),
            'featured' => $this->boolMeta($meta, ['_featured', 'featured', 'destaque']),
        ];

        if ($target === 'properties') {
            return $common + [
                'reference_code' => $this->stringMeta($meta, ['reference_code', '_reference_code', 'codigo']) ?: null,
                'property_type_id' => $this->classificationId(PropertyType::class, $this->taxonomySlug($meta, ['tipo_imovel', 'tipo-de-imovel', 'property_type'])),
                'development_status_id' => $this->classificationId(DevelopmentStatus::class, $this->taxonomySlug($meta, ['estagio', 'stage', 'development_status'])),
                'business_type_id' => $this->classificationId(BusinessType::class, $this->taxonomySlug($meta, ['tipo_negocio', 'business_type'])),
                'city_id' => $this->cityId($meta),
                'condominium_id' => $this->foreignBySlug(Condominium::class, $this->stringMeta($meta, ['condominium_slug', 'condominio_slug', 'condominium'])),
                'commercial_status' => $this->stringMeta($meta, ['commercial_status', 'status_comercial']) ?: null,
                'regular_price' => $this->decimalMeta($meta, ['preco', 'price', 'regular_price']),
                'sale_price' => $this->decimalMeta($meta, ['sale_price']),
                'rent_price' => $this->decimalMeta($meta, ['rent_price']),
                'condominium_fee' => $this->decimalMeta($meta, ['condominium_fee']),
                'iptu' => $this->decimalMeta($meta, ['iptu']),
                'usable_area' => $this->decimalMeta($meta, ['area_util', 'usable_area', 'metrage']),
                'total_area' => $this->decimalMeta($meta, ['area_total', 'total_area']),
                'built_area' => $this->decimalMeta($meta, ['area_construida', 'built_area']),
                'land_area' => $this->decimalMeta($meta, ['area_terreno', 'land_area']),
                'bedrooms' => $this->integerMeta($meta, ['quartos', 'bedrooms']),
                'suites' => $this->integerMeta($meta, ['suites']),
                'bathrooms' => $this->integerMeta($meta, ['banheiros', 'bathrooms']),
                'lavatories' => $this->integerMeta($meta, ['lavabos', 'lavatories']),
                'parking_spaces' => $this->integerMeta($meta, ['vagas', 'parking_spaces']),
                'rooms' => $this->integerMeta($meta, ['salas', 'rooms']),
                'furnished' => $this->boolMeta($meta, ['furnished', 'mobiliado']),
                'accepts_financing' => $this->boolMeta($meta, ['accepts_financing']),
                'accepts_exchange' => $this->boolMeta($meta, ['accepts_exchange']),
                'is_new' => $this->boolMeta($meta, ['is_new', 'imovel_novo']),
                'price_on_request' => $this->boolMeta($meta, ['price_on_request', 'sob_consulta']),
                'address' => $this->stringMeta($meta, ['address', 'endereco']) ?: null,
                'neighborhood' => $this->stringMeta($meta, ['neighborhood', 'bairro']) ?: null,
                'postal_code' => $this->stringMeta($meta, ['postal_code', 'cep']) ?: null,
                'address_number' => $this->stringMeta($meta, ['address_number', 'numero']) ?: null,
                'complement' => $this->stringMeta($meta, ['complement', 'complemento']) ?: null,
                'whatsapp_contact' => $this->stringMeta($meta, ['whatsapp', 'whatsapp_contact']) ?: null,
                'latitude' => $this->decimalMeta($meta, ['latitude']),
                'longitude' => $this->decimalMeta($meta, ['longitude']),
            ];
        }

        if ($target === 'condominiums') {
            return $common + [
                'reference_code' => $this->stringMeta($meta, ['reference_code', '_reference_code']) ?: null,
                'condominium_type_id' => $this->classificationId(CondominiumType::class, $this->taxonomySlug($meta, ['tipo_condominio', 'condominium_type'])),
                'development_status_id' => $this->classificationId(DevelopmentStatus::class, $this->taxonomySlug($meta, ['estagio', 'stage', 'development_status'])),
                'business_type_id' => $this->classificationId(BusinessType::class, $this->taxonomySlug($meta, ['tipo_negocio', 'business_type'])),
                'city_id' => $this->cityId($meta),
                'commercial_status' => $this->stringMeta($meta, ['commercial_status', 'status_comercial']) ?: null,
                'about_title' => $this->stringMeta($meta, ['about_title', 'titulo_sobre']) ?: null,
                'about_text' => $this->stringMeta($meta, ['about_text', 'texto_sobre']) ?: null,
                'floor_plans_support_text' => $this->stringMeta($meta, ['floor_plans_support_text']) ?: null,
                'starting_price' => $this->decimalMeta($meta, ['starting_price', 'preco_inicial']),
                'promotion_price' => $this->decimalMeta($meta, ['promotion_price', 'preco_promocional']),
                'minimum_unit_area' => $this->decimalMeta($meta, ['minimum_unit_area', 'area_minima']),
                'promotion_headline' => $this->stringMeta($meta, ['promotion_headline']) ?: null,
                'promotion_url' => $this->stringMeta($meta, ['promotion_url']) ?: null,
                'expected_delivery_date' => $this->dateMeta($meta, ['expected_delivery_date', 'previsao_entrega']),
                'price_on_request' => $this->boolMeta($meta, ['price_on_request', 'sob_consulta']),
                'address' => $this->stringMeta($meta, ['address', 'endereco']) ?: null,
                'neighborhood' => $this->stringMeta($meta, ['neighborhood', 'bairro']) ?: null,
                'postal_code' => $this->stringMeta($meta, ['postal_code', 'cep']) ?: null,
                'address_number' => $this->stringMeta($meta, ['address_number', 'numero']) ?: null,
                'complement' => $this->stringMeta($meta, ['complement', 'complemento']) ?: null,
                'whatsapp_contact' => $this->stringMeta($meta, ['whatsapp', 'whatsapp_contact']) ?: null,
                'latitude' => $this->decimalMeta($meta, ['latitude']),
                'longitude' => $this->decimalMeta($meta, ['longitude']),
            ];
        }

        return $common + [
            'reference_code' => $this->stringMeta($meta, ['reference_code', '_reference_code']) ?: null,
            'subdivision_type_id' => $this->classificationId(SubdivisionType::class, $this->taxonomySlug($meta, ['tipo_loteamento', 'subdivision_type'])),
            'development_status_id' => $this->classificationId(DevelopmentStatus::class, $this->taxonomySlug($meta, ['estagio', 'stage', 'development_status'])),
            'business_type_id' => $this->classificationId(BusinessType::class, $this->taxonomySlug($meta, ['tipo_negocio', 'business_type'])),
            'city_id' => $this->cityId($meta),
            'commercial_status' => $this->stringMeta($meta, ['commercial_status', 'status_comercial']) ?: null,
            'about_title' => $this->stringMeta($meta, ['about_title', 'titulo_sobre']) ?: null,
            'about_text' => $this->stringMeta($meta, ['about_text', 'texto_sobre']) ?: null,
            'regular_price' => $this->decimalMeta($meta, ['regular_price', 'preco_regular']),
            'sale_price' => $this->decimalMeta($meta, ['sale_price', 'preco_venda']),
            'minimum_lot_area' => $this->decimalMeta($meta, ['minimum_lot_area', 'area_minima']),
            'maximum_lot_area' => $this->decimalMeta($meta, ['maximum_lot_area', 'area_maxima']),
            'total_lots' => $this->integerMeta($meta, ['total_lots', 'total_lotes']),
            'available_lots' => $this->integerMeta($meta, ['available_lots', 'lotes_disponiveis']),
            'price_on_request' => $this->boolMeta($meta, ['price_on_request', 'sob_consulta']),
            'promotion_headline' => $this->stringMeta($meta, ['promotion_headline']) ?: null,
            'promotion_url' => $this->stringMeta($meta, ['promotion_url']) ?: null,
            'expected_delivery_date' => $this->dateMeta($meta, ['expected_delivery_date', 'previsao_entrega']),
            'address' => $this->stringMeta($meta, ['address', 'endereco']) ?: null,
            'neighborhood' => $this->stringMeta($meta, ['neighborhood', 'bairro']) ?: null,
            'postal_code' => $this->stringMeta($meta, ['postal_code', 'cep']) ?: null,
            'address_number' => $this->stringMeta($meta, ['address_number', 'numero']) ?: null,
            'complement' => $this->stringMeta($meta, ['complement', 'complemento']) ?: null,
            'whatsapp_contact' => $this->stringMeta($meta, ['whatsapp', 'whatsapp_contact']) ?: null,
            'latitude' => $this->decimalMeta($meta, ['latitude']),
            'longitude' => $this->decimalMeta($meta, ['longitude']),
        ];
    }

    private function importEntityRelations(WordPressDump $dump, Model $model, array $post, array $meta): void
    {
        $mediaIds = $this->attachmentIdsFromMeta($meta);
        foreach ($mediaIds as $index => $attachmentId) {
            if ($media = $this->mediaAssetByLegacyId($attachmentId)) {
                $model->mediaAssets()->syncWithoutDetaching([$media->id => ['collection' => 'gallery', 'sort_order' => $index, 'is_featured' => $index === 0]]);
            }
        }

        if ($featured = $this->featuredAttachmentId($meta, $dump, (int) $post['ID'])) {
            if ($media = $this->mediaAssetByLegacyId($featured)) {
                $model->mediaAssets()->syncWithoutDetaching([$media->id => ['collection' => 'gallery', 'sort_order' => 0, 'is_featured' => true]]);
            }
        }

        $this->syncSeo($model, $meta);
    }

    private function syncSeo(Model $model, array $meta): void
    {
        $title = $this->stringMeta($meta, ['_yoast_wpseo_title', 'seo_title']) ?: null;
        $description = $this->stringMeta($meta, ['_yoast_wpseo_metadesc', 'seo_description']) ?: null;
        $canonical = $this->stringMeta($meta, ['_yoast_wpseo_canonical']) ?: null;

        if ($title || $description || $canonical) {
            $model->seo()->updateOrCreate([], ['title' => $title, 'description' => $description, 'canonical_url' => $canonical, 'robots' => 'index,follow']);
        }
    }

    private function attachmentIdsFromMeta(array $meta): array
    {
        $ids = [];
        foreach (['gallery', 'galeria', 'images', 'images_ids', 'gallery_ids'] as $key) {
            if (! isset($meta[$key])) {
                continue;
            }
            $value = $meta[$key];
            if (is_array($value)) {
                foreach ($value as $item) {
                    if (is_numeric($item)) {
                        $ids[] = (int) $item;
                    }
                }
            } elseif (is_string($value)) {
                foreach (preg_split('/[^0-9]+/', $value) ?: [] as $item) {
                    if (is_numeric($item)) {
                        $ids[] = (int) $item;
                    }
                }
            }
        }

        return array_values(array_unique($ids));
    }

    private function featuredAttachmentId(array $meta, WordPressDump $dump, int $postId): ?int
    {
        if (! empty($meta['_thumbnail_id']) && is_numeric($meta['_thumbnail_id'])) {
            return (int) $meta['_thumbnail_id'];
        }
        return null;
    }

    private function mediaAssetByLegacyId(int $legacyId): ?MediaAsset
    {
        return MediaAsset::where(['legacy_source' => 'wordpress', 'legacy_id' => $legacyId])->first();
    }

    private function ensureMediaAsset(array $attachment, array $meta): ?MediaAsset
    {
        $legacyId = (int) ($attachment['ID'] ?? 0);
        $existing = MediaAsset::where(['legacy_source' => 'wordpress', 'legacy_id' => $legacyId])->first();
        if ($existing) {
            return $existing;
        }

        $filePath = $this->findWordPressUploadPath((string) ($attachment['guid'] ?? ''), $meta, (string) ($attachment['post_date'] ?? ''));
        if (! $filePath) {
            return null;
        }

        $asset = $this->media->storePath($filePath, 'wordpress', 'public', ['legacy_source' => 'wordpress', 'legacy_id' => $legacyId, 'metadata' => ['title' => $attachment['post_title'] ?? null]]);

        return $asset;
    }

    private function findWordPressUploadPath(string $guid, array $meta, string $postDate): ?string
    {
        $uploads = rtrim((string) config('wordpress.uploads_path'), DIRECTORY_SEPARATOR);
        if (! is_dir($uploads)) {
            return null;
        }

        $candidates = [];
        $path = parse_url($guid, PHP_URL_PATH);
        if (is_string($path) && $path !== '') {
            $candidates[] = $uploads.DIRECTORY_SEPARATOR.ltrim($path, '/\\');
            $candidates[] = $uploads.DIRECTORY_SEPARATOR.basename($path);
        }
        if ($postDate !== '') {
            $year = substr($postDate, 0, 4);
            $month = substr($postDate, 5, 2);
            $filename = basename((string) $path);
            $candidates[] = $uploads.DIRECTORY_SEPARATOR.$year.DIRECTORY_SEPARATOR.$month.DIRECTORY_SEPARATOR.$filename;
        }

        foreach ($candidates as $candidate) {
            if (is_file($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    private function classificationId(string $modelClass, ?string $slug): ?int
    {
        if (! $slug) {
            return null;
        }
        return $modelClass::where('slug', $slug)->value('id');
    }

    private function foreignBySlug(string $modelClass, ?string $slug): ?int
    {
        return $slug ? $modelClass::where('slug', $slug)->value('id') : null;
    }

    private function cityId(array $meta): ?int
    {
        $city = $this->stringMeta($meta, ['city', 'cidade', 'city_slug', 'cidade_slug']);
        return $city ? City::where('slug', Str::slug($city))->value('id') : null;
    }

    private function uniqueSlug(string $target, string $slug): string
    {
        $base = Str::slug($slug);
        $candidate = $base;
        $index = 1;
        while ($this->slugExists($target, $candidate)) {
            $candidate = "{$base}-{$index}";
            $index++;
        }
        return $candidate;
    }

    private function slugExists(string $target, string $slug): bool
    {
        return match ($target) {
            'properties' => Property::where('slug', $slug)->exists(),
            'condominiums' => Condominium::where('slug', $slug)->exists(),
            'subdivisions' => Subdivision::where('slug', $slug)->exists(),
            default => false,
        };
    }

    private function commercialPurpose(array $meta): string
    {
        $value = strtolower((string) ($meta['tipo_negocio'] ?? $meta['business_type'] ?? 'sale'));
        return match ($value) {
            'rent', 'locacao', 'locação', 'aluguel' => 'rent',
            'season', 'temporada' => 'season',
            default => 'sale',
        };
    }

    private function statusFromLegacy(string $status): string
    {
        return in_array($status, ['publish', 'published'], true) ? 'published' : ($status === 'draft' ? 'draft' : 'archived');
    }

    private function stringMeta(array $meta, array $keys): ?string
    {
        foreach ($keys as $key) {
            if (array_key_exists($key, $meta) && $meta[$key] !== '' && $meta[$key] !== null) {
                return is_scalar($meta[$key]) ? trim((string) $meta[$key]) : null;
            }
        }
        return null;
    }

    private function taxonomySlug(array $meta, array $keys): ?string
    {
        $value = $this->stringMeta($meta, $keys);
        return $value ? Str::slug($value) : null;
    }

    private function boolMeta(array $meta, array $keys): bool
    {
        $value = $this->stringMeta($meta, $keys);
        return in_array(strtolower((string) $value), ['1', 'true', 'yes', 'sim', 'on'], true);
    }

    private function decimalMeta(array $meta, array $keys): ?string
    {
        $value = $this->stringMeta($meta, $keys);
        if ($value === null) {
            return null;
        }
        $normalized = str_replace(['.', ','], ['', '.'], preg_replace('/[^0-9,\\.]/', '', $value));
        return is_numeric($normalized) ? $normalized : null;
    }

    private function integerMeta(array $meta, array $keys): ?int
    {
        $value = $this->stringMeta($meta, $keys);
        return is_numeric($value) ? (int) $value : null;
    }

    private function dateMeta(array $meta, array $keys): ?string
    {
        $value = $this->stringMeta($meta, $keys);
        if (! $value) {
            return null;
        }
        return preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) ? $value : null;
    }

    private function maybeUnserialize(string $value): mixed
    {
        $trimmed = trim($value);
        if ($trimmed === '') {
            return '';
        }
        if (! preg_match('/^(a|s|i|b|d|O):/', $trimmed)) {
            return $trimmed;
        }
        $data = @unserialize($trimmed, ['allowed_classes' => false]);
        return $data === false && $trimmed !== 'b:0;' ? $trimmed : $data;
    }
}
