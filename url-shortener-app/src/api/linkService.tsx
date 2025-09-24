import api from '@/axios/axiosInstance';

export interface CreateLinkData {
    target: string;
    title?: string;
    slug?: string;
    expires_at?: string;
    user_id: number;
}

export interface UpdateLinkData {
    title?: string;
    target?: string;
    slug?: string;
    expires_at?: string;
}

export interface LinkListParams {
    page?: number;
    perpage?: number;
    keyword?: string;
    active?: string | number;
    sort?: string;
}

export interface ApiResponse<T> {
    status: string;
    data: T;
    message?: string;
    short_url?: string; // For create response
}

export interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface LinkData {
    id: number;
    title?: string | null;
    slug: string;
    target: string;
    clicks: number;
    created_at: string;
    expires_at?: string | null;
    qr_url?: string | null;
    user_id: number;
    status: 'Active' | 'Inactive';
    short_url: string;
    click_count: number;
    created_at_formatted: string;
}

export interface LinkDetailData extends LinkData {
    clicksdata: { date: string; clicks: number }[];
    devices: { name: string; value: number }[];
    referrers: { name: string; value: number }[];
    total_clicks: number;
}

export interface AnalyticsData {
    clicksdata: { date: string; clicks: number }[];
    devices: { name: string; value: number }[];
    referrers: { name: string; value: number }[];
    total_clicks: number;
    created_at: string;
}

class LinkService {
    /**
     * Get paginated list of links
     */
    async getLinks(params: LinkListParams = {}): Promise<ApiResponse<PaginatedResponse<LinkData>>> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.perpage) queryParams.append('perpage', params.perpage.toString());
        if (params.keyword) queryParams.append('keyword', params.keyword);
        if (params.active !== undefined && params.active !== '') {
            queryParams.append('active', params.active.toString());
        }
        if (params.sort) queryParams.append('sort', params.sort);

        const response = await api.get(`/links?${queryParams.toString()}`);
        return response.data;
    }

    /**
     * Create a new link
     */
    async createLink(data: CreateLinkData): Promise<ApiResponse<LinkData>> {
        const response = await api.post('/links', data);
        return response.data;
    }

    /**
     * Get a specific link by ID
     */
    async getLink(id: number): Promise<ApiResponse<LinkData>> {
        const response = await api.get(`/links/${id}`);
        return response.data;
    }

    /**
     * Get link with analytics data
     */
    async getLinkWithAnalytics(id: number): Promise<ApiResponse<LinkDetailData>> {
        const response = await api.get(`/links/${id}`);
        return response.data;
    }

    /**
     * Update a link
     */
    async updateLink(id: number, data: UpdateLinkData): Promise<ApiResponse<LinkData>> {
        const response = await api.put(`/links/${id}`, data);
        return response.data;
    }

    /**
     * Delete a link
     */
    async deleteLink(id: number): Promise<ApiResponse<null>> {
        const response = await api.delete(`/links/${id}`);
        return response.data;
    }

    /**
     * Bulk delete links
     */
    async bulkDeleteLinks(ids: number[]): Promise<ApiResponse<null>> {
        const response = await api.post('/links/bulk-delete', { ids });
        return response.data;
    }

    /**
     * Bulk export links
     */
    async bulkExportLinks(ids: number[]): Promise<ApiResponse<LinkData[]>> {
        const response = await api.post('/links/bulk-export', { ids });
        return response.data;
    }

    /**
     * Get analytics for a specific link
     */
    async getLinkAnalytics(id: number): Promise<ApiResponse<AnalyticsData>> {
        const response = await api.get(`/links/${id}/analytics`);
        return response.data;
    }

    /**
     * Copy link to clipboard
     */
    async copyToClipboard(url: string): Promise<boolean> {
        try {
            await navigator.clipboard.writeText(url);
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    /**
     * Share link using Web Share API
     */
    async shareLink(data: { title: string; url: string; text?: string }): Promise<boolean> {
        try {
            if (navigator.share) {
                await navigator.share(data);
                return true;
            } else {
                // Fallback to copying to clipboard
                return await this.copyToClipboard(data.url);
            }
        } catch (error) {
            console.error('Failed to share:', error);
            return false;
        }
    }

    /**
     * Download QR code
     */
    async downloadQrCode(id: number) {
        const response = await api.get(`/links/${id}/download-qr`, {
        responseType: 'blob', // 👈 nhận file blob
        });
    
        // Tạo blob url
        const url = window.URL.createObjectURL(new Blob([response.data]));
    
        // Tạo thẻ <a> để trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr_${id}.png`; // tên file khi tải
        document.body.appendChild(a);
        a.click();
    
        // Dọn dẹp
        a.remove();
        window.URL.revokeObjectURL(url);
    }
}

export default new LinkService();
