import React from "react";
import { MainLayout } from "@/components/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, DollarSign, FileText, Calendar } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const dashboardStats = [
  {
    title: "Membres actifs",
    value: "24",
    change: "+2 ce mois",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900",
  },
  {
    title: "Projets en cours",
    value: "8",
    change: "+1 cette semaine",
    icon: Briefcase,
    color: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900",
  },
  {
    title: "Budget utilisé",
    value: "65%",
    change: "€12,500 / €19,200",
    icon: DollarSign,
    color: "text-orange-500",
    bgColor: "bg-orange-100 dark:bg-orange-900",
  },
  {
    title: "Documents",
    value: "142",
    change: "+8 ce mois",
    icon: FileText,
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900",
  },
];

const chartData = [
  { month: "Jan", members: 18, projects: 4, budget: 8000 },
  { month: "Fév", members: 20, projects: 5, budget: 10000 },
  { month: "Mar", members: 22, projects: 6, budget: 12000 },
  { month: "Avr", members: 24, projects: 8, budget: 12500 },
];

const recentActivities = [
  { id: 1, title: "Nouveau membre inscrit", date: "Aujourd'hui", icon: Users },
  { id: 2, title: "Projet complété", date: "Hier", icon: Briefcase },
  { id: 3, title: "Facture payée", date: "Il y a 2 jours", icon: DollarSign },
  { id: 4, title: "Document ajouté", date: "Il y a 3 jours", icon: FileText },
];

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground mt-1">Bienvenue dans votre espace de gestion</p>
          </div>
          <Button className="gap-2">
            <Calendar size={20} />
            Aujourd'hui
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`${stat.color}`} size={24} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Évolution des membres</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="members" 
                  stroke="var(--primary)" 
                  strokeWidth={2}
                  name="Membres"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Bar Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Budget par mois</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Bar dataKey="budget" fill="var(--accent)" name="Budget (€)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Activités récentes</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center gap-4 pb-4 border-b border-border last:border-b-0 last:pb-0">
                  <div className="p-2 bg-muted rounded-lg">
                    <Icon size={20} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Voir
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
