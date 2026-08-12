<?php

namespace App\Models\Concerns;

use App\Models\ConstructionStage;
use App\Models\Document;
use App\Models\Faq;
use App\Models\FloorPlan;
use App\Models\MediaAsset;
use App\Models\SeoMeta;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

trait HasRealEstateContent
{
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
