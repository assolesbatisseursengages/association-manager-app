import React, { useState } from "react";
import { Menu, X, LogOut, Settings, Home, Users, FileText, DollarSign, Briefcase, MessageSquare } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";

interface MainLayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
  associationName?: string;
}

export function MainLayout({ children, onLogout, associationName = "Association Manager" }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  const menuItems = [
    { label: "Tableau de bord", href: "/dashboard", icon: Home },
    { label: "Membres", href: "/members", icon: Users },
    { label: "Projets", href: "/projects", icon: Briefcase },
    { label: "Finances", href: "/finances", icon: DollarSign },
    { label: "Documents", href: "/documents", icon: FileText },
    { label: "CRM", href: "/crm", icon: MessageSquare },
  ];

  const isActive = (href: string) => location === href;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-4 border-b border-border">
            <h1 className="text-xl font-bold text-primary">{associationName}</h1>
            <p className="text-xs text-muted-foreground mt-1">Gestion d'association</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-border space-y-2">
            <Link href="/settings">
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors">
                <Settings size={20} />
                <span className="font-medium">Paramètres</span>
              </a>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-3"
              onClick={() => {
                onLogout?.();
                setSidebarOpen(false);
              }}
            >
              <LogOut size={20} />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 py-4 flex items-center justify-between lg:justify-end">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">Bienvenue</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6">{children}</div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
