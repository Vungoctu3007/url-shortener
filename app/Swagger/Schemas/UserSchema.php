<?php

namespace App\Swagger\Schemas;

/**
 * @OA\Schema(
 *   schema="User",
 *   type="object",
 *   title="User",
 *   description="User model schema",
 *   @OA\Property(property="id", type="integer", example=1),
 *   @OA\Property(property="email", type="string", example="user@example.com"),
 *   @OA\Property(property="created_at", type="string", format="date-time", example="2025-01-01T12:00:00Z"),
 *   @OA\Property(property="updated_at", type="string", format="date-time", example="2025-01-02T12:00:00Z")
 * )
 */
class UserSchema {}
