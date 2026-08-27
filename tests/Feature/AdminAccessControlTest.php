<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessControlTest extends TestCase
{
    use RefreshDatabase;

    public function test_editor_can_access_content_and_leads_but_not_admin_only_sections(): void
    {
        $editor = User::factory()->create(['role' => 'editor', 'is_active' => true]);
        $property = Property::create(['title' => 'Casa do Editor', 'slug' => 'casa-do-editor', 'status' => 'draft', 'commercial_purpose' => 'sale']);

        $this->actingAs($editor)->get('/admin')->assertOk();
        $this->actingAs($editor)->get('/admin/leads')->assertOk();
        $this->actingAs($editor)->get('/admin/properties/create')->assertOk();
        $this->actingAs($editor)->get('/admin/blog/posts/create')->assertOk();

        $this->actingAs($editor)->get('/admin/users')->assertForbidden();
        $this->actingAs($editor)->get('/admin/settings')->assertForbidden();
        $this->actingAs($editor)->get('/admin/integrations')->assertForbidden();
        $this->actingAs($editor)->get('/admin/pages')->assertForbidden();
        $this->actingAs($editor)->get('/admin/classifications')->assertForbidden();
        $this->actingAs($editor)->get('/admin/blog/categories')->assertForbidden();
        $this->actingAs($editor)->delete(route('admin.properties.destroy', $property))->assertForbidden();
    }

    public function test_admin_keeps_full_access_to_sensitive_sections(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);

        $this->actingAs($admin)->get('/admin/users')->assertOk();
        $this->actingAs($admin)->get('/admin/settings')->assertOk();
        $this->actingAs($admin)->get('/admin/integrations')->assertOk();
        $this->actingAs($admin)->get('/admin/pages')->assertOk();
        $this->actingAs($admin)->get('/admin/classifications')->assertOk();
        $this->actingAs($admin)->get('/admin/blog/categories')->assertOk();
    }
}