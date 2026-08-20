<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('features', 'icon_media_asset_id')) {
            Schema::table('features', function (Blueprint $table) {
                $table->foreignId('icon_media_asset_id')->nullable()->after('icon')->constrained('media_assets')->nullOnDelete();
            });
        }
        if (! Schema::hasColumn('features', 'legacy_source')) {
            Schema::table('features', function (Blueprint $table) {
                $table->string('legacy_source')->nullable()->after('sort_order');
            });
        }
        if (! Schema::hasColumn('features', 'legacy_id')) {
            Schema::table('features', function (Blueprint $table) {
                $table->unsignedBigInteger('legacy_id')->nullable()->after('legacy_source');
            });
        }
        if (! Schema::hasColumn('features', 'legacy_metadata')) {
            Schema::table('features', function (Blueprint $table) {
                $table->json('legacy_metadata')->nullable()->after('legacy_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('features', 'icon_media_asset_id')) {
            Schema::table('features', function (Blueprint $table) {
                $table->dropConstrainedForeignId('icon_media_asset_id');
            });
        }
        foreach (['legacy_metadata', 'legacy_id', 'legacy_source'] as $column) {
            if (Schema::hasColumn('features', $column)) {
                Schema::table('features', function (Blueprint $table) use ($column) {
                    $table->dropColumn($column);
                });
            }
        }
    }
};
