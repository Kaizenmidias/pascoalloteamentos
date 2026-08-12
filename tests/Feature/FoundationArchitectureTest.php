<?php

namespace Tests\Feature;

use App\Models\Condominium;
use App\Models\Property;
use App\Models\Redirect;
use App\Models\Subdivision;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class FoundationArchitectureTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_three_real_estate_aggregate_tables_are_independent(): void
    {
        $this->assertTrue(Schema::hasTable('properties'));
        $this->assertTrue(Schema::hasTable('condominiums'));
        $this->assertTrue(Schema::hasTable('subdivisions'));
        $this->assertFalse(Schema::hasTable('catalog_items'));
        $this->assertFalse(class_exists('App\\Models\\CatalogItem'));

        $this->assertSame('properties', (new Property)->getTable());
        $this->assertSame('condominiums', (new Condominium)->getTable());
        $this->assertSame('subdivisions', (new Subdivision)->getTable());
    }

    public function test_shared_media_seo_and_import_infrastructure_exists(): void
    {
        foreach (['media_assets', 'mediables', 'floor_plans', 'construction_stages', 'seo_meta', 'redirects', 'legacy_imports', 'legacy_taxonomy_aliases'] as $table) {
            $this->assertTrue(Schema::hasTable($table), "Tabela ausente: {$table}");
        }
    }

    public function test_public_foundation_routes_render_without_legacy_data(): void
    {
        $this->get('/')->assertOk();
        $this->get('/imoveis')->assertOk();
        $this->get('/condominios')->assertOk();
        $this->get('/loteamentos')->assertOk();
        $this->get('/admin')->assertRedirect('/login');
        $this->get('/empreendimentos')->assertNotFound();
        $this->get('/sitemap.xml')->assertOk()->assertHeader('Content-Type', 'application/xml');
    }

    public function test_legacy_urls_are_redirected_by_data_instead_of_a_fourth_entity(): void
    {
        Redirect::create([
            'source_path' => '/empreendimentos/exemplo/',
            'destination_url' => '/condominios/exemplo',
            'status_code' => 301,
        ]);

        $this->get('/empreendimentos/exemplo/')->assertRedirect('/condominios/exemplo')->assertStatus(301);
        $this->assertDatabaseHas('redirects', ['source_path' => '/empreendimentos/exemplo/', 'hits' => 1]);
    }
}
