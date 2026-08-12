<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLeadRequest;
use App\Models\Lead;
use Illuminate\Http\RedirectResponse;

class LeadController extends Controller
{
    public function store(StoreLeadRequest $request): RedirectResponse
    {
        Lead::create([...$request->validated(), 'consented_at' => now()]);

        return back()->with('success', 'Recebemos seu contato. Em breve falaremos com você.');
    }
}
