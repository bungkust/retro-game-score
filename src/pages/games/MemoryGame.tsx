import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Brain } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { RetroCard } from '@/components/RetroCard';
import { RetroButton } from '@/components/RetroButton';
import { NameInputDialog } from '@/components/NameInputDialog';
import { storage } from '@/lib/storage';
import { soundPlayer } from '@/lib/sounds';
import { toast } from 'sonner';

const CARD_SYMBOLS = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎺'];
// Level 1-5: Higher level = more pairs, higher score multiplier
const LEVELS = [
  { level: 1, size: 4, pairs: 8, multiplier: 1 },
  { level: 2, size: 4, pairs: 8, multiplier: 2 },
  { level: 3, size: 6, pairs: 12, multiplier: 3 },
  { level: 4, size: 6, pairs: 12, multiplier: 5 },
  { level: 5, size: 8, pairs: 16, multiplier: 10 },
];

type Card = {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const MemoryGame = () => {
  const navigate = useNavigate();
  const [level, setLevel] = useState(1); // Level 1-5
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalMoves, setFinalMoves] = useState(0);

  const currentLevelConfig = LEVELS[level - 1];
  const scoreMultiplier = currentLevelConfig.multiplier;
  
  // Get leaderboard to show high score
  const leaderboard = useMemo(() => storage.getOrCreateGameLeaderboard('memory'), []);
  const sortedPlayers = useMemo(() => [...leaderboard.players].sort((a, b) => b.score - a.score), [leaderboard.players]);
  const currentHighScore = sortedPlayers[0]?.score || 0;

  // Initialize game
  const initializeGame = useCallback(() => {
    const config = currentLevelConfig;
    const symbols = CARD_SYMBOLS.slice(0, config.pairs);
    const cardPairs = [...symbols, ...symbols];
    
    // Shuffle cards
    const shuffled = cardPairs
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameWon(false);
    setIsProcessing(false);
    setShowNameInput(false);
    setFinalScore(0);
    setFinalMoves(0);
  }, [currentLevelConfig]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (isProcessing || gameWon) return;
    
    const card = cards[cardId];
    if (card.isFlipped || card.isMatched) return;
    if (flippedCards.length >= 2) return;

    soundPlayer.playSelect();

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    const newCards = cards.map((c, idx) =>
      idx === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    // Check for match when 2 cards are flipped
    if (newFlippedCards.length === 2) {
      setIsProcessing(true);
      setMoves((prev) => prev + 1);

      setTimeout(() => {
        const [firstId, secondId] = newFlippedCards;
        const firstCard = newCards[firstId];
        const secondCard = newCards[secondId];

        if (firstCard.symbol === secondCard.symbol) {
          // Match found
          soundPlayer.playCoin();
          const updatedCards = newCards.map((c, idx) =>
            idx === firstId || idx === secondId
              ? { ...c, isMatched: true, isFlipped: false }
              : c
          );
          setCards(updatedCards);
          setMatches((prev) => {
            const newMatches = prev + 1;
            const config = currentLevelConfig;
            if (newMatches === config.pairs) {
              // Calculate score: base score = (maxPossibleMoves - actualMoves) * multiplier
              // maxPossibleMoves = pairs * 2 (worst case: flip all cards twice)
              const maxPossibleMoves = config.pairs * 2;
              const actualMoves = moves + 1;
              const baseScore = Math.max(0, maxPossibleMoves - actualMoves);
              const calculatedScore = baseScore * scoreMultiplier * 10; // Multiply by 10 for better score scale
              
              setFinalScore(calculatedScore);
              setFinalMoves(actualMoves);
              setGameWon(true);
              setShowNameInput(true);
              soundPlayer.playSuccess();
            }
            return newMatches;
          });
        } else {
          // No match
          soundPlayer.playError();
          const updatedCards = newCards.map((c, idx) =>
            idx === firstId || idx === secondId
              ? { ...c, isFlipped: false }
              : c
          );
          setCards(updatedCards);
        }

        setFlippedCards([]);
        setIsProcessing(false);
      }, 1000);
    }
  };

  const resetGame = () => {
    soundPlayer.playSelect();
    initializeGame();
  };

  const handleNameSubmit = (name: string) => {
    // Add player to leaderboard
    storage.addPlayerToGameLeaderboard('memory', name, finalScore);
    toast.success('SCORE SAVED!');
    setShowNameInput(false);
  };

  const handleNameCancel = () => {
    setShowNameInput(false);
  };

  const config = currentLevelConfig;
  const gridCols = config.size === 4 ? 'grid-cols-4' : config.size === 6 ? 'grid-cols-6' : 'grid-cols-8';

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 pb-navbar relative scanlines">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="MEMORY GAME"
          showBack
          action={
            <RetroButton
              variant="ghost"
              size="sm"
              onClick={resetGame}
              className="flex items-center gap-1"
            >
              <RotateCcw size={14} />
            </RetroButton>
          }
        />

        {/* Level Selector */}
        <div className="mb-6">
          <RetroCard className="p-4">
            <h3 className="text-primary text-xs uppercase mb-3">LEVEL</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {LEVELS.map((levelConfig) => (
                <RetroButton
                  key={levelConfig.level}
                  variant={level === levelConfig.level ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    if (!gameWon && !isProcessing && moves === 0) {
                      setLevel(levelConfig.level);
                      soundPlayer.playSelect();
                      resetGame();
                    }
                  }}
                  disabled={gameWon || isProcessing || moves > 0}
                  className="text-xs"
                >
                  {levelConfig.level}
                </RetroButton>
              ))}
            </div>
            <div className="mt-2 text-center">
              <p className="text-muted-foreground text-[9px]">
                PAIRS: {config.pairs} • MULTIPLIER: {scoreMultiplier}x
              </p>
            </div>
          </RetroCard>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <RetroCard className="text-center p-3">
            <div className="text-accent text-lg font-bold">{moves}</div>
            <div className="text-muted-foreground text-[9px] mt-1">MOVES</div>
          </RetroCard>
          <RetroCard className="text-center p-3">
            <div className="text-primary text-lg font-bold">
              {currentHighScore || '-'}
            </div>
            <div className="text-muted-foreground text-[9px] mt-1">HIGH</div>
          </RetroCard>
          <RetroCard className="text-center p-3">
            <div className="text-secondary text-lg font-bold">
              {matches}/{config.pairs}
            </div>
            <div className="text-muted-foreground text-[9px] mt-1">MATCHES</div>
          </RetroCard>
        </div>

        {/* Game Board */}
        <RetroCard className="p-4 mb-6">
          <div className={`grid ${gridCols} gap-2`}>
            {cards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(index)}
                disabled={isProcessing || gameWon}
                className={`
                  aspect-square flex items-center justify-center
                  border-2 border-border
                  transition-all
                  ${card.isMatched ? 'bg-accent/20 border-accent' : ''}
                  ${card.isFlipped ? 'bg-card' : 'bg-muted hover:bg-muted/80'}
                  ${isProcessing || gameWon ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
                  ${card.isFlipped || card.isMatched ? '' : 'hover:border-primary'}
                `}
              >
                {card.isFlipped || card.isMatched ? (
                  <span className="text-2xl sm:text-3xl">{card.symbol}</span>
                ) : (
                  <span className="text-2xl sm:text-3xl opacity-0">?</span>
                )}
              </button>
            ))}
          </div>
        </RetroCard>

        {/* Game Won Overlay - Only show if name input is closed */}
        {gameWon && !showNameInput && (
          <RetroCard className="absolute inset-0 flex items-center justify-center bg-background/90 z-50">
            <div className="text-center p-8">
              <Brain className="mx-auto mb-4 text-accent" size={64} />
              <h2 className="text-accent text-xl uppercase mb-4">
                YOU WIN!
              </h2>
              <p className="text-foreground text-sm mb-2">
                MOVES: {finalMoves}
              </p>
              <p className="text-accent text-sm mb-2">
                SCORE: {finalScore}
              </p>
              {finalScore >= currentHighScore && (
                <p className="text-accent text-xs mb-6">NEW HIGH SCORE!</p>
              )}
              <div className="flex gap-3 justify-center flex-wrap">
                <RetroButton variant="primary" onClick={resetGame}>
                  PLAY AGAIN
                </RetroButton>
                <RetroButton
                  variant="ghost"
                  onClick={() => {
                    soundPlayer.playSelect();
                    navigate('/play');
                  }}
                >
                  MENU
                </RetroButton>
                <RetroButton
                  variant="ghost"
                  onClick={() => {
                    soundPlayer.playSelect();
                    navigate('/leaderboard/game_memory');
                  }}
                >
                  LEADERBOARD
                </RetroButton>
              </div>
            </div>
          </RetroCard>
        )}

        {/* Name Input Dialog */}
        <NameInputDialog
          open={showNameInput}
          onClose={handleNameCancel}
          onSubmit={handleNameSubmit}
          title="ENTER NAME"
          score={finalScore}
          level={level}
        />

        {/* Instructions */}
        <RetroCard className="text-center p-4">
          <p className="text-muted-foreground text-[10px]">
            CLICK CARDS TO FLIP AND FIND MATCHES
          </p>
        </RetroCard>
      </div>
    </div>
  );
};

export default MemoryGame;

