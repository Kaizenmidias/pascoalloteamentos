<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        foreach (['properties', 'condominiums', 'subdivisions'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->foreignId('business_type_id')->nullable()->after('development_status_id')->constrained()->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        foreach (['subdivisions', 'condominiums', 'properties'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropConstrainedForeignId('business_type_id');
            });
        }

        Schema::dropIfExists('business_types');
    }
};
