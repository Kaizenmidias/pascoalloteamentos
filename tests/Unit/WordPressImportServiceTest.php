<?php

namespace Tests\Unit;

use App\Import\WordPress\ImportCheckpointRepository;
use App\Import\WordPress\LegacyRecordClassifier;
use App\Import\WordPress\WordPressDump;
use App\Import\WordPress\WordPressDumpParser;
use App\Import\WordPress\WordPressImportService;
use App\Models\MediaAsset;
use App\Services\Media\MediaAssetService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Mockery;
use ReflectionMethod;
use Tests\TestCase;

class WordPressImportServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_preview_marks_only_published_entities_as_importable_and_keeps_pending_safe(): void
    {
        $dump = new WordPressDump('/tmp/dump.sql', 'wp_');
        $dump->posts = [
            ['ID' => 1, 'post_type' => 'imoveis', 'post_title' => 'Imovel A', 'post_name' => 'imovel-a', 'post_status' => 'publish', 'post_content' => '', 'post_excerpt' => ''],
            ['ID' => 2, 'post_type' => 'imoveis', 'post_title' => 'Imovel B', 'post_name' => 'imovel-b', 'post_status' => 'trash', 'post_content' => '', 'post_excerpt' => ''],
            ['ID' => 3, 'post_type' => 'catalogo', 'post_title' => 'Catalogo Imovel', 'post_name' => 'catalogo-imovel', 'post_status' => 'publish', 'post_content' => '', 'post_excerpt' => ''],
            ['ID' => 4, 'post_type' => 'catalogo', 'post_title' => 'Catalogo Pendente', 'post_name' => 'catalogo-pendente', 'post_status' => 'publish', 'post_content' => '', 'post_excerpt' => ''],
            ['ID' => 5, 'post_type' => 'condominios', 'post_title' => 'Condominio X', 'post_name' => 'condominio-x', 'post_status' => 'publish', 'post_content' => '', 'post_excerpt' => ''],
            ['ID' => 6, 'post_type' => 'condominios', 'post_title' => 'Condominio X', 'post_name' => 'condominio-x', 'post_status' => 'publish', 'post_content' => '', 'post_excerpt' => ''],
            ['ID' => 4279, 'post_type' => 'loteamentos', 'post_title' => 'Produto de teste - Carrossel', 'post_name' => 'produto-de-teste-carrossel', 'post_status' => 'publish', 'post_content' => '', 'post_excerpt' => ''],
            ['ID' => 2503, 'post_type' => 'empreendimentos', 'post_title' => 'Teste 1', 'post_name' => 'teste-1', 'post_status' => 'publish', 'post_content' => '', 'post_excerpt' => ''],
            ['ID' => 3392, 'post_type' => 'catalogo', 'post_title' => 'Imovel teste', 'post_name' => 'imovel-teste', 'post_status' => 'publish', 'post_content' => '', 'post_excerpt' => ''],
        ];
        $dump->postmeta = [
            ['post_id' => 1, 'meta_key' => 'tipo_item', 'meta_value' => 'imovel'],
            ['post_id' => 2, 'meta_key' => 'tipo_item', 'meta_value' => 'imovel'],
            ['post_id' => 3, 'meta_key' => 'tipo_item', 'meta_value' => 'imovel'],
            ['post_id' => 4, 'meta_key' => 'tipo_item', 'meta_value' => 'outro'],
            ['post_id' => 5, 'meta_key' => 'tipo_item', 'meta_value' => 'condominio'],
            ['post_id' => 6, 'meta_key' => 'tipo_item', 'meta_value' => 'condominio'],
            ['post_id' => 2503, 'meta_key' => '_elementor_data', 'meta_value' => '{"template":true}'],
            ['post_id' => 3392, 'meta_key' => 'tipo_item', 'meta_value' => ''],
            ['post_id' => 3392, 'meta_key' => '_elementor_data', 'meta_value' => '{"widget":"catalog"}'],
        ];

        $parser = $this->createMock(WordPressDumpParser::class);
        $parser->method('parse')->willReturn($dump);

        $service = new WordPressImportService(
            $parser,
            new LegacyRecordClassifier(),
            $this->createMock(ImportCheckpointRepository::class),
            $this->createMock(MediaAssetService::class),
        );

        $report = $service->preview('/tmp/dump.sql', 'wp_');

        $this->assertSame(2, $report['summary']['properties']['found']);
        $this->assertSame(2, $report['summary']['properties']['importable']);
        $this->assertSame(0, $report['summary']['properties']['ignored']);
        $this->assertSame(0, $report['summary']['properties']['possible_duplicates']);

        $this->assertSame(2, $report['summary']['condominiums']['found']);
        $this->assertSame(2, $report['summary']['condominiums']['importable']);
        $this->assertSame(0, $report['summary']['condominiums']['ignored']);
        $this->assertSame(2, $report['summary']['condominiums']['possible_duplicates']);

        $this->assertSame(1, $report['summary']['subdivisions']['importable']);
        $this->assertSame(0, $report['summary']['subdivisions']['ignored']);
        $this->assertGreaterThanOrEqual(2, count($report['details']['pending']));
        $pendingIds = array_merge(...array_map(fn ($group) => array_column($group['items'], 'id'), $report['details']['pending']));
        $this->assertContains(2503, $pendingIds);
        $this->assertContains(3392, $pendingIds);
        $this->assertCount(1, $report['details']['importable']['subdivisions']);
        $this->assertSame(4279, $report['details']['importable']['subdivisions'][0]['id']);
        $this->assertCount(1, $report['details']['duplicate_groups']);
    }

    public function test_store_path_imports_existing_attachment_and_reuses_checksum(): void
    {
        Storage::fake('public');

        $sourceDir = storage_path('app/testing-wordpress-uploads');
        if (! is_dir($sourceDir)) {
            mkdir($sourceDir, 0777, true);
        }

        $sourcePath = $sourceDir.DIRECTORY_SEPARATOR.'sample-media.txt';
        file_put_contents($sourcePath, 'sample media payload');

        $service = app(MediaAssetService::class);
        $asset = $service->storePath($sourcePath, 'wordpress', 'public', [
            'legacy_source' => 'wordpress',
            'legacy_id' => 99,
            'metadata' => ['title' => 'Sample Media'],
        ]);

        $duplicate = $service->storePath($sourcePath, 'wordpress', 'public', [
            'legacy_source' => 'wordpress',
            'legacy_id' => 100,
            'metadata' => ['title' => 'Sample Media'],
        ]);

        $this->assertSame($asset->id, $duplicate->id);
        $this->assertSame('wordpress', $asset->legacy_source);
        $this->assertSame(99, $asset->legacy_id);
        $this->assertSame('sample-media.txt', $asset->original_name);
        $this->assertNotEmpty($asset->path);
        $this->assertDatabaseHas('media_assets', [
            'legacy_source' => 'wordpress',
            'legacy_id' => 99,
            'checksum' => $asset->checksum,
        ]);
    }

    public function test_ensure_media_asset_returns_null_when_attachment_file_is_missing(): void
    {
        $service = $this->makeImportService();
        $attachment = [
            'ID' => 123,
            'guid' => 'https://example.test/wp-content/uploads/2024/01/missing-image.jpg',
            'post_title' => 'Missing Image',
            'post_date' => '2024-01-15 10:00:00',
        ];

        $result = $this->invokePrivate($service, 'ensureMediaAsset', [$attachment, []]);

        $this->assertNull($result);
        $this->assertDatabaseCount('media_assets', 0);
    }

    public function test_import_media_continues_when_one_attachment_is_missing(): void
    {
        Storage::fake('public');

        $uploadsDir = storage_path('app/testing-wordpress-uploads-continue');
        if (! is_dir($uploadsDir)) {
            mkdir($uploadsDir, 0777, true);
        }

        $existingPath = $uploadsDir.DIRECTORY_SEPARATOR.'existing-image.txt';
        file_put_contents($existingPath, 'existing media payload');
        config(['wordpress.uploads_path' => $uploadsDir]);

        $dump = new WordPressDump('/tmp/dump.sql', 'wp_');
        $dump->attachments = [
            ['ID' => 2001, 'guid' => 'https://example.test/wp-content/uploads/2024/01/existing-image.txt', 'post_title' => 'Existing', 'post_date' => '2024-01-15 10:00:00'],
            ['ID' => 2002, 'guid' => 'https://example.test/wp-content/uploads/2024/01/missing-image.txt', 'post_title' => 'Missing', 'post_date' => '2024-01-15 10:00:00'],
        ];

        $mediaService = Mockery::mock(MediaAssetService::class);
        $mediaService->shouldReceive('storePath')
            ->once()
            ->andReturnUsing(function (string $path, string $collection, string $disk, array $attributes): MediaAsset {
                return MediaAsset::create([
                    'disk' => $disk,
                    'path' => 'wordpress/existing-image.txt',
                    'original_name' => basename($path),
                    'mime_type' => 'text/plain',
                    'size' => filesize($path),
                    'checksum' => hash_file('sha256', $path),
                    'metadata' => $attributes['metadata'] ?? [],
                    'legacy_source' => $attributes['legacy_source'] ?? null,
                    'legacy_id' => $attributes['legacy_id'] ?? null,
                ]);
            });

        $service = new WordPressImportService(
            $this->createMock(WordPressDumpParser::class),
            new LegacyRecordClassifier(),
            $this->createMock(ImportCheckpointRepository::class),
            $mediaService,
        );

        $result = $this->invokePrivate($service, 'importMedia', [$dump]);

        $this->assertSame(1, $result['imported']);
        $this->assertSame(1, $result['missing']);
        $this->assertSame(0, $result['failed']);
    }

    private function makeImportService(): WordPressImportService
    {
        return new WordPressImportService(
            $this->createMock(WordPressDumpParser::class),
            new LegacyRecordClassifier(),
            $this->createMock(ImportCheckpointRepository::class),
            $this->createMock(MediaAssetService::class),
        );
    }

    private function invokePrivate(object $object, string $method, array $arguments = []): mixed
    {
        $reflection = new ReflectionMethod($object, $method);
        $reflection->setAccessible(true);

        return $reflection->invokeArgs($object, $arguments);
    }
}
