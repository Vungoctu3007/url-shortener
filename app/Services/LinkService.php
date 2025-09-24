<?php

namespace App\Services;

use App\Jobs\IncrementLinkClicks;
use App\Jobs\LogRedirectJob;
use App\Interfaces\Repositories\LinkRepositoryInterface;
use App\Interfaces\Services\LinkServiceInterface;
use App\Models\Redirect;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Label\LabelAlignment;
use Endroid\QrCode\Label\Font\OpenSans;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Link;
use App\Events\ClickStreamEvent;
use Illuminate\Support\Facades\Http;

class LinkService extends BaseService implements LinkServiceInterface
{
    protected LinkRepositoryInterface $linkRepo;

    public function __construct(LinkRepositoryInterface $linkRepo)
    {
        parent::__construct($linkRepo);
        $this->linkRepo = $linkRepo;
    }

    public function find($id)
    {
        return $this->linkRepo->find($id);
    }

    public function delete($id): bool
    {
        $link = $this->linkRepo->find($id);

        if (!$link) {
            return false;
        }

        return $this->linkRepo->delete($id);
    }

    private function paginateArgument($request, int $userId = null)
    {
        $params = [
            'perpage' => $request->input('perpage') ?? 10,
            'keyword' => [
                'search' => $request->input('keyword') ?? '',
            ],
            'condition' => [
                'active' => $request->input('active') ?? ''
            ],
            'select' => ['*'],
            'orderBy' => $request->input('sort') ? explode(',', $request->input('sort')) : ['id', 'desc'],
        ];

        if ($userId) {
            $params['condition']['user_id'] = $userId;
        }

        return $params;
    }

    public function paginate($request, int $userId = null)
    {
        $params = $this->paginateArgument($request, $userId);
        $links = $this->linkRepo->pagination($params);

        $links->getCollection()->transform(function ($link) {
            $link->status = $link->expires_at && now()->greaterThan($link->expires_at) ? 'Inactive' : 'Active';
            $link->short_url = config('app.url') . '/' . $link->slug;
            $link->click_count = $link->clicks;
            $link->created_at_formatted = $link->created_at->format('Y-m-d H:i:s');

            if (request()->user() && $link->user_id !== request()->user()->id) {
                Log::warning("User {$link->user_id} tried to access link {$link->id} owned by user {$link->user_id}");
            }

            return $link;
        });

        return $links;
    }

    public function create(array $data)
    {
        if (!isset($data['expires_at'])) {
            $data['expires_at'] = now()->addDays(7);
        }

        $link = $this->linkRepo->create($data);

        $shortUrl = config('app.url') . '/' . $link->slug;
        $fileName = 'qr_' . $link->slug . '.png';

        try {
            $builder = new Builder(
                writer: new PngWriter(),
                writerOptions: [],
                validateResult: false,
                data: $shortUrl,
                encoding: new Encoding('UTF-8'),
                errorCorrectionLevel: ErrorCorrectionLevel::High,
                size: 300,
                margin: 10,
                roundBlockSizeMode: RoundBlockSizeMode::Margin,
                logoPath: '',
                logoResizeToWidth: null,
                logoPunchoutBackground: false,
                labelText: '',
                labelFont: new OpenSans(16),
                labelAlignment: LabelAlignment::Center
            );

            $result = $builder->build();
            Storage::disk('public')->put('qr/' . $fileName, $result->getString());
            $link->qr_url = asset('storage/qr/' . $fileName);
            $link->save();

        } catch (\Exception $e) {
            Log::error('[QR] Error creating QR code: ' . $e->getMessage());
            throw $e;
        }

        return $link;
    }

