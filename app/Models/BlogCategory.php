<?php

namespace App\Models;

use App\Models\Concerns\HasAutomaticSlug;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class BlogCategory extends Model
{
    use HasAutomaticSlug;

    protected $guarded = ['id'];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    protected static function slugSourceAttribute(): string
    {
        return 'name';
    }

    protected static function slugFallback(): string
    {
        return 'categoria';
    }

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(BlogPost::class);
    }
}
