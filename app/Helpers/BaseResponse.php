<?php

namespace App\Helpers;

class BaseResponse
{
    public static function success($data = [], $message = 'Success', $statusCode = 200)
    {
        return response()->json([
            'status'  => 'success',
            'message' => $message,
            'data'    => $data
        ], $statusCode);
    }

    public static function error($message = 'Error', $statusCode = 500, $data = [])
    {
        return response()->json([
            'status'  => 'error',
            'message' => $message,
            'data'    => $data
        ], $statusCode);
    }
}
