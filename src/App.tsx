import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { SellerProvider } from "@/contexts/SellerContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { SalesDataProvider } from "@/contexts/SalesDataContext";
import Index from "./pages/Index";
import DailySales from "./pages/DailySales";
import Import from "./pages/Import";
import Settings from "./pages/Settings";
import Sellers from "./pages/Sellers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SellerProvider>
        <SettingsProvider>
          <SalesDataProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/vendas-diarias" element={<DailySales />} />
                  <Route path="/importacao" element={<Import />} />
                  <Route path="/configuracoes" element={<Settings />} />
                  <Route path="/sellers" element={<Sellers />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SalesDataProvider>
        </SettingsProvider>
      </SellerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
