import { useState, useEffect } from 'react';
import { Plus, Trophy, Users, TrendingUp, Clock, Award, Gamepad2, Download, Zap, BarChart3, History as HistoryIcon } from 'lucide-react';
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

  // Calculate statistics
  const totalGames = leaderboards.length;
  const totalPlayers = leaderboards.reduce((sum, lb) => sum + lb.players.length, 0);
  const recentLeaderboards = leaderboards
    .filter(lb => Date.now() - lb.updatedAt < 7 * 24 * 60 * 60 * 1000)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 3);
  
  const mostActiveLeaderboards = [...leaderboards]
    .sort((a, b) => {
      const aScore = a.players.reduce((sum, p) => sum + p.score, 0);
      const bScore = b.players.reduce((sum, p) => sum + p.score, 0);
      return bScore - aScore;
    })
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 pb-navbar relative scanlines">
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

        {/* Quick Stats */}
        {leaderboards.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <RetroCard className="text-center p-4">
              <Trophy className="mx-auto mb-2 text-accent" size={20} />
              <div className="text-accent text-lg font-bold">{totalGames}</div>
              <div className="text-muted-foreground text-[9px] mt-1">TOTAL GAME</div>
            </RetroCard>
            <RetroCard className="text-center p-4">
              <Users className="mx-auto mb-2 text-primary" size={20} />
              <div className="text-primary text-lg font-bold">{totalPlayers}</div>
              <div className="text-muted-foreground text-[9px] mt-1">TOTAL PEMAIN</div>
            </RetroCard>
          </div>
        )}

        {/* Feature Highlights */}
        {leaderboards.length === 0 && (
          <div className="mb-8">
            <h2 className="text-primary text-sm uppercase mb-4 text-center">FITUR UTAMA</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <RetroCard className="p-4 text-center">
                <Gamepad2 className="mx-auto mb-3 text-accent" size={32} />
                <h3 className="text-primary text-xs uppercase mb-2">MULTI GAME</h3>
                <p className="text-muted-foreground text-[10px]">
                  Buat leaderboard untuk berbagai permainan
                </p>
              </RetroCard>
              <RetroCard className="p-4 text-center">
                <Award className="mx-auto mb-3 text-accent" size={32} />
                <h3 className="text-primary text-xs uppercase mb-2">WIN COUNT</h3>
                <p className="text-muted-foreground text-[10px]">
                  Hitung kemenangan atau total poin
                </p>
              </RetroCard>
              <RetroCard className="p-4 text-center">
                <Download className="mx-auto mb-3 text-accent" size={32} />
                <h3 className="text-primary text-xs uppercase mb-2">PWA SUPPORT</h3>
                <p className="text-muted-foreground text-[10px]">
                  Install sebagai aplikasi, bekerja offline
                </p>
              </RetroCard>
              <RetroCard className="p-4 text-center">
                <BarChart3 className="mx-auto mb-3 text-accent" size={32} />
                <h3 className="text-primary text-xs uppercase mb-2">STATISTIK</h3>
                <p className="text-muted-foreground text-[10px]">
                  Lihat statistik dan ranking lengkap
                </p>
              </RetroCard>
              <RetroCard className="p-4 text-center">
                <HistoryIcon className="mx-auto mb-3 text-accent" size={32} />
                <h3 className="text-primary text-xs uppercase mb-2">HISTORY</h3>
                <p className="text-muted-foreground text-[10px]">
                  Lacak aktivitas dan perubahan skor
                </p>
              </RetroCard>
              <RetroCard className="p-4 text-center">
                <Zap className="mx-auto mb-3 text-accent" size={32} />
                <h3 className="text-primary text-xs uppercase mb-2">CEPAT & MUDAH</h3>
                <p className="text-muted-foreground text-[10px]">
                  Update skor dengan cepat dan mudah
                </p>
              </RetroCard>
            </div>
          </div>
        )}

        {/* All Leaderboards */}
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
          <>
            {/* Recent Leaderboards - Show when more than 3 leaderboards */}
            {recentLeaderboards.length > 0 && leaderboards.length > 3 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-primary text-sm uppercase flex items-center gap-2">
                    <Clock size={16} />
                    AKTIVITAS TERBARU
                  </h2>
                  <RetroButton
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/history')}
                    className="text-[10px]"
                  >
                    LIHAT SEMUA
                  </RetroButton>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentLeaderboards.map((lb) => (
                    <RetroCard
                      key={lb.id}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => navigate(`/leaderboard/${lb.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-primary text-xs uppercase flex-1 break-words">
                          {lb.name}
                        </h3>
                        <Trophy className="text-accent shrink-0 ml-2" size={16} />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{lb.players.length} pemain</span>
                        {lb.players.length > 0 && (
                          <span className="text-accent">
                            Top: {Math.max(...lb.players.map(p => p.score), 0)}
                          </span>
                        )}
                      </div>
                    </RetroCard>
                  ))}
                </div>
              </div>
            )}

            {/* Most Active Leaderboards - Show when more than 3 leaderboards */}
            {mostActiveLeaderboards.length > 0 && leaderboards.length > 3 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-primary text-sm uppercase flex items-center gap-2">
                    <TrendingUp size={16} />
                    GAME TERAKTIF
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mostActiveLeaderboards.map((lb) => {
                    const totalScore = lb.players.reduce((sum, p) => sum + p.score, 0);
                    return (
                      <RetroCard
                        key={lb.id}
                        className="cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => navigate(`/leaderboard/${lb.id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-primary text-xs uppercase flex-1 break-words">
                            {lb.name}
                          </h3>
                          <Trophy className="text-accent shrink-0 ml-2" size={16} />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{lb.players.length} pemain</span>
                          <span className="text-accent">Total: {totalScore}</span>
                        </div>
                      </RetroCard>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Leaderboards Grid */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-primary text-sm uppercase flex items-center gap-2">
                  <Trophy size={16} />
                  SEMUA LEADERBOARD
                </h2>
              </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leaderboards.map((lb) => {
                  const sortedPlayers = [...lb.players].sort((a, b) => {
                    if (lb.sortOrder === 'highest') {
                      return b.score - a.score;
                    }
                    return a.score - b.score;
                  });
                  const topScore = sortedPlayers.length > 0 ? sortedPlayers[0].score : 0;
                  
                  return (
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
                            TOP: {topScore}
                    </span>
                  )}
                </div>
              </RetroCard>
                  );
                })}
              </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
