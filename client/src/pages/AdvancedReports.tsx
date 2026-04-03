import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, FileText, Table2, TrendingUp, DollarSign, Users, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AdvancedReports() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [reportType, setReportType] = useState<"overview" | "financial" | "timeline" | "performance">("overview");

  // Fetch projects
  const { data: projects = [] } = trpc.projects.list.useQuery({});

  // Fetch reports data
  const { data: projectReport, isLoading: isLoadingProject } = trpc.reports.getProjectReport.useQuery(
    { projectId: selectedProjectId ? parseInt(selectedProjectId) : 0 },
    { enabled: !!selectedProjectId && reportType === "overview" }
  );

  const { data: financialReport, isLoading: isLoadingFinancial } = trpc.reports.getFinancialReportByProject.useQuery(
    {},
    { enabled: reportType === "financial" }
  );

  const { data: allProjectsSummary } = trpc.reports.getAllProjectsSummary.useQuery(
    undefined,
    { enabled: reportType === "overview" && !selectedProjectId }
  );

  const handleExportPDF = () => {
    toast.success("Export PDF en cours de préparation...");
    // Implementation for PDF export will be added
  };

  const handleExportExcel = () => {
    toast.success("Export Excel en cours de préparation...");
    // Implementation for Excel export will be added
  };

  // Prepare chart data
  const getChartData = () => {
    if (reportType === "financial" && financialReport?.projects) {
      return financialReport.projects.map((p: any) => ({
        name: p.projectName,
        budget: p.budget,
        spent: p.spent,
        remaining: p.remaining,
      }));
    }
    return [];
  };

  const getTaskStatusData = (): any[] => {
    if (projectReport?.statistics) {
      return [
        { name: "À faire", value: projectReport.statistics.tasksByStatus.todo, color: "#ef4444" },
        { name: "En cours", value: projectReport.statistics.tasksByStatus.inProgress, color: "#f59e0b" },
        { name: "Complétées", value: projectReport.statistics.tasksByStatus.completed, color: "#10b981" },
        { name: "Bloquées", value: projectReport.statistics.tasksByStatus.blocked, color: "#8b5cf6" },
      ];
    }
    return [];
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rapports Avancés</h1>
          <p className="text-muted-foreground">Générez des rapports détaillés avec graphiques et exports</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={handleExportExcel} variant="outline" className="gap-2">
            <Table2 className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres et Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type de Rapport</label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Vue d'ensemble</SelectItem>
                  <SelectItem value="financial">Rapport Financier</SelectItem>
                  <SelectItem value="timeline">Chronologie</SelectItem>
                  <SelectItem value="performance">Performance de l'équipe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === "overview" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Sélectionner un Projet</label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les projets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les projets</SelectItem>
                    {projects.map((project: any) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overview Report */}
      {reportType === "overview" && (
        <div className="space-y-6">
          {selectedProjectId && projectReport ? (
            <>
              {/* Project Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{projectReport.project.name}</CardTitle>
                      <CardDescription>{projectReport.project.description}</CardDescription>
                    </div>
                    <Badge>{projectReport.project.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Progression</p>
                            <p className="text-2xl font-bold">{projectReport.statistics.progressPercentage}%</p>
                          </div>
                          <CheckCircle2 className="h-8 w-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Tâches</p>
                            <p className="text-2xl font-bold">{projectReport.statistics.completedTasks}/{projectReport.statistics.totalTasks}</p>
                          </div>
                          <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Budget</p>
                            <p className="text-2xl font-bold">{projectReport.statistics.budgetUsagePercentage}%</p>
                          </div>
                          <DollarSign className="h-8 w-8 text-purple-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-orange-50 border-orange-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Équipe</p>
                            <p className="text-2xl font-bold">{projectReport.statistics.teamSize}</p>
                          </div>
                          <Users className="h-8 w-8 text-orange-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Progression du Projet</span>
                        <span className="text-sm text-muted-foreground">{projectReport.statistics.progressPercentage}%</span>
                      </div>
                      <Progress value={projectReport.statistics.progressPercentage} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Utilisation du Budget</span>
                        <span className="text-sm text-muted-foreground">{projectReport.statistics.budgetUsagePercentage}%</span>
                      </div>
                      <Progress value={projectReport.statistics.budgetUsagePercentage} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Task Status Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Statut des Tâches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getTaskStatusData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getTaskStatusData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Priority Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Distribution par Priorité</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={[
                          { name: "Basse", value: projectReport.statistics.tasksByPriority.low },
                          { name: "Moyenne", value: projectReport.statistics.tasksByPriority.medium },
                          { name: "Haute", value: projectReport.statistics.tasksByPriority.high },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Team Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Membres de l'Équipe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {projectReport.members.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{member.user?.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                        <Badge variant="outline">{member.role}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* All Projects Summary */}
              {allProjectsSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allProjectsSummary.map((project: any) => (
                    <Card key={project.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-base">{project.name}</CardTitle>
                        <Badge className="w-fit">{project.status}</Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progression</span>
                            <span className="font-medium">{project.progressPercentage}%</span>
                          </div>
                          <Progress value={project.progressPercentage} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Tâches</p>
                            <p className="font-medium">{project.completedCount}/{project.taskCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Équipe</p>
                            <p className="font-medium">{project.teamSize} membres</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Budget</span>
                            <span className="font-medium">{project.budgetUsagePercentage}%</span>
                          </div>
                          <Progress value={project.budgetUsagePercentage} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Financial Report */}
      {reportType === "financial" && financialReport && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Budget Total</p>
                  <p className="text-2xl font-bold">{financialReport.summary.totalBudget.toLocaleString()}€</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Dépensé</p>
                  <p className="text-2xl font-bold text-red-600">{financialReport.summary.totalSpent.toLocaleString()}€</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Restant</p>
                  <p className="text-2xl font-bold text-green-600">{financialReport.summary.totalRemaining.toLocaleString()}€</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Utilisation</p>
                  <p className="text-2xl font-bold">{financialReport.summary.utilizationPercentage}%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Budget par Projet</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                  <Bar dataKey="spent" fill="#ef4444" name="Dépensé" />
                  <Bar dataKey="remaining" fill="#10b981" name="Restant" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Placeholder for other report types */}
      {(reportType === "timeline" || reportType === "performance") && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Ce type de rapport sera bientôt disponible</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
