import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Pause, Play, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { RetroCard } from '@/components/RetroCard';
import { RetroButton } from '@/components/RetroButton';
import { NameInputDialog } from '@/components/NameInputDialog';
import { storage } from '@/lib/storage';
import { soundPlayer } from '@/lib/sounds';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };

// Level 1-10: Higher level = faster speed, higher score multiplier
const LEVELS = Array.from({ length: 10 }, (_, i) => {
  const level = i + 1;
  // Speed decreases (faster) as level increases: 300ms (level 1) to 80ms (level 10)
  const speed = Math.max(80, 300 - (level - 1) * 22);
  // Score multiplier increases: 1x (level 1) to 10x (level 10)
  const multiplier = level;
  return { level, speed, multiplier };
});

type Position = { x: number; y: number };

const SnakeGame = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [level, setLevel] = useState(1); // Level 1-10
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const directionRef = useRef<Position>(INITIAL_DIRECTION);
  const gameLoopRef = useRef<number | null>(null);

  const currentLevelConfig = LEVELS[level - 1];
  const currentSpeed = currentLevelConfig.speed;
  const scoreMultiplier = currentLevelConfig.multiplier;
  
  // Get leaderboard to show high score (memoized to avoid recreating on every render)
  // Note: Leaderboard is auto-created when first score is saved
  const leaderboard = useMemo(() => storage.getOrCreateGameLeaderboard('snake'), []);
  const sortedPlayers = useMemo(() => [...leaderboard.players].sort((a, b) => b.score - a.score), [leaderboard.players]);
  const currentHighScore = sortedPlayers[0]?.score || 0;

  // Generate random food position (ensured within grid bounds)
  const generateFood = useCallback((snakeBody: Position[]): Position => {
    let newFood: Position;
    let attempts = 0;
    const maxAttempts = GRID_SIZE * GRID_SIZE;
    
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Clamp to ensure within bounds
      newFood.x = Math.max(0, Math.min(GRID_SIZE - 1, newFood.x));
      newFood.y = Math.max(0, Math.min(GRID_SIZE - 1, newFood.y));
      attempts++;
    } while (
      snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y) &&
      attempts < maxAttempts
    );
    
    return newFood;
  }, []);

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };
        const currentDirection = directionRef.current;

        // Move head
        head.x += currentDirection.x;
        head.y += currentDirection.y;

        // Check wall collision (must check before clamping to allow game over)
        if (
          head.x < 0 ||
          head.x >= GRID_SIZE ||
          head.y < 0 ||
          head.y >= GRID_SIZE
        ) {
          setGameOver(true);
          setShowNameInput(true);
          soundPlayer.playError();
          return prevSnake;
        }

        // Check self collision (before adding head to snake)
        if (
          newSnake.some(
            (segment) => segment.x === head.x && segment.y === head.y
          )
        ) {
          setGameOver(true);
          setShowNameInput(true);
          soundPlayer.playError();
          return prevSnake;
        }

        newSnake.unshift(head);

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setScore((prev) => {
            // Base score per food: 10 points, multiplied by level
            const pointsPerFood = 10 * scoreMultiplier;
            return prev + pointsPerFood;
          });
          setFood(generateFood(newSnake));
          soundPlayer.playCoin();
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    gameLoopRef.current = window.setInterval(moveSnake, currentSpeed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [food, gameOver, isPaused, generateFood, currentSpeed, scoreMultiplier]);

  // Handle direction change (used by both keyboard and touch controls)
  const changeDirection = useCallback((newDirection: Position) => {
    if (gameOver || isPaused) return;
    
    const currentDir = directionRef.current;
    
    // Prevent reverse direction
    if (newDirection.x === -currentDir.x && newDirection.y === -currentDir.y) {
      return;
    }
    
    // Only allow if moving perpendicular to current direction
    if (
      (newDirection.x !== 0 && currentDir.x === 0) ||
      (newDirection.y !== 0 && currentDir.y === 0)
    ) {
      directionRef.current = newDirection;
      setDirection(newDirection);
      soundPlayer.playSelect();
    }
  }, [gameOver, isPaused]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver || isPaused) return;

      const key = e.key.toLowerCase();
      const currentDir = directionRef.current;

      // Prevent reverse direction
      if (key === 'arrowup' || key === 'w') {
        if (currentDir.y === 0) {
          changeDirection({ x: 0, y: -1 });
        }
      } else if (key === 'arrowdown' || key === 's') {
        if (currentDir.y === 0) {
          changeDirection({ x: 0, y: 1 });
        }
      } else if (key === 'arrowleft' || key === 'a') {
        if (currentDir.x === 0) {
          changeDirection({ x: -1, y: 0 });
        }
      } else if (key === 'arrowright' || key === 'd') {
        if (currentDir.x === 0) {
          changeDirection({ x: 1, y: 0 });
        }
      } else if (key === ' ') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, isPaused, changeDirection]);

  const resetGame = () => {
    const initialSnake = [...INITIAL_SNAKE];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setGameOver(false);
    setScore(0);
    setFinalScore(0);
    setIsPaused(false);
    setShowNameInput(false);
    soundPlayer.playSelect();
  };

  // Capture final score when game over
  useEffect(() => {
    if (gameOver && score > 0) {
      setFinalScore(score);
    }
  }, [gameOver, score]);

  const handleNameSubmit = (name: string) => {
    // Add player to leaderboard
    storage.addPlayerToGameLeaderboard('snake', name, finalScore || score);
    toast.success('SCORE SAVED!');
    setShowNameInput(false);
  };

  const handleNameCancel = () => {
    setShowNameInput(false);
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
    soundPlayer.playSelect();
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 pb-navbar relative scanlines">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="SNAKE"
          showBack
          action={
            <div className="flex gap-2">
              <RetroButton
                variant="ghost"
                size="sm"
                onClick={togglePause}
                className="flex items-center gap-1"
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
              </RetroButton>
              <RetroButton
                variant="ghost"
                size="sm"
                onClick={resetGame}
                className="flex items-center gap-1"
              >
                <RotateCcw size={14} />
              </RetroButton>
            </div>
          }
        />

        {/* Level Selector */}
        <RetroCard className="mb-6 p-4">
          <h3 className="text-primary text-xs uppercase mb-3">LEVEL</h3>
          <div className="grid grid-cols-5 gap-2">
            {LEVELS.map((levelConfig) => (
              <RetroButton
                key={levelConfig.level}
                variant={level === levelConfig.level ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => {
                  // Only allow level change if game is over, paused, or not started
                  if (gameOver || isPaused || score === 0) {
                    setLevel(levelConfig.level);
                    soundPlayer.playSelect();
                    // Reset game if changing level
                    if (gameOver || isPaused) {
                      resetGame();
                    }
                  }
                }}
                disabled={score > 0 && !gameOver && !isPaused}
                className="text-xs"
              >
                {levelConfig.level}
              </RetroButton>
            ))}
          </div>
          <div className="mt-2 text-center">
            <p className="text-muted-foreground text-[9px]">
              SPEED: {currentSpeed}ms • MULTIPLIER: {scoreMultiplier}x
            </p>
          </div>
        </RetroCard>

        {/* Score Display */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <RetroCard className="text-center p-3">
            <div className="text-accent text-lg font-bold">{score}</div>
            <div className="text-muted-foreground text-[9px] mt-1">SCORE</div>
          </RetroCard>
          <RetroCard className="text-center p-3">
            <div className="text-primary text-lg font-bold">{currentHighScore}</div>
            <div className="text-muted-foreground text-[9px] mt-1">HIGH</div>
          </RetroCard>
          <RetroCard className="text-center p-3">
            <div className="text-secondary text-lg font-bold">
              {snake.length}
            </div>
            <div className="text-muted-foreground text-[9px] mt-1">LENGTH</div>
          </RetroCard>
        </div>

        {/* Game Board */}
        <RetroCard className="p-4 mb-6">
          <div
            className="mx-auto border-2 border-primary"
            style={{
              width: `${GRID_SIZE * 16}px`,
              height: `${GRID_SIZE * 16}px`,
              maxWidth: '100%',
              aspectRatio: '1',
              position: 'relative',
              backgroundColor: 'hsl(var(--background))',
            }}
          >
            {/* Grid */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                `,
                backgroundSize: '16px 16px',
              }}
            />

            {/* Snake */}
            {snake.map((segment, index) => {
              // Clamp segment position to ensure it's within grid bounds
              const clampedX = Math.max(0, Math.min(GRID_SIZE - 1, segment.x));
              const clampedY = Math.max(0, Math.min(GRID_SIZE - 1, segment.y));
              
              return (
                <div
                  key={index}
                  className={`absolute ${
                    index === 0 ? 'bg-accent' : 'bg-primary'
                  }`}
                  style={{
                    left: `${clampedX * 16}px`,
                    top: `${clampedY * 16}px`,
                    width: '14px',
                    height: '14px',
                    border: '1px solid hsl(var(--background))',
                  }}
                />
              );
            })}

            {/* Food */}
            {(() => {
              // Clamp food position to ensure it's within grid bounds
              const clampedX = Math.max(0, Math.min(GRID_SIZE - 1, food.x));
              const clampedY = Math.max(0, Math.min(GRID_SIZE - 1, food.y));
              
              return (
                <div
                  className="absolute bg-secondary"
                  style={{
                    left: `${clampedX * 16}px`,
                    top: `${clampedY * 16}px`,
                    width: '14px',
                    height: '14px',
                    border: '1px solid hsl(var(--background))',
                    animation: 'pulse 0.5s infinite',
                  }}
                />
              );
            })()}
          </div>
        </RetroCard>

        {/* Game Over Overlay - Only show if name input is closed */}
        {gameOver && !showNameInput && (
          <RetroCard className="absolute inset-0 flex items-center justify-center bg-background/90 z-50">
            <div className="text-center p-8">
              <h2 className="text-destructive text-xl uppercase mb-4">
                GAME OVER
              </h2>
              <p className="text-foreground text-sm mb-2">SCORE: {finalScore}</p>
              <p className="text-muted-foreground text-xs mb-6">
                HIGH SCORE: {currentHighScore}
              </p>
              <div className="flex gap-3 justify-center">
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
                    navigate('/leaderboard/game_snake');
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

        {/* Pause Overlay */}
        {isPaused && !gameOver && (
          <RetroCard className="absolute inset-0 flex items-center justify-center bg-background/90 z-40">
            <div className="text-center p-8">
              <h2 className="text-primary text-xl uppercase mb-4">PAUSED</h2>
              <RetroButton variant="primary" onClick={togglePause}>
                RESUME
              </RetroButton>
            </div>
          </RetroCard>
        )}

        {/* Instructions - Desktop Only */}
        {!isMobile && (
          <RetroCard className="text-center p-4">
            <p className="text-muted-foreground text-[10px] mb-2">
              USE ARROW KEYS / WASD TO MOVE
            </p>
            <p className="text-muted-foreground text-[10px]">
              PRESS SPACE TO PAUSE
            </p>
          </RetroCard>
        )}

        {/* Virtual Controls - Mobile Only */}
        {isMobile && (
          <div className="mt-6">
            <RetroCard className="p-6">
              <div className="flex flex-col items-center gap-4">
                {/* Up Button */}
                <button
                  onClick={() => changeDirection({ x: 0, y: -1 })}
                  disabled={gameOver || isPaused}
                  className={`
                    w-20 h-20 flex items-center justify-center
                    border-2 border-primary bg-muted
                    hover:bg-muted/80 active:bg-primary active:border-accent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all touch-manipulation
                    ${gameOver || isPaused ? '' : 'active:scale-95'}
                  `}
                  style={{ touchAction: 'manipulation' }}
                >
                  <ArrowUp size={28} className="text-primary" />
                </button>
                
                {/* Middle Row - Left, Center (Pause), Right */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => changeDirection({ x: -1, y: 0 })}
                    disabled={gameOver || isPaused}
                    className={`
                      w-20 h-20 flex items-center justify-center
                      border-2 border-primary bg-muted
                      hover:bg-muted/80 active:bg-primary active:border-accent
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all touch-manipulation
                      ${gameOver || isPaused ? '' : 'active:scale-95'}
                    `}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <ArrowLeft size={28} className="text-primary" />
                  </button>
                  
                  <button
                    onClick={togglePause}
                    className={`
                      w-20 h-20 flex items-center justify-center
                      border-2 border-primary bg-muted
                      hover:bg-muted/80 active:bg-primary active:border-accent
                      transition-all touch-manipulation active:scale-95
                    `}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {isPaused ? (
                      <Play size={24} className="text-primary" />
                    ) : (
                      <Pause size={24} className="text-primary" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => changeDirection({ x: 1, y: 0 })}
                    disabled={gameOver || isPaused}
                    className={`
                      w-20 h-20 flex items-center justify-center
                      border-2 border-primary bg-muted
                      hover:bg-muted/80 active:bg-primary active:border-accent
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all touch-manipulation
                      ${gameOver || isPaused ? '' : 'active:scale-95'}
                    `}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <ArrowRight size={28} className="text-primary" />
                  </button>
                </div>
                
                {/* Down Button */}
                <button
                  onClick={() => changeDirection({ x: 0, y: 1 })}
                  disabled={gameOver || isPaused}
                  className={`
                    w-20 h-20 flex items-center justify-center
                    border-2 border-primary bg-muted
                    hover:bg-muted/80 active:bg-primary active:border-accent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all touch-manipulation
                    ${gameOver || isPaused ? '' : 'active:scale-95'}
                  `}
                  style={{ touchAction: 'manipulation' }}
                >
                  <ArrowDown size={28} className="text-primary" />
                </button>
              </div>
              
              <p className="text-center text-muted-foreground text-[10px] mt-4">
                TAP BUTTONS TO MOVE • TAP PAUSE TO PAUSE
              </p>
            </RetroCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnakeGame;

