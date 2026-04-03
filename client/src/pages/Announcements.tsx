import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, AlertCircle, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: "low" | "medium" | "high" | "urgent";
  publishedAt: Date;
  expiresAt?: Date;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 1,
      title: "Réunion générale prévue",
      content: "La réunion générale annuelle est prévue pour le 15 mars 2026 à 18h00.",
      priority: "high",
      publishedAt: new Date("2026-02-04"),
      expiresAt: new Date("2026-03-15"),
    },
    {
      id: 2,
      title: "Mise à jour du système",
      content: "Une maintenance est prévue dimanche de 22h à 23h. L'application sera indisponible pendant cette période.",
      priority: "medium",
      publishedAt: new Date("2026-02-03"),
    },
  ]);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    priority: "medium" as const,
    expiresAt: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  const handleAddAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const announcement: Announcement = {
      id: Date.now(),
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      priority: newAnnouncement.priority,
      publishedAt: new Date(),
      expiresAt: newAnnouncement.expiresAt ? new Date(newAnnouncement.expiresAt) : undefined,
    };

    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement({ title: "", content: "", priority: "medium", expiresAt: "" });
    toast.success("Annonce créée avec succès");
  };

  const handleDeleteAnnouncement = (id: number) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
    toast.success("Annonce supprimée");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Urgent";
      case "high":
        return "Élevée";
      case "medium":
        return "Normale";
      case "low":
        return "Basse";
      default:
        return priority;
    }
  };

  const isExpired = (expiresAt?: Date) => {
    if (!expiresAt) return false;
    return new Date() > expiresAt;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Annonces</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les annonces importantes pour l'association
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Annonces</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-muted-foreground">Annonces actives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {announcements.filter((a) => a.priority === "urgent").length}
            </div>
            <p className="text-xs text-muted-foreground">À traiter en priorité</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirées</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {announcements.filter((a) => isExpired(a.expiresAt)).length}
            </div>
            <p className="text-xs text-muted-foreground">À archiver</p>
          </CardContent>
        </Card>
      </div>

      {/* Bouton Ajouter */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle Annonce
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une Annonce</DialogTitle>
            <DialogDescription>
              Créez une nouvelle annonce pour informer les membres
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                placeholder="Titre de l'annonce"
              />
            </div>
            <div>
              <Label htmlFor="content">Contenu</Label>
              <Textarea
                id="content"
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                placeholder="Contenu de l'annonce"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priorité</Label>
              <Select value={newAnnouncement.priority} onValueChange={(value: any) => setNewAnnouncement({ ...newAnnouncement, priority: value })}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Normale</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expiresAt">Date d'expiration (optionnel)</Label>
              <Input
                id="expiresAt"
                type="date"
                value={newAnnouncement.expiresAt}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, expiresAt: e.target.value })}
              />
            </div>
            <Button onClick={handleAddAnnouncement} className="w-full">
              Créer l'annonce
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Liste des Annonces */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Aucune annonce pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id} className={isExpired(announcement.expiresAt) ? "opacity-50" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{announcement.title}</CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(announcement.priority)}`}>
                        {getPriorityLabel(announcement.priority)}
                      </span>
                      {isExpired(announcement.expiresAt) && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">
                          Expirée
                        </span>
                      )}
                    </div>
                    <CardDescription className="mt-2">
                      Publiée le {announcement.publishedAt.toLocaleDateString("fr-FR")}
                      {announcement.expiresAt && ` • Expire le ${announcement.expiresAt.toLocaleDateString("fr-FR")}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{announcement.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
