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
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Condominium extends Model
{
    use HasAutomaticSlug, HasCardSummary, HasFactory, HasRealEstateContent, SoftDeletes;

    protected $appends = ['card_summary'];

    protected $table = 'condominiums';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['starting_price' => 'decimal:2', 'promotion_price' => 'decimal:2', 'minimum_unit_area' => 'decimal:2', 'price_on_request' => 'boolean', 'featured' => 'boolean', 'expected_delivery_date' => 'date', 'published_at' => 'datetime', 'legacy_metadata' => 'array'];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    protected static function slugFallback(): string
    {
        return 'condominio';
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('featured', true);
    }

    public function condominiumType(): BelongsTo
    {
        return $this->belongsTo(CondominiumType::class);
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

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }

    public function promotions(): HasMany
    {
        return $this->hasMany(CondominiumPromotion::class)->orderBy('sort_order');
    }

    public function features(): BelongsToMany
    {
        return $this->belongsToMany(Feature::class, 'condominium_feature')->withPivot('sort_order')->orderByPivot('sort_order');
    }
}
