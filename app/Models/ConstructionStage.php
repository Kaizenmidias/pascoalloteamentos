<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class ConstructionStage extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['reference_date' => 'date', 'is_public' => 'boolean', 'progress_percent' => 'integer'];
    }

    public function owner(): MorphTo
    {
        return $this->morphTo();
    }

    public function mediaAssets(): MorphToMany
    {
        return $this->morphToMany(MediaAsset::class, 'mediable', 'mediables')
            ->withPivot(['collection', 'sort_order', 'is_featured'])
            ->wherePivot('collection', 'construction-progress')
            ->orderByPivot('sort_order');
    }
}
