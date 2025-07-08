import React, { useState } from "react";
import {
    HomeIcon,
    LinkIcon,
    ChartBarIcon,
    CursorArrowRaysIcon,
    Cog6ToothIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    key: string;
}

const menu: MenuItem[] = [
    {
        label: "Home",
        icon: <HomeIcon className="w-5 h-5" />,
        key: "home",
    },
    {
        label: "Link",
        icon: <LinkIcon className="w-5 h-5" />,
        key: "link",
    },
    {
        label: "Statistics",
        icon: <ChartBarIcon className="w-5 h-5" />,
        key: "statistics",
    },
    {
        label: "Click Stream",
        icon: <CursorArrowRaysIcon className="w-5 h-5" />,
        key: "clickstream",
    },
];

interface SidebarProps {
    activeTab: string;
    setActiveTab: (key: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div
            className={clsx(
                "flex flex-col border-r border-gray-200 transition-all duration-300 h-screen",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex items-center justify-between p-4">
                {!collapsed && (
                    <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-blue-600 text-transparent bg-clip-text select-none">
                        Linkly<sup className="text-sm align-top ml-1">®</sup>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 rounded hover:bg-gray-100"
                >
                    {collapsed ? (
                        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                    ) : (
                        <ChevronLeftIcon className="w-5 h-5 text-gray-500" />
                    )}
                </button>
            </div>
            <div className="flex flex-col">
                <button className="m-3 bg-blue-800 text-white text-sm font-semibold py-2 px-3 rounded-sm hover:bg-blue-700 flex items-center justify-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    {!collapsed && (
                        <span className="font-semibold">Create new</span>
                    )}
                </button>

                <hr className="mx-3 my-2 border-gray-300" />

                <nav className="flex-1 space-y-1">
                    {menu.map((item) => (
                        <div
                            key={item.key}
                            className={clsx(
                                "flex items-center gap-4 px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors",
                                activeTab === item.key
                                    ? "bg-blue-50 text-blue-600 font-semibold"
                                    : "text-gray-700"
                            )}
                            onClick={() => setActiveTab(item.key)}
                        >
                            {item.icon}
                            {!collapsed && (
                                <span className="font-semibold">
                                    {item.label}
                                </span>
                            )}
                        </div>
                    ))}

                    <hr className="mx-3 my-2 border-gray-300" />

                    <div
                        className={clsx(
                            "flex items-center gap-4 px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors",
                            activeTab === "settings"
                                ? "bg-blue-50 text-blue-600 font-semibold"
                                : "text-gray-700"
                        )}
                        onClick={() => setActiveTab("settings")}
                    >
                        <Cog6ToothIcon className="w-5 h-5" />
                        {!collapsed && (
                            <span className="font-semibold">Settings</span>
                        )}
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;
