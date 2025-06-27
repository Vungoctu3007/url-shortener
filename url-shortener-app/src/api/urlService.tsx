import type { urlResponse } from "@/interfaces/url";
import api from "../axios/axiosInstance";

export const shortenUrl = async (
    longUrl: string,
    slug?: string,
    userId?: number
  ): Promise<urlResponse> => {
    if (!userId) throw new Error("Missing user ID");

    const response = await api.post("/links", {
      target: longUrl,
      slug: slug || "",
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
