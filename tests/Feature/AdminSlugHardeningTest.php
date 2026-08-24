<?php

namespace Tests\Feature;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogTag;
use App\Models\Condominium;
use App\Models\Page;
use App\Models\Property;
use App\Models\Subdivision;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSlugHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_slugged_models_generate_unique_slugs_when_slug_is_empty_or_blank(): void
    {
        $realEstateCases = [
            [Property::class, ['title' => 'Casa do Sol', 'status' => 'draft', 'commercial_purpose' => 'sale'], 'casa-do-sol'],
            [Condominium::class, ['title' => 'Condominio Central', 'status' => 'draft', 'commercial_purpose' => 'sale'], 'condominio-central'],
            [Subdivision::class, ['title' => 'Loteamento Norte', 'status' => 'draft', 'commercial_purpose' => 'sale'], 'loteamento-norte'],
        ];

        foreach ($realEstateCases as [$model, $attributes, $expectedSlug]) {
            $first = $model::create([...$attributes, 'slug' => '']);
            $this->assertSame($expectedSlug, $first->slug);

            $second = $model::create([...$attributes, 'slug' => '   ']);
            $this->assertSame($expectedSlug.'-2', $second->slug);
        }

        $contentCases = [
            [Page::class, ['title' => 'Sobre Nos', 'template' => 'page', 'status' => 'draft'], 'sobre-nos'],
            [BlogPost::class, ['title' => 'Conteudo Funcional', 'content' => 'Texto', 'status' => 'draft'], 'conteudo-funcional'],
            [BlogCategory::class, ['name' => 'Mercado Imobiliario'], 'mercado-imobiliario'],
            [BlogTag::class, ['name' => 'Destaques Especiais'], 'destaques-especiais'],
        ];

        foreach ($contentCases as [$model, $attributes, $expectedSlug]) {
            $first = $model::create([...$attributes, 'slug' => '']);
            $this->assertSame($expectedSlug, $first->slug);

            $second = $model::create([...$attributes, 'slug' => '   ']);
            $this->assertSame($expectedSlug.'-2', $second->slug);
        }
    }

    public function test_existing_slugs_are_preserved_on_normal_admin_edits(): void
    {
        $admin = $this->adminUser();
        $property = Property::create([
            'title' => 'Casa do Sol',
            'slug' => 'casa-do-sol',
            'status' => 'draft',
            'commercial_purpose' => 'sale',
        ]);

        $this->actingAs($admin)->put('/admin/properties/'.$property->slug, [
            'title' => 'Casa do Sol Atualizada',
            'slug' => $property->slug,
            'status' => 'draft',
            'commercial_purpose' => 'sale',
        ])->assertRedirect(route('admin.properties.edit', $property));

        $this->assertSame('casa-do-sol', $property->fresh()->slug);
    }

    public function test_admin_edit_and_delete_urls_use_slug_route_binding_for_real_estate_entities(): void
    {
        $admin = $this->adminUser();

        $property = Property::create(['title' => 'Imovel A', 'slug' => '', 'status' => 'draft', 'commercial_purpose' => 'sale']);
        $condominium = Condominium::create(['title' => 'Condominio A', 'slug' => '', 'status' => 'draft', 'commercial_purpose' => 'sale']);
        $subdivision = Subdivision::create(['title' => 'Loteamento A', 'slug' => '', 'status' => 'draft', 'commercial_purpose' => 'sale']);

        $this->assertStringEndsWith('/admin/properties/'.$property->slug.'/edit', route('admin.properties.edit', $property));
        $this->assertStringEndsWith('/admin/condominiums/'.$condominium->slug.'/edit', route('admin.condominiums.edit', $condominium));
        $this->assertStringEndsWith('/admin/subdivisions/'.$subdivision->slug.'/edit', route('admin.subdivisions.edit', $subdivision));

        $this->actingAs($admin)->get(route('admin.properties.edit', $property))->assertOk();
        $this->actingAs($admin)->get(route('admin.condominiums.edit', $condominium))->assertOk();
        $this->actingAs($admin)->get(route('admin.subdivisions.edit', $subdivision))->assertOk();

        $this->actingAs($admin)->delete(route('admin.properties.destroy', $property))->assertRedirect(route('admin.properties.index'));
        $this->actingAs($admin)->delete(route('admin.condominiums.destroy', $condominium))->assertRedirect(route('admin.condominiums.index'));
        $this->actingAs($admin)->delete(route('admin.subdivisions.destroy', $subdivision))->assertRedirect(route('admin.subdivisions.index'));

        $this->assertSoftDeleted('properties', ['id' => $property->id]);
        $this->assertSoftDeleted('condominiums', ['id' => $condominium->id]);
        $this->assertSoftDeleted('subdivisions', ['id' => $subdivision->id]);
    }

    public function test_sitemap_uses_existing_named_routes_and_public_slugs(): void
    {
        $property = Property::create([
            'title' => 'Imovel Sitemap',
            'slug' => '',
            'status' => 'published',
            'published_at' => now()->subMinute(),
            'commercial_purpose' => 'sale',
        ]);
        $condominium = Condominium::create([
            'title' => 'Condominio Sitemap',
            'slug' => '',
            'status' => 'published',
            'published_at' => now()->subMinute(),
            'commercial_purpose' => 'sale',
        ]);
        $subdivision = Subdivision::create([
            'title' => 'Loteamento Sitemap',
            'slug' => '',
            'status' => 'published',
            'published_at' => now()->subMinute(),
            'commercial_purpose' => 'sale',
        ]);

        $response = $this->get('/sitemap.xml')->assertOk()->assertHeader('Content-Type', 'application/xml');
        $response->assertSee(route('properties.index'), false);
        $response->assertSee(route('condominiums.index'), false);
        $response->assertSee(route('subdivisions.index'), false);
        $response->assertSee(route('blog.index'), false);
        $response->assertSee(route('properties.show', $property), false);
        $response->assertSee(route('condominiums.show', $condominium), false);
        $response->assertSee(route('subdivisions.show', $subdivision), false);
    }

    private function adminUser(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }
}
