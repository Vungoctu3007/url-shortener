<?php
namespace App\Interfaces\Services;

interface LinkServiceInterface extends BaseServiceInterface
{
    public function findBySlug(string $slug);
    public function getOriginalLink(string $slug);
}
