<?php

namespace App\Services\Seo;

use Illuminate\Database\Eloquent\Model;

class SeoManager
{
    public function for(Model $model, string $fallbackTitle, ?string $fallbackDescription = null): SeoData
    {
        $seo = $model->relationLoaded('seo') ? $model->seo : $model->seo()->with('ogMedia')->first();

        return new SeoData(title: $seo?->title ?: $fallbackTitle, description: $seo?->description ?: $fallbackDescription, canonical: $seo?->canonical_url ?: url()->current(), robots: $seo?->robots ?: 'index,follow', image: $seo?->ogMedia ? asset('storage/'.$seo->ogMedia->path) : null, schema: $seo?->schema);
    }
}
