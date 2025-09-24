<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('user-clicks.{userId}', function ($user, $userId) {
    return (int)$user->id === (int)$userId;
});