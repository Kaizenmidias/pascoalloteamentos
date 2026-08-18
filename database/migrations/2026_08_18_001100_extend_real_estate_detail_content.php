<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['properties', 'condominiums', 'subdivisions'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->foreignId('about_media_id')->nullable()->constrained('media_assets')->nullOnDelete();
                $table->foreignId('promotion_media_id')->nullable()->constrained('media_assets')->nullOnDelete();
                $table->json('legacy_metadata')->nullable();
            });
        }

        Schema::table('properties', function (Blueprint $table) {
            $table->text('floor_plans_support_text')->nullable();
        });

        Schema::table('floor_plans', function (Blueprint $table) {
            $table->string('external_url')->nullable();
        });

        Schema::table('faqs', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('answer');
        });
    }

    public function down(): void
    {
        Schema::table('faqs', fn (Blueprint $table) => $table->dropColumn('is_active'));
        Schema::table('floor_plans', fn (Blueprint $table) => $table->dropColumn('external_url'));
        Schema::table('properties', fn (Blueprint $table) => $table->dropColumn('floor_plans_support_text'));

        foreach (['properties', 'condominiums', 'subdivisions'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropConstrainedForeignId('about_media_id');
                $table->dropConstrainedForeignId('promotion_media_id');
                $table->dropColumn('legacy_metadata');
            });
        }
    }
};
