import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Settings, UserPlus, Trophy, Crown } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { RetroButton } from '@/components/RetroButton';
import { RetroCard } from '@/components/RetroCard';
import { storage } from '@/lib/storage';
import { Leaderboard, Player } from '@/lib/types';
import { soundPlayer } from '@/lib/sounds';
import { toast } from 'sonner';
import { AddPlayerDialog } from '@/components/AddPlayerDialog';
import { ScoreUpdateDialog } from '@/components/ScoreUpdateDialog';

const LeaderboardDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [id]);

  const loadLeaderboard = () => {
    if (!id) return;
    const data = storage.getLeaderboard(id);
    if (!data) {
      toast.error('LEADERBOARD TIDAK DITEMUKAN!');
      navigate('/');
      return;
    }
    setLeaderboard(data);
  };

  const getSortedPlayers = () => {
    if (!leaderboard) return [];
    const players = [...leaderboard.players];
    return players.sort((a, b) => {
      if (leaderboard.sortOrder === 'highest') {
        return b.score - a.score;
      }
      return a.score - b.score;
    });
  };

  const handleScoreUpdate = (playerId: string, newScore: number) => {
    if (!leaderboard) return;
    
    const updatedPlayers = leaderboard.players.map(p =>
      p.id === playerId ? { ...p, score: newScore } : p
    );
    
    storage.updateLeaderboard(leaderboard.id, { players: updatedPlayers });
    soundPlayer.playCoin();
    loadLeaderboard();
    setSelectedPlayer(null);
  };

  const handleWinIncrement = (playerId: string, increment: number) => {
    if (!leaderboard) return;
    
    const player = leaderboard.players.find(p => p.id === playerId);
    if (!player) return;
    
    const newScore = Math.max(0, player.score + increment);
    handleScoreUpdate(playerId, newScore);
  };

  if (!leaderboard) return null;

  const sortedPlayers = getSortedPlayers();
  const topPlayer = sortedPlayers[0];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 relative scanlines">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title={leaderboard.name}
          showBack
          action={
            <RetroButton
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/leaderboard/${id}/settings`)}
            >
              <Settings size={16} />
            </RetroButton>
          }
        />

        {leaderboard.description && (
          <RetroCard className="mb-6 text-xs text-muted-foreground">
            {leaderboard.description}
          </RetroCard>
        )}

        <div className="flex flex-wrap gap-2 mb-6 text-[10px]">
          <span className="px-3 py-1 bg-muted text-foreground border border-border">
            {leaderboard.scoreMode === 'win_count' ? 'WIN COUNT' : 'TOTAL POINTS'}
          </span>
          <span className="px-3 py-1 bg-muted text-foreground border border-border">
            {leaderboard.sortOrder === 'highest' ? '↑ TERTINGGI' : '↓ TERENDAH'}
          </span>
        </div>

        {sortedPlayers.length === 0 ? (
          <RetroCard className="text-center py-12">
            <UserPlus className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground mb-6 text-xs sm:text-sm">
              BELUM ADA PEMAIN
            </p>
            <RetroButton
              variant="primary"
              onClick={() => setShowAddPlayer(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus size={16} />
              TAMBAH PEMAIN PERTAMA
            </RetroButton>
          </RetroCard>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-primary text-sm uppercase">PAPAN SKOR</h2>
              <RetroButton
                variant="primary"
                size="sm"
                onClick={() => setShowAddPlayer(true)}
                className="flex items-center gap-2"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">TAMBAH</span>
              </RetroButton>
            </div>

            <div className="space-y-3">
              {sortedPlayers.map((player, index) => {
                const isTopPlayer = player.id === topPlayer?.id;
                
                return (
                  <RetroCard
                    key={player.id}
                    className={`flex items-center justify-between gap-4 hover:scale-[1.02] transition-transform ${
                      isTopPlayer ? 'border-accent glow-yellow' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-muted-foreground text-sm shrink-0">
                        #{index + 1}
                      </div>
                      
                      <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                        {player.avatar}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground text-xs sm:text-sm uppercase truncate">
                            {player.name}
                          </span>
                          {isTopPlayer && (
                            <span className="text-accent text-[10px] blink shrink-0">
                              <Crown size={14} className="inline" /> HIGH SCORE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {leaderboard.scoreMode === 'win_count' ? (
                        <>
                          <RetroButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleWinIncrement(player.id, -1)}
                            disabled={player.score === 0}
                          >
                            -1
                          </RetroButton>
                          <span className="text-accent text-base sm:text-lg font-bold min-w-[40px] text-center">
                            {player.score}
                          </span>
                          <RetroButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleWinIncrement(player.id, 1)}
                          >
                            +1
                          </RetroButton>
                        </>
                      ) : (
                        <button
                          onClick={() => setSelectedPlayer(player)}
                          className="text-accent text-base sm:text-lg font-bold hover:scale-110 transition-transform min-w-[60px] text-right"
                        >
                          {player.score}
                        </button>
                      )}
                    </div>
                  </RetroCard>
                );
              })}
            </div>
          </>
        )}
      </div>

      <AddPlayerDialog
        open={showAddPlayer}
        onClose={() => setShowAddPlayer(false)}
        leaderboard={leaderboard}
        onSuccess={() => {
          loadLeaderboard();
          setShowAddPlayer(false);
        }}
      />

      {selectedPlayer && (
        <ScoreUpdateDialog
          open={true}
          onClose={() => setSelectedPlayer(null)}
          player={selectedPlayer}
          onUpdate={handleScoreUpdate}
        />
      )}
    </div>
  );
};

export default LeaderboardDetail;
