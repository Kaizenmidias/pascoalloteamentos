<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class FloorPlan extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['area' => 'decimal:2'];
    }

    public function owner(): MorphTo
    {
        return $this->morphTo();
    }

    public function mediaAsset(): BelongsTo
    {
        return $this->belongsTo(MediaAsset::class);
    }
}
