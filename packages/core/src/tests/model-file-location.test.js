import { RuleTester } from '@typescript-eslint/rule-tester';
import tsParser from '@typescript-eslint/parser';
import rule from '../rules/model-file-location.js';

const root = '/project';
const options = [
  {
    modelFolders: ['**/apps/*/src/models'],
    skipFiles: ['budget.interface.ts'],
  },
];

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

ruleTester.run('model-file-location', rule, {
  valid: [
    {
      filename: `${root}/apps/expenses/src/models/expense.model.ts`,
      code: 'export type Expense = { id: string };',
      options,
    },
    {
      filename: `${root}/apps/expenses/src/features/budget/budget.interface.ts`,
      code: 'export interface Budget { amount: number }',
      options,
    },
    {
      filename: `${root}/apps/expenses/src/models/budget.interface.ts`,
      code: 'export interface Budget { amount: number }',
      options,
    },
    {
      filename: `${root}/apps/expenses/src/runtime/format.ts`,
      code: 'export const format = (value) => String(value);',
      options,
    },
    {
      filename: `${root}/apps/expenses/src/generated/types.d.ts`,
      code: 'export interface Generated { value: string }',
      options,
    },
  ],
  invalid: [
    {
      filename: `${root}/apps/expenses/src/runtime/format.ts`,
      code: 'type Format = { value: string };',
      options,
      errors: [{ messageId: 'declarationMustBeInModelFile' }],
    },
    {
      filename: `${root}/apps/expenses/src/models/expense.ts`,
      code: 'export interface Expense { id: string }',
      options,
      errors: [{ messageId: 'fileMustBeModelOrSkippedInterface' }],
    },
    {
      filename: `${root}/apps/expenses/src/models/helpers.ts`,
      code: 'export function formatExpense(value) { return value; }',
      options,
      errors: [{ messageId: 'fileMustBeModelOrSkippedInterface' }],
    },
    {
      filename: `${root}/apps/expenses/src/models/other.interface.ts`,
      code: 'export interface Other { value: string }',
      options,
      errors: [{ messageId: 'fileMustBeModelOrSkippedInterface' }],
    },
    {
      filename: `${root}/apps/expenses/src/features/budget/budget.interface.ts`,
      code: 'type Budget = { amount: number };',
      options: [{ modelFolders: ['**/apps/*/src/models'], skipFiles: [] }],
      errors: [{ messageId: 'declarationMustBeInModelFile' }],
    },
  ],
});
