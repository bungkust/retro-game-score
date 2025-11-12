import { useLocation, useNavigate } from 'react-router-dom';
import { Home, History, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      label: 'HOME',
      icon: Home,
      path: '/',
      active: location.pathname === '/',
    },
    {
      label: 'HISTORY',
      icon: History,
      path: '/history',
      active: location.pathname === '/history',
    },
    {
      label: 'STATS',
      icon: BarChart3,
      path: '/stats',
      active: location.pathname === '/stats',
    },
    {
      label: 'SETTINGS',
      icon: Settings,
      path: '/settings',
      active: location.pathname === '/settings',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-border pixel-border">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all relative',
                  'hover:scale-110 active:scale-95',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="relative">
                  <Icon 
                    size={20} 
                    className={cn(
                      'transition-all',
                      isActive && 'scale-110 glow-cyan'
                    )}
                  />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </div>
                <span className={cn(
                  "text-[8px] uppercase font-retro tracking-wide transition-all",
                  isActive && "text-primary"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Safe area for mobile devices with notches */}
      <div className="h-safe-area-inset-bottom bg-card" />
    </nav>
  );
};

