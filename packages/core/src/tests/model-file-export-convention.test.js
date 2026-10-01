import { RuleTester } from '@typescript-eslint/rule-tester';
import tsParser from '@typescript-eslint/parser';
import rule from '../rules/model-file-export-convention.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

ruleTester.run('model-file-export-convention', rule, {
  valid: [
    {
      filename: '/project/expense-out.model.ts',
      code: 'export type ExpenseOut = { id: string };',
    },
    {
      filename: '/project/ui-expense-out.model.ts',
      code: 'export type UIExpenseOut = { displayName: string };',
    },
    {
      filename: '/project/url-details-response.model.ts',
      code: 'export type URLDetailsResponse = { url: string };',
    },
    {
      filename: '/project/ui-report-out.model.ts',
      code: `
        import { ReportOut } from '@fylein/types/cross-role';
        import { Dateify } from './dateify.model';
        export type UIReportOut = Dateify<ReportOut>;
      `,
    },
    {
      filename: '/project/ui-expense-out.model.ts',
      code: `
        import type { ExpenseOut } from '@fylein/types';
        import type { Dateify } from './dateify.model';
        export type UIExpenseOut = Dateify<ExpenseOut> & { inlineEditable?: boolean };
      `,
    },
    {
      filename: '/project/example.component.ts',
      code: 'export interface Example { value: string }',
    },
  ],
  invalid: [
    {
      filename: '/project/expense-out.model.ts',
      code: 'const value = 1;',
      errors: [{ messageId: 'exportCount', data: { count: '0' } }],
    },
    {
      filename: '/project/expense-out.model.ts',
      code: `
        export type ExpenseOut = { id: string };
        export type OtherOut = { id: string };
      `,
      errors: [{ messageId: 'exportCount', data: { count: '2' } }],
    },
    {
      filename: '/project/expense-out.model.ts',
      code: `
        export type ExpenseOut = { id: string };
        export type OtherOut = { id: string };
        export type AnotherOut = { id: string };
      `,
      errors: [
        { messageId: 'exportCount', data: { count: '3' } },
        { messageId: 'exportCount', data: { count: '3' } },
      ],
    },
    {
      filename: '/project/expense-out.model.ts',
      code: 'export interface ExpenseOut { id: string }',
      errors: [{ messageId: 'exportCount', data: { count: '0' } }, { messageId: 'interfaceNotAllowed' }],
    },
    {
      filename: '/project/expense-out.model.ts',
      code: 'interface ExpenseOut { id: string }',
      errors: [{ messageId: 'interfaceNotAllowed' }, { messageId: 'exportCount', data: { count: '0' } }],
    },
    {
      filename: '/project/expense-out.model.ts',
      code: "export type { ExpenseOut } from './types';",
      errors: [{ messageId: 'invalidExport', data: { exportKind: 'type re-export' } }, { messageId: 'exportCount' }],
    },
    {
      filename: '/project/expense.model.ts',
      code: 'export type ExpenseOut = { id: string };',
      errors: [
        {
          messageId: 'filenameMustMatchExport',
          data: { expectedFilename: 'expense-out.model.ts', exportName: 'ExpenseOut' },
        },
      ],
    },
    {
      filename: '/project/report-out.model.ts',
      code: `
        import { ReportOut } from '@fylein/types/cross-role';
        import { Dateify } from './dateify.model';
        export type ReportOut = Dateify<ReportOut>;
      `,
      errors: [{ messageId: 'uiPrefixRequired', data: { exportName: 'ReportOut' } }],
    },
    {
      filename: '/project/expense-out.model.ts',
      code: `
        import type { ExpenseOut } from '@fylein/types';
        export type ExpenseOut = ExpenseOut & { inlineEditable?: boolean };
      `,
      errors: [{ messageId: 'uiPrefixRequired', data: { exportName: 'ExpenseOut' } }],
    },
  ],
});
