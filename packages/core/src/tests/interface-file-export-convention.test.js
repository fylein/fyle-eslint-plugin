import { RuleTester } from '@typescript-eslint/rule-tester';
import tsParser from '@typescript-eslint/parser';
import rule from '../rules/interface-file-export-convention.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

ruleTester.run('interface-file-export-convention', rule, {
  valid: [
    {
      filename: '/project/expense-details.interface.ts',
      code: 'export interface ExpenseDetails { amount: number }',
    },
    {
      filename: '/project/ui-state.interface.ts',
      code: 'export interface UIState { loading: boolean }',
    },
  ],
  invalid: [
    {
      filename: '/project/expense-details.interface.ts',
      code: 'const value = 1;',
      errors: [{ messageId: 'exportCount', data: { count: '0' } }],
    },
    {
      filename: '/project/expense-details.interface.ts',
      code: 'type ExpenseDetails = { amount: number };',
      errors: [{ messageId: 'typeNotAllowed' }, { messageId: 'exportCount', data: { count: '0' } }],
    },
    {
      filename: '/project/expense-details.interface.ts',
      code: 'export type ExpenseDetails = { amount: number };',
      errors: [{ messageId: 'exportCount', data: { count: '0' } }, { messageId: 'typeNotAllowed' }],
    },
    {
      filename: '/project/expense.interface.ts',
      code: 'export interface ExpenseDetails { amount: number }',
      errors: [
        {
          messageId: 'filenameMustMatchExport',
          data: { expectedFilename: 'expense-details.interface.ts', exportName: 'ExpenseDetails' },
        },
      ],
    },
    {
      filename: '/project/expense-details.interface.ts',
      code: `
        export interface ExpenseDetails { amount: number }
        export interface ExpenseOwner { name: string }
      `,
      errors: [{ messageId: 'exportCount', data: { count: '2' } }],
    },
  ],
});
