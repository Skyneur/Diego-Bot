import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export type GameType = 'valorant' | 'lol';

export interface PlayerGameStats {
  wins: number;
  losses: number;
  skillRating: number;
}

export interface PlayerStats {
  userId: string;
  displayName: string;
  games: {
    valorant: PlayerGameStats;
    lol: PlayerGameStats;
  };
}

const statsFilePath = path.resolve(process.cwd(), 'src/data/playerStats.json');

export class PlayerStatsManager {
  private stats: Record<string, PlayerStats> = {};

  constructor() {
    this.loadStats();
  }

  private loadStats(): void {
    try {
      if (fs.existsSync(statsFilePath)) {
        const data = fs.readFileSync(statsFilePath, 'utf8');
        this.stats = JSON.parse(data);
      } else {
        this.stats = {};
        this.saveStats();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      this.stats = {};
    }
  }

  private saveStats(): void {
    try {
      const dirPath = path.dirname(statsFilePath);
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      fs.writeFileSync(statsFilePath, JSON.stringify(this.stats, null, 2), 'utf8');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des statistiques:', error);
    }
  }

  public getPlayerStats(userId: string): PlayerStats | null {
    return this.stats[userId] || null;
  }

  public getAllPlayers(): PlayerStats[] {
    return Object.values(this.stats);
  }

  public upsertPlayer(userId: string, displayName: string): PlayerStats {
    if (!this.stats[userId]) {
      this.stats[userId] = {
        userId,
        displayName,
        games: {
          valorant: { wins: 0, losses: 0, skillRating: 0 },
          lol: { wins: 0, losses: 0, skillRating: 0 }
        }
      };
    } else {
      this.stats[userId].displayName = displayName;
    }
    
    this.saveStats();
    return this.stats[userId];
  }

  public addWin(userId: string, displayName: string, gameType: GameType): void {
    const player = this.upsertPlayer(userId, displayName);
    player.games[gameType].wins++;
    
    player.games[gameType].skillRating += 25;
    
    this.saveStats();
  }

  public addLoss(userId: string, displayName: string, gameType: GameType): void {
    const player = this.upsertPlayer(userId, displayName);
    player.games[gameType].losses++;
    
    player.games[gameType].skillRating -= 20;
    
    this.saveStats();
  }

  public resetPlayerStats(userId: string, gameType?: GameType): boolean {
    if (this.stats[userId]) {
      if (gameType) {
        this.stats[userId].games[gameType] = { wins: 0, losses: 0, skillRating: 0 };
      } else {
        this.stats[userId].games.valorant = { wins: 0, losses: 0, skillRating: 0 };
        this.stats[userId].games.lol = { wins: 0, losses: 0, skillRating: 0 };
      }
      this.saveStats();
      return true;
    }
    return false;
  }

  public getPlayerRating(userId: string, gameType: GameType): number {
    const player = this.getPlayerStats(userId);
    if (!player) return 0;
    
    return player.games[gameType].skillRating;
  }

  public getLeaderboard(gameType: GameType, limit: number = 10): PlayerStats[] {
    return Object.values(this.stats)
      .filter(player => player.games[gameType].wins + player.games[gameType].losses > 0)
      .sort((a, b) => b.games[gameType].skillRating - a.games[gameType].skillRating)
      .slice(0, limit);
  }
}

export const statsManager = new PlayerStatsManager();