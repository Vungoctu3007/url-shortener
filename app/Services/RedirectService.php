<?php
namespace App\Services;

use App\Repositories\RedirectRepository;

class RedirectService extends BaseService {
    protected $redirectRepository;

    public function __construct(RedirectRepository $redirectRepository) {
        $this->redirectRepository = $redirectRepository;
    }

    public function getUserRedirects(int $userId, int $limit = 10, ?int $cursor = null)
    {
        return $this->redirectRepository->getRedirectsByUser($userId, $limit, $cursor);
    }
}
