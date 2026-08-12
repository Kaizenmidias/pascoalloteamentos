<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Feature extends Model
{
    protected $guarded = ['id'];

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
