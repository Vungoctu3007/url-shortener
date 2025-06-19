import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../pages/mainLayout";
import HomePage from "../pages/homePage";
import Sidebar from "@/components/SideBar";

interface AppRoutesProps {
  activeTab: string;
  setActiveTab: (key: string) => void;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ activeTab, setActiveTab }) => (
  <BrowserRouter>
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
    </MainLayout>
  </BrowserRouter>
);

export default AppRoutes;
