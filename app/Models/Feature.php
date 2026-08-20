<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feature extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['legacy_metadata' => 'array', 'is_active' => 'boolean'];
    }

    public function iconMedia(): BelongsTo
    {
        return $this->belongsTo(MediaAsset::class, 'icon_media_asset_id');
    }

    public function properties(): BelongsToMany
    {
        return $this->belongsToMany(Property::class);
    }

    public function condominiums(): BelongsToMany
    {
        return $this->belongsToMany(Condominium::class);
    }

    public function subdivisions(): BelongsToMany
    {
        return $this->belongsToMany(Subdivision::class);
    }
}
