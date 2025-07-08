
import React, { useState } from "react";
import AppRoutes from "@/routes/AppRoutes";
import { AuthProvider } from "@/contexts/AuthProvider";

function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <AuthProvider>
        <AppRoutes activeTab={activeTab} setActiveTab={setActiveTab} />
    </AuthProvider>
  );
}

export default App;
