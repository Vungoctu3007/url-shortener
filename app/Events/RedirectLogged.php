<?php

namespace App\Events;

use App\Models\Redirect;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class RedirectLogged implements ShouldBroadcast
{
    use SerializesModels;

    public Redirect $redirect;

    public function __construct(Redirect $redirect)
    {
        $this->redirect = $redirect;
    }

    public function broadcastOn()
    {
        return new Channel('click-stream');
    }

    public function broadcastAs()
    {
        return 'new-click';
    }
}
