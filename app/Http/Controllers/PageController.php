<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function about(): Response
    {
        return Inertia::render('Public/Content/StaticPage', ['title' => 'Sobre nós', 'kind' => 'about']);
    }

    public function contact(): Response
    {
        return Inertia::render('Public/Content/StaticPage', ['title' => 'Contato', 'kind' => 'contact']);
    }

    public function show(Page $page): Response
    {
        abort_unless($page->status === 'published' && $page->published_at?->isPast(), 404);

        return Inertia::render('Public/Content/Page', ['page' => $page->load('seo')]);
    }
}
