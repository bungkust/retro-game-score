import { Leaderboard, Player } from './types';

const STORAGE_KEY = 'universal_leaderboards';

export const storage = {
  getLeaderboards(): Leaderboard[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLeaderboards(leaderboards: Leaderboard[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboards));
  },

  getLeaderboard(id: string): Leaderboard | undefined {
    const leaderboards = this.getLeaderboards();
    return leaderboards.find(lb => lb.id === id);
  },

  addLeaderboard(leaderboard: Leaderboard): void {
    const leaderboards = this.getLeaderboards();
    leaderboards.push(leaderboard);
    this.saveLeaderboards(leaderboards);
  },

  updateLeaderboard(id: string, updates: Partial<Leaderboard>): void {
    const leaderboards = this.getLeaderboards();
    const index = leaderboards.findIndex(lb => lb.id === id);
    if (index !== -1) {
      leaderboards[index] = { ...leaderboards[index], ...updates, updatedAt: Date.now() };
      this.saveLeaderboards(leaderboards);
    }
  },

  deleteLeaderboard(id: string): void {
    const leaderboards = this.getLeaderboards();
    const filtered = leaderboards.filter(lb => lb.id !== id);
    this.saveLeaderboards(filtered);
  },

  // Get or create game leaderboard (for Snake and Memory games)
  getOrCreateGameLeaderboard(gameName: string): Leaderboard {
    const leaderboards = this.getLeaderboards();
    const gameId = `game_${gameName.toLowerCase()}`;
    let leaderboard = leaderboards.find(lb => lb.id === gameId);
    
    if (!leaderboard) {
      leaderboard = {
        id: gameId,
        name: `${gameName.toUpperCase()} LEADERBOARD`,
        description: `High scores for ${gameName} game`,
        scoreMode: 'total_points',
        sortOrder: 'highest',
        players: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      // Add to leaderboards
      leaderboards.push(leaderboard);
      this.saveLeaderboards(leaderboards);
    }
    
    return leaderboard;
  },

  // Add player to game leaderboard
  addPlayerToGameLeaderboard(gameName: string, playerName: string, score: number, avatar?: string): void {
    const leaderboard = this.getOrCreateGameLeaderboard(gameName);
    const AVATARS = ['👑', '👻', '🚀', '⚔️', '⭐', '❤️', '💎', '🛡️', '🎮', '🏆', '🎯', '🎨', '🎪', '🎭', '🎸', '🎺'];
    const randomAvatar = avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)];
    
    // Check if player already exists (by name, case-insensitive)
    const existingPlayerIndex = leaderboard.players.findIndex(
      p => p.name.toUpperCase() === playerName.toUpperCase()
    );
    
    if (existingPlayerIndex !== -1) {
      // Update existing player if new score is higher
      const existingPlayer = leaderboard.players[existingPlayerIndex];
      if (score > existingPlayer.score) {
        leaderboard.players[existingPlayerIndex] = {
          ...existingPlayer,
          score,
        };
      }
    } else {
      // Add new player
      const newPlayer: Player = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: playerName.toUpperCase(),
        avatar: randomAvatar,
        score,
      };
      leaderboard.players.push(newPlayer);
    }
    
    // Sort players by score (highest first)
    leaderboard.players.sort((a, b) => b.score - a.score);
    
    // Keep only top 100 players
    if (leaderboard.players.length > 100) {
      leaderboard.players = leaderboard.players.slice(0, 100);
    }
    
    this.updateLeaderboard(leaderboard.id, { 
      players: leaderboard.players,
      updatedAt: Date.now()
    });
  }
};
