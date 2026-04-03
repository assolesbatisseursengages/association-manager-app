import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Memberships() {
  const [memberId, setMemberId] = useState<number | undefined>();
  const [isCreating, setIsCreating] = useState(false);

  const { data: memberships = [], isLoading, error } = trpc.memberships.listMemberships.useQuery({ memberId });
  const { data: types = [] } = trpc.memberships.listTypes.useQuery();
  const createMutation = trpc.memberships.createMembership.useMutation();

  const handleCreate = async () => {
    try {
      if (types.length > 0) {
        await createMutation.mutateAsync({
          memberId: 1,
          membershipTypeId: (types[0] as any).id,
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          amount: (types[0] as any).yearlyAmount || 0,
        });
        setIsCreating(false);
      }
    } catch (err) {
      console.error("Erreur lors de la création de l'adhésion:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const activeCount = (memberships as any[]).filter((m: any) => m.paymentStatus === "paid").length;
  const totalAmount = (memberships as any[]).reduce((sum: number, m: any) => sum + (m.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Adhésions</h1>
          <p className="text-muted-foreground">Gestion des adhésions et cotisations</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle Adhésion
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Adhésions Actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">Payées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Collecté</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount.toLocaleString()} €</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Types Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{types.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Types d'adhésions */}
      {types.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Types d'Adhésions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(types as any[]).map((type: any) => (
              <Card key={type.id}>
                <CardHeader>
                  <CardTitle className="text-base">{type.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Mensuel</p>
                    <p className="text-lg font-bold">{type.monthlyAmount?.toLocaleString()} €</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Annuel</p>
                    <p className="text-lg font-bold">{type.yearlyAmount?.toLocaleString()} €</p>
                  </div>
                  {type.benefits && (
                    <p className="text-sm text-muted-foreground">{type.benefits}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Erreurs */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Erreur lors du chargement des adhésions</AlertDescription>
        </Alert>
      )}

      {/* Liste des adhésions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Adhésions Enregistrées</h2>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : memberships.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Aucune adhésion. Créez une nouvelle adhésion pour commencer.
              </CardContent>
            </Card>
          ) : (
            (memberships as any[]).map((membership: any) => (
              <Card key={membership.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{membership.typeName}</p>
                        <p className="text-sm text-muted-foreground">
                          Du {new Date(membership.startDate).toLocaleDateString("fr-FR")} au {new Date(membership.endDate).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{membership.amount?.toLocaleString()} €</div>
                      <Badge className={getStatusColor(membership.paymentStatus)}>
                        {membership.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
