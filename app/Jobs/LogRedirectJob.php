<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Models\Redirect;
use App\Models\Link;
use App\Services\LinkAnalyticsService;

class LogRedirectJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function handle()
    {
        try {
            $redirect = Redirect::create([
                'link_id' => $this->data['link_id'],
                'ip_address' => $this->data['ip_address'],
                'user_agent' => $this->data['user_agent'],
                'referrer' => $this->data['referrer'],
                'country' => $this->data['country'],
            ]);

            $link = Link::find($this->data['link_id']);

            if ($link) {
                $analyticsService = app(LinkAnalyticsService::class);
                $analyticsService->invalidateCacheOnNewRedirect($link->id, $link->user_id);
            }

        } catch (\Exception $e) {
            Log::error('Failed to log redirect: ' . $e->getMessage(), [
                'data' => $this->data,
                'exception' => $e
            ]);
        }
    }
}
