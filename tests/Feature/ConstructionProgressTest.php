<?php

namespace Tests\Feature;

use App\Models\Condominium;
use App\Models\MediaAsset;
use App\Models\Subdivision;
use App\Support\ConstructionStageCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConstructionProgressTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_calculates_and_rounds_the_average_of_public_stages(): void
    {
        $condominium = Condominium::create(['title' => 'Vale da Mata', 'slug' => 'vale-da-mata']);
        $condominium->constructionStages()->createMany([
            ['name' => 'Terraplenagem', 'progress_percent' => 100, 'is_public' => true],
            ['name' => 'Rede de água e esgoto', 'progress_percent' => 49, 'is_public' => true],
            ['name' => 'Pavimentação', 'progress_percent' => 0, 'is_public' => true],
            ['name' => 'Interna', 'progress_percent' => 0, 'is_public' => false],
        ]);

        $this->assertSame(75, $condominium->constructionProgressPercentage());
    }

    public function test_stage_catalog_has_the_correct_stages_for_each_entity(): void
    {
        $condominiumStages = collect(ConstructionStageCatalog::definitionsFor(Condominium::class))->pluck('code');
        $subdivisionStages = collect(ConstructionStageCatalog::definitionsFor(Subdivision::class))->pluck('code');

        $this->assertCount(9, $condominiumStages);
        $this->assertFalse($condominiumStages->contains('paving'));
        $this->assertFalse($condominiumStages->contains('lot-grassing'));
        $this->assertFalse($condominiumStages->contains('square'));
        $this->assertCount(12, $subdivisionStages);
        $this->assertTrue($subdivisionStages->contains('paving'));
        $this->assertTrue($subdivisionStages->contains('lot-grassing'));
        $this->assertTrue($subdivisionStages->contains('square'));
    }

    public function test_it_returns_null_when_there_are_no_public_stages(): void
    {
        $condominium = Condominium::create(['title' => 'Vale da Mata', 'slug' => 'vale-da-mata']);
        $condominium->constructionStages()->create([
            'name' => 'Interna',
            'progress_percent' => 50,
            'is_public' => false,
        ]);

        $this->assertNull($condominium->constructionProgressPercentage());
    }

    public function test_stage_date_and_photos_persist_through_existing_media_relations(): void
    {
        $condominium = Condominium::create(['title' => 'Vale da Mata', 'slug' => 'vale-da-mata']);
        $stage = $condominium->constructionStages()->create([
            'name' => 'Estrutura',
            'progress_percent' => 60,
            'reference_date' => '2026-03-15',
            'is_public' => true,
        ]);
        $asset = MediaAsset::create([
            'disk' => 'external',
            'path' => 'https://example.com/andamento.webp',
            'mime_type' => 'image/webp',
        ]);

        $stage->mediaAssets()->attach($asset->id, [
            'collection' => 'construction-progress',
            'sort_order' => 0,
            'is_featured' => false,
        ]);

        $stage->refresh()->load('mediaAssets');

        $this->assertSame('2026-03-15', $stage->reference_date->toDateString());
        $this->assertCount(1, $stage->mediaAssets);
        $this->assertSame($asset->id, $stage->mediaAssets->first()->id);
    }
}
