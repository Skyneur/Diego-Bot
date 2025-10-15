import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { statsManager } from '@src/utils/stats/playerStats';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/player-stats', (_req: Request, res: Response) => {
  try {
    const data = statsManager.getAllPlayers();
    // Return as a map keyed by userId to keep compatibility with the original JSON shape
    const map: Record<string, any> = {};
    for (const p of data) map[p.userId] = p;
    res.json(map);
  } catch (err) {
    console.error('Failed to read player stats:', err);
    res.status(500).json({ error: 'Failed to read player stats' });
  }
});

app.get('/api/player-stats/:id', (req: Request, res: Response) => {
  try {
    const item = statsManager.getPlayerStats(req.params.id);
    if (!item) return res.status(404).json({ error: 'Player not found' });
    res.json(item);
  } catch (err) {
    console.error('Failed to read player stats:', err);
    res.status(500).json({ error: 'Failed to read player stats' });
  }
});

export function startApi(port?: number) {
  const PORT = port ?? (process.env.PORT ? Number(process.env.PORT) : 3000);
  return new Promise<void>((resolve) => {
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
      resolve();
    });
  });
}

export default app;
