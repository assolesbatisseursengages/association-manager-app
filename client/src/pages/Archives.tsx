import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Archive, 
  FileText, 
  Search, 
  RotateCcw,
  Trash2,
  FolderOpen,
  Calendar,
  Download,
  Filter
} from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Archives() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: archivedDocs, isLoading, refetch } = trpc.documents.archived.useQuery({
    categoryId: categoryFilter !== "all" ? parseInt(categoryFilter) : undefined,
    search: search || undefined,
  });

  const restoreMutation = trpc.documents.restore.useMutation({
    onSuccess: () => {
      toast.success("Document restauré avec succès");
      refetch();
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la restauration: " + error.message);
    },
  });

  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Document supprimé définitivement");
      setDeleteId(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la suppression: " + error.message);
    },
  });

  const getCategoryName = (categoryId: number) => {
    const cat = categories?.find(c => c.id === categoryId);
    return cat?.name || "Non catégorisé";
  };

  const getCategoryColor = (categoryId: number) => {
    const cat = categories?.find(c => c.id === categoryId);
    return cat?.color || "#1a4d2e";
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="status-completed">Complété</Badge>;
      case "in-progress":
        return <Badge className="status-in-progress">En cours</Badge>;
      default:
        return <Badge className="status-pending">En attente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Archive className="h-6 w-6 text-primary" />
            Archives
          </h1>
          <p className="text-muted-foreground">
            Documents archivés - {archivedDocs?.length || 0} document(s)
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les archives..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Archived Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents archivés</CardTitle>
          <CardDescription>
            Ces documents ont été archivés et peuvent être restaurés à tout moment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          ) : archivedDocs && archivedDocs.length > 0 ? (
            <div className="space-y-3">
              {archivedDocs.map((doc: any) => (
                <div 
                  key={doc.id} 
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div 
                    className="p-2 rounded-lg shrink-0"
                    style={{ backgroundColor: `${getCategoryColor(doc.categoryId)}20` }}
                  >
                    <FileText 
                      className="h-5 w-5" 
                      style={{ color: getCategoryColor(doc.categoryId) }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{doc.title}</h3>
                      {getStatusBadge(doc.status)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {doc.description || "Aucune description"}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FolderOpen className="h-3 w-3" />
                        {getCategoryName(doc.categoryId)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Archivé le {formatDate(doc.updatedAt)}
                      </span>
                      {doc.fileUrl && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {doc.fileName} ({formatFileSize(doc.fileSize)})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {doc.fileUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.fileUrl!, "_blank")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restoreMutation.mutate({ id: doc.id })}
                      disabled={restoreMutation.isPending}
                      className="gap-1"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restaurer
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Archive className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-1">Aucun document archivé</h3>
              <p className="text-sm">
                Les documents archivés apparaîtront ici
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer définitivement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le document sera supprimé définitivement
              et ne pourra pas être récupéré.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
