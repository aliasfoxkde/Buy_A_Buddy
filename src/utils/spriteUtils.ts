/**
 * Sprite utilities for frame calculation
 */

/**
 * Get frame index from grid position
 */
export function getFrameIndex(col: number, row: number, cols: number = 6): number {
  return row * cols + col;
}

/**
 * Get character frame based on character index
 * Characters are 6x2 grid, each character is 256x512
 */
export function getCharacterFrame(characterIndex: number): number {
  const col = characterIndex % 6;
  const row = Math.floor(characterIndex / 6);
  return getFrameIndex(col, row, 6);
}

/**
 * Get buddy frame based on buddy index
 */
export function getBuddyFrame(buddyIndex: number): number {
  return buddyIndex % 12; // 6x2 = 12 total
}

/**
 * Get enemy frame based on enemy type index
 */
export function getEnemyFrame(enemyType: number): number {
  return enemyType % 24; // 6x4 = 24 total
}

/**
 * Get NPC frame based on NPC type
 */
export function getNPCFrame(npcType: number): number {
  return npcType % 24;
}

/**
 * Get terrain tile frame (0-23 for 6x4 grid)
 */
export function getTileFrame(tileType: number): number {
  return tileType % 24;
}
