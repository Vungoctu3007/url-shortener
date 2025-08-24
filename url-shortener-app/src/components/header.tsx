import { useAuthModal } from "@/hooks/useAuthModal";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/contexts/AuthProvider";
import {
    UserCircleIcon,
    ArrowRightIcon,
    XMarkIcon,
    Bars3Icon,
    BellIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { logout } from "@/api/authService";

interface HeaderProps {
    onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { isOpen, mode, open, close } = useAuthModal();
    const { user, setUser, fetchUser, loading } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            setUser(null);
            localStorage.removeItem("isLogin");
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    return (
        <>
            <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200/60 shadow-sm">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left section - Mobile menu and search */}
                        <div className="flex items-center gap-4">
                            {/* Mobile menu button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onMenuClick}
                                className="lg:hidden p-2"
                            >
                                <Bars3Icon className="h-5 w-5" />
                            </Button>

                            {/* Search bar - hidden on mobile */}
                            <div className="hidden sm:flex relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search links..."
                                    className="pl-10 pr-4 py-2 w-64 lg:w-80 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                                />
                            </div>
                        </div>

                        {/* Right section - User actions */}
                        <div className="flex items-center gap-3">
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                                    <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse hidden sm:block" />
                                </div>
                            ) : !user ? (
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full px-4 sm:px-6 text-sm font-medium border-gray-300 hover:bg-gray-50 transition-colors"
                                        onClick={() => open("login")}
                                    >
                                        <span className="hidden sm:inline">Login</span>
                                        <span className="sm:hidden">Log in</span>
                                        <ArrowRightIcon className="w-3 h-3 ml-2" />
                                    </Button>

                                    <Button
                                        size="sm"
                                        className="rounded-full px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm font-medium text-sm transition-all duration-200"
                                        onClick={() => open("register")}
                                    >
                                        <span className="hidden sm:inline">Register Now</span>
                                        <span className="sm:hidden">Sign up</span>
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    {/* Notifications - hidden on mobile */}
                                    <Button variant="ghost" size="sm" className="hidden sm:flex p-2 relative">
                                        <BellIcon className="h-5 w-5 text-gray-600" />
                                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                                            3
                                        </span>
                                    </Button>

                                    {/* User info */}
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                        <div className="relative">
                                            <UserCircleIcon className="w-6 h-6 text-gray-600" />
                                            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                                        </div>
                                        <div className="hidden sm:flex flex-col">
                                            <span className="text-sm font-medium text-gray-900 truncate max-w-32">
                                                {user.email}
                                            </span>
                                            <span className="text-xs text-gray-500">Online</span>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-full px-4 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors"
                                        onClick={handleLogout}
                                    >
                                        <span className="hidden sm:inline">Logout</span>
                                        <span className="sm:hidden text-xs">Exit</span>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile search bar */}
                <div className="sm:hidden px-4 pb-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search links..."
                            className="pl-10 pr-4 py-2 w-full text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                        />
                    </div>
                </div>
            </header>

            {/* Enhanced Auth Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={close}
                        />

                        <motion.div
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                            className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-gray-200"
                        >
                            {/* Modal header */}
                            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {mode === "login" ? "Welcome back" : "Create account"}
                                </h2>
                                <Button
                                    variant="ghost"
                                    onClick={close}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                                </Button>
                            </div>

                            {/* Modal content */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                <p className="text-gray-600 mb-6">
                                    {mode === "login"
                                        ? "Sign in to your account to continue"
                                        : "Join thousands of users managing their links"
                                    }
                                </p>

                                <AuthForm
                                    mode={mode}
                                    onSuccess={() => {
                                        fetchUser();
                                        close();
                                    }}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;
