import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const RetroCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-card text-card-foreground pixel-border p-4',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

RetroCard.displayName = 'RetroCard';

export { RetroCard };
