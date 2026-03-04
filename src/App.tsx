import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import DailySales from "./pages/DailySales";
import Import from "./pages/Import";
import Settings from "./pages/Settings";
import Sellers from "./pages/Sellers";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/vendas-diarias" element={<DailySales />} />
            <Route path="/importacao" element={<Import />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="/sellers" element={<Sellers />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/usuarios" element={<UserManagement />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
