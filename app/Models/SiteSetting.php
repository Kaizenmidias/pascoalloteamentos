<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['value' => 'json', 'is_public' => 'boolean'];
    }
}
