import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FolderOpen, 
  FileText,
  Scale,
  Users,
  Clipboard,
  Wallet,
  UserCheck,
  Megaphone,
  HandCoins,
  ArrowRight
} from "lucide-react";
import { useLocation } from "wouter";

const iconMap: Record<string, any> = {
  scale: Scale,
  users: Users,
  clipboard: Clipboard,
  wallet: Wallet,
  "user-check": UserCheck,
  megaphone: Megaphone,
  "hand-coins": HandCoins,
  folder: FolderOpen,
};

export default function Categories() {
  const [, setLocation] = useLocation();
  const { data: categories, isLoading: categoriesLoading } = trpc.categories.list.useQuery();
  const { data: documents } = trpc.documents.list.useQuery({});

  const getDocumentCountByCategory = (categoryId: number) => {
    return documents?.filter(d => d.categoryId === categoryId).length || 0;
  };

  const getCompletedCountByCategory = (categoryId: number) => {
    return documents?.filter(d => d.categoryId === categoryId && d.status === "completed").length || 0;
  };

  const getProgressPercentage = (categoryId: number) => {
    const total = getDocumentCountByCategory(categoryId);
    const completed = getCompletedCountByCategory(categoryId);
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Catégories</h1>
        <p className="text-muted-foreground">
          Organisation de vos documents par catégorie
        </p>
      </div>

      {/* Categories Grid */}
      {categoriesLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-5 w-3/4 mt-3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-2 w-full rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon || "folder"] || FolderOpen;
            const docCount = getDocumentCountByCategory(category.id);
            const completedCount = getCompletedCountByCategory(category.id);
            const progress = getProgressPercentage(category.id);

            return (
              <Card 
                key={category.id} 
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setLocation("/documents")}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <IconComponent 
                        className="h-6 w-6" 
                        style={{ color: category.color || "#1a4d2e" }}
                      />
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <FileText className="h-3 w-3" />
                      {docCount}
                    </Badge>
                  </div>
                  <CardTitle className="mt-3">{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium">{completedCount}/{docCount} complétés</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: category.color || "#1a4d2e"
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Voir les documents
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">Aucune catégorie</h3>
            <p className="text-muted-foreground">
              Les catégories seront créées automatiquement
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      {categories && categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résumé par catégorie</CardTitle>
            <CardDescription>Vue d'ensemble de la progression de vos documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category) => {
                const IconComponent = iconMap[category.icon || "folder"] || FolderOpen;
                const docCount = getDocumentCountByCategory(category.id);
                const completedCount = getCompletedCountByCategory(category.id);
                const progress = getProgressPercentage(category.id);

                return (
                  <div key={category.id} className="flex items-center gap-4">
                    <div 
                      className="p-2 rounded-lg shrink-0"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <IconComponent 
                        className="h-4 w-4" 
                        style={{ color: category.color || "#1a4d2e" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate">{category.name}</span>
                        <span className="text-sm text-muted-foreground shrink-0 ml-2">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${progress}%`,
                            backgroundColor: category.color || "#1a4d2e"
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground shrink-0">
                      {completedCount}/{docCount}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
