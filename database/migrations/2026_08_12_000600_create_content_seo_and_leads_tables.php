<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('content')->nullable();
            $table->string('template')->default('default');
            $table->string('status', 20)->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('page_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->json('data')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('blog_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });
        Schema::create('blog_tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('featured_media_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();
            $table->string('status', 20)->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('blog_category_blog_post', function (Blueprint $table) {
            $table->foreignId('blog_post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('blog_category_id')->constrained()->cascadeOnDelete();
            $table->primary(['blog_post_id', 'blog_category_id']);
        });
        Schema::create('blog_post_blog_tag', function (Blueprint $table) {
            $table->foreignId('blog_post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('blog_tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['blog_post_id', 'blog_tag_id']);
        });
        Schema::create('navigation_menus', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('location')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('navigation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('navigation_menu_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('navigation_items')->cascadeOnDelete();
            $table->string('label');
            $table->string('url');
            $table->string('target', 20)->default('_self');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('group')->default('general');
            $table->string('key')->unique();
            $table->json('value')->nullable();
            $table->boolean('is_public')->default(false);
            $table->timestamps();
        });
        Schema::create('seo_meta', function (Blueprint $table) {
            $table->id();
            $table->string('seoable_type');
            $table->unsignedBigInteger('seoable_id');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('canonical_url')->nullable();
            $table->string('robots')->default('index,follow');
            $table->string('og_title')->nullable();
            $table->text('og_description')->nullable();
            $table->foreignId('og_media_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->json('schema')->nullable();
            $table->timestamps();
            $table->unique(['seoable_type', 'seoable_id']);
        });
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('condominium_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('subdivision_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone', 30);
            $table->text('message')->nullable();
            $table->string('source_url')->nullable();
            $table->boolean('consent')->default(false);
            $table->timestamp('consented_at')->nullable();
            $table->string('status', 20)->default('new');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
        Schema::create('redirects', function (Blueprint $table) {
            $table->id();
            $table->string('source_path')->unique();
            $table->string('destination_url');
            $table->unsignedSmallInteger('status_code')->default(301);
            $table->boolean('is_active')->default(true);
            $table->string('reason')->nullable();
            $table->unsignedBigInteger('hits')->default(0);
            $table->timestamp('last_hit_at')->nullable();
            $table->timestamps();
        });
        Schema::create('legacy_taxonomy_aliases', function (Blueprint $table) {
            $table->id();
            $table->string('legacy_taxonomy');
            $table->string('legacy_slug');
            $table->string('destination_type', 50);
            $table->unsignedBigInteger('destination_id')->nullable();
            $table->string('destination_url')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->unique(['legacy_taxonomy', 'legacy_slug']);
        });
    }

    public function down(): void
    {
        foreach (['legacy_taxonomy_aliases', 'redirects', 'leads', 'seo_meta', 'site_settings', 'navigation_items', 'navigation_menus', 'blog_post_blog_tag', 'blog_category_blog_post', 'blog_posts', 'blog_tags', 'blog_categories', 'page_sections', 'pages'] as $tableName) {
            Schema::dropIfExists($tableName);
        }
    }
};
