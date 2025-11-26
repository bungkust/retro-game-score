import { useState, useEffect, useRef } from 'react';
import { RetroButton } from './RetroButton';
import { RetroCard } from './RetroCard';
import { soundPlayer } from '@/lib/sounds';
import { UserPlus } from 'lucide-react';

interface PlayerNameDialogProps {
  open: boolean;
  playerLabel: 'X' | 'O';
  onClose: () => void;
  onSubmit: (name: string) => void;
  existingNames?: string[];
}

const STORAGE_KEY = 'tictactoe_player_names';

// Get saved player names from localStorage
const getSavedNames = (): string[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Save player name to localStorage history
const saveNameToHistory = (name: string): void => {
  const names = getSavedNames();
  const normalizedName = name.toUpperCase();
  // Remove if exists, then add to front (most recent first)
  const filtered = names.filter(n => n !== normalizedName);
  const updated = [normalizedName, ...filtered].slice(0, 10); // Keep last 10 names
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const PlayerNameDialog = ({ 
  open, 
  playerLabel,
  onClose, 
  onSubmit,
  existingNames = []
}: PlayerNameDialogProps) => {
  const [name, setName] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const savedNames = getSavedNames();
  const availableNames = savedNames.filter(n => !existingNames.includes(n));

  useEffect(() => {
    if (open) {
      setName('');
      setShowHistory(savedNames.length > 0);
      // Focus input after dialog opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, savedNames.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
    setName(value);
    soundPlayer.playSelect();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && name.length === 3) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSubmit = () => {
    if (name.length === 3) {
      saveNameToHistory(name.toUpperCase());
      soundPlayer.playSuccess();
      onSubmit(name.toUpperCase());
      setName('');
    } else {
      soundPlayer.playError();
    }
  };

  const handleSelectFromHistory = (selectedName: string) => {
    soundPlayer.playSelect();
    saveNameToHistory(selectedName);
    onSubmit(selectedName);
  };

  const handleNewName = () => {
    setShowHistory(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/95 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
      <RetroCard className="w-full max-w-md animate-pixel-slide-in">
        <div className="text-center p-6">
          <h2 className="text-primary text-lg sm:text-xl uppercase mb-2">
            PEMAIN {playerLabel}
          </h2>
          <p className="text-muted-foreground text-xs mb-6">
            PILIH ATAU BUAT NAMA BARU
          </p>
          
          {showHistory && availableNames.length > 0 ? (
            <div className="mb-6">
              <div className="text-left mb-3">
                <p className="text-muted-foreground text-xs uppercase mb-2">
                  Pilih dari nama sebelumnya:
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {availableNames.map((savedName) => (
                    <RetroButton
                      key={savedName}
                      variant="ghost"
                      onClick={() => handleSelectFromHistory(savedName)}
                      className="text-sm"
                    >
                      {savedName}
                    </RetroButton>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2 my-4">
                <div className="flex-1 border-t border-border"></div>
                <span className="text-muted-foreground text-xs">ATAU</span>
                <div className="flex-1 border-t border-border"></div>
              </div>
              
              <RetroButton
                variant="ghost"
                onClick={handleNewName}
                className="w-full flex items-center justify-center gap-2"
              >
                <UserPlus size={14} />
                BUAT NAMA BARU
              </RetroButton>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-primary text-xs mb-3 uppercase">
                ENTER 3 LETTERS
              </label>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="w-full bg-muted text-foreground border-2 border-primary px-3 py-3 text-2xl font-bold text-center uppercase tracking-widest focus:border-accent focus:outline-none"
                maxLength={3}
                placeholder="AAA"
                autoFocus
              />
              <div className="flex gap-1 justify-center mt-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 border-2 flex items-center justify-center text-lg font-bold ${
                      name[i]
                        ? 'border-accent bg-accent/20 text-accent'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    {name[i] || '_'}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <RetroButton
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              CANCEL
            </RetroButton>
            {!showHistory && (
              <RetroButton
                variant="primary"
                onClick={handleSubmit}
                disabled={name.length !== 3}
                className="flex-1"
              >
                SUBMIT
              </RetroButton>
            )}
          </div>
        </div>
      </RetroCard>
    </div>
  );
};

