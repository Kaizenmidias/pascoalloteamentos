<?php

namespace App\Models;

use App\Models\Concerns\HasAutomaticSlug;
use App\Models\Concerns\HasCardSummary;
use App\Models\Concerns\HasRealEstateContent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Property extends Model
{
    use HasAutomaticSlug, HasCardSummary, HasFactory, HasRealEstateContent, SoftDeletes;

    protected $appends = ['card_summary'];

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['regular_price' => 'decimal:2', 'sale_price' => 'decimal:2', 'rent_price' => 'decimal:2', 'condominium_fee' => 'decimal:2', 'iptu' => 'decimal:2', 'usable_area' => 'decimal:2', 'total_area' => 'decimal:2', 'built_area' => 'decimal:2', 'land_area' => 'decimal:2', 'price_on_request' => 'boolean', 'featured' => 'boolean', 'furnished' => 'boolean', 'accepts_financing' => 'boolean', 'accepts_exchange' => 'boolean', 'is_new' => 'boolean', 'published_at' => 'datetime', 'legacy_metadata' => 'array'];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    protected static function slugFallback(): string
    {
        return 'imovel';
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('featured', true);
    }

    public function propertyType(): BelongsTo
    {
        return $this->belongsTo(PropertyType::class);
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

    public function condominium(): BelongsTo
    {
        return $this->belongsTo(Condominium::class);
    }

    public function features(): BelongsToMany
    {
        return $this->belongsToMany(Feature::class, 'property_feature')->withPivot('sort_order')->orderByPivot('sort_order');
    }
}
