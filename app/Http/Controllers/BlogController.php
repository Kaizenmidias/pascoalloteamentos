<?php

namespace App\Http\Controllers;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogTag;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(): Response
    {
        return $this->render(BlogPost::query());
    }

    public function category(BlogCategory $category): Response
    {
        return $this->render($category->posts());
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
            'related' => BlogPost::query()->where('status', 'published')->whereKeyNot($post->id)->with('featuredMedia')->latest('published_at')->limit(3)->get(),
        ]);
    }

    private function render($query): Response
    {
        return Inertia::render('Public/Blog/Index', ['posts' => $query->where('status', 'published')->whereNotNull('published_at')->with(['featuredMedia', 'categories'])->latest('published_at')->paginate(12)]);
    }
}
