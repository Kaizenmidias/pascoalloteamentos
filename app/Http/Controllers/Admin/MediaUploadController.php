<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMediaUploadRequest;
use App\Services\Media\MediaAssetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class MediaUploadController extends Controller
{
    public function __invoke(StoreMediaUploadRequest $request, MediaAssetService $media): JsonResponse
    {
        try {
            $asset = $media->store($request->file('file'), 'real-estate/gallery');
        } catch (RuntimeException $exception) {
            Log::warning('Falha no upload individual de midia.', [
                'user_id' => $request->user()->id,
                'file' => $request->file('file')->getClientOriginalName(),
                'error' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'N\u00e3o foi poss\u00edvel processar a m\u00eddia. '.$exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'media' => [
                'id' => $asset->id,
                'original_name' => $asset->original_name,
                'mime_type' => $asset->mime_type,
                'media_type' => $asset->media_type,
                'size' => $asset->size,
                'width' => $asset->width,
                'height' => $asset->height,
                'url' => $asset->url,
                'poster_url' => $asset->poster_url,
                'type' => $asset->type,
            ],
        ], 201);
    }
}
