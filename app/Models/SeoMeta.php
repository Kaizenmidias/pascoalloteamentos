<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class SeoMeta extends Model
{
    protected $table = 'seo_meta';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['schema' => 'array'];
    }

    public function seoable(): MorphTo
    {
        return $this->morphTo();
    }

    public function ogMedia(): BelongsTo
    {
        return $this->belongsTo(MediaAsset::class, 'og_media_id');
    }
}
