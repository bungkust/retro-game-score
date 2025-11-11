import { useState, useEffect } from 'react';
import { Plus, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { RetroButton } from '@/components/RetroButton';
import { RetroCard } from '@/components/RetroCard';
import { storage } from '@/lib/storage';
import { Leaderboard } from '@/lib/types';

const Dashboard = () => {
  const navigate = useNavigate();
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = () => {
    const data = storage.getLeaderboards();
    setLeaderboards(data);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 relative scanlines">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="UNIVERSAL LEADERBOARD"
          action={
            <RetroButton
              variant="primary"
              onClick={() => navigate('/create')}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">NEW</span>
            </RetroButton>
          }
        />

        <p className="text-center text-accent text-sm sm:text-base mb-8 glow-yellow">
          &gt; SATU PAPAN SKOR UNTUK SEMUA PERMAINAN &lt;
        </p>

        {leaderboards.length === 0 ? (
          <RetroCard className="text-center py-12">
            <Trophy className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground mb-6 text-xs sm:text-sm">
              BELUM ADA LEADERBOARD
            </p>
            <RetroButton
              variant="primary"
              onClick={() => navigate('/create')}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus size={16} />
              BUAT LEADERBOARD PERTAMA
            </RetroButton>
          </RetroCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaderboards.map((lb) => (
              <RetroCard
                key={lb.id}
                className="cursor-pointer hover:scale-105 transition-transform animate-pixel-slide-in"
                onClick={() => navigate(`/leaderboard/${lb.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-primary text-sm sm:text-base uppercase flex-1 break-words">
                    {lb.name}
                  </h3>
                  <Trophy className="text-accent shrink-0 ml-2" size={20} />
                </div>
                
                {lb.description && (
                  <p className="text-muted-foreground text-[10px] mb-3 line-clamp-2">
                    {lb.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 text-[10px] mb-3">
                  <span className="px-2 py-1 bg-muted text-foreground border border-border">
                    {lb.scoreMode === 'win_count' ? 'WIN COUNT' : 'TOTAL POINTS'}
                  </span>
                  <span className="px-2 py-1 bg-muted text-foreground border border-border">
                    {lb.sortOrder === 'highest' ? '↑ HIGH' : '↓ LOW'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{lb.players.length} PEMAIN</span>
                  {lb.players.length > 0 && (
                    <span className="text-accent">
                      TOP: {lb.players[0]?.score || 0}
                    </span>
                  )}
                </div>
              </RetroCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
