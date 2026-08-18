<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\State;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class BrazilLocationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_sync_command_preserves_existing_cities_and_imports_ibge_locations(): void
    {
        $parana = State::create(['name' => 'Paraná', 'code' => 'PR']);
        $toledo = City::create(['state_id' => $parana->id, 'name' => 'Toledo', 'slug' => 'toledo']);
        $rosana = City::create(['state_id' => $parana->id, 'name' => 'Rosana', 'slug' => 'rosana']);

        Http::fake([
            '*estados/PR/municipios*' => Http::response([['id' => 4127700, 'nome' => 'Toledo']]),
            '*estados/SP/municipios*' => Http::response([['id' => 3541000, 'nome' => 'Praia Grande'], ['id' => 3544259, 'nome' => 'Rosana']]),
            '*localidades/estados*' => Http::response([
                ['id' => 41, 'sigla' => 'PR', 'nome' => 'Paraná'],
                ['id' => 35, 'sigla' => 'SP', 'nome' => 'São Paulo'],
            ]),
        ]);

        $this->artisan('locations:sync-ibge')->assertSuccessful();

        $this->assertSame($toledo->id, City::where('slug', 'toledo')->value('id'));
        $this->assertSame($rosana->id, City::where(['slug' => 'rosana', 'state_id' => State::where('code', 'SP')->value('id')])->value('id'));
        $this->assertDatabaseHas('cities', ['name' => 'Praia Grande', 'state_id' => State::where('code', 'SP')->value('id')]);
    }

    public function test_admin_city_search_is_scoped_to_the_selected_state(): void
    {
        $parana = State::create(['name' => 'Paraná', 'code' => 'PR']);
        $saoPaulo = State::create(['name' => 'São Paulo', 'code' => 'SP']);
        City::create(['state_id' => $parana->id, 'name' => 'Toledo', 'slug' => 'toledo']);
        City::create(['state_id' => $saoPaulo->id, 'name' => 'Praia Grande', 'slug' => 'praia-grande']);
        City::create(['state_id' => $saoPaulo->id, 'name' => 'Santos', 'slug' => 'santos']);

        $response = $this->actingAs(User::factory()->create())
            ->getJson('/admin/locations/cities?state_id='.$saoPaulo->id.'&q=Praia');

        $response->assertOk()
            ->assertJsonCount(1, 'cities')
            ->assertJsonPath('cities.0.name', 'Praia Grande');
    }
}
