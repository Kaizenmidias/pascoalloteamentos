<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RdStationCrmService
{
    private const BASE = 'https://api.rd.services/crm/v2/';

    public function authorizationUrl(): string
    {
        return 'https://accounts.rdstation.com/oauth/authorize?'.http_build_query(['response_type' => 'code', 'client_id' => config('services.rdstation.client_id'), 'redirect_uri' => config('services.rdstation.redirect_uri')]);
    }

    public function exchangeCode(string $code): void
    {
        $response = Http::asForm()->post('https://api.rd.services/oauth2/token', ['grant_type' => 'authorization_code', 'code' => $code, 'client_id' => config('services.rdstation.client_id'), 'client_secret' => config('services.rdstation.client_secret'), 'redirect_uri' => config('services.rdstation.redirect_uri')])->throw()->json();
        $this->storeTokens($response);
    }

    public function sync(Lead $lead): void
    {
        $token = $this->accessToken();
        if (! $token) return;
        $headers = ['Authorization' => 'Bearer '.$token];
        $contact = null;
        if ($lead->email) $contact = Http::withHeaders($headers)->get(self::BASE.'contacts', ['filter' => 'email:'.$lead->email])->throw()->json('data.0');
        $contact ??= Http::withHeaders($headers)->asJson()->post(self::BASE.'contacts', ['data' => array_filter(['name' => $lead->name, 'email' => $lead->email, 'phone' => $lead->phone], fn ($v) => filled($v))])->throw()->json('data');
        $metadata = is_array($lead->metadata) ? $lead->metadata : [];
        $deal = ['name' => 'Lead Site - '.$lead->name.(! empty($metadata['product_name']) ? ' - '.$metadata['product_name'] : ''), 'status' => 'ongoing', 'contact_id' => $contact['id']];
        if (config('services.rdstation.pipeline_id')) $deal['pipeline_id'] = config('services.rdstation.pipeline_id');
        if (config('services.rdstation.stage_id')) $deal['stage_id'] = config('services.rdstation.stage_id');
        Http::withHeaders($headers)->asJson()->post(self::BASE.'deals', ['data' => $deal])->throw();
    }

    private function accessToken(): ?string
    {
        $setting = SiteSetting::where('key', 'rdstation_crm_tokens')->first();
        $tokens = $setting?->value ?: [];
        if (! empty($tokens['expires_at']) && now()->lt($tokens['expires_at'])) return $tokens['access_token'] ?? null;
        if (empty($tokens['refresh_token'])) return null;
        $response = Http::asForm()->post('https://api.rd.services/oauth2/token', ['grant_type' => 'refresh_token', 'refresh_token' => $tokens['refresh_token'], 'client_id' => config('services.rdstation.client_id'), 'client_secret' => config('services.rdstation.client_secret')])->throw()->json();
        $this->storeTokens($response);
        return $response['access_token'] ?? null;
    }

    private function storeTokens(array $response): void
    {
        SiteSetting::updateOrCreate(['key' => 'rdstation_crm_tokens'], ['group' => 'integrations', 'value' => ['access_token' => $response['access_token'], 'refresh_token' => $response['refresh_token'] ?? null, 'expires_at' => now()->addSeconds((int) ($response['expires_in'] ?? 7200) - 60)->toIso8601String()], 'is_public' => false]);
    }
}
