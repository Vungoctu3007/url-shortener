<?php

use App\Http\Controllers\Api\V1\Link\LinkController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/{slug}', [LinkController::class, 'redirect']);
