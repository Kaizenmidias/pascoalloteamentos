<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\HasRealEstateContentRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCondominiumRequest extends FormRequest
{
    use HasRealEstateContentRules;
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'], 'slug' => ['required', 'alpha_dash:ascii', 'max:255', Rule::unique('condominiums')],
            'reference_code' => ['nullable', 'string', 'max:100', Rule::unique('condominiums')],
            'condominium_type_id' => ['nullable', 'exists:condominium_types,id'], 'development_status_id' => ['nullable', 'exists:development_statuses,id'], 'business_type_id' => ['nullable', 'exists:business_types,id'], 'city_id' => ['nullable', 'exists:cities,id'],
            'excerpt' => ['nullable', 'string'], 'description' => ['nullable', 'string'], 'address' => ['nullable', 'string', 'max:255'], 'neighborhood' => ['nullable', 'string', 'max:255'], 'postal_code' => ['nullable', 'string', 'max:12'],
            'address_number' => ['nullable', 'string', 'max:30'], 'complement' => ['nullable', 'string', 'max:255'], 'whatsapp_contact' => ['nullable', 'string', 'max:30'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'], 'longitude' => ['nullable', 'numeric', 'between:-180,180'], 'starting_price' => ['nullable', 'numeric', 'min:0'], 'promotion_price' => ['nullable', 'numeric', 'min:0'], 'minimum_unit_area' => ['nullable', 'numeric', 'min:0'], 'price_on_request' => ['boolean'],
            'commercial_purpose' => ['nullable', 'string', 'max:20'], 'commercial_status' => ['nullable', 'string', 'max:30'], 'about_title' => ['nullable', 'string', 'max:255'], 'about_text' => ['nullable', 'string'], 'floor_plans_support_text' => ['nullable', 'string'], 'promotion_headline' => ['nullable', 'string', 'max:255'], 'promotion_url' => ['nullable', 'url', 'max:2048'], 'expected_delivery_date' => ['nullable', 'date'], 'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'featured' => ['boolean'], 'published_at' => ['nullable', 'date'], 'feature_ids' => ['array'], 'feature_ids.*' => ['integer', 'exists:features,id'],
            ...$this->contentRules(),
        ];
    }
}
