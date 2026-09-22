<?php

namespace Tests\Feature;

use App\Models\IntegrationCredential;
use App\Models\Lead;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class DebugRdStationDealAssociationCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_debug_command_captures_one_put_without_changing_the_lead(): void
    {
        IntegrationCredential::create([
            'provider' => 'rd_station_crm',
            'access_token' => 'test-access-token',
            'refresh_token' => 'test-refresh-token',
            'expires_at' => now()->addHour(),
        ]);
        $lead = Lead::create([
            'name' => 'Cliente Teste',
            'email' => 'private@example.test',
            'phone' => '11999998888',
            'rd_contact_id' => 'contact-id',
            'rd_deal_id' => 'deal-id',
            'rd_sync_status' => 'failed_association',
            'consent' => true,
        ]);

        Http::fake([
            'https://api.rd.services/crm/v2/contacts/contact-id' => Http::response(['data' => ['id' => 'contact-id']]),
            'https://api.rd.services/crm/v2/deals/deal-id' => Http::sequence()
                ->push(['data' => ['id' => 'deal-id', 'contact_ids' => []]])
                ->push(['data' => ['id' => 'deal-id', 'contact_ids' => []]]),
            'https://api.rd.services/crm/v2/deals*' => Http::response(['data' => []], 200),
        ]);

        $this->artisan('rdstation:debug-deal-association', ['lead_id' => $lead->id])
            ->assertExitCode(0)
            ->expectsOutputToContain('"request_data_keys"')
            ->expectsOutputToContain('"http_status": 200')
            ->doesntExpectOutputToContain('private@example.test')
            ->doesntExpectOutputToContain('11999998888');

        Http::assertSentCount(5);
        Http::assertSent(fn ($request) => $request->method() === 'PUT'
            && $request['data'] === ['contact_id' => 'contact-id']);
        Http::assertNotSent(fn ($request) => $request->method() === 'POST');
        $this->assertSame('failed_association', $lead->fresh()->rd_sync_status);
    }
}
