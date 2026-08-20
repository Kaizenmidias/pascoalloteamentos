<?php

namespace App\Http\Controllers;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogTag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(Request $request): Response
    {
        $category = $request->filled('category')
            ? BlogCategory::query()->where('slug', (string) $request->string('category'))->first()
            : null;

        return $this->render($category ? $category->posts() : BlogPost::query(), $category?->slug);
    }

    public function category(BlogCategory $category): Response
    {
        return $this->render($category->posts(), $category->slug);
    }

    public function tag(BlogTag $tag): Response
    {
        return $this->render($tag->posts());
    }

    public function show(BlogPost $post): Response
    {
        abort_unless($post->status === 'published' && $post->published_at?->isPast(), 404);

        return Inertia::render('Public/Blog/Show', [
            'post' => $post->load(['featuredMedia', 'categories', 'author', 'seo']),
            'related' => BlogPost::query()->where('status', 'published')->whereKeyNot($post->id)->with(['featuredMedia', 'categories'])->latest('published_at')->limit(3)->get(),
        ]);
    }

    private function render($query, ?string $activeCategory = null): Response
    {
        $published = fn ($posts) => $posts->where('status', 'published')->whereNotNull('published_at')->where('published_at', '<=', now());

        return Inertia::render('Public/Blog/Index', [
            'posts' => $published($query)->with(['featuredMedia', 'categories', 'author'])->latest('published_at')->paginate(12)->withQueryString(),
            'categories' => BlogCategory::query()->whereHas('posts', $published)->withCount(['posts' => $published])->orderBy('name')->get(),
            'activeCategory' => $activeCategory,
        ]);
    }
}
