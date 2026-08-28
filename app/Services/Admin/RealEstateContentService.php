<?php

namespace App\Services\Admin;

use App\Models\MediaAsset;
use App\Services\Media\MediaAssetService;
use App\Support\ConstructionStageCatalog;
use App\Support\SafeRichHtml;
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
            $mediaUploads = Arr::pull($data, 'gallery_media', []);
            $videoUploads = Arr::pull($data, 'gallery_videos', []);
            $videoUrls = Arr::pull($data, 'gallery_video_urls', []);
            $removeMedia = Arr::pull($data, 'remove_media_ids', []);
            $mediaOrder = Arr::pull($data, 'media_order', []);
            $uploadedMediaIds = Arr::pull($data, 'uploaded_media_ids', []);
            $featuredMediaId = Arr::pull($data, 'featured_media_id');
            $featuredImage = Arr::pull($data, 'featured_image');
            $aboutImage = Arr::pull($data, 'about_image');
            $promotionImage = Arr::pull($data, 'promotion_image');
            $floorPlans = Arr::pull($data, 'floor_plans');
            $stages = Arr::pull($data, 'construction_stages');
            $progressUpdates = Arr::pull($data, 'progress_updates');
            $faqs = Arr::pull($data, 'faqs');
            $documents = Arr::pull($data, 'documents');
            $promotions = Arr::pull($data, 'promotions');
            $hasPropertyPlanUrl = Arr::has($data, 'property_plan_url');
            $propertyPlanUrl = Arr::pull($data, 'property_plan_url');
            $propertyPlanPdf = Arr::pull($data, 'property_plan_pdf');
            $removePropertyPlanPdf = (bool) Arr::pull($data, 'remove_property_plan_pdf', false);
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

            foreach (['description', 'about_text'] as $richField) {
                if (array_key_exists($richField, $data)) $data[$richField] = SafeRichHtml::clean($data[$richField]);
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
                    $image = Arr::pull($row, 'image');
                    if ($image) {
                        $row['media_asset_id'] = $this->media->store($image, 'real-estate/floor-plans')->id;
                    }
                    $item->floorPlans()->create([...Arr::only($row, ['media_asset_id', 'name', 'description', 'area', 'bedrooms', 'suites', 'bathrooms', 'parking_spaces', 'external_url', 'is_active']), 'is_active' => $row['is_active'] ?? true, 'sort_order' => $index]);
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
                    if ($stage) {
                        $stage->update($payload);
                    } else {
                        $stage = $item->constructionStages()->create($payload);
                    }
                }
            }
            if (is_array($progressUpdates)) {
                $keptUpdateIds = [];
                foreach (array_values($progressUpdates) as $row) {
                    $photos = Arr::pull($row, 'photos', []);
                    $removeMediaIds = Arr::pull($row, 'remove_media_ids', []);
                    $mediaOrder = Arr::pull($row, 'media_order', []);
                    $update = ! empty($row['id'])
                        ? $item->constructionProgressUpdates()->findOrFail($row['id'])
                        : $item->constructionProgressUpdates()->create(['progress_date' => $row['progress_date']]);
                    $update->update(['progress_date' => $row['progress_date']]);
                    $keptUpdateIds[] = $update->id;

                    if ($removeMediaIds) {
                        $update->mediaAssets()->detach($removeMediaIds);
                    }
                    foreach (array_values($photos ?: []) as $photoIndex => $photo) {
                        $asset = $this->media->store($photo, 'real-estate/construction-progress');
                        $update->mediaAssets()->syncWithoutDetaching([$asset->id => [
                            'collection' => 'construction-progress',
                            'sort_order' => $update->mediaAssets()->count() + $photoIndex,
                            'is_featured' => false,
                        ]]);
                    }
                    foreach (array_values($mediaOrder ?: []) as $mediaIndex => $mediaId) {
                        $update->mediaAssets()->updateExistingPivot($mediaId, ['sort_order' => $mediaIndex]);
                    }
                }
                $item->constructionProgressUpdates()->whereNotIn('id', $keptUpdateIds)->get()->each(function ($update) {
                    $update->mediaAssets()->detach();
                    $update->delete();
                });
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
            if ($item->getTable() === 'properties') {
                $plan = $item->floorPlans()->first();
                if ($hasPropertyPlanUrl) {
                    if ($plan) {
                        $plan->update(['external_url' => $propertyPlanUrl ?: null, 'is_active' => true]);
                    } elseif ($propertyPlanUrl) {
                        $item->floorPlans()->create(['name' => 'Planta do imóvel', 'external_url' => $propertyPlanUrl, 'is_active' => true, 'sort_order' => 0]);
                    }
                }

                $planDocument = $item->documents()->where('kind', 'property_plan')->first()
                    ?? $item->documents()->whereHas('mediaAsset', fn ($query) => $query->where('mime_type', 'application/pdf'))->first();
                if ($removePropertyPlanPdf) {
                    $planDocument?->delete();
                }
                if ($propertyPlanPdf) {
                    $asset = $this->media->store($propertyPlanPdf, 'real-estate/property-plans');
                    $payload = ['media_asset_id' => $asset->id, 'title' => 'Planta do imóvel', 'kind' => 'property_plan', 'is_public' => true, 'sort_order' => 0];
                    $planDocument ? $planDocument->update($payload) : $item->documents()->create($payload);
                }
            }
            if (is_array($promotions) && method_exists($item, 'promotions') && Schema::hasTable($item->promotions()->getRelated()->getTable())) {
                $item->promotions()->delete();
                foreach (array_values($promotions) as $index => $row) {
                    $image = Arr::pull($row, 'image');
                    if ($image) {
                        $row['media_asset_id'] = $this->media->store($image, 'real-estate/promotions')->id;
                    }
                    $item->promotions()->create([
                        ...Arr::only($row, ['media_asset_id', 'product_name', 'title', 'text', 'original_price', 'promotional_price', 'button_text', 'button_url', 'is_active']),
                        'is_active' => $row['is_active'] ?? true,
                        'sort_order' => $index,
                    ]);
                }
            }

            if ($removeMedia) {
                $item->mediaAssets()->detach($removeMedia);
            }
            foreach (array_values(array_unique($uploadedMediaIds ?: [])) as $index => $mediaId) {
                $orderedIndex = array_search($mediaId, $mediaOrder, true);
                $item->mediaAssets()->syncWithoutDetaching([$mediaId => [
                    'collection' => 'gallery',
                    'sort_order' => $orderedIndex !== false ? $orderedIndex : $item->mediaAssets()->count() + $index,
                    'is_featured' => false,
                ]]);
                $featuredMediaId ??= MediaAsset::query()->whereKey($mediaId)->where(fn ($query) => $query->whereNull('media_type')->orWhere('media_type', '!=', 'video'))->value('id');
            }
            foreach (array_values($mediaOrder ?: []) as $index => $mediaId) {
                $item->mediaAssets()->updateExistingPivot($mediaId, ['sort_order' => $index]);
            }
            if ($featuredImage) {
                $asset = $this->media->store($featuredImage, 'real-estate/featured');
                $item->mediaAssets()->syncWithoutDetaching([$asset->id => ['collection' => 'featured', 'sort_order' => 0, 'is_featured' => true]]);
                $featuredMediaId = $asset->id;
            }
            foreach (array_values($uploads ?: []) as $index => $upload) {
                $asset = $this->media->store($upload, 'real-estate');
                $item->mediaAssets()->syncWithoutDetaching([$asset->id => ['collection' => 'gallery', 'sort_order' => $item->mediaAssets()->count() + $index, 'is_featured' => false]]);
                $featuredMediaId ??= $asset->id;
            }
            foreach (array_values($videoUploads ?: []) as $index => $upload) {
                $asset = $this->media->store($upload, 'real-estate/gallery-videos');
                $item->mediaAssets()->syncWithoutDetaching([$asset->id => ['collection' => 'gallery', 'sort_order' => $item->mediaAssets()->count() + $index, 'is_featured' => false]]);
            }
            foreach (array_values($mediaUploads ?: []) as $index => $upload) {
                $asset = $this->media->store($upload, 'real-estate/gallery');
                $item->mediaAssets()->syncWithoutDetaching([$asset->id => ['collection' => 'gallery', 'sort_order' => $item->mediaAssets()->count() + $index, 'is_featured' => false]]);
                if ($asset->type === 'image') {
                    $featuredMediaId ??= $asset->id;
                }
            }
            foreach (array_values(array_filter($videoUrls ?: [])) as $index => $url) {
                $asset = MediaAsset::firstOrCreate(
                    ['disk' => 'external', 'path' => $url],
                    ['original_name' => basename((string) parse_url($url, PHP_URL_PATH)) ?: 'Vídeo externo', 'mime_type' => 'video/external'],
                );
                $item->mediaAssets()->syncWithoutDetaching([$asset->id => ['collection' => 'gallery', 'sort_order' => $item->mediaAssets()->count() + $index, 'is_featured' => false]]);
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
