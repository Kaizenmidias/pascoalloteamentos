<?php

namespace App\Providers;

use App\Models\BlogPost;
use App\Models\Condominium;
use App\Models\ConstructionStage;
use App\Models\Page;
use App\Models\Property;
use App\Models\Subdivision;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Gate;
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
            'construction_stage' => ConstructionStage::class,
            'subdivision' => Subdivision::class,
            'page' => Page::class,
            'blog_post' => BlogPost::class,
        ]);

        Gate::define('access-admin', fn (User $user) => $user->canAccessAdmin());
        Gate::define('manage-content', fn (User $user) => $user->canAccessAdmin());
        Gate::define('manage-leads', fn (User $user) => $user->canAccessAdmin());
        Gate::define('admin-only', fn (User $user) => $user->isAdmin());
    }
}
