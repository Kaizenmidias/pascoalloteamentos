<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogTag;
use App\Models\Lead;
use App\Models\Page;
use App\Models\SiteSetting;
use App\Services\Media\MediaAssetService;
use App\Support\SafeRichHtml;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use App\Support\UniqueSlug;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CmsController extends Controller
{
    public function __construct(private readonly MediaAssetService $media) {}

    private const STRUCTURAL_PAGES = [
        ['title' => 'Home', 'slug' => 'home', 'template' => 'home', 'status' => 'published', 'path' => '/admin/pages/home', 'locked' => true],
        ['title' => 'Sobre nós', 'slug' => 'sobre-nos', 'template' => 'institutional', 'status' => 'published', 'path' => '/admin/pages/sobre-nos/edit', 'locked' => true],
        ['title' => 'CondomÃƒÂ­nios', 'slug' => 'condominios', 'template' => 'listing', 'status' => 'published', 'path' => '/admin/pages/condominios/edit', 'locked' => true],
        ['title' => 'Loteamentos', 'slug' => 'loteamentos', 'template' => 'listing', 'status' => 'published', 'path' => '/admin/pages/loteamentos/edit', 'locked' => true],
        ['title' => 'ImÃƒÂ³veis', 'slug' => 'imoveis', 'template' => 'listing', 'status' => 'published', 'path' => '/admin/pages/imoveis/edit', 'locked' => true],
        ['title' => 'Contato', 'slug' => 'contato', 'template' => 'contact', 'status' => 'published', 'path' => '/admin/pages/contato/edit', 'locked' => true],
        ['title' => 'PolÃƒÂ­tica de Privacidade', 'slug' => 'politica-de-privacidade', 'template' => 'page', 'status' => 'published', 'path' => '/admin/pages/politica-de-privacidade/edit', 'locked' => false],
    ];

    public function pages(): Response
    {
        foreach (self::STRUCTURAL_PAGES as $page) {
            $model = Page::firstOrCreate(
                ['slug' => $page['slug']],
                ['title' => $page['title'], 'template' => $page['template'], 'status' => $page['status'], 'published_at' => now()],
            );

            if ($model->sections()->doesntExist()) {
                foreach ($this->defaultSectionsFor($page['slug']) as $index => $section) {
                    $model->sections()->create([
                        'type' => $section['type'],
                        'data' => $section['data'],
                        'sort_order' => $index,
                        'is_active' => true,
                    ]);
                }
            }
        }

        $items = Page::withCount('sections')->latest()->get()->keyBy('slug');

        $pages = collect(self::STRUCTURAL_PAGES)->map(function (array $page) use ($items) {
            $item = $items->get($page['slug']);

            return [
                'id' => $item?->id ?? $page['slug'],
                'title' => $item?->title ?? $page['title'],
                'slug' => $item?->slug ?? $page['slug'],
                'template' => $item?->template ?? $page['template'],
                'status' => $item?->status ?? $page['status'],
                'sections_count' => $item?->sections_count ?? 0,
                'locked' => $page['locked'],
                'edit_url' => $page['slug'] === 'home'
                    ? $page['path']
                    : ($item ? '/admin/pages/' . $item->slug . '/edit' : $page['path']),
            ];
        })->values();

        $custom = $items->reject(fn (Page $page) => in_array($page->slug, array_column(self::STRUCTURAL_PAGES, 'slug'), true))->values()->map(fn (Page $page) => [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'template' => $page->template,
            'status' => $page->status,
            'sections_count' => $page->sections_count ?? 0,
            'locked' => false,
            'edit_url' => "/admin/pages/{$page->slug}/edit",
        ]);

        return Inertia::render('Admin/Pages/Index', ['items' => $pages->concat($custom)->values()]);
    }

    public function createPage(): Response
    {
        return Inertia::render('Admin/Pages/Form', ['item' => null]);
    }

    public function redirectHomeEditor(): RedirectResponse
    {
        return redirect()->route('admin.pages.home');
    }

    public function editPage(Page $page): Response|RedirectResponse
    {
        if ($page->slug === 'home') {
            return redirect()->route('admin.pages.home');
        }

        if ($page->sections()->doesntExist()) {
            foreach ($this->defaultSectionsFor($page->slug) as $index => $section) {
                $page->sections()->create([
                    'type' => $section['type'],
                    'data' => $section['data'],
                    'sort_order' => $index,
                    'is_active' => true,
                ]);
            }

            $page->load(['seo', 'sections']);
        }

        return Inertia::render('Admin/Pages/Form', ['item' => $page->load(['seo', 'sections'])]);
    }

    public function storePage(Request $request): RedirectResponse
    {
        $page = new Page();
        $this->savePage($request, $page);

        return redirect()->route('admin.pages.edit', $page)->with('success', 'PÃƒÂ¡gina criada.');
    }

    public function updatePage(Request $request, Page $page): RedirectResponse
    {
        if ($page->slug === 'home') {
            return redirect()->route('admin.pages.home');
        }

        $this->savePage($request, $page);

        return back()->with('success', 'PÃƒÂ¡gina atualizada.');
    }

    public function destroyPage(Page $page): RedirectResponse
    {
        if (in_array($page->slug, array_column(self::STRUCTURAL_PAGES, 'slug'), true)) {
            return back()->with('error', 'Esta ÃƒÂ© uma pÃƒÂ¡gina estrutural e nÃƒÂ£o pode ser excluÃƒÂ­da.');
        }

        $page->delete();

        return back()->with('success', 'PÃƒÂ¡gina movida para a lixeira.');
    }

    public function posts(): Response
    {
        return Inertia::render('Admin/Blog/Index', ['items' => BlogPost::with(['categories', 'author'])->latest()->paginate(20)]);
    }

    public function createPost(): Response
    {
        return Inertia::render('Admin/Blog/Form', ['item' => null, 'categories' => BlogCategory::orderBy('name')->get()]);
    }

    public function editPost(BlogPost $post): Response
    {
        return Inertia::render('Admin/Blog/Form', ['item' => $post->load(['categories', 'tags', 'featuredMedia', 'seo']), 'categories' => BlogCategory::orderBy('name')->get()]);
    }

    public function storePost(Request $request): RedirectResponse
    {
        $post = new BlogPost();
        $this->savePost($request, $post);

        return redirect()->route('admin.blog.posts.edit', $post)->with('success', 'Postagem criada.');
    }

    public function updatePost(Request $request, BlogPost $post): RedirectResponse
    {
        $this->savePost($request, $post);

        return back()->with('success', 'Postagem atualizada.');
    }

    public function destroyPost(BlogPost $post): RedirectResponse
    {
        $post->delete();

        return back()->with('success', 'Postagem movida para a lixeira.');
    }

    public function storeCategory(Request $request): RedirectResponse
    {
        $request->merge(['slug' => $request->filled('slug') ? Str::slug($request->input('slug')) : UniqueSlug::for('blog_categories', (string) $request->input('name'), fallback: 'categoria')]);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'alpha_dash:ascii', 'max:255', 'unique:blog_categories'],
        ]);

        BlogCategory::create($data);

        return back()->with('success', 'Categoria criada.');
    }

    public function categories(): Response
    {
        return Inertia::render('Admin/Blog/Categories', [
            'categories' => BlogCategory::query()->withCount('posts')->orderBy('name')->get(),
        ]);
    }

    public function updateCategory(Request $request, BlogCategory $category): RedirectResponse
    {
        $request->merge(['slug' => $request->filled('slug') ? Str::slug($request->input('slug')) : UniqueSlug::for('blog_categories', (string) $request->input('name'), $category->id, 'categoria')]);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'alpha_dash:ascii', 'max:255', Rule::unique('blog_categories')->ignore($category)],
        ]);
        $category->update($data);

        return back()->with('success', 'Categoria atualizada.');
    }

    public function destroyCategory(BlogCategory $category): RedirectResponse
    {
        if ($category->posts()->exists()) {
            return back()->with('error', 'A categoria possui posts relacionados e nao pode ser excluida.');
        }
        $category->delete();

        return back()->with('success', 'Categoria removida.');
    }

    public function leads(): Response
    {
        return Inertia::render('Admin/Leads/Index', ['items' => Lead::with(['property', 'condominium', 'subdivision'])->latest()->paginate(30)]);
    }

    public function updateLead(Request $request, Lead $lead): RedirectResponse
    {
        $lead->update($request->validate(['status' => ['required', Rule::in(['new', 'contacted', 'qualified', 'won', 'lost'])]]));

        return back()->with('success', 'Lead atualizado.');
    }

    public function settings(): Response
    {
        return Inertia::render('Admin/Settings', ['settings' => SiteSetting::whereNot('group', 'integrations')->get()->pluck('value', 'key')]);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'site_name' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:40',
            'whatsapp' => 'nullable|string|max:40',
            'address' => 'nullable|string|max:500',
            'instagram_url' => 'nullable|url|max:2048',
            'facebook_url' => 'nullable|url|max:2048',
        ]);

        foreach ($data as $key => $value) {
            SiteSetting::updateOrCreate(['key' => $key], ['group' => 'general', 'value' => $value, 'is_public' => true]);
        }

        return back()->with('success', 'ConfiguraÃƒÂ§ÃƒÂµes salvas.');
    }

    public function homeNumbers(): Response
    {
        $numbers = SiteSetting::query()->where('key', 'home_numbers')->first()?->value ?? $this->defaultHomeNumbers();

        return Inertia::render('Admin/Cms/HomeNumbers', ['numbers' => $numbers]);
    }

    public function home(): Response
    {
        $settings = SiteSetting::query()
            ->whereIn('key', ['home_hero', 'home_differentials', 'home_numbers'])
            ->get()
            ->keyBy('key')
            ->map(fn (SiteSetting $setting) => $setting->value);
        $homeHero = $settings->get('home_hero');
        $homeDifferentials = $settings->get('home_differentials');
        $homeNumbers = $settings->get('home_numbers');

        $homeHero = is_array($homeHero) && $homeHero !== [] ? $homeHero : null;
        $homeDifferentials = is_array($homeDifferentials) && $homeDifferentials !== [] ? $homeDifferentials : null;
        $homeNumbers = is_array($homeNumbers) && $homeNumbers !== [] ? $homeNumbers : null;

        return Inertia::render('Admin/Cms/Home', [
            'homeHero' => $homeHero ?? [
                'title' => 'Encontre o lugar onde sua próxima história começa.',
                'description' => 'Empreendimentos de alto padrão, condomínios e loteamentos planejados para viver melhor.',
                'slides' => [
                    ['image' => '/reference-assets/hero-home.jpg', 'title' => '', 'excerpt' => ''],
                ],
            ],
            'homeDifferentials' => $homeDifferentials ?? [
                [
                    'title' => 'Arquitetura autoral',
                    'text' => 'Projetos exclusivos desenvolvidos para unir estética, funcionalidade e conforto.',
                ],
                [
                    'title' => 'Localizações estratégicas',
                    'text' => 'Empreendimentos em regiões com alto potencial de valorização.',
                ],
                [
                    'title' => 'Sustentabilidade',
                    'text' => 'Práticas conscientes e soluções inteligentes para reduzir impactos ambientais.',
                ],
                [
                    'title' => 'Alto padrão construtivo',
                    'text' => 'Materiais selecionados e processos rigorosos para garantir qualidade.',
                ],
                [
                    'title' => 'Equipe especializada',
                    'text' => 'Profissionais experientes dedicados a entregar projetos com eficiência.',
                ],
                [
                    'title' => 'Atendimento personalizado',
                    'text' => 'Relacionamento próximo, transparente e focado em compreender cada cliente.',
                ],
            ],
            'homeNumbers' => $homeNumbers ?? $this->defaultHomeNumbers(),
        ]);
    }
    public function updateHome(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'home_hero.title' => ['required', 'string', 'max:255'],
            'home_hero.description' => ['required', 'string', 'max:1000'],
            'home_hero.slides' => ['required', 'array', 'min:1'],
            'home_hero.slides.*.image' => ['required', 'string', 'max:2048'],
            'home_hero.slides.*.title' => ['nullable', 'string', 'max:255'],
            'home_hero.slides.*.excerpt' => ['nullable', 'string', 'max:1000'],
            'home_differentials' => ['required', 'array', 'min:1'],
            'home_differentials.*.title' => ['required', 'string', 'max:255'],
            'home_differentials.*.text' => ['required', 'string', 'max:1000'],
            'home_numbers' => ['required', 'array', 'min:1'],
            'home_numbers.*.value' => ['required', 'string', 'max:30'],
            'home_numbers.*.title' => ['required', 'string', 'max:255'],
            'home_numbers.*.description' => ['nullable', 'string', 'max:255'],
        ]);

        SiteSetting::updateOrCreate(['key' => 'home_hero'], [
            'group' => 'home',
            'value' => $data['home_hero'],
            'is_public' => true,
        ]);

        SiteSetting::updateOrCreate(['key' => 'home_differentials'], [
            'group' => 'home',
            'value' => $data['home_differentials'],
            'is_public' => true,
        ]);

        SiteSetting::updateOrCreate(['key' => 'home_numbers'], [
            'group' => 'home',
            'value' => $this->normalizeHomeNumbers($data['home_numbers']),
            'is_public' => true,
        ]);

        return back()->with('success', 'Home atualizada.');
    }

    public function updateHomeNumbers(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'numbers' => ['required', 'array', 'min:1'],
            'numbers.*.value' => ['required', 'string', 'max:30'],
            'numbers.*.title' => ['required', 'string', 'max:255'],
            'numbers.*.description' => ['nullable', 'string', 'max:255'],
            'numbers.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'numbers.*.is_active' => ['nullable', 'boolean'],
        ]);

        $numbers = $this->normalizeHomeNumbers($data['numbers']);

        SiteSetting::updateOrCreate(['key' => 'home_numbers'], [
            'group' => 'home',
            'value' => $numbers,
            'is_public' => true,
        ]);

        return back()->with('success', 'NÃƒÂºmeros da Home atualizados.');
    }

    public function integrations(): Response
    {
        return Inertia::render('Admin/Integrations', ['settings' => SiteSetting::where('group', 'integrations')->get()->pluck('value', 'key')]);
    }

    public function updateIntegrations(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'google_analytics_id' => 'nullable|string|max:100',
            'google_tag_manager_id' => 'nullable|string|max:100',
            'meta_pixel_id' => 'nullable|string|max:100',
            'google_maps_key' => 'nullable|string|max:255',
            'recaptcha_site_key' => 'nullable|string|max:255',
            'custom_head_code' => 'nullable|string|max:20000',
        ]);

        foreach ($data as $key => $value) {
            SiteSetting::updateOrCreate(['key' => $key], ['group' => 'integrations', 'value' => $value, 'is_public' => false]);
        }

        return back()->with('success', 'IntegraÃƒÂ§ÃƒÂµes atualizadas.');
    }


    private function normalizeHomeNumbers(array $numbers): array
    {
        return array_values(array_map(function (array $item, int $index): array {
            return [
                'value' => trim((string) ($item['value'] ?? '')),
                'title' => trim((string) ($item['title'] ?? '')),
                'description' => trim((string) ($item['description'] ?? '')),
                'sort_order' => (int) ($item['sort_order'] ?? $index),
                'is_active' => (bool) ($item['is_active'] ?? true),
            ];
        }, $numbers, array_keys($numbers)));
    }

    private function savePage(Request $request, Page $page): void
    {
        if (! $request->filled('slug')) {
            $request->merge(['slug' => UniqueSlug::for('pages', (string) $request->input('title'), $page->id, 'pagina')]);
        }
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => ['nullable', 'alpha_dash:ascii', 'max:255', Rule::unique('pages')->ignore($page)],
            'content' => 'nullable|string',
            'template' => 'required|string|max:100',
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'sections' => ['nullable', 'array'],
            'sections.*.type' => ['required_with:sections', 'string', 'max:100'],
            'sections.*.label' => ['nullable', 'string', 'max:255'],
            'sections.*.title' => ['nullable', 'string', 'max:255'],
            'sections.*.subtitle' => ['nullable', 'string', 'max:255'],
            'sections.*.content' => ['nullable'],
            'sections.*.image' => ['nullable', 'string', 'max:2048'],
            'sections.*.button_label' => ['nullable', 'string', 'max:255'],
            'sections.*.button_url' => ['nullable', 'string', 'max:255'],
            'sections.*.recipient_email' => ['nullable', 'email', 'max:255'],
            'sections.*.layout' => ['nullable', 'string', 'max:100'],
            'sections.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'sections.*.is_active' => ['nullable', 'boolean'],
        ]);

        $sections = Arr::pull($data, 'sections', []);
        $seo = Arr::only($data, ['seo_title', 'seo_description']);
        unset($data['seo_title'], $data['seo_description']);

        if ($data['status'] === 'published' && ! $page->published_at) {
            $data['published_at'] = now();
        }

        $page->fill($data)->save();
        $page->sections()->delete();
        foreach (array_values($sections) as $index => $section) {
            $content = $section['content'] ?? null;
            if (in_array($section['type'] ?? 'content', ['numbers', 'institucional', 'contact-data', 'social', 'contact-form'], true) && is_string($content)) {
                $decoded = json_decode($content, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $content = $decoded;
                }
            }

            $page->sections()->create([
                'type' => (string) ($section['type'] ?? 'content'),
                'data' => [
                    'label' => $section['label'] ?? null,
                    'title' => $section['title'] ?? null,
                    'subtitle' => $section['subtitle'] ?? null,
                    'content' => $content,
                    'image' => $section['image'] ?? null,
                    'button_label' => $section['button_label'] ?? null,
                    'button_url' => $section['button_url'] ?? null,
                    'recipient_email' => $section['recipient_email'] ?? null,
                    'layout' => $section['layout'] ?? null,
                ],
                'sort_order' => (int) ($section['sort_order'] ?? $index),
                'is_active' => (bool) ($section['is_active'] ?? true),
            ]);
        }
        $page->seo()->updateOrCreate([], ['title' => $seo['seo_title'] ?? null, 'description' => $seo['seo_description'] ?? null]);
    }

    private function savePost(Request $request, BlogPost $post): void
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => ['nullable', 'alpha_dash:ascii', 'max:255', Rule::unique('blog_posts')->ignore($post)],
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'published_at' => 'nullable|date',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:blog_categories,id',
            'tags' => 'nullable|string|max:1000',
            'featured_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:12288',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
        ]);

        $categories = Arr::pull($data, 'category_ids', []);
        $tags = collect(explode(',', (string) Arr::pull($data, 'tags', '')))
            ->map(fn ($tag) => trim($tag))
            ->filter(fn ($tag) => $tag !== '' && Str::slug($tag) !== '')
            ->unique()
            ->take(30);
        $image = Arr::pull($data, 'featured_image');
        $seo = ['title' => Arr::pull($data, 'seo_title'), 'description' => Arr::pull($data, 'seo_description')];
        $data['content'] = SafeRichHtml::clean($data['content']);

        if (empty($data['slug'])) $data['slug'] = UniqueSlug::for('blog_posts', $data['title'], $post->id, 'postagem');

        if ($image) {
            $data['featured_media_id'] = $this->media->store($image, 'blog')->id;
        }

        $data['user_id'] ??= $request->user()->id;

        if ($data['status'] === 'published' && empty($data['published_at']) && ! $post->published_at) {
            $data['published_at'] = now();
        }

        $post->fill($data)->save();
        $post->categories()->sync($categories);
        $post->tags()->sync($tags->map(fn ($name) => BlogTag::firstOrCreate(['slug' => Str::slug($name)], ['name' => $name])->id));
        $post->seo()->updateOrCreate([], $seo);
    }

    private function defaultSectionsFor(string $slug): array
    {
        return match ($slug) {
            'home' => [
                ['type' => 'hero', 'data' => ['label' => 'InÃƒÂ­cio', 'title' => 'Encontre o lugar onde sua prÃƒÂ³xima histÃƒÂ³ria comeÃƒÂ§a.', 'subtitle' => 'Empreendimentos de alto padrÃƒÂ£o, condomÃƒÂ­nios e loteamentos planejados para viver melhor.', 'image' => '/reference-assets/hero-home.jpg']],
                ['type' => 'filter', 'data' => ['label' => 'Filtro de Empreendimentos', 'title' => 'Encontre o empreendimento ideal', 'subtitle' => 'Use os filtros abaixo para refinar a busca.', 'content' => 'Cidades, tipos e status jÃƒÂ¡ vÃƒÂªm da base de empreendimentos.']],
                ['type' => 'numbers', 'data' => ['label' => 'Nossos NÃƒÂºmeros', 'title' => 'Resultados que contam a nossa histÃƒÂ³ria', 'subtitle' => 'Indicadores institucionais da Pascoal.', 'content' => [['value' => '20+', 'title' => 'Anos de experiÃƒÂªncia', 'description' => 'de atuaÃƒÂ§ÃƒÂ£o no mercado.'], ['value' => '15+', 'title' => 'Empreendimentos', 'description' => 'entregues com excelÃƒÂªncia.'], ['value' => '2+', 'title' => 'Cidades', 'description' => 'com presenÃƒÂ§a consolidada.'], ['value' => '2', 'title' => 'Distritos', 'description' => 'atendidos pela empresa.']]]],
                ['type' => 'differentials', 'data' => ['label' => 'Diferenciais', 'title' => 'ExcelÃƒÂªncia em cada detalhe.', 'subtitle' => 'Projetos exclusivos pensados para unir qualidade, valorizaÃƒÂ§ÃƒÂ£o e bem-estar em cada detalhe.', 'content' => [['title' => 'Arquitetura autoral', 'text' => 'Projetos exclusivos desenvolvidos para unir estÃƒÂ©tica, funcionalidade e conforto.', 'image' => '/reference-assets/blog-city.jpg'], ['title' => 'LocalizaÃƒÂ§ÃƒÂµes estratÃƒÂ©gicas', 'text' => 'Empreendimentos em regiÃƒÂµes com alto potencial de valorizaÃƒÂ§ÃƒÂ£o.', 'image' => '/reference-assets/blog-city.jpg'], ['title' => 'Sustentabilidade', 'text' => 'PrÃƒÂ¡ticas conscientes e soluÃƒÂ§ÃƒÂµes inteligentes para reduzir impactos ambientais.', 'image' => '/reference-assets/blog-city.jpg']]]],
            ],
            'sobre-nos' => [
                ['type' => 'hero', 'data' => ['label' => 'Sobre nós', 'title' => 'Construindo cidades, realizando sonhos e deixando um legado para as próximas gerações.', 'subtitle' => 'Pascoal Loteamentos', 'image' => '/reference-assets/hero-home.jpg']],
                ['type' => 'history', 'data' => ['label' => 'Uma história', 'title' => 'Uma história construída com trabalho, confiança e visão de futuro.', 'content' => "A Pascoal Loteamentos nasceu em 2002, idealizada pelos irmãos Edson Pascoal e Hudson Paes Pascoal, com o propósito de desenvolver empreendimentos que transformam vidas e contribuem para o crescimento das cidades. Desde o início, cada projeto é conduzido com qualidade, planejamento e responsabilidade.\n\nAo longo de mais de 20 anos de atuação, a empresa consolidou sua presença na região, conquistando a confiança de clientes, investidores e parceiros por meio de um trabalho pautado na transparência, credibilidade e excelência em cada etapa do desenvolvimento imobiliário.\n\nHoje, seguimos construindo uma história sólida, desenvolvendo empreendimentos que geram oportunidades, valorização e qualidade de vida para milhares de famílias, sempre mantendo os valores que nos trouxeram até aqui e olhando para o futuro com a mesma dedicação do primeiro projeto.", 'image' => '/reference-assets/about-team.webp']],
                ['type' => 'numbers', 'data' => ['label' => 'Nossos números', 'content' => [['prefix' => '+', 'value' => '20', 'suffix' => 'anos', 'description' => 'de experiência no mercado.'], ['prefix' => '', 'value' => '2', 'suffix' => 'cidades', 'description' => 'com empreendimentos desenvolvidos.'], ['prefix' => '', 'value' => '2', 'suffix' => 'distritos', 'description' => 'atendidos.']]]],
                ['type' => 'purpose', 'data' => ['title' => 'Nosso Propósito', 'content' => "Mais do que desenvolver loteamentos, construímos oportunidades.\n\nSabemos que adquirir um terreno ou investir em um empreendimento é uma das decisões mais importantes da vida de uma família.\n\nPor isso, cada projeto nasce com planejamento, responsabilidade e uma visão de longo prazo, oferecendo infraestrutura completa e soluções que promovem qualidade de vida, segurança e valorização patrimonial.\n\nNosso compromisso é entregar muito mais do que um espaço urbano: queremos contribuir para que pessoas construam histórias, conquistem patrimônio e realizem sonhos.", 'image' => '/reference-assets/about-purpose.webp']],
                ['type' => 'mission', 'data' => ['title' => 'Missão', 'content' => 'Desenvolver empreendimentos planejados com qualidade, segurança e infraestrutura completa, proporcionando valorização, bem-estar e qualidade de vida aos nossos clientes.', 'image' => '/reference-assets/blog-city.jpg']],
                ['type' => 'vision', 'data' => ['title' => 'Visão', 'content' => 'Ser referência em loteamentos e empreendimentos imobiliários no Oeste do Paraná, reconhecida pela excelência, credibilidade e desenvolvimento sustentável.', 'image' => '/reference-assets/about-plans.jpg']],
                ['type' => 'values', 'data' => ['title' => 'Valores', 'content' => 'Nossos valores se refletem no compromisso com a qualidade, no respeito às pessoas, na transparência das relações e na responsabilidade em cada empreendimento que desenvolvemos.', 'image' => '/reference-assets/about-meeting.jpg']],
                ['type' => 'differential', 'data' => ['title' => 'Nosso Diferencial', 'content' => "Cada empreendimento é desenvolvido pensando no futuro.\n\nDesde a escolha da localização até a entrega da infraestrutura, cada etapa é conduzida por uma equipe comprometida com a qualidade, segurança e valorização do investimento de nossos clientes.\n\nAcreditamos que bons empreendimentos não apenas transformam terrenos, mas impulsionam o crescimento urbano, movimentam a economia local e melhoram a qualidade de vida das pessoas.\n\nÉ essa visão que nos motiva diariamente a desenvolver projetos que deixem um legado positivo para as próximas gerações.", 'image' => '/reference-assets/about-team.webp']],
                ['type' => 'cta', 'data' => ['title' => 'Vamos construir o próximo capítulo dessa história juntos.', 'content' => 'Se você procura um loteamento para morar, investir ou desenvolver seu patrimônio com segurança, conte com a experiência e a credibilidade da Pascoal Loteamentos.', 'button_label' => 'Conheça nossos empreendimentos', 'button_url' => '/imoveis']],
            ],
            'contato' => [
                ['type' => 'hero', 'data' => ['label' => 'Contato', 'title' => 'Estamos prontos para ajudar vocÃƒÂª a encontrar o empreendimento ideal.', 'subtitle' => 'Fale com nossa equipe', 'content' => 'Nossa equipe estÃƒÂ¡ ÃƒÂ  disposiÃƒÂ§ÃƒÂ£o para esclarecer dÃƒÂºvidas, apresentar oportunidades e oferecer o suporte necessÃƒÂ¡rio.', 'image' => '/reference-assets/hero-contact.webp']],
                ['type' => 'contact-data', 'data' => ['label' => 'Dados de contato', 'content' => [['EscritÃƒÂ³rio administrativo', "Av. Ministro Cirne Lima, nÃ‚Âº 3951\nJardim Coopagro\nToledo - PR\nCEP 85904-460"], ['Telefones', "Telefone Comercial\n(45) 3252-7023\n\nPlantÃƒÂ£o de Vendas\n(45) 9 9111-9653"], ['E-mail', 'contato@pascoalloteamentos.com.br']]]],
                ['type' => 'contact-form', 'data' => ['label' => 'Formulário', 'title' => 'Fale com Nossa Equipe', 'subtitle' => 'Estamos disponíveis para atender você.', 'content' => 'Preencha o formulário abaixo e nossa equipe entrará em contato o mais breve possível para esclarecer suas dúvidas ou apresentar as melhores oportunidades disponíveis.', 'button_label' => 'Enviar mensagem', 'recipient_email' => 'contato@pascoalloteamentos.com.br']],
                ['type' => 'social', 'data' => ['label' => 'Redes sociais', 'content' => [['Instagram', 'https://instagram.com'], ['Facebook', 'https://facebook.com']]]],
            ],
            default => in_array($slug, ['condominios', 'loteamentos', 'imoveis'], true) ? [
                ['type' => 'hero', 'data' => ['label' => ucfirst(str_replace('-', ' ', $slug)), 'title' => 'ConteÃƒÂºdo da listagem', 'subtitle' => 'Texto introdutÃƒÂ³rio da pÃƒÂ¡gina.', 'content' => 'Use esta ÃƒÂ¡rea para editar o cabeÃƒÂ§alho e o texto de apresentaÃƒÂ§ÃƒÂ£o.', 'image' => '/reference-assets/hero-home.jpg']],
                ['type' => 'filter', 'data' => ['label' => 'Filtro', 'title' => 'Filtrar empreendimentos', 'subtitle' => 'Ajuste apenas textos auxiliares e mensagens.', 'content' => 'As opÃƒÂ§ÃƒÂµes de filtro continuam vindo da base de dados.']],
            ] : [],
        };
    }
}
