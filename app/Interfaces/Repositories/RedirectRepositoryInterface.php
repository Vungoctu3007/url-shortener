<?php
namespace App\Interfaces\Repositories;

interface RedirectRepositoryInterface extends BaseRepositoryInterface
{
    public function getRedirectsByUser(int $userId, int $limit = 10, ?int $cursor = null);
}
