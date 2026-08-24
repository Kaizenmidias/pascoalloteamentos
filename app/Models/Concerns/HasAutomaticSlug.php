<?php

namespace App\Models\Concerns;

use App\Support\UniqueSlug;
use Illuminate\Database\Eloquent\Model;

trait HasAutomaticSlug
{
    protected static function bootHasAutomaticSlug(): void
    {
        static::saving(function (Model $model): void {
            $model->syncAutomaticSlug();
        });
    }

    protected function syncAutomaticSlug(): void
    {
        $currentSlug = trim((string) $this->getAttribute('slug'));

        if ($currentSlug !== '') {
            $this->setAttribute('slug', $currentSlug);

            return;
        }

        $source = trim((string) $this->getAttribute(static::slugSourceAttribute()));
        $this->setAttribute(
            'slug',
            UniqueSlug::for(
                $this->getTable(),
                $source,
                $this->exists ? (int) $this->getKey() : null,
                static::slugFallback()
            )
        );
    }

    protected static function slugSourceAttribute(): string
    {
        return 'title';
    }

    protected static function slugFallback(): string
    {
        return 'item';
    }
}
