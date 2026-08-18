<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class MediaAsset extends Model
{
    protected $guarded = ['id'];

    protected $appends = ['url', 'poster_url', 'type'];

    protected function casts(): array
    {
        return ['metadata' => 'array'];
    }

    protected function url(): Attribute
    {
        return Attribute::get(fn () => match ($this->disk) {
            'reference' => asset('reference-assets/'.ltrim($this->path, '/')),
            'external' => $this->path,
            default => Storage::disk($this->disk)->url($this->path),
        });
    }

    protected function posterUrl(): Attribute
    {
        return Attribute::get(fn () => $this->poster_path
            ? Storage::disk($this->poster_disk ?: $this->disk)->url($this->poster_path)
            : null);
    }

    protected function type(): Attribute
    {
        return Attribute::get(fn () => $this->media_type
            ?: (str_starts_with((string) $this->mime_type, 'video/') ? 'video' : 'image'));
    }
}
