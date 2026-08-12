<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_type_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('development_status_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('condominium_id')->nullable();
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
            $table->string('commercial_purpose', 20)->default('sale');
            $table->string('commercial_status', 30)->nullable();
            $table->decimal('regular_price', 15, 2)->nullable();
            $table->decimal('sale_price', 15, 2)->nullable();
            $table->decimal('rent_price', 15, 2)->nullable();
            $table->decimal('condominium_fee', 12, 2)->nullable();
            $table->decimal('iptu', 12, 2)->nullable();
            $table->boolean('price_on_request')->default(false);
            $table->decimal('usable_area', 12, 2)->nullable();
            $table->decimal('total_area', 12, 2)->nullable();
            $table->decimal('built_area', 12, 2)->nullable();
            $table->decimal('land_area', 12, 2)->nullable();
            $table->unsignedSmallInteger('bedrooms')->nullable();
            $table->unsignedSmallInteger('suites')->nullable();
            $table->unsignedSmallInteger('bathrooms')->nullable();
            $table->unsignedSmallInteger('lavatories')->nullable();
            $table->unsignedSmallInteger('parking_spaces')->nullable();
            $table->unsignedSmallInteger('rooms')->nullable();
            $table->boolean('furnished')->default(false);
            $table->boolean('accepts_financing')->default(false);
            $table->boolean('accepts_exchange')->default(false);
            $table->boolean('is_new')->default(false);
            $table->string('condominium_name')->nullable();
            $table->string('address_number', 30)->nullable();
            $table->string('complement')->nullable();
            $table->string('whatsapp_contact', 30)->nullable();
            $table->string('status', 20)->default('draft');
            $table->boolean('featured')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'published_at']);
            $table->index(['city_id', 'property_type_id']);
            $table->index(['commercial_purpose', 'sale_price']);
            $table->unique(['legacy_source', 'legacy_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
