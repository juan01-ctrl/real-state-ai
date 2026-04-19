import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const surfaceVariants = cva("rounded-lg border text-card-foreground", {
  variants: {
    tone: {
      default: "bg-card border-border",
      soft: "bg-muted/40 border-border/80",
      emphasis: "bg-accent/40 border-border/70"
    },
    spacing: {
      sm: "p-3",
      md: "p-4",
      lg: "p-5"
    }
  },
  defaultVariants: {
    tone: "default",
    spacing: "md"
  }
});

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {}

export function Surface({ className, tone, spacing, ...props }: SurfaceProps) {
  return <div className={cn(surfaceVariants({ tone, spacing }), className)} {...props} />;
}
