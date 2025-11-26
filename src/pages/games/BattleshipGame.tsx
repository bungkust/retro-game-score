import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Anchor } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { RetroCard } from '@/components/RetroCard';
import { RetroButton } from '@/components/RetroButton';
import { PlayerNameDialog } from '@/components/PlayerNameDialog';
import { storage } from '@/lib/storage';
import { soundPlayer } from '@/lib/sounds';
import { toast } from 'sonner';

const GRID_SIZE = 10;
const SHIPS = [
  { id: 1, name: 'Carrier', size: 5 },
  { id: 2, name: 'Battleship', size: 4 },
  { id: 3, name: 'Cruiser', size: 3 },
  { id: 4, name: 'Submarine', size: 3 },
  { id: 5, name: 'Destroyer', size: 2 },
];

type CellState = 'empty' | 'ship' | 'hit' | 'miss';
type Cell = {
  state: CellState;
  shipId?: number;
};
type Board = Cell[][];
type GamePhase = 'setup' | 'playing' | 'gameOver';

interface Ship {
  id: number;
  name: string;
  size: number;
  positions: [number, number][];
  sunk: boolean;
}

const BattleshipGame = () => {
  const navigate = useNavigate();
  
  // Game state
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [boardX, setBoardX] = useState<Board>(() => 
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => ({ state: 'empty' as CellState })))
  );
  const [boardO, setBoardO] = useState<Board>(() => 
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => ({ state: 'empty' as CellState })))
  );
  const [shipsX, setShipsX] = useState<Ship[]>([]);
  const [shipsO, setShipsO] = useState<Ship[]>([]);
  const [selectedShip, setSelectedShip] = useState<number | null>(null);
  const [shipOrientation, setShipOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [winner, setWinner] = useState<'X' | 'O' | null>(null);
  const [wins, setWins] = useState<{ X: number; O: number }>({ X: 0, O: 0 });
  const [gameOver, setGameOver] = useState(false);
  
  // Player names state
  const [playerNames, setPlayerNames] = useState<{ X: string | null; O: string | null }>({ X: null, O: null });
  const [showPlayerNameDialog, setShowPlayerNameDialog] = useState(false);
  const [currentNameInput, setCurrentNameInput] = useState<'X' | 'O' | null>(null);
  const [setupPlayer, setSetupPlayer] = useState<'X' | 'O'>('X');

  // Get leaderboard
  const leaderboard = useMemo(() => storage.getOrCreateGameLeaderboard('battleship'), []);
  const sortedPlayers = useMemo(() => [...leaderboard.players].sort((a, b) => b.score - a.score), [leaderboard.players]);
  const currentHighScore = sortedPlayers[0]?.score || 0;

  const sessionScore = useMemo(() => wins.X + wins.O, [wins]);

  // Initialize player names dialog
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

  // Get current player's board and ships
  const getCurrentBoard = useCallback((): Board => {
    return currentPlayer === 'X' ? boardX : boardO;
  }, [currentPlayer, boardX, boardO]);

  const getCurrentShips = useCallback((): Ship[] => {
    return currentPlayer === 'X' ? shipsX : shipsO;
  }, [currentPlayer, shipsX, shipsO]);

  const getOpponentBoard = useCallback((): Board => {
    return currentPlayer === 'X' ? boardO : boardX;
  }, [currentPlayer, boardX, boardO]);

  // Check if ship can be placed at position
  const canPlaceShip = useCallback((
    board: Board, 
    shipSize: number, 
    row: number, 
    col: number, 
    orientation: 'horizontal' | 'vertical'
  ): boolean => {
    // Check bounds
    if (orientation === 'horizontal') {
      if (col + shipSize > GRID_SIZE) return false;
    } else {
      if (row + shipSize > GRID_SIZE) return false;
    }

    // Check if cells are empty
    for (let i = 0; i < shipSize; i++) {
      const checkRow = orientation === 'horizontal' ? row : row + i;
      const checkCol = orientation === 'horizontal' ? col + i : col;
      
      if (board[checkRow][checkCol].state !== 'empty') {
        return false;
      }
    }

    return true;
  }, []);

  // Place ship on board
  const placeShip = useCallback((
    board: Board,
    shipId: number,
    shipSize: number,
    row: number,
    col: number,
    orientation: 'horizontal' | 'vertical'
  ): Board => {
    const newBoard = board.map(r => r.map(c => ({ ...c })));
    const positions: [number, number][] = [];

    for (let i = 0; i < shipSize; i++) {
      const placeRow = orientation === 'horizontal' ? row : row + i;
      const placeCol = orientation === 'horizontal' ? col + i : col;
      
      newBoard[placeRow][placeCol] = {
        state: 'ship',
        shipId,
      };
      positions.push([placeRow, placeCol]);
    }

    return newBoard;
  }, []);

  // Handle cell click during setup
  const handleSetupCellClick = useCallback((row: number, col: number) => {
    if (phase !== 'setup' || !selectedShip || !playerNames.X || !playerNames.O) return;

    const board = setupPlayer === 'X' ? boardX : boardO;
    const shipConfig = SHIPS.find(s => s.id === selectedShip);
    
    if (!shipConfig) return;

    if (!canPlaceShip(board, shipConfig.size, row, col, shipOrientation)) {
      soundPlayer.playError();
      toast.error('TIDAK BISA MENARUH KAPAL DI SINI!');
      return;
    }

    const newBoard = placeShip(board, shipConfig.id, shipConfig.size, row, col, shipOrientation);
    
    if (setupPlayer === 'X') {
      setBoardX(newBoard);
      setShipsX(prev => [...prev, {
        id: shipConfig.id,
        name: shipConfig.name,
        size: shipConfig.size,
        positions: shipOrientation === 'horizontal'
          ? Array.from({ length: shipConfig.size }, (_, i) => [row, col + i] as [number, number])
          : Array.from({ length: shipConfig.size }, (_, i) => [row + i, col] as [number, number]),
        sunk: false,
      }]);
    } else {
      setBoardO(newBoard);
      setShipsO(prev => [...prev, {
        id: shipConfig.id,
        name: shipConfig.name,
        size: shipConfig.size,
        positions: shipOrientation === 'horizontal'
          ? Array.from({ length: shipConfig.size }, (_, i) => [row, col + i] as [number, number])
          : Array.from({ length: shipConfig.size }, (_, i) => [row + i, col] as [number, number]),
        sunk: false,
      }]);
    }

    soundPlayer.playSelect();
    
    // Check if all ships placed for current player
    const ships = setupPlayer === 'X' ? shipsX : shipsO;
    if (ships.length + 1 >= SHIPS.length) {
      if (setupPlayer === 'X') {
        setSetupPlayer('O');
        setSelectedShip(null);
        toast.success(`${playerNames.O || 'Player O'} - TEMPATKAN KAPAL ANDA!`);
      } else {
        setPhase('playing');
        setCurrentPlayer('X');
        toast.success('GAME DIMULAI!');
      }
    } else {
      // Move to next ship
      const nextShip = SHIPS.find(s => !ships.find(placed => placed.id === s.id));
      if (nextShip) {
        setSelectedShip(nextShip.id);
      }
    }
  }, [phase, selectedShip, shipOrientation, setupPlayer, boardX, boardO, shipsX, shipsO, canPlaceShip, placeShip, playerNames]);

  // Handle cell click during gameplay (shooting)
  const handleShootCell = useCallback((row: number, col: number) => {
    if (phase !== 'playing' || gameOver || !playerNames.X || !playerNames.O || showPlayerNameDialog) return;

    const opponentBoard = getOpponentBoard();
    const cell = opponentBoard[row][col];

    // Already shot here
    if (cell.state === 'hit' || cell.state === 'miss') {
      soundPlayer.playError();
      toast.error('SUDAH DITEMBAK!');
      return;
    }

    soundPlayer.playSelect();

    // Hit or miss
    if (cell.state === 'ship') {
      // Hit!
      const newBoard = opponentBoard.map((r, rIdx) =>
        r.map((c, cIdx) => {
          if (rIdx === row && cIdx === col) {
            return { ...c, state: 'hit' as CellState };
          }
          return c;
        })
      );

      // Update board
      if (currentPlayer === 'X') {
        setBoardO(newBoard);
      } else {
        setBoardX(newBoard);
      }

      // Check if ship is sunk and update ships
      const shipId = cell.shipId;
      if (shipId) {
        if (currentPlayer === 'X') {
          setShipsO(prev => {
            const ship = prev.find(s => s.id === shipId);
            if (ship) {
              // Check if all positions are now hit
              const allHit = ship.positions.every(([r, c]) => {
                return (r === row && c === col) || newBoard[r][c].state === 'hit';
              });
              
              if (allHit && !ship.sunk) {
                const updated = prev.map(s => s.id === shipId ? { ...s, sunk: true } : s);
                soundPlayer.playSuccess();
                toast.success(`KAPAL ${ship.name} TENGELAM!`);
                
                // Check win condition
                if (updated.every(s => s.sunk) && updated.length === SHIPS.length) {
                  setTimeout(() => {
                    setWinner('X');
                    setGameOver(true);
                    setPhase('gameOver');
                    setWins(prevWins => ({ ...prevWins, X: prevWins.X + 1 }));
                    soundPlayer.playSuccess();
                    toast.success('PEMAIN X MENANG!');
                  }, 500);
                }
                
                return updated;
              } else if (!allHit) {
                soundPlayer.playCoin();
                toast.success('KENA!');
              }
            }
            return prev;
          });
        } else {
          setShipsX(prev => {
            const ship = prev.find(s => s.id === shipId);
            if (ship) {
              const allHit = ship.positions.every(([r, c]) => {
                return (r === row && c === col) || newBoard[r][c].state === 'hit';
              });
              
              if (allHit && !ship.sunk) {
                const updated = prev.map(s => s.id === shipId ? { ...s, sunk: true } : s);
                soundPlayer.playSuccess();
                toast.success(`KAPAL ${ship.name} TENGELAM!`);
                
                if (updated.every(s => s.sunk) && updated.length === SHIPS.length) {
                  setTimeout(() => {
                    setWinner('O');
                    setGameOver(true);
                    setPhase('gameOver');
                    setWins(prevWins => ({ ...prevWins, O: prevWins.O + 1 }));
                    soundPlayer.playSuccess();
                    toast.success('PEMAIN O MENANG!');
                  }, 500);
                }
                
                return updated;
              } else if (!allHit) {
                soundPlayer.playCoin();
                toast.success('KENA!');
              }
            }
            return prev;
          });
        }
      } else {
        soundPlayer.playCoin();
        toast.success('KENA!');
      }

      // Continue turn on hit
    } else {
      // Miss!
      const newBoard = opponentBoard.map((r, rIdx) =>
        r.map((c, cIdx) => {
          if (rIdx === row && cIdx === col) {
            return { ...c, state: 'miss' as CellState };
          }
          return c;
        })
      );

      if (currentPlayer === 'X') {
        setBoardO(newBoard);
      } else {
        setBoardX(newBoard);
      }

      soundPlayer.playError();
      toast.error('MELESET!');
      
      // Switch player on miss
      setCurrentPlayer(prev => prev === 'X' ? 'O' : 'X');
    }
  }, [phase, currentPlayer, getOpponentBoard, shipsX, shipsO, playerNames]);

  // gameOver state is now managed separately

  // Reset game
  const resetGame = useCallback((startPlayer?: 'X' | 'O') => {
    setBoardX(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => ({ state: 'empty' as CellState }))));
    setBoardO(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => ({ state: 'empty' as CellState }))));
    setShipsX([]);
    setShipsO([]);
    setPhase('setup');
    const firstPlayer = startPlayer || 'X';
    setSetupPlayer(firstPlayer);
    setCurrentPlayer(firstPlayer);
    setSelectedShip(SHIPS[0].id);
    setWinner(null);
    setGameOver(false);
    soundPlayer.playSelect();
  }, []);

  // Reset all
  const resetAll = useCallback(() => {
    resetGame();
    setWins({ X: 0, O: 0 });
  }, [resetGame]);

  // Initialize selected ship
  useEffect(() => {
    if (phase === 'setup' && !selectedShip && shipsX.length < SHIPS.length) {
      const nextShip = SHIPS.find(s => !shipsX.find(placed => placed.id === s.id));
      if (nextShip) setSelectedShip(nextShip.id);
    }
  }, [phase, selectedShip, shipsX]);

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
      storage.addPlayerToGameLeaderboard('battleship', playerNames.X, wins.X);
    }
    if (wins.O > 0) {
      storage.addPlayerToGameLeaderboard('battleship', playerNames.O, wins.O);
    }

    toast.success(`SESSION SCORE TERSIMPAN! ${playerNames.X}: ${wins.X} | ${playerNames.O}: ${wins.O}`);
    setWins({ X: 0, O: 0 });
    resetGame();
  }, [sessionScore, wins, playerNames, resetGame]);

  // Continue playing (winner goes first in next game)
  const continueGame = useCallback(() => {
    // Winner goes first in next game, or X if draw
    const nextPlayer = winner || 'X';
    resetGame(nextPlayer);
  }, [resetGame, winner]);

  // Get available ships for setup
  const getAvailableShips = useCallback(() => {
    const ships = setupPlayer === 'X' ? shipsX : shipsO;
    return SHIPS.filter(s => !ships.find(placed => placed.id === s.id));
  }, [setupPlayer, shipsX, shipsO]);

  // Render board cell
  const renderCell = useCallback((cell: Cell, row: number, col: number, isOpponent: boolean) => {
    let content: React.ReactNode = null;
    let bgColor = 'bg-card';
    
    if (cell.state === 'ship' && (!isOpponent || phase === 'setup')) {
      bgColor = 'bg-primary/30';
      content = '🚢';
    } else if (cell.state === 'hit') {
      bgColor = 'bg-destructive';
      content = '💥';
    } else if (cell.state === 'miss') {
      bgColor = 'bg-muted';
      content = '💧';
    }

    const isClickable = phase === 'setup' 
      ? (!isOpponent && selectedShip !== null)
      : (isOpponent && currentPlayer === (isOpponent ? currentPlayer : currentPlayer));

    return (
      <div
        key={`${row}-${col}`}
        onClick={() => {
          if (phase === 'setup' && !isOpponent) {
            handleSetupCellClick(row, col);
          } else if (phase === 'playing' && isOpponent) {
            handleShootCell(row, col);
          }
        }}
        className={`
          aspect-square flex items-center justify-center
          border border-border
          ${bgColor}
          transition-all duration-200
          ${isClickable && !gameOver && playerNames.X && playerNames.O && !showPlayerNameDialog
            ? 'cursor-pointer hover:border-primary hover:scale-105'
            : 'cursor-not-allowed'
          }
          active:scale-95
          text-xs
        `}
      >
        {content}
      </div>
    );
  }, [phase, selectedShip, currentPlayer, gameOver, playerNames, showPlayerNameDialog, handleSetupCellClick, handleShootCell]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 pb-navbar relative scanlines">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="BATTLESHIP"
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

        {/* Phase Indicator */}
        <RetroCard className="mb-6 p-4 text-center">
          {phase === 'setup' ? (
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                {setupPlayer === 'X' ? (playerNames.X || 'X') : (playerNames.O || 'O')} - TEMPATKAN KAPAL
              </div>
              <div className="text-xs text-muted-foreground">
                {getAvailableShips().length} KAPAL TERSISA
              </div>
            </div>
          ) : (
            <div>
              <div className="text-sm text-muted-foreground mb-1">GILIRAN</div>
              <div className={`text-xl font-bold ${currentPlayer === 'X' ? 'text-primary glow-cyan' : 'text-secondary glow-magenta'}`}>
                {currentPlayer === 'X' ? (playerNames.X || 'X') : (playerNames.O || 'O')}
              </div>
            </div>
          )}
        </RetroCard>

        {/* Setup Controls */}
        {phase === 'setup' && (
          <RetroCard className="mb-6 p-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
              {getAvailableShips().map(ship => (
                <RetroButton
                  key={ship.id}
                  variant={selectedShip === ship.id ? 'primary' : 'ghost'}
                  onClick={() => {
                    setSelectedShip(ship.id);
                    soundPlayer.playSelect();
                  }}
                  className="text-xs"
                >
                  {ship.name} ({ship.size})
                </RetroButton>
              ))}
            </div>
            <RetroButton
              variant="ghost"
              onClick={() => {
                setShipOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
                soundPlayer.playSelect();
              }}
              className="w-full"
            >
              ORIENTASI: {shipOrientation === 'horizontal' ? 'HORIZONTAL' : 'VERTIKAL'}
            </RetroButton>
          </RetroCard>
        )}

        {/* Game Boards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Player X Board */}
          <RetroCard className="p-4">
            <h3 className="text-center text-primary mb-4 uppercase text-sm">
              {playerNames.X || 'X'} {phase === 'playing' && currentPlayer === 'X' ? '(SEDANG MAIN)' : ''}
            </h3>
            <div className="grid grid-cols-10 gap-1">
              {boardX.map((row, rowIdx) =>
                row.map((cell, colIdx) => renderCell(cell, rowIdx, colIdx, false))
              )}
            </div>
          </RetroCard>

          {/* Player O Board (Opponent view) */}
          <RetroCard className="p-4">
            <h3 className="text-center text-secondary mb-4 uppercase text-sm">
              {playerNames.O || 'O'} {phase === 'playing' && currentPlayer === 'O' ? '(SEDANG MAIN)' : ''}
            </h3>
            <div className="grid grid-cols-10 gap-1">
              {boardO.map((row, rowIdx) =>
                row.map((cell, colIdx) => renderCell(cell, rowIdx, colIdx, phase === 'playing'))
              )}
            </div>
          </RetroCard>
        </div>

        {/* Game Over Overlay */}
        {gameOver && winner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
            <RetroCard className="mx-auto max-w-md w-full">
              <div className="text-center p-8">
                <Anchor className={`mx-auto mb-4 ${winner === 'X' ? 'text-primary' : 'text-secondary'}`} size={64} />
                <h2 className={`text-xl uppercase mb-4 ${winner === 'X' ? 'text-primary' : 'text-secondary'}`}>
                  {winner === 'X' ? (playerNames.X || 'X') : (playerNames.O || 'O')} MENANG!
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
                        navigate('/leaderboard/game_battleship');
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

export default BattleshipGame;

