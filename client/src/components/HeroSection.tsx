import { ReactNode } from "react";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "primary" | "secondary" | "accent";
}

export function HeroSection({
  title,
  subtitle,
  children,
  icon,
  action,
  variant = "primary",
}: HeroSectionProps) {
  const getGradientClass = () => {
    switch (variant) {
      case "secondary":
        return "bg-gradient-to-br from-accent via-primary/80 to-accent/60";
      case "accent":
        return "bg-gradient-to-br from-primary via-accent to-primary/60";
      default:
        return "bg-gradient-to-br from-primary via-primary/90 to-accent/40";
    }
  };

  return (
    <div className={`${getGradientClass()} rounded-2xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden`}>
      {/* Formes organiques de fond */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-6">
          {icon && <div className="text-4xl">{icon}</div>}
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-white/80 text-lg max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {children && (
          <div className="mt-6 text-white/90">
            {children}
          </div>
        )}

        {action && (
          <button
            onClick={action.onClick}
            className="mt-6 px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
