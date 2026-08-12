<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;

class UpdatePropertyRequest extends StorePropertyRequest
{
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['slug'] = ['required', 'alpha_dash:ascii', 'max:255', Rule::unique('properties')->ignore($this->route('property'))];
        $rules['reference_code'] = ['nullable', 'string', 'max:100', Rule::unique('properties')->ignore($this->route('property'))];

        return $rules;
    }
}
