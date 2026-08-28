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

    public function test_admin_can_create_and_edit_condominium_address_without_commercial_conditions_fields(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $feature = Feature::create(['name' => 'Piscina Adulto', 'slug' => 'piscina-adulto', 'scope' => 'condominium', 'is_active' => true]);

        $createPayload = [
            'title' => 'Condomínio completo',
            'excerpt' => 'Resumo do empreendimento',
            'address' => 'Rua das Palmeiras, 1200 - Centro, Cascavel - PR',
            'address_number' => '1200',
            'neighborhood' => 'Centro',
            'postal_code' => '85801-000',
            'about_title' => 'Sobre o condomínio',
            'about_text' => 'Texto institucional.',
            'summary_facts' => [
                ['label' => 'Torres', 'value' => '2', 'icon' => 'building'],
                ['label' => 'Unidades', 'value' => '48', 'icon' => 'units'],
            ],
            'floor_plans_title' => 'Plantas disponíveis',
            'floor_plans_support_text' => 'Escolha a planta ideal.',
            'status' => 'published',
            'featured' => true,
            'price_on_request' => false,
            'feature_ids' => [$feature->id],
            'promotions' => [[
                'product_name' => 'Condomínio completo',
                'title' => 'Condição especial',
                'text' => 'Por tempo limitado.',
                'original_price' => 150000,
                'promotional_price' => 120000,
                'button_text' => 'Conhecer',
                'button_url' => 'https://example.com/condominio',
                'is_active' => true,
            ]],
            'floor_plans' => [[
                'name' => 'Residência Tipo B',
                'area' => 210,
                'bedrooms' => 4,
                'bathrooms' => 2,
                'parking_spaces' => 2,
                'is_active' => true,
            ]],
        ];

        $this->actingAs($user)->post('/admin/condominiums', $createPayload)->assertRedirect();

        $condominium = Condominium::where('title', 'Condomínio completo')->firstOrFail();
        $this->assertNotEmpty($condominium->slug);
        $this->assertSame('Rua das Palmeiras, 1200 - Centro, Cascavel - PR', $condominium->address);
        $this->assertNull($condominium->starting_price);
        $this->assertNull($condominium->promotion_price);
        $this->assertNull($condominium->minimum_unit_area);
        $this->assertSame('Torres', $condominium->summary_facts[0]['label']);
        $this->assertSame('48', $condominium->summary_facts[1]['value']);
        $this->assertTrue($condominium->features->contains($feature));
        $this->assertDatabaseHas('condominium_promotions', ['condominium_id' => $condominium->id, 'title' => 'Condição especial', 'is_active' => true]);
        $this->assertDatabaseHas('floor_plans', ['owner_id' => $condominium->id, 'name' => 'Residência Tipo B', 'is_active' => true]);

        $updatePayload = [
            'title' => 'Condomínio completo',
            'slug' => $condominium->slug,
            'excerpt' => 'Resumo do empreendimento',
            'address' => 'Rua das Acácias, 88 - Jardim das Flores, Cascavel - PR',
            'address_number' => '88',
            'neighborhood' => 'Jardim das Flores',
            'postal_code' => '85801-100',
            'about_title' => 'Sobre o condomínio',
            'about_text' => 'Texto institucional.',
            'floor_plans_title' => 'Plantas disponíveis',
            'floor_plans_support_text' => 'Escolha a planta ideal.',
            'status' => 'published',
            'featured' => true,
            'price_on_request' => false,
            'feature_ids' => [$feature->id],
            'promotions' => [[
                'product_name' => 'Condomínio completo',
                'title' => 'Condição especial',
                'text' => 'Por tempo limitado.',
                'original_price' => 150000,
                'promotional_price' => 120000,
                'button_text' => 'Conhecer',
                'button_url' => 'https://example.com/condominio',
                'is_active' => true,
            ]],
            'floor_plans' => [[
                'name' => 'Residência Tipo B',
                'area' => 210,
                'bedrooms' => 4,
                'bathrooms' => 2,
                'parking_spaces' => 2,
                'is_active' => true,
            ]],
        ];

        $this->actingAs($user)->put(route('admin.condominiums.update', $condominium), $updatePayload)->assertRedirect();

        $condominium->refresh();
        $this->assertSame('Rua das Acácias, 88 - Jardim das Flores, Cascavel - PR', $condominium->address);
        $this->assertSame('88', $condominium->address_number);
        $this->assertSame('Jardim das Flores', $condominium->neighborhood);
        $this->assertSame('85801-100', $condominium->postal_code);

        $this->get(route('condominiums.show', $condominium))->assertOk();
    }
}
