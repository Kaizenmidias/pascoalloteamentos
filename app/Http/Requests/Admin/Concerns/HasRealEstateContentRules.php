<?php

namespace App\Http\Requests\Admin\Concerns;

trait HasRealEstateContentRules
{
    protected function contentRules(): array
    {
        return [
            'gallery_images' => ['nullable', 'array', 'max:30'],
            'gallery_images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:12288'],
            'remove_media_ids' => ['nullable', 'array'],
            'remove_media_ids.*' => ['integer', 'exists:media_assets,id'],
            'featured_media_id' => ['nullable', 'integer', 'exists:media_assets,id'],
            'floor_plans' => ['nullable', 'array', 'max:30'],
            'floor_plans.*.name' => ['required', 'string', 'max:255'],
            'floor_plans.*.description' => ['nullable', 'string'],
            'floor_plans.*.area' => ['nullable', 'numeric', 'min:0'],
            'floor_plans.*.bedrooms' => ['nullable', 'integer', 'min:0'],
            'floor_plans.*.suites' => ['nullable', 'integer', 'min:0'],
            'floor_plans.*.bathrooms' => ['nullable', 'integer', 'min:0'],
            'floor_plans.*.parking_spaces' => ['nullable', 'integer', 'min:0'],
            'floor_plans.*.external_url' => ['nullable', 'url', 'max:2048'],
            'floor_plans.*.media_asset_id' => ['nullable', 'integer', 'exists:media_assets,id'],
            'floor_plans.*.image' => ['nullable', 'file', 'mimetypes:image/jpeg,image/png,image/webp,image/heic,image/heif,image/heic-sequence,image/heif-sequence', 'max:25600'],
            'floor_plans.*.is_active' => ['nullable', 'boolean'],
            'construction_stages' => ['nullable', 'array', 'max:30'],
            'construction_stages.*.name' => ['required', 'string', 'max:255'],
            'construction_stages.*.code' => ['nullable', 'string', 'max:60'],
            'construction_stages.*.progress_percent' => ['nullable', 'integer', 'between:0,100'],
            'construction_stages.*.is_public' => ['nullable', 'boolean'],
            'construction_stages.*.reference_date' => ['nullable', 'date'],
            'construction_stages.*.description' => ['nullable', 'string'],
            'faqs' => ['nullable', 'array', 'max:30'],
            'faqs.*.question' => ['required', 'string', 'max:255'],
            'faqs.*.answer' => ['required', 'string'],
            'faqs.*.is_active' => ['nullable', 'boolean'],
            'documents' => ['nullable', 'array', 'max:30'],
            'documents.*.title' => ['required', 'string', 'max:255'],
            'documents.*.kind' => ['nullable', 'string', 'max:50'],
            'documents.*.external_url' => ['nullable', 'url', 'max:2048'],
            'documents.*.media_asset_id' => ['nullable', 'integer', 'exists:media_assets,id'],
            'documents.*.file' => ['nullable', 'file', 'max:25600'],
            'documents.*.is_public' => ['nullable', 'boolean'],
            'about_image' => ['nullable', 'file', 'mimetypes:image/jpeg,image/png,image/webp,image/heic,image/heif', 'max:25600'],
            'promotion_image' => ['nullable', 'file', 'mimetypes:image/jpeg,image/png,image/webp,image/heic,image/heif', 'max:25600'],
            'gallery_images.*' => ['nullable', 'file', 'mimetypes:image/jpeg,image/png,image/webp,image/heic,image/heif,image/heic-sequence,image/heif-sequence', 'max:25600'],
            'featured_image' => ['nullable', 'file', 'mimetypes:image/jpeg,image/png,image/webp,image/heic,image/heif,image/heic-sequence,image/heif-sequence', 'max:25600'],
            'gallery_videos' => ['nullable', 'array', 'max:30'],
            'gallery_videos.*' => ['nullable', 'file', 'mimetypes:video/mp4,video/webm,video/quicktime', 'max:102400'],
            'gallery_video_urls' => ['nullable', 'array', 'max:30'],
            'gallery_video_urls.*' => ['nullable', 'url', 'max:2048'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:500'],
            'seo_canonical_url' => ['nullable', 'url', 'max:2048'],
            'seo_robots' => ['nullable', 'string', 'max:100'],
        ];
    }
}
