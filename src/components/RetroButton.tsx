import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { soundPlayer } from '@/lib/sounds';

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const RetroButton = forwardRef<HTMLButtonElement, RetroButtonProps>(
  ({ className, variant = 'primary', size = 'md', onClick, children, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      soundPlayer.playSelect();
      onClick?.(e);
    };

    const baseClasses = 'font-retro uppercase tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-primary text-primary-foreground pixel-border hover:scale-105 active:scale-95',
      secondary: 'bg-secondary text-secondary-foreground pixel-border-secondary hover:scale-105 active:scale-95',
      accent: 'bg-accent text-accent-foreground pixel-border-accent hover:scale-105 active:scale-95',
      destructive: 'bg-destructive text-destructive-foreground border-2 border-destructive hover:scale-105 active:scale-95',
      ghost: 'text-foreground border-2 border-muted hover:border-primary hover:text-primary',
    };

    const sizeClasses = {
      sm: 'px-3 py-1 text-[10px]',
      md: 'px-4 py-2 text-xs',
      lg: 'px-6 py-3 text-sm',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

RetroButton.displayName = 'RetroButton';

export { RetroButton };
