<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BusinessType extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }

    public function condominiums(): HasMany
    {
        return $this->hasMany(Condominium::class);
    }

    public function subdivisions(): HasMany
    {
        return $this->hasMany(Subdivision::class);
    }
}
