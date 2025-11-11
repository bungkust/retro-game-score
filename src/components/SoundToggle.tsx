import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundPlayer } from '@/lib/sounds';
import { cn } from '@/lib/utils';

export const SoundToggle = () => {
  const [isMuted, setIsMuted] = useState(soundPlayer.isSoundMuted());

  useEffect(() => {
    setIsMuted(soundPlayer.isSoundMuted());
  }, []);

  const handleToggle = () => {
    const newMutedState = soundPlayer.toggleMute();
    setIsMuted(newMutedState);
    if (!newMutedState) {
      soundPlayer.playSelect();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'fixed top-4 right-4 p-2 border-2 transition-all z-50',
        isMuted 
          ? 'border-muted text-muted-foreground' 
          : 'border-primary text-primary glow-cyan'
      )}
      aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
    >
      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  );
};
