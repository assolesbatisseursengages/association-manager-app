import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, FileText, AlertCircle } from "lucide-react";

interface WidgetKPIProps {
  metrics: {
    members: number;
    finances: number;
    documents: number;
    alerts: number;
  };
}

export function WidgetKPI({ metrics }: WidgetKPIProps) {
  const kpis = [
    {
      label: "Membres Actifs",
      value: metrics.members,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Solde",
      value: `${metrics.finances} FCFA`,
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Documents",
      value: metrics.documents,
      icon: FileText,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Alertes",
      value: metrics.alerts,
      icon: AlertCircle,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.label} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className={`p-3 rounded-lg ${kpi.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
