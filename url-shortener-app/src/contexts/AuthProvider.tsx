import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../interfaces/user";
import { profile } from "../api/authService";

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    fetchUser: () => Promise<void>;

}

const AuthContext = createContext<AuthContextType>({user: null, setUser: () => {}, fetchUser: async () => {}});

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const fetchUser = async() => {
        try {
            const res = await profile();
            setUser(res.data);
        } catch {
            setUser(null);
        }
    }

    useEffect(() => {
        fetchUser();
    }, [])

    return (
        <AuthContext.Provider value={{user, setUser, fetchUser}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext)

