import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    HomeIcon,
    LinkIcon,
    ChartBarIcon,
    CursorArrowRaysIcon,
    Cog6ToothIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
    XMarkIcon,
    SparklesIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";
import {
    HomeIcon as HomeIconSolid,
    LinkIcon as LinkIconSolid,
    ChartBarIcon as ChartBarIconSolid,
    CursorArrowRaysIcon as CursorArrowRaysIconSolid,
    Cog6ToothIcon as Cog6ToothIconSolid,
} from "@heroicons/react/24/solid";
import clsx from "clsx";

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    iconSolid: React.ReactNode;
    path: string;
    badge?: number | string;
    description?: string;
}

const menu: MenuItem[] = [
    {
        label: "Dashboard",
        icon: <HomeIcon className="w-5 h-5" />,
        iconSolid: <HomeIconSolid className="w-5 h-5" />,
        path: "/home",
        description: "Overview and analytics"
    },
    {
        label: "My Links",
        icon: <LinkIcon className="w-5 h-5" />,
        iconSolid: <LinkIconSolid className="w-5 h-5" />,
        path: "/link",
        description: "Manage your links"
    },
    {
        label: "Analytics",
        icon: <ChartBarIcon className="w-5 h-5" />,
        iconSolid: <ChartBarIconSolid className="w-5 h-5" />,
        path: "/statistics",
        description: "Detailed insights"
    },
    {
        label: "Click Stream",
        icon: <CursorArrowRaysIcon className="w-5 h-5" />,
        iconSolid: <CursorArrowRaysIconSolid className="w-5 h-5" />,
        path: "/clickstream",
        badge: "New",
        description: "Real-time click data"
    },
    // {
    //     label: "Settings",
    //     icon: <Cog6ToothIcon className="w-5 h-5" />,
    //     iconSolid: <Cog6ToothIconSolid className="w-5 h-5" />,
    //     path: "/settings",
    //     description: "Account preferences"
    // },
];

interface SidebarProps {
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const handleNavigation = (path: string) => {
        navigate(path);
        if (onClose) onClose(); // Close mobile sidebar
    };

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div
            className={clsx(
                "flex flex-col bg-white border-r border-gray-200/60 transition-all duration-300 h-screen shadow-sm",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <SparklesIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                                Linkly
                            </div>
                            <div className="text-xs text-gray-500 -mt-1">Pro Plan</div>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-1">
                    {/* Close button for mobile */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5 text-gray-500" />
                        </button>
                    )}

                    {/* Collapse toggle for desktop */}
                    <button
                        onClick={toggleCollapsed}
                        className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {collapsed ? (
                            <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                        ) : (
                            <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
                        )}
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
                {menu.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <div
                            key={item.path}
                            onClick={() => handleNavigation(item.path)}
                            className={clsx(
                                "group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200",
                                isActive
                                    ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-sm border border-blue-100"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <div className="flex-shrink-0">
                                {isActive ? item.iconSolid : item.icon}
                            </div>

                            {!collapsed && (
                                <>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm truncate">
                                                {item.label}
                                            </span>
                                            {item.badge && (
                                                <span className={clsx(
                                                    "text-xs px-2 py-0.5 rounded-full font-medium",
                                                    typeof item.badge === 'number'
                                                        ? "bg-gray-100 text-gray-600"
                                                        : "bg-green-100 text-green-600"
                                                )}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        {item.description && !isActive && (
                                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Tooltip for collapsed state */}
                            {collapsed && (
                                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                                    {item.label}
                                    {item.badge && (
                                        <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100">
                {!collapsed ? (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <ClockIcon className="w-4 h-4" />
                        <span>Last sync: 2 min ago</span>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
