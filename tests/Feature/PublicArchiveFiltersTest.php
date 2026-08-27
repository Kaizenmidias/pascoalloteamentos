<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Condominium;
use App\Models\CondominiumType;
use App\Models\DevelopmentStatus;
use App\Models\Property;
use App\Models\PropertyType;
use App\Models\State;
use App\Models\Subdivision;
use App\Models\SubdivisionType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicArchiveFiltersTest extends TestCase
{
    use RefreshDatabase;

    public function test_empty_filter_combinations_keep_the_same_archive_pages(): void
    {
        [$city, $status] = $this->classifications();
        $this->createPublishedEntities($city, $status);

        $cases = [
            ['/imoveis?city=inexistente&type=inexistente', 'Public/Properties/Index'],
            ['/condominios?city=inexistente&status=inexistente', 'Public/Condominiums/Index'],
            ['/loteamentos?city=inexistente&status=inexistente', 'Public/Subdivisions/Index'],
        ];

        foreach ($cases as [$url, $component]) {
            $this->get($url)->assertOk()->assertInertia(fn (Assert $page) => $page
                ->component($component)
                ->where('items.data', [])
            );
        }
    }

    public function test_filter_options_only_include_classifications_with_published_entities(): void
    {
        [$city, $status] = $this->classifications();
        $this->createPublishedEntities($city, $status);
        $unusedState = State::create(['name' => 'São Paulo', 'code' => 'SP']);
        City::create(['state_id' => $unusedState->id, 'name' => 'Praia Grande', 'slug' => 'praia-grande']);

        $this->get('/imoveis')->assertInertia(fn (Assert $page) => $page
            ->component('Public/Properties/Index')
            ->has('cities', 1)
            ->where('cities.0.slug', 'toledo')
            ->has('types', 1)
        );
    }

    public function test_public_archives_apply_the_requested_dynamic_filters(): void
    {
        [$city, $status] = $this->classifications();
        $this->createPublishedEntities($city, $status);

        $this->get('/condominios?city=toledo&status=em-obras')->assertInertia(fn (Assert $page) => $page
            ->component('Public/Condominiums/Index')
            ->has('items.data', 1)
            ->where('items.data.0.title', 'Vale da Mata')
            ->where('statuses.0.slug', 'em-obras')
        );

        $this->get('/loteamentos?city=toledo&status=em-obras')->assertInertia(fn (Assert $page) => $page
            ->component('Public/Subdivisions/Index')
            ->has('items.data', 1)
            ->where('items.data.0.title', 'Rossetto')
            ->where('cities.0.slug', 'toledo')
        );

        $this->get('/imoveis?city=toledo&type=apartamento')->assertInertia(fn (Assert $page) => $page
            ->component('Public/Properties/Index')
            ->has('items.data', 1)
            ->where('items.data.0.title', 'Apartamento 101')
            ->where('types.0.slug', 'apartamento')
        );
    }

    private function classifications(): array
    {
        $state = State::create(['name' => 'Paraná', 'code' => 'PR']);
        $city = City::create(['state_id' => $state->id, 'name' => 'Toledo', 'slug' => 'toledo']);
        $status = DevelopmentStatus::create(['name' => 'Em obras', 'slug' => 'em-obras', 'is_active' => true]);

        return [$city, $status];
    }

    private function createPublishedEntities(City $city, DevelopmentStatus $status): void
    {
        $common = ['city_id' => $city->id, 'development_status_id' => $status->id, 'status' => 'published', 'published_at' => now()];
        $propertyType = PropertyType::create(['name' => 'Apartamento', 'slug' => 'apartamento', 'is_active' => true]);
        $condominiumType = CondominiumType::create(['name' => 'Residencial', 'slug' => 'residencial', 'is_active' => true]);
        $subdivisionType = SubdivisionType::create(['name' => 'Loteamento', 'slug' => 'loteamento', 'is_active' => true]);

        Property::create([...$common, 'title' => 'Apartamento 101', 'slug' => 'apartamento-101', 'property_type_id' => $propertyType->id]);
        Condominium::create([...$common, 'title' => 'Vale da Mata', 'slug' => 'vale-da-mata', 'condominium_type_id' => $condominiumType->id]);
        Subdivision::create([...$common, 'title' => 'Rossetto', 'slug' => 'rossetto', 'subdivision_type_id' => $subdivisionType->id]);
    }
}
