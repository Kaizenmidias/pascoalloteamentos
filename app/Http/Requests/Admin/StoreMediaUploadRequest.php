<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreMediaUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'mimetypes:image/jpeg,image/png,image/webp,image/heic,image/heif,image/heic-sequence,image/heif-sequence,video/mp4,video/quicktime',
                'max:'.config('media.max_upload_kb'),
            ],
        ];
    }

    public function messages(): array
    {
        $limit = round(config('media.max_upload_kb') / 1024);

        return [
            'file.max' => "O arquivo ultrapassa o limite de {$limit} MB configurado pela aplica\u00e7\u00e3o.",
            'file.mimetypes' => 'Formato n\u00e3o permitido. Envie JPG, JPEG, PNG, WebP, HEIC, HEIF, MP4 ou MOV.',
        ];
    }
}
