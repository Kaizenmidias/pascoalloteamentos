<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function cities(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'state_id' => ['required', 'integer', 'exists:states,id'],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $cities = City::query()
            ->where('state_id', $validated['state_id'])
            ->when($validated['q'] ?? null, fn ($query, $term) => $query->where('name', 'like', '%'.$term.'%'))
            ->orderBy('name')
            ->limit(50)
            ->get(['id', 'state_id', 'name', 'slug']);

        return response()->json(['cities' => $cities]);
    }
}
