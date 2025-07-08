<?php

namespace App\Jobs;

use App\Events\RedirectLogged;
use App\Models\Redirect;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class LogRedirectJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function handle(): void
    {
        $redirect = Redirect::create([
            'link_id'    => $this->data['link_id'],
            'ip_address' => $this->data['ip_address'],
            'user_agent' => $this->data['user_agent'],
            'referrer'   => $this->data['referrer'],
            'country'    => $this->data['country'],
        ]);

        event(new RedirectLogged($redirect));
    }

}
