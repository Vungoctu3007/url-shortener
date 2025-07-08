<?php
namespace App\Interfaces\Services;

interface RedirectServiceInterface extends BaseServiceInterface {
    public function getUserRedirects(int $user_id, int $limit, ?int $cursor = null);
    
}
