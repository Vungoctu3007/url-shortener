<?php

namespace App\Jobs;

use App\Models\Link;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
class IncrementLinkClicks implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    protected $linkId;

    /**
     * Create a new job instance.
     */
    public function __construct(int $linkId)
    {
        $this->linkId = $linkId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Link::where('id', $this->linkId)->increment('clicks');
    }
}
