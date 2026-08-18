<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CondominiumPromotion extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'original_price' => 'decimal:2',
            'promotional_price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function condominium(): BelongsTo
    {
        return $this->belongsTo(Condominium::class);
    }

    public function mediaAsset(): BelongsTo
    {
        return $this->belongsTo(MediaAsset::class);
    }
}
