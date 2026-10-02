<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tracking_scripts', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('type', 40);
            $table->string('identifier')->nullable();
            $table->longText('code')->nullable();
            $table->string('position', 20)->default('head');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['type', 'is_active']);
            $table->index(['position', 'sort_order']);
        });

        if (! Schema::hasTable('site_settings')) return;
        $legacy = DB::table('site_settings')->where('group', 'integrations')->pluck('value', 'key');
        $now = now();
        $entries = [
            ['key' => 'meta_pixel_id', 'name' => 'Meta Pixel principal', 'type' => 'meta_pixel', 'position' => 'head'],
            ['key' => 'google_analytics_id', 'name' => 'Google Analytics (GA4)', 'type' => 'google_analytics', 'position' => 'head'],
            ['key' => 'google_tag_manager_id', 'name' => 'Google Tag Manager', 'type' => 'google_tag_manager', 'position' => 'head'],
        ];
        foreach ($entries as $order => $entry) {
            $value = $legacy[$entry['key']] ?? null;
            $decoded = is_string($value) ? json_decode($value, true) : null;
            $value = trim((string) ($decoded ?? $value ?? ''));
            if ($value === '') continue;
            DB::table('tracking_scripts')->insert(['name' => $entry['name'], 'type' => $entry['type'], 'identifier' => $value, 'position' => $entry['position'], 'sort_order' => $order * 10, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now]);
        }
        $customValue = $legacy['custom_head_code'] ?? null;
        $customDecoded = is_string($customValue) ? json_decode($customValue, true) : null;
        $custom = trim((string) ($customDecoded ?? $customValue ?? ''));
        if ($custom !== '') DB::table('tracking_scripts')->insert(['name' => 'Código personalizado legado', 'type' => 'custom_script', 'code' => $custom, 'position' => 'head', 'sort_order' => 30, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now]);
    }

    public function down(): void
    {
        Schema::dropIfExists('tracking_scripts');
    }
};
