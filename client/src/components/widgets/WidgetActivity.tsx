import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Activity {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  details: string;
  createdAt: Date;
}

interface WidgetActivityProps {
  activities: Activity[];
  limit?: number;
}

export function WidgetActivity({ activities, limit = 5 }: WidgetActivityProps) {
  const displayedActivities = activities.slice(0, limit);

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-800";
      case "update":
        return "bg-blue-100 text-blue-800";
      case "delete":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "create":
        return "Création";
      case "update":
        return "Modification";
      case "delete":
        return "Suppression";
      default:
        return action;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">Activité Récente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune activité récente</p>
          ) : (
            displayedActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getActionColor(activity.action)}>
                      {getActionLabel(activity.action)}
                    </Badge>
                    <span className="text-sm font-medium">{activity.entityType}</span>
                  </div>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
