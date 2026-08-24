<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UniqueSlug
{
    public static function for(string $table, string $value, ?int $ignoreId = null, string $fallback = 'item'): string
    {
        $base = Str::slug(trim($value)) ?: $fallback;
        $slug = $base;
        $suffix = 2;

        while (DB::table($table)->where('slug', $slug)->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }
}
