<?php

namespace App\Repositories;

use App\Models\Link;
use App\Interfaces\Repositories\LinkRepositoryInterface;
use Illuminate\Support\Facades\Log;
use Vinkla\Hashids\Facades\Hashids;
use Illuminate\Support\Str;

class LinkRepository extends BaseRepository implements LinkRepositoryInterface
{
    public function __construct(Link $model)
    {
        parent::__construct($model);
    }

    public function pagination($params = [])
    {
        $query = $this->model->newQuery();

        $query->select($params['select'] ?? ['*']);

        // Add search functionality
        $keyword = $params['keyword']['search'] ?? '';
        if (!empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $q->where('slug', 'like', "%{$keyword}%")
                    ->orWhere('target', 'like', "%{$keyword}%")
                    ->orWhere('title', 'like', "%{$keyword}%");
            });
        }

        $condition = $params['condition'] ?? [];
        if (is_array($condition) && count($condition)) {
            foreach ($condition as $key => $val) {
                if ($key === 'active') {
                    if ($val == 1) {
                        $query->where('expires_at', '>', now());
                    } elseif ($val == 0) {
                        $query->where(function ($q) {
                            $q->whereNull('expires_at')
                                ->orWhere('expires_at', '<=', now());
                        });
                    }
                } elseif ($key === 'user_id') {
                    // Filter by user - MOST IMPORTANT
                    $query->where('user_id', $val);
                } elseif ($val !== 0 && !empty($val)) {
                    $query->where($key, $val);
                }
            }
        }

        if (!empty($params['orderBy']) && count($params['orderBy']) === 2) {
            $query->orderBy($params['orderBy'][0], $params['orderBy'][1]);
        }

        if (!empty($params['perpage'])) {
            return $query->paginate($params['perpage']);
        }

        return $query->get();
    }

    public function create(array $data)
    {
        if (empty($data['slug'])) {
            do {
                $slug = Str::random(6);
            } while ($this->model->where('slug', $slug)->exists());

            $data['slug'] = $slug;
        } else {
            if ($this->model->where('slug', $data['slug'])->exists()) {
                throw new \Exception('Slug already exists');
            }
        }

        $linkData = [
            'slug' => $data['slug'],
            'target' => $data['target'],
            'user_id' => $data['user_id'] ?? null,
            'expires_at' => $data['expires_at']
        ];

        if (!empty($data['title'])) {
            $linkData['title'] = $data['title'];
        }

        if (!empty($data['qr_url'])) {
            $linkData['qr_url'] = $data['qr_url'];
        }

        $link = $this->model->create($linkData);

        return $link;
    }

    public function update($id, array $data)
    {
        $link = $this->model->find($id);

        if (!$link) {
            return null;
        }

        // Handle slug update with uniqueness check
        if (isset($data['slug']) && $data['slug'] !== $link->slug) {
            if ($this->model->where('slug', $data['slug'])->where('id', '!=', $id)->exists()) {
                throw new \Exception('Slug already exists');
            }
        }

        $link->update($data);

        return $link->fresh();
    }

    public function find($id)
    {
        return $this->model->find($id);
    }

    public function delete($id): bool
    {
        $link = $this->model->find($id);

        if (!$link) {
            return false;
        }

        return $link->delete();
    }


    public function bulkDelete(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }

    public function findMany(array $ids)
    {
        return $this->model->whereIn('id', $ids)->get();
    }

    public function findBySlug(string $slug)
    {
        return $this->model->where('slug', $slug)->first();
    }

    public function getOriginalLink(string $slug): ?string
    {
        return $this->model->where('slug', $slug)->value('target');
    }
}
