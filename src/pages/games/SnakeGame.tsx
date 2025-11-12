import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Pause, Play, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { RetroCard } from '@/components/RetroCard';
import { RetroButton } from '@/components/RetroButton';
import { soundPlayer } from '@/lib/sounds';
import { useIsMobile } from '@/hooks/use-mobile';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const INITIAL_SPEED = 150;

type Position = { x: number; y: number };

const SnakeGame = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const directionRef = useRef<Position>(INITIAL_DIRECTION);
  const gameLoopRef = useRef<number | null>(null);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('snake_high_score');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  // Generate random food position
  const generateFood = useCallback((snakeBody: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y)
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

        // Check wall collision
        if (
          head.x < 0 ||
          head.x >= GRID_SIZE ||
          head.y < 0 ||
          head.y >= GRID_SIZE
        ) {
          setGameOver(true);
          soundPlayer.playError();
          return prevSnake;
        }

        // Check self collision
        if (
          newSnake.some(
            (segment) => segment.x === head.x && segment.y === head.y
          )
        ) {
          setGameOver(true);
          soundPlayer.playError();
          return prevSnake;
        }

        newSnake.unshift(head);

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setScore((prev) => {
            const newScore = prev + 10;
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('snake_high_score', newScore.toString());
            }
            return newScore;
          });
          setFood(generateFood(newSnake));
          soundPlayer.playCoin();
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    gameLoopRef.current = window.setInterval(moveSnake, INITIAL_SPEED);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [food, gameOver, isPaused, generateFood, highScore]);

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
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE));
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    soundPlayer.playSelect();
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

        {/* Score Display */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <RetroCard className="text-center p-3">
            <div className="text-accent text-lg font-bold">{score}</div>
            <div className="text-muted-foreground text-[9px] mt-1">SCORE</div>
          </RetroCard>
          <RetroCard className="text-center p-3">
            <div className="text-primary text-lg font-bold">{highScore}</div>
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
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`absolute ${
                  index === 0 ? 'bg-accent' : 'bg-primary'
                }`}
                style={{
                  left: `${segment.x * 16}px`,
                  top: `${segment.y * 16}px`,
                  width: '14px',
                  height: '14px',
                  border: '1px solid hsl(var(--background))',
                }}
              />
            ))}

            {/* Food */}
            <div
              className="absolute bg-secondary"
              style={{
                left: `${food.x * 16}px`,
                top: `${food.y * 16}px`,
                width: '14px',
                height: '14px',
                border: '1px solid hsl(var(--background))',
                animation: 'pulse 0.5s infinite',
              }}
            />
          </div>
        </RetroCard>

        {/* Game Over Overlay */}
        {gameOver && (
          <RetroCard className="absolute inset-0 flex items-center justify-center bg-background/90 z-50">
            <div className="text-center p-8">
              <h2 className="text-destructive text-xl uppercase mb-4">
                GAME OVER
              </h2>
              <p className="text-foreground text-sm mb-2">SCORE: {score}</p>
              <p className="text-muted-foreground text-xs mb-6">
                HIGH SCORE: {highScore}
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
              </div>
            </div>
          </RetroCard>
        )}

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

