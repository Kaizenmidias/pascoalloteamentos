<?php

namespace Tests\Feature;

use App\Models\Condominium;
use App\Models\MediaAsset;
use App\Models\User;
use App\Services\Media\MediaAssetService;
use App\Services\Media\VideoMediaProcessor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class MediaAssetProcessingTest extends TestCase
{
    use RefreshDatabase;

    public function test_normal_jpg_and_processed_video_can_share_a_gallery(): void
    {
        Storage::fake('public');
        $video = tempnam(sys_get_temp_dir(), 'video-').'.mp4';
        $poster = tempnam(sys_get_temp_dir(), 'poster-').'.webp';
        file_put_contents($video, 'mp4');
        file_put_contents($poster, 'poster');

        $processor = Mockery::mock(VideoMediaProcessor::class);
        $processor->shouldReceive('process')->once()->andReturn([
            'video_path' => $video, 'poster_path' => $poster, 'width' => 1280,
            'height' => 720, 'duration' => 2.0,
        ]);
        $processor->shouldReceive('cleanup')->once()->andReturnUsing(function () use ($video, $poster) {
            @unlink($video);
            @unlink($poster);
        });
        $service = new MediaAssetService($processor);

        $image = $service->store(UploadedFile::fake()->image('fachada.JPG'));
        $movie = $service->store(UploadedFile::fake()->create('tour.MOV', 10, 'video/quicktime'));
        $condominium = Condominium::create(['title' => 'Galeria mista', 'slug' => 'galeria-mista', 'status' => 'draft']);
        $condominium->mediaAssets()->attach([$image->id => ['sort_order' => 0], $movie->id => ['sort_order' => 1]]);

        $this->assertSame('image', $image->type);
        $this->assertSame('video', $movie->type);
        $this->assertNotNull($movie->poster_url);
        $this->assertCount(2, $condominium->fresh()->mediaAssets);
    }

    public function test_invalid_heic_is_rejected_without_creating_asset(): void
    {
        Storage::fake('public');
        $this->expectException(RuntimeException::class);
        try {
            app(MediaAssetService::class)->store(UploadedFile::fake()->create('fake.HEIC', 1, 'image/heic'));
        } finally {
            $this->assertDatabaseCount('media_assets', 0);
        }
    }

    public function test_legacy_asset_without_media_type_remains_an_image(): void
    {
        $asset = MediaAsset::create(['disk' => 'external', 'path' => 'https://example.com/old.jpg', 'mime_type' => 'image/jpeg']);
        $this->assertSame('image', $asset->type);
    }

    public function test_media_upload_endpoint_requires_authentication(): void
    {
        $this->postJson('/admin/media-uploads', [
            'file' => UploadedFile::fake()->image('fachada.jpg'),
        ])->assertUnauthorized();
    }

    public function test_uploaded_media_id_is_attached_without_resending_the_file(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);

        $response = $this->actingAs($user)->postJson('/admin/media-uploads', [
            'file' => UploadedFile::fake()->image('fachada.jpg'),
        ])->assertCreated();
        $mediaId = $response->json('media.id');

        $this->actingAs($user)->post('/admin/condominiums', [
            'title' => 'Condominio com upload separado',
            'slug' => 'condominio-upload-separado',
            'status' => 'draft',
            'featured' => false,
            'price_on_request' => false,
            'uploaded_media_ids' => [$mediaId],
            'media_order' => [$mediaId],
            'featured_media_id' => $mediaId,
        ])->assertRedirect();

        $condominium = Condominium::where('slug', 'condominio-upload-separado')->firstOrFail();
        $this->assertSame([$mediaId], $condominium->mediaAssets()->pluck('media_assets.id')->all());
    }
}
