<?php

namespace App\Services;

use App\Models\IntegrationCredential;
use App\Models\Lead;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\RequestException;

class RdStationCrmService
{
    private const PROVIDER = 'rd_station_crm';
    private const BASE = 'https://api.rd.services/crm/v2/';
    private const TOKEN_URL = 'https://api.rd.services/oauth2/token';

    public function authorizationUrl(): string
    {
        return 'https://accounts.rdstation.com/oauth/authorize?'.http_build_query([
            'response_type' => 'code',
            'client_id' => config('services.rdstation.client_id'),
            'redirect_uri' => config('services.rdstation.redirect_uri'),
        ]);
    }

    public function exchangeCode(string $code): void
    {
        $response = Http::asForm()->post(self::TOKEN_URL, [
            'grant_type' => 'authorization_code',
            'code' => $code,
            'client_id' => config('services.rdstation.client_id'),
            'client_secret' => config('services.rdstation.client_secret'),
            'redirect_uri' => config('services.rdstation.redirect_uri'),
        ])->throw()->json();

        $this->storeTokens($response);
    }

    public function isConnected(): bool
    {
        $credential = IntegrationCredential::where('provider', self::PROVIDER)->first();

        return (bool) ($credential?->access_token || $credential?->refresh_token);
    }

    public function users(): array
    {
        $token = $this->accessToken();
        if (! $token) return [];

        return collect($this->requestWithRetry($token, 'get', 'users', [])->json('data') ?: [])->map(fn (array $user) => [
            'id' => $user['id'] ?? null,
            'name' => $user['name'] ?? null,
            'email' => $user['email'] ?? null,
        ])->values()->all();
    }

    public function pipelines(): array
    {
        $token = $this->accessToken();
        if (! $token) return [];

        return collect($this->requestWithRetry($token, 'get', 'pipelines', [])->json('data') ?: [])->map(fn (array $pipeline) => [
            'id' => $pipeline['id'] ?? null,
            'name' => $pipeline['name'] ?? null,
        ])->filter(fn (array $pipeline) => $pipeline['id'] && $pipeline['name'])->values()->all();
    }

    public function pipelineStages(string $pipelineId): array
    {
        $token = $this->accessToken();
        if (! $token) return [];

        return collect($this->requestWithRetry($token, 'get', 'pipelines/'.rawurlencode($pipelineId).'/stages', [])->json('data') ?: [])->map(fn (array $stage) => [
            'id' => $stage['id'] ?? null,
            'name' => $stage['name'] ?? null,
        ])->filter(fn (array $stage) => $stage['id'] && $stage['name'])->values()->all();
    }

    public function sync(Lead $lead): void
    {
        Cache::lock('rd-station-lead-sync-'.$lead->id, 60)->block(10, fn () => $this->syncLead($lead));
    }

