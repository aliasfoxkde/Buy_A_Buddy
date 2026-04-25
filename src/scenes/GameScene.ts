/**
 * Game Scene - Redirects to WorldScene
 * This file is kept for backwards compatibility
 */

import { WorldScene } from './WorldScene';

// Re-export WorldScene as GameScene for compatibility
export class GameScene extends WorldScene {
  constructor() {
    super();
  }
}
