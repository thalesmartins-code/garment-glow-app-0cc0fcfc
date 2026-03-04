import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { FloatingChat } from "@/components/chat/FloatingChat";

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <FloatingChat />
    </div>
  );
}
