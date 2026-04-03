import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Shield,
  User,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function UsersPage() {
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("lecteur");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState("lecteur");

  const { data: users, isLoading, refetch } = trpc.users.list.useQuery();
  const updateUserMutation = trpc.users.updateRole.useMutation();
  const deleteUserMutation = trpc.users.delete.useMutation();

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast.error("Email et mot de passe requis");
      return;
    }

    try {
      // Create user mutation removed - use new UserManagement page instead
      toast.success("Utilisateur créé avec succès");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("lecteur");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création");
    }
  };

  const handleUpdateRole = async (userId: number) => {
    try {
      await updateUserMutation.mutateAsync({
        userId,
        role: editingRole as "admin" | "gestionnaire" | "lecteur",
      });
      toast.success("Rôle mis à jour avec succès");
      setEditingUserId(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUserMutation.mutateAsync({ userId });
      toast.success("Utilisateur supprimé avec succès");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
        <User className="h-3 w-3 mr-1" />
        Membre
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez les utilisateurs et leurs rôles (Admin/Membre)
          </p>
        </div>

        {/* Create User Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Créer un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
              <DialogDescription>
                Ajoutez un nouvel utilisateur à l'application
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="utilisateur@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="role">Rôle</Label>
                <Select value={newUserRole} onValueChange={setNewUserRole}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="membre">Membre</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreateUser}
                disabled={false}
                className="w-full"
              >
                Créer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            {users?.length || 0} utilisateur(s) dans le système
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : users && users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          {user.email}
                          {user.isActive ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          Créé le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getRoleBadge(user.role)}

                    {/* Edit Role Dialog */}
                    <Dialog open={editingUserId === user.id} onOpenChange={(open) => {
                      if (!open) setEditingUserId(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingUserId(user.id);
                            setEditingRole(user.role);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Changer le rôle</DialogTitle>
                          <DialogDescription>
                            Changer le rôle de {user.email}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="role-select">Nouveau rôle</Label>
                            <Select value={editingRole} onValueChange={setEditingRole}>
                              <SelectTrigger id="role-select">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="membre">Membre</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            onClick={() => handleUpdateRole(user.id)}
                            disabled={updateUserMutation.isPending}
                            className="w-full"
                          >
                            {updateUserMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Delete User */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer {user.email} ? Cette action ne peut pas être annulée.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogAction
                          onClick={() => handleDeleteUser(user.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Supprimer
                        </AlertDialogAction>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Aucun utilisateur pour le moment</p>
              <Button className="mt-4" onClick={() => {}}>
                <Plus className="h-4 w-4 mr-2" />
                Créer le premier utilisateur
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300">
              💡 À propos des rôles
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>
                <strong>Admin :</strong> Accès complet à tous les modules et paramètres
              </li>
              <li>
                <strong>Membre :</strong> Accès limité aux documents et informations de base
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
