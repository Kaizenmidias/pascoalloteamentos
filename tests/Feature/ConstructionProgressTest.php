<?php

namespace Tests\Feature;

use App\Models\Condominium;
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
            ['name' => 'Pavimentação', 'progress_percent' => 49, 'is_public' => true],
            ['name' => 'Interna', 'progress_percent' => 0, 'is_public' => false],
        ]);

        $this->assertSame(75, $condominium->constructionProgressPercentage());
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
}
