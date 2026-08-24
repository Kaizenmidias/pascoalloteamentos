<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

trait HasCardSummary
{
    public function getCardSummaryAttribute(): ?string
    {
        $summary = $this->cardSummaryFromFields($this->cardSummaryFields());

        if ($summary !== null) {
            return $summary;
        }

        $description = trim(strip_tags((string) $this->getAttribute('description')));

        if ($description === '') {
            return null;
        }

        return Str::limit(preg_replace('/\s+/u', ' ', $description) ?? $description, 160, '...');
    }

    protected function cardSummaryFields(): array
    {
        return ['summary', 'excerpt'];
    }

    protected function cardSummaryFromFields(array $fields): ?string
    {
        foreach ($fields as $field) {
            $value = trim((string) $this->getAttribute($field));

            if ($value !== '') {
                return $value;
            }
        }

        return null;
    }
}