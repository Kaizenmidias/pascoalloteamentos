<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\Condominium;
use App\Models\MediaAsset;
use App\Models\Property;
use App\Models\SiteSetting;
use App\Models\Subdivision;
use App\Support\HomeContent;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        if (! Schema::hasTable('condominiums')) {
            return Inertia::render('Public/Home', [
                'featuredItems' => [],
                'homeEntities' => [],
                'posts' => [],
                'homeHero' => HomeContent::hero(null, false),
                'homeDifferentials' => HomeContent::differentials(null),
                'homeNumbers' => HomeContent::numbers(null),
            ]);
        }

        $condominiums = Condominium::query()->published()->with(['city.state', 'condominiumType', 'developmentStatus', 'mediaAssets'])->featured()->latest('published_at')->limit(3)->get();
        $properties = Property::query()->published()->with(['city.state', 'propertyType', 'developmentStatus', 'mediaAssets'])->featured()->latest('published_at')->limit(3)->get();
        $subdivisions = Subdivision::query()->published()->with(['city.state', 'subdivisionType', 'developmentStatus', 'mediaAssets'])->featured()->latest('published_at')->limit(3)->get();

        $fallbackCondominiums = $condominiums->isNotEmpty()
            ? collect()
            : Condominium::query()->published()->with(['city.state', 'condominiumType', 'developmentStatus', 'mediaAssets'])->latest('published_at')->limit(3)->get();
        $fallbackProperties = $properties->isNotEmpty()
            ? collect()
            : Property::query()->published()->with(['city.state', 'propertyType', 'developmentStatus', 'mediaAssets'])->latest('published_at')->limit(3)->get();
        $fallbackSubdivisions = $subdivisions->isNotEmpty()
            ? collect()
            : Subdivision::query()->published()->with(['city.state', 'subdivisionType', 'developmentStatus', 'mediaAssets'])->latest('published_at')->limit(3)->get();

        // A coleção de destaques é apenas uma projeção de leitura para a Home.
        // As três entidades e suas tabelas continuam completamente independentes.
        $featuredItems = collect([
            ...$condominiums->map(fn (Condominium $item) => [...$item->toArray(), 'href' => "/condominios/{$item->slug}"]),
            ...$fallbackCondominiums->map(fn (Condominium $item) => [...$item->toArray(), 'href' => "/condominios/{$item->slug}"]),
            ...$subdivisions->map(fn (Subdivision $item) => [...$item->toArray(), 'href' => "/loteamentos/{$item->slug}"]),
            ...$fallbackSubdivisions->map(fn (Subdivision $item) => [...$item->toArray(), 'href' => "/loteamentos/{$item->slug}"]),
            ...$properties->map(fn (Property $item) => [...$item->toArray(), 'href' => "/imoveis/{$item->slug}"]),
            ...$fallbackProperties->map(fn (Property $item) => [...$item->toArray(), 'href' => "/imoveis/{$item->slug}"]),
        ])->take(6)->values();

        $homeEntities = collect()
            ->concat($this->homeEntities(Condominium::class, 'condominiums', '/condominios/', 'condominiumType'))
            ->concat($this->homeEntities(Subdivision::class, 'subdivisions', '/loteamentos/', 'subdivisionType'))
            ->concat($this->homeEntities(Property::class, 'properties', '/imoveis/', 'propertyType'))
            ->values();
        $homeSettings = Schema::hasTable('site_settings')
            ? SiteSetting::query()->whereIn('key', ['home_hero', 'home_differentials', 'home_numbers'])->get()->keyBy('key')
            : collect();
        $homeHero = $this->hydrateHomeHeroMedia(HomeContent::hero($homeSettings->get('home_hero')?->value, false));
        $homeHero['slides'] = array_values(array_filter(
            $homeHero['slides'],
            fn (array $slide) => $slide['is_active'] && $slide['image'] !== '',
        ));

        return Inertia::render('Public/Home', [
            'featuredItems' => $featuredItems,
            'homeEntities' => $homeEntities,
            'condominiums' => $condominiums,
            'properties' => $properties,
            'subdivisions' => $subdivisions,
            'homeHero' => $homeHero,
            'homeDifferentials' => HomeContent::differentials($homeSettings->get('home_differentials')?->value),
            'homeNumbers' => HomeContent::numbers($homeSettings->get('home_numbers')?->value),
            'posts' => BlogPost::query()->where('status', 'published')->with(['featuredMedia', 'categories'])->latest('published_at')->limit(3)->get(),
        ]);
    }

    private function homeEntities(string $model, string $category, string $path, string $typeRelation)
    {
        $relations = ['city.state', $typeRelation, 'developmentStatus', 'mediaAssets'];
        if ($category !== 'properties') {
            $relations[] = 'constructionStages';
        }

        return $model::query()
            ->published()
            ->with($relations)
            ->latest('published_at')
            ->get()
            ->map(fn ($item) => [
                ...$item->toArray(),
                'category' => $category,
                'href' => $path.$item->slug,
                'overall_progress' => $category === 'properties' ? null : $item->constructionProgressPercentage(),
            ]);
    }

    private function hydrateHomeHeroMedia(array $hero): array
    {
        if (! Schema::hasTable('media_assets')) {
            return $hero;
        }

        $ids = collect($hero['slides'])
            ->flatMap(fn (array $slide) => [$slide['media_id'], $slide['mobile_media_id']])
            ->filter()
            ->unique()
            ->values();
        $assets = MediaAsset::query()->whereKey($ids)->get()->keyBy('id');

        $hero['slides'] = array_map(function (array $slide) use ($assets): array {
            foreach ([
                ['media_id', 'image'],
                ['mobile_media_id', 'mobile_image'],
            ] as [$idKey, $urlKey]) {
                $asset = $slide[$idKey] ? $assets->get($slide[$idKey]) : null;
                if ($asset && $asset->type === 'image') {
                    $slide[$urlKey] = $asset->url;
                }
            }

            return $slide;
        }, $hero['slides']);

        return $hero;
    }

}
