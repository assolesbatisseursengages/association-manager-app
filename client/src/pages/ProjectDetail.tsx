import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircle, Plus, ArrowLeft, Edit2, Trash2, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();

  const projectId = id ? parseInt(id) : 0;

  const [activeTab, setActiveTab] = useState("info");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newTaskData, setNewTaskData] = useState({ title: "", description: "", priority: "medium", dueDate: "" });
  const [newExpenseData, setNewExpenseData] = useState({ description: "", amount: "", category: "other", date: new Date().toISOString().split("T")[0] });

  const { data: project, isLoading, error } = trpc.projects.getById.useQuery({ id: projectId });
  const { data: stats } = trpc.projects.getStats.useQuery({ projectId });
  const { data: members } = trpc.projects.getMembers.useQuery({ projectId });
  const { data: expenses } = trpc.projects.getExpenses.useQuery({ projectId });

  const createTaskMutation = trpc.tasks.create.useMutation();
  const updateTaskMutation = trpc.tasks.update.useMutation();
  const deleteTaskMutation = trpc.tasks.delete.useMutation();
  const updateTaskStatusMutation = trpc.tasks.updateStatus.useMutation();
  const addExpenseMutation = trpc.projects.addExpense.useMutation();
  const deleteExpenseMutation = trpc.projects.deleteExpense.useMutation();
  const utils = trpc.useUtils();

  const handleAddTask = async () => {
    if (!newTaskData.title.trim()) {
      toast.error("Le titre de la tâche est requis");
      return;
    }

    try {
      await createTaskMutation.mutateAsync({
        projectId,
        title: newTaskData.title,
        description: newTaskData.description,
        priority: newTaskData.priority as any,
        dueDate: newTaskData.dueDate || undefined,
      });
      toast.success("Tâche créée avec succès");
      setNewTaskData({ title: "", description: "", priority: "medium", dueDate: "" });
      setIsAddingTask(false);
      utils.projects.getById.invalidate({ id: projectId });
    } catch (err) {
      console.error("Erreur:", err);
      toast.error("Erreur lors de la création de la tâche");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) return;

    try {
      await deleteTaskMutation.mutateAsync({ id: taskId });
      toast.success("Tâche supprimée avec succès");
      utils.projects.getById.invalidate({ id: projectId });
    } catch (err) {
      console.error("Erreur:", err);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, status: string) => {
    try {
      await updateTaskStatusMutation.mutateAsync({ id: taskId, status: status as any });
      utils.projects.getById.invalidate({ id: projectId });
      utils.projects.getStats.invalidate({ projectId });
    } catch (err) {
      console.error("Erreur:", err);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleAddExpense = async () => {
    if (!newExpenseData.description.trim() || !newExpenseData.amount) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      await addExpenseMutation.mutateAsync({
        projectId,
        description: newExpenseData.description,
        amount: parseFloat(newExpenseData.amount),
        category: newExpenseData.category,
        date: newExpenseData.date,
      });
      toast.success("Dépense ajoutée avec succès");
      setNewExpenseData({ description: "", amount: "", category: "other", date: new Date().toISOString().split("T")[0] });
      setIsAddingExpense(false);
      utils.projects.getExpenses.invalidate({ projectId });
      utils.projects.getStats.invalidate({ projectId });
    } catch (err) {
      console.error("Erreur:", err);
      toast.error("Erreur lors de l'ajout de la dépense");
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) return;

    try {
      await deleteExpenseMutation.mutateAsync({ id: expenseId });
      toast.success("Dépense supprimée avec succès");
      utils.projects.getExpenses.invalidate({ projectId });
      utils.projects.getStats.invalidate({ projectId });
    } catch (err) {
      console.error("Erreur:", err);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "done":
        return "bg-green-100 text-green-800";
      case "active":
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "on-hold":
      case "review":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "blocked":
        return "bg-red-100 text-red-800";
      case "planning":
      case "todo":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => window.location.href = "/projects"} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour aux projets
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Projet non trouvé</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => window.location.href = "/projects"} size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
        </div>
        <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.progress}%</div>
              <Progress value={stats.progress} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.budget.toLocaleString()} €</div>
              <p className="text-xs text-muted-foreground mt-1">Dépensé: {stats.spent.toLocaleString()} €</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tâches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tasks.completed}/{stats.tasks.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Complétées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Membres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.members}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Restant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.remaining.toLocaleString()} €</div>
              <p className="text-xs text-muted-foreground mt-1">Budget</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="tasks">Tâches</TabsTrigger>
          <TabsTrigger value="members">Membres</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* Onglet Informations */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Détails du projet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date de début</p>
                  <p className="font-medium">{new Date(project.startDate).toLocaleDateString("fr-FR")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de fin</p>
                  <p className="font-medium">
                    {project.endDate ? new Date(project.endDate).toLocaleDateString("fr-FR") : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priorité</p>
                  <p className="font-medium">{project.priority}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Créé par</p>
                  <p className="font-medium">{project.createdBy}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Tâches */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter une tâche
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une tâche</DialogTitle>
                  <DialogDescription>Créez une nouvelle tâche pour ce projet</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Titre *</label>
                    <Input
                      value={newTaskData.title}
                      onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                      placeholder="Titre de la tâche"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newTaskData.description}
                      onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                      placeholder="Description..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Priorité</label>
                      <Select value={newTaskData.priority} onValueChange={(value) => setNewTaskData({ ...newTaskData, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Basse</SelectItem>
                          <SelectItem value="medium">Moyenne</SelectItem>
                          <SelectItem value="high">Haute</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Date limite</label>
                      <Input
                        type="date"
                        value={newTaskData.dueDate}
                        onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingTask(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddTask} disabled={createTaskMutation.isPending}>
                      Ajouter
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {project.tasks && project.tasks.length > 0 ? (
              project.tasks.map((task: any) => (
                <Card key={task.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(task.priority)}
                          <h3 className="font-medium">{task.title}</h3>
                          <Badge className={getStatusColor(task.status)} variant="outline">
                            {task.status}
                          </Badge>
                        </div>
                        {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                        {task.dueDate && (
                          <p className="text-xs text-muted-foreground mt-2">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(task.dueDate).toLocaleDateString("fr-FR")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={task.status} onValueChange={(status) => handleUpdateTaskStatus(task.id, status)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">À faire</SelectItem>
                            <SelectItem value="in-progress">En cours</SelectItem>
                            <SelectItem value="review">En révision</SelectItem>
                            <SelectItem value="done">Complétée</SelectItem>
                            <SelectItem value="blocked">Bloquée</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Aucune tâche. Créez une tâche pour commencer.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Onglet Membres */}
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Membres du projet</CardTitle>
            </CardHeader>
            <CardContent>
              {members && members.length > 0 ? (
                <div className="space-y-2">
                  {members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      <Badge>{member.role}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Aucun membre assigné</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Budget */}
        <TabsContent value="budget" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter une dépense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une dépense</DialogTitle>
                  <DialogDescription>Enregistrez une nouvelle dépense pour ce projet</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Description *</label>
                    <Input
                      value={newExpenseData.description}
                      onChange={(e) => setNewExpenseData({ ...newExpenseData, description: e.target.value })}
                      placeholder="Description de la dépense"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Montant (€) *</label>
                      <Input
                        type="number"
                        value={newExpenseData.amount}
                        onChange={(e) => setNewExpenseData({ ...newExpenseData, amount: e.target.value })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Catégorie</label>
                      <Select value={newExpenseData.category} onValueChange={(value) => setNewExpenseData({ ...newExpenseData, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="materials">Matériaux</SelectItem>
                          <SelectItem value="labor">Main-d'œuvre</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="equipment">Équipement</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      value={newExpenseData.date}
                      onChange={(e) => setNewExpenseData({ ...newExpenseData, date: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingExpense(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddExpense} disabled={addExpenseMutation.isPending}>
                      Ajouter
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Résumé du budget</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Budget alloué</p>
                    <p className="text-2xl font-bold">{stats.budget.toLocaleString()} €</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dépensé</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.spent.toLocaleString()} €</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Restant</p>
                    <p className="text-2xl font-bold text-green-600">{stats.remaining.toLocaleString()} €</p>
                  </div>
                </div>
                <Progress value={(stats.spent / stats.budget) * 100} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {((stats.spent / stats.budget) * 100).toFixed(1)}% du budget utilisé
                </p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {expenses && expenses.length > 0 ? (
              expenses.map((expense: any) => (
                <Card key={expense.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.category} • {new Date(expense.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-lg">{expense.amount.toLocaleString()} €</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Aucune dépense enregistrée
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Onglet Historique */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des modifications</CardTitle>
            </CardHeader>
            <CardContent>
              {project.history && project.history.length > 0 ? (
                <div className="space-y-2">
                  {project.history.map((entry: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 p-2 border-l-2 border-muted">
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(entry.changedAt).toLocaleString("fr-FR")}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{entry.action}</p>
                        <p className="text-sm text-muted-foreground">{entry.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Aucun historique</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
