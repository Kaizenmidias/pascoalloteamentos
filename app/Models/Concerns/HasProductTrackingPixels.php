<?php

namespace App\Models\Concerns;

use App\Models\ProductTrackingPixel;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasProductTrackingPixels
{
    public function trackingPixels(): MorphMany
    {
        return $this->morphMany(ProductTrackingPixel::class, 'trackable')->orderBy('sort_order')->orderBy('id');
    }
}
