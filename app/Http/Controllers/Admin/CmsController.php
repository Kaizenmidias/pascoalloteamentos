<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\Lead;
use App\Models\Page;
use App\Models\SiteSetting;
use App\Services\Media\MediaAssetService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CmsController extends Controller
{
    public function __construct(private readonly MediaAssetService $media) {}

    private const STRUCTURAL_PAGES = [
        ['title' => 'Home', 'slug' => 'home', 'template' => 'home', 'status' => 'published', 'path' => '/admin/pages/home', 'locked' => true],
        ['title' => 'Sobre nÃ³s', 'slug' => 'sobre-nos', 'template' => 'institutional', 'status' => 'published', 'path' => '/admin/pages/sobre-nos/edit', 'locked' => true],
        ['title' => 'CondomÃ­nios', 'slug' => 'condominios', 'template' => 'listing', 'status' => 'published', 'path' => '/admin/pages/condominios/edit', 'locked' => true],
        ['title' => 'Loteamentos', 'slug' => 'loteamentos', 'template' => 'listing', 'status' => 'published', 'path' => '/admin/pages/loteamentos/edit', 'locked' => true],
        ['title' => 'ImÃ³veis', 'slug' => 'imoveis', 'template' => 'listing', 'status' => 'published', 'path' => '/admin/pages/imoveis/edit', 'locked' => true],
        ['title' => 'Contato', 'slug' => 'contato', 'template' => 'contact', 'status' => 'published', 'path' => '/admin/pages/contato/edit', 'locked' => true],
        ['title' => 'PolÃ­tica de Privacidade', 'slug' => 'politica-de-privacidade', 'template' => 'page', 'status' => 'published', 'path' => '/admin/pages/politica-de-privacidade/edit', 'locked' => false],
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
                'edit_url' => $item ? "/admin/pages/{$item->slug}/edit" : $page['path'],
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

    public function editPage(Page $page): Response
    {
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

        return redirect()->route('admin.pages.edit', $page)->with('success', 'PÃ¡gina criada.');
    }

    public function updatePage(Request $request, Page $page): RedirectResponse
    {
        $this->savePage($request, $page);

        return back()->with('success', 'PÃ¡gina atualizada.');
    }

    public function destroyPage(Page $page): RedirectResponse
    {
        if (in_array($page->slug, array_column(self::STRUCTURAL_PAGES, 'slug'), true)) {
            return back()->with('error', 'Esta Ã© uma pÃ¡gina estrutural e nÃ£o pode ser excluÃ­da.');
        }

        $page->delete();

        return back()->with('success', 'PÃ¡gina movida para a lixeira.');
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
        return Inertia::render('Admin/Blog/Form', ['item' => $post->load(['categories', 'featuredMedia', 'seo']), 'categories' => BlogCategory::orderBy('name')->get()]);
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
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'alpha_dash:ascii', 'max:255', 'unique:blog_categories'],
        ]);

        BlogCategory::create(['name' => $data['name'], 'slug' => $data['slug'] ?: Str::slug($data['name'])]);

        return back()->with('success', 'Categoria criada.');
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

        return back()->with('success', 'ConfiguraÃ§Ãµes salvas.');
    }

    public function homeNumbers(): Response
    {
        $numbers = SiteSetting::query()->where('key', 'home_numbers')->value('value') ?? [];

        return Inertia::render('Admin/Cms/HomeNumbers', ['numbers' => $numbers]);
    }

    public function home(): Response
    {
        $settings = SiteSetting::query()
            ->whereIn('key', ['home_hero', 'home_differentials'])
            ->get()
            ->keyBy('key')
            ->map(fn (SiteSetting $setting) => $setting->value);

        return Inertia::render('Admin/Cms/Home', [
            'homeHero' => $settings['home_hero'] ?? [
                'title' => 'Encontre o lugar onde sua prÃ³xima histÃ³ria comeÃ§a.',
                'description' => 'Empreendimentos de alto padrÃ£o, condomÃ­nios e loteamentos planejados para viver melhor.',
                'slides' => [
                    ['image' => '/reference-assets/hero-home.jpg', 'title' => '', 'excerpt' => ''],
                ],
            ],
            'homeDifferentials' => $settings['home_differentials'] ?? [
                [
                    'title' => 'Arquitetura autoral',
                    'text' => 'Projetos exclusivos desenvolvidos para unir estÃ©tica, funcionalidade e conforto.',
                ],
                [
                    'title' => 'LocalizaÃ§Ãµes estratÃ©gicas',
                    'text' => 'Empreendimentos em regiÃµes com alto potencial de valorizaÃ§Ã£o.',
                ],
                [
                    'title' => 'Sustentabilidade',
                    'text' => 'PrÃ¡ticas conscientes e soluÃ§Ãµes inteligentes para reduzir impactos ambientais.',
                ],
                [
                    'title' => 'Alto padrÃ£o construtivo',
                    'text' => 'Materiais selecionados e processos rigorosos para garantir qualidade.',
                ],
                [
                    'title' => 'Equipe especializada',
                    'text' => 'Profissionais experientes dedicados a entregar projetos com eficiÃªncia.',
                ],
                [
                    'title' => 'Atendimento personalizado',
                    'text' => 'Relacionamento prÃ³ximo, transparente e focado em compreender cada cliente.',
                ],
            ],
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

        $numbers = array_values(array_map(function (array $item, int $index): array {
            return [
                'value' => (string) ($item['value'] ?? ''),
                'title' => (string) ($item['title'] ?? ''),
                'description' => (string) ($item['description'] ?? ''),
                'sort_order' => (int) ($item['sort_order'] ?? $index),
                'is_active' => (bool) ($item['is_active'] ?? true),
            ];
        }, $data['numbers'], array_keys($data['numbers'])));

        SiteSetting::updateOrCreate(['key' => 'home_numbers'], [
            'group' => 'home',
            'value' => $numbers,
            'is_public' => true,
        ]);

        return back()->with('success', 'NÃºmeros da Home atualizados.');
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

        return back()->with('success', 'IntegraÃ§Ãµes atualizadas.');
    }

    private function savePage(Request $request, Page $page): void
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => ['required', 'alpha_dash:ascii', 'max:255', Rule::unique('pages')->ignore($page)],
            'content' => 'nullable|string',
            'template' => 'required|string|max:100',
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'sections' => ['nullable', 'array'],
            'sections.*.type' => ['required_with:sections', 'string', 'max:100'],
            'sections.*.title' => ['nullable', 'string', 'max:255'],
            'sections.*.subtitle' => ['nullable', 'string', 'max:255'],
            'sections.*.content' => ['nullable', 'string'],
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
            if (in_array($section['type'] ?? 'content', ['institucional', 'contact-data', 'social', 'contact-form'], true) && is_string($content)) {
                $decoded = json_decode($content, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $content = $decoded;
                }
            }

            $page->sections()->create([
                'type' => (string) ($section['type'] ?? 'content'),
                'data' => [
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
            'slug' => ['required', 'alpha_dash:ascii', 'max:255', Rule::unique('blog_posts')->ignore($post)],
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'published_at' => 'nullable|date',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:blog_categories,id',
            'featured_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:12288',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
        ]);

        $categories = Arr::pull($data, 'category_ids', []);
        $image = Arr::pull($data, 'featured_image');
        $seo = ['title' => Arr::pull($data, 'seo_title'), 'description' => Arr::pull($data, 'seo_description')];

        if ($image) {
            $data['featured_media_id'] = $this->media->store($image, 'blog')->id;
        }

        $data['user_id'] ??= $request->user()->id;

        if ($data['status'] === 'published' && empty($data['published_at']) && ! $post->published_at) {
            $data['published_at'] = now();
        }

        $post->fill($data)->save();
        $post->categories()->sync($categories);
        $post->seo()->updateOrCreate([], $seo);
    }

    private function defaultSectionsFor(string $slug): array
    {
        return match ($slug) {
            'home' => [
                ['type' => 'hero', 'data' => ['label' => 'InÃ­cio', 'title' => 'Encontre o lugar onde sua prÃ³xima histÃ³ria comeÃ§a.', 'subtitle' => 'Empreendimentos de alto padrÃ£o, condomÃ­nios e loteamentos planejados para viver melhor.', 'image' => '/reference-assets/hero-home.jpg']],
                ['type' => 'filter', 'data' => ['label' => 'Filtro de Empreendimentos', 'title' => 'Encontre o empreendimento ideal', 'subtitle' => 'Use os filtros abaixo para refinar a busca.', 'content' => 'Cidades, tipos e status jÃ¡ vÃªm da base de empreendimentos.']],
                ['type' => 'numbers', 'data' => ['label' => 'Nossos NÃºmeros', 'title' => 'Resultados que contam a nossa histÃ³ria', 'subtitle' => 'Indicadores institucionais da Pascoal.', 'content' => [['value' => '20+', 'title' => 'Anos de experiÃªncia', 'description' => 'de atuaÃ§Ã£o no mercado.'], ['value' => '15+', 'title' => 'Empreendimentos', 'description' => 'entregues com excelÃªncia.'], ['value' => '2+', 'title' => 'Cidades', 'description' => 'com presenÃ§a consolidada.'], ['value' => '2', 'title' => 'Distritos', 'description' => 'atendidos pela empresa.']]]],
                ['type' => 'differentials', 'data' => ['label' => 'Diferenciais', 'title' => 'ExcelÃªncia em cada detalhe.', 'subtitle' => 'Projetos exclusivos pensados para unir qualidade, valorizaÃ§Ã£o e bem-estar em cada detalhe.', 'content' => [['title' => 'Arquitetura autoral', 'text' => 'Projetos exclusivos desenvolvidos para unir estÃ©tica, funcionalidade e conforto.', 'image' => '/reference-assets/blog-city.jpg'], ['title' => 'LocalizaÃ§Ãµes estratÃ©gicas', 'text' => 'Empreendimentos em regiÃµes com alto potencial de valorizaÃ§Ã£o.', 'image' => '/reference-assets/blog-city.jpg'], ['title' => 'Sustentabilidade', 'text' => 'PrÃ¡ticas conscientes e soluÃ§Ãµes inteligentes para reduzir impactos ambientais.', 'image' => '/reference-assets/blog-city.jpg']]]],
            ],
            'sobre-nos' => [
                ['type' => 'hero', 'data' => ['label' => 'Sobre nÃ³s', 'title' => 'Construindo cidades, realizando sonhos e deixando um legado para as prÃ³ximas geraÃ§Ãµes.', 'subtitle' => 'Pascoal Loteamentos', 'image' => '/reference-assets/hero-home.jpg']],
                ['type' => 'history', 'data' => ['label' => 'Uma histÃ³ria', 'title' => 'Uma histÃ³ria construÃ­da com trabalho, confianÃ§a e visÃ£o de futuro.', 'content' => "A Pascoal Loteamentos nasceu em 2002, idealizada pelos irmÃ£os Edson Pascoal e Hudson Paes Pascoal, com o propÃ³sito de desenvolver empreendimentos que transformam vidas e contribuem para o crescimento das cidades.\n\nAo longo de mais de 20 anos de atuaÃ§Ã£o, a empresa consolidou sua presenÃ§a na regiÃ£o, conquistando a confianÃ§a de clientes, investidores e parceiros por meio de um trabalho pautado na transparÃªncia, credibilidade e excelÃªncia.", 'image' => '/reference-assets/about-team.webp']],
                ['type' => 'history', 'data' => ['label' => 'Crescimento', 'title' => 'Crescimento que gera desenvolvimento', 'content' => "O compromisso com a qualidade fez da Pascoal uma referÃªncia regional no desenvolvimento de loteamentos e empreendimentos imobiliÃ¡rios. Nossa atuaÃ§Ã£o jÃ¡ contribuiu para a expansÃ£o urbana de diversas regiÃµes.\n\nCada empreendimento Ã© pensado para oferecer seguranÃ§a, infraestrutura completa, excelente localizaÃ§Ã£o e potencial de valorizaÃ§Ã£o.", 'image' => '/reference-assets/about-engineer.webp']],
                ['type' => 'numbers', 'data' => ['label' => 'Nossos nÃºmeros', 'title' => 'Resultados que reforÃ§am nossa trajetÃ³ria', 'content' => [['value' => '+20', 'title' => 'Anos de experiÃªncia', 'description' => 'de atuaÃ§Ã£o no mercado.'], ['value' => '2', 'title' => 'Cidades', 'description' => 'com empreendimentos desenvolvidos.'], ['value' => '2', 'title' => 'Distritos', 'description' => 'atendidos.']]]],
                ['type' => 'content', 'data' => ['label' => 'Nosso propÃ³sito', 'title' => 'Nosso PropÃ³sito', 'content' => "Mais do que desenvolver loteamentos, construÃ­mos oportunidades. Sabemos que adquirir um terreno ou investir em um empreendimento Ã© uma das decisÃµes mais importantes da vida de uma famÃ­lia.\n\nPor isso, cada projeto nasce com planejamento, responsabilidade e uma visÃ£o de longo prazo.", 'image' => '/reference-assets/about-purpose.webp']],
                ['type' => 'mission', 'data' => ['label' => 'MissÃ£o', 'title' => 'MissÃ£o', 'content' => 'Desenvolver empreendimentos planejados com qualidade, seguranÃ§a e infraestrutura completa, proporcionando valorizaÃ§Ã£o, bem-estar e qualidade de vida aos nossos clientes.', 'image' => '/reference-assets/blog-city.jpg']],
                ['type' => 'vision', 'data' => ['label' => 'VisÃ£o', 'title' => 'VisÃ£o', 'content' => 'Ser referÃªncia em loteamentos e empreendimentos imobiliÃ¡rios no Oeste do ParanÃ¡, reconhecida pela excelÃªncia, credibilidade e desenvolvimento sustentÃ¡vel.', 'image' => '/reference-assets/about-plans.jpg']],
                ['type' => 'values', 'data' => ['label' => 'Valores', 'title' => 'Valores', 'content' => 'Nossos valores se refletem no compromisso com a qualidade, no respeito Ã s pessoas, na transparÃªncia das relaÃ§Ãµes e na responsabilidade em cada empreendimento que desenvolvemos.', 'image' => '/reference-assets/about-meeting.jpg']],
            ],
            'contato' => [
                ['type' => 'hero', 'data' => ['label' => 'Contato', 'title' => 'Estamos prontos para ajudar vocÃª a encontrar o empreendimento ideal.', 'subtitle' => 'Fale com nossa equipe', 'content' => 'Nossa equipe estÃ¡ Ã  disposiÃ§Ã£o para esclarecer dÃºvidas, apresentar oportunidades e oferecer o suporte necessÃ¡rio.', 'image' => '/reference-assets/hero-contact.webp']],
                ['type' => 'contact-data', 'data' => ['label' => 'Dados de contato', 'content' => [['EscritÃ³rio administrativo', "Av. Ministro Cirne Lima, nÂº 3951\nJardim Coopagro\nToledo - PR\nCEP 85904-460"], ['Telefones', "Telefone Comercial\n(45) 3252-7023\n\nPlantÃ£o de Vendas\n(45) 9 9111-9653"], ['E-mail', 'contato@pascoalloteamentos.com.br']]]],
                ['type' => 'contact-form', 'data' => ['label' => 'FormulÃ¡rio', 'title' => 'Fale com Nossa Equipe', 'subtitle' => 'Estamos disponÃ­veis para atender vocÃª.', 'content' => 'Preencha o formulÃ¡rio e nossa equipe entrarÃ¡ em contato o mais breve possÃ­vel.', 'button_label' => 'Enviar mensagem', 'recipient_email' => 'contato@pascoalloteamentos.com.br']],
                ['type' => 'social', 'data' => ['label' => 'Redes sociais', 'content' => [['Instagram', 'https://instagram.com'], ['Facebook', 'https://facebook.com']]]],
            ],
            default => in_array($slug, ['condominios', 'loteamentos', 'imoveis'], true) ? [
                ['type' => 'hero', 'data' => ['label' => ucfirst(str_replace('-', ' ', $slug)), 'title' => 'ConteÃºdo da listagem', 'subtitle' => 'Texto introdutÃ³rio da pÃ¡gina.', 'content' => 'Use esta Ã¡rea para editar o cabeÃ§alho e o texto de apresentaÃ§Ã£o.', 'image' => '/reference-assets/hero-home.jpg']],
                ['type' => 'filter', 'data' => ['label' => 'Filtro', 'title' => 'Filtrar empreendimentos', 'subtitle' => 'Ajuste apenas textos auxiliares e mensagens.', 'content' => 'As opÃ§Ãµes de filtro continuam vindo da base de dados.']],
            ] : [],
        };
    }
}
