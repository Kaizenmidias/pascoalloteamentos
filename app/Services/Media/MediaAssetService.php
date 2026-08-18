<?php

namespace App\Services\Media;

use App\Models\MediaAsset;
use Illuminate\Http\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class MediaAssetService
{
    public function __construct(private readonly VideoMediaProcessor $videos) {}

    public function store(UploadedFile $file, string $collection = 'uploads', string $disk = 'public'): MediaAsset
    {
        if ($this->isHeic($file)) {
            return $this->storeConvertedHeic($file, $collection, $disk);
        }
        if ($this->isVideoCandidate($file)) {
            return $this->storeProcessedVideo($file, $collection, $disk);
        }
        if ($this->isWebImageCandidate($file)) {
            $this->assertValidWebImage($file);
        }
        $checksum = hash_file('sha256', $file->getRealPath());
        if ($existing = MediaAsset::where('checksum', $checksum)->first()) {
            return $existing;
        }

        return DB::transaction(function () use ($file, $collection, $disk, $checksum) {
            $path = $file->store($collection, $disk);
            try {
                [$width, $height] = str_starts_with((string) $file->getMimeType(), 'image/') ? (getimagesize($file->getRealPath()) ?: [null, null]) : [null, null];

                return MediaAsset::create(['disk' => $disk, 'path' => $path, 'original_name' => $file->getClientOriginalName(), 'mime_type' => $file->getMimeType(), 'media_type' => 'image', 'size' => $file->getSize(), 'width' => $width, 'height' => $height, 'checksum' => $checksum]);
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

    private function isVideoCandidate(UploadedFile $file): bool
    {
        return in_array(strtolower($file->getClientOriginalExtension()), ['mov', 'mp4', 'webm'], true)
            || in_array(strtolower((string) $file->getMimeType()), ['video/mp4', 'video/quicktime', 'video/webm'], true);
    }

    private function isWebImageCandidate(UploadedFile $file): bool
    {
        return in_array(strtolower($file->getClientOriginalExtension()), ['jpg', 'jpeg', 'png', 'webp'], true)
            || str_starts_with(strtolower((string) $file->getMimeType()), 'image/');
    }

    private function assertValidWebImage(UploadedFile $file): void
    {
        $mime = strtolower((string) $file->getMimeType());
        if (! in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true) || @getimagesize($file->getRealPath()) === false) {
            throw new RuntimeException('O arquivo enviado nao e uma imagem JPG, PNG ou WebP valida.');
        }
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
            $image->autoOrient();
            $image->setImageFormat('webp');
            $image->setImageCompressionQuality((int) config('media.webp_quality', 85));
            $image->stripImage();
            if (! $image->writeImage($temporary)) {
                throw new RuntimeException('Não foi possível converter o arquivo HEIC para WebP.');
            }
            $image->clear();

            return $this->storePath($temporary, $collection, $disk, [
                'original_name' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME).'.webp',
                'mime_type' => 'image/webp',
                'media_type' => 'image',
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

    private function storeProcessedVideo(UploadedFile $file, string $collection, string $disk): MediaAsset
    {
        $sourceChecksum = hash_file('sha256', $file->getRealPath());
        $existing = MediaAsset::where('media_type', 'video')->where('metadata->source_checksum', $sourceChecksum)->first();
        if ($existing) {
            return $existing;
        }

        $videoPath = null;
        $posterPath = null;
        try {
            $processed = $this->videos->process($file);
            $videoName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME).'.mp4';
            $posterName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME).'-poster.webp';
            $videoPath = Storage::disk($disk)->putFileAs($collection, new File($processed['video_path']), uniqid('video-', true).'-'.$videoName);
            $posterPath = Storage::disk($disk)->putFileAs($collection.'/posters', new File($processed['poster_path']), uniqid('poster-', true).'-'.$posterName);

            if (! $videoPath || ! $posterPath) {
                throw new RuntimeException('Nao foi possivel salvar o video processado e sua capa.');
            }

            try {
                return MediaAsset::create([
                    'disk' => $disk, 'path' => $videoPath, 'poster_disk' => $disk, 'poster_path' => $posterPath,
                    'original_name' => $videoName, 'mime_type' => 'video/mp4', 'media_type' => 'video',
                    'size' => Storage::disk($disk)->size($videoPath), 'width' => $processed['width'], 'height' => $processed['height'],
                    'checksum' => hash_file('sha256', $processed['video_path']),
                    'metadata' => ['source_name' => $file->getClientOriginalName(), 'source_mime' => $file->getMimeType(), 'source_checksum' => $sourceChecksum, 'duration' => $processed['duration']],
                ]);
            } catch (\Throwable $error) {
                Storage::disk($disk)->delete([$videoPath, $posterPath]);
                throw $error;
            }
        } catch (\Throwable $error) {
            if ($videoPath || $posterPath) {
                Storage::disk($disk)->delete(array_filter([$videoPath, $posterPath]));
            }
            Log::error('Falha ao processar upload de video.', ['file' => $file->getClientOriginalName(), 'error' => $error->getMessage()]);
            throw new RuntimeException('Nao foi possivel processar o video enviado. '.$error->getMessage(), previous: $error);
        } finally {
            if (isset($processed)) {
                $this->videos->cleanup($processed);
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
                    'media_type' => is_string($mime) && str_starts_with($mime, 'video/') ? 'video' : 'image',
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
