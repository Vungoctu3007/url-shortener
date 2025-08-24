<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/v1/auth/register",
     *     tags={"Authentication"},
     *     summary="Register new user",
     *     description="Create a new account with email and password",
     *     operationId="register",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", example="user@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="123456")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Register successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Register successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
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

    /**
     * @OA\Post(
     *     path="/api/v1/auth/login",
     *     tags={"Authentication"},
     *     summary="User login",
     *     description="Authenticate user and return JWT access & refresh tokens (in cookies)",
     *     operationId="login",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", example="user@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="123456")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Login success"),
     *             @OA\Property(property="user", ref="#/components/schemas/User")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        $accessTTL = config('jwt.ttl');
        JWTAuth::factory()->setTTL($accessTTL);

        if (!$accessToken = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $user = auth()->user();

        $refreshTTL = config('jwt.refresh_ttl');
        JWTAuth::factory()->setTTL($refreshTTL);

        $refreshToken = JWTAuth::customClaims(['type' => 'refresh'])->fromUser($user);

        return response()->json(['message' => 'Login success', 'user' => $user])
            ->withCookie($this->cookie('access_token', $accessToken, $accessTTL))
            ->withCookie($this->cookie('refresh_token', $refreshToken, $refreshTTL));
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/refresh",
     *     tags={"Authentication"},
     *     summary="Refresh access token",
     *     description="Use refresh token from cookies to get a new access token",
     *     operationId="refresh",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Token refreshed",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Refreshed")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Invalid or expired refresh token"
     *     )
     * )
     */
    public function refresh(Request $request)
    {
        $refreshToken = $request->cookie('refresh_token');

        if (!$refreshToken) {
            return response()->json(['error' => 'No refresh token'], 401);
        }

        try {
            $payload = JWTAuth::setToken($refreshToken)->getPayload();

            if (!isset($payload['type']) || $payload['type'] !== 'refresh') {
                throw new \Exception('Invalid token type');
            }

            $user = JWTAuth::setToken($refreshToken)->authenticate();

            $accessTTL = config('jwt.ttl');
            JWTAuth::factory()->setTTL($accessTTL);
            $newAccessToken = JWTAuth::fromUser($user);

            return response()->json(['message' => 'Refreshed'])
                ->withCookie($this->cookie('access_token', $newAccessToken, $accessTTL));
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid refresh token'], 401);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/logout",
     *     tags={"Authentication"},
     *     summary="Logout user",
     *     description="Remove access and refresh tokens from cookies",
     *     operationId="logout",
     *     @OA\Response(
     *         response=200,
     *         description="Logged out successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Logged out")
     *         )
     *     )
     * )
     */
    public function logout()
    {
        return response()->json(['message' => 'Logged out'])
            ->withCookie($this->forget('access_token'))
            ->withCookie($this->forget('refresh_token'));
    }

    /**
     * @OA\Get(
     *     path="/api/v1/auth/profile",
     *     tags={"Authentication"},
     *     summary="Get user profile",
     *     description="Return information about the currently authenticated user",
     *     operationId="profile",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="User profile",
     *         @OA\JsonContent(ref="#/components/schemas/User")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function profile()
    {
        return response()->json(auth()->user());
    }

    // Cookie helpers
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

    protected function forget($name)
    {
        return cookie()->forget($name)
            ->withSameSite('None')
            ->withSecure(true);
    }
}
