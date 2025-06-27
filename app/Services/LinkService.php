<?php

namespace App\Services;

use App\Interfaces\Repositories\LinkRepositoryInterface;
use App\Interfaces\Services\LinkServiceInterface;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Label\LabelAlignment;
use Endroid\QrCode\Label\Font\OpenSans;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class LinkService extends BaseService implements LinkServiceInterface
{
    protected LinkRepositoryInterface $linkRepo;

    public function __construct(LinkRepositoryInterface $linkRepo)
    {
        parent::__construct($linkRepo);
        $this->linkRepo = $linkRepo;
    }

    private function paginateArgument($request) {
        return [
            'perpage' => $request->input('perpage') ?? 10,
            'keyword' => [
                'search' => $request->input('keyword') ?? '',
            ],
            'condition' => [
                'active' => $request->input('active') ?? ''
            ],
            'select' => ['*'],
            'orderBy' => $request->input('sort') ? explode(',', $request->input('sort')) : ['id', 'asc'],
        ];
    }

    public function paginate($request) {
        $params = $this->paginateArgument($request);
        $links = $this->linkRepo->pagination($params);
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
            Log::error('[QR] Lỗi khi tạo QR code: ' . $e->getMessage());
            throw $e;
        }

        return $link;
    }

    public function findBySlug(string $slug)
    {
        return $this->linkRepo->findBySlug($slug);
    }

    public function getOriginalLink(string $slug): ?string
    {
        return $this->linkRepo->getOriginalLink($slug);
    }
}
