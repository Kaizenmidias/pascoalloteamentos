<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('subdivision_promotions')) {
            return;
        }

        Schema::create('subdivision_promotions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subdivision_id')->constrained('subdivisions')->cascadeOnDelete();
            $table->foreignId('media_asset_id')->nullable()->constrained('media_assets')->nullOnDelete();
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
            $table->index(['subdivision_id', 'is_active', 'sort_order'], 'subdivision_promotions_public_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subdivision_promotions');
    }
};
