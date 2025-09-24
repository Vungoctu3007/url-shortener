export interface UrlShortenerParams {
    title?: string,
    longUrl: string,
    slug?: string,
    userId?: number
}

export interface UrlShortenerResponse {
    shortUrl: string
    qrUrl: string
    linkId: number
}

export interface urlItem {
    id: number;
    slug: string;
    target: string;
    qr_url: string;
    clicks: number;
    deleted_at: string | null;
    created_at: string;
}

export interface urlResult {
    data: urlItem[];
    currentPage: number;
    lastPage: number;
}
