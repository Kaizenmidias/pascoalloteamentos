<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('features', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category')->nullable();
            $table->string('scope', 30)->nullable();
            $table->string('icon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        foreach (['property' => 'properties', 'condominium' => 'condominiums', 'subdivision' => 'subdivisions'] as $entity => $entitiesTable) {
            Schema::create("{$entity}_feature", function (Blueprint $table) use ($entity, $entitiesTable) {
                $table->foreignId("{$entity}_id")->constrained($entitiesTable)->cascadeOnDelete();
                $table->foreignId('feature_id')->constrained()->cascadeOnDelete();
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->primary(["{$entity}_id", 'feature_id']);
            });
        }

        Schema::create('media_assets', function (Blueprint $table) {
            $table->id();
            $table->string('disk')->default('public');
            $table->string('path');
            $table->string('original_name')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->string('checksum', 64)->nullable()->index();
            $table->string('alt_text')->nullable();
            $table->string('caption')->nullable();
            $table->string('legacy_source')->nullable();
            $table->unsignedBigInteger('legacy_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->unique(['disk', 'path']);
        });

        Schema::create('mediables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('media_asset_id')->constrained()->cascadeOnDelete();
            $table->string('mediable_type');
            $table->unsignedBigInteger('mediable_id');
            $table->string('collection')->default('gallery');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
            $table->index(['mediable_type', 'mediable_id']);
            $table->unique(['media_asset_id', 'mediable_type', 'mediable_id', 'collection'], 'mediable_asset_unique');
        });

        Schema::create('floor_plans', function (Blueprint $table) {
            $table->id();
            $table->string('owner_type');
            $table->unsignedBigInteger('owner_id');
            $table->foreignId('media_asset_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('area', 12, 2)->nullable();
            $table->unsignedSmallInteger('bedrooms')->nullable();
            $table->unsignedSmallInteger('suites')->nullable();
            $table->unsignedSmallInteger('bathrooms')->nullable();
            $table->unsignedSmallInteger('parking_spaces')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['owner_type', 'owner_id']);
        });

        Schema::create('construction_stages', function (Blueprint $table) {
            $table->id();
            $table->string('owner_type');
            $table->unsignedBigInteger('owner_id');
            $table->string('code', 60)->nullable();
            $table->string('name');
            $table->unsignedTinyInteger('progress_percent')->default(0);
            $table->date('reference_date')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['owner_type', 'owner_id']);
        });

        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('owner_type');
            $table->unsignedBigInteger('owner_id');
            $table->foreignId('media_asset_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('kind', 50)->nullable();
            $table->string('external_url')->nullable();
            $table->boolean('is_public')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['owner_type', 'owner_id']);
        });

        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('owner_type');
            $table->unsignedBigInteger('owner_id');
            $table->string('question');
            $table->text('answer');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['owner_type', 'owner_id']);
        });
    }

    public function down(): void
    {
        foreach (['faqs', 'documents', 'construction_stages', 'floor_plans', 'mediables', 'media_assets', 'subdivision_feature', 'condominium_feature', 'property_feature', 'features'] as $tableName) {
            Schema::dropIfExists($tableName);
        }
    }
};
