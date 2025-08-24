// urlService.tsx
import type {
    UrlShortenerParams,
    UrlShortenerResponse,
    urlResult,
} from "@/interfaces/url";
import api from "../axios/axiosInstance";

export const shortenUrl = async ({
    longUrl,
    slug,
    title,
    userId,
}: UrlShortenerParams): Promise<UrlShortenerResponse> => {
    const response = await api.post("/links", {
        target: longUrl,
        slug: slug || "",
        title: title || "",
        user_id: userId,
    });

    const result = response.data;
    if (result.status !== "success") {
        throw new Error(result.message || "Failed to shorten URL");
    }

    return {
        shortUrl: result.short_url,
        qrUrl: result.data.qr_url,
    };
};

export const getLinks = async ({
    userId,
    page = 1,
    perPage = 10,
    keyword = "",
    active = "",
}: {
    userId: number;
    page?: number;
    perPage?: number;
    keyword?: string;
    active?: string | number;
}): Promise<urlResult> => {
    const res = await api.get("/links", {
        params: {
            user_id: userId,
            page,
            perpage: perPage,
            keyword,
            active,
            sort: "created_at,desc",
        },
    });

    const r = res.data.data;
    return {
        data: r.data,
        currentPage: r.current_page,
        lastPage: r.last_page,
    };
};

export const getLinkAnalytics = async (linkId: number) => {
    const response = await api.get(`/links/${linkId}`);

    if (response.data.status !== "success") {
        throw new Error(response.data.message || "Failed to fetch analytics");
    }

    return response.data.data;
};

export const updateLink = async (
    linkId: number,
    data: {
        title?: string;
        target?: string;
        slug?: string;
        expires_at?: string;
    }
) => {
    const response = await api.put(`/links/${linkId}`, data);

    if (response.data.status !== "success") {
        throw new Error(response.data.message || "Failed to update link");
    }

    return response.data.data;
};

export const deleteLink = async (linkId: number) => {
    const response = await api.delete(`/links/${linkId}`);

    if (response.data.status !== "success") {
        throw new Error(response.data.message || "Failed to delete link");
    }

    return response.data;
};

export const bulkDeleteLinks = async (ids: number[]) => {
    const response = await api.post("/links/bulk-delete", { ids });

    if (response.data.status !== "success") {
        throw new Error(response.data.message || "Failed to delete links");
    }

    return response.data;
};

export const bulkExportLinks = async (ids: number[]) => {
    const response = await api.post("/links/bulk-export", { ids });

    if (response.data.status !== "success") {
        throw new Error(response.data.message || "Failed to export links");
    }

    return response.data.data;
};
