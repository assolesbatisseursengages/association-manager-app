import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, Bell, Check, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NotificationCenter() {
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data: notifications = [], isLoading, error, refetch } = trpc.notifications.list.useQuery({ unreadOnly });
  const { data: unreadCount = 0 } = trpc.notifications.getUnreadCount.useQuery();
  const { data: preferences } = trpc.notifications.getPreferences.useQuery();
  
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();
  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation();
  const updatePreferencesMutation = trpc.notifications.updatePreferences.useMutation();

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsReadMutation.mutateAsync({ id });
      refetch();
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      refetch();
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  const handlePreferenceChange = async (key: string, value: boolean) => {
    try {
      const updates: any = {};
      updates[key] = value;
      await updatePreferencesMutation.mutateAsync(updates);
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Centre de Notifications</h1>
          <p className="text-muted-foreground">Gérez vos notifications et préférences</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline" className="gap-2">
            <Check className="h-4 w-4" />
            Marquer tout comme lu
          </Button>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Notifications Non Lues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-4">
        <Label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={unreadOnly} onCheckedChange={setUnreadOnly} />
          Afficher uniquement les non lues
        </Label>
      </div>

      {/* Erreurs */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Erreur lors du chargement des notifications</AlertDescription>
        </Alert>
      )}

      {/* Préférences */}
      {preferences && (
        <Card>
          <CardHeader>
            <CardTitle>Préférences de Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Notifications par email</Label>
              <Switch
                checked={(preferences as any).emailNotifications}
                onCheckedChange={(v) => handlePreferenceChange("emailNotifications", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Notifications SMS</Label>
              <Switch
                checked={(preferences as any).smsNotifications}
                onCheckedChange={(v) => handlePreferenceChange("smsNotifications", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Notifications dans l'app</Label>
              <Switch
                checked={(preferences as any).inAppNotifications}
                onCheckedChange={(v) => handlePreferenceChange("inAppNotifications", v)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des notifications */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Chargement...</div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Aucune notification {unreadOnly ? "non lue" : ""}.
            </CardContent>
          </Card>
        ) : (
          (notifications as any[]).map((notification: any) => (
            <Card key={notification.id} className={`hover:shadow-md transition-shadow ${!notification.isRead ? "border-blue-200 bg-blue-50" : ""}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{notification.title}</p>
                      {!notification.isRead && (
                        <Badge variant="default" className="ml-auto">Nouveau</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString("fr-FR")} à {new Date(notification.createdAt).toLocaleTimeString("fr-FR")}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Marquer comme lu
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
