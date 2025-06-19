import React, { useState } from "react";
import AppRoutes from "@/routes/AppRoutes";
import { AuthProvider } from "@/contexts/AuthProvider";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { ModeToggle } from "@/components/mode-toggle";

function App() {
  const [activeTab, setActiveTab] = useState("history");

  return (
    <AuthProvider>
      <ThemeProvider>
        <ModeToggle />
        <AppRoutes activeTab={activeTab} setActiveTab={setActiveTab} />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
