import { RuleTester } from '@typescript-eslint/rule-tester';
import tsParser from '@typescript-eslint/parser';
import rule from '../rules/require-test-assignee-comment.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

ruleTester.run('require-test-assignee-comment', rule, {
  valid: [
    `// Assignee: @arjun\n test.fixme('known issue', async ({ page }) => {});`,
    `test('works normally', async ({ page }) => {});`,
    `test.skip('skipped test without fail', async ({ page }) => {});`,
  ],
  invalid: [
    {
      code: `test.fixme('known issue', async ({ page }) => {});`,
      errors: [{ messageId: 'missingAssignee' }],
    },
    {
      code: `// TODO: temporary bug\n test.fail('unstable feature', async ({ page }) => {});`,
      errors: [{ messageId: 'missingAssignee' }],
    },
    {
      code: `// @owner @aniruddha\n test.fail('should retry after failure', async ({ page }) => {});`,
      errors: [{ messageId: 'missingAssignee' }],
    },
    {
      code: `/* @responsible @omkar */\n test.fail('known bug', async ({ page }) => {});`,
      errors: [{ messageId: 'missingAssignee' }],
    },
  ],
});
