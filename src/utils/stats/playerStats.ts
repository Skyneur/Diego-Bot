import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Définition des types
export type GameType = 'valorant' | 'lol';

export interface PlayerGameStats {
  wins: number;
  losses: number;
  skillRating: number; // Score calculé pour l'équilibrage
}

export interface PlayerStats {
  userId: string; // ID Discord
  displayName: string; // Nom d'affichage (tag Discord ou surnom)
  games: {
    valorant: PlayerGameStats;
    lol: PlayerGameStats;
  };
}

// Chemin vers le fichier de données
const statsFilePath = path.resolve(process.cwd(), 'src/data/playerStats.json');

// Classe pour gérer les statistiques des joueurs
export class PlayerStatsManager {
  private stats: Record<string, PlayerStats> = {};

  constructor() {
    this.loadStats();
  }

  // Charger les statistiques depuis le fichier
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

  // Sauvegarder les statistiques dans le fichier
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

  // Obtenir les statistiques d'un joueur
  public getPlayerStats(userId: string): PlayerStats | null {
    return this.stats[userId] || null;
  }

  // Obtenir tous les joueurs
  public getAllPlayers(): PlayerStats[] {
    return Object.values(this.stats);
  }

  // Créer ou mettre à jour un joueur
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
      // Mettre à jour le nom d'affichage
      this.stats[userId].displayName = displayName;
    }
    
    this.saveStats();
    return this.stats[userId];
  }

  // Ajouter une victoire
  public addWin(userId: string, displayName: string, gameType: GameType): void {
    const player = this.upsertPlayer(userId, displayName);
    player.games[gameType].wins++;
    
    // Mise à jour du skillRating (formule simplifiée)
    player.games[gameType].skillRating += 25;
    
    this.saveStats();
  }

  // Ajouter une défaite
  public addLoss(userId: string, displayName: string, gameType: GameType): void {
    const player = this.upsertPlayer(userId, displayName);
    player.games[gameType].losses++;
    
    // Mise à jour du skillRating (formule simplifiée) - permet les valeurs négatives
    player.games[gameType].skillRating -= 20;
    
    this.saveStats();
  }

  // Réinitialiser les statistiques d'un joueur
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

  // Calculer le score d'équilibrage pour un joueur
  public getPlayerRating(userId: string, gameType: GameType): number {
    const player = this.getPlayerStats(userId);
    if (!player) return 0; // Valeur par défaut
    
    return player.games[gameType].skillRating;
  }

  // Récupérer le classement des joueurs
  public getLeaderboard(gameType: GameType, limit: number = 10): PlayerStats[] {
    return Object.values(this.stats)
      .filter(player => player.games[gameType].wins + player.games[gameType].losses > 0)
      .sort((a, b) => b.games[gameType].skillRating - a.games[gameType].skillRating)
      .slice(0, limit);
  }
}

// Exporter une instance unique
export const statsManager = new PlayerStatsManager();