<?php
namespace App\Repositories;

use App\Interfaces\Repositories\RedirectRepositoryInterface;
use App\Models\Redirect;

class RedirectRepository extends BaseRepository implements RedirectRepositoryInterface
{
    public function __construct(Redirect $model)
    {
        parent::__construct($model);
    }
    public function getRedirectsByUser(int $userId, int $limit = 10, ?int $cursor = null)
    {
        $query = $this->model->with('link')
            ->whereHas('link', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->orderByDesc('id');

        if ($cursor) {
            $query->where('id', '<', $cursor);
        }

        return $query->limit($limit)->get();
    }
}
