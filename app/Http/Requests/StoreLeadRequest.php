<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['name' => ['required', 'string', 'max:255'], 'email' => ['nullable', 'email:rfc', 'max:255'], 'phone' => ['required', 'string', 'max:30'], 'message' => ['nullable', 'string', 'max:3000'], 'consent' => ['required', 'accepted'], 'property_id' => ['nullable', 'exists:properties,id'], 'condominium_id' => ['nullable', 'exists:condominiums,id'], 'subdivision_id' => ['nullable', 'exists:subdivisions,id'], 'source_url' => ['nullable', 'url', 'max:2048']];
    }

    public function after(): array
    {
        return [function (Validator $validator) {
            if (count(array_filter($this->only(['property_id', 'condominium_id', 'subdivision_id']))) > 1) {
                $validator->errors()->add('entity', 'O contato deve apontar para no máximo uma entidade imobiliária.');
            }
        }];
    }
}
