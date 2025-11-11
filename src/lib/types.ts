export type ScoreMode = 'win_count' | 'total_points';
export type SortOrder = 'highest' | 'lowest';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
}

export interface Leaderboard {
  id: string;
  name: string;
  description?: string;
  scoreMode: ScoreMode;
  sortOrder: SortOrder;
  players: Player[];
  createdAt: number;
  updatedAt: number;
}
