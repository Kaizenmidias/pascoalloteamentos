<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subdivisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subdivision_type_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('development_status_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->string('legacy_source')->nullable();
            $table->unsignedBigInteger('legacy_id')->nullable();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('reference_code')->nullable()->unique();
            $table->text('excerpt')->nullable();
            $table->longText('description')->nullable();
            $table->string('address')->nullable();
            $table->string('neighborhood')->nullable();
            $table->string('postal_code', 12)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('address_number', 30)->nullable();
            $table->string('complement')->nullable();
            $table->string('commercial_purpose', 20)->nullable();
            $table->string('commercial_status', 30)->nullable();
            $table->string('about_title')->nullable();
            $table->longText('about_text')->nullable();
            $table->unsignedInteger('total_lots')->nullable();
            $table->unsignedInteger('available_lots')->nullable();
            $table->decimal('minimum_lot_area', 12, 2)->nullable();
            $table->decimal('maximum_lot_area', 12, 2)->nullable();
            $table->decimal('regular_price', 15, 2)->nullable();
            $table->decimal('sale_price', 15, 2)->nullable();
            $table->boolean('price_on_request')->default(false);
            $table->string('promotion_headline')->nullable();
            $table->string('promotion_url')->nullable();
            $table->date('expected_delivery_date')->nullable();
            $table->string('whatsapp_contact', 30)->nullable();
            $table->string('status', 20)->default('draft');
            $table->boolean('featured')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'published_at']);
            $table->index(['city_id', 'subdivision_type_id']);
            $table->index(['available_lots', 'sale_price']);
            $table->unique(['legacy_source', 'legacy_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subdivisions');
    }
};
