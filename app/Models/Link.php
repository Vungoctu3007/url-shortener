<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Link extends Model
{
    /** @use HasFactory<\Database\Factories\LinkFactory> */
    use HasFactory;

    protected $fillable = [
        'slug',
        'target',
        'user_id',
        'qr_url'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function redirects() {
        return $this->hasMany(Redirect::class);
    }
}
