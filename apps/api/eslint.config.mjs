import { ignores, metrics, nodeTypeChecked } from '../../eslint.base.mjs';

export default [
  ignores,
  ...nodeTypeChecked(import.meta.dirname),
  {
    // Async route handlers are safe here: express-async-errors (imported first
    // in app.ts) forwards rejected promises to the error handler. Express 5
    // handles promises natively and would make this override unnecessary.
    files: ['src/app.ts', 'src/routes/**/*.ts'],
    rules: { '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { arguments: false } }] },
  },
  {
    // knex calls up(knex) and down(knex) with a fixed signature
    files: ['migrations/**/*.js', 'seeds/**/*.js'],
    rules: { '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }] },
  },
  metrics({ complexity: 15 }),
];
