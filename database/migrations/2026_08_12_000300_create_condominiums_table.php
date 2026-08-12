<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('condominiums', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condominium_type_id')->nullable()->constrained()->nullOnDelete();
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
            $table->text('floor_plans_support_text')->nullable();
            $table->decimal('starting_price', 15, 2)->nullable();
            $table->decimal('promotion_price', 15, 2)->nullable();
            $table->boolean('price_on_request')->default(false);
            $table->string('promotion_headline')->nullable();
            $table->decimal('minimum_unit_area', 12, 2)->nullable();
            $table->string('promotion_url')->nullable();
            $table->date('expected_delivery_date')->nullable();
            $table->string('whatsapp_contact', 30)->nullable();
            $table->string('status', 20)->default('draft');
            $table->boolean('featured')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'published_at']);
            $table->index(['city_id', 'condominium_type_id']);
            $table->index(['development_status_id', 'starting_price']);
            $table->unique(['legacy_source', 'legacy_id']);
        });

        Schema::table('properties', function (Blueprint $table) {
            $table->foreign('condominium_id')->references('id')->on('condominiums')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('properties', fn (Blueprint $table) => $table->dropForeign(['condominium_id']));
        Schema::dropIfExists('condominiums');
    }
};
