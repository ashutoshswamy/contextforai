import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function AnimatedStat({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: number;
  unit: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="border-border p-5 gap-0">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-mono text-muted ">{label}</p>
          {icon && <span className="text-ember">{icon}</span>}
        </div>
        <p className="text-2xl font-mono font-bold text-ink">
          {value.toLocaleString()}
        </p>
        <p className="text-xs text-faint mt-0.5">{unit}</p>
      </CardContent>
    </Card>
  );
}
