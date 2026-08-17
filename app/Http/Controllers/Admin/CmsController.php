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

    public function pages(): Response
    {
        return Inertia::render('Admin/Pages/Index', ['items' => Page::latest()->paginate(20)]);
    }

    public function createPage(): Response
    {
        return Inertia::render('Admin/Pages/Form', ['item' => null]);
    }

    public function editPage(Page $page): Response
    {
        return Inertia::render('Admin/Pages/Form', ['item' => $page->load('seo')]);
    }

    public function storePage(Request $request): RedirectResponse
    {
        $page = new Page();
        $this->savePage($request, $page);

        return redirect()->route('admin.pages.edit', $page)->with('success', 'Página criada.');
    }

    public function updatePage(Request $request, Page $page): RedirectResponse
    {
        $this->savePage($request, $page);

        return back()->with('success', 'Página atualizada.');
    }

    public function destroyPage(Page $page): RedirectResponse
    {
        $page->delete();

        return back()->with('success', 'Página movida para a lixeira.');
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

        return back()->with('success', 'Configurações salvas.');
    }

    public function homeNumbers(): Response
    {
        $numbers = SiteSetting::query()->where('key', 'home_numbers')->value('value') ?? [];

        return Inertia::render('Admin/Cms/HomeNumbers', ['numbers' => $numbers]);
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

        return back()->with('success', 'Números da Home atualizados.');
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

        return back()->with('success', 'Integrações atualizadas.');
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
        ]);

        $seo = Arr::only($data, ['seo_title', 'seo_description']);
        unset($data['seo_title'], $data['seo_description']);

        if ($data['status'] === 'published' && ! $page->published_at) {
            $data['published_at'] = now();
        }

        $page->fill($data)->save();
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
}
