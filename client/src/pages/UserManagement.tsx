import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Users,
  Loader2,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  Shield,
  Eye,
  PenTool,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Fetch users
  const { data: users, isLoading, refetch } = trpc.users.list.useQuery();
  const { data: roles } = trpc.users.getRoles.useQuery();
  const { data: permissions } = trpc.users.getPermissions.useQuery();

  // Mutations
  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("✅ Rôle de l'utilisateur mis à jour");
      refetch();
      setSelectedUserId(null);
      setSelectedRole("");
    },
    onError: (error) => {
      toast.error(`❌ ${error.message}`);
    },
  });

  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("✅ Utilisateur supprimé");
      refetch();
      setShowDeleteDialog(false);
      setUserToDelete(null);
    },
    onError: (error) => {
      toast.error(`❌ ${error.message}`);
    },
  });

  const handleUpdateRole = () => {
    if (!selectedUserId || !selectedRole) {
      toast.error("Veuillez sélectionner un utilisateur et un rôle");
      return;
    }

    updateRoleMutation.mutate({
      userId: selectedUserId,
      role: selectedRole as "admin" | "gestionnaire" | "lecteur",
    });
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    deleteUserMutation.mutate({ userId: userToDelete });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "gestionnaire":
        return <PenTool className="h-4 w-4" />;
      case "lecteur":
        return <Eye className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "gestionnaire":
        return "bg-blue-100 text-blue-800";
      case "lecteur":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les rôles et les permissions des utilisateurs
          </p>
        </div>
      </div>

      {/* Permissions Info */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Votre rôle : <strong>{permissions?.roleDisplay}</strong> - {permissions?.description}
        </AlertDescription>
      </Alert>

      {/* Role Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles?.map((role) => (
          <Card key={role.value}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {getRoleIcon(role.value)}
                {role.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{role.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
          <CardDescription>
            {users?.length} utilisateur{users && users.length > 1 ? "s" : ""} enregistré{users && users.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Connecté</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                    <TableCell>{user.email || "N/A"}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        <span className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          {user.role === "admin"
                            ? "Admin"
                            : user.role === "gestionnaire"
                            ? "Gestionnaire"
                            : "Lecteur"}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(user.lastSignedIn).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setSelectedRole(user.role);
                          }}
                          disabled={currentUser?.id === user.id}
                          className="gap-1"
                        >
                          <Edit2 className="h-4 w-4" />
                          Modifier
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setUserToDelete(user.id);
                            setShowDeleteDialog(true);
                          }}
                          disabled={currentUser?.id === user.id}
                          className="gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Update Role Card */}
      {selectedUserId && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5" />
              Modifier le Rôle
            </CardTitle>
            <CardDescription>
              Utilisateur : {users?.find((u) => u.id === selectedUserId)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nouveau Rôle</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdateRole}
                disabled={updateRoleMutation.isPending}
                className="gap-2"
              >
                {updateRoleMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirmer
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedUserId(null);
                  setSelectedRole("");
                }}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera l'utilisateur{" "}
              <strong>{users?.find((u) => u.id === userToDelete)?.name}</strong>. Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
