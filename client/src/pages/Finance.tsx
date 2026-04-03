import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, DollarSign, Gift, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { FinanceCharts } from "@/components/FinanceCharts";
import { HeroSection } from "@/components/HeroSection";
import { FinanceReportPDF } from "@/components/FinanceReportPDF";
import { useCotisationReminders } from "@/hooks/useCotisationReminders";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useFormatAmount } from "@/hooks/useFormatAmount";
import { AmountDisplay } from "@/components/AmountDisplay";
import { useState } from "react";

interface Cotisation {
  id: number;
  memberId: number;
  montant: string;
  dateDebut: Date;
  dateFin: Date;
  statut: "payée" | "en attente" | "en retard";
  datePayment?: Date;
  notes?: string;
}

interface Don {
  id: number;
  donateur: string;
  montant: string;
  description?: string;
  email?: string;
  telephone?: string;
  date: Date;
}

interface Depense {
  id: number;
  description: string;
  montant: string;
  categorie: string;
  date: Date;
  notes?: string;
}

const SORT_OPTIONS = [
  { value: "date-newest", label: "Plus recents" },
  { value: "date-oldest", label: "Plus anciens" },
  { value: "amount-high", label: "Montant (Eleve)" },
  { value: "amount-low", label: "Montant (Bas)" },
];

