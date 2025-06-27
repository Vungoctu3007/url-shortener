<?php
namespace App\Repositories;

use App\Interfaces\Repositories\BaseRepositoryInterface;
use GuzzleHttp\Psr7\Query;
use Illuminate\Database\Eloquent\Model;

class BaseRepository implements BaseRepositoryInterface {
    protected Model $model;

    public function __construct(Model $model) {
        $this->model = $model;
    }

    public function all() { return $this->model->all(); }

    public function find($id) { return $this->model->findOrFail($id); }

    public function create(array $attributes) { return $this->model->create($attributes); }

    public function update($id, array $attributes)
    {
        $model = $this->find($id);
        $model->update($attributes);
        return $model;
    }

    public function delete($id)
    {
        return $this->model->destroy($id);
    }

    public function pagination($params = []) {
        $query = $this->model->newQuery();
        $query->select($params['select'])
        ->condition($params['condition'] ?? [])
        ->orderBy($params['orderBy'][0], $params['orderBy'][1]);
        if($params['perpage']){
            return $query->paginate($params['perpage']);
        }

        return $query->get();
    }
}
