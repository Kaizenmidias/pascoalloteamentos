<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BusinessType;
use App\Models\CondominiumType;
use App\Models\DevelopmentStatus;
use App\Models\PropertyType;
use App\Models\SubdivisionType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
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
    ];

    public function index(): Response
    {
        return Inertia::render('Admin/Classifications/Index', [
            'groups' => collect(self::GROUPS)->map(fn ($group, $slug) => [
                'slug' => $slug,
                'label' => $group['label'],
                'items' => $group['model']::orderBy('sort_order')->orderBy('name')->get(),
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

    private function validateData(Request $request, string $modelClass, $record = null): array
    {
        $table = (new $modelClass)->getTable();

        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'alpha_dash:ascii',
                'max:255',
                Rule::unique($table, 'slug')->ignore($record),
            ],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['nullable', 'boolean'],
        ]) + [
            'slug' => Str::slug($request->string('slug')->toString() ?: $request->string('name')->toString()),
            'sort_order' => (int) $request->input('sort_order', 0),
            'is_active' => $request->boolean('is_active', true),
        ];
    }
}
