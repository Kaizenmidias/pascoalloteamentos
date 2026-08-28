<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\HasRealEstateContentRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Support\UniqueSlug;

class StoreCondominiumRequest extends FormRequest
{
    use HasRealEstateContentRules;

    private const SHORT_SUMMARY_LIMIT = 400;

    protected function prepareForValidation(): void
    {
        if (! $this->filled('summary') && $this->filled('excerpt')) {
            $this->merge(['summary' => trim((string) $this->input('excerpt'))]);
        }

        if (! $this->filled('slug')) {
            $this->merge(['slug' => UniqueSlug::for('condominiums', (string) $this->input('title'), $this->route('condominium')?->id, 'condominio')]);
        }
    }

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'], 'slug' => ['nullable', 'alpha_dash:ascii', 'max:255', Rule::unique('condominiums')],
            'reference_code' => ['nullable', 'string', 'max:100', Rule::unique('condominiums')],
            'condominium_type_id' => ['nullable', 'exists:condominium_types,id'], 'development_status_id' => ['nullable', 'exists:development_statuses,id'], 'business_type_id' => ['nullable', 'exists:business_types,id'], 'city_id' => ['nullable', 'exists:cities,id'],
            'summary' => ['nullable', 'string', 'max:'.self::SHORT_SUMMARY_LIMIT], 'description' => ['nullable', 'string'], 'address' => ['nullable', 'string', 'max:255'], 'neighborhood' => ['nullable', 'string', 'max:255'], 'postal_code' => ['nullable', 'string', 'max:12'],
            'summary_facts' => ['nullable', 'array', 'max:4'],
            'summary_facts.*.label' => ['nullable', 'string', 'max:60'],
            'summary_facts.*.value' => ['nullable', 'string', 'max:100'],
            'summary_facts.*.icon' => ['nullable', 'string', 'max:30'],
            'address_number' => ['nullable', 'string', 'max:30'], 'complement' => ['nullable', 'string', 'max:255'], 'whatsapp_contact' => ['nullable', 'string', 'max:30'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'], 'longitude' => ['nullable', 'numeric', 'between:-180,180'], 'price_on_request' => ['boolean'],
            'commercial_purpose' => ['nullable', 'string', 'max:20'], 'commercial_status' => ['nullable', 'string', 'max:30'], 'about_title' => ['nullable', 'string', 'max:255'], 'about_text' => ['nullable', 'string'], 'floor_plans_title' => ['nullable', 'string', 'max:255'], 'floor_plans_support_text' => ['nullable', 'string'], 'expected_delivery_date' => ['nullable', 'date'], 'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'featured' => ['boolean'], 'published_at' => ['nullable', 'date'], 'feature_ids' => ['array'], 'feature_ids.*' => ['integer', 'exists:features,id'],
            ...$this->contentRules(),
        ];
    }

    public function attributes(): array
    {
        return [
            'summary' => 'Breve resumo',
        ];
    }
}
