<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;

class JwtCookieMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
{
    try {
        $token = $request->cookie('access_token');

        if (!$token) {
            return response()->json(['error' => 'Token not provided'], 401);
        }

        // Thay vì chỉ authenticate, bạn nên gán user vào request
        $user = JWTAuth::setToken($token)->authenticate();

        if (!$user) {
            return response()->json(['error' => 'Invalid token'], 401);
        }

        auth()->setUser($user); // Cho phép Broadcast::channel() nhận được $user
    } catch (Exception $e) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    return $next($request);
}


}
