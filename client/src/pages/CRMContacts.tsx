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
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Download,
} from "lucide-react";
import { exportContactsToCSV, exportContactsToExcel, generateExportFilename } from "@/lib/exportContacts";

const SEGMENT_OPTIONS = [
  { value: "prospect", label: "Prospect" },
  { value: "member", label: "Membre" },
  { value: "donor", label: "Donateur" },
  { value: "volunteer", label: "Bénévole" },
  { value: "partner", label: "Partenaire" },
];

const STATUS_OPTIONS = [
  { value: "prospect", label: "Prospect" },
  { value: "active", label: "Actif" },
  { value: "inactive", label: "Inactif" },
  { value: "archived", label: "Archivé" },
];

const SORT_OPTIONS = [
  { value: "name-asc", label: "Nom (A-Z)" },
  { value: "name-desc", label: "Nom (Z-A)" },
  { value: "date-newest", label: "Plus recents" },
  { value: "date-oldest", label: "Plus anciens" },
  { value: "engagement-high", label: "Engagement (Eleve)" },
  { value: "engagement-low", label: "Engagement (Bas)" },
];

export default function CRMContacts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    segment: "general",
    status: "prospect" as "prospect" | "active" | "inactive" | "archived",
    notes: "",
  });

  const { data: contacts, isLoading, refetch } = trpc.crm.contacts.list.useQuery();
  const createContactMutation = trpc.crm.contacts.create.useMutation();
  const updateContactMutation = trpc.crm.contacts.update.useMutation();
  const deleteContactMutation = trpc.crm.contacts.delete.useMutation();

  // Filter and sort contacts
  const filteredContacts = (contacts?.filter((contact) => {
    const matchesSearch =
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesSegment = !selectedSegment || contact.segment === selectedSegment;
    const matchesStatus = !selectedStatus || contact.status === selectedStatus;

    return matchesSearch && matchesSegment && matchesStatus;
  }) || []).sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case "name-desc":
        return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
      case "date-newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "date-oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "engagement-high":
        return (b.engagementScore || 0) - (a.engagementScore || 0);
      case "engagement-low":
        return (a.engagementScore || 0) - (b.engagementScore || 0);
      default:
        return 0;
    }
  });

  const handleAddContact = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setErrorMessage("Veuillez remplir les champs obligatoires");
      return;
    }

    try {
      await createContactMutation.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        segment: formData.segment,
        status: formData.status,
        notes: formData.notes,
        createdBy: 1,
      });

      setSuccessMessage("Contact ajouté avec succès");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        segment: "general",
        status: "prospect",
        notes: "",
      });
      setIsAddDialogOpen(false);
      refetch();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Erreur lors de l'ajout du contact");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleUpdateContact = async () => {
    if (!editingContact.firstName || !editingContact.lastName || !editingContact.email) {
      setErrorMessage("Veuillez remplir les champs obligatoires");
      return;
    }

    try {
      await updateContactMutation.mutateAsync({
        id: editingContact.id,
        data: {
          firstName: editingContact.firstName,
          lastName: editingContact.lastName,
          email: editingContact.email,
          phone: editingContact.phone,
          company: editingContact.company,
          segment: editingContact.segment,
          status: editingContact.status,
          notes: editingContact.notes,
        },
      });

      setSuccessMessage("Contact modifié avec succès");
      setIsEditDialogOpen(false);
      refetch();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Erreur lors de la modification du contact");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleDeleteContact = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) return;

    try {
      await deleteContactMutation.mutateAsync(id);
      setSuccessMessage("Contact supprimé avec succès");
      refetch();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Erreur lors de la suppression du contact");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleEditContact = (contact: any) => {
    setEditingContact(contact);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <HeroSection
        title="Gestion des Contacts CRM"
        subtitle="Gérez vos prospects, membres et partenaires"
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
            <h1 className="text-3xl font-bold">Contacts</h1>
            <p className="text-muted-foreground mt-1">
              {filteredContacts?.length || 0} contact(s) trouvé(s)
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Ajouter un Nouveau Contact</DialogTitle>
                <DialogDescription>
                  Créez un nouveau contact dans votre CRM
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Prénom *</label>
                    <Input
                      placeholder="Jean"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nom *</label>
                    <Input
                      placeholder="Dupont"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    placeholder="jean@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Téléphone</label>
                  <Input
                    placeholder="+33 6 12 34 56 78"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Entreprise</label>
                  <Input
                    placeholder="Acme Corp"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Segment</label>
                    <Select value={formData.segment} onValueChange={(value) =>
                      setFormData({ ...formData, segment: value })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEGMENT_OPTIONS.map((option) => (
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
                      setFormData({ ...formData, status: value as "prospect" | "active" | "inactive" | "archived" })
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
                  <label className="text-sm font-medium">Notes</label>
                  <Input
                    placeholder="Notes supplémentaires..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <Button
                  onClick={handleAddContact}
                  disabled={createContactMutation.isPending}
                  className="w-full"
                >
                  {createContactMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ajout en cours...
                    </>
                  ) : (
                    "Ajouter le Contact"
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
                <label className="text-sm font-medium mb-2 block">Rechercher</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nom, email..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Segment</label>
                <Select value={selectedSegment || "all"} onValueChange={(value) => setSelectedSegment(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les segments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les segments</SelectItem>
                    {SEGMENT_OPTIONS.map((option) => (
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
                <label className="text-sm font-medium mb-2 block">Trier par</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trier par..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
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

        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              const filename = generateExportFilename("csv");
              exportContactsToCSV(filteredContacts || [], filename);
            }}
          >
            <Download className="h-4 w-4" />
            Exporter en CSV
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              const filename = generateExportFilename("xlsx");
              exportContactsToExcel(filteredContacts || [], filename);
            }}
          >
            <Download className="h-4 w-4" />
            Exporter en Excel
          </Button>
        </div>

        {/* Contacts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Contacts</CardTitle>
            <CardDescription>
              Gérez vos contacts, prospects et partenaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredContacts && filteredContacts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </TableCell>
                        <TableCell>
                          {contact.email ? (
                            <a
                              href={`mailto:${contact.email}`}
                              className="flex items-center gap-2 text-blue-600 hover:underline"
                            >
                              <Mail className="h-4 w-4" />
                              {contact.email}
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.phone ? (
                            <a
                              href={`tel:${contact.phone}`}
                              className="flex items-center gap-2 text-blue-600 hover:underline"
                            >
                              <Phone className="h-4 w-4" />
                              {contact.phone}
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{contact.segment}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              contact.status === "active"
                                ? "default"
                                : contact.status === "inactive"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {contact.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditContact(contact)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteContact(contact.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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
                <p className="text-muted-foreground">Aucun contact trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier le Contact</DialogTitle>
              <DialogDescription>
                Modifiez les informations du contact
              </DialogDescription>
            </DialogHeader>

            {editingContact && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Prénom *</label>
                    <Input
                      placeholder="Jean"
                      value={editingContact.firstName}
                      onChange={(e) =>
                        setEditingContact({ ...editingContact, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nom *</label>
                    <Input
                      placeholder="Dupont"
                      value={editingContact.lastName}
                      onChange={(e) =>
                        setEditingContact({ ...editingContact, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    placeholder="jean@example.com"
                    value={editingContact.email}
                    onChange={(e) =>
                      setEditingContact({ ...editingContact, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Téléphone</label>
                  <Input
                    placeholder="+33 6 12 34 56 78"
                    value={editingContact.phone}
                    onChange={(e) =>
                      setEditingContact({ ...editingContact, phone: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Entreprise</label>
                  <Input
                    placeholder="Acme Corp"
                    value={editingContact.company}
                    onChange={(e) =>
                      setEditingContact({ ...editingContact, company: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Segment</label>
                    <Select
                      value={editingContact.segment}
                      onValueChange={(value) =>
                        setEditingContact({ ...editingContact, segment: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEGMENT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Statut</label>
                    <Select
                      value={editingContact.status}
                      onValueChange={(value) =>
                        setEditingContact({ ...editingContact, status: value })
                      }
                    >
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
                  <label className="text-sm font-medium">Notes</label>
                  <Input
                    placeholder="Notes supplémentaires..."
                    value={editingContact.notes}
                    onChange={(e) =>
                      setEditingContact({ ...editingContact, notes: e.target.value })
                    }
                  />
                </div>

                <Button
                  onClick={handleUpdateContact}
                  disabled={updateContactMutation.isPending}
                  className="w-full"
                >
                  {updateContactMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Modification en cours...
                    </>
                  ) : (
                    "Modifier le Contact"
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
