import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface MainLayoutProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, sidebar }) => {
    return (
        <div className="flex h-screen bg-white text-gray-900 overflow-hidden">
            <div className="h-full">{sidebar}</div>
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default MainLayout;
