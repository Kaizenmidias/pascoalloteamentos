<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Feature;
use App\Models\Property;
use App\Models\PropertyType;
use App\Models\State;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PropertyDetailPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_detail_page_exposes_features_and_ranked_similar_properties(): void
    {
        $state = State::create(['name' => 'Paraná', 'code' => 'PR']);
        $city = City::create(['state_id' => $state->id, 'name' => 'Toledo', 'slug' => 'toledo']);
        $otherCity = City::create(['state_id' => $state->id, 'name' => 'Cascavel', 'slug' => 'cascavel']);
        $apartment = PropertyType::create(['name' => 'Apartamento', 'slug' => 'apartamento', 'is_active' => true]);
        $house = PropertyType::create(['name' => 'Casa', 'slug' => 'casa', 'is_active' => true]);
        $current = $this->property('Apartamento central', 'apartamento-central', $city, $apartment, 'sale', 500000);
        $feature = Feature::create(['name' => 'Piscina', 'slug' => 'piscina', 'category' => 'Lazer', 'scope' => 'property', 'is_active' => true]);
        $current->features()->attach($feature->id, ['sort_order' => 0]);

        $best = $this->property('Apartamento semelhante', 'apartamento-semelhante', $city, $apartment, 'sale', 510000);
        $sameType = $this->property('Apartamento em outra cidade', 'apartamento-outra-cidade', $otherCity, $apartment, 'sale', 505000);
        $sameCity = $this->property('Casa na mesma cidade', 'casa-mesma-cidade', $city, $house, 'sale', 500000);
        $differentPurpose = $this->property('Apartamento para locação', 'apartamento-locacao', $city, $apartment, 'rent', 2500);
        $this->property('Quinto resultado', 'quinto-resultado', $otherCity, $house, 'rent', 3000);

        $this->get(route('properties.show', $current))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Properties/Show')
                ->where('item.id', $current->id)
                ->where('item.features.0.name', 'Piscina')
                ->where('item.features.0.category', 'Lazer')
                ->has('similar', 4)
                ->where('similar.0.id', $best->id)
                ->where('similar.1.id', $sameType->id)
                ->where('similar.2.id', $sameCity->id)
                ->where('similar.3.id', $differentPurpose->id)
            );
    }

    private function property(string $title, string $slug, City $city, PropertyType $type, string $purpose, float $price): Property
    {
        return Property::create([
            'title' => $title,
            'slug' => $slug,
            'city_id' => $city->id,
            'property_type_id' => $type->id,
            'commercial_purpose' => $purpose,
            'sale_price' => $price,
            'status' => 'published',
            'published_at' => now(),
        ]);
    }
}
