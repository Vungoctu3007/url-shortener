<?php

namespace App\Providers;

use App\Interfaces\Repositories\LinkRepositoryInterface;
use App\Interfaces\Services\LinkServiceInterface;
use App\Repositories\LinkRepository;
use App\Services\LinkService;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(LinkRepositoryInterface::class, LinkRepository::class);
        $this->app->bind(LinkServiceInterface::class, concrete: LinkService::class);
        $this->app->bind(RedirectRepositoryInterface::class, RedirectRepository::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
