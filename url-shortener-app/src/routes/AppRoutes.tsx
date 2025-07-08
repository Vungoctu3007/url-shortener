import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/pages/mainLayout";
import Sidebar from "@/components/SideBar";
import UrlShortener from "@/components/UrlShortener";
import HistoryTable from "@/components/LinkHistoryTable";
import Statistics from "@/components/Statistics";
import ClickStream from "@/components/ClickStream";
import Settings from "@/components/Setting";

const AppRoutes: React.FC = () => {
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem("linkly-active-tab") || "home";
    });

    useEffect(() => {
        localStorage.setItem("linkly-active-tab", activeTab);
    }, [activeTab]);

    return (
        <BrowserRouter>
            <MainLayout
                sidebar={
                    <Sidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                }
            >
                {activeTab === "home" && <UrlShortener />}
                {activeTab === "link" && <HistoryTable />}
                {activeTab === "statistics" && <Statistics />}
                {activeTab === "clickstream" && <ClickStream />}
                {activeTab === "settings" && <Settings />}
            </MainLayout>
        </BrowserRouter>
    );
};

export default AppRoutes;
