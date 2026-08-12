<?php

namespace App\Http\Controllers;

use App\Models\Condominium;
use App\Models\Property;
use App\Models\Subdivision;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $urls = collect([route('home'), route('properties.index'), route('condominiums.index'), route('subdivisions.index'), route('blog.index')]);
        Property::published()->get()->each(fn ($item) => $urls->push(route('properties.show', $item)));
        Condominium::published()->get()->each(fn ($item) => $urls->push(route('condominiums.show', $item)));
        Subdivision::published()->get()->each(fn ($item) => $urls->push(route('subdivisions.show', $item)));
        $body = $urls->unique()->map(fn ($url) => '<url><loc>'.htmlspecialchars($url, ENT_XML1).'</loc></url>')->implode('');

        return response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'.$body.'</urlset>', 200, ['Content-Type' => 'application/xml']);
    }
}
