<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UsernameAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_administrator_can_sign_in_with_username(): void
    {
        User::factory()->create([
            'username' => 'kaizen',
            'password' => 'Kaizen@@2026',
        ]);

        $this->post('/login', [
            'login' => 'kaizen',
            'password' => 'Kaizen@@2026',
        ])->assertRedirect('/admin');

        $this->assertAuthenticated();
    }

    public function test_an_administrator_can_sign_in_with_email(): void
    {
        User::factory()->create([
            'email' => 'kaizen@pascoalloteamentos.local',
            'username' => 'kaizen',
            'password' => 'Kaizen@@2026',
        ]);

        $this->post('/login', [
            'login' => 'kaizen@pascoalloteamentos.local',
            'password' => 'Kaizen@@2026',
        ])->assertRedirect('/admin');

        $this->assertAuthenticated();
    }
}
