<?php

namespace App\Models;

use App\Models\Concerns\HasRealEstateContent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subdivision extends Model
{
    use HasFactory, HasRealEstateContent, SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['regular_price' => 'decimal:2', 'sale_price' => 'decimal:2', 'minimum_lot_area' => 'decimal:2', 'maximum_lot_area' => 'decimal:2', 'price_on_request' => 'boolean', 'featured' => 'boolean', 'expected_delivery_date' => 'date', 'published_at' => 'datetime', 'legacy_metadata' => 'array'];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('featured', true);
    }

    public function subdivisionType(): BelongsTo
    {
        return $this->belongsTo(SubdivisionType::class);
    }

    public function developmentStatus(): BelongsTo
    {
        return $this->belongsTo(DevelopmentStatus::class);
    }

    public function businessType(): BelongsTo
    {
        return $this->belongsTo(BusinessType::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function features(): BelongsToMany
    {
        return $this->belongsToMany(Feature::class, 'subdivision_feature')->withPivot('sort_order')->orderByPivot('sort_order');
    }

    public function promotions(): HasMany
    {
        return $this->hasMany(SubdivisionPromotion::class)->orderBy('sort_order');
    }
}
