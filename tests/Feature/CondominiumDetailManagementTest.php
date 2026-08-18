<?php

namespace Tests\Feature;

use App\Models\Condominium;
use App\Models\Feature;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CondominiumDetailManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_persists_structured_condominium_detail_content(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $feature = Feature::create(['name' => 'Piscina Adulto', 'slug' => 'piscina-adulto', 'scope' => 'condominium', 'is_active' => true]);

        $this->actingAs($user)->post('/admin/condominiums', [
            'title' => 'Condomínio completo', 'slug' => 'condominio-completo', 'excerpt' => 'Resumo do empreendimento',
            'about_title' => 'Sobre o condomínio', 'about_text' => 'Texto institucional.',
            'floor_plans_title' => 'Plantas disponíveis', 'floor_plans_support_text' => 'Escolha a planta ideal.',
            'status' => 'published', 'featured' => true, 'price_on_request' => false,
            'feature_ids' => [$feature->id],
            'promotions' => [[
                'product_name' => 'Condomínio completo', 'title' => 'Condição especial', 'text' => 'Por tempo limitado.',
                'original_price' => 150000, 'promotional_price' => 120000, 'button_text' => 'Conhecer',
                'button_url' => 'https://example.com/condominio', 'is_active' => true,
            ]],
            'floor_plans' => [[
                'name' => 'Residência Tipo B', 'area' => 210, 'bedrooms' => 4, 'bathrooms' => 2,
                'parking_spaces' => 2, 'is_active' => true,
            ]],
        ])->assertRedirect();

        $condominium = Condominium::where('slug', 'condominio-completo')->firstOrFail();
        $this->assertTrue($condominium->features->contains($feature));
        $this->assertDatabaseHas('condominium_promotions', ['condominium_id' => $condominium->id, 'title' => 'Condição especial', 'is_active' => true]);
        $this->assertDatabaseHas('floor_plans', ['owner_id' => $condominium->id, 'name' => 'Residência Tipo B', 'is_active' => true]);
        $this->assertDatabaseCount('faqs', 0);
        $this->get('/condominios/condominio-completo')->assertOk();
    }
}
