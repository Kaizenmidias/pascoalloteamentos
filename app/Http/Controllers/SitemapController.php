<?php

namespace App\Http\Controllers;

use App\Models\Condominium;
use App\Models\Property;
use App\Models\Subdivision;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Route;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $urls = collect([
            $this->namedUrl('home', '/'),
            $this->namedUrl('properties.index', '/imoveis'),
            $this->namedUrl('condominiums.index', '/condominios'),
            $this->namedUrl('subdivisions.index', '/loteamentos'),
            $this->namedUrl('blog.index', '/blog'),
        ]);

        Property::published()->get()->each(fn ($item) => $urls->push($this->namedUrl('properties.show', "/imoveis/{$item->slug}", ['property' => $item])));
        Condominium::published()->get()->each(fn ($item) => $urls->push($this->namedUrl('condominiums.show', "/condominios/{$item->slug}", ['condominium' => $item])));
        Subdivision::published()->get()->each(fn ($item) => $urls->push($this->namedUrl('subdivisions.show', "/loteamentos/{$item->slug}", ['subdivision' => $item])));

        $body = $urls->unique()->map(fn ($url) => '<url><loc>'.htmlspecialchars($url, ENT_XML1).'</loc></url>')->implode('');

        return response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'.$body.'</urlset>', 200, ['Content-Type' => 'application/xml']);
    }

    private function namedUrl(string $routeName, string $fallbackPath, array $parameters = []): string
    {
        return Route::has($routeName) ? route($routeName, $parameters) : url($fallbackPath);
    }
}
