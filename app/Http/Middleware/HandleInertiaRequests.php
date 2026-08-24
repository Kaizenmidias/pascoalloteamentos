<?php

namespace App\Http\Middleware;

use App\Models\BusinessType;
use App\Models\Condominium;
use App\Models\DevelopmentStatus;
use App\Models\Property;
use App\Models\Subdivision;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $propertyTypes = Schema::hasTable('property_types') ? \App\Models\PropertyType::query()->where('is_active', true)->orderBy('sort_order')->get(['name', 'slug']) : collect();
        $condominiumTypes = Schema::hasTable('condominium_types') ? \App\Models\CondominiumType::query()->where('is_active', true)->orderBy('sort_order')->get(['name', 'slug']) : collect();
        $subdivisionTypes = Schema::hasTable('subdivision_types') ? \App\Models\SubdivisionType::query()->where('is_active', true)->orderBy('sort_order')->get(['name', 'slug']) : collect();
        $statusOptions = Schema::hasTable('development_statuses') ? DevelopmentStatus::query()->where('is_active', true)->orderBy('sort_order')->get(['name', 'slug']) : collect();
        $businessTypeOptions = Schema::hasTable('business_types') ? BusinessType::query()->where('is_active', true)->orderBy('sort_order')->get(['name', 'slug']) : collect();
        $menuGroups = [
            'condominiums' => Schema::hasTable('condominiums') ? Condominium::query()->published()->latest('published_at')->limit(8)->get(['title', 'slug']) : collect(),
            'subdivisions' => Schema::hasTable('subdivisions') ? Subdivision::query()->published()->latest('published_at')->limit(8)->get(['title', 'slug']) : collect(),
            'properties' => Schema::hasTable('properties') ? Property::query()->published()->latest('published_at')->limit(8)->get(['title', 'slug']) : collect(),
        ];

        return [
            ...parent::share($request),
            'appName' => config('app.name'),
            'mediaUpload' => [
                'url' => config('media.upload_url') ?: null,
                'maxKb' => config('media.max_upload_kb'),
                'maxItems' => config('media.gallery_upload_limit'),
            ],
            'realEstate' => [
                'propertyTypes' => $propertyTypes,
                'condominiumTypes' => $condominiumTypes,
                'subdivisionTypes' => $subdivisionTypes,
                'statuses' => $statusOptions,
                'businessTypes' => $businessTypeOptions,
                'menuGroups' => $menuGroups,
            ],
            'auth' => [
                'user' => $request->user()?->only('id', 'name', 'username', 'email', 'role'),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}