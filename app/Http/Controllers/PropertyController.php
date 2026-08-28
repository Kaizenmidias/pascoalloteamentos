<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\BusinessType;
use App\Models\DevelopmentStatus;
use App\Models\Page;
use App\Models\Property;
use App\Models\PropertyType;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class PropertyController extends Controller
{
    public function index(Request $request): Response
    {
        $items = Property::query()->published()->with(['city.state', 'propertyType', 'developmentStatus', 'businessType', 'mediaAssets'])->when($request->string('city')->toString(), fn ($q, $city) => $q->whereHas('city', fn ($c) => $c->where('slug', $city)))->when($request->string('type')->toString(), fn ($q, $type) => $q->whereHas('propertyType', fn ($t) => $t->where('slug', $type)))->when($request->string('status')->toString(), fn ($q, $status) => $q->whereHas('developmentStatus', fn ($s) => $s->where('slug', $status)))->when(Schema::hasColumn('properties', 'business_type_id') && $request->string('business_type')->toString(), fn ($q, $businessType) => $q->whereHas('businessType', fn ($t) => $t->where('slug', $businessType)))->latest('published_at')->paginate(12)->withQueryString();

        return Inertia::render('Public/Properties/Index', [
            'items' => $items,
            'filters' => $request->only(['city', 'type', 'status', 'business_type']),
            'cities' => City::query()->whereHas('properties', fn ($query) => $query->published())->orderBy('name')->get(['name', 'slug']),
            'types' => PropertyType::query()->where('is_active', true)->whereHas('properties', fn ($query) => $query->published())->orderBy('sort_order')->get(['name', 'slug']),
            'statuses' => DevelopmentStatus::query()->where('is_active', true)->whereHas('properties', fn ($query) => $query->published())->orderBy('sort_order')->get(['name', 'slug']),
            'businessTypes' => Schema::hasTable('business_types') ? BusinessType::query()->where('is_active', true)->orderBy('sort_order')->get(['name', 'slug']) : collect(),
            'pageCms' => Page::query()->where('slug', 'imoveis')->with(['seo', 'sections'])->first(),
        ]);
    }

    public function show(Property $property): Response
    {
        abort_unless($property->status === 'published', 404);

        $relations = ['city.state', 'propertyType', 'developmentStatus', 'businessType', 'condominium', 'features.iconMedia', 'mediaAssets', 'floorPlans.mediaAsset', 'documents.mediaAsset', 'seo'];
        $similar = Property::query()
            ->published()
            ->whereKeyNot($property->id)
            ->with(['city.state', 'propertyType', 'developmentStatus', 'mediaAssets'])
            ->when($property->commercial_purpose, fn ($query, $purpose) => $query->orderByRaw('CASE WHEN commercial_purpose = ? THEN 0 ELSE 1 END', [$purpose]))
            ->when($property->property_type_id, fn ($query, $type) => $query->orderByRaw('CASE WHEN property_type_id = ? THEN 0 ELSE 1 END', [$type]))
            ->when($property->city_id, fn ($query, $city) => $query->orderByRaw('CASE WHEN city_id = ? THEN 0 ELSE 1 END', [$city]))
            ->when($property->sale_price ?? $property->regular_price ?? $property->rent_price, fn ($query, $price) => $query
                ->orderByRaw('CASE WHEN COALESCE(sale_price, regular_price, rent_price) IS NULL THEN 1 ELSE 0 END')
                ->orderByRaw('ABS(COALESCE(sale_price, regular_price, rent_price, 0) - ?) ASC', [(float) $price]))
            ->latest('published_at')
            ->limit(4)
            ->get();

        $globalWhatsapp = Schema::hasTable('site_settings')
            ? SiteSetting::query()->where('key', 'whatsapp')->first()?->value
            : null;

        return Inertia::render('Public/Properties/Show', ['item' => $property->load($relations), 'similar' => $similar, 'globalWhatsapp' => $globalWhatsapp]);
    }
}
