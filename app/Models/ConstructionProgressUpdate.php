<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class ConstructionProgressUpdate extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['progress_date' => 'date'];
    }

    public function progressable(): MorphTo
    {
        return $this->morphTo();
    }

    public function mediaAssets(): MorphToMany
    {
        return $this->morphToMany(MediaAsset::class, 'mediable', 'mediables')
            ->withPivot(['collection', 'sort_order', 'is_featured'])
            ->withTimestamps()
            ->wherePivot('collection', 'construction-progress')
            ->orderByPivot('sort_order');
    }
}
