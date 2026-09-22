<?php

namespace Tests\Feature;

use App\Models\IntegrationCredential;
use App\Models\Lead;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class InspectRdStationLeadCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_reads_and_sanitizes_contact_and_deal_data(): void
    {
        IntegrationCredential::create([
            'provider' => 'rd_station_crm',
            'access_token' => 'test-access-token',
            'refresh_token' => 'test-refresh-token',
            'expires_at' => now()->addHour(),
        ]);
        Lead::create([
            'name' => 'Cliente Teste',
            'email' => 'private@example.test',
            'phone' => '+5511999998888',
            'rd_contact_id' => 'contact-id',
            'rd_deal_id' => 'deal-id',
            'rd_sync_status' => 'synced',
            'consent' => true,
        ]);

        Http::fake([
            'https://api.rd.services/crm/v2/contacts/contact-id' => Http::response(['data' => [
                'id' => 'contact-id',
                'name' => 'Private Name',
                'emails' => [['email' => 'private@example.test']],
                'phones' => [['phone' => '+5511999998888']],
                'deal_ids' => ['deal-id'],
            ]]),
            'https://api.rd.services/crm/v2/deals/deal-id' => Http::response(['data' => [
                'id' => 'deal-id',
                'owner_id' => 'owner-id',
                'stage_id' => 'stage-id',
                'contact_ids' => ['contact-id'],
            ]]),
            'https://api.rd.services/crm/v2/deals*' => Http::response(['data' => []]),
        ]);

        $this->artisan('rdstation:inspect-lead', ['lead_id' => 1])
            ->assertExitCode(0)
            ->expectsOutputToContain('contact_has_email')
            ->expectsOutputToContain('contact_deal_ids')
            ->doesntExpectOutputToContain('private@example.test')
            ->doesntExpectOutputToContain('+5511999998888')
            ->doesntExpectOutputToContain('test-access-token');

        Http::assertSentCount(3);
        Http::assertNotSent(fn ($request) => in_array($request->method(), ['POST', 'PUT', 'PATCH'], true));
        $this->assertDatabaseHas('leads', ['id' => 1, 'rd_sync_status' => 'synced']);
    }

    public function test_command_reports_missing_remote_resources_without_writing(): void
    {
        IntegrationCredential::create([
            'provider' => 'rd_station_crm',
            'access_token' => 'test-access-token',
            'refresh_token' => 'test-refresh-token',
            'expires_at' => now()->addHour(),
        ]);
        Lead::create([
            'name' => 'Cliente Teste',
            'phone' => '11999998888',
            'rd_contact_id' => 'missing-contact',
            'rd_deal_id' => 'missing-deal',
            'rd_sync_status' => 'failed',
            'consent' => true,
        ]);
        Http::fake([
            'https://api.rd.services/crm/v2/contacts/missing-contact' => Http::response([], 404),
            'https://api.rd.services/crm/v2/deals/missing-deal' => Http::response([], 404),
            'https://api.rd.services/crm/v2/deals*' => Http::response([], 404),
        ]);

        $this->artisan('rdstation:inspect-lead', ['lead_id' => 1])
            ->assertExitCode(0)
            ->expectsOutputToContain('"exists": false');

        Http::assertNotSent(fn ($request) => in_array($request->method(), ['POST', 'PUT', 'PATCH'], true));
    }
}
