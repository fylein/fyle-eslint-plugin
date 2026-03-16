import { RuleTester } from '@typescript-eslint/rule-tester';
import tsParser from '@typescript-eslint/parser';
import fs from 'node:fs';
import path from 'node:path';
import rule from '../rules/no-datepipe-transform-format-arg.js';

const FIXTURES_DIR = path.join(process.cwd(), 'src/tests/fixtures');

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      project: './tsconfig.json',
      tsconfigRootDir: FIXTURES_DIR,
    },
  },
});

function loadFixture(name) {
  const abs = path.join(FIXTURES_DIR, name);
  return {
    // Path must be relative to tsconfigRootDir for typed linting.
    filename: name,
    code: fs.readFileSync(abs, 'utf8'),
  };
}

ruleTester.run('no-datepipe-transform-format-arg', rule, {
  valid: [loadFixture('datepipe-transform-valid.ts'), loadFixture('other-transform-valid.ts')],
  invalid: [
    {
      ...loadFixture('datepipe-transform-invalid.ts'),
      errors: [{ messageId: 'noFormatArg' }],
    },
  ],
});
