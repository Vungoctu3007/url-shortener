<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Redirect extends Model
{
    use HasFactory;

    protected $fillable = [
        'link_id',
        'ip_address',
        'user_agent',
        'referrer',
        'country',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function link()
    {
        return $this->belongsTo(Link::class);
    }

    /**
     * Get device type from user agent
     */
    public function getDeviceTypeAttribute(): string
    {
        if (!$this->user_agent) {
            return 'Unknown';
        }

        $userAgent = strtolower($this->user_agent);

        if (str_contains($userAgent, 'mobile') ||
            str_contains($userAgent, 'android') ||
            str_contains($userAgent, 'iphone')) {
            return 'Mobile';
        }

        if (str_contains($userAgent, 'tablet') ||
            str_contains($userAgent, 'ipad')) {
            return 'Tablet';
        }

        return 'Desktop';
    }

    /**
     * Get browser from user agent
     */
    public function getBrowserAttribute(): string
    {
        if (!$this->user_agent) {
            return 'Unknown';
        }

        $userAgent = strtolower($this->user_agent);

        if (str_contains($userAgent, 'chrome')) return 'Chrome';
        if (str_contains($userAgent, 'firefox')) return 'Firefox';
        if (str_contains($userAgent, 'safari')) return 'Safari';
        if (str_contains($userAgent, 'edge')) return 'Edge';
        if (str_contains($userAgent, 'opera')) return 'Opera';

        return 'Other';
    }

    /**
     * Get referrer domain
     */
    public function getReferrerDomainAttribute(): ?string
    {
        if (!$this->referrer) {
            return null;
        }

        $parsed = parse_url($this->referrer);
        return $parsed['host'] ?? null;
    }
}
