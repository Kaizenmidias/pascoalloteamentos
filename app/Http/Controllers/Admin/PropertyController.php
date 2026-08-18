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
use App\Services\Admin\RealEstateContentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class PropertyController extends Controller
{
    public function __construct(private readonly RealEstateContentService $content) {}

    public function index(): Response
    {
        return Inertia::render('Admin/Properties/Index', ['items' => Property::with(['city', 'propertyType'])->latest()->paginate(20)]);
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

    private function options(): array
    {
        return ['states' => State::orderBy('name')->get(['id', 'name', 'code']), 'types' => PropertyType::where('is_active', true)->orderBy('sort_order')->get(), 'statuses' => DevelopmentStatus::where('is_active', true)->orderBy('sort_order')->get(), 'businessTypes' => Schema::hasTable('business_types') ? BusinessType::where('is_active', true)->orderBy('sort_order')->get() : collect(), 'condominiums' => Condominium::orderBy('title')->get(['id', 'title']), 'features' => Feature::orderBy('sort_order')->get()];
    }

    private function contentRelations(): array
    {
        return ['city.state', 'features', 'mediaAssets', 'floorPlans', 'constructionStages', 'faqs', 'seo'];
    }
}
