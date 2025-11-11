import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { RetroButton } from './RetroButton';
import { RetroCard } from './RetroCard';
import { Player } from '@/lib/types';
import { soundPlayer } from '@/lib/sounds';

interface ScoreUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  player: Player;
  onUpdate: (playerId: string, newScore: number) => void;
}

export const ScoreUpdateDialog = ({ open, onClose, player, onUpdate }: ScoreUpdateDialogProps) => {
  const [inputValue, setInputValue] = useState(player.score.toString());
  const [mode, setMode] = useState<'set' | 'add' | 'subtract'>('set');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const value = parseInt(inputValue) || 0;
    let newScore = player.score;

    switch (mode) {
      case 'set':
        newScore = value;
        break;
      case 'add':
        newScore = player.score + value;
        break;
      case 'subtract':
        newScore = Math.max(0, player.score - value);
        break;
    }

    onUpdate(player.id, newScore);
  };

  const handleClose = () => {
    setInputValue(player.score.toString());
    setMode('set');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <RetroCard className="w-full max-w-md animate-pixel-slide-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-primary text-sm sm:text-base uppercase">
            UPDATE SKOR
          </h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6 p-3 bg-muted border-2 border-border">
          <div className="text-2xl">{player.avatar}</div>
          <div className="flex-1">
            <div className="text-foreground text-sm uppercase">{player.name}</div>
            <div className="text-accent text-xs">SKOR SAAT INI: {player.score}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-primary text-xs mb-3 uppercase">
              MODE UPDATE
            </label>
            <div className="grid grid-cols-3 gap-2">
              <RetroButton
                type="button"
                variant={mode === 'set' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => {
                  setMode('set');
                  soundPlayer.playSelect();
                }}
              >
                SET
              </RetroButton>
              <RetroButton
                type="button"
                variant={mode === 'add' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => {
                  setMode('add');
                  setInputValue('0');
                  soundPlayer.playSelect();
                }}
                className="flex items-center justify-center gap-1"
              >
                <Plus size={12} /> ADD
              </RetroButton>
              <RetroButton
                type="button"
                variant={mode === 'subtract' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => {
                  setMode('subtract');
                  setInputValue('0');
                  soundPlayer.playSelect();
                }}
                className="flex items-center justify-center gap-1"
              >
                <Minus size={12} /> SUB
              </RetroButton>
            </div>
          </div>

          <div>
            <label className="block text-primary text-xs mb-2 uppercase">
              {mode === 'set' ? 'SKOR BARU' : mode === 'add' ? 'TAMBAH POIN' : 'KURANGI POIN'}
            </label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-muted text-foreground border-2 border-border px-3 py-2 text-sm focus:border-primary focus:outline-none text-center text-xl"
              autoFocus
              min="0"
            />
            {mode !== 'set' && (
              <p className="text-muted-foreground text-[10px] mt-2">
                HASIL: {mode === 'add' 
                  ? player.score + (parseInt(inputValue) || 0)
                  : Math.max(0, player.score - (parseInt(inputValue) || 0))
                }
              </p>
            )}
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
              UPDATE
            </RetroButton>
          </div>
        </form>
      </RetroCard>
    </div>
  );
};
