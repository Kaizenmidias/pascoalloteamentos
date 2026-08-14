<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\HasRealEstateContentRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePropertyRequest extends FormRequest
{
    use HasRealEstateContentRules;
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'], 'slug' => ['required', 'alpha_dash:ascii', 'max:255', Rule::unique('properties')],
            'reference_code' => ['nullable', 'string', 'max:100', Rule::unique('properties')], 'property_type_id' => ['nullable', 'exists:property_types,id'],
            'development_status_id' => ['nullable', 'exists:development_statuses,id'], 'business_type_id' => ['nullable', 'exists:business_types,id'], 'city_id' => ['nullable', 'exists:cities,id'],
            'condominium_id' => ['nullable', 'exists:condominiums,id'], 'excerpt' => ['nullable', 'string'], 'description' => ['nullable', 'string'],
            'address' => ['nullable', 'string', 'max:255'], 'neighborhood' => ['nullable', 'string', 'max:255'], 'postal_code' => ['nullable', 'string', 'max:12'],
            'address_number' => ['nullable', 'string', 'max:30'], 'complement' => ['nullable', 'string', 'max:255'], 'condominium_name' => ['nullable', 'string', 'max:255'], 'whatsapp_contact' => ['nullable', 'string', 'max:30'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'], 'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'regular_price' => ['nullable', 'numeric', 'min:0'], 'sale_price' => ['nullable', 'numeric', 'min:0'], 'rent_price' => ['nullable', 'numeric', 'min:0'], 'condominium_fee' => ['nullable', 'numeric', 'min:0'], 'iptu' => ['nullable', 'numeric', 'min:0'], 'price_on_request' => ['boolean'],
            'usable_area' => ['nullable', 'numeric', 'min:0'], 'total_area' => ['nullable', 'numeric', 'min:0'], 'built_area' => ['nullable', 'numeric', 'min:0'], 'land_area' => ['nullable', 'numeric', 'min:0'],
            'bedrooms' => ['nullable', 'integer', 'min:0'], 'suites' => ['nullable', 'integer', 'min:0'], 'bathrooms' => ['nullable', 'integer', 'min:0'], 'lavatories' => ['nullable', 'integer', 'min:0'], 'parking_spaces' => ['nullable', 'integer', 'min:0'], 'rooms' => ['nullable', 'integer', 'min:0'],
            'furnished' => ['boolean'], 'accepts_financing' => ['boolean'], 'accepts_exchange' => ['boolean'], 'is_new' => ['boolean'], 'commercial_purpose' => ['required', Rule::in(['sale', 'rent', 'season'])], 'commercial_status' => ['nullable', 'string', 'max:30'], 'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'featured' => ['boolean'], 'published_at' => ['nullable', 'date'], 'feature_ids' => ['array'], 'feature_ids.*' => ['integer', 'exists:features,id'],
            ...$this->contentRules(),
        ];
    }
}
