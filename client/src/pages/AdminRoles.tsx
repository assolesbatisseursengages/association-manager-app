import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function AdminRoles() {
  const { data: user } = trpc.auth.me.useQuery();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  // Fetch roles
  const { data: roles = [], isLoading, refetch } = trpc.admin.getRoles.useQuery();

  // Create role mutation
  const createRoleMutation = trpc.admin.createRole.useMutation({
    onSuccess: () => {
      alert("Rôle créé avec succès");
      setFormData({ name: "", description: "" });
      setIsOpen(false);
      refetch();
    },
    onError: (error) => {
      alert(`Erreur: ${error.message || "Erreur lors de la création du rôle"}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Le nom du rôle est requis");
      return;
    }
    createRoleMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
    });
  };

  // Check if user is admin - DISABLED FOR NOW
  // if (!user || user.role !== "admin") {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <Card className="w-full max-w-md">
  //         <CardHeader>
  //           <CardTitle>Accès Refusé</CardTitle>
  //         </CardHeader>
  //         <CardContent>
  //           <p className="text-sm text-muted-foreground">
  //             Vous n'avez pas les permissions pour accéder à cette page.
  //           </p>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Rôles</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les rôles et les permissions de votre association
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau Rôle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un Nouveau Rôle</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau rôle à votre association
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du Rôle</Label>
                <Input
                  id="name"
                  placeholder="Ex: Modérateur"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez les responsabilités de ce rôle"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={createRoleMutation.isPending}>
                  {createRoleMutation.isPending ? "Création..." : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rôles Existants</CardTitle>
          <CardDescription>
            {roles.length} rôle{roles.length !== 1 ? "s" : ""} configuré{roles.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Chargement des rôles...</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Aucun rôle créé pour le moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Système</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {role.description || "-"}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          role.isSystem
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {role.isSystem ? "Système" : "Personnalisé"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(role.createdAt).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!role.isSystem && (
                            <>
                              <Button variant="ghost" size="sm" className="gap-2">
                                <Edit2 className="w-4 h-4" />
                                Modifier
                              </Button>
                              <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
