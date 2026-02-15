import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "react-router-dom";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/tasks": "Tasks",
  "/projects": "Projects",
  "/reports": "Reports",
  "/settings": "Settings",
};

export function AppHeader() {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] ?? "TimeTrack";

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-sm font-medium">{title}</h1>
    </header>
  );
}
