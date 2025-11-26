import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Circle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { RetroCard } from '@/components/RetroCard';
import { RetroButton } from '@/components/RetroButton';
import { PlayerNameDialog } from '@/components/PlayerNameDialog';
import { storage } from '@/lib/storage';
import { soundPlayer } from '@/lib/sounds';
import { toast } from 'sonner';

const ROWS = 6;
const COLS = 7;
const WIN_LENGTH = 4;

type Cell = 'X' | 'O' | null;
type Board = Cell[][]; // 2D array [row][col]
type Player = 'X' | 'O';

const ConnectFourGame = () => {
  const navigate = useNavigate();
  
  // Game state
  const [board, setBoard] = useState<Board>(() => 
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | null>(null);
  const [wins, setWins] = useState<{ X: number; O: number }>({ X: 0, O: 0 });
  const [gameOver, setGameOver] = useState(false);
  
  // Player names state
  const [playerNames, setPlayerNames] = useState<{ X: string | null; O: string | null }>({ X: null, O: null });
  const [showPlayerNameDialog, setShowPlayerNameDialog] = useState(false);
  const [currentNameInput, setCurrentNameInput] = useState<'X' | 'O' | null>(null);

  // Get leaderboard to show high score
  const leaderboard = useMemo(() => storage.getOrCreateGameLeaderboard('connectfour'), []);
  const sortedPlayers = useMemo(() => [...leaderboard.players].sort((a, b) => b.score - a.score), [leaderboard.players]);
  const currentHighScore = sortedPlayers[0]?.score || 0;

  // Calculate total session score (X wins + O wins)
  const sessionScore = useMemo(() => wins.X + wins.O, [wins]);

  // Check if player names are set, if not show dialog on mount
  useEffect(() => {
    if (!playerNames.X && !playerNames.O) {
      setShowPlayerNameDialog(true);
      setCurrentNameInput('X');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle player name submit
  const handlePlayerNameSubmit = useCallback((name: string) => {
    if (currentNameInput === 'X') {
      setPlayerNames(prev => ({ ...prev, X: name }));
      setCurrentNameInput('O');
    } else if (currentNameInput === 'O') {
      setPlayerNames(prev => ({ ...prev, O: name }));
      setShowPlayerNameDialog(false);
      setCurrentNameInput(null);
      soundPlayer.playSuccess();
      toast.success('GAME SIAP!');
    }
  }, [currentNameInput]);

  // Handle player name dialog close
  const handlePlayerNameDialogClose = useCallback(() => {
    if (playerNames.X && playerNames.O) {
      setShowPlayerNameDialog(false);
    } else {
      navigate('/play');
    }
  }, [playerNames, navigate]);

  // Find the lowest empty row in a column
  const getLowestEmptyRow = useCallback((boardState: Board, col: number): number | null => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (boardState[row][col] === null) {
        return row;
      }
    }
    return null;
  }, []);

  // Check win condition (4 in a row: horizontal, vertical, diagonal)
  const checkWin = useCallback((boardState: Board, player: Player): { won: boolean; cells?: [number, number][] } => {
    // Check horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col <= COLS - WIN_LENGTH; col++) {
        const cells: [number, number][] = [];
        let count = 0;
        for (let i = 0; i < WIN_LENGTH; i++) {
          if (boardState[row][col + i] === player) {
            count++;
            cells.push([row, col + i]);
          }
        }
        if (count === WIN_LENGTH) {
          return { won: true, cells };
        }
      }
    }

    // Check vertical
    for (let row = 0; row <= ROWS - WIN_LENGTH; row++) {
      for (let col = 0; col < COLS; col++) {
        const cells: [number, number][] = [];
        let count = 0;
        for (let i = 0; i < WIN_LENGTH; i++) {
          if (boardState[row + i][col] === player) {
            count++;
            cells.push([row + i, col]);
          }
        }
        if (count === WIN_LENGTH) {
          return { won: true, cells };
        }
      }
    }

    // Check diagonal (top-left to bottom-right)
    for (let row = 0; row <= ROWS - WIN_LENGTH; row++) {
      for (let col = 0; col <= COLS - WIN_LENGTH; col++) {
        const cells: [number, number][] = [];
        let count = 0;
        for (let i = 0; i < WIN_LENGTH; i++) {
          if (boardState[row + i][col + i] === player) {
            count++;
            cells.push([row + i, col + i]);
          }
        }
        if (count === WIN_LENGTH) {
          return { won: true, cells };
        }
      }
    }

    // Check diagonal (top-right to bottom-left)
    for (let row = 0; row <= ROWS - WIN_LENGTH; row++) {
      for (let col = WIN_LENGTH - 1; col < COLS; col++) {
        const cells: [number, number][] = [];
        let count = 0;
        for (let i = 0; i < WIN_LENGTH; i++) {
          if (boardState[row + i][col - i] === player) {
            count++;
            cells.push([row + i, col - i]);
          }
        }
        if (count === WIN_LENGTH) {
          return { won: true, cells };
        }
      }
    }

    return { won: false };
  }, []);

  // Check if board is full (draw)
  const isBoardFull = useCallback((boardState: Board): boolean => {
    return boardState[0].every(cell => cell !== null);
  }, []);

  // Make a move (drop piece in column)
  const handleColumnClick = useCallback((col: number) => {
    if (gameOver || !playerNames.X || !playerNames.O || showPlayerNameDialog) {
      soundPlayer.playError();
      return;
    }

    setBoard((prevBoard) => {
      const row = getLowestEmptyRow(prevBoard, col);
      
      if (row === null) {
        soundPlayer.playError();
        toast.error('KOLOM PENUH!');
        return prevBoard;
      }

      const newBoard = prevBoard.map((r, rIdx) => 
        r.map((cell, cIdx) => {
          if (rIdx === row && cIdx === col) {
            return currentPlayer;
          }
          return cell;
        })
      );

      soundPlayer.playSelect();

      // Check for win
      const winResult = checkWin(newBoard, currentPlayer);
      if (winResult.won) {
        setWinner(currentPlayer);
        setGameOver(true);
        setWins((prevWins) => ({
          ...prevWins,
          [currentPlayer]: prevWins[currentPlayer] + 1,
        }));
        soundPlayer.playSuccess();
        toast.success(`PEMAIN ${currentPlayer} MENANG!`);
        return newBoard;
      }

      // Check for draw
      if (isBoardFull(newBoard)) {
        setGameOver(true);
        setWinner(null);
        soundPlayer.playError();
        toast.error('SERI!');
        return newBoard;
      }

      // Switch player
      setCurrentPlayer((prev) => (prev === 'X' ? 'O' : 'X'));
      return newBoard;
    });
  }, [gameOver, currentPlayer, getLowestEmptyRow, checkWin, isBoardFull, playerNames, showPlayerNameDialog]);

  // Reset game (clear board, keep wins)
  const resetGame = useCallback((startPlayer?: Player) => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setCurrentPlayer(startPlayer || 'X');
    setWinner(null);
    setGameOver(false);
    soundPlayer.playSelect();
  }, []);

  // Reset everything including wins
  const resetAll = useCallback(() => {
    resetGame();
    setWins({ X: 0, O: 0 });
  }, [resetGame]);

  // Handle session score save (save each player separately)
  const handleSaveSession = useCallback(() => {
    if (sessionScore === 0) {
      toast.error('BELUM ADA SCORE UNTUK DISIMPAN!');
      soundPlayer.playError();
      return;
    }

    if (!playerNames.X || !playerNames.O) {
      toast.error('NAMA PLAYER BELUM DIISI!');
      soundPlayer.playError();
      return;
    }

    // Save each player separately with their individual wins
    if (wins.X > 0) {
      storage.addPlayerToGameLeaderboard('connectfour', playerNames.X, wins.X);
    }
    if (wins.O > 0) {
      storage.addPlayerToGameLeaderboard('connectfour', playerNames.O, wins.O);
    }

    toast.success(`SESSION SCORE TERSIMPAN! ${playerNames.X}: ${wins.X} | ${playerNames.O}: ${wins.O}`);
    setWins({ X: 0, O: 0 });
    resetGame();
  }, [sessionScore, wins, playerNames, resetGame]);

  // Continue playing after win (reset board, keep wins, winner goes first)
  const continueGame = useCallback(() => {
    // Winner goes first in next game, or X if draw
    const nextPlayer = winner || 'X';
    resetGame(nextPlayer);
  }, [resetGame, winner]);

  // Check if column is full
  const isColumnFull = useCallback((col: number): boolean => {
    return board[0][col] !== null;
  }, [board]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 pb-navbar relative scanlines">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="CONNECT FOUR"
          showBack
          action={
            <div className="flex items-center gap-2">
              {sessionScore > 0 && (
                <RetroButton
                  variant="primary"
                  size="sm"
                  onClick={handleSaveSession}
                  className="flex items-center gap-1"
                >
                  <span className="hidden sm:inline">SAVE</span>
                </RetroButton>
              )}
              <RetroButton
                variant="ghost"
                size="sm"
                onClick={resetAll}
                className="flex items-center gap-1"
              >
                <RotateCcw size={14} />
              </RetroButton>
            </div>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <RetroCard className="text-center p-4">
            <div className="text-muted-foreground text-[9px] mb-1">
              {playerNames.X || 'X'}
            </div>
            <div className="text-primary text-lg font-bold">
              {wins.X}
            </div>
            <div className="text-muted-foreground text-[9px] mt-1">WINS</div>
          </RetroCard>
          
          <RetroCard className="text-center p-4">
            <div className="text-muted-foreground text-[9px] mb-1">
              {playerNames.O || 'O'}
            </div>
            <div className="text-secondary text-lg font-bold">
              {wins.O}
            </div>
            <div className="text-muted-foreground text-[9px] mt-1">WINS</div>
          </RetroCard>
        </div>

        {/* Turn Indicator */}
        <RetroCard className="mb-6 p-4 text-center">
          <div className="text-sm text-muted-foreground mb-1">
            GILIRAN
          </div>
          <div className={`text-xl font-bold ${currentPlayer === 'X' ? 'text-primary glow-cyan' : 'text-secondary glow-magenta'}`}>
            {currentPlayer === 'X' ? (playerNames.X || 'X') : (playerNames.O || 'O')}
          </div>
        </RetroCard>

        {/* Game Board */}
        <RetroCard className="p-4 mb-6">
          <div className="max-w-md mx-auto">
            {/* Column buttons (drop pieces) */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {Array.from({ length: COLS }).map((_, col) => (
                <button
                  key={col}
                  onClick={() => handleColumnClick(col)}
                  disabled={gameOver || isColumnFull(col) || !playerNames.X || !playerNames.O || showPlayerNameDialog}
                  className={`
                    aspect-square flex items-center justify-center
                    border-2 border-border
                    transition-all duration-200
                    ${isColumnFull(col) || gameOver || !playerNames.X || !playerNames.O || showPlayerNameDialog
                      ? 'bg-card cursor-not-allowed opacity-50'
                      : 'bg-muted hover:bg-muted/80 hover:border-primary hover:scale-105 cursor-pointer'
                    }
                    active:scale-95
                  `}
                >
                  <span className="text-xs text-muted-foreground">⬇</span>
                </button>
              ))}
            </div>

            {/* Board grid */}
            <div className="grid grid-cols-7 gap-1">
              {board.map((row, rowIdx) => 
                row.map((cell, colIdx) => (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={`
                      aspect-square flex items-center justify-center
                      border-2 border-border
                      bg-card
                      transition-all duration-200
                    `}
                  >
                    {cell && (
                      <div
                        className={`
                          w-full h-full rounded-full
                          flex items-center justify-center
                          ${cell === 'X' ? 'bg-primary' : 'bg-secondary'}
                          animate-pixel-slide-in
                        `}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </RetroCard>

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
            <RetroCard className="mx-auto max-w-md w-full">
              <div className="text-center p-8">
                <Circle className={`mx-auto mb-4 ${winner === 'X' ? 'text-primary' : winner === 'O' ? 'text-secondary' : 'text-muted-foreground'}`} size={64} />
                {winner ? (
                  <>
                    <h2 className={`text-xl uppercase mb-4 ${winner === 'X' ? 'text-primary' : 'text-secondary'}`}>
                      {winner === 'X' ? (playerNames.X || 'X') : (playerNames.O || 'O')} MENANG!
                    </h2>
                    <p className="text-foreground text-sm mb-2">
                      GAME WIN: {winner} ({wins[winner]} win{wins[winner] > 1 ? 's' : ''})
                    </p>
                  </>
                ) : (
                  <h2 className="text-xl uppercase mb-4 text-muted-foreground">
                    SERI!
                  </h2>
                )}
                <p className="text-foreground text-sm mb-4">
                  SESSION SCORE: {sessionScore} win{sessionScore > 1 ? 's' : ''}
                </p>
                {sessionScore > currentHighScore && (
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
                        navigate('/leaderboard/game_connectfour');
                      }}
                    >
                      LEADERBOARD
                    </RetroButton>
                  </div>
                  <RetroButton variant="primary" onClick={continueGame}>
                    CONTINUE
                  </RetroButton>
                </div>
              </div>
            </RetroCard>
          </div>
        )}


        {/* Player Name Dialog */}
        {currentNameInput && (
          <PlayerNameDialog
            open={showPlayerNameDialog}
            playerLabel={currentNameInput}
            onClose={handlePlayerNameDialogClose}
            onSubmit={handlePlayerNameSubmit}
            existingNames={currentNameInput === 'O' && playerNames.X ? [playerNames.X] : []}
          />
        )}
      </div>
    </div>
  );
};

export default ConnectFourGame;

