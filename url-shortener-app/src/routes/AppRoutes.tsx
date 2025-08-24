import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/pages/mainLayout";
import Sidebar from "@/components/SideBar";
import UrlShortener from "@/components/UrlShortener";
import LinkPage from "@/pages/LinkPage";
import Statistics from "@/pages/StatisticsPage";
import ClickStream from "@/pages/ClickStreamPage";
import Settings from "@/components/Setting";
import DetailLinkPage from "@/pages/detailLinkPage";
import SocialCallback from "@/pages/SocialCallback";

const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <MainLayout sidebar={<Sidebar />}>
                <Routes>
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/home" element={<UrlShortener />} />
                    <Route path="/link" element={<LinkPage />} />
                    <Route path="/statistics" element={<Statistics />} />
                    <Route path="/clickstream" element={<ClickStream />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/link/:id" element={<DetailLinkPage />} />
                    <Route path="/auth/callback" element={<SocialCallback />} />
                </Routes>
            </MainLayout>
        </BrowserRouter>
    );
};

export default AppRoutes;
