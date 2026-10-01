import { RuleTester } from '@typescript-eslint/rule-tester';
import tsParser from '@typescript-eslint/parser';
import rule from '../rules/no-enums.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

ruleTester.run('no-enums', rule, {
  valid: [
    { code: "type Status = 'active' | 'inactive';" },
    { code: "const Status = { ACTIVE: 'active', INACTIVE: 'inactive' } as const;" },
  ],
  invalid: [
    {
      code: 'enum Status { Active, Inactive }',
      errors: [{ messageId: 'noEnum' }],
    },
    {
      code: 'const enum Status { Active, Inactive }',
      errors: [{ messageId: 'noEnum' }],
    },
    {
      code: 'declare enum Status { Active, Inactive }',
      errors: [{ messageId: 'noEnum' }],
    },
  ],
});
