<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BusinessType;
use App\Models\City;
use App\Models\CondominiumType;
use App\Models\DevelopmentStatus;
use App\Models\Feature;
use App\Models\PropertyType;
use App\Models\State;
use App\Models\SubdivisionType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Schema;
use App\Support\UniqueSlug;
use Inertia\Inertia;
use Inertia\Response;

class ClassificationController extends Controller
{
    private const GROUPS = [
        'property-types' => ['label' => 'Tipos de imóvel', 'model' => PropertyType::class],
        'condominium-types' => ['label' => 'Tipos de condomínio', 'model' => CondominiumType::class],
        'subdivision-types' => ['label' => 'Tipos de loteamento', 'model' => SubdivisionType::class],
        'development-statuses' => ['label' => 'Estágios da obra', 'model' => DevelopmentStatus::class],
        'business-types' => ['label' => 'Tipos de negócio', 'model' => BusinessType::class],
        'features' => ['label' => 'Diferenciais', 'model' => Feature::class],
        'states' => ['label' => 'Estados', 'model' => State::class],
        'cities' => ['label' => 'Cidades', 'model' => City::class],
    ];

    public function index(): Response
    {
        return Inertia::render('Admin/Classifications/Index', [
            'groups' => collect(self::GROUPS)->except(['states', 'cities'])->map(fn ($group, $slug) => [
                'slug' => $slug,
                'label' => $group['label'],
                'items' => $this->itemsFor($group['model']),
            ])->values(),
        ]);
    }

    public function store(Request $request, string $group): RedirectResponse
    {
        $definition = $this->definition($group);
        $data = $this->validateData($request, $definition['model']);

        $definition['model']::create($data);

        return back()->with('success', 'Classificação criada.');
    }

    public function update(Request $request, string $group, int $item): RedirectResponse
    {
        $definition = $this->definition($group);
        $record = $definition['model']::findOrFail($item);
        $data = $this->validateData($request, $definition['model'], $record);

        $record->update($data);

        return back()->with('success', 'Classificação atualizada.');
    }

    public function destroy(string $group, int $item): RedirectResponse
    {
        $definition = $this->definition($group);
        $definition['model']::findOrFail($item)->delete();

        return back()->with('success', 'Classificação removida.');
    }

    private function definition(string $group): array
    {
        abort_unless(isset(self::GROUPS[$group]), 404);

        return self::GROUPS[$group];
    }

    private function itemsFor(string $modelClass)
    {
        $table = (new $modelClass)->getTable();

        if (! Schema::hasTable($table)) {
            return collect();
        }

        $query = $modelClass::query();

        if (Schema::hasColumn($table, 'sort_order')) {
            $query->orderBy('sort_order');
        }

        $query->orderBy('name');

        return $query->get();
    }

    private function validateData(Request $request, string $modelClass, $record = null): array
    {
        $table = (new $modelClass)->getTable();

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'alpha_dash:ascii',
                'max:255',
                Rule::unique($table, 'slug')->ignore($record),
            ],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['nullable', 'boolean'],
        ];
        if ($modelClass === Feature::class) {
            $rules['icon'] = ['nullable', 'string', 'max:255'];
            $rules['category'] = ['nullable', 'string', 'max:255'];
        }

        $validated = $request->validate($rules);

        $validated['slug'] = $request->filled('slug') ? Str::slug($request->string('slug')->toString()) : UniqueSlug::for($table, $request->string('name')->toString(), $record?->id, 'classificacao');
        $validated['sort_order'] = (int) $request->input('sort_order', 0);
        $validated['is_active'] = $request->boolean('is_active', true);
        if ($modelClass !== Feature::class) {
            unset($validated['category']);
        }

        return $validated;
    }
}
