import React, { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Sidebar from "@/components/SideBar";

interface MainLayoutProps {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, sidebar }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900 overflow-hidden">
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar wrapper */}
            <div className={`
                fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
                lg:relative lg:translate-x-0 lg:z-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {sidebar ? (
                    sidebar
                ) : (
                    <Sidebar onClose={() => setSidebarOpen(false)} />
                )}
            </div>

            {/* Main content area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/60 min-h-full">
                            {children}
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default MainLayout;
