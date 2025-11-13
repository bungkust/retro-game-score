import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Brain } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { RetroCard } from '@/components/RetroCard';
import { RetroButton } from '@/components/RetroButton';
import { NameInputDialog } from '@/components/NameInputDialog';
import { storage } from '@/lib/storage';
import { soundPlayer } from '@/lib/sounds';
import { toast } from 'sonner';

const CARD_SYMBOLS = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎺', '🏆', '⚽', '🏀', '🎾', '🏐', '🎱', '🎳', '🎯', '🎪', '🎨', '🎭', '🎸', '🎺', '🎷', '🎹', '🥁', '🎤', '🎧', '🎬', '🎨', '🎭', '🎪', '🎯', '🎲', '🎮', '🎰', '🎲', '🃏', '🀄', '🎴', '🎲', '🎯', '🎪', '🎨', '🎭', '🎸', '🎺', '🎷', '🎹', '🥁', '🎤', '🎧', '🎬'];
// Level 1-5: Each level has different grid size, increasing difficulty
const LEVELS = [
  { level: 1, rows: 3, cols: 4, pairs: 6, multiplier: 1 },    // 3x4 = 12 cards (6 pairs)
  { level: 2, rows: 4, cols: 4, pairs: 8, multiplier: 2 },    // 4x4 = 16 cards (8 pairs)
  { level: 3, rows: 4, cols: 6, pairs: 12, multiplier: 3 },   // 4x6 = 24 cards (12 pairs)
  { level: 4, rows: 5, cols: 6, pairs: 15, multiplier: 5 },   // 5x6 = 30 cards (15 pairs)
  { level: 5, rows: 6, cols: 6, pairs: 18, multiplier: 10 },  // 6x6 = 36 cards (18 pairs)
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
  const [timeElapsed, setTimeElapsed] = useState(0); // Time in seconds
  const [startTime, setStartTime] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const currentLevelConfig = LEVELS[level - 1];
  const scoreMultiplier = currentLevelConfig.multiplier;
  
  // Get leaderboard to show high score
  const leaderboard = useMemo(() => storage.getOrCreateGameLeaderboard('memory'), []);
  const sortedPlayers = useMemo(() => [...leaderboard.players].sort((a, b) => b.score - a.score), [leaderboard.players]);
  const currentHighScore = sortedPlayers[0]?.score || 0;

  // Timer effect - runs continuously while game is active
  useEffect(() => {
    if (startTime !== null && !gameWon) {
      timerRef.current = window.setInterval(() => {
        if (startTime !== null) {
          setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }
      }, 1000);
    } else {
      // Stop timer when game is won
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime, gameWon]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const config = currentLevelConfig;
    // Get symbols for this level (based on pairs needed)
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
    setTimeElapsed(0);
    setStartTime(null); // Don't start timer yet - wait for first card click
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

    // Start timer on first card click (if not already started)
    if (startTime === null) {
      setStartTime(Date.now());
    }

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
      
      // Capture current moves value before setTimeout
      const currentMoves = moves;
      
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
            
            // Check if game is won
            if (newMatches === config.pairs) {
              // Game won! Calculate final time and score
              const endTime = Date.now();
              const finalTime = startTime ? Math.floor((endTime - startTime) / 1000) : timeElapsed;
              
              // Stop timer immediately
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              
              // Calculate score based on moves and time
              // Use currentMoves + 1 because we already incremented moves
              const actualMoves = currentMoves + 1;
              const actualTime = Math.max(1, finalTime); // At least 1 second
              
              // Base score from moves: perfect game = pairs moves
              // Score decreases as moves increase
              // Formula: (pairs / actualMoves) * 1000 = base score
              const optimalMoves = config.pairs;
              const movesEfficiency = Math.min(1, optimalMoves / actualMoves);
              const baseMovesScore = Math.floor(movesEfficiency * 1000);
              
              // Time multiplier: faster = higher multiplier
              // Optimal time: pairs * 1.5 seconds (very fast)
              // Time multiplier: (optimalTime / actualTime), capped at 2.0x
              const optimalTime = Math.max(config.pairs * 1.5, 10);
              const timeMultiplier = Math.min(2.0, optimalTime / actualTime);
              
              // Final score: base moves score * time multiplier * level multiplier
              const baseScore = baseMovesScore;
              const timeBonus = baseScore * (timeMultiplier - 1); // Extra score from time
              const calculatedScore = Math.floor((baseScore + timeBonus) * scoreMultiplier);
              
              // Update states immediately (like Snake game)
              setTimeElapsed(finalTime);
              setFinalScore(calculatedScore);
              setFinalMoves(actualMoves);
              setGameWon(true);
              // Show name input dialog immediately (like Snake game)
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
  // Dynamic grid columns based on level config
  const getGridColsClass = (cols: number) => {
    const colsMap: { [key: number]: string } = {
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      7: 'grid-cols-7',
      8: 'grid-cols-8',
    };
    return colsMap[cols] || 'grid-cols-4';
  };
  const gridCols = getGridColsClass(config.cols);

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
                GRID: {config.rows}x{config.cols} • PAIRS: {config.pairs} • MULTIPLIER: {scoreMultiplier}x
              </p>
            </div>
          </RetroCard>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <RetroCard className="text-center p-3">
            <div className="text-accent text-lg font-bold">{moves}</div>
            <div className="text-muted-foreground text-[9px] mt-1">MOVES</div>
          </RetroCard>
          <RetroCard className="text-center p-3">
            <div className="text-primary text-lg font-bold">
              {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-muted-foreground text-[9px] mt-1">TIME</div>
          </RetroCard>
          <RetroCard className="text-center p-3">
            <div className="text-secondary text-lg font-bold">
              {matches}/{config.pairs}
            </div>
            <div className="text-muted-foreground text-[9px] mt-1">MATCHES</div>
          </RetroCard>
          <RetroCard className="text-center p-3">
            <div className="text-accent text-lg font-bold">
              {currentHighScore || '-'}
            </div>
            <div className="text-muted-foreground text-[9px] mt-1">HIGH</div>
          </RetroCard>
        </div>

        {/* Game Board */}
        <RetroCard className="p-4 mb-6">
          <div 
            className={`grid ${gridCols} gap-2`}
            style={{
              gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
            }}
          >
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
                  <span className={`${config.cols <= 4 ? 'text-2xl sm:text-3xl' : config.cols === 5 ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'}`}>
                    {card.symbol}
                  </span>
                ) : (
                  <span className={`${config.cols <= 4 ? 'text-2xl sm:text-3xl' : config.cols === 5 ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'} opacity-0`}>
                    ?
                  </span>
                )}
              </button>
            ))}
          </div>
        </RetroCard>

        {/* Name Input Dialog */}
        <NameInputDialog
          open={showNameInput}
          onClose={handleNameCancel}
          onSubmit={handleNameSubmit}
          title="ENTER NAME"
          score={finalScore}
          level={level}
        />

        {/* Game Won Overlay - Only show if name input is closed */}
        {gameWon && !showNameInput && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
            <RetroCard className="mx-auto max-w-md w-full">
              <div className="text-center p-8">
                <Brain className="mx-auto mb-4 text-accent" size={64} />
                <h2 className="text-accent text-xl uppercase mb-4">
                  YOU WIN!
                </h2>
                <p className="text-foreground text-sm mb-1">
                  MOVES: {finalMoves}
                </p>
                <p className="text-foreground text-sm mb-1">
                  TIME: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
                </p>
                <p className="text-accent text-lg font-bold mb-2">
                  SCORE: {finalScore.toLocaleString()}
                </p>
                {((finalScore > currentHighScore) || (currentHighScore === 0 && finalScore > 0)) && (
                  <p className="text-accent text-xs mb-6 blink">NEW HIGH SCORE!</p>
                )}
                <div className="flex flex-col gap-3 items-center">
                  <div className="flex gap-3 justify-center">
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
                  <RetroButton variant="primary" onClick={resetGame}>
                    PLAY AGAIN
                  </RetroButton>
                </div>
              </div>
            </RetroCard>
          </div>
        )}

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

