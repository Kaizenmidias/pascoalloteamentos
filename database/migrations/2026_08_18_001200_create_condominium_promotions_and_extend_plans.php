<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('condominiums', function (Blueprint $table) {
            $table->string('floor_plans_title')->nullable()->after('floor_plans_support_text');
        });

        Schema::table('floor_plans', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('external_url');
        });

        Schema::create('condominium_promotions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condominium_id')->constrained()->cascadeOnDelete();
            $table->foreignId('media_asset_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name')->nullable();
            $table->string('title');
            $table->text('text')->nullable();
            $table->decimal('original_price', 15, 2)->nullable();
            $table->decimal('promotional_price', 15, 2)->nullable();
            $table->string('button_text')->nullable();
            $table->string('button_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['condominium_id', 'is_active', 'sort_order'], 'condo_promotions_public_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('condominium_promotions');
        Schema::table('floor_plans', fn (Blueprint $table) => $table->dropColumn('is_active'));
        Schema::table('condominiums', fn (Blueprint $table) => $table->dropColumn('floor_plans_title'));
    }
};
