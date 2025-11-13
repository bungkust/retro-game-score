import { useState, useRef, useEffect } from 'react';
import { Share2, Copy, Download, Instagram, MessageCircle, Twitter, Facebook, X } from 'lucide-react';
import { RetroButton } from './RetroButton';
import { RetroCard } from './RetroCard';
import { Leaderboard } from '@/lib/types';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface ShareLeaderboardDialogProps {
  open: boolean;
  onClose: () => void;
  leaderboard: Leaderboard;
  leaderboardElementRef?: React.RefObject<HTMLDivElement>;
}

export const ShareLeaderboardDialog = ({
  open,
  onClose,
  leaderboard,
  leaderboardElementRef
}: ShareLeaderboardDialogProps) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (open) {
      // Generate share URL
      const url = `${window.location.origin}/leaderboard/${leaderboard.id}`;
      setShareUrl(url);
    }
  }, [open, leaderboard.id]);

  const copyToClipboard = async (text: string, successMessage: string = 'COPIED!') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } catch (err) {
      toast.error('GAGAL COPY!');
    }
  };

  const handleCopyLink = () => {
    copyToClipboard(shareUrl, 'LINK COPIED!');
  };

  const handleCopyText = () => {
    const text = generateShareText();
    copyToClipboard(text, 'TEXT COPIED!');
  };

  const generateShareText = () => {
    const sortedPlayers = [...leaderboard.players].sort((a, b) => {
      if (leaderboard.sortOrder === 'highest') {
        return b.score - a.score;
      }
      return a.score - b.score;
    });

    let text = `🏆 ${leaderboard.name}\n\n`;
    
    if (leaderboard.description) {
      text += `${leaderboard.description}\n\n`;
    }

    text += '📊 LEADERBOARD:\n';
    sortedPlayers.forEach((player, index) => {
      text += `${index + 1}. ${player.avatar} ${player.name}: ${player.score}\n`;
    });

    text += `\n🔗 ${shareUrl}`;
    return text;
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        const text = generateShareText();
        await navigator.share({
          title: leaderboard.name,
          text: text,
          url: shareUrl,
        });
        toast.success('SHARED!');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          toast.error('GAGAL SHARE!');
        }
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  // Helper function to get computed background color from CSS variable
  const getBackgroundColor = (): string => {
    if (!leaderboardElementRef?.current) {
      // Fallback to dark blue color matching --background: 220 30% 8%
      return '#0d1621';
    }
    
    // Get computed style to resolve CSS variable
    const computedStyle = window.getComputedStyle(leaderboardElementRef.current);
    const bgColor = computedStyle.backgroundColor;
    
    // If we got a valid RGB/RGBA color, return it
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      return bgColor;
    }
    
    // Fallback: try to get from root element
    const rootElement = document.documentElement;
    const rootStyle = window.getComputedStyle(rootElement);
    const rootBgColor = rootStyle.backgroundColor;
    
    if (rootBgColor && rootBgColor !== 'rgba(0, 0, 0, 0)' && rootBgColor !== 'transparent') {
      return rootBgColor;
    }
    
    // Final fallback: dark blue matching --background: 220 30% 8% = hsl(220, 30%, 8%)
    return '#0d1621';
  };

  // Instagram Story dimensions: 1080 x 1920 pixels (9:16 ratio, portrait)
  const INSTAGRAM_STORY_WIDTH = 1080;
  const INSTAGRAM_STORY_HEIGHT = 1920;

  const generateImage = async () => {
    if (!leaderboardElementRef?.current) {
      toast.error('ELEMENT TIDAK DITEMUKAN!');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const backgroundColor = getBackgroundColor();
      
      // Capture leaderboard content
      const sourceCanvas = await html2canvas(leaderboardElementRef.current, {
        backgroundColor: backgroundColor,
        scale: 2,
        logging: false,
        useCORS: true,
      });

      // Create fixed portrait canvas for Instagram Story (1080x1920)
      const portraitCanvas = document.createElement('canvas');
      portraitCanvas.width = INSTAGRAM_STORY_WIDTH;
      portraitCanvas.height = INSTAGRAM_STORY_HEIGHT;
      const ctx = portraitCanvas.getContext('2d');
      
      if (!ctx) {
        toast.error('GAGAL MEMBUAT CANVAS!');
        return;
      }

      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, INSTAGRAM_STORY_WIDTH, INSTAGRAM_STORY_HEIGHT);

      // Scale content to fit width, keep aspect ratio, position at top (not centered)
      const scale = INSTAGRAM_STORY_WIDTH / sourceCanvas.width;
      const scaledHeight = sourceCanvas.height * scale;
      
      // Position at top, horizontally centered but vertically at top
      let offsetX = 0;
      let offsetY = 0;
      let drawWidth = INSTAGRAM_STORY_WIDTH;
      let drawHeight = scaledHeight;

      // If scaled height exceeds portrait height, scale to fit height instead
      if (scaledHeight > INSTAGRAM_STORY_HEIGHT) {
        const heightScale = INSTAGRAM_STORY_HEIGHT / sourceCanvas.height;
        drawWidth = sourceCanvas.width * heightScale;
        drawHeight = INSTAGRAM_STORY_HEIGHT;
        // Center horizontally when fitting to height
        offsetX = (INSTAGRAM_STORY_WIDTH - drawWidth) / 2;
      }

      // Draw leaderboard content at top of portrait canvas (not centered vertically)
      ctx.drawImage(sourceCanvas, offsetX, offsetY, drawWidth, drawHeight);

      // Convert to blob and download
      portraitCanvas.toBlob((blob) => {
        if (!blob) {
          toast.error('GAGAL GENERATE GAMBAR!');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `leaderboard-${leaderboard.name.replace(/\s+/g, '-')}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('GAMBAR TERDOWNLOAD! (Portrait 1080x1920)');
      }, 'image/png', 1.0);
    } catch (err) {
      console.error('Error generating image:', err);
      toast.error('GAGAL GENERATE GAMBAR!');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleShareInstagram = async () => {
    // Instagram Story format: 1080 x 1920 pixels (9:16 portrait)
    if (!leaderboardElementRef?.current) {
      toast.error('ELEMENT TIDAK DITEMUKAN!');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const backgroundColor = getBackgroundColor();
      
      // Capture leaderboard content with higher scale for better quality
      const sourceCanvas = await html2canvas(leaderboardElementRef.current, {
        backgroundColor: backgroundColor,
        scale: 3, // Higher scale for better Instagram quality
        logging: false,
        useCORS: true,
        windowWidth: leaderboardElementRef.current.scrollWidth,
        windowHeight: leaderboardElementRef.current.scrollHeight,
      });

      // Create fixed portrait canvas for Instagram Story (1080x1920)
      const portraitCanvas = document.createElement('canvas');
      portraitCanvas.width = INSTAGRAM_STORY_WIDTH;
      portraitCanvas.height = INSTAGRAM_STORY_HEIGHT;
      const ctx = portraitCanvas.getContext('2d');
      
      if (!ctx) {
        toast.error('GAGAL MEMBUAT CANVAS!');
        return;
      }

      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, INSTAGRAM_STORY_WIDTH, INSTAGRAM_STORY_HEIGHT);

      // Scale content to fit width, keep aspect ratio, position at top (not centered)
      const scale = INSTAGRAM_STORY_WIDTH / sourceCanvas.width;
      const scaledHeight = sourceCanvas.height * scale;
      
      // Position at top, horizontally centered but vertically at top
      let offsetX = 0;
      let offsetY = 0;
      let drawWidth = INSTAGRAM_STORY_WIDTH;
      let drawHeight = scaledHeight;

      // If scaled height exceeds portrait height, scale to fit height instead
      if (scaledHeight > INSTAGRAM_STORY_HEIGHT) {
        const heightScale = INSTAGRAM_STORY_HEIGHT / sourceCanvas.height;
        drawWidth = sourceCanvas.width * heightScale;
        drawHeight = INSTAGRAM_STORY_HEIGHT;
        // Center horizontally when fitting to height
        offsetX = (INSTAGRAM_STORY_WIDTH - drawWidth) / 2;
      }

      // Draw leaderboard content at top of portrait canvas (not centered vertically)
      ctx.drawImage(sourceCanvas, offsetX, offsetY, drawWidth, drawHeight);

      // Convert to blob and download with Instagram-friendly name
      portraitCanvas.toBlob((blob) => {
        if (!blob) {
          toast.error('GAGAL GENERATE GAMBAR!');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // Instagram-friendly filename
        const timestamp = new Date().toISOString().split('T')[0];
        link.download = `leaderboard-${leaderboard.name.replace(/\s+/g, '-')}-${timestamp}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('GAMBAR TERDOWNLOAD! (1080x1920 Portrait - Ready for Instagram Story!)', {
          duration: 5000,
        });
      }, 'image/png', 1.0); // Highest quality
    } catch (err) {
      console.error('Error generating image:', err);
      toast.error('GAGAL GENERATE GAMBAR!');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm">
      <RetroCard className="w-full max-w-md animate-pixel-slide-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-primary text-lg sm:text-xl uppercase">SHARE LEADERBOARD</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Share Options */}
          <div className="space-y-3 mb-6">
            {/* Native Share (Mobile) */}
            {navigator.share && (
              <RetroButton
                variant="primary"
                onClick={handleShareNative}
                className="w-full flex items-center justify-center gap-2"
              >
                <Share2 size={18} />
                SHARE
              </RetroButton>
            )}

            {/* Copy Link */}
            <RetroButton
              variant="ghost"
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2"
            >
              <Copy size={18} />
              COPY LINK
            </RetroButton>

            {/* Copy Text */}
            <RetroButton
              variant="ghost"
              onClick={handleCopyText}
              className="w-full flex items-center justify-center gap-2"
            >
              <Copy size={18} />
              COPY TEXT
            </RetroButton>

            {/* Instagram - Highlighted */}
            <div className="pt-3 border-t-2 border-accent/30">
              <RetroButton
                variant="primary"
                onClick={handleShareInstagram}
                disabled={isGeneratingImage || !leaderboardElementRef?.current}
                className="w-full flex items-center justify-center gap-2"
              >
                {isGeneratingImage ? (
                  <>GENERATING...</>
                ) : (
                  <>
                    <Instagram size={18} />
                    DOWNLOAD UNTUK INSTAGRAM
                  </>
                )}
              </RetroButton>
              <p className="text-muted-foreground text-[9px] mt-2 text-center">
                Download gambar, lalu upload ke Instagram Story/Post
              </p>
            </div>

            {/* Download Image */}
            <RetroButton
              variant="ghost"
              onClick={generateImage}
              disabled={isGeneratingImage || !leaderboardElementRef?.current}
              className="w-full flex items-center justify-center gap-2"
            >
              {isGeneratingImage ? (
                <>GENERATING...</>
              ) : (
                <>
                  <Download size={18} />
                  DOWNLOAD IMAGE
                </>
              )}
            </RetroButton>

            {/* Social Media Buttons */}
            <div className="pt-3 border-t border-border">
              <p className="text-muted-foreground text-[10px] uppercase mb-3 text-center">
                SHARE TO:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <RetroButton
                  variant="ghost"
                  onClick={handleShareWhatsApp}
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  <span className="text-xs">WhatsApp</span>
                </RetroButton>
                
                <RetroButton
                  variant="ghost"
                  onClick={handleShareTelegram}
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  <span className="text-xs">Telegram</span>
                </RetroButton>

                <RetroButton
                  variant="ghost"
                  onClick={handleShareTwitter}
                  className="flex items-center justify-center gap-2"
                >
                  <Twitter size={16} />
                  <span className="text-xs">Twitter</span>
                </RetroButton>

                <RetroButton
                  variant="ghost"
                  onClick={handleShareFacebook}
                  className="flex items-center justify-center gap-2"
                >
                  <Facebook size={16} />
                  <span className="text-xs">Facebook</span>
                </RetroButton>
              </div>
            </div>
          </div>

          {/* URL Preview */}
          <div className="mt-4 p-3 bg-muted rounded border border-border">
            <p className="text-muted-foreground text-[9px] uppercase mb-1">SHARE URL:</p>
            <p className="text-foreground text-[10px] break-all">{shareUrl}</p>
          </div>

          <div className="mt-4 text-center">
            <RetroButton variant="ghost" onClick={onClose} className="w-full">
              CLOSE
            </RetroButton>
          </div>
        </div>
      </RetroCard>
    </div>
  );
};

