<?php

use App\Support\SocialLinks;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('site_settings')) {
            return;
        }

        $now = now();

        DB::transaction(function () use ($now): void {
            foreach (SocialLinks::DEFAULTS as $key => $url) {
                $payload = [
                    'group' => 'general',
                    'value' => json_encode($url, JSON_UNESCAPED_SLASHES),
                    'is_public' => true,
                    'updated_at' => $now,
                ];

                if (DB::table('site_settings')->where('key', $key)->exists()) {
                    DB::table('site_settings')->where('key', $key)->update($payload);
                } else {
                    DB::table('site_settings')->insert(array_merge($payload, ['key' => $key, 'created_at' => $now]));
                }
            }

            if (! Schema::hasTable('pages') || ! Schema::hasTable('page_sections')) {
                return;
            }

            $pageId = DB::table('pages')->where('slug', 'contato')->value('id');
            if (! $pageId) {
                return;
            }

            $content = [
                ['Instagram', SocialLinks::DEFAULTS['instagram_url']],
                ['Facebook', SocialLinks::DEFAULTS['facebook_url']],
                ['YouTube', SocialLinks::DEFAULTS['youtube_url']],
            ];
            $section = DB::table('page_sections')->where('page_id', $pageId)->where('type', 'social')->first();
            $data = $section ? (json_decode($section->data ?: '[]', true) ?: []) : [];
            $data['label'] = $data['label'] ?? 'Redes sociais';
            $data['content'] = $content;

            $payload = [
                'data' => json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                'is_active' => true,
                'updated_at' => $now,
            ];

            if ($section) {
                DB::table('page_sections')->where('id', $section->id)->update($payload);
            } else {
                DB::table('page_sections')->insert(array_merge($payload, [
                    'page_id' => $pageId,
                    'type' => 'social',
                    'sort_order' => (int) DB::table('page_sections')->where('page_id', $pageId)->max('sort_order') + 1,
                    'created_at' => $now,
                ]));
            }
        });
    }

    public function down(): void
    {
        // Official contact data is intentionally not reverted to obsolete links.
    }
};
