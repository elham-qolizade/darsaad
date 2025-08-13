import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WarehousePage from "./features/warehouse/WarehousePage";
import WastePage from "./features/warehouse/components/WastePage";
import CategoryListPage from "./pages/CategoryList";
import OTPLogin from "./Component/OTPLogin";

function AppRoutes({ token, onLogin }) {
  const navigate = useNavigate();

  const handleLogin = (accessToken) => {
    onLogin(accessToken);
    navigate("/"); 
  };

  if (!token) {
    return <OTPLogin onLogin={handleLogin} />;
  }

  return (
    <Routes>
      <Route path="/" element={<CategoryListPage token={token} />} />
      <Route path="/warehouse" element={<WarehousePage token={token} />} />
      <Route path="/waste" element={<WastePage token={token} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      toast.configure();
    </Routes>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("accessToken"));

  return (
    <BrowserRouter>
      <AppRoutes token={token} onLogin={setToken} />
    </BrowserRouter>
  );
}
