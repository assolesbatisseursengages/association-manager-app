import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Plus, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Budgets() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [isCreating, setIsCreating] = useState(false);

  const { data: budgets = [], isLoading, error } = trpc.budgets.list.useQuery({ year });
  const createMutation = trpc.budgets.create.useMutation();

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        name: "Nouveau Budget",
        year,
        totalAmount: 10000,
      });
      setIsCreating(false);
    } catch (err) {
      console.error("Erreur lors de la création du budget:", err);
    }
  };

  const totalBudget = budgets.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground">Gestion des budgets annuels</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau Budget
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4">
        <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2024, 2025, 2026].map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Budget Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBudget.toLocaleString()} €</div>
            <p className="text-xs text-muted-foreground">{budgets.length} budgets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Budgets Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgets.filter((b: any) => b.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">En cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Budgets Approuvés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgets.filter((b: any) => b.status === "approved").length}</div>
            <p className="text-xs text-muted-foreground">Validés</p>
          </CardContent>
        </Card>
      </div>

      {/* Erreurs */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Erreur lors du chargement des budgets</AlertDescription>
        </Alert>
      )}

      {/* Liste des budgets */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Chargement...</div>
        ) : budgets.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Aucun budget pour {year}. Créez un nouveau budget pour commencer.
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget: any) => (
            <Card key={budget.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{budget.name}</CardTitle>
                    <CardDescription>{budget.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{budget.totalAmount?.toLocaleString()} €</div>
                    <div className={`text-sm font-medium ${
                      budget.status === "active" ? "text-green-600" :
                      budget.status === "approved" ? "text-blue-600" :
                      "text-gray-600"
                    }`}>
                      {budget.status}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
