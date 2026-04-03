import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, Users, MapPin, Mail, Phone, User } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface MemberGroup {
  id: number;
  name: string;
  slug: string;
  description?: string;
  location?: string;
  coordinatorId?: number;
  responsableMemberId?: number;
  email?: string;
  phone?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
}

export default function MemberGroups() {
  const [groups, setGroups] = useState<MemberGroup[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    location: "",
    email: "",
    phone: "",
    responsableMemberId: "",
  });

  const { data: groupsData, isLoading, refetch } = trpc.memberGroups.list.useQuery();
  const { data: membersData } = trpc.members.list.useQuery();
  const createMutation = trpc.memberGroups.create.useMutation();
  const updateMutation = trpc.memberGroups.update.useMutation();
  const deleteMutation = trpc.memberGroups.delete.useMutation();

  useEffect(() => {
    if (groupsData) {
      setGroups(groupsData as MemberGroup[]);
    }
  }, [groupsData]);

  useEffect(() => {
    if (membersData) {
      setMembers(membersData as Member[]);
    }
  }, [membersData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        responsableMemberId: formData.responsableMemberId && formData.responsableMemberId !== "none" ? parseInt(formData.responsableMemberId) : undefined,
      };

      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...submitData,
        });
        toast.success("Groupe mis à jour avec succès");
      } else {
        await createMutation.mutateAsync({
          ...submitData,
          slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        });
        toast.success("Groupe créé avec succès");
      }
      
      setFormData({ name: "", slug: "", description: "", location: "", email: "", phone: "", responsableMemberId: "none" });
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erreur lors de l'opération");
    }
  };

  const handleEdit = (group: MemberGroup) => {
    setFormData({
      name: group.name,
      slug: group.slug,
      description: group.description || "",
      location: group.location || "",
      email: group.email || "",
      phone: group.phone || "",
      responsableMemberId: group.responsableMemberId?.toString() || "",
    });
    setEditingId(group.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce groupe?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Groupe supprimé avec succès");
        refetch();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const getResponsableName = (responsableMemberId?: number) => {
    if (!responsableMemberId) return "Non assigné";
    const member = members.find(m => m.id === responsableMemberId);
    return member ? `${member.firstName} ${member.lastName}` : "Responsable supprimé";
  };

  if (isLoading) {
    return <div className="p-4">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Groupes & Antennes</h1>
          <p className="text-muted-foreground mt-2">Gérez les groupes locaux et antennes de votre association</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setFormData({ name: "", slug: "", description: "", location: "", email: "", phone: "", responsableMemberId: "" }); }}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau groupe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Modifier le groupe" : "Créer un nouveau groupe"}</DialogTitle>
              <DialogDescription>
                Remplissez les informations du groupe et désignez un responsable
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nom du groupe *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ex: N'Djaména"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Slug</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="ex: ndjamena"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du groupe"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Localisation</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="ex: N'Djaména, Tchad"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Responsable</label>
                  <Select value={formData.responsableMemberId} onValueChange={(value) => setFormData({ ...formData, responsableMemberId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un responsable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun</SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.firstName} {member.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@groupe.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Téléphone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+235 66 00 00 00"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingId ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {group.name}
                    <Badge variant={group.status === "active" ? "default" : "secondary"}>
                      {group.status === "active" ? "Actif" : "Inactif"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(group)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(group.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {group.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{group.location}</span>
                  </div>
                )}
                {group.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{group.email}</span>
                  </div>
                )}
                {group.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{group.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{getResponsableName(group.responsableMemberId)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
