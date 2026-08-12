<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\DevelopmentStatus;
use App\Models\Property;
use App\Models\PropertyType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PropertyController extends Controller
{
    public function index(Request $request): Response
    {
        $items = Property::query()->published()->with(['city.state', 'propertyType', 'developmentStatus', 'mediaAssets'])->when($request->string('city')->toString(), fn ($q, $city) => $q->whereHas('city', fn ($c) => $c->where('slug', $city)))->when($request->string('type')->toString(), fn ($q, $type) => $q->whereHas('propertyType', fn ($t) => $t->where('slug', $type)))->when($request->string('status')->toString(), fn ($q, $status) => $q->whereHas('developmentStatus', fn ($s) => $s->where('slug', $status)))->latest('published_at')->paginate(12)->withQueryString();

        return Inertia::render('Public/Properties/Index', [
            'items' => $items,
            'filters' => $request->only(['city', 'type', 'status']),
            'cities' => City::query()->orderBy('name')->get(['name', 'slug']),
            'types' => PropertyType::query()->where('is_active', true)->orderBy('sort_order')->get(['name', 'slug']),
            'statuses' => DevelopmentStatus::query()->where('is_active', true)->orderBy('sort_order')->get(['name', 'slug']),
        ]);
    }

    public function show(Property $property): Response
    {
        abort_unless($property->status === 'published', 404);

        return Inertia::render('Public/Properties/Show', ['item' => $property->load(['city.state', 'propertyType', 'developmentStatus', 'condominium', 'features', 'mediaAssets', 'floorPlans.mediaAsset', 'constructionStages', 'documents.mediaAsset', 'faqs', 'seo'])]);
    }
}
