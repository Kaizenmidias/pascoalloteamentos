<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubdivisionSectionImage extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['sort_order' => 'integer'];
    }

    public function mediaAsset()
    {
        return $this->belongsTo(MediaAsset::class);
    }

    public function subdivision()
    {
        return $this->belongsTo(Subdivision::class);
    }
}
