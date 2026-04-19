import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("border text-card-foreground", {
  variants: {
    variant: {
      default: "rounded-lg bg-card shadow-sm",
      premium: "rounded-[24px] border-white/10 bg-[#131c29] shadow-[0_20px_60px_rgba(0,0,0,0.28)]",
      elevated: "rounded-[24px] border-white/6 bg-[#111826] shadow-[0_20px_60px_rgba(0,0,0,0.28)]",
      highlight: "rounded-[24px] border-white/10 bg-[#151f2e] shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-5", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h3 ref={ref} className={cn("font-semibold tracking-tight", className)} {...props} />
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, cardVariants };
