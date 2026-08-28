<?php

namespace App\Models\Concerns;

use App\Models\ConstructionStage;
use App\Models\ConstructionProgressUpdate;
use App\Models\Document;
use App\Models\Faq;
use App\Models\FloorPlan;
use App\Models\MediaAsset;
use App\Models\SeoMeta;
use App\Support\ConstructionStageCatalog;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait HasRealEstateContent
{
    public function aboutMedia(): BelongsTo
    {
        return $this->belongsTo(MediaAsset::class, 'about_media_id');
    }

    public function promotionMedia(): BelongsTo
    {
        return $this->belongsTo(MediaAsset::class, 'promotion_media_id');
    }

    public function mediaAssets(): MorphToMany
    {
        return $this->morphToMany(MediaAsset::class, 'mediable', 'mediables')
            ->withPivot(['collection', 'sort_order', 'is_featured'])->withTimestamps()->orderByPivot('sort_order');
    }

    public function floorPlans(): MorphMany
    {
        return $this->morphMany(FloorPlan::class, 'owner')->orderBy('sort_order');
    }

    public function constructionStages(): MorphMany
    {
        return $this->morphMany(ConstructionStage::class, 'owner')->orderBy('sort_order');
    }

    public function constructionProgressUpdates(): MorphMany
    {
        return $this->morphMany(ConstructionProgressUpdate::class, 'progressable')
            ->latest('progress_date');
    }

    public function constructionProgressPercentage(): ?int
    {
        $stages = $this->relationLoaded('constructionStages')
            ? $this->constructionStages
            : $this->constructionStages()->where('is_public', true)->get();

        $publicStages = ConstructionStageCatalog::applicableStages($this, $stages->where('is_public', true));

        return $publicStages->isEmpty()
            ? null
            : (int) round($publicStages->avg('progress_percent'));
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'owner')->orderBy('sort_order');
    }

    public function faqs(): MorphMany
    {
        return $this->morphMany(Faq::class, 'owner')->orderBy('sort_order');
    }

    public function seo(): MorphOne
    {
        return $this->morphOne(SeoMeta::class, 'seoable');
    }
}
