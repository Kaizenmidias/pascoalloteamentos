<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\Condominium;
use App\Models\CondominiumType;
use App\Models\DevelopmentStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CondominiumController extends Controller
{
    public function index(Request $request): Response
    {
        $items = Condominium::query()->published()->with(['city.state', 'condominiumType', 'developmentStatus', 'mediaAssets'])->when($request->string('city')->toString(), fn ($q, $city) => $q->whereHas('city', fn ($c) => $c->where('slug', $city)))->when($request->string('type')->toString(), fn ($q, $type) => $q->whereHas('condominiumType', fn ($t) => $t->where('slug', $type)))->when($request->string('status')->toString(), fn ($q, $status) => $q->whereHas('developmentStatus', fn ($s) => $s->where('slug', $status)))->latest('published_at')->paginate(12)->withQueryString();

        return Inertia::render('Public/Condominiums/Index', [
            'items' => $items,
            'filters' => $request->only(['city', 'type', 'status']),
            'cities' => City::query()->orderBy('name')->get(['name', 'slug']),
            'types' => CondominiumType::query()->where('is_active', true)->orderBy('sort_order')->get(['name', 'slug']),
            'statuses' => DevelopmentStatus::query()->where('is_active', true)->orderBy('sort_order')->get(['name', 'slug']),
        ]);
    }

    public function show(Condominium $condominium): Response
    {
        abort_unless($condominium->status === 'published', 404);

        return Inertia::render('Public/Condominiums/Show', ['item' => $condominium->load(['city.state', 'condominiumType', 'developmentStatus', 'properties', 'features', 'mediaAssets', 'floorPlans.mediaAsset', 'constructionStages', 'documents.mediaAsset', 'faqs', 'seo'])]);
    }
}
