import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Plus, Briefcase, Edit2, Trash2, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function Projects() {
  const [status, setStatus] = useState<string | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    budget: "",
    priority: "medium",
  });

  const { data: projects = [], isLoading, error } = trpc.projects.list.useQuery({ status });
  const createMutation = trpc.projects.create.useMutation();
  const updateMutation = trpc.projects.update.useMutation();
  const deleteMutation = trpc.projects.delete.useMutation();
  const utils = trpc.useUtils();

  const handleOpenDialog = (project?: any) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        description: project.description || "",
        startDate: project.startDate?.split("T")[0] || "",
        endDate: project.endDate?.split("T")[0] || "",
        budget: project.budget?.toString() || "",
        priority: project.priority || "medium",
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: "",
        description: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        budget: "",
        priority: "medium",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProject(null);
    setFormData({
      name: "",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      budget: "",
      priority: "medium",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Le nom du projet est requis");
      return;
    }

    try {
      if (editingProject) {
        await updateMutation.mutateAsync({
          id: editingProject.id,
          name: formData.name,
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          budget: formData.budget ? parseInt(formData.budget) : undefined,
          priority: formData.priority as any,
        });
        toast.success("Projet modifié avec succès");
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          budget: formData.budget ? parseInt(formData.budget) : undefined,
          priority: formData.priority as any,
        });
        toast.success("Projet créé avec succès");
      }
      handleCloseDialog();
      utils.projects.list.invalidate();
    } catch (err) {
      console.error("Erreur:", err);
      toast.error(editingProject ? "Erreur lors de la modification" : "Erreur lors de la création");
    }
  };

  const handleDelete = async (projectId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) return;

    try {
      await deleteMutation.mutateAsync({ id: projectId });
      toast.success("Projet supprimé avec succès");
      utils.projects.list.invalidate();
    } catch (err) {
      console.error("Erreur:", err);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "on-hold":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "planning":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-blue-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const activeProjects = (projects as any[]).filter((p: any) => p.status === "active").length;
  const totalBudget = (projects as any[]).reduce((sum: number, p: any) => sum + (p.budget || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projets</h1>
          <p className="text-muted-foreground">Gestion des projets et initiatives</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Projet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Modifier le projet" : "Créer un nouveau projet"}</DialogTitle>
              <DialogDescription>
                {editingProject ? "Modifiez les informations du projet" : "Remplissez les informations du projet"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom du projet *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Rénovation du bâtiment"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez le projet..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date de début *</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Date de fin</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Budget (€)</label>
                  <Input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Priorité</label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="critical">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Annuler
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingProject ? "Modifier" : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projets Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Budget Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBudget.toLocaleString()} €</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        <Button
          variant={status === undefined ? "default" : "outline"}
          onClick={() => setStatus(undefined)}
          size="sm"
        >
          Tous
        </Button>
        <Button
          variant={status === "planning" ? "default" : "outline"}
          onClick={() => setStatus("planning")}
          size="sm"
        >
          Planification
        </Button>
        <Button
          variant={status === "active" ? "default" : "outline"}
          onClick={() => setStatus("active")}
          size="sm"
        >
          Actifs
        </Button>
        <Button
          variant={status === "on-hold" ? "default" : "outline"}
          onClick={() => setStatus("on-hold")}
          size="sm"
        >
          En attente
        </Button>
        <Button
          variant={status === "completed" ? "default" : "outline"}
          onClick={() => setStatus("completed")}
          size="sm"
        >
          Complétés
        </Button>
      </div>

      {/* Erreurs */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Erreur lors du chargement des projets</AlertDescription>
        </Alert>
      )}

      {/* Liste des projets */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Chargement...</div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Aucun projet. Créez un nouveau projet pour commencer.
            </CardContent>
          </Card>
        ) : (
          (projects as any[]).map((project: any) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                      <CardTitle>{project.name}</CardTitle>
                    </div>
                    <CardDescription>{project.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = `/projects/${project.id}`}
                      aria-label="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(project)}
                      aria-label="Modifier"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium">{project.progress || 0}%</span>
                  </div>
                  <Progress value={project.progress || 0} className="h-2" />
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Budget</p>
                    <p className="font-bold">{project.budget?.toLocaleString()} €</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Début</p>
                    <p className="font-bold">{new Date(project.startDate).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fin</p>
                    <p className="font-bold">
                      {project.endDate ? new Date(project.endDate).toLocaleDateString("fr-FR") : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Priorité</p>
                    <p className={`font-bold ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
