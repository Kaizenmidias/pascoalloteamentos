<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\DevelopmentStatus;
use App\Models\Subdivision;
use App\Models\SubdivisionType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubdivisionController extends Controller
{
    public function index(Request $request): Response
    {
        $items = Subdivision::query()->published()->with(['city.state', 'subdivisionType', 'developmentStatus', 'mediaAssets'])->when($request->string('city')->toString(), fn ($q, $city) => $q->whereHas('city', fn ($c) => $c->where('slug', $city)))->when($request->string('type')->toString(), fn ($q, $type) => $q->whereHas('subdivisionType', fn ($t) => $t->where('slug', $type)))->when($request->string('status')->toString(), fn ($q, $status) => $q->whereHas('developmentStatus', fn ($s) => $s->where('slug', $status)))->latest('published_at')->paginate(12)->withQueryString();

        return Inertia::render('Public/Subdivisions/Index', [
            'items' => $items,
            'filters' => $request->only(['city', 'type', 'status']),
            'cities' => City::query()->orderBy('name')->get(['name', 'slug']),
            'types' => SubdivisionType::query()->where('is_active', true)->orderBy('sort_order')->get(['name', 'slug']),
            'statuses' => DevelopmentStatus::query()->where('is_active', true)->orderBy('sort_order')->get(['name', 'slug']),
        ]);
    }

    public function show(Subdivision $subdivision): Response
    {
        abort_unless($subdivision->status === 'published', 404);

        return Inertia::render('Public/Subdivisions/Show', ['item' => $subdivision->load(['city.state', 'subdivisionType', 'developmentStatus', 'features', 'mediaAssets', 'floorPlans.mediaAsset', 'constructionStages', 'documents.mediaAsset', 'faqs', 'seo'])]);
    }
}
