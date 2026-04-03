import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HeroSection } from "@/components/HeroSection";
import {
  Plus,
  Phone,
  Mail,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit,
  Trash2,
  Calendar,
  Flag,
} from "lucide-react";

const ACTIVITY_TYPES = [
  { value: "call", label: "Appel", icon: Phone },
  { value: "email", label: "Email", icon: Mail },
  { value: "meeting", label: "Réunion", icon: Users },
  { value: "task", label: "Tâche", icon: "✓" },
  { value: "note", label: "Note", icon: "📝" },
  { value: "event", label: "Événement", icon: Calendar },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "En attente" },
  { value: "completed", label: "Complétée" },
  { value: "cancelled", label: "Annulée" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Basse", color: "bg-blue-100 text-blue-800" },
  { value: "medium", label: "Moyenne", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "Haute", color: "bg-red-100 text-red-800" },
];

export default function CRMActivities() {
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<string>("");

  // Form states
  const [formData, setFormData] = useState({
    contactId: "",
    type: "call" as "call" | "email" | "meeting" | "task" | "note" | "event",
    title: "",
    description: "",
    status: "pending" as "pending" | "completed" | "cancelled",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
  });

  // Fetch data
  const { data: contacts } = trpc.crm.contacts.list.useQuery();
  const { data: activities, isLoading, refetch } = trpc.crm.activities.list.useQuery(
    selectedContactId ? parseInt(selectedContactId) : 0,
    { enabled: !!selectedContactId || !selectedContactId }
  );

  const createActivityMutation = trpc.crm.activities.create.useMutation();
  const updateActivityMutation = trpc.crm.activities.update.useMutation();
  const deleteActivityMutation = trpc.crm.activities.delete.useMutation();

  // Filter activities
  const filteredActivities = activities?.filter((activity) => {
    const matchesType = !selectedType || activity.type === selectedType;
    const matchesStatus = !selectedStatus || activity.status === selectedStatus;
    const matchesPriority = !selectedPriority || activity.priority === selectedPriority;

    return matchesType && matchesStatus && matchesPriority;
  });

  const handleAddActivity = async () => {
    if (!formData.contactId.trim() || !formData.title.trim()) {
      setErrorMessage("Veuillez remplir les champs obligatoires (Contact, Titre)");
      return;
    }

    try {
      await createActivityMutation.mutateAsync({
        contactId: parseInt(formData.contactId),
        type: formData.type,
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        createdBy: 1,
      });

      setSuccessMessage("Activité ajoutée avec succès");
      setFormData({
        contactId: "",
        type: "call",
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        dueDate: "",
      });
      setIsAddDialogOpen(false);
      refetch();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erreur lors de l'ajout de l'activité"
      );
    }
  };

  const handleEditActivity = async () => {
    if (!formData.title.trim()) {
      setErrorMessage("Veuillez remplir le titre");
      return;
    }

    try {
      await updateActivityMutation.mutateAsync({
        id: editingActivity.id,
        data: {
          status: formData.status,
          priority: formData.priority,
          dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        },
      });

      setSuccessMessage("Activité modifiée avec succès");
      setIsEditDialogOpen(false);
      setEditingActivity(null);
      refetch();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erreur lors de la modification de l'activité"
      );
    }
  };

  const handleDeleteActivity = async (activityId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette activité ?")) return;

    try {
      await deleteActivityMutation.mutateAsync(activityId);
      setSuccessMessage("Activité supprimée avec succès");
      refetch();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erreur lors de la suppression de l'activité"
      );
    }
  };

  const openEditDialog = (activity: any) => {
    setEditingActivity(activity);
    setFormData({
      contactId: activity.contactId.toString(),
      type: activity.type,
      title: activity.title,
      description: activity.description || "",
      status: activity.status,
      priority: activity.priority,
      dueDate: activity.dueDate ? new Date(activity.dueDate).toISOString().split("T")[0] : "",
    });
    setIsEditDialogOpen(true);
  };

  const getActivityIcon = (type: string) => {
    const option = ACTIVITY_TYPES.find((t) => t.value === type);
    if (!option) return "📌";
    if (typeof option.icon === "string") return option.icon;
    const Icon = option.icon;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-8">
      <HeroSection
        title="Activités CRM"
        subtitle="Gérez les appels, emails, réunions et tâches liées aux contacts"
        variant="accent"
      />

      <div className="container mx-auto px-4 max-w-7xl space-y-6">
        {/* Messages */}
        {successMessage && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Activités</h1>
            <p className="text-muted-foreground mt-1">
              {filteredActivities?.length || 0} activité(s) trouvée(s)
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter une Activité
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Ajouter une Nouvelle Activité</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle activité pour un contact
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Contact *</label>
                  <Select value={formData.contactId} onValueChange={(value) =>
                    setFormData({ ...formData, contactId: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts?.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id.toString()}>
                          {contact.firstName} {contact.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Type *</label>
                  <Select value={formData.type} onValueChange={(value) =>
                    setFormData({ ...formData, type: value as any })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_TYPES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Titre *</label>
                  <Input
                    placeholder="Titre de l'activité"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Description détaillée"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Priorité</label>
                    <Select value={formData.priority} onValueChange={(value) =>
                      setFormData({ ...formData, priority: value as any })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Statut</label>
                    <Select value={formData.status} onValueChange={(value) =>
                      setFormData({ ...formData, status: value as any })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Date d'échéance</label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <Button
                  onClick={handleAddActivity}
                  disabled={createActivityMutation.isPending}
                  className="w-full"
                >
                  {createActivityMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ajout en cours...
                    </>
                  ) : (
                    "Ajouter l'Activité"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Contact</label>
                <Select value={selectedContactId || "all"} onValueChange={(value) => setSelectedContactId(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les contacts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les contacts</SelectItem>
                    {contacts?.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id.toString()}>
                        {contact.firstName} {contact.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={selectedType || "all"} onValueChange={(value) => setSelectedType(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {ACTIVITY_TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Statut</label>
                <Select value={selectedStatus || "all"} onValueChange={(value) => setSelectedStatus(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Priorité</label>
                <Select value={selectedPriority || "all"} onValueChange={(value) => setSelectedPriority(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les priorités" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les priorités</SelectItem>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Activités</CardTitle>
            <CardDescription>
              Gérez vos appels, emails, réunions et tâches
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredActivities && filteredActivities.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Priorité</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date d'échéance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            {getActivityIcon(activity.type)}
                            {ACTIVITY_TYPES.find((t) => t.value === activity.type)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{activity.title}</TableCell>
                        <TableCell>
                          {contacts?.find((c) => c.id === activity.contactId)?.firstName}{" "}
                          {contacts?.find((c) => c.id === activity.contactId)?.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge className={PRIORITY_OPTIONS.find((p) => p.value === activity.priority)?.color}>
                            {PRIORITY_OPTIONS.find((p) => p.value === activity.priority)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              activity.status === "completed"
                                ? "default"
                                : activity.status === "cancelled"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {STATUS_OPTIONS.find((s) => s.value === activity.status)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {activity.dueDate
                            ? new Date(activity.dueDate).toLocaleDateString("fr-FR")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(activity)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteActivity(activity.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucune activité trouvée</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'Activité</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de l'activité
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Titre</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Priorité</label>
                <Select value={formData.priority} onValueChange={(value) =>
                  setFormData({ ...formData, priority: value as any })
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Statut</label>
                <Select value={formData.status} onValueChange={(value) =>
                  setFormData({ ...formData, status: value as any })
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Date d'échéance</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <Button
              onClick={handleEditActivity}
              disabled={updateActivityMutation.isPending}
              className="w-full"
            >
              {updateActivityMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification en cours...
                </>
              ) : (
                "Modifier l'Activité"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
