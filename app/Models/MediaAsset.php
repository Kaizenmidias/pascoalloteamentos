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
            default => $this->versionedUrl(),
        });
    }

    private function versionedUrl(): string
    {
        $url = Storage::disk($this->disk)->url($this->path);
        $version = $this->updated_at?->getTimestamp() ?: $this->getKey();

        return $version ? $url.'?v='.$version : $url;
    }

    protected function posterUrl(): Attribute
    {
        return Attribute::get(fn () => $this->poster_path
            ? Storage::disk($this->poster_disk ?: $this->disk)->url($this->poster_path)
            : null);
    }

    protected function type(): Attribute
    {
        return Attribute::get(function () {
            if ($this->media_type) {
                return $this->media_type;
            }

            $mime = strtolower((string) $this->mime_type);
            if (str_starts_with($mime, 'video/')) {
                return 'video';
            }

            if ($mime === 'application/pdf') {
                return 'document';
            }

            return 'image';
        });
    }
}
