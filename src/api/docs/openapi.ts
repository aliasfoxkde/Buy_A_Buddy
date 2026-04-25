// ==========================================
// OPENAPI SPECIFICATION
// ==========================================

export const apiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Buy a Buddy API',
    version: '2.0.0',
    description: 'Backend API for the Buy a Buddy RPG game with mini-games',
    contact: { name: 'API Support' },
    license: { name: 'MIT' },
  },
  servers: [
    { url: 'http://localhost:3001', description: 'Local development' },
    { url: 'https://api.buy-a-buddy.pages.dev', description: 'Production' },
  ],
  tags: [
    { name: 'Game', description: 'Core game operations' },
    { name: 'Health', description: 'System health endpoints' },
    { name: 'Debug', description: 'Development & debugging' },
  ],
  paths: {
    '/api': {
      get: {
        tags: ['Game'],
        summary: 'API information',
        responses: { '200': { description: 'API info' } },
      },
    },
    '/api/game/state': {
      get: {
        tags: ['Game'],
        summary: 'Get current game state',
        responses: { '200': { description: 'Game state' } },
      },
    },
    '/api/game/action': {
      post: {
        tags: ['Game'],
        summary: 'Perform game action',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['SPAWN_BUDDY', 'ASSIGN_BUDDY', 'UNASSIGN_BUDDY', 'UPGRADE_BUDDY', 'UPGRADE_PLOT', 'BREED_BUDDIES'] },
                  buddyId: { type: 'string' },
                  plotId: { type: 'string' },
                  forcedRarity: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Action result' } },
      },
    },
    '/api/game/spawner': {
      get: {
        tags: ['Game'],
        summary: 'Get spawner info',
        responses: { '200': { description: 'Spawner data' } },
      },
    },
    '/api/debug/report': {
      get: {
        tags: ['Debug'],
        summary: 'Get debug report',
        responses: { '200': { description: 'Debug report' } },
      },
    },
    '/api/debug/validate': {
      get: {
        tags: ['Debug'],
        summary: 'Validate game state',
        responses: { '200': { description: 'Validation report' } },
      },
    },
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: { '200': { description: 'System healthy' } },
      },
    },
    '/api/health/ready': {
      get: {
        tags: ['Health'],
        summary: 'Readiness check',
        responses: { '200': { description: 'Ready' } },
      },
    },
    '/api/health/live': {
      get: {
        tags: ['Health'],
        summary: 'Liveness check',
        responses: { '200': { description: 'Alive' } },
      },
    },
  },
  components: {
    schemas: {
      GameState: {
        type: 'object',
        properties: {
          version: { type: 'number' },
          player: { $ref: '#/components/schemas/Player' },
          buddies: { type: 'array', items: { $ref: '#/components/schemas/Buddy' } },
          plots: { type: 'array', items: { $ref: '#/components/schemas/Plot' } },
        },
      },
      Player: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          level: { type: 'number' },
          coins: { type: 'number' },
        },
      },
      Buddy: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          rarity: { type: 'string', enum: ['common', 'rare', 'epic', 'legendary'] },
          level: { type: 'number' },
          baseIncome: { type: 'number' },
          isWorking: { type: 'boolean' },
        },
      },
      Plot: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          level: { type: 'number' },
          multiplier: { type: 'number' },
          buddyId: { type: 'string', nullable: true },
        },
      },
    },
  },
};

export const tags = [
  { name: 'Game', description: 'Core game operations' },
  { name: 'Health', description: 'System health endpoints' },
  { name: 'Debug', description: 'Development & debugging' },
];