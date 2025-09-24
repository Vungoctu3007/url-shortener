<?php

namespace App\Events;

use App\Models\Redirect;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ClickStreamEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $clickData;

    /**
     * Create a new event instance.
     */
    public function __construct(Redirect $redirect)
    {
        $this->userId = $redirect->link->user_id;
        
        $this->clickData = [
            'id' => $redirect->id,
            'link_id' => $redirect->link_id,
            'link_slug' => $redirect->link->slug,
            'link_title' => $redirect->link->title ?? 'Untitled',
            'time' => $redirect->created_at->format('M j, H:i A'),
            'country' => $redirect->country ?? 'Local/Private',
            'browser' => $redirect->browser ?? 'Unknown',
            'device' => $redirect->device ?? 'Desktop',
            'referrer' => $redirect->referrer ?? 'Direct',
            'target' => $redirect->link->target,
            'timestamp' => $redirect->created_at->toISOString(),
        ];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user-clicks.' . $this->userId),
        ];
    }

    public function broadcastAs() {
        return 'new-click';
    }

    public function broadcastWith() {
        return [
            'click' => $this->clickData,
        ];
    }
}
