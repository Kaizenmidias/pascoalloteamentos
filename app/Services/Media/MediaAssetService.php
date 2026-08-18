<?php

namespace App\Services\Media;

use App\Models\MediaAsset;
use Illuminate\Http\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class MediaAssetService
{
    public function store(UploadedFile $file, string $collection = 'uploads', string $disk = 'public'): MediaAsset
    {
        if ($this->isHeic($file)) {
            return $this->storeConvertedHeic($file, $collection, $disk);
        }
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

    private function isHeic(UploadedFile $file): bool
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $mime = strtolower((string) $file->getMimeType());

        return in_array($extension, ['heic', 'heif'], true)
            || in_array($mime, ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'], true);
    }

    private function storeConvertedHeic(UploadedFile $file, string $collection, string $disk): MediaAsset
    {
        if (! class_exists(\Imagick::class)) {
            throw new RuntimeException('Upload HEIC requer a extensão PHP Imagick com suporte ao formato HEIC/HEIF.');
        }

        $temporary = tempnam(sys_get_temp_dir(), 'pascoal-heic-');
        if ($temporary === false) {
            throw new RuntimeException('Não foi possível criar o arquivo temporário para conversão HEIC.');
        }
        try {
            $image = new \Imagick();
            $image->readImage($file->getRealPath());
            $image->setIteratorIndex(0);
            $image->setImageFormat('webp');
            $image->setImageCompressionQuality(88);
            $image->stripImage();
            if (! $image->writeImage($temporary)) {
                throw new RuntimeException('Não foi possível converter o arquivo HEIC para WebP.');
            }
            $image->clear();

            return $this->storePath($temporary, $collection, $disk, [
                'original_name' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME).'.webp',
                'mime_type' => 'image/webp',
                'metadata' => ['converted_from' => $file->getClientOriginalName(), 'source_mime' => $file->getMimeType()],
            ]);
        } catch (\Throwable $error) {
            throw new RuntimeException('Falha ao converter HEIC: '.$error->getMessage(), previous: $error);
        } finally {
            if (is_file($temporary)) {
                @unlink($temporary);
            }
        }
    }

    public function storePath(string $path, string $collection = 'uploads', string $disk = 'public', array $attributes = []): MediaAsset
    {
        $checksum = hash_file('sha256', $path);
        if ($existing = MediaAsset::where('checksum', $checksum)->first()) {
            return $existing;
        }

        $file = new File($path);
        $realPath = $file->getRealPath() ?: $path;
        return DB::transaction(function () use ($file, $collection, $disk, $checksum, $attributes, $realPath) {
            $stored = Storage::disk($disk)->putFile($collection, $file);
            try {
                $detectedPath = $file->getRealPath() ?: $realPath;
                $mime = is_file($detectedPath) ? (mime_content_type($detectedPath) ?: null) : null;
                [$width, $height] = is_string($mime) && str_starts_with($mime, 'image/') && is_file($detectedPath)
                    ? (getimagesize($detectedPath) ?: [null, null])
                    : [null, null];

                return MediaAsset::create(array_merge([
                    'disk' => $disk,
                    'path' => $stored,
                    'original_name' => basename($realPath),
                    'mime_type' => $mime,
                    'size' => is_file($realPath) ? (filesize($realPath) ?: null) : null,
                    'width' => $width,
                    'height' => $height,
                    'checksum' => $checksum,
                ], $attributes));
            } catch (\Throwable $exception) {
                Storage::disk($disk)->delete($stored);
                throw $exception;
            }
        });
    }
}
