import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
// import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { trpc } from "@/lib/trpc";
import {
      LayoutDashboard,
      LogOut,
      PanelLeft,
      Users,
      FileText,
      FolderOpen,
      Settings,
      Activity,
      Archive,
      DollarSign,
      Megaphone,
      UserCheck,
      Calendar,
      History,
      Shield,
      Eye,
      Mail,
      BarChart3,
      PhoneCall,
      Globe,
      Cog,
      ChevronDown,
      Building2,
      Briefcase,
      Bell,
      Database,
      Download,
      HardDrive,
    } from "lucide-react";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { UserMenu } from "./UserMenu";

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  adminOnly?: boolean;
}

interface MenuGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: "Tableau de bord",
    icon: LayoutDashboard,
    items: [
      { icon: LayoutDashboard, label: "Vue d'ensemble", path: "/" },
    ],
  },
  {
    label: "Gestion des Membres",
    icon: Users,
    items: [
      { icon: Users, label: "Annuaire", path: "/members" },
      { icon: Building2, label: "Groupes & Antennes", path: "/member-groups" },
      { icon: UserCheck, label: "Adhésions", path: "/adhesions" },
      { icon: Users, label: "Utilisateurs", path: "/users" },
    ],
  },
  {
    label: "Finances",
    icon: DollarSign,
    items: [
      { icon: DollarSign, label: "Comptabilité", path: "/finance" },
      { icon: BarChart3, label: "Budgets", path: "/budgets" },
      { icon: FileText, label: "Factures", path: "/invoices" },
      { icon: BarChart3, label: "Rapports & Exports", path: "/reports" },
      { icon: Megaphone, label: "Campagnes", path: "/campaigns" },
      { icon: Calendar, label: "Événements", path: "/events" },
    ],
  },

  {
    label: "Projets",
    icon: Briefcase,
    items: [
      { icon: Briefcase, label: "Projets", path: "/projects" },
    ],
  },
  {
    label: "Notifications",
    icon: Bell,
    items: [
      { icon: Bell, label: "Centre de notifications", path: "/notifications" },
    ],
  },
  {
    label: "Documents",
    icon: FileText,
    items: [
      { icon: FileText, label: "Documents", path: "/documents" },
      { icon: FolderOpen, label: "Catégories", path: "/categories" },
      { icon: Archive, label: "Archives", path: "/archives" },
    ],
  },
  {
    label: "CRM",
    icon: BarChart3,
    items: [
      { icon: BarChart3, label: "Tableau de bord", path: "/crm", adminOnly: true },
      { icon: Users, label: "Contacts", path: "/crm/contacts", adminOnly: true },
      { icon: PhoneCall, label: "Activités", path: "/crm/activities", adminOnly: true },
      { icon: BarChart3, label: "Rapports", path: "/crm/reports", adminOnly: true },
    ],
  },
  {
    label: "Communication",
    icon: Mail,
    items: [
      { icon: Megaphone, label: "Annonces", path: "/announcements" },
      { icon: Mail, label: "Emails", path: "/email-composer" },
    ],
  },
  {
    label: "Administration",
    icon: Cog,
    items: [
      { icon: Building2, label: "Paramètres Globaux", path: "/global-settings", adminOnly: true },
      { icon: Users, label: "Gestion des Utilisateurs", path: "/admin/users", adminOnly: true },
      { icon: Shield, label: "Rôles", path: "/admin/roles", adminOnly: true },
      { icon: Eye, label: "Journaux", path: "/admin/audit-logs", adminOnly: true },
      { icon: Database, label: "Migrations BD", path: "/admin/migrations", adminOnly: true },
      { icon: Activity, label: "Activité", path: "/activity" },
      { icon: History, label: "Historique", path: "/audit-history" },
    ],
  },
  {
    label: "Outils",
    icon: Database,
    items: [
      { icon: Download, label: "Centre d'Export", path: "/export-center" },
      { icon: Database, label: "Gestionnaire Données", path: "/demo-data", adminOnly: true },
    ],
  },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 380;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-6 p-8 max-w-md w-full">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              Association Manager
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm">
              Connectez-vous pour accéder au portail de gestion de l'association.
            </p>
          </div>
          <Button
            onClick={() => { setLocation("/login"); }}
            size="lg"
            className="w-full"
          >
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { data: settings } = trpc.globalSettings.get.useQuery();

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const active = menuGroups.find((g) =>
      g.items.some((item) => item.path === location)
    );
    return new Set(active ? [active.label, "Tableau de bord"] : ["Tableau de bord"]);
  });

  const activeItem = useMemo(
    () => menuGroups.flatMap((g) => g.items).find((item) => item.path === location),
    [location]
  );

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <>
      <div className="flex h-screen w-full max-w-full overflow-hidden" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0 flex-shrink-0 h-full"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center border-b border-sidebar-border">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-sidebar-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring shrink-0"
                aria-label="Basculer la navigation"
              >
                <PanelLeft className="h-4 w-4 text-sidebar-foreground/70" />
              </button>
              {settings?.logo && !isCollapsed && (
                <img
                  src={settings.logo}
                  alt="Logo"
                  className="h-8 w-8 rounded-lg object-cover flex-shrink-0"
                />
              )}
              {!isCollapsed && (
                <span className="font-semibold tracking-tight truncate text-sm text-sidebar-foreground">
                  {settings?.associationName || "Bâtisseurs Engagés"}
                </span>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 pt-2 overflow-y-auto">
            <SidebarMenu className="px-2 py-1">
              {menuGroups.map((group) => {
                const isExpanded = expandedGroups.has(group.label);
                const hasActiveItem = group.items.some((item) => item.path === location);
                const GroupIcon = group.icon;

                return (
                  <div key={group.label} className="mb-1">
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        hasActiveItem
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/60 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <GroupIcon className="h-4 w-4" />
                        {!isCollapsed && <span>{group.label}</span>}
                      </span>
                      {!isCollapsed && (
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </button>

                    {(isExpanded || isCollapsed) && (
                      <div className={isCollapsed ? "space-y-0.5" : "ml-2 space-y-0.5 mt-0.5"}>
                        {group.items.map((item) => {
                          const isActive = location === item.path;
                          const ItemIcon = item.icon;
                          return (
                            <SidebarMenuItem key={item.path}>
                              <SidebarMenuButton
                                isActive={isActive}
                                onClick={() => setLocation(item.path)}
                                tooltip={item.label}
                                className={`h-9 text-xs transition-all font-normal ${
                                  isActive
                                    ? "bg-accent text-accent-foreground font-medium"
                                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                                }`}
                              >
                                <ItemIcon className="h-4 w-4" />
                                {!isCollapsed && <span>{item.label}</span>}
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-sidebar-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
                  <Avatar className="h-9 w-9 border border-sidebar-border shrink-0">
                    <AvatarFallback className="text-xs font-medium bg-accent text-accent-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none text-sidebar-foreground">
                      {user?.name || "Utilisateur"}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 truncate mt-1">
                      {user?.email || ""}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => setLocation("/settings")}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>

          {!isCollapsed && (
            <div
              onMouseDown={() => setIsResizing(true)}
              className="absolute right-0 top-0 bottom-0 w-1 hover:bg-accent/50 cursor-col-resize transition-colors"
            />
          )}
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <header className="sticky top-0 z-40 flex items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-6 h-14 flex-shrink-0">
            {isMobile && <SidebarTrigger className="-ml-2" />}
            <div className="flex-1">
              <h1 className="text-base font-semibold text-foreground">
                {activeItem?.label || "Tableau de bord"}
              </h1>
            </div>
            {user && (
              <UserMenu
                userName={user.name || "Utilisateur"}
                userEmail={user.email || ""}
                onLogout={logout}
              />
            )}
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </>
  );
}
