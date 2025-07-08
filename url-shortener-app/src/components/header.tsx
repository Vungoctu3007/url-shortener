import { useAuthModal } from "@/hooks/useAuthModal";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/contexts/AuthProvider";
import {
    UserCircleIcon,
    ArrowRightIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { logout } from "@/api/authService";

const Header = () => {
    const { isOpen, mode, open, close } = useAuthModal();
    const { user, setUser, fetchUser } = useAuth();

    const handleLogout = () => {
        logout();
        setUser(null);
    };

    return (
        <>
            <header className="w-full bg-white px-4 md:px-16 py-4 flex items-end border-b border-gray-200 shadow-sm">
                <div className="flex items-center space-x-4">
                    {!user ? (
                        <>
                            <Button
                                variant="outline"
                                className="rounded-full px-6 flex items-center gap-2 bg-gray-900 text-white border border-gray-700 hover:bg-white hover:text-gray-900"
                                onClick={() => open("login")}
                            >
                                Login <ArrowRightIcon className="w-4 h-4" />
                            </Button>

                            <Button
                                className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white shadow"
                                onClick={() => open("register")}
                            >
                                Register Now
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 text-gray-900">
                                <UserCircleIcon className="w-6 h-6" />
                                <span>{user.email}</span>
                            </div>

                            <Button
                                className="rounded-full px-6 bg-red-500 hover:bg-red-600 text-white"
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        </>
                    )}
                </div>
            </header>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="absolute inset-0 bg-black/30 backdrop-saturate-150"
                            onClick={close}
                        />

                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                            className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-lg p-6 flex flex-col"
                        >
                            <div className="flex justify-end">
                                <Button variant="ghost" onClick={close}>
                                    <XMarkIcon className="h-6 w-6 text-gray-900" />
                                </Button>
                            </div>

                            <h2 className="text-xl font-bold mb-4 capitalize text-center text-gray-900">
                                {mode === "login" ? "Đăng nhập" : "Đăng ký"}
                            </h2>

                            <AuthForm
                                mode={mode}
                                onSuccess={() => {
                                    fetchUser();
                                    close();
                                }}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;
