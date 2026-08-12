<?php

namespace App\Providers;

use App\Models\BlogPost;
use App\Models\Condominium;
use App\Models\Page;
use App\Models\Property;
use App\Models\Subdivision;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Relation::enforceMorphMap([
            'property' => Property::class,
            'condominium' => Condominium::class,
            'subdivision' => Subdivision::class,
            'page' => Page::class,
            'blog_post' => BlogPost::class,
        ]);
    }
}
