<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;

class SocialAuthController extends Controller
{
    public function redirect($provider)
    {
        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function callback($provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
            $user = User::updateOrCreate(
                [
                    'provider_id'   => $socialUser->getId(),
                    'provider_name' => $provider,
                ],
                [
                    'name'     => $socialUser->getName() ?? $socialUser->getNickname(),
                    'email'    => $socialUser->getEmail(),
                    'avatar'   => $socialUser->getAvatar(),
                    'password' => bcrypt(Str::random(16)),
                ]
            );

            $accessTTL = config('jwt.ttl');
            JWTAuth::factory()->setTTL($accessTTL);
            $accessToken = JWTAuth::fromUser($user);

            $refreshTTL = config('jwt.refresh_ttl');
            JWTAuth::factory()->setTTL($refreshTTL);
            $refreshToken = JWTAuth::customClaims(['type' => 'refresh'])->fromUser($user);

            return redirect(env('FRONTEND_URL') . '/auth/callback')
                ->withCookie($this->cookie('access_token', $accessToken, $accessTTL))
                ->withCookie($this->cookie('refresh_token', $refreshToken, $refreshTTL));

        } catch (\Exception $e) {
            return redirect(env('FRONTEND_URL') . '/login?error=' . urlencode('Login failed with ' . $provider));
        }
    }


    protected function cookie($name, $value, $minutes)
    {
        return cookie(
            $name,
            (string) $value,
            $minutes,
            '/',
            null,
            true,
            true,
            false,
            'None'
        );
    }
}
