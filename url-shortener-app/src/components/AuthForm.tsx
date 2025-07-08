import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { login, register } from "../api/authService";
import { useAuth } from "../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface Props {
    mode: "login" | "register";
    onSuccess: () => void;
}

interface FormData {
    email: string;
    password: string;
}

const schema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
        .string()
        .min(6, "At least 6 characters")
        .required("Password is required"),
});

const AuthForm: React.FC<Props> = ({ mode, onSuccess }) => {
    const navigate = useNavigate();
    const { fetchUser } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const {
        register: formRegister,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        try {
            if (mode === "login") {
                let res = await login(data.email, data.password);
                if (res.message) {
                    fetchUser();
                    navigate("/");
                }
            } else {
                await register(data.email, data.password);
            }
            onSuccess();
        } catch (err: any) {
            alert(err.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    type="email"
                    placeholder="Email"
                    className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...formRegister("email")}
                />
                {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                    </p>
                )}
            </div>

            <div className="relative">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                    Password
                </label>
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...formRegister("password")}
                />
                <button
                    type="button"
                    className="absolute right-3 top-[42px] text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                        <EyeIcon className="w-5 h-5" />
                    )}
                </button>
                {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                        {errors.password.message}
                    </p>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Remember me</span>
                </div>
                <a href="#" className="text-blue-600 text-sm">
                    Forgot Password?
                </a>
            </div>

            <button
                type="submit"
                className="bg-[#007b8a] text-white py-3 rounded-md flex justify-center items-center gap-2 hover:bg-[#006577] transition"
            >
                {isSubmitting
                    ? "Processing..."
                    : mode === "login"
                    ? "Sign In"
                    : "Register"}
            </button>

            {mode === "login" && (
                <p className="text-center text-sm mt-2">
                    Don’t have an account?{" "}
                    <span className="text-blue-600 cursor-pointer">
                        Sign Up
                    </span>
                </p>
            )}
        </form>
    );
};

export default AuthForm;
