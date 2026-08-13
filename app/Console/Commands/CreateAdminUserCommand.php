<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdminUserCommand extends Command
{
    protected $signature = 'pascoal:create-admin {email} {--name=Administrador}';

    protected $description = 'Cria ou atualiza com segurança o usuário inicial do painel';

    public function handle(): int
    {
        $password = $this->secret('Senha (mínimo de 12 caracteres)');
        if (! is_string($password) || mb_strlen($password) < 12) {
            $this->error('A senha deve ter pelo menos 12 caracteres.');

            return self::FAILURE;
        }

        User::updateOrCreate(
            ['email' => (string) $this->argument('email')],
            ['name' => (string) $this->option('name'), 'password' => Hash::make($password), 'role' => 'admin', 'is_active' => true, 'email_verified_at' => now()],
        );

        $this->info('Usuário administrativo disponível.');

        return self::SUCCESS;
    }
}
