<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSubdivisionRequest;
use App\Http\Requests\Admin\UpdateSubdivisionRequest;
use App\Models\BusinessType;
use App\Models\City;
use App\Models\DevelopmentStatus;
use App\Models\Feature;
use App\Models\Subdivision;
use App\Models\SubdivisionType;
use App\Services\Admin\RealEstateContentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class SubdivisionController extends Controller
{
    public function __construct(private readonly RealEstateContentService $content) {}

    public function index(): Response
    {
        return Inertia::render('Admin/Subdivisions/Index', ['items' => Subdivision::with(['city', 'subdivisionType'])->latest()->paginate(20)]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Subdivisions/Form', ['item' => null, 'options' => $this->options()]);
    }

    public function store(StoreSubdivisionRequest $request): RedirectResponse
    {
        $item = $this->content->save(new Subdivision, $request->validated());

        return redirect()->route('admin.subdivisions.edit', $item)->with('success', 'Loteamento criado.');
    }

    public function edit(Subdivision $subdivision): Response
    {
        return Inertia::render('Admin/Subdivisions/Form', ['item' => $subdivision->load(['features', 'mediaAssets', 'floorPlans', 'constructionStages', 'faqs', 'seo']), 'options' => $this->options()]);
    }

    public function update(UpdateSubdivisionRequest $request, Subdivision $subdivision): RedirectResponse
    {
        $this->content->save($subdivision, $request->validated());

        return redirect()->route('admin.subdivisions.edit', $subdivision)->with('success', 'Loteamento atualizado.');
    }

    private function options(): array
    {
        return ['cities' => City::with('state')->orderBy('name')->get(), 'types' => SubdivisionType::where('is_active', true)->orderBy('sort_order')->get(), 'statuses' => DevelopmentStatus::where('is_active', true)->orderBy('sort_order')->get(), 'businessTypes' => Schema::hasTable('business_types') ? BusinessType::where('is_active', true)->orderBy('sort_order')->get() : collect(), 'features' => Feature::orderBy('sort_order')->get()];
    }
}
