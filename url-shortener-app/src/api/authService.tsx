import api from "../axios/axiosInstance";

export const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
};

export const register = (email: string, password: string) =>
    api.post("/auth/register", { email, password });

export const profile = async () => {
    const res = await api.get("/auth/profile");
    return res;
}

export const refresh = () =>
    api.post("/auth/refresh");


export const logout = () => api.post("auth/logout");
