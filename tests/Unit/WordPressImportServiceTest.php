<?php

namespace Tests\Unit;

use App\Import\WordPress\ImportCheckpointRepository;
use App\Import\WordPress\LegacyRecordClassifier;
use App\Import\WordPress\WordPressDump;
use App\Import\WordPress\WordPressDumpParser;
use App\Import\WordPress\WordPressImportService;
use App\Services\Media\MediaAssetService;
use PHPUnit\Framework\TestCase;

class WordPressImportServiceTest extends TestCase
{
    public function test_preview_marks_only_published_entities_as_importable_and_keeps_pending_safe(): void
    {
        $dump = new WordPressDump('/tmp/dump.sql', 'wp_');
        $dump->posts = [
            ['ID' => 1, 'post_type' => 'imoveis', 'post_title' => 'Imovel A', 'post_name' => 'imovel-a', 'post_status' => 'publish', 'post_content' => '', 'post_excerpt' => ''],
            ['ID' => 2, 'post_type' => 'imoveis', 'post_title' => 'Imovel A', 'post_name' => 'imovel-a', 'post_status' => 'trash', 'post_content' => '', 'post_excerpt' => '',
            ],
            ['ID' => 3, 'post_type' => 'catalogo', 'post_title' => 'Catalogo Imovel', 'post_name' => 'catalogo-imovel', 'post_status' => 'publish', 'post_content' => '', 'post_excerpt' => ''],
            ['ID' => 4, 'post_type' => 'catalogo', 'post_title' => 'Catalogo Pendente', 'post_name' => 'catalogo-pendente', 'post_status' => 'publish', 'post_content' => '', 'post_excerpt' => ''],
            ['ID' => 5, 'post_type' => 'condominios', 'post_title' => 'Condominio X', 'post_name' => 'condominio-x', 'post_status' => 'publish', 'post_content' => '', 'post_excerpt' => ''],
            ['ID' => 6, 'post_type' => 'condominios', 'post_title' => 'Condominio X', 'post_name' => 'condominio-x', 'post_status' => 'publish', 'post_content' => '', 'post_excerpt' => ''],
        ];
        $dump->postmeta = [
            ['post_id' => 1, 'meta_key' => 'tipo_item', 'meta_value' => 'imovel'],
            ['post_id' => 2, 'meta_key' => 'tipo_item', 'meta_value' => 'imovel'],
            ['post_id' => 3, 'meta_key' => 'tipo_item', 'meta_value' => 'imovel'],
            ['post_id' => 4, 'meta_key' => 'tipo_item', 'meta_value' => 'outro'],
            ['post_id' => 5, 'meta_key' => 'tipo_item', 'meta_value' => 'condominio'],
            ['post_id' => 6, 'meta_key' => 'tipo_item', 'meta_value' => 'condominio'],
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
        $this->assertSame(1, $report['summary']['properties']['importable']);
        $this->assertSame(1, $report['summary']['properties']['ignored']);
        $this->assertSame(1, $report['summary']['properties']['possible_duplicates']);

        $this->assertSame(2, $report['summary']['condominiums']['found']);
        $this->assertSame(2, $report['summary']['condominiums']['importable']);
        $this->assertSame(0, $report['summary']['condominiums']['ignored']);
        $this->assertSame(1, $report['summary']['condominiums']['possible_duplicates']);

        $this->assertSame(0, $report['summary']['pending']['importable']);
        $this->assertCount(1, $report['details']['pending']);
        $this->assertArrayHasKey('items', $report['details']['pending'][0]);
        $this->assertSame(4, $report['details']['pending'][0]['items'][0]['id']);

        $this->assertCount(1, $report['details']['importable']['properties']);
        $this->assertSame(1, $report['details']['importable']['properties'][0]['id']);
        $this->assertCount(2, $report['details']['duplicate_groups']);
    }
}
