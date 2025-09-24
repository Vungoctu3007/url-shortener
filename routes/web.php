<?php

use App\Http\Controllers\Api\V1\Link\LinkController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/{slug}', [LinkController::class, 'redirect']);

