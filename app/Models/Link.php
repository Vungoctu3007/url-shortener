<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Link extends Model
{
    /** @use HasFactory<\Database\Factories\LinkFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'slug',
        'title',
        'target',
        'user_id',
        'qr_url',
        'expires_at'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function redirects() {
        return $this->hasMany(Redirect::class);
    }
}
