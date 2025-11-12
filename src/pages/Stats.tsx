import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, Users, Award, Crown, BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { RetroCard } from '@/components/RetroCard';
import { storage } from '@/lib/storage';
import { Leaderboard, Player } from '@/lib/types';

const Stats = () => {
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
  const totalScoreUpdates = leaderboards.reduce((sum, lb) => 
    sum + lb.players.reduce((pSum, p) => pSum + p.score, 0), 0
  );

  // Get all players across all leaderboards
  const getAllPlayers = (): Array<{ player: Player; leaderboard: Leaderboard }> => {
    const allPlayers: Array<{ player: Player; leaderboard: Leaderboard }> = [];
    leaderboards.forEach(lb => {
      lb.players.forEach(player => {
        allPlayers.push({ player, leaderboard: lb });
      });
    });
    return allPlayers;
  };

  // Get top players across all leaderboards
  const getTopPlayers = () => {
    const playerMap = new Map<string, { name: string; avatar: string; totalScore: number; games: number }>();
    
    leaderboards.forEach(lb => {
      lb.players.forEach(player => {
        const existing = playerMap.get(player.id) || {
          name: player.name,
          avatar: player.avatar,
          totalScore: 0,
          games: 0,
        };
        existing.totalScore += player.score;
        existing.games += 1;
        playerMap.set(player.id, existing);
      });
    });

    return Array.from(playerMap.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10);
  };

  // Get most active leaderboards
  const getMostActiveLeaderboards = () => {
    return [...leaderboards]
      .sort((a, b) => {
        const aScore = a.players.reduce((sum, p) => sum + p.score, 0);
        const bScore = b.players.reduce((sum, p) => sum + p.score, 0);
        return bScore - aScore;
      })
      .slice(0, 5);
  };

  // Get game mode statistics
  const getGameModeStats = () => {
    const winCount = leaderboards.filter(lb => lb.scoreMode === 'win_count').length;
    const totalPoints = leaderboards.filter(lb => lb.scoreMode === 'total_points').length;
    return { winCount, totalPoints };
  };

  const topPlayers = getTopPlayers();
  const mostActiveLeaderboards = getMostActiveLeaderboards();
  const gameModeStats = getGameModeStats();

  if (leaderboards.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 pb-navbar relative scanlines">
        <div className="max-w-4xl mx-auto">
          <PageHeader title="STATISTIK" />
          <RetroCard className="text-center py-12">
            <BarChart3 className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground mb-6 text-xs sm:text-sm">
              BELUM ADA DATA
            </p>
            <p className="text-muted-foreground text-[10px]">
              Buat leaderboard dan mulai bermain untuk melihat statistik
            </p>
          </RetroCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 pb-navbar relative scanlines">
      <div className="max-w-4xl mx-auto">
        <PageHeader title="STATISTIK" />

        {/* Overall Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <RetroCard className="text-center">
            <Trophy className="mx-auto mb-2 text-accent" size={24} />
            <div className="text-accent text-xl sm:text-2xl font-bold">
              {totalGames}
            </div>
            <div className="text-muted-foreground text-[10px] mt-1">
              TOTAL GAME
            </div>
          </RetroCard>
          <RetroCard className="text-center">
            <Users className="mx-auto mb-2 text-primary" size={24} />
            <div className="text-primary text-xl sm:text-2xl font-bold">
              {totalPlayers}
            </div>
            <div className="text-muted-foreground text-[10px] mt-1">
              TOTAL PEMAIN
            </div>
          </RetroCard>
          <RetroCard className="text-center">
            <TrendingUp className="mx-auto mb-2 text-secondary" size={24} />
            <div className="text-secondary text-xl sm:text-2xl font-bold">
              {totalScoreUpdates}
            </div>
            <div className="text-muted-foreground text-[10px] mt-1">
              TOTAL SKOR
            </div>
          </RetroCard>
          <RetroCard className="text-center">
            <Award className="mx-auto mb-2 text-accent" size={24} />
            <div className="text-accent text-xl sm:text-2xl font-bold">
              {topPlayers.length > 0 ? topPlayers[0].totalScore : 0}
            </div>
            <div className="text-muted-foreground text-[10px] mt-1">
              HIGH SCORE
            </div>
          </RetroCard>
        </div>

        {/* Top Players */}
        {topPlayers.length > 0 && (
          <div className="mb-6">
            <h2 className="text-primary text-sm uppercase mb-4 flex items-center gap-2">
              <Crown className="text-accent" size={16} />
              TOP PEMAIN
            </h2>
            <RetroCard>
              <div className="space-y-3">
                {topPlayers.map((player, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between gap-4 p-2 ${
                      index === 0 ? 'border-2 border-accent glow-yellow' : 'border border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`text-muted-foreground text-sm shrink-0 w-6 ${
                        index === 0 ? 'text-accent font-bold' : ''
                      }`}>
                        #{index + 1}
                      </div>
                      <div className="text-xl sm:text-2xl shrink-0">
                        {player.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-foreground text-xs sm:text-sm uppercase truncate">
                          {player.name}
                        </div>
                        <div className="text-muted-foreground text-[10px]">
                          {player.games} game
                        </div>
                      </div>
                    </div>
                    <div className="text-accent text-base sm:text-lg font-bold shrink-0">
                      {player.totalScore}
                    </div>
                  </div>
                ))}
              </div>
            </RetroCard>
          </div>
        )}

        {/* Most Active Leaderboards */}
        {mostActiveLeaderboards.length > 0 && (
          <div className="mb-6">
            <h2 className="text-primary text-sm uppercase mb-4 flex items-center gap-2">
              <TrendingUp size={16} />
              GAME TERAKTIF
            </h2>
            <div className="space-y-3">
              {mostActiveLeaderboards.map((lb) => {
                const totalScore = lb.players.reduce((sum, p) => sum + p.score, 0);
                const topPlayer = lb.players.length > 0
                  ? [...lb.players].sort((a, b) => 
                      lb.sortOrder === 'highest' ? b.score - a.score : a.score - b.score
                    )[0]
                  : null;

                return (
                  <RetroCard
                    key={lb.id}
                    className="cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={() => navigate(`/leaderboard/${lb.id}`)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="text-accent shrink-0" size={16} />
                          <h3 className="text-primary text-xs sm:text-sm uppercase truncate">
                            {lb.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap">
                          <span>{lb.players.length} pemain</span>
                          <span>•</span>
                          <span>Total skor: {totalScore}</span>
                          {topPlayer && (
                            <>
                              <span>•</span>
                              <span className="text-accent">
                                Top: {topPlayer.name} ({topPlayer.score})
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </RetroCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Game Mode Statistics */}
        <RetroCard>
          <h3 className="text-primary text-xs uppercase mb-4">MODE GAME</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border-2 border-border">
              <div className="text-accent text-2xl font-bold mb-2">
                {gameModeStats.winCount}
              </div>
              <div className="text-muted-foreground text-[10px]">
                WIN COUNT
              </div>
            </div>
            <div className="text-center p-4 border-2 border-border">
              <div className="text-accent text-2xl font-bold mb-2">
                {gameModeStats.totalPoints}
              </div>
              <div className="text-muted-foreground text-[10px]">
                TOTAL POINTS
              </div>
            </div>
          </div>
        </RetroCard>
      </div>
    </div>
  );
};

export default Stats;

