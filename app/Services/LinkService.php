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

class LinkService extends BaseService implements LinkServiceInterface
{
    protected LinkRepositoryInterface $linkRepo;

    public function __construct(LinkRepositoryInterface $linkRepo)
    {
        parent::__construct($linkRepo);
        $this->linkRepo = $linkRepo;
    }

    public function create(array $data)
    {
        Log::info('🔗 [ShortLink] Bắt đầu tạo short link');

        // 1. Tạo link trong DB
        $link = $this->linkRepo->create($data);
        Log::debug('✅ [ShortLink] Link đã được tạo:', $link->toArray());

        // 2. Tạo short URL
        $shortUrl = config('app.url') . '/' . $link->slug;
        Log::debug("🔗 [ShortLink] Short URL: {$shortUrl}");

        // 3. Chuẩn bị tạo QR code
        $fileName = 'qr_' . $link->slug . '.png';
        $localPath = storage_path('app/temp/' . $fileName);
        Log::debug("🖼️ [QR] File sẽ được lưu tại: {$localPath}");

        try {
            // 4. Build QR
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
            $result->saveToFile($localPath);
            Log::info('✅ [QR] QR code đã được tạo và lưu thành công');
        } catch (\Exception $e) {
            Log::error('❌ [QR] Lỗi khi tạo QR code: ' . $e->getMessage());
            throw $e;
        }

        return $link;
    }


    public function findBySlug(string $slug)
    {
        return $this->linkRepo->findBySlug($slug);
    }

    public function getOriginalUrl(string $slug): ?string
    {
        return $this->linkRepo->getOriginalUrl($slug);
    }
}
