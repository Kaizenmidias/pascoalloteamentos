<?php

namespace App\Services\Admin;

use App\Services\Media\MediaAssetService;
use App\Support\ConstructionStageCatalog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RealEstateContentService
{
    public function __construct(private readonly MediaAssetService $media) {}

    public function save(Model $item, array $data): Model
    {
        return DB::transaction(function () use ($item, $data) {
            $features = Arr::pull($data, 'feature_ids', []);
            $uploads = Arr::pull($data, 'gallery_images', []);
            $removeMedia = Arr::pull($data, 'remove_media_ids', []);
            $featuredMediaId = Arr::pull($data, 'featured_media_id');
            $aboutImage = Arr::pull($data, 'about_image');
            $promotionImage = Arr::pull($data, 'promotion_image');
            $floorPlans = Arr::pull($data, 'floor_plans');
            $stages = Arr::pull($data, 'construction_stages');
            $faqs = Arr::pull($data, 'faqs');
            $documents = Arr::pull($data, 'documents');
            if (! Schema::hasColumn($item->getTable(), 'business_type_id')) {
                Arr::pull($data, 'business_type_id');
            }
            $seo = [
                'title' => Arr::pull($data, 'seo_title'),
                'description' => Arr::pull($data, 'seo_description'),
                'canonical_url' => Arr::pull($data, 'seo_canonical_url'),
                'robots' => Arr::pull($data, 'seo_robots', 'index,follow') ?: 'index,follow',
            ];

            if (($data['status'] ?? null) === 'published' && empty($data['published_at']) && ! $item->published_at) {
                $data['published_at'] = now();
            }

            $item->fill($data)->save();

            if ($aboutImage) {
                $item->about_media_id = $this->media->store($aboutImage, 'real-estate/about')->id;
            }
            if ($promotionImage) {
                $item->promotion_media_id = $this->media->store($promotionImage, 'real-estate/promotion')->id;
            }
            if ($item->isDirty(['about_media_id', 'promotion_media_id'])) {
                $item->save();
            }
            $item->features()->sync($features);

            if (is_array($floorPlans)) {
                $item->floorPlans()->delete();
                foreach (array_values($floorPlans) as $index => $row) {
                    $item->floorPlans()->create([...Arr::only($row, ['media_asset_id', 'name', 'description', 'area', 'bedrooms', 'suites', 'bathrooms', 'parking_spaces', 'external_url']), 'sort_order' => $index]);
                }
            }
            if (is_array($stages)) {
                $existingStages = $item->constructionStages()->get();
                foreach (array_values($stages) as $index => $row) {
                    $definition = collect(ConstructionStageCatalog::definitionsFor($item))->firstWhere('code', $row['code'] ?? null);
                    $stage = $definition ? $existingStages->first(
                        fn ($existing) => ConstructionStageCatalog::matches($definition, (string) $existing->code, (string) $existing->name),
                    ) : null;

                    if (($row['progress_percent'] ?? '') === '' || ($row['progress_percent'] ?? null) === null) {
                        $stage?->delete();
                        continue;
                    }

                    $payload = [
                        ...Arr::only($row, ['name', 'code', 'progress_percent', 'reference_date', 'description']),
                        'sort_order' => $index,
                        'is_public' => true,
                    ];
                    $stage ? $stage->update($payload) : $item->constructionStages()->create($payload);
                }
            }
            if (is_array($faqs)) {
                $item->faqs()->delete();
                foreach (array_values($faqs) as $index => $row) {
                    $item->faqs()->create([...Arr::only($row, ['question', 'answer', 'is_active']), 'is_active' => $row['is_active'] ?? true, 'sort_order' => $index]);
                }
            }
            if (is_array($documents)) {
                $item->documents()->delete();
                foreach (array_values($documents) as $index => $row) {
                    $file = Arr::pull($row, 'file');
                    if ($file) {
                        $row['media_asset_id'] = $this->media->store($file, 'real-estate/documents')->id;
                    }
                    $item->documents()->create([
                        ...Arr::only($row, ['media_asset_id', 'title', 'kind', 'external_url', 'is_public']),
                        'is_public' => $row['is_public'] ?? true,
                        'sort_order' => $index,
                    ]);
                }
            }

            if ($removeMedia) {
                $item->mediaAssets()->detach($removeMedia);
            }
            foreach (array_values($uploads ?: []) as $index => $upload) {
                $asset = $this->media->store($upload, 'real-estate');
                $item->mediaAssets()->syncWithoutDetaching([$asset->id => ['collection' => 'gallery', 'sort_order' => $item->mediaAssets()->count() + $index, 'is_featured' => false]]);
                $featuredMediaId ??= $asset->id;
            }
            if ($featuredMediaId) {
                foreach ($item->mediaAssets()->pluck('media_assets.id') as $mediaId) {
                    $item->mediaAssets()->updateExistingPivot($mediaId, ['is_featured' => false]);
                }
                $item->mediaAssets()->updateExistingPivot($featuredMediaId, ['is_featured' => true]);
            }

            if (array_filter($seo, fn ($value) => $value !== null && $value !== '')) {
                $item->seo()->updateOrCreate([], $seo);
            } elseif ($item->seo()->exists()) {
                $item->seo()->delete();
            }

            return $item->fresh();
        });
    }
}
