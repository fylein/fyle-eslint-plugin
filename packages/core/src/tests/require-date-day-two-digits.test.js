import { RuleTester } from '@typescript-eslint/rule-tester';
import tsParser from '@typescript-eslint/parser';
import rule from '../rules/require-date-day-two-digits.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

ruleTester.run('require-date-day-two-digits', rule, {
  valid: [
    `new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })`,
    `new Date().toLocaleDateString({ month: 'short', day: '2-digit' })`,
    // no day option
    `new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })`,
    // non-literal day value (can't assert)
    `const d = 'numeric'; new Date().toLocaleDateString('en-US', { day: d })`,
  ],
  invalid: [
    {
      code: `new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })`,
      errors: [{ messageId: 'requireTwoDigit' }],
    },
    {
      code: `new Date().toLocaleDateString({ day: 'numeric' })`,
      errors: [{ messageId: 'requireTwoDigit' }],
    },
    {
      code: `new Date().toLocaleDateString('en-GB', { day: 'numeric' })`,
      errors: [{ messageId: 'requireTwoDigit' }],
    },
  ],
});
