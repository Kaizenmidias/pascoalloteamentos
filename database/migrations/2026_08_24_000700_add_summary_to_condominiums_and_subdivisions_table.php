<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('condominiums', function (Blueprint $table): void {
            $table->text('summary')->nullable()->after('excerpt');
        });

        Schema::table('subdivisions', function (Blueprint $table): void {
            $table->text('summary')->nullable()->after('excerpt');
        });
    }

    public function down(): void
    {
        Schema::table('subdivisions', function (Blueprint $table): void {
            $table->dropColumn('summary');
        });

        Schema::table('condominiums', function (Blueprint $table): void {
            $table->dropColumn('summary');
        });
    }
};