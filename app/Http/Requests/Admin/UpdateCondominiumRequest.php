<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;

class UpdateCondominiumRequest extends StoreCondominiumRequest
{
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['slug'] = ['required', 'alpha_dash:ascii', 'max:255', Rule::unique('condominiums')->ignore($this->route('condominium'))];
        $rules['reference_code'] = ['nullable', 'string', 'max:100', Rule::unique('condominiums')->ignore($this->route('condominium'))];

        return $rules;
    }
}
