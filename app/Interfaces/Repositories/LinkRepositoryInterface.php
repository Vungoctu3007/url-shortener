<?php
namespace App\Interfaces\Repositories;

interface LinkRepositoryInterface extends BaseRepositoryInterface
{
    public function findBySlug(string $slug);
    public function getOriginalUrl(string $slug): ?string;
}
