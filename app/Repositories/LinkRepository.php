<?php

namespace App\Repositories;

use App\Models\Link;
use App\Interfaces\Repositories\LinkRepositoryInterface;
use Vinkla\Hashids\Facades\Hashids;
use Illuminate\Support\Str;

class LinkRepository extends BaseRepository implements LinkRepositoryInterface
{
    public function __construct(Link $model)
    {
        parent::__construct($model);
    }

    public function create(array $data)
    {
        if (empty($data['slug'])) {
            do {
                $slug = Str::random(6);
            } while (Link::where('slug', $slug)->exists());

            $data['slug'] = $slug;
        } else {
            if (Link::where('slug', $data['slug'])->exists()) {
                throw new \Exception('Slug đã tồn tại');
            }
        }

        $linkData = [
            'slug' => $data['slug'],
            'target' => $data['target'],
            'user_id' => $data['user_id'],
        ];

        // Nếu có qr_url thì thêm vào
        if (!empty($data['qr_url'])) {
            $linkData['qr_url'] = $data['qr_url'];
        }

        $link = $this->model->create($linkData);

        return $link;
    }

    public function findBySlug(string $slug): ?Link
    {
        $ids = Hashids::decode($slug);
        if (empty($ids) || !is_numeric($ids[0])) {
            return null;
        }

        return $this->model->find($ids[0]);
    }

    public function getOriginalUrl(string $slug): ?string
    {
        $link = $this->findBySlug($slug);
        return $link?->target;
    }
}
