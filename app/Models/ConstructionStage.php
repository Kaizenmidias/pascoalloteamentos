<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

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
}
