<?php

namespace App\Services;

use App\Models\Lead;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RdStationService
{
    public function sync(Lead $lead): void
    {
        $apiKey = (string) config('services.rdstation.api_key');
        if ($apiKey === '') return;

        $metadata = is_array($lead->metadata) ? $lead->metadata : [];
        $sourceType = (string) ($metadata['source_type'] ?? 'contact');
        $payload = array_filter([
            'name' => $lead->name,
            'email' => $lead->email,
            'personal_phone' => $lead->phone,
            'mobile_phone' => $lead->phone,
            'cf_message' => $lead->sanitizedMessage(),
            'cf_source_url' => $lead->source_url,
            'cf_product_name' => $metadata['product_name'] ?? null,
        ], static fn ($value) => $value !== null && $value !== '');

        $response = Http::asJson()->timeout(10)->post(config('services.rdstation.conversions_url').'?api_key='.urlencode($apiKey), [
            'event_type' => 'CONVERSION',
            'event_family' => 'CDP',
            'payload' => [
                'conversion_identifier' => 'contato-'.$sourceType,
                ...$payload,
            ],
        ]);

        if ($response->failed()) {
            Log::warning('Falha ao sincronizar lead com RD Station.', ['lead_id' => $lead->id, 'status' => $response->status(), 'body' => $response->body()]);
            $response->throw();
        }
    }
}
