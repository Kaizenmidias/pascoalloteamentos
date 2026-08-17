<?php

use App\Http\Controllers\Admin\CondominiumController;
use App\Http\Controllers\Admin\ClassificationController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\CmsController;
use App\Http\Controllers\Admin\PropertyController;
use App\Http\Controllers\Admin\SubdivisionController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');
    Route::resource('properties', PropertyController::class)->except(['show', 'destroy']);
    Route::resource('condominiums', CondominiumController::class)->except(['show', 'destroy']);
    Route::resource('subdivisions', SubdivisionController::class)->except(['show', 'destroy']);
    Route::get('classifications', [ClassificationController::class, 'index'])->name('classifications.index');
    Route::post('classifications/{group}', [ClassificationController::class, 'store'])->name('classifications.store');
    Route::put('classifications/{group}/{item}', [ClassificationController::class, 'update'])->name('classifications.update');
    Route::delete('classifications/{group}/{item}', [ClassificationController::class, 'destroy'])->name('classifications.destroy');
    Route::get('pages', [CmsController::class, 'pages'])->name('pages.index');
    Route::get('pages/create', [CmsController::class, 'createPage'])->name('pages.create');
    Route::post('pages', [CmsController::class, 'storePage'])->name('pages.store');
    Route::get('pages/{page}/edit', [CmsController::class, 'editPage'])->name('pages.edit');
    Route::put('pages/{page}', [CmsController::class, 'updatePage'])->name('pages.update');
    Route::delete('pages/{page}', [CmsController::class, 'destroyPage'])->name('pages.destroy');
    Route::get('cms/home-numbers', [CmsController::class, 'homeNumbers'])->name('cms.home-numbers');
    Route::put('cms/home-numbers', [CmsController::class, 'updateHomeNumbers'])->name('cms.home-numbers.update');
    Route::prefix('blog')->name('blog.')->group(function () {
        Route::get('posts', [CmsController::class, 'posts'])->name('posts.index');
        Route::get('posts/create', [CmsController::class, 'createPost'])->name('posts.create');
        Route::post('posts', [CmsController::class, 'storePost'])->name('posts.store');
        Route::get('posts/{post}/edit', [CmsController::class, 'editPost'])->name('posts.edit');
        Route::put('posts/{post}', [CmsController::class, 'updatePost'])->name('posts.update');
        Route::delete('posts/{post}', [CmsController::class, 'destroyPost'])->name('posts.destroy');
        Route::post('categories', [CmsController::class, 'storeCategory'])->name('categories.store');
    });
    Route::get('leads', [CmsController::class, 'leads'])->name('leads.index');
    Route::patch('leads/{lead}', [CmsController::class, 'updateLead'])->name('leads.update');
    Route::get('settings', [CmsController::class, 'settings'])->name('settings.edit');
    Route::put('settings', [CmsController::class, 'updateSettings'])->name('settings.update');
    Route::get('integrations', [CmsController::class, 'integrations'])->name('integrations.edit');
    Route::put('integrations', [CmsController::class, 'updateIntegrations'])->name('integrations.update');
    Route::resource('users', UserController::class)->except(['show']);
});
