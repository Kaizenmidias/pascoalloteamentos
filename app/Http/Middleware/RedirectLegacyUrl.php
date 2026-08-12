<?php

namespace App\Http\Middleware;

use App\Models\Redirect;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectLegacyUrl
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->isMethod('GET')) {
            return $next($request);
        } $path = '/'.trim($request->path(), '/').'/';
        if ($path === '//') {
            return $next($request);
        } $redirect = Redirect::query()->where('is_active', true)->whereIn('source_path', [$path, rtrim($path, '/')])->first();
        if (! $redirect || $redirect->destination_url === $request->fullUrl()) {
            return $next($request);
        } $redirect->increment('hits');
        $redirect->forceFill(['last_hit_at' => now()])->saveQuietly();

        return redirect()->to($redirect->destination_url, $redirect->status_code);
    }
}
