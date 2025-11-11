import { Leaderboard } from './types';

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
  }
};
