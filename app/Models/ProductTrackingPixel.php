<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductTrackingPixel extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'sort_order' => 'integer'];
    }

    public function trackable()
    {
        return $this->morphTo();
    }
}
