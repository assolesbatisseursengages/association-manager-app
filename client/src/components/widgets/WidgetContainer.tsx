import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { X, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";

interface WidgetContainerProps {
  id: number;
  title: string;
  children: ReactNode;
  onRemove?: () => void;
  onConfigure?: () => void;
  size?: "small" | "medium" | "large";
  isDragging?: boolean;
}

const sizeClasses = {
  small: "col-span-1",
  medium: "col-span-2",
  large: "col-span-3",
};

export function WidgetContainer({
  id,
  title,
  children,
  onRemove,
  onConfigure,
  size = "medium",
  isDragging = false,
}: WidgetContainerProps) {
  return (
    <div
      className={`${sizeClasses[size]} ${isDragging ? "opacity-50" : ""} transition-opacity`}
      draggable
      data-widget-id={id}
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow group">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onConfigure && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onConfigure}
                className="h-8 w-8 p-0"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex-1 p-4 overflow-auto">{children}</div>
      </Card>
    </div>
  );
}
