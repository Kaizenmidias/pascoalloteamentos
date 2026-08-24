<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Condominium;
use App\Models\CondominiumType;
use App\Models\DevelopmentStatus;
use App\Models\State;
use App\Models\Subdivision;
use App\Models\SubdivisionType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RealEstateShortSummaryTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_persists_summary_independently_from_description(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        [$city, $status, $condominiumType, $subdivisionType] = $this->classifications();

        $condoSummary = 'Texto curto para o card.';
        $condoDescription = 'Este e um texto completamente diferente e muito maior para a pagina interna.';

        $this->actingAs($user)->post(route('admin.condominiums.store'), [
            'title' => 'Condominio Horizonte',
            'summary' => $condoSummary,
            'description' => $condoDescription,
            'city_id' => $city->id,
            'development_status_id' => $status->id,
            'condominium_type_id' => $condominiumType->id,
            'status' => 'published',
            'featured' => false,
            'price_on_request' => false,
            'feature_ids' => [],
            'promotions' => [],
            'uploaded_media_ids' => [],
        ])->assertRedirect();

        $condominium = Condominium::where('title', 'Condominio Horizonte')->firstOrFail();
        $this->assertSame($condoSummary, $condominium->summary);
        $this->assertSame($condoDescription, $condominium->description);
        $this->assertSame($condoSummary, $condominium->card_summary);

        $updatedCondoSummary = 'Resumo atualizado do card.';
        $updatedCondoDescription = 'Descricao atualizada e ainda mais completa para a pagina interna.';

        $this->actingAs($user)->put(route('admin.condominiums.update', $condominium), [
            'title' => 'Condominio Horizonte',
            'slug' => $condominium->slug,
            'summary' => $updatedCondoSummary,
            'description' => $updatedCondoDescription,
            'city_id' => $city->id,
            'development_status_id' => $status->id,
            'condominium_type_id' => $condominiumType->id,
            'status' => 'published',
            'featured' => false,
            'price_on_request' => false,
            'feature_ids' => [],
            'promotions' => [],
            'uploaded_media_ids' => [],
        ])->assertRedirect(route('admin.condominiums.edit', $condominium));

        $condominium = $condominium->fresh();
        $this->assertSame($updatedCondoSummary, $condominium->summary);
        $this->assertSame($updatedCondoDescription, $condominium->description);
        $this->assertSame($updatedCondoSummary, $condominium->card_summary);

        $subdivisionSummary = 'Texto curto para o card do loteamento.';
        $subdivisionDescription = 'Este e um texto completamente diferente e muito maior para a pagina interna do loteamento.';

        $this->actingAs($user)->post(route('admin.subdivisions.store'), [
            'title' => 'Loteamento Jardim Azul',
            'summary' => $subdivisionSummary,
            'description' => $subdivisionDescription,
            'city_id' => $city->id,
            'development_status_id' => $status->id,
            'subdivision_type_id' => $subdivisionType->id,
            'status' => 'published',
            'featured' => false,
            'price_on_request' => false,
            'feature_ids' => [],
            'promotions' => [],
            'uploaded_media_ids' => [],
        ])->assertRedirect();

        $subdivision = Subdivision::where('title', 'Loteamento Jardim Azul')->firstOrFail();
        $this->assertSame($subdivisionSummary, $subdivision->summary);
        $this->assertSame($subdivisionDescription, $subdivision->description);
        $this->assertSame($subdivisionSummary, $subdivision->card_summary);

        $updatedSubdivisionSummary = 'Resumo atualizado do loteamento.';
        $updatedSubdivisionDescription = 'Descricao atualizada e muito maior para a pagina interna do loteamento.';

        $this->actingAs($user)->put(route('admin.subdivisions.update', $subdivision), [
            'title' => 'Loteamento Jardim Azul',
            'slug' => $subdivision->slug,
            'summary' => $updatedSubdivisionSummary,
            'description' => $updatedSubdivisionDescription,
            'city_id' => $city->id,
            'development_status_id' => $status->id,
            'subdivision_type_id' => $subdivisionType->id,
            'status' => 'published',
            'featured' => false,
            'price_on_request' => false,
            'feature_ids' => [],
            'promotions' => [],
            'uploaded_media_ids' => [],
        ])->assertRedirect(route('admin.subdivisions.edit', $subdivision));

        $subdivision = $subdivision->fresh();
        $this->assertSame($updatedSubdivisionSummary, $subdivision->summary);
        $this->assertSame($updatedSubdivisionDescription, $subdivision->description);
        $this->assertSame($updatedSubdivisionSummary, $subdivision->card_summary);
    }

    public function test_public_archives_and_show_pages_use_card_summary_with_legacy_fallback(): void
    {
        [$city, $status, $condominiumType, $subdivisionType] = $this->classifications();

        $condominium = Condominium::create([
            'title' => 'Legacy Condo',
            'slug' => 'legacy-condo',
            'summary' => null,
            'excerpt' => 'Legacy condo card text.',
            'description' => 'Legacy condo full description.',
            'city_id' => $city->id,
            'development_status_id' => $status->id,
            'condominium_type_id' => $condominiumType->id,
            'status' => 'published',
            'published_at' => now()->subDay(),
            'featured' => false,
            'price_on_request' => false,
        ]);

        $subdivision = Subdivision::create([
            'title' => 'Legacy Subdivision',
            'slug' => 'legacy-subdivision',
            'summary' => null,
            'excerpt' => 'Legacy subdivision card text.',
            'description' => 'Legacy subdivision full description.',
            'city_id' => $city->id,
            'development_status_id' => $status->id,
            'subdivision_type_id' => $subdivisionType->id,
            'status' => 'published',
            'published_at' => now()->subDay(),
            'featured' => false,
            'price_on_request' => false,
        ]);

        $this->get('/condominios')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Public/Condominiums/Index')
            ->where('items.data.0.card_summary', 'Legacy condo card text.')
            ->where('items.data.0.summary', null)
        );

        $this->get('/loteamentos')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Public/Subdivisions/Index')
            ->where('items.data.0.card_summary', 'Legacy subdivision card text.')
            ->where('items.data.0.summary', null)
        );

        $this->get('/condominios/'.$condominium->slug)->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Public/Condominiums/Show')
            ->where('item.card_summary', 'Legacy condo card text.')
            ->where('item.description', 'Legacy condo full description.')
        );

        $this->get('/loteamentos/'.$subdivision->slug)->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Public/Subdivisions/Show')
            ->where('item.card_summary', 'Legacy subdivision card text.')
            ->where('item.description', 'Legacy subdivision full description.')
        );
    }

    private function classifications(): array
    {
        $state = State::create(['name' => 'Parana', 'code' => 'PR']);
        $city = City::create(['state_id' => $state->id, 'name' => 'Toledo', 'slug' => 'toledo']);
        $status = DevelopmentStatus::create(['name' => 'Em obras', 'slug' => 'em-obras', 'is_active' => true]);
        $condominiumType = CondominiumType::create(['name' => 'Residencial', 'slug' => 'residencial', 'is_active' => true]);
        $subdivisionType = SubdivisionType::create(['name' => 'Loteamento', 'slug' => 'loteamento', 'is_active' => true]);

        return [$city, $status, $condominiumType, $subdivisionType];
    }
}