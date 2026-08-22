<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLeadRequest;
use App\Models\Lead;
use App\Mail\LeadSubmitted;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class LeadController extends Controller
{
    public function store(StoreLeadRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $source = match (true) {
            ! empty($data['property_id']) => ['property', 'Imóvel', \App\Models\Property::find($data['property_id'])?->title],
            ! empty($data['condominium_id']) => ['condominium', 'Condomínio', \App\Models\Condominium::find($data['condominium_id'])?->title],
            ! empty($data['subdivision_id']) => ['subdivision', 'Loteamento', \App\Models\Subdivision::find($data['subdivision_id'])?->title],
            default => ['contact', 'Contato', null],
        };
        $lead = Lead::create([...$data, 'metadata' => ['source_type' => $source[0], 'source_label' => $source[1], 'product_name' => $source[2]], 'consented_at' => now()]);

        try {
            Mail::to(config('leads.mail_to'))->queue(new LeadSubmitted($lead));
        } catch (\Throwable $exception) {
            Log::error('Lead salvo, mas a notificação não pôde ser enfileirada.', ['lead_id' => $lead->id, 'exception' => $exception->getMessage()]);
        }

        return back()->with('success', 'Recebemos seu contato. Nossa equipe falará com você em breve.');
    }
}
