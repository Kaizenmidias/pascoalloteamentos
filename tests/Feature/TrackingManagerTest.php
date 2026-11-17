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

    public function test_google_ads_conversion_label_is_preserved_and_only_base_id_is_configured(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $destination = 'AW-18482697900/SjP9CPajqbodEKytnu1E';

        $this->actingAs($admin)->put('/admin/integrations', ['scripts' => [
            ['name' => 'WhatsApp', 'type' => 'google_ads', 'identifier' => $destination, 'position' => 'head', 'is_active' => true, 'sort_order' => 0],
            ['name' => 'GA4', 'type' => 'google_analytics', 'identifier' => 'G-ABC123', 'position' => 'head', 'is_active' => true, 'sort_order' => 1],
        ]])->assertSessionHasNoErrors()->assertRedirect();

        $this->assertDatabaseHas('tracking_scripts', ['type' => 'google_ads', 'identifier' => $destination]);
        $html = app(\App\Services\Tracking\TrackingManager::class)->head()->implode('');
        $this->assertStringContainsString('gtag/js?id=AW-18482697900"', $html);
        $this->assertStringContainsString('gtag(\'config\',"AW-18482697900");gtag(\'config\',"G-ABC123");', $html);
        $this->assertStringContainsString('["'.$destination.'"]', $html);
        $this->assertStringNotContainsString('gtag(\'config\',"'.$destination.'")', $html);
    }

    public function test_google_ads_base_id_remains_valid_and_malformed_labels_are_rejected(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $script = ['name' => 'Ads', 'type' => 'google_ads', 'identifier' => 'AW-18482697900', 'position' => 'head', 'is_active' => true, 'sort_order' => 0];
        $this->actingAs($admin)->put('/admin/integrations', ['scripts' => [$script]])->assertSessionHasNoErrors();

        foreach (['AW-18482697900/', 'AW-18482697900/label/extra', 'AW-18482697900/<script>'] as $identifier) {
            $this->put('/admin/integrations', ['scripts' => [array_replace($script, ['identifier' => $identifier])]])->assertSessionHasErrors('scripts');
        }
        $this->assertDatabaseHas('tracking_scripts', ['identifier' => 'AW-18482697900']);
    }

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
