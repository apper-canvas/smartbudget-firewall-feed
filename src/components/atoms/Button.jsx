import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  children, 
  className, 
  variant = "primary", 
  size = "default",
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 focus:ring-primary shadow-lg hover:shadow-xl transform hover:scale-[1.02]",
    secondary: "bg-white/90 text-gray-700 border border-gray-200 hover:bg-white hover:border-gray-300 focus:ring-primary shadow-sm hover:shadow-md transform hover:scale-[1.01]",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary transition-all duration-200",
    ghost: "text-gray-600 hover:text-primary hover:bg-primary/10 focus:ring-primary",
    success: "bg-gradient-to-r from-success to-emerald-600 text-white hover:from-success/90 hover:to-emerald-600/90 focus:ring-success shadow-lg hover:shadow-xl transform hover:scale-[1.02]",
    danger: "bg-gradient-to-r from-error to-red-600 text-white hover:from-error/90 hover:to-red-600/90 focus:ring-error shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;