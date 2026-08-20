<?php

namespace Tests\Feature;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\Faq;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCmsTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_open_every_main_admin_module(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);

        foreach (['/admin', '/admin/properties', '/admin/condominiums', '/admin/subdivisions', '/admin/pages', '/admin/blog/posts', '/admin/leads', '/admin/settings', '/admin/integrations', '/admin/users'] as $url) {
            $this->actingAs($user)->get($url)->assertOk();
        }
    }

    public function test_blog_post_creation_is_connected_to_public_blog(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $category = BlogCategory::create(['name' => 'Mercado', 'slug' => 'mercado']);

        $this->actingAs($user)->post('/admin/blog/posts', [
            'title' => 'Conteúdo funcional', 'slug' => 'conteudo-funcional', 'excerpt' => 'Resumo',
            'content' => 'Conteúdo completo', 'status' => 'published', 'category_ids' => [$category->id],
        ])->assertRedirect();

        $post = BlogPost::where('slug', 'conteudo-funcional')->firstOrFail();
        $this->assertTrue($post->categories->contains($category));
        $this->get('/blog/conteudo-funcional')->assertOk();
    }

    public function test_blog_post_can_be_published_with_an_automatic_unique_slug(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        BlogPost::create(['title' => 'Conteudo funcional', 'slug' => 'conteudo-funcional', 'content' => 'Anterior']);

        $this->actingAs($user)->post('/admin/blog/posts', [
            'title' => 'Conteudo funcional',
            'slug' => '',
            'content' => 'Nova postagem publicada',
            'status' => 'published',
        ])->assertRedirect();

        $post = BlogPost::where('slug', 'conteudo-funcional-2')->firstOrFail();
        $this->assertSame('published', $post->status);
        $this->assertNotNull($post->published_at);
        $this->get('/blog/conteudo-funcional-2')->assertOk();
    }

    public function test_scheduled_blog_post_is_not_public_before_its_date(): void
    {
        BlogPost::create([
            'title' => 'Conteudo futuro', 'slug' => 'conteudo-futuro', 'content' => 'Agendado',
            'status' => 'published', 'published_at' => now()->addDay(),
        ]);

        $this->get('/blog/conteudo-futuro')->assertNotFound();
        $this->get('/blog')->assertOk()->assertDontSee('Conteudo futuro');
    }

    public function test_property_form_persists_shared_content_used_by_public_detail(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);

        $this->actingAs($user)->post('/admin/properties', [
            'title' => 'Imóvel administrável', 'slug' => 'imovel-administravel', 'commercial_purpose' => 'sale',
            'status' => 'published', 'featured' => true, 'price_on_request' => false, 'furnished' => false,
            'accepts_financing' => true, 'accepts_exchange' => false, 'is_new' => true,
            'faqs' => [['question' => 'Está disponível?', 'answer' => 'Sim.']],
            'floor_plans' => [['name' => 'Planta principal', 'area' => 120]],
            'seo_title' => 'Título SEO do imóvel',
        ])->assertRedirect();

        $property = Property::where('slug', 'imovel-administravel')->firstOrFail();
        $this->assertSame('Título SEO do imóvel', $property->seo->title);
        $this->assertSame('Está disponível?', Faq::where('owner_id', $property->id)->value('question'));
        $this->get('/imoveis/imovel-administravel')->assertOk();
    }
}
