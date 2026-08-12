<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\HasRealEstateContentRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSubdivisionRequest extends FormRequest
{
    use HasRealEstateContentRules;
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'], 'slug' => ['required', 'alpha_dash:ascii', 'max:255', Rule::unique('subdivisions')],
            'reference_code' => ['nullable', 'string', 'max:100', Rule::unique('subdivisions')],
            'subdivision_type_id' => ['nullable', 'exists:subdivision_types,id'], 'development_status_id' => ['nullable', 'exists:development_statuses,id'], 'city_id' => ['nullable', 'exists:cities,id'],
            'excerpt' => ['nullable', 'string'], 'description' => ['nullable', 'string'], 'address' => ['nullable', 'string', 'max:255'], 'neighborhood' => ['nullable', 'string', 'max:255'], 'postal_code' => ['nullable', 'string', 'max:12'],
            'address_number' => ['nullable', 'string', 'max:30'], 'complement' => ['nullable', 'string', 'max:255'], 'whatsapp_contact' => ['nullable', 'string', 'max:30'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'], 'longitude' => ['nullable', 'numeric', 'between:-180,180'], 'regular_price' => ['nullable', 'numeric', 'min:0'], 'sale_price' => ['nullable', 'numeric', 'min:0'], 'price_on_request' => ['boolean'],
            'minimum_lot_area' => ['nullable', 'numeric', 'min:0'], 'maximum_lot_area' => ['nullable', 'numeric', 'gte:minimum_lot_area'], 'total_lots' => ['nullable', 'integer', 'min:0'], 'available_lots' => ['nullable', 'integer', 'min:0', 'lte:total_lots'],
            'commercial_purpose' => ['nullable', 'string', 'max:20'], 'commercial_status' => ['nullable', 'string', 'max:30'], 'about_title' => ['nullable', 'string', 'max:255'], 'about_text' => ['nullable', 'string'], 'promotion_headline' => ['nullable', 'string', 'max:255'], 'promotion_url' => ['nullable', 'url', 'max:2048'], 'expected_delivery_date' => ['nullable', 'date'],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])], 'featured' => ['boolean'], 'published_at' => ['nullable', 'date'], 'feature_ids' => ['array'], 'feature_ids.*' => ['integer', 'exists:features,id'],
            ...$this->contentRules(),
        ];
    }
}
