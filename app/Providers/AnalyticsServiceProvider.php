<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\LinkAnalyticsRepository;
use App\Services\LinkAnalyticsService;
use App\Services\RedirectTrackingService;

class AnalyticsServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(LinkAnalyticsRepository::class, function ($app) {
            return new LinkAnalyticsRepository();
        });

        $this->app->singleton(LinkAnalyticsService::class, function ($app) {
            return new LinkAnalyticsService(
                $app->make(LinkAnalyticsRepository::class)
            );
        });

        $this->app->singleton(RedirectTrackingService::class, function ($app) {
            return new RedirectTrackingService(
                $app->make(LinkAnalyticsService::class)
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        
    }
}
