<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\Condominium;
use App\Models\Property;
use App\Models\SiteSetting;
use App\Models\Subdivision;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        if (! Schema::hasTable('condominiums')) {
            return Inertia::render('Public/Home', ['featuredItems' => [], 'condominiums' => [], 'properties' => [], 'subdivisions' => [], 'posts' => []]);
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

        return Inertia::render('Public/Home', [
            'featuredItems' => $featuredItems,
            'condominiums' => $condominiums,
            'properties' => $properties,
            'subdivisions' => $subdivisions,
            'homeHero' => SiteSetting::query()->where('key', 'home_hero')->first()?->value,
            'homeDifferentials' => SiteSetting::query()->where('key', 'home_differentials')->first()?->value,
            'homeNumbers' => SiteSetting::query()->where('key', 'home_numbers')->first()?->value ?? [
                ['value' => '20+', 'title' => 'Anos de experiência', 'description' => 'de atuação no mercado.'],
                ['value' => '15+', 'title' => 'Empreendimentos', 'description' => 'entregues com excelência.'],
                ['value' => '2+', 'title' => 'Cidades', 'description' => 'com presença consolidada.'],
                ['value' => '2', 'title' => 'Distritos', 'description' => 'atendidos pela empresa.'],
            ],
            'posts' => BlogPost::query()->where('status', 'published')->with(['featuredMedia', 'categories'])->latest('published_at')->limit(3)->get(),
        ]);
    }
}
