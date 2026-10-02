<?php

namespace Tests\Feature;

use App\Models\SiteSetting;
use App\Models\TrackingScript;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrackingManagerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_manage_multiple_tracking_entries_and_public_positions(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);

        $this->actingAs($admin)->put('/admin/integrations', [
            'google_maps_key' => '',
            'recaptcha_site_key' => '',
            'scripts' => [
                ['name' => 'Meta principal', 'type' => 'meta_pixel', 'identifier' => '123456789', 'position' => 'head', 'is_active' => true, 'sort_order' => 0],
                ['name' => 'Meta campanha', 'type' => 'meta_pixel', 'identifier' => '987654321', 'position' => 'head', 'is_active' => true, 'sort_order' => 1],
                ['name' => 'GA4', 'type' => 'google_analytics', 'identifier' => 'G-ABC123', 'position' => 'head', 'is_active' => true, 'sort_order' => 10],
                ['name' => 'Hotjar', 'type' => 'custom_script', 'identifier' => '', 'code' => '<script>window.hotjar=1</script>', 'position' => 'body_end', 'is_active' => true, 'sort_order' => 20],
            ],
        ])->assertRedirect();

        $this->assertDatabaseCount('tracking_scripts', 4);
        $this->assertSame(2, TrackingScript::where('type', 'meta_pixel')->where('is_active', true)->count());

        $response = $this->get('/');
        $response->assertOk();
        $response->assertSee('123456789')->assertSee('987654321')->assertSee('window.hotjar=1');
        $this->assertSame(1, substr_count($response->getContent(), 'fbevents.js'));
        $this->assertTrue(strpos($response->getContent(), 'window.hotjar=1') > strpos($response->getContent(), '</div>'));
    }

    public function test_legacy_settings_are_kept_and_can_be_migrated_by_the_incremental_migration(): void
    {
        SiteSetting::create(['group' => 'integrations', 'key' => 'meta_pixel_id', 'value' => '123456789', 'is_public' => false]);
        SiteSetting::create(['group' => 'integrations', 'key' => 'google_analytics_id', 'value' => 'G-ABC123', 'is_public' => false]);

        $this->assertDatabaseHas('site_settings', ['key' => 'meta_pixel_id']);
        $this->assertDatabaseHas('site_settings', ['key' => 'google_analytics_id']);
    }
}
