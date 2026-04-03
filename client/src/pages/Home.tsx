import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import {
  FileText,
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Activity,
} from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = "default",
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  trend?: string;
  variant?: "default" | "accent" | "warning" | "success";
}) {
  const variantClasses = {
    default: "bg-primary/5 text-primary",
    accent: "bg-accent/10 text-accent",
    warning: "bg-amber-50 text-amber-600",
    success: "bg-emerald-50 text-emerald-600",
  };

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${variantClasses[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            <span>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({
  action,
  entityType,
  details,
  createdAt,
}: {
  action: string;
  entityType: string;
  details: string | null;
  createdAt: Date;
}) {
  const actionLabels: Record<string, string> = {
    create: "Création",
    update: "Modification",
    delete: "Suppression",
    archive: "Archivage",
    restore: "Restauration",
  };

  const entityLabels: Record<string, string> = {
    document: "Document",
    member: "Membre",
    note: "Note",
  };

  return (
    <div className="flex items-start gap-3 py-3 animate-slide-in">
      <div className="mt-0.5 h-2 w-2 rounded-full bg-accent shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-medium">{actionLabels[action] || action}</span>
          {" — "}
          <span className="text-muted-foreground">
            {entityLabels[entityType] || entityType}
          </span>
        </p>
        {details && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {details}
          </p>
        )}
        <p className="text-xs text-muted-foreground/60 mt-1">
          {new Date(createdAt).toLocaleString("fr-FR", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: docStats, isLoading: loadingDocs } =
    trpc.documents.stats.useQuery();
  const { data: members, isLoading: loadingMembers } =
    trpc.members.list.useQuery();
  const { data: finStats, isLoading: loadingFin } =
    trpc.finances.stats.useQuery();
  const { data: activity, isLoading: loadingActivity } =
    trpc.activity.recent.useQuery({ limit: 8 });

  const activeMembers = members?.filter(
    (m: any) => m.status === "active"
  ).length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Bonjour, {user?.name?.split(" ")[0] || "Utilisateur"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Voici un aperçu de l'activité de votre association.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </Badge>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingDocs ? (
          <StatCardSkeleton />
        ) : (
          <StatCard
            title="Documents"
            value={docStats?.total || 0}
            icon={FileText}
            description={`${docStats?.completed || 0} complétés`}
            variant="default"
          />
        )}
        {loadingMembers ? (
          <StatCardSkeleton />
        ) : (
          <StatCard
            title="Membres actifs"
            value={activeMembers || 0}
            icon={Users}
            description={`${members?.length || 0} au total`}
            variant="accent"
          />
        )}
        {loadingFin ? (
          <StatCardSkeleton />
        ) : (
          <StatCard
            title="Solde"
            value={`${(finStats?.solde || 0).toLocaleString("fr-FR")} FCFA`}
            icon={DollarSign}
            description={`${finStats?.nombreDons || 0} dons reçus`}
            variant="success"
          />
        )}
        {loadingDocs ? (
          <StatCardSkeleton />
        ) : (
          <StatCard
            title="Urgents"
            value={docStats?.urgent || 0}
            icon={AlertTriangle}
            description="Documents prioritaires"
            variant="warning"
          />
        )}
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progression des documents */}
        <Card className="lg:col-span-2 animate-fade-in delay-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Progression des documents
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setLocation("/documents")}
              >
                Voir tout
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDocs ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  {
                    label: "Complétés",
                    value: docStats?.completed || 0,
                    total: docStats?.total || 1,
                    color: "bg-emerald-500",
                    icon: CheckCircle2,
                  },
                  {
                    label: "En cours",
                    value: docStats?.inProgress || 0,
                    total: docStats?.total || 1,
                    color: "bg-blue-500",
                    icon: Clock,
                  },
                  {
                    label: "En attente",
                    value: docStats?.pending || 0,
                    total: docStats?.total || 1,
                    color: "bg-amber-500",
                    icon: AlertTriangle,
                  },
                ].map((item) => {
                  const percentage =
                    item.total > 0
                      ? Math.round((item.value / item.total) * 100)
                      : 0;
                  return (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {item.value} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card className="animate-fade-in delay-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activité récente
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setLocation("/activity")}
              >
                Tout voir
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingActivity ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3 py-2">
                    <Skeleton className="h-2 w-2 rounded-full mt-1.5" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="divide-y">
                {activity.map((item: any) => (
                  <ActivityItem
                    key={item.id}
                    action={item.action}
                    entityType={item.entityType}
                    details={item.details}
                    createdAt={item.createdAt}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Aucune activité récente
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Raccourcis rapides */}
      <Card className="animate-fade-in delay-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Accès rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Nouveau document", path: "/documents", icon: FileText },
              { label: "Ajouter un membre", path: "/members", icon: Users },
              { label: "Comptabilité", path: "/finance", icon: DollarSign },
              { label: "Annonces", path: "/announcements", icon: Activity },
            ].map((item) => (
              <Button
                key={item.path}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 text-xs"
                onClick={() => setLocation(item.path)}
              >
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
