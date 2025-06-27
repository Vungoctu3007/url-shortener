<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);

        $user = User::create([
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

        return response()->json(['message' => 'Register successfully']);
    }

    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $refreshToken = JWTAuth::customClaims(['type' => 'refresh'])->fromUser(Auth::user());

        return response()->json(['message' => 'Login success'])->withCookie(
            cookie('access_token', $token, 60, '/', null, true, true, false, 'Strict')
        )->withCookie(
                cookie('refresh_token', $refreshToken, 60 * 24 * 30, '/', null, true, true, false, 'None')
            );
    }


    public function refresh(Request $request)
    {
        try {
            $refreshToken = $request->cookie('refresh_token');

            if (!$refreshToken) {
                return response()->json(['error' => 'No refresh token'], 401);
            }

            $payload = JWTAuth::setToken($refreshToken)->getPayload();

            if ($payload['type'] != 'refresh') {
                return response()->json(['error' => 'Invalid refresh token'], 401);
            }

            $user = JWTAuth::setToken($refreshToken)->authenticate();
            $newAccessToken = JWTAuth::fromUser($user);
            return response()->json(['message' => 'Access token refreshed'])->withCookie(
                cookie('access_token', $newAccessToken, 60, '/', null, true, true, false, 'None')
            );
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid token'], 401);
        }
    }

    public function logout()
    {
        return response()->json(['message' => 'Logged out'])
            ->withCookie(cookie()->forget('refresh_token'))
            ->withCookie(cookie()->forget('access_token'));
    }


    public function profile()
    {
        return response()->json(Auth::user());
    }
}
