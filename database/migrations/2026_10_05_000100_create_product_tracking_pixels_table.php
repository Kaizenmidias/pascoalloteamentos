<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_tracking_pixels', function (Blueprint $table): void {
            $table->id();
            $table->morphs('trackable');
            $table->string('name');
            $table->string('pixel_id', 32);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['pixel_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_tracking_pixels');
    }
};
