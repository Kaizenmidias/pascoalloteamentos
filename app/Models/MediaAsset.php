<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class MediaAsset extends Model
{
    protected $guarded = ['id'];

    protected $appends = ['url'];

    protected function casts(): array
    {
        return ['metadata' => 'array'];
    }

    protected function url(): Attribute
    {
        return Attribute::get(fn () => $this->disk === 'reference'
            ? asset('reference-assets/'.ltrim($this->path, '/'))
            : Storage::disk($this->disk)->url($this->path));
    }
}
