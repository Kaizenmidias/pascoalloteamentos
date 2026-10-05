<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_tracking_pixels', function (Blueprint $table): void {
            $table->string('type', 40)->default('meta_pixel')->after('name');
            $table->string('identifier')->nullable()->after('type');
            $table->longText('code')->nullable()->after('identifier');
            $table->string('position', 20)->default('head')->after('code');
        });

        Schema::table('product_tracking_pixels', function (Blueprint $table): void {
            $table->index(['type', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::table('product_tracking_pixels', function (Blueprint $table): void {
            $table->dropIndex(['product_tracking_pixels_type_is_active_index']);
            $table->dropColumn(['type', 'identifier', 'code', 'position']);
        });
    }
};
