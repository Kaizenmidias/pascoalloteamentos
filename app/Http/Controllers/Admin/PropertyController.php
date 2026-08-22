<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePropertyRequest;
use App\Http\Requests\Admin\UpdatePropertyRequest;
use App\Models\State;
use App\Models\Condominium;
use App\Models\BusinessType;
use App\Models\DevelopmentStatus;
use App\Models\Feature;
use App\Models\Property;
use App\Models\PropertyType;
use App\Models\City;
use App\Services\Admin\RealEstateContentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class PropertyController extends Controller
{
    public function __construct(private readonly RealEstateContentService $content) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'type_id', 'commercial_purpose', 'city_id', 'status']);
        $items = Property::query()->with(['city.state', 'propertyType', 'mediaAssets'])
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(fn ($nested) => $nested->where('title', 'like', "%{$search}%")->orWhere('reference_code', 'like', "%{$search}%")->orWhere('address', 'like', "%{$search}%")))
            ->when($filters['type_id'] ?? null, fn ($query, $value) => $query->where('property_type_id', $value))
            ->when($filters['commercial_purpose'] ?? null, fn ($query, $value) => $query->where('commercial_purpose', $value))
            ->when($filters['city_id'] ?? null, fn ($query, $value) => $query->where('city_id', $value))
            ->when($filters['status'] ?? null, fn ($query, $value) => $query->where('status', $value))
            ->latest()->paginate(20)->withQueryString();

        return Inertia::render('Admin/Properties/Index', ['items' => $items, 'filters' => $filters, 'filterOptions' => ['types' => PropertyType::orderBy('name')->get(['id', 'name']), 'cities' => City::whereIn('id', Property::whereNotNull('city_id')->select('city_id'))->orderBy('name')->get(['id', 'name'])]]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Properties/Form', ['item' => null, 'options' => $this->options()]);
    }

    public function store(StorePropertyRequest $request): RedirectResponse
    {
        $item = $this->content->save(new Property, $request->validated());

        return redirect()->route('admin.properties.edit', $item)->with('success', 'Imóvel criado.');
    }

    public function edit(Property $property): Response
    {
        return Inertia::render('Admin/Properties/Form', ['item' => $property->load($this->contentRelations()), 'options' => $this->options()]);
    }

    public function update(UpdatePropertyRequest $request, Property $property): RedirectResponse
    {
        $this->content->save($property, $request->validated());

        return redirect()->route('admin.properties.edit', $property)->with('success', 'Imóvel atualizado.');
    }

    public function destroy(Property $property): RedirectResponse
    {
        $property->delete();

        return redirect()->route('admin.properties.index')->with('success', 'Imóvel excluído com segurança.');
    }

    private function options(): array
    {
        return ['states' => State::orderBy('name')->get(['id', 'name', 'code']), 'types' => PropertyType::where('is_active', true)->orderBy('sort_order')->get(), 'statuses' => DevelopmentStatus::where('is_active', true)->orderBy('sort_order')->get(), 'businessTypes' => Schema::hasTable('business_types') ? BusinessType::where('is_active', true)->orderBy('sort_order')->get() : collect(), 'condominiums' => Condominium::orderBy('title')->get(['id', 'title']), 'features' => Feature::orderBy('sort_order')->get()];
    }

    private function contentRelations(): array
    {
        return ['city.state', 'features', 'mediaAssets', 'aboutMedia', 'promotionMedia', 'floorPlans.mediaAsset', 'constructionStages', 'documents.mediaAsset', 'faqs', 'seo'];
    }
}
