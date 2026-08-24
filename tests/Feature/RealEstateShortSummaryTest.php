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

    public function test_admin_forms_persist_breve_resumo_on_create_and_update(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        [$city, $status, $condominiumType, $subdivisionType] = $this->classifications();

        $this->actingAs($user)->post(route('admin.condominiums.store'), [
            'title' => 'Condomínio Horizonte',
            'excerpt' => 'Resumo inicial do condomínio.',
            'city_id' => $city->id,
            'development_status_id' => $status->id,
            'condominium_type_id' => $condominiumType->id,
            'status' => 'draft',
            'featured' => false,
            'price_on_request' => false,
            'feature_ids' => [],
            'promotions' => [],
            'uploaded_media_ids' => [],
        ])->assertRedirect();

        $condominium = Condominium::where('title', 'Condomínio Horizonte')->firstOrFail();
        $this->assertSame('Resumo inicial do condomínio.', $condominium->excerpt);

        $this->actingAs($user)->put(route('admin.condominiums.update', $condominium), [
            'title' => 'Condomínio Horizonte',
            'slug' => $condominium->slug,
            'excerpt' => 'Resumo atualizado do condomínio.',
            'city_id' => $city->id,
            'development_status_id' => $status->id,
            'condominium_type_id' => $condominiumType->id,
            'status' => 'draft',
            'featured' => false,
            'price_on_request' => false,
            'feature_ids' => [],
            'promotions' => [],
            'uploaded_media_ids' => [],
        ])->assertRedirect(route('admin.condominiums.edit', $condominium));

        $this->assertSame('Resumo atualizado do condomínio.', $condominium->fresh()->excerpt);

        $this->actingAs($user)->post(route('admin.subdivisions.store'), [
            'title' => 'Loteamento Jardim Azul',
            'excerpt' => 'Resumo inicial do loteamento.',
            'city_id' => $city->id,
            'development_status_id' => $status->id,
            'subdivision_type_id' => $subdivisionType->id,
            'status' => 'draft',
            'featured' => false,
            'price_on_request' => false,
            'feature_ids' => [],
            'promotions' => [],
            'uploaded_media_ids' => [],
        ])->assertRedirect();

        $subdivision = Subdivision::where('title', 'Loteamento Jardim Azul')->firstOrFail();
        $this->assertSame('Resumo inicial do loteamento.', $subdivision->excerpt);

        $this->actingAs($user)->put(route('admin.subdivisions.update', $subdivision), [
            'title' => 'Loteamento Jardim Azul',
            'slug' => $subdivision->slug,
            'excerpt' => 'Resumo atualizado do loteamento.',
            'city_id' => $city->id,
            'development_status_id' => $status->id,
            'subdivision_type_id' => $subdivisionType->id,
            'status' => 'draft',
            'featured' => false,
            'price_on_request' => false,
            'feature_ids' => [],
            'promotions' => [],
            'uploaded_media_ids' => [],
        ])->assertRedirect(route('admin.subdivisions.edit', $subdivision));

        $this->assertSame('Resumo atualizado do loteamento.', $subdivision->fresh()->excerpt);
    }

    public function test_public_archives_keep_fallback_data_when_breve_resumo_is_empty(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        [$city, $status, $condominiumType, $subdivisionType] = $this->classifications();

        $this->actingAs($user)->post(route('admin.condominiums.store'), [
            'title' => 'Condomínio Sem Resumo',
            'excerpt' => '',
            'description' => 'Descrição completa do condomínio usada como fallback.',
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

        $this->actingAs($user)->post(route('admin.subdivisions.store'), [
            'title' => 'Loteamento Sem Resumo',
            'excerpt' => '',
            'description' => 'Descrição completa do loteamento usada como fallback.',
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

        $this->get('/condominios')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Public/Condominiums/Index')
            ->where('items.data.0.excerpt', '')
            ->where('items.data.0.description', 'Descrição completa do condomínio usada como fallback.')
        );

        $this->get('/loteamentos')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Public/Subdivisions/Index')
            ->where('items.data.0.excerpt', '')
            ->where('items.data.0.description', 'Descrição completa do loteamento usada como fallback.')
        );
    }

    private function classifications(): array
    {
        $state = State::create(['name' => 'Paraná', 'code' => 'PR']);
        $city = City::create(['state_id' => $state->id, 'name' => 'Toledo', 'slug' => 'toledo']);
        $status = DevelopmentStatus::create(['name' => 'Em obras', 'slug' => 'em-obras', 'is_active' => true]);
        $condominiumType = CondominiumType::create(['name' => 'Residencial', 'slug' => 'residencial', 'is_active' => true]);
        $subdivisionType = SubdivisionType::create(['name' => 'Loteamento', 'slug' => 'loteamento', 'is_active' => true]);

        return [$city, $status, $condominiumType, $subdivisionType];
    }
}