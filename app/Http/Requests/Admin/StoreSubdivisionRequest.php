<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\HasRealEstateContentRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Support\UniqueSlug;

class StoreSubdivisionRequest extends FormRequest
{
    use HasRealEstateContentRules;

    private const SHORT_SUMMARY_LIMIT = 400;

    protected function prepareForValidation(): void
    {
        if ($this->has('lots_info_url')) {
            $this->merge(['lots_info_url' => trim((string) $this->input('lots_info_url')) ?: null]);
        }

        if (! $this->filled('summary') && $this->filled('excerpt')) {
            $this->merge(['summary' => trim((string) $this->input('excerpt'))]);
        }

        if (! $this->filled('slug')) {
            $this->merge(['slug' => UniqueSlug::for('subdivisions', (string) $this->input('title'), $this->route('subdivision')?->id, 'loteamento')]);
        }
    }

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $rules = [
            'title' => ['required', 'string', 'max:255'], 'slug' => ['nullable', 'alpha_dash:ascii', 'max:255', Rule::unique('subdivisions')],
            'reference_code' => ['nullable', 'string', 'max:100', Rule::unique('subdivisions')],
            'subdivision_type_id' => ['nullable', 'exists:subdivision_types,id'], 'development_status_id' => ['nullable', 'exists:development_statuses,id'], 'business_type_id' => ['nullable', 'exists:business_types,id'], 'city_id' => ['nullable', 'exists:cities,id'],
            'summary' => ['nullable', 'string', 'max:'.self::SHORT_SUMMARY_LIMIT], 'address' => ['nullable', 'string', 'max:255'], 'neighborhood' => ['nullable', 'string', 'max:255'], 'postal_code' => ['nullable', 'string', 'max:12'],
            'lots_info_url' => ['nullable', 'url', 'max:2048'],
            'address_number' => ['nullable', 'string', 'max:30'], 'complement' => ['nullable', 'string', 'max:255'], 'whatsapp_contact' => ['nullable', 'string', 'max:30'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'], 'longitude' => ['nullable', 'numeric', 'between:-180,180'], 'regular_price' => ['nullable', 'numeric', 'min:0'], 'sale_price' => ['nullable', 'numeric', 'min:0'], 'price_on_request' => ['boolean'],
            'minimum_lot_area' => ['nullable', 'numeric', 'min:0'], 'maximum_lot_area' => ['nullable', 'numeric', 'gte:minimum_lot_area'], 'total_lots' => ['nullable', 'integer', 'min:0'], 'available_lots' => ['nullable', 'integer', 'min:0', 'lte:total_lots'],
            'commercial_purpose' => ['nullable', 'string', 'max:20'], 'commercial_status' => ['nullable', 'string', 'max:30'], 'about_title' => ['nullable', 'string', 'max:255'], 'about_text' => ['nullable', 'string'], 'promotion_headline' => ['nullable', 'string', 'max:255'], 'promotion_url' => ['nullable', 'url', 'max:2048'], 'expected_delivery_date' => ['nullable', 'date'],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])], 'featured' => ['boolean'], 'published_at' => ['nullable', 'date'], 'feature_ids' => ['array'], 'feature_ids.*' => ['integer', 'exists:features,id'],
            'promotions' => ['nullable', 'array', 'max:20'],
            'promotions.*.product_name' => ['nullable', 'string', 'max:255'], 'promotions.*.title' => ['required', 'string', 'max:255'], 'promotions.*.text' => ['nullable', 'string'],
            'promotions.*.original_price' => ['nullable', 'numeric', 'min:0'], 'promotions.*.promotional_price' => ['nullable', 'numeric', 'min:0'],
            'promotions.*.button_text' => ['nullable', 'string', 'max:100'], 'promotions.*.button_url' => ['nullable', 'url', 'max:2048'],
            'promotions.*.media_asset_id' => ['nullable', 'integer', 'exists:media_assets,id'], 'promotions.*.image' => ['nullable', 'file', 'mimetypes:image/jpeg,image/png,image/webp,image/heic,image/heif', 'max:25600'], 'promotions.*.is_active' => ['nullable', 'boolean'],
            ...$this->contentRules(),
        ];

        foreach (array_keys($rules) as $key) {
            if (str_starts_with($key, 'faqs') || str_starts_with($key, 'floor_plans') || str_starts_with($key, 'documents')) {
                unset($rules[$key]);
            }
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'required' => 'O campo :attribute Ã© obrigatÃ³rio.',
            'exists' => 'O valor selecionado para :attribute Ã© invÃ¡lido.',
            'lots_info_url.url' => 'Informe um link vÃ¡lido para as informaÃ§Ãµes dos lotes.',
        ];
    }

    public function attributes(): array
    {
        return [
            'title' => 'TÃ­tulo',
            'slug' => 'Slug',
            'reference_code' => 'CÃ³digo de referÃªncia',
            'subdivision_type_id' => 'Tipo de loteamento',
            'development_status_id' => 'Status do empreendimento',
            'business_type_id' => 'Tipo de negÃ³cio',
            'city_id' => 'Cidade',
            'summary' => 'Breve resumo',
            'lots_info_url' => 'Link das informacoes dos lotes',
            'address' => 'EndereÃ§o',
            'postal_code' => 'CEP',
            'expected_delivery_date' => 'Data prevista de entrega',
            'status' => 'Status de publicaÃ§Ã£o',
            'promotions.*.title' => 'TÃ­tulo da promoÃ§Ã£o',
            'construction_stages.*.name' => 'Nome da etapa',
            'construction_stages.*.progress_percent' => 'Percentual da etapa',
        ];
    }
}
