<?php

namespace Tests\Feature;

use App\Models\IntegrationCredential;
use App\Models\Lead;
use App\Services\RdStationCrmService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RdStationCrmContactSyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_contact_uses_native_email_and_phone_fields(): void
    {
        $this->connect();
        config(['services.rdstation.owner_id' => 'owner-id']);
        $lead = $this->lead('  CLIENTE@EXAMPLE.TEST ', '(11) 99999-8888');

        Http::fake([
            'https://api.rd.services/crm/v2/contacts*' => function ($request) {
                if ($request->method() === 'GET') {
                    return Http::response(['data' => []]);
                }
                return Http::response(['data' => ['id' => 'contact-id']]);
            },
            'https://api.rd.services/crm/v2/deals*' => function ($request) {
                if ($request->method() === 'GET' && str_ends_with($request->url(), '/deals/deal-id')) {
                    return Http::response(['data' => ['id' => 'deal-id', 'contact_ids' => ['contact-id']]]);
                }
                return $request->method() === 'GET'
                    ? Http::response(['data' => []])
                    : Http::response(['data' => ['id' => 'deal-id']]);
            },
        ]);

        app(RdStationCrmService::class)->sync($lead);

        Http::assertSent(function ($request) {
            return $request->method() === 'POST'
                && str_ends_with($request->url(), '/contacts')
                && $request['data']['emails'] === [['email' => 'cliente@example.test']]
                && $request['data']['phones'] === [['phone' => '+5511999998888', 'type' => 'work']]
                && ! array_key_exists('email', $request['data'])
                && ! array_key_exists('phone', $request['data']);
        });
    }

    public function test_existing_contact_is_reused_and_only_missing_phone_is_added(): void
    {
        $this->connect();
        config(['services.rdstation.owner_id' => 'owner-id']);
        $lead = $this->lead('CLIENTE@example.test', '11988887777');

        Http::fake([
            'https://api.rd.services/crm/v2/contacts*' => function ($request) {
                if ($request->method() === 'GET') {
                    return Http::response(['data' => [[
                        'id' => 'contact-id',
                        'emails' => [['email' => 'cliente@example.test']],
                        'phones' => [],
                    ]]]);
                }
                return Http::response(['data' => ['id' => 'contact-id']]);
            },
            'https://api.rd.services/crm/v2/deals*' => function ($request) {
                if ($request->method() === 'GET' && str_ends_with($request->url(), '/deals/deal-id')) {
                    return Http::response(['data' => ['id' => 'deal-id', 'contact_ids' => ['contact-id']]]);
                }
                return $request->method() === 'GET'
                    ? Http::response(['data' => []])
                    : Http::response(['data' => ['id' => 'deal-id']]);
            },
        ]);

        app(RdStationCrmService::class)->sync($lead);

        Http::assertSent(function ($request) {
            return $request->method() === 'PUT'
                && str_ends_with($request->url(), '/contacts/contact-id')
                && $request['data'] === [
                    'phones' => [['phone' => '+5511988887777', 'type' => 'work']],
                ];
        });
        Http::assertNotSent(fn ($request) => $request->method() === 'POST'
            && str_ends_with($request->url(), '/contacts'));
    }

    public function test_existing_phone_is_not_overwritten(): void
    {
        $this->connect();
        config(['services.rdstation.owner_id' => 'owner-id']);
        $lead = $this->lead('cliente@example.test', '11999998888');

        Http::fake([
            'https://api.rd.services/crm/v2/contacts*' => Http::response(['data' => [[
                'id' => 'contact-id',
                'emails' => [['email' => 'cliente@example.test']],
                'phones' => [['phone' => '+5511888887777', 'type' => 'work']],
            ]]]),
            'https://api.rd.services/crm/v2/deals*' => Http::response(['data' => []]),
        ]);

        app(RdStationCrmService::class)->sync($lead);

        Http::assertNotSent(fn ($request) => $request->method() === 'PUT'
            && str_contains($request->url(), '/contacts/'));
    }

    private function connect(): void
    {
        IntegrationCredential::create([
            'provider' => 'rd_station_crm',
            'access_token' => 'test-access-token',
            'refresh_token' => 'test-refresh-token',
            'expires_at' => now()->addHour(),
        ]);
    }

    private function lead(string $email, string $phone): Lead
    {
        return Lead::create([
            'name' => 'Cliente Teste',
            'email' => $email,
            'phone' => $phone,
            'consent' => true,
        ]);
    }
}
