// ==========================================
// API DOCUMENTATION - Swagger/OpenAPI specs
// ==========================================

export const apiInfo = {
  title: 'Buy a Buddy API',
  version: '1.0.0',
  description: `
API for the Buy a Buddy idle tycoon game.

## Features
- Get game state and statistics
- Buy and manage buddies
- Assign buddies to plots
- Upgrade buddies and plots
- Purchase global upgrades
- Admin controls for testing

## Authentication
Currently no authentication required. Admin endpoints should be protected in production.

## Rate Limiting
Not implemented yet. Consider adding for production.
  `.trim(),
  contact: {
    name: 'API Support',
  },
  license: {
    name: 'MIT',
  },
};

export const gameEndpoints = {
  '/api/game/state': {
    get: {
      tags: ['Game'],
      summary: 'Get current game state',
      description: 'Returns the complete current state of the game including currency, buddies, plots, and upgrades.',
      responses: {
        '200': {
          description: 'Successful response with game state',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GameState' },
            },
          },
        },
        '503': {
          description: 'Game not initialized',
        },
      },
    },
  },
  '/api/game/income': {
    get: {
      tags: ['Game'],
      summary: 'Get current income rate',
      description: 'Returns the current income per second based on assigned buddies.',
      responses: {
        '200': {
          description: 'Income rate in coins per second',
        },
      },
    },
  },
  '/api/game/spawner': {
    get: {
      tags: ['Game'],
      summary: 'Get spawner information',
      description: 'Returns current spawner cost and owned buddy count.',
      responses: {
        '200': {
          description: 'Spawner statistics',
        },
      },
    },
  },
};

export const buddyEndpoints = {
  '/api/buddy/buy': {
    post: {
      tags: ['Buddies'],
      summary: 'Buy a new buddy',
      description: 'Purchases a random buddy from the spawner. Cost scales exponentially.',
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                forceRarity: {
                  type: 'string',
                  enum: ['common', 'rare', 'epic', 'legendary'],
                  description: 'Force a specific rarity (admin/testing only)',
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Buddy created successfully',
        },
        '400': {
          description: 'Insufficient funds',
        },
      },
    },
  },
  '/api/buddy/assign': {
    post: {
      tags: ['Buddies'],
      summary: 'Assign buddy to plot',
      description: 'Assigns an unassigned buddy to an empty plot to start generating income.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['buddyId', 'plotId'],
              properties: {
                buddyId: { type: 'string' },
                plotId: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Buddy assigned successfully',
        },
        '400': {
          description: 'Invalid request or plot occupied',
        },
        '404': {
          description: 'Buddy or plot not found',
        },
      },
    },
  },
  '/api/buddy/unassign': {
    post: {
      tags: ['Buddies'],
      summary: 'Unassign buddy from plot',
      description: 'Removes a buddy from their assigned plot.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['buddyId'],
              properties: {
                buddyId: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Buddy unassigned successfully',
        },
        '404': {
          description: 'Buddy not found',
        },
      },
    },
  },
  '/api/buddy/upgrade': {
    post: {
      tags: ['Buddies'],
      summary: 'Upgrade buddy level',
      description: 'Increases a buddy\'s level, increasing their income output.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['buddyId'],
              properties: {
                buddyId: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Buddy upgraded successfully',
        },
        '400': {
          description: 'Insufficient funds',
        },
        '404': {
          description: 'Buddy not found',
        },
      },
    },
  },
};

export const plotEndpoints = {
  '/api/plot/upgrade': {
    post: {
      tags: ['Plots'],
      summary: 'Upgrade plot level',
      description: 'Increases a plot\'s multiplier, boosting the income of the assigned buddy.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['plotId'],
              properties: {
                plotId: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Plot upgraded successfully',
        },
        '400': {
          description: 'Insufficient funds',
        },
        '404': {
          description: 'Plot not found',
        },
      },
    },
  },
};

