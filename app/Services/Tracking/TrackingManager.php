<?php

namespace App\Services\Tracking;

use App\Models\TrackingScript;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

final class TrackingManager
{
    public const POSITIONS = ['head', 'body_start', 'body_end'];

    public function active(): Collection
    {
        if (! Schema::hasTable('tracking_scripts')) {
            return $this->legacyActive();
        }

        return TrackingScript::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    private function legacyActive(): Collection
    {
        if (! Schema::hasTable('site_settings')) return collect();

        $legacy = \App\Models\SiteSetting::query()->where('group', 'integrations')->get()->keyBy('key');
        $entries = [
            ['key' => 'meta_pixel_id', 'name' => 'Meta Pixel legado', 'type' => 'meta_pixel'],
            ['key' => 'google_analytics_id', 'name' => 'Google Analytics legado', 'type' => 'google_analytics'],
            ['key' => 'google_tag_manager_id', 'name' => 'Google Tag Manager legado', 'type' => 'google_tag_manager'],
        ];
        $scripts = collect($entries)->map(function (array $entry, int $index) use ($legacy): ?TrackingScript {
            $value = trim((string) ($legacy->get($entry['key'])?->value ?? ''));
            if ($value === '') return null;
            return new TrackingScript(['name' => $entry['name'], 'type' => $entry['type'], 'identifier' => $value, 'position' => 'head', 'is_active' => true, 'sort_order' => $index * 10]);
        })->filter()->values();
        $custom = trim((string) ($legacy->get('custom_head_code')?->value ?? ''));
        if ($custom !== '') $scripts->push(new TrackingScript(['name' => 'Código personalizado legado', 'type' => 'custom_script', 'code' => $custom, 'position' => 'head', 'is_active' => true, 'sort_order' => 30]));
        return $scripts;
    }

    public function head(): Collection
    {
        return $this->renderPosition('head');
    }

    public function bodyStart(): Collection
    {
        return $this->renderPosition('body_start');
    }

    public function bodyEnd(): Collection
    {
        return $this->renderPosition('body_end');
    }

    private function renderPosition(string $position): Collection
    {
        $scripts = $this->active();
        $rendered = collect();

        $meta = $scripts->where('type', 'meta_pixel');
        if ($position === 'head' && $meta->isNotEmpty()) {
            $rendered->push($this->metaLoader());
        }
        $metaAtPosition = $scripts->where('type', 'meta_pixel')->filter(fn (TrackingScript $script) => $this->effectivePosition($script) === $position);
        $metaIds = $metaAtPosition->pluck('identifier')->filter()->unique()->values();
        if ($metaIds->isNotEmpty()) {
            $rendered->push($this->metaInit($metaIds));
        }

        $google = $scripts->filter(fn (TrackingScript $script) => in_array($script->type, ['google_analytics', 'google_ads', 'google_tag'], true));
        $googleAtPosition = $google->filter(fn (TrackingScript $script) => $this->effectivePosition($script) === $position);
        if ($position === 'head' && $google->isNotEmpty()) {
            $rendered->push($this->googleLoader((string) $google->pluck('identifier')->filter()->first()));
        }
        if ($googleAtPosition->isNotEmpty()) {
            $rendered->push($this->google($googleAtPosition));
        }

        $gtm = $scripts->where('type', 'google_tag_manager')->filter(fn (TrackingScript $script) => $position === 'body_start' || $this->effectivePosition($script) === $position);
        foreach ($gtm->pluck('identifier')->filter()->unique() as $id) {
            if ($position === 'head') $rendered->push($this->gtmHead((string) $id));
            if ($position === 'body_start') $rendered->push($this->gtmBody((string) $id));
        }

        foreach ($scripts->where('type', 'custom_script')->filter(fn (TrackingScript $script) => $script->position === $position) as $script) {
            if (trim((string) $script->code) !== '') $rendered->push((string) $script->code);
        }

        return $rendered;
    }

    private function effectivePosition(?TrackingScript $script): string
    {
        return $script?->type === 'google_tag_manager' ? 'head' : ($script?->position ?: 'head');
    }

    private function metaLoader(): string
    {
        return "<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');</script>";
    }

    private function metaInit(Collection $ids): string
    {
        $json = json_encode($ids->all(), JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        return "<script>window.__pascoalMetaPixelIds=window.__pascoalMetaPixelIds||[];{$json}.forEach(function(id){if(window.__pascoalMetaPixelIds.indexOf(id)===-1){window.__pascoalMetaPixelIds.push(id);fbq('init',id)}});fbq('track','PageView');</script>";
    }

    private function google(Collection $scripts): string
    {
        $ids = $scripts->pluck('identifier')->filter()->unique()->values();
        $configs = $ids->map(fn (string $id) => "gtag('config',".json_encode($id, JSON_UNESCAPED_SLASHES).')')->implode('');
        $analytics = $scripts->where('type', 'google_analytics')->pluck('identifier')->filter()->unique()->values();
        $analyticsJson = json_encode($analytics->all(), JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        return <<<HTML
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}{$configs}window.__pascoalGoogleAnalyticsIds=window.__pascoalGoogleAnalyticsIds||[];{$analyticsJson}.forEach(function(id){if(window.__pascoalGoogleAnalyticsIds.indexOf(id)===-1)window.__pascoalGoogleAnalyticsIds.push(id)});</script>
HTML;
    }

    private function googleLoader(string $id): string
    {
        return '<script async src="https://www.googletagmanager.com/gtag/js?id='.rawurlencode($id).'"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag(\'js\',new Date());</script>';
    }

    private function gtmHead(string $id): string
    {
        return "<script>window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});</script><script async src=\"https://www.googletagmanager.com/gtm.js?id=".rawurlencode($id)."\"></script>";
    }

    private function gtmBody(string $id): string
    {
        return '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id='.e($id).'" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>';
    }
}