    private function syncLead(Lead $lead): void
    {
        $lead->refresh();
        if ($lead->rd_deal_id) return;

        $lead->update(['rd_sync_status' => 'syncing']);
        $token = $this->accessToken();
        if (! $token) {
            $lead->update(['rd_sync_status' => 'not_connected']);
            return;
        }

        $contact = $this->requestWithRetry($token, 'get', 'contacts', [
            'filter' => 'email:'.$lead->email,
        ])->json('data.0');

        if (! $contact) {
            $contact = $this->requestWithRetry($token, 'post', 'contacts', [
                'data' => array_filter([
                    'name' => $lead->name,
                    'email' => $lead->email,
                    'phone' => $lead->phone,
                ], fn ($value) => filled($value)),
            ])->json('data');
        }

        $ownerId = config('services.rdstation.owner_id');
        if (! $ownerId) {
            $lead->update(['rd_sync_status' => 'missing_owner']);
            Log::warning('RD Station CRM deal skipped: owner is not configured.', [
                'operation' => 'create_deal',
                'lead_id' => $lead->id,
            ]);
            return;
        }

        $metadata = is_array($lead->metadata) ? $lead->metadata : [];
        $deal = [
            'name' => 'Lead Site #'.$lead->id.' - '.$lead->name.(! empty($metadata['product_name']) ? ' - '.$metadata['product_name'] : ''),
            'status' => 'ongoing',
            'contact_id' => $contact['id'],
            'owner_id' => $ownerId,
        ];
        if (config('services.rdstation.stage_id')) {
            $deal['stage_id'] = config('services.rdstation.stage_id');
        }

        $existingDeals = $this->requestWithRetry($token, 'get', 'deals', [
            'filter' => 'contact_id:'.$contact['id'],
        ])->json('data');
        foreach (is_array($existingDeals) ? $existingDeals : [] as $candidate) {
            if (($candidate['name'] ?? null) === $deal['name']) {
                $lead->update([
                    'rd_contact_id' => $contact['id'],
                    'rd_deal_id' => $candidate['id'],
                    'rd_sync_status' => 'synced',
                ]);
                return;
            }
        }

        try {
            $remoteDeal = $this->requestWithRetry($token, 'post', 'deals', ['data' => $deal])->json('data');
        } catch (RequestException $exception) {
            if ($exception->response?->status() !== 422) throw $exception;

            $lead->update(['rd_sync_status' => 'failed_validation']);
            Log::warning('RD Station CRM validation error.', [
                'operation' => 'create_deal',
                'lead_id' => $lead->id,
                'status' => 422,
                'errors' => $exception->response->json('errors'),
            ]);
            return;
        }
        $lead->update([
            'rd_contact_id' => $contact['id'],
            'rd_deal_id' => $remoteDeal['id'] ?? null,
            'rd_sync_status' => ! empty($remoteDeal['id']) ? 'synced' : 'failed',
        ]);
    }

    private function accessToken(bool $forceRefresh = false): ?string
    {
        $credential = IntegrationCredential::where('provider', self::PROVIDER)->first();
        if (! $credential) {
            $legacy = SiteSetting::where('key', 'rdstation_crm_tokens')->first()?->value ?: [];
            if (empty($legacy['access_token']) && empty($legacy['refresh_token'])) return null;
            $credential = IntegrationCredential::create([
                'provider' => self::PROVIDER,
                'access_token' => $legacy['access_token'] ?? null,
                'refresh_token' => $legacy['refresh_token'] ?? null,
                'expires_at' => $legacy['expires_at'] ?? null,
            ]);
        }

        if (! $forceRefresh && $credential->access_token && $credential->expires_at?->isFuture()) {
            return $credential->access_token;
        }

        return Cache::lock('rd-station-token-refresh', 30)->block(10, function () use ($credential, $forceRefresh) {
            $credential->refresh();
            if (! $forceRefresh && $credential->access_token && $credential->expires_at?->isFuture()) {
                return $credential->access_token;
            }
            if (! $credential->refresh_token) {
                return null;
            }

            $response = Http::asForm()->post(self::TOKEN_URL, [
                'grant_type' => 'refresh_token',
                'refresh_token' => $credential->refresh_token,
                'client_id' => config('services.rdstation.client_id'),
                'client_secret' => config('services.rdstation.client_secret'),
            ])->throw()->json();

            $this->storeTokens($response);
            return $response['access_token'] ?? null;
        });
    }

    private function requestWithRetry(string $token, string $method, string $path, array $payload): \Illuminate\Http\Client\Response
    {
        $request = Http::withToken($token);
        $response = $method === 'get'
            ? $request->get(self::BASE.$path, $payload)
            : $request->asJson()->{$method}(self::BASE.$path, $payload);
        if ($response->status() !== 401) {
            return $response->throw();
        }

        $freshToken = $this->accessToken(true);
        if (! $freshToken || $freshToken === $token) {
            return $response->throw();
        }

        return $method === 'get'
            ? Http::withToken($freshToken)->get(self::BASE.$path, $payload)->throw()
            : Http::withToken($freshToken)->asJson()->{$method}(self::BASE.$path, $payload)->throw();
    }

    private function storeTokens(array $response): void
    {
        IntegrationCredential::updateOrCreate(['provider' => self::PROVIDER], [
            'access_token' => $response['access_token'],
            'refresh_token' => $response['refresh_token'] ?? null,
            'expires_at' => now()->addSeconds(max(60, (int) ($response['expires_in'] ?? 7200) - 300)),
        ]);
    }
}
