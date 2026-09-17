<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IntegrationCredential extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'access_token' => 'encrypted',
            'refresh_token' => 'encrypted',
            'expires_at' => 'datetime',
        ];
    }
}
