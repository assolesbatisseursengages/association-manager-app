import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, FileText, Sheet, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Récupérer les données
  const { data: financialStats, isLoading: statsLoading } = trpc.reports.getFinancialStats.useQuery({ startDate: undefined, endDate: undefined });
  const { data: financialReport, isLoading: reportLoading } = trpc.reports.generateFinancialReport.useQuery({
    month: selectedMonth,
    year: selectedYear,
  });
  const { data: membersReport, isLoading: membersLoading } = trpc.reports.getMembersReport.useQuery(undefined, { enabled: true });
  const { data: expensesChart, isLoading: expensesLoading } = trpc.reports.getExpensesChart.useQuery(undefined, { enabled: true });
  const { data: cotisationsChart, isLoading: cotisationsLoading } = trpc.reports.getCotisationsChart.useQuery(undefined, { enabled: true });

  // Couleurs pour les graphiques
  const COLORS = ["#1a4d2e", "#2d7a4a", "#4a9d6f", "#6fb89f", "#a8d5ba"];

  const handleExportPDF = () => {
    toast.success("Export PDF en cours de préparation...");
    // TODO: Implémenter l'export PDF
  };

  const handleExportExcel = () => {
    toast.success("Export Excel en cours de préparation...");
    // TODO: Implémenter l'export Excel
  };

  const isLoading = statsLoading || reportLoading || membersLoading || expensesLoading || cotisationsLoading;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rapports & Exports</h1>
          <p className="text-muted-foreground mt-2">Générez et exportez vos rapports financiers et statistiques</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleExportExcel} variant="outline" size="sm">
            <Sheet className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Sélecteur de période */}
      <Card>
        <CardHeader>
          <CardTitle>Sélectionner une période</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div>
            <label className="text-sm font-medium">Mois</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="mt-1 px-3 py-2 border rounded-md"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {new Date(2000, month - 1).toLocaleString("fr-FR", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Année</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="mt-1 px-3 py-2 border rounded-md"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cotisations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialStats?.cotisations || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Enregistrées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialStats?.depenses || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Enregistrées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Membres Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{membersReport?.active || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Sur {membersReport?.total || 0} total</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique Dépenses */}
        {expensesChart && expensesChart.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Dépenses par Catégorie</CardTitle>
              <CardDescription>Répartition des dépenses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensesChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Graphique Cotisations */}
        {cotisationsChart && cotisationsChart.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Cotisations</CardTitle>
              <CardDescription>Statut des cotisations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cotisationsChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="montant" fill="#1a4d2e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rapport détaillé */}
      {financialReport && (
        <Card>
          <CardHeader>
            <CardTitle>Rapport Financier - {financialReport.period}</CardTitle>
            <CardDescription>Détails complets du mois sélectionné</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Cotisations</p>
                <p className="text-2xl font-bold mt-2">{financialReport.summary.totalCotisations}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Dépenses</p>
                <p className="text-2xl font-bold mt-2">{financialReport.summary.totalDepenses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* État de chargement */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
