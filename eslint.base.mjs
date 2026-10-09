// Shared ESLint building blocks. Every package's eslint.config.mjs imports them.
// Metric thresholds (complexity, module size) are documented in docs/REVIEW.md.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export const ignores = {
  ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.expo/**'],
};

/**
 * Quality metrics enforced in every package (see "Quality gates" in docs/REVIEW.md).
 * complexity: cyclomatic complexity per function. max-lines: lines per file.
 */
export function metrics({ complexity }) {
  return {
    rules: {
      complexity: ['error', { max: complexity }],
      'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
    },
  };
}

/** Node packages (api, shared): TypeScript rules that read type information. */
export function nodeTypeChecked(tsconfigRootDir) {
  return tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
      languageOptions: {
        globals: globals.node,
        parserOptions: { projectService: true, tsconfigRootDir },
      },
      rules: {
        // Ratchet: untyped data (knex rows, req.body) is reported as warnings and
        // counted in the metrics report. Becomes an error once the count reaches 0.
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-return': 'warn',
        // `import x = require()` is allowed: it keeps load order where it matters
        '@typescript-eslint/no-require-imports': ['error', { allowAsImport: true }],
        // With strictNullChecks off (tsconfig strict: false), `!` and `as string` look
        // unnecessary to this rule but document intent; keep them for when strict is on
        '@typescript-eslint/no-unnecessary-type-assertion': 'off',
        // Prefix `_` marks a parameter required by a signature but unused
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      },
    },
    {
      // Plain JS (knex migrations and seeds) and tool config files have no tsconfig
      files: ['**/*.js', '**/*.cjs', '**/*.mjs', '**/*.config.*'],
      ...tseslint.configs.disableTypeChecked,
    },
    {
      files: ['**/*.js', '**/*.cjs'],
      languageOptions: { sourceType: 'commonjs' },
      rules: { '@typescript-eslint/no-require-imports': 'off' },
    },
  );
}
