<?php

namespace Tests\Feature;

use App\Http\Controllers\Admin\CmsController;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\Faq;
use App\Models\MediaAsset;
use App\Models\Property;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
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

    public function test_home_cms_can_update_home_numbers_and_public_home_uses_them(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);

        $payload = [
            'home_hero' => [
                'title' => 'Hero institucional',
                'description' => 'Descrição da home.',
                'slides' => [
                    ['image' => '/reference-assets/hero-home.jpg', 'title' => '', 'excerpt' => ''],
                ],
            ],
            'home_differentials' => [
                ['title' => 'Diferencial 1', 'text' => 'Texto do diferencial.'],
            ],
            'home_numbers' => [
                ['value' => '21+', 'title' => 'Anos de experiência', 'description' => 'Em atuação.'],
                ['value' => '16+', 'title' => 'Empreendimentos', 'description' => 'Entregues.'],
                ['value' => '3+', 'title' => 'Cidades', 'description' => 'Atendidas.'],
                ['value' => '5', 'title' => 'Distritos', 'description' => 'Atendidos.'],
            ],
        ];

        $this->actingAs($user)->put('/admin/pages/home', $payload)->assertRedirect();

        $saved = SiteSetting::where('key', 'home_numbers')->firstOrFail()->value;
        $this->assertSame('21+', $saved[0]['value']);
        $this->assertSame('16+', $saved[1]['value']);
        $this->assertSame('3+', $saved[2]['value']);
        $this->assertSame('5', $saved[3]['value']);

        $this->actingAs($user)->get('/admin/pages/home')->assertOk()->assertSee('21+');
        $this->get('/')->assertOk()->assertSee('21+');
    }

    public function test_home_structural_page_uses_dedicated_editor_route(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);

        $this->actingAs($user)->get('/admin/pages')->assertOk()->assertSee('/admin/pages/home');
        $this->actingAs($user)->get('/admin/pages/home/edit')->assertRedirect('/admin/pages/home');
        $this->actingAs($user)->get('/admin/pages/home')->assertOk()->assertSee('Admin/Cms/Home');
    }

    public function test_home_editor_uses_safe_defaults_for_legacy_settings(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        SiteSetting::create(['key' => 'home_hero', 'group' => 'home', 'value' => null, 'is_public' => true]);
        SiteSetting::create(['key' => 'home_differentials', 'group' => 'home', 'value' => 'legacy', 'is_public' => true]);
        SiteSetting::create(['key' => 'home_numbers', 'group' => 'home', 'value' => [], 'is_public' => true]);

        $this->actingAs($user)
            ->get('/admin/pages/home')
            ->assertOk()
            ->assertSee('Admin/Cms/Home')
            ->assertSee('Encontre o lugar onde sua próxima história começa.');
    }

    public function test_other_structural_pages_still_use_generic_editor(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $this->actingAs($user)->get('/admin/pages')->assertOk();

        foreach (['sobre-nos', 'condominios', 'loteamentos', 'imoveis', 'contato'] as $slug) {
            $this->actingAs($user)
                ->get('/admin/pages/'.$slug.'/edit')
                ->assertOk()
                ->assertSee('Admin/Pages/Form');
        }
    }

    public function test_home_routes_match_only_the_dedicated_controller_methods(): void
    {
        $routes = app('router')->getRoutes();
        $cases = [
            ['GET', '/admin/pages/home', 'home'],
            ['GET', '/admin/pages/home/edit', 'redirectHomeEditor'],
            ['PUT', '/admin/pages/home', 'updateHome'],
            ['PATCH', '/admin/pages/home', 'updateHome'],
        ];

        foreach ($cases as [$method, $uri, $action]) {
            $route = $routes->match(Request::create($uri, $method));

            $this->assertSame(CmsController::class.'@'.$action, $route->getActionName());
            $this->assertNull($route->parameter('page'));
        }
    }

    public function test_home_carousel_persists_media_order_and_hides_inactive_slides_publicly(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $first = MediaAsset::create(['disk' => 'external', 'path' => 'https://example.com/primeiro.jpg', 'mime_type' => 'image/jpeg']);
        $second = MediaAsset::create(['disk' => 'external', 'path' => 'https://example.com/segundo.jpg', 'mime_type' => 'image/jpeg']);
        $inactive = MediaAsset::create(['disk' => 'external', 'path' => 'https://example.com/inativo.jpg', 'mime_type' => 'image/jpeg']);

        $payload = [
            'home_hero' => [
                'title' => 'Home administrável',
                'description' => 'Descrição administrável.',
                'slides' => [
                    ['media_id' => $second->id, 'image' => '', 'title' => 'Segundo', 'excerpt' => '', 'button_text' => '', 'button_url' => '', 'sort_order' => 2, 'is_active' => true],
                    ['media_id' => $inactive->id, 'image' => '', 'title' => 'Inativo', 'excerpt' => '', 'button_text' => '', 'button_url' => '', 'sort_order' => 3, 'is_active' => false],
                    ['media_id' => $first->id, 'image' => '', 'title' => 'Primeiro', 'excerpt' => '', 'button_text' => 'Conheça', 'button_url' => '/loteamentos', 'sort_order' => 1, 'is_active' => true],
                ],
            ],
            'home_differentials' => [['title' => 'Qualidade', 'text' => 'Em cada detalhe.']],
            'home_numbers' => [
                ['value' => '20+', 'title' => 'Anos', 'description' => 'de experiência.'],
                ['value' => '15+', 'title' => 'Projetos', 'description' => 'entregues.'],
                ['value' => '2+', 'title' => 'Cidades', 'description' => 'atendidas.'],
                ['value' => '2', 'title' => 'Distritos', 'description' => 'atendidos.'],
            ],
        ];

        $this->actingAs($user)->put('/admin/pages/home', $payload)->assertRedirect();

        $hero = SiteSetting::where('key', 'home_hero')->firstOrFail()->value;
        $this->assertSame(['Primeiro', 'Segundo', 'Inativo'], array_column($hero['slides'], 'title'));
        $this->assertSame($first->id, $hero['slides'][0]['media_id']);
        $this->assertSame('https://example.com/primeiro.jpg', $hero['slides'][0]['image']);

        $this->get('/')
            ->assertOk()
            ->assertSee('https://example.com/primeiro.jpg')
            ->assertSee('https://example.com/segundo.jpg')
            ->assertDontSee('https://example.com/inativo.jpg');
    }

    public function test_home_editor_normalizes_json_string_legacy_carousel(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        SiteSetting::create([
            'key' => 'home_hero',
            'group' => 'home',
            'value' => json_encode([
                'title' => 'Hero legado',
                'slides' => [['url' => '/reference-assets/hero-home.jpg', 'subtitle' => 'Chamada antiga']],
            ]),
            'is_public' => true,
        ]);

        $this->actingAs($user)
            ->get('/admin/pages/home')
            ->assertOk()
            ->assertSee('Hero legado')
            ->assertSee('/reference-assets/hero-home.jpg')
            ->assertSee('Chamada antiga');
    }
}
