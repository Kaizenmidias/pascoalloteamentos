<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subdivision_section_images', function (Blueprint $table) {
            $table->text('description')->nullable()->after('title');
            $table->decimal('area', 10, 2)->nullable()->after('description');
            $table->unsignedInteger('bedrooms')->nullable()->after('area');
            $table->unsignedInteger('suites')->nullable()->after('bedrooms');
            $table->unsignedInteger('bathrooms')->nullable()->after('suites');
            $table->unsignedInteger('parking_spaces')->nullable()->after('bathrooms');
            $table->string('external_url')->nullable()->after('parking_spaces');
            $table->boolean('is_active')->default(true)->after('external_url');
        });
    }

    public function down(): void
    {
        Schema::table('subdivision_section_images', function (Blueprint $table) {
            $table->dropColumn(['description', 'area', 'bedrooms', 'suites', 'bathrooms', 'parking_spaces', 'external_url', 'is_active']);
        });
    }
};
