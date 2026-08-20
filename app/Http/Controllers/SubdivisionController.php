<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\BusinessType;
use App\Models\DevelopmentStatus;
use App\Models\Page;
use App\Models\SiteSetting;
use App\Models\Subdivision;
use App\Models\SubdivisionType;
use App\Support\ConstructionStageCatalog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class SubdivisionController extends Controller
{
    public function index(Request $request): Response
    {
        $items = Subdivision::query()->published()->with(['city.state', 'subdivisionType', 'developmentStatus', 'businessType', 'mediaAssets', 'constructionStages'])->when($request->string('city')->toString(), fn ($q, $city) => $q->whereHas('city', fn ($c) => $c->where('slug', $city)))->when($request->string('type')->toString(), fn ($q, $type) => $q->whereHas('subdivisionType', fn ($t) => $t->where('slug', $type)))->when($request->string('status')->toString(), fn ($q, $status) => $q->whereHas('developmentStatus', fn ($s) => $s->where('slug', $status)))->when(Schema::hasColumn('subdivisions', 'business_type_id') && $request->string('business_type')->toString(), fn ($q, $businessType) => $q->whereHas('businessType', fn ($t) => $t->where('slug', $businessType)))->latest('published_at')->paginate(12)->withQueryString();
        $items->getCollection()->each(fn (Subdivision $item) => $item->setAttribute('overall_progress', $item->constructionProgressPercentage()));

        return Inertia::render('Public/Subdivisions/Index', [
            'items' => $items,
            'filters' => $request->only(['city', 'type', 'status', 'business_type']),
            'cities' => City::query()->whereHas('subdivisions', fn ($query) => $query->published())->orderBy('name')->get(['name', 'slug']),
            'types' => SubdivisionType::query()->where('is_active', true)->whereHas('subdivisions', fn ($query) => $query->published())->orderBy('sort_order')->get(['name', 'slug']),
            'statuses' => DevelopmentStatus::query()->where('is_active', true)->whereHas('subdivisions', fn ($query) => $query->published())->orderBy('sort_order')->get(['name', 'slug']),
            'businessTypes' => Schema::hasTable('business_types') ? BusinessType::query()->where('is_active', true)->orderBy('sort_order')->get(['name', 'slug']) : collect(),
            'pageCms' => Page::query()->where('slug', 'loteamentos')->with(['seo', 'sections'])->first(),
        ]);
    }

    public function show(Subdivision $subdivision): Response
    {
        abort_unless($subdivision->status === 'published', 404);

        $subdivision->load(['city.state', 'subdivisionType', 'developmentStatus', 'features.iconMedia', 'mediaAssets', 'aboutMedia', 'promotionMedia', 'floorPlans.mediaAsset', 'promotions.mediaAsset', 'constructionStages', 'documents.mediaAsset', 'faqs', 'seo']);
        $subdivision->setRelation('constructionStages', ConstructionStageCatalog::applicableStages($subdivision, $subdivision->constructionStages));

        $globalWhatsapp = Schema::hasTable('site_settings')
            ? SiteSetting::query()->where('key', 'whatsapp')->first()?->value
            : null;

        return Inertia::render('Public/Subdivisions/Show', ['item' => $subdivision, 'globalWhatsapp' => $globalWhatsapp]);
    }
}
