import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export function SectionHeading({ eyebrow, title, subtitle, className, ...props }: SectionHeadingProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {eyebrow ? <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">{eyebrow}</p> : null}
      <h2 className="text-3xl md:text-4xl tracking-[-0.03em] leading-[1.08] font-semibold text-foreground">{title}</h2>
      {subtitle ? <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}
