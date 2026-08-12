<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;

class UpdateSubdivisionRequest extends StoreSubdivisionRequest
{
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['slug'] = ['required', 'alpha_dash:ascii', 'max:255', Rule::unique('subdivisions')->ignore($this->route('subdivision'))];
        $rules['reference_code'] = ['nullable', 'string', 'max:100', Rule::unique('subdivisions')->ignore($this->route('subdivision'))];

        return $rules;
    }
}
