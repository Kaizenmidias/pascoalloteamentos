<?php

namespace Tests\Feature;

use App\Models\Condominium;
use App\Models\MediaAsset;
use App\Models\Subdivision;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConstructionProgressUpdatesTest extends TestCase
{
    use RefreshDatabase;

    public function test_condominium_summary_facts_are_optional_and_persisted(): void
    {
        $facts = [
            ['label' => 'Torres', 'value' => '2', 'icon' => 'building'],
            ['label' => 'Unidades', 'value' => '48', 'icon' => 'units'],
        ];

        $condominium = Condominium::create([
            'title' => 'Residencial Horizonte',
            'slug' => 'residencial-horizonte',
            'summary_facts' => $facts,
        ]);

        $this->assertSame($facts, $condominium->fresh()->summary_facts);

        $condominium->update(['summary_facts' => null]);

        $this->assertNull($condominium->fresh()->summary_facts);
    }

    public function test_progress_updates_are_shared_ordered_and_keep_media_order(): void
    {
        foreach ([
            Condominium::create(['title' => 'Residencial Horizonte', 'slug' => 'residencial-horizonte']),
            Subdivision::create(['title' => 'Jardim Horizonte', 'slug' => 'jardim-horizonte']),
        ] as $entity) {
            $older = $entity->constructionProgressUpdates()->create(['progress_date' => '2026-10-01']);
            $newer = $entity->constructionProgressUpdates()->create(['progress_date' => '2026-11-01']);
            $first = MediaAsset::create(['disk' => 'external', 'path' => "https://example.com/{$entity->getTable()}-1.webp", 'mime_type' => 'image/webp']);
            $second = MediaAsset::create(['disk' => 'external', 'path' => "https://example.com/{$entity->getTable()}-2.webp", 'mime_type' => 'image/webp']);

            $newer->mediaAssets()->attach([
                $first->id => ['collection' => 'construction-progress', 'sort_order' => 1, 'is_featured' => false],
                $second->id => ['collection' => 'construction-progress', 'sort_order' => 0, 'is_featured' => false],
            ]);

            $updates = $entity->fresh()->constructionProgressUpdates;

            $this->assertSame($newer->id, $updates->first()->id);
            $this->assertSame('2026-11-01', $updates->first()->progress_date->toDateString());
            $this->assertSame([$second->id, $first->id], $newer->fresh()->mediaAssets->pluck('id')->all());
            $this->assertSame($older->id, $updates->last()->id);
        }
    }
}
