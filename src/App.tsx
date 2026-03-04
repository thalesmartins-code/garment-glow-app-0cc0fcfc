import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Vendas from "./pages/Vendas";
import PDV from "./pages/PDV";
import Funcionarios from "./pages/Funcionarios";
import Suporte from "./pages/Suporte";
import FinanceiroDashboard from "./pages/FinanceiroDashboard";
import FinanceiroReceber from "./pages/FinanceiroReceber";
import FinanceiroPagar from "./pages/FinanceiroPagar";
import FinanceiroCaixa from "./pages/FinanceiroCaixa";
import FinanceiroDFC from "./pages/FinanceiroDFC";
import FinanceiroDRE from "./pages/FinanceiroDRE";
import FinanceiroRelatorios from "./pages/FinanceiroRelatorios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/financeiro" replace />} />
            <Route path="/pdv" element={<PDV />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/suporte" element={<Suporte />} />
            <Route path="/financeiro" element={<FinanceiroDashboard />} />
            <Route path="/financeiro/vendas" element={<Vendas />} />
            <Route path="/financeiro/receber" element={<FinanceiroReceber />} />
            <Route path="/financeiro/pagar" element={<FinanceiroPagar />} />
            <Route path="/financeiro/caixa" element={<FinanceiroCaixa />} />
            <Route path="/financeiro/dfc" element={<FinanceiroDFC />} />
            <Route path="/financeiro/dre" element={<FinanceiroDRE />} />
            <Route path="/financeiro/relatorios" element={<FinanceiroRelatorios />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
