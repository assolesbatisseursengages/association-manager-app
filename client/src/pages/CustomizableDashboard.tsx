import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, RotateCcw } from "lucide-react";
import { WidgetContainer } from "@/components/widgets/WidgetContainer";
import { WidgetKPI } from "@/components/widgets/WidgetKPI";
import { WidgetChart } from "@/components/widgets/WidgetChart";
import { WidgetActivity } from "@/components/widgets/WidgetActivity";
import { toast } from "sonner";

interface Widget {
  id: number;
  widgetType: string;
  title: string;
  position: number;
  size: "small" | "medium" | "large";
  config: unknown;
  isVisible: boolean | null;
}

export default function CustomizableDashboard() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<number | null>(null);

  // Fetch user's widgets
  const { data: userWidgets, isLoading } = trpc.widgets.getUserWidgets.useQuery();

  // Mutations
  const removeWidgetMutation = trpc.widgets.removeWidget.useMutation();
  const reorderWidgetsMutation = trpc.widgets.reorderWidgets.useMutation();
  const resetDashboardMutation = trpc.widgets.resetDashboard.useMutation();

  useEffect(() => {
    if (userWidgets) {
      setWidgets(userWidgets);
    }
  }, [userWidgets]);

  const handleRemoveWidget = (id: number) => {
    removeWidgetMutation.mutate(
      { id },
      {
        onSuccess: () => {
          setWidgets(widgets.filter((w) => w.id !== id));
          toast.success("Widget supprimé");
        },
        onError: () => {
          toast.error("Erreur lors de la suppression du widget");
        },
      }
    );
  };

  const handleResetDashboard = () => {
    resetDashboardMutation.mutate(undefined, {
      onSuccess: () => {
        // Refetch widgets
        window.location.reload();
        toast.success("Tableau de bord réinitialisé");
      },
      onError: () => {
        toast.error("Erreur lors de la réinitialisation");
      },
    });
  };

  const handleDragStart = (e: React.DragEvent, widgetId: number) => {
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (draggedWidget === null || draggedWidget === targetId) return;

    const draggedIndex = widgets.findIndex((w) => w.id === draggedWidget);
    const targetIndex = widgets.findIndex((w) => w.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Swap widgets
    const newWidgets = [...widgets];
    [newWidgets[draggedIndex], newWidgets[targetIndex]] = [
      newWidgets[targetIndex],
      newWidgets[draggedIndex],
    ];

    // Update positions
    newWidgets.forEach((w, idx) => {
      w.position = idx;
    });

    setWidgets(newWidgets);
    setDraggedWidget(null);

    // Save to server
    reorderWidgetsMutation.mutate({
      widgets: newWidgets.map((w) => ({ id: w.id, position: w.position })),
    });
  };

  const renderWidget = (widget: Widget) => {
    switch (widget.widgetType) {
      case "kpi":
        return (
          <WidgetKPI
            metrics={{
              members: 15,
              finances: 50000,
              documents: 21,
              alerts: 3,
            }}
          />
        );
      case "chart":
        return (
          <WidgetChart
            title="Dépenses par Catégorie"
            type="pie"
            data={[
              { name: "Salaires", value: 30000 },
              { name: "Fournitures", value: 10000 },
              { name: "Loyer", value: 5000 },
              { name: "Autres", value: 5000 },
            ]}
          />
        );
      case "activity":
        return (
          <WidgetActivity
            activities={[
              {
                id: 1,
                action: "create",
                entityType: "Membre",
                entityId: 1,
                details: "Nouveau membre ajouté",
                createdAt: new Date(),
              },
              {
                id: 2,
                action: "update",
                entityType: "Document",
                entityId: 2,
                details: "Document mis à jour",
                createdAt: new Date(Date.now() - 3600000),
              },
            ]}
          />
        );
      default:
        return <div>Widget non reconnu</div>;
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord Personnalisable</h1>
          <p className="text-gray-600 mt-2">
            {isEditMode
              ? "Glissez-déposez pour réorganiser les widgets"
              : "Cliquez sur un widget pour le configurer"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isEditMode ? "default" : "outline"}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? "Terminer" : "Éditer"}
          </Button>
          <Button variant="outline" onClick={handleResetDashboard}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter Widget
          </Button>
        </div>
      </div>

      {widgets.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">Aucun widget sur votre tableau de bord</p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter le premier widget
          </Button>
        </Card>
      ) : (
        <div
          className="grid grid-cols-3 gap-4 auto-rows-max"
          onDragOver={isEditMode ? handleDragOver : undefined}
        >
          {widgets.map((widget) => (
            <div
              key={widget.id}
              draggable={isEditMode}
              onDragStart={(e) => handleDragStart(e, widget.id)}
              onDrop={(e) => handleDrop(e, widget.id)}
              className={isEditMode ? "cursor-move" : ""}
            >
              <WidgetContainer
                id={widget.id}
                title={widget.title}
                size={widget.size}
                isDragging={draggedWidget === widget.id}
                onRemove={
                  isEditMode ? () => handleRemoveWidget(widget.id) : undefined
                }
              >
                {renderWidget(widget)}
              </WidgetContainer>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