    public function update($id, array $data)
    {
        $link = $this->linkRepo->find($id);

        if (!$link) {
            return null;
        }

        if (isset($data['target']) && $data['target'] !== $link->target) {
            $shortUrl = config('app.url') . '/' . $link->slug;
            $fileName = 'qr_' . $link->slug . '.png';

            try {
                $builder = new Builder(
                    writer: new PngWriter(),
                    writerOptions: [],
                    validateResult: false,
                    data: $shortUrl,
                    encoding: new Encoding('UTF-8'),
                    errorCorrectionLevel: ErrorCorrectionLevel::High,
                    size: 300,
                    margin: 10,
                    roundBlockSizeMode: RoundBlockSizeMode::Margin,
                    logoPath: '',
                    logoResizeToWidth: null,
                    logoPunchoutBackground: false,
                    labelText: '',
                    labelFont: new OpenSans(16),
                    labelAlignment: LabelAlignment::Center
                );

                $result = $builder->build();
                Storage::disk('public')->put('qr/' . $fileName, $result->getString());
                $data['qr_url'] = asset('storage/qr/' . $fileName);

            } catch (\Exception $e) {
                Log::error('[QR] Error updating QR code: ' . $e->getMessage());
            }
        }

        return $this->linkRepo->update($id, $data);
    }

    public function bulkDelete(array $ids): int
    {
        return $this->linkRepo->bulkDelete($ids);
    }

    public function bulkExport(array $ids): array
    {
        $links = $this->linkRepo->findMany($ids);

        return $links->map(function ($link) {
            return [
                'id' => $link->id,
                'title' => $link->title ?? 'Untitled',
                'short_url' => config('app.url') . '/' . $link->slug,
                'original_url' => $link->target,
                'clicks' => $link->clicks,
                'created_at' => $link->created_at->format('Y-m-d H:i:s'),
                'expires_at' => $link->expires_at ? $link->expires_at->format('Y-m-d H:i:s') : null,
                'status' => $link->expires_at && now()->greaterThan($link->expires_at) ? 'Inactive' : 'Active'
            ];
        })->toArray();
    }

    public function findWithAnalytics(int $id)
    {
        $link = $this->linkRepo->find($id);

        if (!$link) {
            return null;
        }

        $analytics = $this->getAnalytics($id);

        return array_merge($link->toArray(), $analytics);
    }

