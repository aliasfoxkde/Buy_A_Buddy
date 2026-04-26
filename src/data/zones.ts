/**
 * Zone Data - Zone configurations for world progression
 */

export interface ZoneConfig {
  id: string;
  name: string;
  description: string;
  enemyTypes: string[]; // Enemy IDs that spawn here
  bossEnemy?: string; // Boss enemy ID
  levelRange: [number, number]; // Min/max player level
  tileSet: string; // Tile spritesheet to use
  backgroundColor: string; // Camera background color
  exitPosition?: { x: number; y: number }; // Where exit portal appears
}

export const ZONES: Record<string, ZoneConfig> = {
  forest: {
    id: 'forest',
    name: 'Forest of Beginnings',
    description: 'A peaceful forest where adventurers start their journey.',
    enemyTypes: ['slime', 'goblin', 'wolf', 'bat', 'snake', 'spider'],
    bossEnemy: 'slime_boss',
    levelRange: [1, 5],
    tileSet: 'tiles_ground',
    backgroundColor: '#2d5a27',
    exitPosition: { x: 2300, y: 400 }
  },
  mountains: {
    id: 'mountains',
    name: 'Crumbling Mountains',
    description: 'Treacherous mountains filled with dangerous creatures.',
    enemyTypes: ['wolf', 'goblin_archer', 'orc', 'hawk', 'goblin_elite', 'spider'],
    bossEnemy: 'wolf_alpha',
    levelRange: [5, 10],
    tileSet: 'tiles_ground',
    backgroundColor: '#4a4a5a',
    exitPosition: { x: 2400, y: 400 }
  },
  crypt: {
    id: 'crypt',
    name: 'Ancient Crypt',
    description: 'A dark crypt filled with undead horrors.',
    enemyTypes: ['skeleton', 'skeleton_elite', 'snake', 'bat', 'goblin_archer'],
    bossEnemy: 'goblin_boss',
    levelRange: [8, 15],
    tileSet: 'tiles_ground',
    backgroundColor: '#1a1a2a'
  },
  dungeon: {
    id: 'dungeon',
    name: 'Lost Dungeon',
    description: 'A forgotten dungeon with riches and dangers.',
    enemyTypes: ['orc', 'troll', 'spider', 'goblin_elite', 'skeleton_elite'],
    bossEnemy: 'troll',
    levelRange: [10, 20],
    tileSet: 'tiles_walls',
    backgroundColor: '#0a0a15'
  }
};

export function getZone(id: string): ZoneConfig | undefined {
  return ZONES[id];
}

export function getZoneForLevel(level: number): ZoneConfig {
  // Return zone appropriate for player level
  for (const zone of Object.values(ZONES)) {
    if (level >= zone.levelRange[0] && level <= zone.levelRange[1]) {
      return zone;
    }
  }
  return ZONES.forest; // Default
}

export function getAllZones(): ZoneConfig[] {
  return Object.values(ZONES);
}