<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\BusinessType;
use App\Models\Condominium;
use App\Models\CondominiumType;
use App\Models\DevelopmentStatus;
use App\Models\Page;
use App\Support\ConstructionStageCatalog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class CondominiumController extends Controller
{
    public function index(Request $request): Response
    {
        $items = Condominium::query()->published()->with(['city.state', 'condominiumType', 'developmentStatus', 'businessType', 'mediaAssets', 'constructionStages'])->when($request->string('city')->toString(), fn ($q, $city) => $q->whereHas('city', fn ($c) => $c->where('slug', $city)))->when($request->string('type')->toString(), fn ($q, $type) => $q->whereHas('condominiumType', fn ($t) => $t->where('slug', $type)))->when($request->string('status')->toString(), fn ($q, $status) => $q->whereHas('developmentStatus', fn ($s) => $s->where('slug', $status)))->when(Schema::hasColumn('condominiums', 'business_type_id') && $request->string('business_type')->toString(), fn ($q, $businessType) => $q->whereHas('businessType', fn ($t) => $t->where('slug', $businessType)))->latest('published_at')->paginate(12)->withQueryString();
        $items->getCollection()->each(fn (Condominium $item) => $item->setAttribute('overall_progress', $item->constructionProgressPercentage()));

        return Inertia::render('Public/Condominiums/Index', [
            'items' => $items,
            'filters' => $request->only(['city', 'type', 'status', 'business_type']),
            'cities' => City::query()->whereHas('condominiums', fn ($query) => $query->published())->orderBy('name')->get(['name', 'slug']),
            'types' => CondominiumType::query()->where('is_active', true)->whereHas('condominiums', fn ($query) => $query->published())->orderBy('sort_order')->get(['name', 'slug']),
            'statuses' => DevelopmentStatus::query()->where('is_active', true)->whereHas('condominiums', fn ($query) => $query->published())->orderBy('sort_order')->get(['name', 'slug']),
            'businessTypes' => Schema::hasTable('business_types') ? BusinessType::query()->where('is_active', true)->orderBy('sort_order')->get(['name', 'slug']) : collect(),
            'pageCms' => Page::query()->where('slug', 'condominios')->with(['seo', 'sections'])->first(),
        ]);
    }

    public function show(Condominium $condominium): Response
    {
        abort_unless($condominium->status === 'published', 404);

        $condominium->load(['city.state', 'condominiumType', 'developmentStatus', 'properties', 'features', 'mediaAssets', 'promotionMedia', 'floorPlans.mediaAsset', 'promotions.mediaAsset', 'constructionStages', 'seo']);
        $condominium->setRelation('constructionStages', ConstructionStageCatalog::applicableStages($condominium, $condominium->constructionStages));

        return Inertia::render('Public/Condominiums/Show', ['item' => $condominium]);
    }
}
