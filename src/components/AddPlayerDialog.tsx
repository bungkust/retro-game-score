import { useState } from 'react';
import { X } from 'lucide-react';
import { RetroButton } from './RetroButton';
import { RetroCard } from './RetroCard';
import { storage } from '@/lib/storage';
import { Leaderboard, Player } from '@/lib/types';
import { soundPlayer } from '@/lib/sounds';
import { toast } from 'sonner';

const AVATARS = ['👑', '👻', '🚀', '⚔️', '⭐', '❤️', '💎', '🛡️', '🎮', '🏆', '🎯', '🎨', '🎪', '🎭', '🎸', '🎺'];

interface AddPlayerDialogProps {
  open: boolean;
  onClose: () => void;
  leaderboard: Leaderboard;
  onSuccess: () => void;
  editPlayer?: Player;
}

export const AddPlayerDialog = ({ open, onClose, leaderboard, onSuccess, editPlayer }: AddPlayerDialogProps) => {
  const [name, setName] = useState(editPlayer?.name || '');
  const [avatar, setAvatar] = useState(editPlayer?.avatar || AVATARS[0]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      soundPlayer.playError();
      toast.error('NAMA PEMAIN HARUS DIISI!');
      return;
    }

    const normalizedName = name.trim().toLowerCase();
    const existingPlayer = leaderboard.players.find(
      p => p.name.toLowerCase() === normalizedName && (!editPlayer || p.id !== editPlayer.id)
    );

    if (existingPlayer) {
      soundPlayer.playError();
      toast.error('NAMA SUDAH DIGUNAKAN!');
      return;
    }

    if (editPlayer) {
      // Edit existing player
      const updatedPlayers = leaderboard.players.map(p =>
        p.id === editPlayer.id ? { ...p, name: name.trim(), avatar } : p
      );
      storage.updateLeaderboard(leaderboard.id, { players: updatedPlayers });
      soundPlayer.playSuccess();
      toast.success('PEMAIN DIPERBARUI!');
    } else {
      // Add new player
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: name.trim(),
        avatar,
        score: 0,
      };
      const updatedPlayers = [...leaderboard.players, newPlayer];
      storage.updateLeaderboard(leaderboard.id, { players: updatedPlayers });
      soundPlayer.playSuccess();
      toast.success('PEMAIN DITAMBAHKAN!');
    }

    onSuccess();
  };

  const handleClose = () => {
    setName('');
    setAvatar(AVATARS[0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <RetroCard className="w-full max-w-md animate-pixel-slide-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-primary text-sm sm:text-base uppercase">
            {editPlayer ? 'EDIT PEMAIN' : 'TAMBAH PEMAIN'}
          </h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-primary text-xs mb-2 uppercase">
              * NAMA PEMAIN
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-muted text-foreground border-2 border-border px-3 py-2 text-xs sm:text-sm focus:border-primary focus:outline-none"
              placeholder="Contoh: AYAH"
              maxLength={20}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-primary text-xs mb-3 uppercase">
              * PILIH AVATAR
            </label>
            <div className="grid grid-cols-8 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => {
                    setAvatar(av);
                    soundPlayer.playSelect();
                  }}
                  className={`aspect-square flex items-center justify-center text-2xl border-2 transition-all ${
                    avatar === av
                      ? 'border-accent bg-accent/20 scale-110'
                      : 'border-border hover:border-primary hover:scale-105'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <RetroButton
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="flex-1"
            >
              BATAL
            </RetroButton>
            <RetroButton
              type="submit"
              variant="primary"
              className="flex-1"
            >
              {editPlayer ? 'SIMPAN' : 'TAMBAH'}
            </RetroButton>
          </div>
        </form>
      </RetroCard>
    </div>
  );
};
