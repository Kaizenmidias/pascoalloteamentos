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

    public function inspectLead(Lead $lead): array
    {
        $token = $this->accessToken();
        $dealsForContact = $this->inspectDealsForContact($token, $lead->rd_contact_id);
        $result = [
            'lead_id' => $lead->id,
            'rd_contact_id' => $lead->rd_contact_id,
            'rd_deal_id' => $lead->rd_deal_id,
            'rd_sync_status' => $lead->rd_sync_status,
            'contact' => $this->inspectRemoteResource($token, 'contacts/'.$lead->rd_contact_id, function (array $data): array {
                $dealIds = array_values(array_filter(array_merge(
                    is_array($data['deal_ids'] ?? null) ? $data['deal_ids'] : [],
                    collect($data['deals'] ?? [])->map(fn ($deal) => is_array($deal) ? ($deal['id'] ?? null) : $deal)->all(),
                )));

                return [
                    'contact_id' => $data['id'] ?? null,
                    'contact_has_name' => filled($data['name'] ?? null),
                    'contact_has_email' => ! empty($data['emails']) || filled($data['email'] ?? null),
                    'contact_has_phone' => ! empty($data['phones']) || filled($data['phone'] ?? null),
                    'contact_deal_count' => count($dealIds),
                    'contact_deal_ids' => $dealIds,
                    'contact_data_keys' => array_keys($data),
                ];
            }),
            'deal' => $this->inspectRemoteResource($token, 'deals/'.$lead->rd_deal_id, function (array $data): array {
                $contactIds = array_values(array_filter(array_merge(
                    is_array($data['contact_ids'] ?? null) ? $data['contact_ids'] : [],
                    ($data['contact_id'] ?? null) ? [$data['contact_id']] : [],
                    collect($data['contacts'] ?? [])->map(fn ($contact) => is_array($contact) ? ($contact['id'] ?? null) : $contact)->all(),
                )));

                return [
                    'deal_id' => $data['id'] ?? null,
                    'owner_id' => $data['owner_id'] ?? null,
                    'stage_id' => $data['stage_id'] ?? null,
                    'contact_id' => $data['contact_id'] ?? null,
                    'contact_ids' => $data['contact_ids'] ?? [],
                    'contacts_count' => count($contactIds),
                    'contact_ids_from_collections' => $contactIds,
                    'deal_data_keys' => array_keys($data),
                ];
            }),
            'association_by_deal_get' => false,
            'association_by_contact_get' => false,
            'association_by_deals_filter' => in_array((string) $lead->rd_deal_id, $dealsForContact['deal_ids'], true),
            'deals_found_for_contact' => $dealsForContact['count'],
            'deal_ids_found_for_contact' => $dealsForContact['deal_ids'],
        ];

        $result['association_by_deal_get'] = $this->associationFlag($lead->rd_deal_id, $lead->rd_contact_id, $result['deal']);
        $result['association_by_contact_get'] = in_array((string) $lead->rd_deal_id, $result['contact']['contact_deal_ids'] ?? [], true);

        return $result;
    }

    private function inspectDealsForContact(?string $token, ?string $contactId): array
    {
        if (! $token || ! $contactId) {
            return ['count' => 0, 'deal_ids' => []];
        }

        $data = $this->requestWithRetry($token, 'get', 'deals', [
            'filter' => 'contact_id:'.$contactId,
        ])->json('data');
        $dealIds = collect(is_array($data) ? $data : [])
            ->map(fn ($deal) => is_array($deal) ? ($deal['id'] ?? null) : null)
            ->filter()
            ->values()
            ->all();

        return ['count' => count($dealIds), 'deal_ids' => $dealIds];
    }

    private function associationFlag(?string $dealId, ?string $contactId, array $deal): bool
    {
        return $dealId !== null && $contactId !== null && $this->dealHasContact($deal, $contactId);
    }

    public function repairLeadContact(Lead $lead): array
    {
        $token = $this->accessToken();
        $contactId = (string) $lead->rd_contact_id;
        $dealId = (string) $lead->rd_deal_id;
        $result = [
            'lead_id' => $lead->id,
            'deal_id' => $dealId ?: null,
            'contact_id' => $contactId ?: null,
            'association_before' => false,
            'association_after' => false,
            'status' => 'failed_association',
        ];

        if (! $token || $contactId === '' || $dealId === '') {
            $result['status'] = 'invalid_reference';
            return $result;
        }

        try {
            $contact = $this->requestWithRetry($token, 'get', 'contacts/'.rawurlencode($contactId), [])->json('data');
            $deal = $this->requestWithRetry($token, 'get', 'deals/'.rawurlencode($dealId), [])->json('data');
        } catch (RequestException $exception) {
            if ($exception->response?->status() === 404) {
                $result['status'] = 'remote_resource_missing';
                return $result;
            }
            throw $exception;
        }

        if (! is_array($contact) || ! is_array($deal)) {
            $result['status'] = 'remote_resource_missing';
            return $result;
        }

        $result['association_before'] = $this->dealHasContact($deal, $contactId);
        if (! $result['association_before']) {
            $this->requestWithRetry($token, 'put', 'deals/'.rawurlencode($dealId), [
                'data' => ['contact_id' => $contactId],
            ]);
            $deal = $this->requestWithRetry($token, 'get', 'deals/'.rawurlencode($dealId), [])->json('data');
        }

        $result['association_after'] = is_array($deal) && $this->dealHasContact($deal, $contactId);
        if ($result['association_after']) {
            $result['status'] = 'synced';
        }

        return $result;
    }

    private function inspectRemoteResource(?string $token, string $path, callable $sanitize): array
    {
        if (! $token || str_ends_with($path, '/')) {
            return ['exists' => false];
        }

        try {
            $data = $this->requestWithRetry($token, 'get', $path, [])->json('data');
        } catch (RequestException $exception) {
            if ($exception->response?->status() === 404) {
                return ['exists' => false];
            }
            throw $exception;
        }

        return array_merge(['exists' => is_array($data)], is_array($data) ? $sanitize($data) : []);
    }

    public function sync(Lead $lead): void
    {
        Cache::lock('rd-station-lead-sync-'.$lead->id, 60)->block(10, fn () => $this->syncLead($lead));
    }

    private function syncLead(Lead $lead): void
    {
        $lead->refresh();
        if ($lead->rd_deal_id) {
            $repair = $this->repairLeadContact($lead);
            $lead->update(['rd_sync_status' => $repair['status'] === 'synced' ? 'synced' : 'failed_association']);
            return;
        }

        $lead->update(['rd_sync_status' => 'syncing']);
        $token = $this->accessToken();
        if (! $token) {
            $lead->update(['rd_sync_status' => 'not_connected']);
            return;
        }

        $email = $this->normalizeEmail($lead->email);
        $phone = $this->normalizePhone($lead->phone);
        $contact = $email
            ? $this->requestWithRetry($token, 'get', 'contacts', [
                'filter' => 'email:'.$email,
            ])->json('data.0')
            : null;

        if (! $contact) {
            $contact = $this->requestWithRetry($token, 'post', 'contacts', [
                'data' => array_filter([
                    'name' => trim($lead->name),
                    'emails' => $email ? [['email' => $email]] : null,
                    'phones' => $phone ? [['phone' => $phone, 'type' => 'work']] : null,
                ], fn ($value) => filled($value)),
            ])->json('data');
        } else {
            $missingFields = [];
            if (! $this->contactEmail($contact) && $email) {
                $missingFields['emails'] = [['email' => $email]];
            }
            if (! $this->contactPhone($contact) && $phone) {
                $missingFields['phones'] = [['phone' => $phone, 'type' => 'work']];
            }
            if ($missingFields) {
                $updatedContact = $this->requestWithRetry($token, 'put', 'contacts/'.rawurlencode($contact['id']), [
                    'data' => $missingFields,
                ])->json('data');
                if (is_array($updatedContact) && $updatedContact) {
                    $contact = $updatedContact;
                }
            }
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
            'rd_sync_status' => ! empty($remoteDeal['id']) ? 'syncing' : 'failed',
        ]);

        if (! empty($remoteDeal['id'])) {
            $repair = $this->repairLeadContact($lead->fresh());
            $lead->update(['rd_sync_status' => $repair['status'] === 'synced' ? 'synced' : 'failed_association']);
        }
    }

    private function dealHasContact(array $deal, string $contactId): bool
    {
        if (($deal['contact_id'] ?? null) === $contactId) {
            return true;
        }
        if (in_array($contactId, $deal['contact_ids'] ?? [], true)) {
            return true;
        }

        foreach ($deal['contacts'] ?? [] as $contact) {
            if (is_array($contact) && ($contact['id'] ?? null) === $contactId) {
                return true;
            }
            if (is_string($contact) && $contact === $contactId) {
                return true;
            }
        }

        return false;
    }

    private function normalizeEmail(?string $email): ?string
    {
        $email = strtolower(trim((string) $email));

        return $email !== '' ? $email : null;
    }

    private function normalizePhone(?string $phone): ?string
    {
        $digits = preg_replace('/\D+/', '', trim((string) $phone)) ?? '';
        if (str_starts_with($digits, '00')) {
            $digits = substr($digits, 2);
        }
        if ($digits === '') {
            return null;
        }
        if (str_starts_with($digits, '55')) {
            return '+'.$digits;
        }
        if (in_array(strlen($digits), [10, 11], true)) {
            return '+55'.$digits;
        }

        return strlen($digits) >= 8 ? '+'.$digits : null;
    }

    private function contactEmail(array $contact): ?string
    {
        return $this->normalizeEmail(data_get($contact, 'emails.0.email') ?? $contact['email'] ?? null);
    }

    private function contactPhone(array $contact): ?string
    {
        return $this->normalizePhone(data_get($contact, 'phones.0.phone') ?? $contact['phone'] ?? null);
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