    public function getAnalytics(int $id): ?array
    {
        $link = $this->linkRepo->find($id);

        if (!$link) {
            return null;
        }

        // Get clicks data for the last 30 days
        $clicksData = DB::table('redirects')
            ->where('link_id', $id)
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as clicks')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'clicks' => $item->clicks
                ];
            })
            ->toArray();

        // Get device stats with better detection
        $deviceStats = DB::table('redirects')
            ->where('link_id', $id)
            ->whereNotNull('user_agent')
            ->get()
            ->groupBy(function ($redirect) {
                $userAgent = strtolower($redirect->user_agent);

                if (
                    str_contains($userAgent, 'mobile') ||
                    str_contains($userAgent, 'android') ||
                    str_contains($userAgent, 'iphone')
                ) {
                    return 'Mobile';
                }

                if (
                    str_contains($userAgent, 'tablet') ||
                    str_contains($userAgent, 'ipad')
                ) {
                    return 'Tablet';
                }

                return 'Desktop';
            })
            ->map(function ($group, $deviceType) {
                return [
                    'name' => $deviceType,
                    'value' => $group->count()
                ];
            })
            ->values()
            ->toArray();

        // Get browser stats
        $browserStats = DB::table('redirects')
            ->where('link_id', $id)
            ->whereNotNull('user_agent')
            ->get()
            ->groupBy(function ($redirect) {
                $userAgent = strtolower($redirect->user_agent);

                if (str_contains($userAgent, 'chrome'))
                    return 'Chrome';
                if (str_contains($userAgent, 'firefox'))
                    return 'Firefox';
                if (str_contains($userAgent, 'safari') && !str_contains($userAgent, 'chrome'))
                    return 'Safari';
                if (str_contains($userAgent, 'edge'))
                    return 'Edge';
                if (str_contains($userAgent, 'opera'))
                    return 'Opera';

                return 'Other';
            })
            ->map(function ($group, $browser) {
                return [
                    'name' => $browser,
                    'value' => $group->count()
                ];
            })
            ->values()
            ->toArray();

        // Get referrer stats with better parsing
        $referrerStats = DB::table('redirects')
            ->where('link_id', $id)
            ->whereNotNull('referrer')
            ->get()
            ->groupBy(function ($redirect) {
                if (!$redirect->referrer)
                    return 'Direct';

                $referrer = strtolower($redirect->referrer);

                if (str_contains($referrer, 'google.'))
                    return 'Google';
                if (str_contains($referrer, 'facebook.') || str_contains($referrer, 'fb.'))
                    return 'Facebook';
                if (str_contains($referrer, 'twitter.') || str_contains($referrer, 'x.com'))
                    return 'Twitter/X';
                if (str_contains($referrer, 'linkedin.'))
                    return 'LinkedIn';
                if (str_contains($referrer, 'instagram.'))
                    return 'Instagram';
                if (str_contains($referrer, 'youtube.'))
                    return 'YouTube';
                if (str_contains($referrer, 'tiktok.'))
                    return 'TikTok';

                // Extract domain for others
                $parsed = parse_url($redirect->referrer);
                return $parsed['host'] ?? 'Unknown';
            })
            ->map(function ($group, $referrer) {
                return [
                    'name' => $referrer,
                    'value' => $group->count()
                ];
            })
            ->sortByDesc('value')
            ->take(10)
            ->values()
            ->toArray();

        // Get country stats
        $countryStats = DB::table('redirects')
            ->where('link_id', $id)
            ->whereNotNull('country')
            ->selectRaw('country, COUNT(*) as count')
            ->groupBy('country')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->country,
                    'value' => $item->count
                ];
            })
            ->toArray();

        return [
            'clicksdata' => $clicksData,
            'devices' => $deviceStats,
            'browsers' => $browserStats,
            'referrers' => $referrerStats,
            'countries' => $countryStats,
            'total_clicks' => $link->clicks,
            'created_at' => $link->created_at->format('Y-m-d H:i:s')
        ];
    }

    public function findBySlug(string $slug)
    {
        return $this->linkRepo->findBySlug($slug);
    }

    public function getOriginalLink(string $slug): ?string
    {
        return $this->linkRepo->getOriginalLink($slug);
    }

    public function trackRedirect(Request $request, Link $link) {
        $userAgent = $request->header('User-Agent');
        
        try {
            $redirect = Redirect::create([
                'link_id' => $link->id,
                'ip_address' => $request->ip(),
                'user_agent' => $userAgent,
                'referrer' => $request->header('Referer'),
                'country' => $this->getCountryFromIp($request->ip()),
                'browser' => $this->getBrowserFromUserAgent($userAgent),
                'device' => $this->getDeviceFromUserAgent($userAgent)
            ]);
            
        } catch (\Exception $e) {
            throw $e;
        }

        dispatch(new IncrementLinkClicks($link->id));

        broadcast(new ClickStreamEvent($redirect));
        
        return $redirect;
    }

    private function getCountryFromIp($ip): ?string
    {
        if ($this->isPrivateIp($ip)) {
            return 'Local/Private';
        }

        try {
            $response = Http::timeout(10)->get("http://ip-api.com/json/{$ip}", [
                'fields' => 'status,country,countryCode,message'
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if ($data['status'] === 'success') {
                    return $data['country'];
                }
            }
        } catch (\Exception $e) {
            Log::error('GeoIP request failed', [
                'ip' => $ip,
                'error' => $e->getMessage()
            ]);
        }

        return 'Unknown';
    }

    private function isPrivateIp($ip): bool
    {
        return !filter_var(
            $ip, 
            FILTER_VALIDATE_IP, 
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        );
    }

    private function getBrowserFromUserAgent($userAgent): string
    {
        if (str_contains($userAgent, 'Chrome')) return 'Chrome';
        if (str_contains($userAgent, 'Firefox')) return 'Firefox';
        if (str_contains($userAgent, 'Safari') && !str_contains($userAgent, 'Chrome')) return 'Safari';
        if (str_contains($userAgent, 'Edge')) return 'Edge';
        return 'Unknown';
    }

    private function getDeviceFromUserAgent($userAgent): string
    {
        if (str_contains($userAgent, 'Mobile')) return 'Mobile';
        if (str_contains($userAgent, 'Tablet')) return 'Tablet';
        return 'Desktop';
    }
}
