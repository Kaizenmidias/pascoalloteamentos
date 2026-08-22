<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSubdivisionRequest;
use App\Http\Requests\Admin\UpdateSubdivisionRequest;
use App\Models\BusinessType;
use App\Models\State;
use App\Models\DevelopmentStatus;
use App\Models\Feature;
use App\Models\Subdivision;
use App\Models\SubdivisionType;
use App\Models\City;
use App\Services\Admin\RealEstateContentService;
use App\Support\ConstructionStageCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class SubdivisionController extends Controller
{
    public function __construct(private readonly RealEstateContentService $content) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'type_id', 'commercial_purpose', 'city_id', 'status']);
        $items = Subdivision::query()->with(['city.state', 'subdivisionType', 'mediaAssets'])
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(fn ($nested) => $nested->where('title', 'like', "%{$search}%")->orWhere('reference_code', 'like', "%{$search}%")->orWhere('address', 'like', "%{$search}%")))
            ->when($filters['type_id'] ?? null, fn ($query, $value) => $query->where('subdivision_type_id', $value))
            ->when($filters['commercial_purpose'] ?? null, fn ($query, $value) => $query->where('commercial_purpose', $value))
            ->when($filters['city_id'] ?? null, fn ($query, $value) => $query->where('city_id', $value))
            ->when($filters['status'] ?? null, fn ($query, $value) => $query->where('status', $value))
            ->latest()->paginate(20)->withQueryString();

        return Inertia::render('Admin/Subdivisions/Index', ['items' => $items, 'filters' => $filters, 'filterOptions' => ['types' => SubdivisionType::orderBy('name')->get(['id', 'name']), 'cities' => City::whereIn('id', Subdivision::whereNotNull('city_id')->select('city_id'))->orderBy('name')->get(['id', 'name'])]]);
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
        return Inertia::render('Admin/Subdivisions/Form', ['item' => $subdivision->load(['city.state', 'features.iconMedia', 'mediaAssets', 'promotions.mediaAsset', 'constructionStages', 'seo']), 'options' => $this->options()]);
    }

    public function update(UpdateSubdivisionRequest $request, Subdivision $subdivision): RedirectResponse
    {
        $this->content->save($subdivision, $request->validated());

        return redirect()->route('admin.subdivisions.edit', $subdivision)->with('success', 'Loteamento atualizado.');
    }

    public function destroy(Subdivision $subdivision): RedirectResponse
    {
        $subdivision->delete();

        return redirect()->route('admin.subdivisions.index')->with('success', 'Loteamento excluído com segurança.');
    }

    private function options(): array
    {
        return ['states' => State::orderBy('name')->get(['id', 'name', 'code']), 'types' => SubdivisionType::where('is_active', true)->orderBy('sort_order')->get(), 'statuses' => DevelopmentStatus::where('is_active', true)->orderBy('sort_order')->get(), 'businessTypes' => Schema::hasTable('business_types') ? BusinessType::where('is_active', true)->orderBy('sort_order')->get() : collect(), 'features' => Feature::with('iconMedia')->where('is_active', true)->where(fn ($query) => $query->whereNull('scope')->orWhereIn('scope', ['subdivision', 'condominium']))->orderBy('sort_order')->get(), 'stageDefinitions' => ConstructionStageCatalog::definitionsFor(Subdivision::class)];
    }
}
