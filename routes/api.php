<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\SocialAuthController;
use App\Http\Controllers\Api\V1\Link\LinkController;
use App\Http\Controllers\Api\V1\Link\RedirectController;
use App\Http\Controllers\Api\V1\Statistic\AnalyticsController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    /**
     * AUTHENTICATION
     */
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);

    Route::get('auth/{provider}', [SocialAuthController::class, 'redirect'])
        ->where('provider', 'google|facebook|github');

    Route::get('auth/{provider}/callback', [SocialAuthController::class, 'callback'])
        ->where('provider', 'google|facebook|github');

    Route::middleware(['jwt.cookie'])->group(function () {
        Route::get('/auth/profile', [AuthController::class, 'profile']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        /**
         * LINK MANAGEMENT
         */
        Route::apiResource('links', LinkController::class);

        // Bulk operations for links
        Route::post('/links/bulk-delete', [LinkController::class, 'bulkDelete']);
        Route::post('/links/bulk-export', [LinkController::class, 'bulkExport']);

        /**
         * REDIRECT
         */
        Route::get('/redirects', [RedirectController::class, 'index']);

        /*
        |--------------------------------------------------------------------------
        | Analytics API Routes
        |--------------------------------------------------------------------------
        */

        Route::prefix('analytics')->group(function () {
            Route::get('/dashboard', [AnalyticsController::class, 'dashboard']);
            Route::get('/dashboard/fresh', [AnalyticsController::class, 'freshDashboard']); // New route
            Route::get('/time-series', [AnalyticsController::class, 'timeSeries']);
            Route::get('/devices', [AnalyticsController::class, 'deviceStats']);
            Route::get('/referrers', [AnalyticsController::class, 'referrerStats']);
            Route::get('/countries', [AnalyticsController::class, 'countryStats']);
            Route::get('/links/{linkId}', [AnalyticsController::class, 'linkAnalytics']);
            Route::get('/summary', [AnalyticsController::class, 'summary']);
            Route::get('/export', [AnalyticsController::class, 'export']);
            Route::delete('/cache', [AnalyticsController::class, 'clearCache']);
        });
    });

});