export const upgradeEndpoints = {
  '/api/upgrade/purchase': {
    post: {
      tags: ['Upgrades'],
      summary: 'Purchase global upgrade',
      description: 'Purchases a level of a global upgrade that affects all buddies or spawns.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['upgradeId'],
              properties: {
                upgradeId: {
                  type: 'string',
                  enum: ['plot-boost', 'spawn-luck'],
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Upgrade purchased successfully',
        },
        '400': {
          description: 'Insufficient funds or upgrade maxed',
        },
        '404': {
          description: 'Upgrade not found',
        },
      },
    },
  },
};

export const adminEndpoints = {
  '/api/admin/add-currency': {
    post: {
      tags: ['Admin'],
      summary: 'Add currency (admin)',
      description: 'Adds currency to the game state. For testing purposes.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['amount'],
              properties: {
                amount: { type: 'number', minimum: 1 },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Currency added successfully',
        },
        '400': {
          description: 'Invalid amount',
        },
      },
    },
  },
  '/api/admin/reset': {
    post: {
      tags: ['Admin'],
      summary: 'Reset game (admin)',
      description: 'Resets the game to initial state. Use with caution.',
      responses: {
        '200': {
          description: 'Game reset successfully',
        },
      },
    },
  },
};

export const healthEndpoints = {
  '/api/health': {
    get: {
      tags: ['Health'],
      summary: 'Health check',
      description: 'Returns system health status and version information.',
      responses: {
        '200': {
          description: 'System is healthy',
        },
      },
    },
  },
  '/api/health/ready': {
    get: {
      tags: ['Health'],
      summary: 'Readiness check',
      description: 'Returns whether the API is ready to accept requests.',
      responses: {
        '200': {
          description: 'API is ready',
        },
      },
    },
  },
  '/api/health/live': {
    get: {
      tags: ['Health'],
      summary: 'Liveness check',
      description: 'Returns whether the API is alive.',
      responses: {
        '200': {
          description: 'API is alive',
        },
      },
    },
  },
};

export const schemas = {
  GameState: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: {
        type: 'object',
        properties: {
          currency: { type: 'number' },
          buddies: {
            type: 'array',
            items: { $ref: '#/components/schemas/Buddy' },
          },
          plots: {
            type: 'array',
            items: { $ref: '#/components/schemas/Plot' },
          },
          upgrades: {
            type: 'array',
            items: { $ref: '#/components/schemas/Upgrade' },
          },
          stats: { $ref: '#/components/schemas/Stats' },
          lastUpdate: { type: 'number' },
          buddiesBought: { type: 'number' },
          moneyEarned: { type: 'number' },
        },
      },
      timestamp: { type: 'number' },
    },
  },
  Buddy: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      emoji: { type: 'string' },
      rarity: {
        type: 'string',
        enum: ['common', 'rare', 'epic', 'legendary'],
      },
      baseIncome: { type: 'number' },
      level: { type: 'number' },
      assignedPlotId: { type: 'string', nullable: true },
    },
  },
  Plot: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      level: { type: 'number' },
      multiplier: { type: 'number' },
      assignedBuddyId: { type: 'string', nullable: true },
    },
  },
  Upgrade: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      description: { type: 'string' },
      cost: { type: 'number' },
      maxLevel: { type: 'number' },
      currentLevel: { type: 'number' },
    },
  },
  Stats: {
    type: 'object',
    properties: {
      totalEarned: { type: 'number' },
      sessionEarned: { type: 'number' },
      highScore: { type: 'number' },
    },
  },
  Error: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error: { type: 'string' },
      errorCode: { type: 'string' },
      timestamp: { type: 'number' },
    },
  },
};

export const tags = [
  { name: 'Game', description: 'Core game state operations' },
  { name: 'Buddies', description: 'Buddy management operations' },
  { name: 'Plots', description: 'Plot management operations' },
  { name: 'Upgrades', description: 'Global upgrade operations' },
  { name: 'Admin', description: 'Admin/testing operations' },
  { name: 'Health', description: 'System health endpoints' },
];