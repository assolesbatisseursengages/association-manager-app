import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Invoices() {
  const [status, setStatus] = useState<string | undefined>();
  const [isCreating, setIsCreating] = useState(false);

  const { data: invoices = [], isLoading, error } = trpc.invoices.list.useQuery({ status });
  const createMutation = trpc.invoices.create.useMutation();

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        invoiceNumber: `INV-${Date.now()}`,
        invoiceDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        totalAmount: 0,
      });
      setIsCreating(false);
    } catch (err) {
      console.error("Erreur lors de la création de la facture:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalAmount = (invoices as any[]).reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
  const paidAmount = (invoices as any[]).reduce((sum: number, inv: any) => sum + (inv.paidAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Factures</h1>
          <p className="text-muted-foreground">Gestion des factures fournisseurs</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle Facture
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount.toLocaleString()} €</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidAmount.toLocaleString()} €</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{(totalAmount - paidAmount).toLocaleString()} €</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nombre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Erreurs */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Erreur lors du chargement des factures</AlertDescription>
        </Alert>
      )}

      {/* Liste des factures */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Chargement...</div>
        ) : invoices.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Aucune facture. Créez une nouvelle facture pour commencer.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {(invoices as any[]).map((invoice: any) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(invoice.invoiceDate).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{invoice.totalAmount?.toLocaleString()} €</div>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
