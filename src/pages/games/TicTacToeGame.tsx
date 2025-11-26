import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Grid3x3, Save } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { RetroCard } from '@/components/RetroCard';
import { RetroButton } from '@/components/RetroButton';
import { NameInputDialog } from '@/components/NameInputDialog';
import { PlayerNameDialog } from '@/components/PlayerNameDialog';
import { storage } from '@/lib/storage';
import { soundPlayer } from '@/lib/sounds';
import { toast } from 'sonner';

type Cell = 'X' | 'O' | null;
type Board = Cell[]; // 9 cells (3x3 as flat array)
type Player = 'X' | 'O';

const TicTacToeGame = () => {
  const navigate = useNavigate();
  
  // Game state
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [historyX, setHistoryX] = useState<number[]>([]); // Queue of cell indices for X
  const [historyO, setHistoryO] = useState<number[]>([]); // Queue of cell indices for O
  const [winner, setWinner] = useState<Player | null>(null);
  const [wins, setWins] = useState<{ X: number; O: number }>({ X: 0, O: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [winningPlayer, setWinningPlayer] = useState<Player | null>(null);
  
  // Player names state
  const [playerNames, setPlayerNames] = useState<{ X: string | null; O: string | null }>({ X: null, O: null });
  const [showPlayerNameDialog, setShowPlayerNameDialog] = useState(false);
  const [currentNameInput, setCurrentNameInput] = useState<'X' | 'O' | null>(null);

  // Refs to track current state for makeMove
  const boardRef = useRef(board);
  const currentPlayerRef = useRef(currentPlayer);
  const historyXRef = useRef(historyX);
  const historyORef = useRef(historyO);
  const gameOverRef = useRef(gameOver);

  // Sync refs with state
  boardRef.current = board;
  currentPlayerRef.current = currentPlayer;
  historyXRef.current = historyX;
  historyORef.current = historyO;
  gameOverRef.current = gameOver;

  // Get leaderboard to show high score
  const leaderboard = useMemo(() => storage.getOrCreateGameLeaderboard('tictactoe'), []);
  const sortedPlayers = useMemo(() => [...leaderboard.players].sort((a, b) => b.score - a.score), [leaderboard.players]);
  const currentHighScore = sortedPlayers[0]?.score || 0;

  // Calculate total session score (X wins + O wins)
  const sessionScore = useMemo(() => wins.X + wins.O, [wins]);

  // Check if player names are set, if not show dialog on mount
  useEffect(() => {
    // Only check on initial mount
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
      // Continue to O input
    } else if (currentNameInput === 'O') {
      setPlayerNames(prev => ({ ...prev, O: name }));
      setShowPlayerNameDialog(false);
      setCurrentNameInput(null);
      soundPlayer.playSuccess();
      toast.success('GAME SIAP!');
    }
  }, [currentNameInput]);

  // Handle player name dialog close (only allow close if both names are set)
  const handlePlayerNameDialogClose = useCallback(() => {
    if (playerNames.X && playerNames.O) {
      setShowPlayerNameDialog(false);
    } else {
      // If names not complete, navigate back
      navigate('/play');
    }
  }, [playerNames, navigate]);

  // Check win condition (horizontal, vertical, diagonal)
  const checkWin = useCallback((boardState: Board, player: Player): boolean => {
    const winPatterns = [
      [0, 1, 2], // Horizontal row 1
      [3, 4, 5], // Horizontal row 2
      [6, 7, 8], // Horizontal row 3
      [0, 3, 6], // Vertical column 1
      [1, 4, 7], // Vertical column 2
      [2, 5, 8], // Vertical column 3
      [0, 4, 8], // Diagonal top-left to bottom-right
      [2, 4, 6], // Diagonal top-right to bottom-left
    ];

    return winPatterns.some(pattern => 
      pattern.every(index => boardState[index] === player)
    );
  }, []);

  // Make a move (FIFO logic)
  const makeMove = useCallback((index: number) => {
    // Use refs to get current state (avoids stale closures)
    const currentBoard = boardRef.current;
    const player = currentPlayerRef.current;
    const currentHistoryX = historyXRef.current;
    const currentHistoryO = historyORef.current;
    
    // Validation checks
    if (gameOverRef.current) {
      soundPlayer.playError();
      return;
    }

    if (currentBoard[index] !== null) {
      soundPlayer.playError();
      toast.error('CELL SUDAH TERISI!');
      return;
    }

    // Get current player's history
    const currentHistory = player === 'X' ? currentHistoryX : currentHistoryO;
    
    // FIFO Logic: If player already has 3 pieces, check if trying to place on oldest piece cell
    if (currentHistory.length === 3) {
      const oldestIndex = currentHistory[0];
      // Player cannot place new piece on the cell where oldest piece will be removed
      if (index === oldestIndex) {
        soundPlayer.playError();
        toast.error('TIDAK BOLEH DI CELL BIDAK TERTUA!');
        return;
      }
    }

    soundPlayer.playSelect();

    // Create new board state
    const newBoard = [...currentBoard];
    let newHistoryX = [...currentHistoryX];
    let newHistoryO = [...currentHistoryO];
    
    // FIFO Logic: If player already has 3 pieces, remove oldest first
    if (currentHistory.length === 3) {
      // Remove oldest piece (first in queue)
      const oldestIndex = currentHistory[0];
      newBoard[oldestIndex] = null;
      
      // Update history: remove first element
      if (player === 'X') {
        newHistoryX = newHistoryX.slice(1);
      } else {
        newHistoryO = newHistoryO.slice(1);
      }
    }
    
    // Place new piece
    newBoard[index] = player;
    
    // Update history: add new index to end of queue
    if (player === 'X') {
      newHistoryX = [...newHistoryX, index];
    } else {
      newHistoryO = [...newHistoryO, index];
    }
    
    // Update all states
    setBoard(newBoard);
    setHistoryX(newHistoryX);
    setHistoryO(newHistoryO);
    
    // Check for win
    if (checkWin(newBoard, player)) {
      setWinner(player);
      setGameOver(true);
      setWinningPlayer(player);
      setWins((prevWins) => ({
        ...prevWins,
        [player]: prevWins[player] + 1,
      }));
      soundPlayer.playSuccess();
      toast.success(`PEMAIN ${player} MENANG!`);
      // Note: No longer showing name input after each win - score accumulates per session
    } else {
      // Switch player if no win
      setCurrentPlayer((prev) => (prev === 'X' ? 'O' : 'X'));
    }
  }, [checkWin]);

  // Reset game (clear board and history, keep wins)
  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setHistoryX([]);
    setHistoryO([]);
    setWinner(null);
    setGameOver(false);
    setShowNameInput(false);
    setWinningPlayer(null);
    soundPlayer.playSelect();
  }, []);

  // Reset everything including wins (but keep player names)
  const resetAll = useCallback(() => {
    resetGame();
    setWins({ X: 0, O: 0 });
  }, [resetGame]);

  // Handle session score save (save accumulated wins for the session)
  const handleSaveSession = useCallback(() => {
    if (sessionScore === 0) {
      toast.error('BELUM ADA SCORE UNTUK DISIMPAN!');
      soundPlayer.playError();
      return;
    }
    setShowNameInput(true);
  }, [sessionScore]);

  // Handle name input submit (save total session score)
  const handleNameSubmit = useCallback((name: string) => {
    // Save with combined player names format
    const sessionName = playerNames.X && playerNames.O 
      ? `${playerNames.X} vs ${playerNames.O}`
      : name;
    storage.addPlayerToGameLeaderboard('tictactoe', sessionName, sessionScore);
    toast.success(`SESSION SCORE TERSIMPAN! ${sessionScore} WIN${sessionScore > 1 ? 'S' : ''}`);
    setShowNameInput(false);
    // Reset session after saving
    setWins({ X: 0, O: 0 });
    resetGame();
  }, [sessionScore, resetGame, playerNames]);

  // Handle name input cancel
  const handleNameCancel = useCallback(() => {
    setShowNameInput(false);
  }, []);

  // Continue playing after win (reset board, keep wins)
  const continueGame = useCallback(() => {
    resetGame();
  }, [resetGame]);

  // Get the oldest piece index for current player (for visual indicator)
  const getOldestPieceIndex = useCallback((player: Player): number | null => {
    const history = player === 'X' ? historyX : historyO;
    return history.length === 3 ? history[0] : null;
  }, [historyX, historyO]);

  // Check if cell is the oldest piece (will be removed on next move)
  const isOldestPiece = useCallback((index: number, player: Player): boolean => {
    const oldestIndex = getOldestPieceIndex(player);
    return oldestIndex === index;
  }, [getOldestPieceIndex]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 pb-navbar relative scanlines">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="INFINITE TIC TAC TOE"
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
                  <Save size={14} />
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
          {!gameOver && (
            <div className="text-xs text-muted-foreground mt-2">
              {currentPlayer === 'X' ? historyX.length : historyO.length} / 3 BIDAK
            </div>
          )}
        </RetroCard>

        {/* Game Board */}
        <RetroCard className="p-4 mb-6">
          <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
            {board.map((cell, index) => {
              const cellPlayer = cell;
              const isOldestX = cellPlayer === 'X' && isOldestPiece(index, 'X');
              const isOldestO = cellPlayer === 'O' && isOldestPiece(index, 'O');
              const isOldest = isOldestX || isOldestO;
              
              return (
                <button
                  key={index}
                  onClick={() => makeMove(index)}
                  disabled={gameOver || cell !== null || showPlayerNameDialog || !playerNames.X || !playerNames.O}
                  className={`
                    aspect-square flex items-center justify-center
                    border-2 border-border
                    transition-all duration-200
                    text-4xl sm:text-5xl font-bold
                    ${cell === 'X' ? 'text-primary' : ''}
                    ${cell === 'O' ? 'text-secondary' : ''}
                    ${cell === null && !showPlayerNameDialog && playerNames.X && playerNames.O ? 'bg-muted hover:bg-muted/80 hover:border-primary hover:scale-105 cursor-pointer' : 'bg-card cursor-not-allowed'}
                    active:scale-95
                  `}
                >
                  {cell && (
                    <span className={isOldest ? 'opacity-50 animate-blink' : ''}>
                      {cell}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </RetroCard>

        {/* Game Over Overlay */}
        {gameOver && !showNameInput && winner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
            <RetroCard className="mx-auto max-w-md w-full">
              <div className="text-center p-8">
                <Grid3x3 className={`mx-auto mb-4 ${winner === 'X' ? 'text-primary' : 'text-secondary'}`} size={64} />
                <h2 className={`text-xl uppercase mb-4 ${winner === 'X' ? 'text-primary' : 'text-secondary'}`}>
                  PEMAIN {winner} MENANG!
                </h2>
                <p className="text-foreground text-sm mb-2">
                  GAME WIN: {winner} ({wins[winner]} win{wins[winner] > 1 ? 's' : ''})
                </p>
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
                        navigate('/leaderboard/game_tictactoe');
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

        {/* Name Input Dialog */}
        <NameInputDialog
          open={showNameInput}
          onClose={handleNameCancel}
          onSubmit={handleNameSubmit}
          title="SAVE SESSION SCORE"
          score={sessionScore}
        />

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

export default TicTacToeGame;