export default function Finance() {
  const { formatAmountWithConversion } = useFormatAmount();
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [dons, setDons] = useState<Don[]>([]);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [activeTab, setActiveTab] = useState("cotisations");
  const [sortBy, setSortBy] = useState<string>("date-newest");

  // Form states
  const [newCotisation, setNewCotisation] = useState({
    memberId: "",
    montant: "",
    dateDebut: "",
    dateFin: "",
    notes: "",
  });

  const [newDon, setNewDon] = useState({
    donateur: "",
    montant: "",
    description: "",
    email: "",
    telephone: "",
  });

  const [newDepense, setNewDepense] = useState({
    description: "",
    montant: "",
    categorie: "autre",
    notes: "",
  });

  const handleAddCotisation = () => {
    if (!newCotisation.memberId || !newCotisation.montant) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    const cotisation: Cotisation = {
      id: Date.now(),
      memberId: parseInt(newCotisation.memberId),
      montant: newCotisation.montant,
      dateDebut: new Date(newCotisation.dateDebut),
      dateFin: new Date(newCotisation.dateFin),
      statut: "en attente",
      notes: newCotisation.notes,
    };

    setCotisations([...cotisations, cotisation]);
    setNewCotisation({ memberId: "", montant: "", dateDebut: "", dateFin: "", notes: "" });
    toast.success("Cotisation ajoutée avec succès");
  };

  const handleAddDon = () => {
    if (!newDon.donateur || !newDon.montant) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    const don: Don = {
      id: Date.now(),
      donateur: newDon.donateur,
      montant: newDon.montant,
      description: newDon.description,
      email: newDon.email,
      telephone: newDon.telephone,
      date: new Date(),
    };

    setDons([...dons, don]);
    setNewDon({ donateur: "", montant: "", description: "", email: "", telephone: "" });
    toast.success("Don enregistré avec succès");
  };

  const handleAddDepense = () => {
    if (!newDepense.description || !newDepense.montant) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    const depense: Depense = {
      id: Date.now(),
      description: newDepense.description,
      montant: newDepense.montant,
      categorie: newDepense.categorie,
      date: new Date(),
      notes: newDepense.notes,
    };

    setDepenses([...depenses, depense]);
    setNewDepense({ description: "", montant: "", categorie: "autre", notes: "" });
    toast.success("Dépense enregistrée avec succès");
  };

  const totalCotisations = cotisations.reduce((sum, c) => sum + parseFloat(c.montant || "0"), 0);
  const totalDons = dons.reduce((sum, d) => sum + parseFloat(d.montant || "0"), 0);
  const totalDepenses = depenses.reduce((sum, d) => sum + parseFloat(d.montant || "0"), 0);
  const solde = totalCotisations + totalDons - totalDepenses;

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "payée":
        return "bg-green-100 text-green-800";
      case "en attente":
        return "bg-yellow-100 text-yellow-800";
      case "en retard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <HeroSection
        title="Gestion Financière"
        subtitle="Suivez les cotisations, dons et dépenses de votre association avec précision"
        icon="💰"
        variant="secondary"
      />

      {/* Vue d'ensemble */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Vue d'ensemble</h2>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cotisations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><AmountDisplay amount={totalCotisations} sourceCurrency="EUR" /></div>
            <p className="text-xs text-muted-foreground">{cotisations.length} cotisations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dons</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><AmountDisplay amount={totalDons} sourceCurrency="EUR" /></div>
            <p className="text-xs text-muted-foreground">{dons.length} dons reçus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><AmountDisplay amount={totalDepenses} sourceCurrency="EUR" /></div>
            <p className="text-xs text-muted-foreground">{depenses.length} dépenses</p>
          </CardContent>
        </Card>

        <Card className={solde >= 0 ? "border-green-200" : "border-red-200"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde</CardTitle>
            <AlertCircle className={`h-4 w-4 ${solde >= 0 ? "text-green-600" : "text-red-600"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${solde >= 0 ? "text-green-600" : "text-red-600"}`}>
              <AmountDisplay amount={solde} sourceCurrency="EUR" />
            </div>
            <p className="text-xs text-muted-foreground">Bilan financier</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cotisations">Cotisations</TabsTrigger>
          <TabsTrigger value="dons">Dons</TabsTrigger>
          <TabsTrigger value="depenses">Dépenses</TabsTrigger>
          <TabsTrigger value="graphiques">Graphiques</TabsTrigger>
        </TabsList>

        {/* Cotisations Tab */}
        <TabsContent value="cotisations" className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <h2 className="text-xl font-semibold">Gestion des Cotisations</h2>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter une cotisation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle Cotisation</DialogTitle>
                  <DialogDescription>
                    Enregistrez une nouvelle cotisation de membre
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="memberId">ID Membre</Label>
                    <Input
                      id="memberId"
                      type="number"
                      value={newCotisation.memberId}
                      onChange={(e) => setNewCotisation({ ...newCotisation, memberId: e.target.value })}
                      placeholder="ID du membre"
                    />
                  </div>
                  <div>
                    <Label htmlFor="montant">Montant (F)</Label>
                    <Input
                      id="montant"
                      type="number"
                      step="0.01"
                      value={newCotisation.montant}
                      onChange={(e) => setNewCotisation({ ...newCotisation, montant: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateDebut">Date de début</Label>
                    <Input
                      id="dateDebut"
                      type="date"
                      value={newCotisation.dateDebut}
                      onChange={(e) => setNewCotisation({ ...newCotisation, dateDebut: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateFin">Date de fin</Label>
                    <Input
                      id="dateFin"
                      type="date"
                      value={newCotisation.dateFin}
                      onChange={(e) => setNewCotisation({ ...newCotisation, dateFin: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (optionnel)</Label>
                    <Input
                      id="notes"
                      value={newCotisation.notes}
                      onChange={(e) => setNewCotisation({ ...newCotisation, notes: e.target.value })}
                      placeholder="Notes..."
                    />
                  </div>
                  <Button onClick={handleAddCotisation} className="w-full">
                    Ajouter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              {cotisations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune cotisation enregistrée</p>
              ) : (
                <div className="space-y-2">
                  {cotisations
                    .sort((a, b) => {
                      switch (sortBy) {
                        case "date-newest":
                          return new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime();
                        case "date-oldest":
                          return new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime();
                        case "amount-high":
                          return parseFloat(b.montant || "0") - parseFloat(a.montant || "0");
                        case "amount-low":
                          return parseFloat(a.montant || "0") - parseFloat(b.montant || "0");
                        default:
                          return 0;
                      }
                    })
                    .map((cot) => (
                    <div key={cot.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Membre #{cot.memberId}</p>
                        <p className="text-sm text-muted-foreground">{cot.notes}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold"><AmountDisplay amount={parseFloat(cot.montant || "0")} sourceCurrency="EUR" /></p>
                        <span className={`text-xs px-2 py-1 rounded ${getStatutColor(cot.statut)}`}>
                          {cot.statut}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dons Tab */}
        <TabsContent value="dons" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gestion des Dons</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Enregistrer un don
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau Don</DialogTitle>
                  <DialogDescription>
                    Enregistrez un nouveau don reçu
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="donateur">Donateur</Label>
                    <Input
                      id="donateur"
                      value={newDon.donateur}
                      onChange={(e) => setNewDon({ ...newDon, donateur: e.target.value })}
                      placeholder="Nom du donateur"
                    />
                  </div>
                  <div>
                    <Label htmlFor="montantDon">Montant (F)</Label>
                    <Input
                      id="montantDon"
                      type="number"
                      step="0.01"
                      value={newDon.montant}
                      onChange={(e) => setNewDon({ ...newDon, montant: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (optionnel)</Label>
                    <Input
                      id="description"
                      value={newDon.description}
                      onChange={(e) => setNewDon({ ...newDon, description: e.target.value })}
                      placeholder="Description du don..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailDon">Email (optionnel)</Label>
                    <Input
                      id="emailDon"
                      type="email"
                      value={newDon.email}
                      onChange={(e) => setNewDon({ ...newDon, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telephone">Téléphone (optionnel)</Label>
                    <Input
                      id="telephone"
                      value={newDon.telephone}
                      onChange={(e) => setNewDon({ ...newDon, telephone: e.target.value })}
                      placeholder="+33 6 XX XX XX XX"
                    />
                  </div>
                  <Button onClick={handleAddDon} className="w-full">
                    Enregistrer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              {dons.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucun don enregistré</p>
              ) : (
                <div className="space-y-2">
                  {dons.map((don) => (
                    <div key={don.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{don.donateur}</p>
                        <p className="text-sm text-muted-foreground">{don.description}</p>
                      </div>
                      <p className="font-semibold text-green-600"><AmountDisplay amount={parseFloat(don.montant || "0")} sourceCurrency="EUR" /></p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dépenses Tab */}
        <TabsContent value="depenses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gestion des Dépenses</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter une dépense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle Dépense</DialogTitle>
                  <DialogDescription>
                    Enregistrez une nouvelle dépense
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="descriptionDepense">Description</Label>
                    <Input
                      id="descriptionDepense"
                      value={newDepense.description}
                      onChange={(e) => setNewDepense({ ...newDepense, description: e.target.value })}
                      placeholder="Description de la dépense"
                    />
                  </div>
                  <div>
                    <Label htmlFor="montantDepense">Montant (F)</Label>
                    <Input
                      id="montantDepense"
                      type="number"
                      step="0.01"
                      value={newDepense.montant}
                      onChange={(e) => setNewDepense({ ...newDepense, montant: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="categorie">Catégorie</Label>
                    <Select value={newDepense.categorie} onValueChange={(value) => setNewDepense({ ...newDepense, categorie: value })}>
                      <SelectTrigger id="categorie">
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="autre">Autre</SelectItem>
                        <SelectItem value="fournitures">Fournitures</SelectItem>
                        <SelectItem value="loyer">Loyer</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="communication">Communication</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notesDepense">Notes (optionnel)</Label>
                    <Input
                      id="notesDepense"
                      value={newDepense.notes}
                      onChange={(e) => setNewDepense({ ...newDepense, notes: e.target.value })}
                      placeholder="Notes..."
                    />
                  </div>
                  <Button onClick={handleAddDepense} className="w-full">
                    Ajouter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              {depenses.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune dépense enregistrée</p>
              ) : (
                <div className="space-y-2">
                  {depenses.map((dep) => (
                    <div key={dep.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{dep.description}</p>
                        <p className="text-sm text-muted-foreground">{dep.categorie}</p>
                      </div>
                      <p className="font-semibold text-red-600"><AmountDisplay amount={parseFloat(dep.montant || "0")} sourceCurrency="EUR" /></p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Graphiques Tab */}
        <TabsContent value="graphiques" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Visualisation Financière</h2>
            <FinanceCharts
              expensesByCategory={depenses.map((d) => ({
                category: d.categorie,
                amount: parseFloat(d.montant || "0"),
              }))}
              monthlyData={[
                {
                  month: "Janvier",
                  revenues: totalCotisations + totalDons,
                  expenses: totalDepenses,
                },
              ]}
              balanceHistory={[
                {
                  month: "Janvier",
                  balance: solde,
                },
              ]}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
