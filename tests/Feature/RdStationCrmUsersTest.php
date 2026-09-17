<?php

namespace Tests\Feature;

use App\Models\IntegrationCredential;
use App\Services\RdStationCrmService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RdStationCrmUsersTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_lists_safe_fields_without_server_filter(): void
    {
        IntegrationCredential::create([
            'provider' => 'rd_station_crm',
            'access_token' => 'test-access-token',
            'refresh_token' => 'test-refresh-token',
            'expires_at' => now()->addHour(),
        ]);

        Http::fake([
            'https://api.rd.services/crm/v2/users' => Http::response([
                'data' => [[
                    'id' => 'user-id',
                    'name' => 'Site owner',
                    'email' => 'owner@example.test',
                    'avatar_url' => 'https://example.test/avatar',
                ]],
            ]),
        ]);

        $users = app(RdStationCrmService::class)->users();

        $this->assertSame([[
            'id' => 'user-id',
            'name' => 'Site owner',
            'email' => 'owner@example.test',
        ]], $users);
        Http::assertSent(fn ($request) => $request->method() === 'GET'
            && $request->url() === 'https://api.rd.services/crm/v2/users');
    }
}
