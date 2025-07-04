<?php
namespace App\Interfaces\Repositories;

interface BaseRepositoryInterface
{
    public function all();

    public function find($id);

    public function create(array $attributes);

    public function update($id, array $attributes);

    public function delete($id);

    public function pagination($params = []);
}
