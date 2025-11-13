import { useState, useEffect, useRef } from 'react';
import { RetroButton } from './RetroButton';
import { RetroCard } from './RetroCard';
import { soundPlayer } from '@/lib/sounds';

interface NameInputDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  title?: string;
  score?: number;
  level?: number;
}

export const NameInputDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  title = 'ENTER NAME',
  score,
  level 
}: NameInputDialogProps) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName('');
      // Focus input after dialog opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

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
      soundPlayer.playSuccess();
      onSubmit(name);
      setName('');
    } else {
      soundPlayer.playError();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/95 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
      <RetroCard className="w-full max-w-md animate-pixel-slide-in">
        <div className="text-center p-6">
          <h2 className="text-primary text-lg sm:text-xl uppercase mb-4">
            {title}
          </h2>
          
          {score !== undefined && (
            <p className="text-accent text-lg font-bold mb-2">SCORE: {score.toLocaleString()}</p>
          )}
          
          {level !== undefined && (
            <p className="text-muted-foreground text-xs mb-4">LEVEL: {level}</p>
          )}

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

          <div className="flex gap-3">
            <RetroButton
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              CANCEL
            </RetroButton>
            <RetroButton
              variant="primary"
              onClick={handleSubmit}
              disabled={name.length !== 3}
              className="flex-1"
            >
              SUBMIT
            </RetroButton>
          </div>
        </div>
      </RetroCard>
    </div>
  );
};

