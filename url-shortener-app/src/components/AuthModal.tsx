import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    mode: "login" | "register";
    children: React.ReactNode;
}

const AuthModal: React.FC<Props> = ({ isOpen, onClose, mode, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === modalRef.current) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div
            ref={modalRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-white/ backdrop-blur-md flex justify-center items-center z-50"
        >
            <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-3 text-gray-500 text-xl"
                >
                    ×
                </button>
                <h2 className="text-2xl font-bold mb-4 text-center">
                    {mode === "login" ? "Login" : "Register"}
                </h2>
                {children}
            </div>
        </div>,
        document.body
    );
};

export default AuthModal;
