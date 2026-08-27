<?php

namespace Tests\Feature;

use App\Models\Condominium;
use App\Models\Lead;
use App\Models\Property;
use App\Models\Subdivision;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminLeadsCrmTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_leads_page_exposes_kanban_ready_payload_without_sell_your_property_leads(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $property = Property::create(['title' => 'Residencial Aurora', 'slug' => 'residencial-aurora', 'commercial_purpose' => 'sale', 'status' => 'published']);
        $condominium = Condominium::create(['title' => 'Condomínio Horizonte', 'slug' => 'condominio-horizonte', 'status' => 'published']);
        $subdivision = Subdivision::create(['title' => 'Loteamento Vale', 'slug' => 'loteamento-vale', 'commercial_purpose' => 'sale', 'status' => 'published']);

        Lead::create(['name' => 'Maria Imóvel', 'email' => 'maria-imovel@example.com', 'phone' => '(45) 98888-1111', 'message' => '<p>Olá, quero saber mais.</p>', 'status' => 'new', 'property_id' => $property->id, 'metadata' => ['source_type' => 'property', 'source_label' => 'Imóvel', 'product_name' => $property->title]]);
        Lead::create(['name' => 'Maria Condomínio', 'email' => 'maria@example.com', 'phone' => '(45) 99999-1111', 'message' => '<p>Olá, quero saber mais.</p>', 'status' => 'contacted', 'condominium_id' => $condominium->id, 'metadata' => ['source_type' => 'condominium', 'source_label' => 'Condomínio', 'product_name' => $condominium->title]]);
        Lead::create(['name' => 'Maria Loteamento', 'email' => 'maria-loteamento@example.com', 'phone' => '(45) 97777-2222', 'message' => 'Gostaria de mais detalhes.', 'status' => 'qualified', 'subdivision_id' => $subdivision->id, 'metadata' => ['source_type' => 'subdivision', 'source_label' => 'Loteamento', 'product_name' => $subdivision->title]]);
        Lead::create(['name' => 'João Venda', 'email' => 'joao@example.com', 'phone' => '(45) 98888-2222', 'message' => 'Tenho interesse em anunciar.', 'status' => 'new', 'source_url' => '/venda-seu-imovel', 'metadata' => ['source_type' => 'contact', 'source_label' => 'Venda seu Imóvel']]);

        $this->actingAs($user)
            ->get('/admin/leads')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Leads/Index')
                ->has('items', 3)
                ->where('items', function (array $items) use ($property, $condominium, $subdivision) {
                    $collection = collect($items);

                    return $collection->doesntContain(fn (array $item) => ($item['lead_type'] ?? null) === 'sell')
                        && $collection->contains(fn (array $item) => $item['origin_label'] === 'Site - Interesse no Condomínio' && $item['entity_title'] === $condominium->title && $item['entity_url'] === '/admin/condominiums/'.$condominium->slug.'/edit')
                        && $collection->contains(fn (array $item) => $item['origin_label'] === 'Site - Interesse no Imóvel' && $item['entity_title'] === $property->title && $item['entity_url'] === '/admin/properties/'.$property->slug.'/edit')
                        && $collection->contains(fn (array $item) => $item['origin_label'] === 'Site - Interesse no Loteamento' && $item['entity_title'] === $subdivision->title && $item['entity_url'] === '/admin/subdivisions/'.$subdivision->slug.'/edit');
                })
            );
    }

    public function test_admin_can_update_lead_status_and_next_contact(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $lead = Lead::create(['name' => 'Lead A', 'email' => 'lead@example.com', 'phone' => '(45) 99999-3333', 'message' => 'Contato inicial', 'status' => 'new']);

        $this->actingAs($user)->patch('/admin/leads/'.$lead->id, ['status' => 'contacted', 'next_contact_at' => '2026-08-27T15:30'])->assertRedirect();

        $lead->refresh();
        $this->assertSame('contacted', $lead->status);
        $this->assertSame('2026-08-27 15:30:00', $lead->next_contact_at?->format('Y-m-d H:i:s'));
    }

    public function test_drag_drop_status_endpoint_updates_only_status(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $lead = Lead::create(['name' => 'Lead B', 'email' => 'leadb@example.com', 'phone' => '(45) 98888-4444', 'message' => 'Contato inicial', 'status' => 'new']);

        $this->actingAs($user)->patch('/admin/leads/'.$lead->id.'/status', ['status' => 'qualified'])->assertRedirect();

        $lead->refresh();
        $this->assertSame('qualified', $lead->status);
        $this->assertNull($lead->next_contact_at);
    }
}