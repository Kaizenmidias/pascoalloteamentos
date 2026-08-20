<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCondominiumRequest;
use App\Http\Requests\Admin\UpdateCondominiumRequest;
use App\Models\BusinessType;
use App\Models\State;
use App\Models\Condominium;
use App\Models\CondominiumType;
use App\Models\DevelopmentStatus;
use App\Models\Feature;
use App\Services\Admin\RealEstateContentService;
use App\Support\ConstructionStageCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class CondominiumController extends Controller
{
    public function __construct(private readonly RealEstateContentService $content) {}

    public function index(): Response
    {
        return Inertia::render('Admin/Condominiums/Index', ['items' => Condominium::with(['city', 'condominiumType'])->latest()->paginate(20)]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Condominiums/Form', ['item' => null, 'options' => $this->options()]);
    }

    public function store(StoreCondominiumRequest $request): RedirectResponse
    {
        $item = $this->content->save(new Condominium, $request->validated());

        return redirect()->route('admin.condominiums.edit', $item)->with('success', 'Condomínio criado.');
    }

    public function edit(Condominium $condominium): Response
    {
        return Inertia::render('Admin/Condominiums/Form', ['item' => $condominium->load(['city.state', 'features', 'mediaAssets', 'floorPlans.mediaAsset', 'promotions.mediaAsset', 'constructionStages', 'seo']), 'options' => $this->options()]);
    }

    public function update(UpdateCondominiumRequest $request, Condominium $condominium): RedirectResponse
    {
        $this->content->save($condominium, $request->validated());

        return redirect()->route('admin.condominiums.edit', $condominium)->with('success', 'Condomínio atualizado.');
    }

    private function options(): array
    {
        return ['states' => State::orderBy('name')->get(['id', 'name', 'code']), 'types' => CondominiumType::where('is_active', true)->orderBy('sort_order')->get(), 'statuses' => DevelopmentStatus::where('is_active', true)->orderBy('sort_order')->get(), 'businessTypes' => Schema::hasTable('business_types') ? BusinessType::where('is_active', true)->orderBy('sort_order')->get() : collect(), 'features' => Feature::with('iconMedia')->where('is_active', true)->where(fn ($query) => $query->whereNull('scope')->orWhere('scope', 'condominium'))->orderBy('sort_order')->get(), 'stageDefinitions' => ConstructionStageCatalog::definitionsFor(Condominium::class)];
    }
}
