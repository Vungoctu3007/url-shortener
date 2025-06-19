import React from "react";
import {
  ClockIcon,
  ChartBarIcon,
  CursorArrowRaysIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import HistoryTable from "@/components/LinkHistoryTable";
import Statistics from "@/components/Statistics";
import ClickStream from "@/components/ClickStream";
import Settings from "./Setting";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  key: string;
  component: React.ReactNode;
}

const menu: MenuItem[] = [
  {
    label: "History",
    icon: <ClockIcon className="w-5 h-5" />,
    key: "history",
    component: <HistoryTable />,
  },
  {
    label: "Statistics",
    icon: <ChartBarIcon className="w-5 h-5" />,
    key: "statistics",
    component: <Statistics />,
  },
  {
    label: "Click Stream",
    icon: <CursorArrowRaysIcon className="w-5 h-5" />,
    key: "clickstream",
    component: <ClickStream />,
  },
  {
    label: "Settings",
    icon: <Cog6ToothIcon className="w-5 h-5" />,
    key: "settings",
    component: <Settings />,
  },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (key: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const activeItem = menu.find((item) => item.key === activeTab);

  return (
    <div className="flex flex-col bg-white dark:bg-[#0b0e17] transition-colors">
      {/* Menu */}
      <div className="flex justify-center items-center bg-gray-100 dark:bg-[#121623] py-4 border-b border-gray-300 dark:border-[#2e3446]">
        <div className="flex flex-wrap md:flex-nowrap justify-center gap-6 md:gap-12">
          {menu.map((item) => (
            <div
              key={item.key}
              className={clsx(
                "flex flex-col items-center justify-center cursor-pointer group transition-colors",
                activeTab === item.key
                  ? "text-blue-600 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              )}
              onClick={() => setActiveTab(item.key)}
            >
              <div className="group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <span className="mt-1 text-sm font-medium">{item.label}</span>
              <div
                className={clsx(
                  "h-1 w-8 rounded-full mt-2 transition-all duration-300",
                  activeTab === item.key ? "bg-blue-500" : "bg-transparent"
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Nội dung component */}
      <div className="flex-1 flex items-center justify-center">
        {activeItem?.component}
      </div>
    </div>
  );
};

export default Sidebar;
