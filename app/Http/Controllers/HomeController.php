<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\Condominium;
use App\Models\Property;
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

        // A coleção de destaques é apenas uma projeção de leitura para a Home.
        // As três entidades e suas tabelas continuam completamente independentes.
        $featuredItems = collect([
            ...$condominiums->map(fn (Condominium $item) => [...$item->toArray(), 'href' => "/condominios/{$item->slug}"]),
            ...$subdivisions->map(fn (Subdivision $item) => [...$item->toArray(), 'href' => "/loteamentos/{$item->slug}"]),
            ...$properties->map(fn (Property $item) => [...$item->toArray(), 'href' => "/imoveis/{$item->slug}"]),
        ])->take(6)->values();

        return Inertia::render('Public/Home', [
            'featuredItems' => $featuredItems,
            'condominiums' => $condominiums,
            'properties' => $properties,
            'subdivisions' => $subdivisions,
            'posts' => BlogPost::query()->where('status', 'published')->with(['featuredMedia', 'categories'])->latest('published_at')->limit(3)->get(),
        ]);
    }
}
