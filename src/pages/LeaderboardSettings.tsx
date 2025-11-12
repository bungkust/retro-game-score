import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, RotateCcw, Edit } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { RetroButton } from '@/components/RetroButton';
import { RetroCard } from '@/components/RetroCard';
import { storage } from '@/lib/storage';
import { Leaderboard } from '@/lib/types';
import { soundPlayer } from '@/lib/sounds';
import { toast } from 'sonner';

const LeaderboardSettings = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    const data = storage.getLeaderboard(id);
    if (!data) {
      toast.error('LEADERBOARD TIDAK DITEMUKAN!');
      navigate('/');
      return;
    }
    setLeaderboard(data);
  }, [id, navigate]);

  const handleDelete = () => {
    if (!id) return;
    storage.deleteLeaderboard(id);
    soundPlayer.playSuccess();
    toast.success('LEADERBOARD DIHAPUS!');
    navigate('/');
  };

  const handleReset = () => {
    if (!leaderboard) return;
    const resetPlayers = leaderboard.players.map(p => ({ ...p, score: 0 }));
    storage.updateLeaderboard(leaderboard.id, { players: resetPlayers });
    soundPlayer.playSuccess();
    toast.success('SKOR DIRESET!');
    navigate(`/leaderboard/${id}`);
  };

  if (!leaderboard) return null;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 pb-navbar relative scanlines">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="PENGATURAN" showBack />

        <div className="space-y-4">
          <RetroCard>
            <h3 className="text-primary text-sm uppercase mb-4">INFORMASI</h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground">NAMA:</span>
                <div className="text-foreground mt-1">{leaderboard.name}</div>
              </div>
              {leaderboard.description && (
                <div>
                  <span className="text-muted-foreground">DESKRIPSI:</span>
                  <div className="text-foreground mt-1">{leaderboard.description}</div>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">MODE:</span>
                <div className="text-foreground mt-1">
                  {leaderboard.scoreMode === 'win_count' ? 'JUMLAH KEMENANGAN' : 'TOTAL POIN'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">URUTAN:</span>
                <div className="text-foreground mt-1">
                  {leaderboard.sortOrder === 'highest' ? 'TERTINGGI MENANG' : 'TERENDAH MENANG'}
                </div>
              </div>
            </div>
          </RetroCard>

          <RetroCard>
            <h3 className="text-primary text-sm uppercase mb-4">AKSI</h3>
            <div className="space-y-3">
              {!showResetConfirm ? (
                <RetroButton
                  variant="secondary"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => setShowResetConfirm(true)}
                  disabled={leaderboard.players.length === 0}
                >
                  <RotateCcw size={16} />
                  RESET SEMUA SKOR
                </RetroButton>
              ) : (
                <div className="space-y-2">
                  <p className="text-accent text-xs">YAKIN RESET SEMUA SKOR KE 0?</p>
                  <div className="flex gap-2">
                    <RetroButton
                      variant="ghost"
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1"
                    >
                      BATAL
                    </RetroButton>
                    <RetroButton
                      variant="secondary"
                      onClick={handleReset}
                      className="flex-1"
                    >
                      YA, RESET
                    </RetroButton>
                  </div>
                </div>
              )}

              {!showDeleteConfirm ? (
                <RetroButton
                  variant="destructive"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={16} />
                  HAPUS LEADERBOARD
                </RetroButton>
              ) : (
                <div className="space-y-2">
                  <p className="text-destructive text-xs">YAKIN HAPUS? TIDAK BISA DIBATALKAN!</p>
                  <div className="flex gap-2">
                    <RetroButton
                      variant="ghost"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1"
                    >
                      BATAL
                    </RetroButton>
                    <RetroButton
                      variant="destructive"
                      onClick={handleDelete}
                      className="flex-1"
                    >
                      YA, HAPUS
                    </RetroButton>
                  </div>
                </div>
              )}
            </div>
          </RetroCard>

          {leaderboard.players.length > 0 && (
            <RetroCard>
              <h3 className="text-primary text-sm uppercase mb-4">PEMAIN</h3>
              <div className="space-y-2">
                {leaderboard.players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2 border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{player.avatar}</span>
                      <span className="text-foreground text-xs">{player.name}</span>
                    </div>
                    <RetroButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updatedPlayers = leaderboard.players.filter(p => p.id !== player.id);
                        storage.updateLeaderboard(leaderboard.id, { players: updatedPlayers });
                        soundPlayer.playSuccess();
                        toast.success('PEMAIN DIHAPUS!');
                        setLeaderboard({ ...leaderboard, players: updatedPlayers });
                      }}
                    >
                      <Trash2 size={14} />
                    </RetroButton>
                  </div>
                ))}
              </div>
            </RetroCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardSettings;
