<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\CondominiumController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\SubdivisionController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/sitemap.xml', SitemapController::class)->name('sitemap');
Route::get('/sobre-nos', [PageController::class, 'about'])->name('about');
Route::redirect('/sobre-nos/', '/sobre-nos');
Route::get('/contato', [PageController::class, 'contact'])->name('contact');
Route::redirect('/contato/', '/contato');
Route::get('/imoveis', [PropertyController::class, 'index'])->name('properties.index');
Route::redirect('/imoveis/', '/imoveis');
Route::get('/imoveis/{property}', [PropertyController::class, 'show'])->name('properties.show');
Route::get('/condominios', [CondominiumController::class, 'index'])->name('condominiums.index');
Route::redirect('/condominios/', '/condominios');
Route::get('/condominios/{condominium}', [CondominiumController::class, 'show'])->name('condominiums.show');
Route::get('/loteamentos', [SubdivisionController::class, 'index'])->name('subdivisions.index');
Route::redirect('/loteamentos/', '/loteamentos');
Route::get('/loteamentos/{subdivision}', [SubdivisionController::class, 'show'])->name('subdivisions.show');
Route::post('/contato', [LeadController::class, 'store'])->middleware('throttle:10,1')->name('leads.store');
Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::redirect('/blog/', '/blog');
Route::get('/blog/{post}', [BlogController::class, 'show'])->name('blog.show');
Route::get('/category/{category}', [BlogController::class, 'category'])->name('blog.category');
Route::get('/tag/{tag}', [BlogController::class, 'tag'])->name('blog.tag');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
});
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->middleware('auth')->name('logout');

require __DIR__.'/admin.php';

Route::get('/{page}', [PageController::class, 'show'])->name('pages.show');
Route::fallback(fn () => abort(404));
