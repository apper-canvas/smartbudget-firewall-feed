import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ 
  children, 
  className, 
  variant = "default",
  ...props 
}, ref) => {
  const baseStyles = "rounded-xl transition-all duration-200";
  
  const variants = {
    default: "glass-card hover:shadow-2xl",
    gradient: "bg-gradient-to-br from-primary/10 via-white to-secondary/10 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl",
    success: "bg-gradient-to-br from-success/10 via-white to-emerald-100/50 backdrop-blur-sm border border-success/20 shadow-xl",
    warning: "bg-gradient-to-br from-warning/10 via-white to-amber-100/50 backdrop-blur-sm border border-warning/20 shadow-xl"
  };
  
  return (
    <div
      ref={ref}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;