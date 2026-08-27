<?php

namespace App\Support;

use App\Models\SiteSetting;
use Illuminate\Support\Facades\Schema;

final class SocialLinks
{
    public const DEFAULTS = [
        'instagram_url' => 'https://www.instagram.com/pascoalloteamentos/',
        'facebook_url' => 'https://www.facebook.com/pascoalloteamentos/?locale=pt_BR',
        'youtube_url' => 'https://www.youtube.com/@pascoalloteamentos7336',
    ];

    public static function all(): array
    {
        if (! Schema::hasTable('site_settings')) {
            return self::DEFAULTS;
        }

        $stored = SiteSetting::query()
            ->whereIn('key', array_keys(self::DEFAULTS))
            ->where('is_public', true)
            ->get(['key', 'value'])
            ->pluck('value', 'key');

        return collect(self::DEFAULTS)
            ->mapWithKeys(function (string $fallback, string $key) use ($stored): array {
                $value = $stored->get($key);
                $url = is_string($value) ? trim($value) : '';

                return [$key => filter_var($url, FILTER_VALIDATE_URL) ? $url : $fallback];
            })
            ->all();
    }
}
