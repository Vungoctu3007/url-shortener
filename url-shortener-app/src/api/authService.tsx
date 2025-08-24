import api from "../axios/axiosInstance";
import type { User } from "@/interfaces/user";

export const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
};

export const register = (email: string, password: string) =>
    api.post("/auth/register", { email, password });

export const profile = async (): Promise<User | null> => {
    try {
        const res = await api.get("/auth/profile");
        return res.data;
    } catch {
        return null;
    }
};

export const logout = () => api.post("auth/logout");


