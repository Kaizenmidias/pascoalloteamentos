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
    private const EXPLICIT_IGNORE_IDS = [];

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
        $summary = $this->previewSummary($classified);

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
            'summary' => $summary,
            'pending' => $this->pendingFromClassified($classified),
            'details' => $this->previewDetails($classified, $dump),
        ];
    }

    public function import(string $path, string $prefix, ?string $entity = null, bool $force = false): array
    {
        $dump = $this->parser->parse($path, $prefix);
        $classified = $this->classifyPosts($dump);
        $targets = $entity ? [$entity] : ['properties', 'condominiums', 'subdivisions'];
        $result = ['imported' => [], 'pending' => [], 'ignored' => [], 'media' => ['imported' => 0, 'missing' => 0, 'failed' => 0, 'skipped' => 0]];

        $this->importClassifications($dump, $force);
        $result['media'] = $this->importMedia($dump);

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
        $duplicateCounts = [];

        foreach ($dump->posts as $post) {
            $meta = $this->postMetaMap($dump, (int) $post['ID']);
            $explanation = $this->classifier->explain((string) ($post['post_type'] ?? ''), $meta);
            $entityBucket = match ($explanation['entity']) {
                LegacyEntity::Property => 'properties',
                LegacyEntity::Condominium => 'condominiums',
                LegacyEntity::Subdivision => 'subdivisions',
                LegacyEntity::Review => 'pending',
                default => null,
            };
            $row = [
                'post' => $post,
                'meta' => $meta,
                'classification' => $explanation,
                'status' => $this->statusBucket((string) ($post['post_status'] ?? '')),
                'importable' => $this->isImportable($post, $meta, $explanation),
                'manual_review' => false,
                'explicit_ignore' => in_array((int) ($post['ID'] ?? 0), self::EXPLICIT_IGNORE_IDS, true),
                'duplicate_key' => $this->duplicateKey($post, $meta),
                'duplicate_hint' => $this->duplicateHint($post, $meta),
            ];

            $row['manual_review'] = $this->needsManualReview($post, $meta, $explanation);

            if ($entityBucket === null) {
                continue;
            }

            $classified[$entityBucket][] = $row;
            $duplicateCounts[$entityBucket][$row['duplicate_key']] = ($duplicateCounts[$entityBucket][$row['duplicate_key']] ?? 0) + 1;
        }

        foreach (['properties', 'condominiums', 'subdivisions', 'pending'] as $bucket) {
            foreach ($classified[$bucket] as $index => $row) {
                $duplicateKey = $row['duplicate_key'];
                $count = $duplicateCounts[$bucket][$duplicateKey] ?? 0;
                $normalizedTitle = Str::slug((string) ($row['post']['post_title'] ?? ''));
                $normalizedSlug = $this->baseSlug((string) ($row['post']['post_name'] ?? ''));
                $possibleDuplicate = $count > 1 || $this->possibleDuplicateByContent($row, $classified[$bucket], $index);
                $classified[$bucket][$index]['duplicate_hint'] = [
                    'possible_duplicate' => $possibleDuplicate,
                    'same_title_slug' => $possibleDuplicate,
                    'title_normalized' => $normalizedTitle,
                    'slug_normalized' => $normalizedSlug,
                    'duplicate_count' => $count,
                ];
                if ($possibleDuplicate) {
                    $classified[$bucket][$index]['manual_review'] = true;
                }
            }
        }

        return $classified;
    }

    private function previewSummary(array $classified): array
    {
        return [
            'properties' => $this->summaryForRows($classified['properties'] ?? []),
            'condominiums' => $this->summaryForRows($classified['condominiums'] ?? []),
            'subdivisions' => $this->summaryForRows($classified['subdivisions'] ?? []),
            'pending' => $this->summaryForRows($classified['pending'] ?? []),
        ];
    }

    private function summaryForRows(array $rows): array
    {
        $importable = 0;
        $ignored = 0;
        $duplicates = 0;

        foreach ($rows as $row) {
            if (($row['duplicate_hint']['possible_duplicate'] ?? false) === true) {
                $duplicates++;
            }

            if (($row['importable'] ?? false) === true) {
                $importable++;
            } else {
                $ignored++;
            }
        }

        return [
            'found' => count($rows),
            'importable' => $importable,
            'ignored' => $ignored,
            'possible_duplicates' => $duplicates,
        ];
    }

    private function pendingFromClassified(array $classified): array
    {
        return ['pending' => count($classified['pending'] ?? [])];
    }

    private function previewDetails(array $classified, WordPressDump $dump): array
    {
        $properties = $this->mapPreviewRows($classified['properties'] ?? []);
        $condominiums = $this->mapPreviewRows($classified['condominiums'] ?? []);
        $subdivisions = $this->mapPreviewRows($classified['subdivisions'] ?? []);
        $pending = $this->groupPendingRows($classified['pending'] ?? []);

        return [
            'properties' => $properties,
            'condominiums' => $condominiums,
            'subdivisions' => $subdivisions,
            'pending' => $pending,
            'importable' => [
                'properties' => $this->mapPreviewRows(array_values(array_filter($classified['properties'] ?? [], fn ($row) => ($row['explicit_ignore'] ?? false) === false))),
                'condominiums' => $this->mapPreviewRows(array_values(array_filter($classified['condominiums'] ?? [], fn ($row) => ($row['explicit_ignore'] ?? false) === false))),
                'subdivisions' => $this->mapPreviewRows(array_values(array_filter($classified['subdivisions'] ?? [], fn ($row) => ($row['explicit_ignore'] ?? false) === false))),
            ],
            'duplicate_groups' => $this->duplicateGroups($classified, $dump),
            'ignored' => [
                'properties' => $this->mapPreviewRows(array_values(array_filter($classified['properties'] ?? [], fn ($row) => (($row['explicit_ignore'] ?? false) === true) || (($row['classification']['entity'] ?? null) === LegacyEntity::Ignore)))),
                'condominiums' => $this->mapPreviewRows(array_values(array_filter($classified['condominiums'] ?? [], fn ($row) => (($row['explicit_ignore'] ?? false) === true) || (($row['classification']['entity'] ?? null) === LegacyEntity::Ignore)))),
                'subdivisions' => $this->mapPreviewRows(array_values(array_filter($classified['subdivisions'] ?? [], fn ($row) => (($row['explicit_ignore'] ?? false) === true) || (($row['classification']['entity'] ?? null) === LegacyEntity::Ignore)))),
            ],
        ];
    }

    private function mapPreviewRows(array $rows): array
    {
        return array_map(function (array $row): array {
            $post = $row['post'];
            $classification = $row['classification'];

            return [
                'id' => (int) ($post['ID'] ?? 0),
                'post_type' => (string) ($post['post_type'] ?? ''),
                'title' => (string) ($post['post_title'] ?? ''),
                'slug' => (string) ($post['post_name'] ?? ''),
                'status' => (string) ($post['post_status'] ?? ''),
                'reason' => (string) ($classification['reason'] ?? ''),
                'source' => (string) ($classification['source'] ?? ''),
                'matched_value' => $classification['matched_value'] ?? null,
                'importable' => (bool) ($row['importable'] ?? false),
                'status_bucket' => (string) ($row['status'] ?? 'unknown'),
                'manual_review' => (bool) ($row['manual_review'] ?? false),
                'explicit_ignore' => (bool) ($row['explicit_ignore'] ?? false),
                'duplicate_hint' => $row['duplicate_hint'] ?? [],
                'meta_summary' => $this->metaSummary($row['meta'] ?? []),
            ];
        }, $rows);
    }

    private function groupPendingRows(array $rows): array
    {
        $grouped = [];

        foreach ($rows as $row) {
            $post = $row['post'];
            $classification = $row['classification'];
            $reason = (string) ($classification['reason'] ?? 'unclassified');
            $category = $this->pendingCategory((string) ($post['post_type'] ?? ''), $post, $row['meta'] ?? []);

            $grouped[$reason]['reason'] = $reason;
            $grouped[$reason]['category'] = $category;
            $grouped[$reason]['items'][] = [
                'id' => (int) ($post['ID'] ?? 0),
                'post_type' => (string) ($post['post_type'] ?? ''),
                'title' => (string) ($post['post_title'] ?? ''),
                'slug' => (string) ($post['post_name'] ?? ''),
                'status' => (string) ($post['post_status'] ?? ''),
                'meta' => $this->pendingMeta($row['meta'] ?? []),
                'manual_review' => (bool) ($row['manual_review'] ?? true),
            ];
        }

        return array_values($grouped);
    }

    private function pendingMeta(array $meta): array
    {
        return [
            'keys' => array_slice(array_keys($meta), 0, 20),
            'tipo_item' => $meta['tipo_item'] ?? $meta['tipo-categoria'] ?? null,
            '_thumbnail_id' => $meta['_thumbnail_id'] ?? null,
            '_elementor_data' => isset($meta['_elementor_data']) ? true : false,
            'jet' => $this->containsMetaKey($meta, 'jet') ? true : false,
            'taxonomies' => $this->extractPreviewTaxonomies($meta),
        ];
    }

    private function metaSummary(array $meta): array
    {
        return [
            'keys' => array_slice(array_keys($meta), 0, 15),
            'tipo_item' => $meta['tipo_item'] ?? $meta['tipo-categoria'] ?? null,
            '_thumbnail_id' => $meta['_thumbnail_id'] ?? null,
            '_elementor_data' => isset($meta['_elementor_data']),
            'jet' => $this->containsMetaKey($meta, 'jet'),
            'serialized_keys' => $this->serializedMetaKeys($meta),
        ];
    }

    private function serializedMetaKeys(array $meta): array
    {
        $keys = [];
        foreach ($meta as $key => $value) {
            if (is_array($value) || is_object($value)) {
                $keys[] = $key;
            }
        }

        return $keys;
    }

    private function extractPreviewTaxonomies(array $meta): array
    {
        $taxonomies = [];
        foreach ($meta as $key => $value) {
            if (str_contains(strtolower((string) $key), 'tax')) {
                $taxonomies[$key] = is_scalar($value) ? (string) $value : gettype($value);
            }
        }

        return $taxonomies;
    }

    private function containsMetaKey(array $meta, string $needle): bool
    {
        foreach (array_keys($meta) as $key) {
            if (str_contains(strtolower((string) $key), strtolower($needle))) {
                return true;
            }
        }

        return false;
    }

    private function statusBucket(string $status): string
    {
        return match ($status) {
            'publish' => 'published',
            'draft' => 'draft',
            'trash' => 'trash',
            'auto-draft' => 'auto-draft',
            'revision' => 'revision',
            'inherit' => 'inherit',
            default => 'other',
        };
    }

    private function isImportable(array $post, array $meta, array $classification): bool
    {
        if (in_array((int) ($post['ID'] ?? 0), self::EXPLICIT_IGNORE_IDS, true)) {
            return false;
        }

        return in_array($classification['entity'], [
            LegacyEntity::Property,
            LegacyEntity::Condominium,
            LegacyEntity::Subdivision,
        ], true);
    }

    private function needsManualReview(array $post, array $meta, array $classification): bool
    {
        return in_array((string) ($post['post_type'] ?? ''), ['empreendimentos'], true) || ($classification['entity'] ?? null) === LegacyEntity::Review;
    }

    private function duplicateKey(array $post, array $meta): string
    {
        $title = Str::slug((string) ($post['post_title'] ?? ''));
        $slug = Str::slug((string) ($post['post_name'] ?? ''));
        $type = (string) ($post['post_type'] ?? '');
        $context = Str::slug((string) ($meta['tipo_item'] ?? $meta['tipo-categoria'] ?? ''));

        return implode('|', [$type, $slug ?: $title, $context]);
    }

    private function duplicateHint(array $post, array $meta): array
    {
        $title = Str::slug((string) ($post['post_title'] ?? ''));
        $slug = Str::slug((string) ($post['post_name'] ?? ''));

        return [
            'possible_duplicate' => false,
            'same_title_slug' => false,
            'title_normalized' => $title,
            'slug_normalized' => $slug,
            'duplicate_count' => 1,
        ];
    }

    private function duplicateGroups(array $classified, WordPressDump $dump): array
    {
        $groups = [];

        foreach (['properties', 'condominiums', 'subdivisions'] as $bucket) {
            foreach ($classified[$bucket] ?? [] as $row) {
                $key = implode('|', [
                    (string) ($row['post']['post_type'] ?? ''),
                    Str::slug((string) ($row['post']['post_title'] ?? '')),
                    $this->baseSlug((string) ($row['post']['post_name'] ?? '')),
                ]);
                $groups[$key]['key'] = $key;
                $groups[$key]['items'][] = [
                    'id' => (int) ($row['post']['ID'] ?? 0),
                    'title' => (string) ($row['post']['post_title'] ?? ''),
                    'slug' => (string) ($row['post']['post_name'] ?? ''),
                    'status' => (string) ($row['post']['post_status'] ?? ''),
                    'post_type' => (string) ($row['post']['post_type'] ?? ''),
                    'importable' => (bool) ($row['importable'] ?? false),
                ];
            }
        }

        return array_values(array_filter($groups, fn ($group) => count($group['items'] ?? []) > 1));
    }

    private function possibleDuplicateByContent(array $row, array $rows, int $index): bool
    {
        $post = $row['post'];
        $meta = $row['meta'] ?? [];
        $currentTitle = Str::slug((string) ($post['post_title'] ?? ''));
        $currentBaseSlug = $this->baseSlug((string) ($post['post_name'] ?? ''));
        $currentHash = $this->comparablePostHash($post, $meta);

        foreach ($rows as $otherIndex => $other) {
            if ($otherIndex === $index) {
                continue;
            }
            $otherPost = $other['post'];
            $otherMeta = $other['meta'] ?? [];
            if (Str::slug((string) ($otherPost['post_title'] ?? '')) !== $currentTitle) {
                continue;
            }

            $otherBaseSlug = $this->baseSlug((string) ($otherPost['post_name'] ?? ''));
            $sameSlugBase = $otherBaseSlug !== '' && $otherBaseSlug === $currentBaseSlug;
            $sameHash = $this->comparablePostHash($otherPost, $otherMeta) === $currentHash;

            if ($sameSlugBase || $sameHash) {
                return true;
            }
        }

        return false;
    }

    private function baseSlug(string $slug): string
    {
        $slug = Str::slug($slug);
        return preg_replace('/-\d+$/', '', $slug) ?: $slug;
    }

    private function metaComparableHash(array $meta): string
    {
        $filtered = [];
        foreach ($meta as $key => $value) {
            if (in_array($key, ['_edit_lock', '_edit_last', '_wp_old_slug', '_thumbnail_id', '_elementor_edit_mode'], true)) {
                continue;
            }
            if (is_scalar($value)) {
                $filtered[$key] = (string) $value;
            }
        }

        ksort($filtered);

        return sha1(json_encode($filtered, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '');
    }

    private function comparablePostHash(array $post, array $meta): string
    {
        $payload = [
            'title' => Str::slug((string) ($post['post_title'] ?? '')),
            'slug' => $this->baseSlug((string) ($post['post_name'] ?? '')),
            'status' => (string) ($post['post_status'] ?? ''),
            'date' => (string) ($post['post_date'] ?? ''),
            'content' => sha1((string) ($post['post_content'] ?? '')),
            'meta' => $this->metaComparableHash($meta),
        ];

        return sha1(json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '');
    }

    private function pendingCategory(string $postType, array $post, array $meta): string
    {
        return match ($postType) {
            'revision' => 'revision',
            'attachment' => 'attachment',
            'nav_menu_item' => 'navigation',
            'elementor_library' => 'template',
            'page' => 'page',
            'post' => 'blog',
            'catalogo' => 'catalog',
            default => $this->guessPendingCategory($post, $meta),
        };
    }

    private function guessPendingCategory(array $post, array $meta): string
    {
        $title = strtolower((string) ($post['post_title'] ?? ''));
        $type = strtolower((string) ($post['post_type'] ?? ''));
        $haystack = $type.' '.$title.' '.strtolower(json_encode($meta, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '');

        if (str_contains($haystack, 'jet')) {
            return 'jet-engine';
        }
        if (str_contains($haystack, 'elementor')) {
            return 'elementor';
        }
        if (str_contains($haystack, 'template')) {
            return 'template';
        }

        return 'other';
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

    private function importMedia(WordPressDump $dump): array
    {
        $stats = ['imported' => 0, 'missing' => 0, 'failed' => 0, 'skipped' => 0];
        foreach ($dump->attachments as $attachment) {
            try {
                $media = $this->ensureMediaAsset($attachment, []);
                if ($media) {
                    $stats['imported']++;
                } else {
                    $stats['missing']++;
                }
            } catch (\Throwable $error) {
                $stats['failed']++;
            }
        }

        return $stats;
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
            'description' => $target === 'properties'
                ? ($this->stringMeta($meta, ['texto_empreendimento']) ?: (string) ($post['post_content'] ?? ''))
                : (string) ($post['post_content'] ?? ''),
            'status' => $this->statusFromLegacy((string) ($post['post_status'] ?? 'draft')),
            'published_at' => in_array(($post['post_status'] ?? ''), ['publish', 'published'], true) ? ($post['post_date'] ?? now()) : null,
            'commercial_purpose' => $this->commercialPurpose($meta),
            'featured' => $this->boolMeta($meta, ['_featured', 'featured', 'destaque']),
            'legacy_metadata' => $this->preservedLegacyMetadata($meta),
        ];

        if ($target === 'properties') {
            return $common + [
                'reference_code' => $this->stringMeta($meta, ['reference_code', '_reference_code', 'codigo']) ?: null,
                'property_type_id' => $this->classificationId(PropertyType::class, $this->taxonomySlug($meta, ['tipo_imovel', 'tipo-de-imovel', 'property_type'])),
                'development_status_id' => $this->classificationId(DevelopmentStatus::class, $this->taxonomySlug($meta, ['estagio', 'stage', 'development_status'])),
                'business_type_id' => $this->classificationId(BusinessType::class, $this->taxonomySlug($meta, ['tipo_negocio', 'tipo-de-negocio', 'business_type', 'finalidade'])),
                'city_id' => $this->cityId($meta),
                'condominium_id' => $this->foreignBySlug(Condominium::class, $this->stringMeta($meta, ['condominium_slug', 'condominio_slug', 'condominium'])),
                'commercial_status' => $this->stringMeta($meta, ['commercial_status', 'status_comercial']) ?: null,
                'floor_plans_support_text' => $this->stringMeta($meta, ['texto_plantas']) ?: null,
                'regular_price' => $this->decimalMeta($meta, ['valor_regular', 'preco', 'price', 'regular_price']),
                'sale_price' => $this->decimalMeta($meta, ['preco_destaque', 'sale_price', 'valor_venda_copy']),
                'rent_price' => $this->decimalMeta($meta, ['preco_aluguel', 'rent_price']),
                'condominium_fee' => $this->decimalMeta($meta, ['condominio_-_valor', 'condominium_fee', 'valor_condominio']),
                'iptu' => $this->decimalMeta($meta, ['iptu_-_valor', 'iptu', 'valor_iptu']),
                'usable_area' => $this->decimalMeta($meta, ['area_util', 'usable_area', 'metrage']),
                'total_area' => $this->decimalMeta($meta, ['area_total_sigle', 'area_total', 'area_total_teste', 'total_area']),
                'built_area' => $this->decimalMeta($meta, ['area_construida', 'built_area']),
                'land_area' => $this->decimalMeta($meta, ['area_terreno', 'land_area']),
                'bedrooms' => $this->integerMeta($meta, ['quartos', 'bedrooms']),
                'suites' => $this->integerMeta($meta, ['suites']),
                'bathrooms' => $this->integerMeta($meta, ['banheiros', 'bathrooms']),
                'lavatories' => $this->integerMeta($meta, ['lavabo', 'lavabos', 'lavatories']),
                'parking_spaces' => $this->integerMeta($meta, ['vagas', 'parking_spaces']),
                'rooms' => $this->integerMeta($meta, ['salas', 'rooms']),
                'furnished' => $this->boolMeta($meta, ['furnished', 'mobiliado']),
                'accepts_financing' => $this->boolMeta($meta, ['aceita_financiamento', 'accepts_financing']),
                'accepts_exchange' => $this->boolMeta($meta, ['aceita_permuta', 'accepts_exchange']),
                'is_new' => $this->boolMeta($meta, ['is_new', 'imovel_novo']),
                'price_on_request' => $this->boolMeta($meta, ['price_on_request', 'sob_consulta']),
                'address' => $this->stringMeta($meta, ['localizacao', 'endereco_imovel', 'mapa_plantas', 'address', 'endereco']) ?: null,
                'neighborhood' => $this->stringMeta($meta, ['neighborhood', 'bairro']) ?: null,
                'postal_code' => $this->stringMeta($meta, ['postal_code', 'cep']) ?: null,
                'address_number' => $this->stringMeta($meta, ['address_number', 'numero']) ?: null,
                'complement' => $this->stringMeta($meta, ['complement', 'complemento']) ?: null,
                'condominium_name' => $this->stringMeta($meta, ['nome_condominio']) ?: null,
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
                'about_title' => $this->stringMeta($meta, ['titulo_-_sobre_o_empreendimento', 'titulo_empreendimento', 'about_title', 'titulo_sobre']) ?: null,
                'about_text' => $this->stringMeta($meta, ['texto_de_apoio_-_sobre_o_empreendimento', 'texto_empreendimento', 'about_text', 'texto_sobre']) ?: null,
                'floor_plans_support_text' => $this->stringMeta($meta, ['texto_de_apoio_-_plantas', 'texto_plantas', 'floor_plans_support_text']) ?: null,
                'starting_price' => $this->decimalMeta($meta, ['valor_regular_produto', 'starting_price', 'preco_inicial']),
                'promotion_price' => $this->decimalMeta($meta, ['preco_destaque_produto', 'promotion_price', 'preco_promocional']),
                'minimum_unit_area' => $this->decimalMeta($meta, ['area_minima_dos_empreendimentos', 'minimum_unit_area', 'area_minima']),
                'promotion_headline' => $this->stringMeta($meta, ['titulo_principal', 'promotion_headline']) ?: null,
                'promotion_url' => $this->stringMeta($meta, ['link_do_botao_do_empreendimento_em_promocao', 'promotion_url']) ?: null,
                'expected_delivery_date' => $this->dateMeta($meta, ['data_de_entrega', 'data_entrega', 'expected_delivery_date', 'previsao_entrega']),
                'price_on_request' => $this->boolMeta($meta, ['price_on_request', 'sob_consulta']),
                'address' => $this->stringMeta($meta, ['endereco_do_empreendimento', 'localizacao', 'mapa_plantas', 'address', 'endereco']) ?: null,
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
            'about_title' => $this->stringMeta($meta, ['titulo_-_sobre_o_lote', 'about_title', 'titulo_sobre']) ?: null,
            'about_text' => $this->stringMeta($meta, ['texto_de_apoio_-_sobre_o_lote', 'about_text', 'texto_sobre']) ?: null,
            'regular_price' => $this->decimalMeta($meta, ['valor_regular_produto', 'regular_price', 'preco_regular']),
            'sale_price' => $this->decimalMeta($meta, ['preco_destaque_produto', 'sale_price', 'preco_venda']),
            'minimum_lot_area' => $this->decimalMeta($meta, ['minimum_lot_area', 'area_minima']),
            'maximum_lot_area' => $this->decimalMeta($meta, ['maximum_lot_area', 'area_maxima']),
            'total_lots' => $this->integerMeta($meta, ['total_de_lotes', 'quantidade_de_lotes', 'total_lots', 'total_lotes']),
            'available_lots' => $this->integerMeta($meta, ['available_lots', 'lotes_disponiveis']),
            'price_on_request' => $this->boolMeta($meta, ['price_on_request', 'sob_consulta']),
            'promotion_headline' => $this->stringMeta($meta, ['headline_loteamento', 'titulo_principal', 'promotion_headline']) ?: null,
            'promotion_url' => $this->stringMeta($meta, ['link_do_botao_do_empreendimento_em_promocao', 'promotion_url']) ?: null,
            'expected_delivery_date' => $this->dateMeta($meta, ['data_de_entrega', 'expected_delivery_date', 'previsao_entrega']),
            'address' => $this->stringMeta($meta, ['endereco_do_empreendimento', 'localizacao', 'address', 'endereco']) ?: null,
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
        $galleryKeys = [
            'gallery', 'galeria', 'images', 'images_ids', 'gallery_ids', 'galeira_de_fotos',
            'galeria_imoveis', 'galeria_condominio', 'galeria_-_imagens_do_empreendimento',
            'galeria_-_imagens_do_lote',
        ];
        $mediaIds = array_values(array_unique([
            ...$this->attachmentIdsFromMeta($meta, $galleryKeys),
            ...$this->attachmentIdsFromUrls($meta, $galleryKeys, $dump),
        ]));
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

        $this->attachSpecialMedia($model, $meta, ['imagem_principal_do_empreendimento', 'imagem_principal_do_lote'], 'about');
        $this->attachSpecialMedia($model, $meta, ['imagem_do_empreendimento_em_promocao'], 'promotion');

        if ($model instanceof Condominium && ! $model->floorPlans()->exists()) {
            $this->importLegacyFloorPlans($model, $meta['plantas_condominio'] ?? null);
        }

        if ($model instanceof Subdivision) {
            $downloadUrl = $this->stringMeta($meta, ['link_para_download_das_plantas', 'arquivos_e_documentos_para_download']);
            if ($downloadUrl && ! $model->documents()->exists()) {
                $model->documents()->create(['title' => 'Informações dos lotes', 'kind' => 'plans', 'external_url' => $downloadUrl, 'is_public' => true]);
            }
        }

        if ($model instanceof Property) {
            $planUrl = $this->stringMeta($meta, ['planta_link']);
            $planMediaId = $this->firstAttachmentId($meta['planta_imovel'] ?? null);
            if (($planUrl || $planMediaId) && ! $model->floorPlans()->exists()) {
                $media = $planMediaId ? $this->mediaAssetByLegacyId($planMediaId) : null;
                $model->floorPlans()->create(['name' => 'Planta do imóvel', 'media_asset_id' => $media?->id, 'external_url' => $planUrl, 'sort_order' => 0]);
            }
        }

        if (($model instanceof Condominium || $model instanceof Subdivision) && ! $model->constructionStages()->exists()) {
            foreach ($this->constructionStagesFromMeta($meta) as $index => $stage) {
                $model->constructionStages()->create([...$stage, 'sort_order' => $index, 'is_public' => true]);
            }
        }

        $this->syncSeo($model, $meta);
    }

    private function constructionStagesFromMeta(array $meta): array
    {
        $stages = [];

        foreach ($meta as $key => $value) {
            if (! is_string($key) || (! str_contains(Str::lower($key), 'andamento_do_projeto') && ! str_starts_with(Str::lower($key), 'andamento_da_obra_')) || ! is_scalar($value)) {
                continue;
            }

            $numeric = preg_replace('/[^0-9,.]/', '', (string) $value);
            if ($numeric === '' || ! is_numeric(str_replace(',', '.', $numeric))) {
                continue;
            }

            $percentage = (int) round((float) str_replace(',', '.', $numeric));
            if ($percentage < 0 || $percentage > 100) {
                continue;
            }

            $name = str_starts_with(Str::lower($key), 'andamento_da_obra_')
                ? preg_replace('/^andamento_da_obra_/i', '', $key)
                : preg_replace('/_?andamento_do_projeto.*$/i', '', $key);
            $name = Str::of((string) $name)->replace('_', ' ')->squish()->title()->toString();
            if ($name === '') {
                continue;
            }

            $stages[] = ['name' => $name, 'code' => $key, 'progress_percent' => $percentage];
        }

        return $stages;
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

    private function attachmentIdsFromMeta(array $meta, array $keys = ['gallery', 'galeria', 'images', 'images_ids', 'gallery_ids']): array
    {
        $ids = [];
        foreach ($keys as $key) {
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
            } elseif (is_string($value) && ! str_contains($value, '://')) {
                foreach (preg_split('/[^0-9]+/', $value) ?: [] as $item) {
                    if (is_numeric($item)) {
                        $ids[] = (int) $item;
                    }
                }
            }
        }

        return array_values(array_unique($ids));
    }

    private function attachmentIdsFromUrls(array $meta, array $keys, WordPressDump $dump): array
    {
        $urls = [];
        foreach ($keys as $key) {
            $this->collectUrls($meta[$key] ?? null, $urls);
        }
        if (! $urls) {
            return [];
        }

        $attachmentsByFile = [];
        foreach ($dump->attachments as $attachment) {
            $path = parse_url((string) ($attachment['guid'] ?? ''), PHP_URL_PATH);
            if (is_string($path) && $path !== '') {
                $attachmentsByFile[basename($path)] = (int) ($attachment['ID'] ?? 0);
            }
        }

        $ids = [];
        foreach ($urls as $url) {
            $path = parse_url($url, PHP_URL_PATH);
            $file = is_string($path) ? basename($path) : '';
            if ($file !== '' && isset($attachmentsByFile[$file])) {
                $ids[] = $attachmentsByFile[$file];
            }
        }

        return array_values(array_unique(array_filter($ids)));
    }

    private function collectUrls(mixed $value, array &$urls): void
    {
        if (is_array($value)) {
            foreach ($value as $item) {
                $this->collectUrls($item, $urls);
            }
            return;
        }
        if (! is_string($value)) {
            return;
        }
        preg_match_all('~https?://[^\s,\"\']+~i', $value, $matches);
        foreach ($matches[0] ?? [] as $url) {
            $urls[] = html_entity_decode($url);
        }
    }

    private function firstAttachmentId(mixed $value): ?int
    {
        if (is_numeric($value)) {
            return (int) $value;
        }
        if (is_array($value)) {
            foreach ($value as $item) {
                if ($id = $this->firstAttachmentId($item)) {
                    return $id;
                }
            }
        }
        if (is_string($value) && ctype_digit(trim($value))) {
            return (int) trim($value);
        }

        return null;
    }

    private function attachSpecialMedia(Model $model, array $meta, array $keys, string $collection): void
    {
        foreach ($keys as $key) {
            $legacyId = $this->firstAttachmentId($meta[$key] ?? null);
            $media = $legacyId ? $this->mediaAssetByLegacyId($legacyId) : null;
            if (! $media) {
                continue;
            }
            $model->mediaAssets()->syncWithoutDetaching([$media->id => ['collection' => $collection, 'sort_order' => 0, 'is_featured' => false]]);
            $foreignKey = $collection.'_media_id';
            $model->forceFill([$foreignKey => $media->id])->save();
            return;
        }
    }

    private function importLegacyFloorPlans(Condominium $model, mixed $plans): void
    {
        if (! is_array($plans)) {
            return;
        }
        foreach (array_values($plans) as $index => $plan) {
            if (! is_array($plan)) {
                continue;
            }
            $legacyMediaId = $this->firstAttachmentId($plan['imagem_planta'] ?? null);
            $media = $legacyMediaId ? $this->mediaAssetByLegacyId($legacyMediaId) : null;
            $model->floorPlans()->create([
                'name' => (string) ($plan['nome_da_planta'] ?? 'Planta '.($index + 1)),
                'media_asset_id' => $media?->id,
                'area' => $this->numericValue($plan['area_da_planta_605'] ?? null),
                'bedrooms' => $this->integerValue($plan['quartos_planta'] ?? null),
                'suites' => $this->integerValue($plan['suites_planta'] ?? null),
                'parking_spaces' => $this->integerValue($plan['vagas_planta'] ?? null),
                'sort_order' => $index,
            ]);
        }
    }

    private function numericValue(mixed $value): ?float
    {
        $numeric = preg_replace('/[^0-9,.]/', '', is_scalar($value) ? (string) $value : '');
        return $numeric === '' ? null : (float) str_replace(',', '.', $numeric);
    }

    private function integerValue(mixed $value): ?int
    {
        $numeric = preg_replace('/[^0-9]/', '', is_scalar($value) ? (string) $value : '');
        return $numeric === '' ? null : (int) $numeric;
    }

    private function preservedLegacyMetadata(array $meta): array
    {
        return collect($meta)
            ->reject(fn ($value, $key) => str_starts_with((string) $key, '_elementor') || str_starts_with((string) $key, '_edit'))
            ->all();
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
        if (! $filePath || ! is_file($filePath)) {
            return null;
        }

        try {
            $asset = $this->media->storePath($filePath, 'wordpress', 'public', [
                'legacy_source' => 'wordpress',
                'legacy_id' => $legacyId,
                'metadata' => ['title' => $attachment['post_title'] ?? null, 'source_path' => $filePath],
            ]);
        } catch (\Throwable $error) {
            return null;
        }

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
