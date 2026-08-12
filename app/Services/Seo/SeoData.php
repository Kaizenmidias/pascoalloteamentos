<?php

namespace App\Services\Seo;

final readonly class SeoData
{
    public function __construct(public string $title, public ?string $description = null, public ?string $canonical = null, public string $robots = 'index,follow', public ?string $image = null, public ?array $schema = null) {}

    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
