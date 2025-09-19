import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  icon: LucideIcon;
  iconColor?: "blue" | "orange" | "green" | "red";
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon,
  iconColor = "blue" 
}: StatsCardProps) {
  const getIconColorClasses = () => {
    switch (iconColor) {
      case "orange":
        return "bg-warning/10 text-warning";
      case "green":
        return "bg-success/10 text-success";
      case "red":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-primary-blue/10 text-primary-blue";
    }
  };

  const getChangeColorClasses = () => {
    switch (changeType) {
      case "increase":
        return "text-success";
      case "decrease":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {change && (
              <p className={`text-xs mt-1 ${getChangeColorClasses()}`}>
                {change}
              </p>
            )}
          </div>
          <div className={`rounded-lg p-3 ${getIconColorClasses()}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}