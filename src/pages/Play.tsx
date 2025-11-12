import { useNavigate } from 'react-router-dom';
import { Gamepad2, ArrowLeft, Zap, Brain } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { RetroCard } from '@/components/RetroCard';
import { RetroButton } from '@/components/RetroButton';
import { soundPlayer } from '@/lib/sounds';

const Play = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 'snake',
      name: 'SNAKE',
      description: 'Classic retro snake game',
      icon: Zap,
      path: '/play/snake',
      color: 'text-accent',
    },
    {
      id: 'memory',
      name: 'MEMORY',
      description: 'Test your memory skills',
      icon: Brain,
      path: '/play/memory',
      color: 'text-primary',
    },
  ];

  const handleGameSelect = (path: string) => {
    soundPlayer.playSelect();
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 pb-navbar relative scanlines">
      <div className="max-w-4xl mx-auto">
        <PageHeader title="PLAY" showBack />

        <p className="text-center text-accent text-sm sm:text-base mb-8 glow-yellow">
          &gt; PILIH GAME UNTUK DIMULAI &lt;
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <RetroCard
                key={game.id}
                className="cursor-pointer hover:scale-105 transition-transform animate-pixel-slide-in"
                onClick={() => handleGameSelect(game.path)}
              >
                <div className="text-center p-6">
                  <Icon className={`mx-auto mb-4 ${game.color}`} size={64} />
                  <h3 className="text-primary text-lg sm:text-xl uppercase mb-3">
                    {game.name}
                  </h3>
                  <p className="text-muted-foreground text-xs mb-4">
                    {game.description}
                  </p>
                  <RetroButton
                    variant="primary"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGameSelect(game.path);
                    }}
                  >
                    PLAY
                  </RetroButton>
                </div>
              </RetroCard>
            );
          })}
        </div>

        <RetroCard className="mt-8 text-center p-6">
          <Gamepad2 className="mx-auto mb-4 text-muted-foreground" size={48} />
          <p className="text-muted-foreground text-xs">
            More games coming soon!
          </p>
        </RetroCard>
      </div>
    </div>
  );
};

export default Play;

