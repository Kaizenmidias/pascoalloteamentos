<?php

namespace App\Services\Media;

use App\Models\MediaAsset;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MediaAssetService
{
    public function store(UploadedFile $file, string $collection = 'uploads', string $disk = 'public'): MediaAsset
    {
        $checksum = hash_file('sha256', $file->getRealPath());
        if ($existing = MediaAsset::where('checksum', $checksum)->first()) {
            return $existing;
        }

        return DB::transaction(function () use ($file, $collection, $disk, $checksum) {
            $path = $file->store($collection, $disk);
            try {
                [$width, $height] = str_starts_with((string) $file->getMimeType(), 'image/') ? (getimagesize($file->getRealPath()) ?: [null, null]) : [null, null];

                return MediaAsset::create(['disk' => $disk, 'path' => $path, 'original_name' => $file->getClientOriginalName(), 'mime_type' => $file->getMimeType(), 'size' => $file->getSize(), 'width' => $width, 'height' => $height, 'checksum' => $checksum]);
            } catch (\Throwable $exception) {
                Storage::disk($disk)->delete($path);
                throw $exception;
            }
        });
    }
}
