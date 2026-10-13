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
      filename: '/project/report-out.model.ts',
      code: `
        import { ReportOut as ApiReportOut } from '@fylein/types/cross-role';
        import { Dateify } from './dateify.model';
        export type ReportOut = Dateify<ApiReportOut>;
      `,
    },
    {
      filename: '/project/expense-without-id.model.ts',
      code: `
        import type { ExpenseOut as ApiExpenseOut } from '@fylein/types';
        export type ExpenseWithoutId = Omit<ApiExpenseOut, 'id'>;
      `,
    },
    {
      filename: '/project/expense-summary.model.ts',
      code: `
        import type { ExpenseOut as ApiExpenseOut } from '@fylein/types';
        export type ExpenseSummary = Pick<ApiExpenseOut, 'id'>;
      `,
    },
    {
      filename: '/project/non-array-report-stats.model.ts',
      code: `
        import type { ReportsStatsOut } from '@fylein/types';
        export type NonArrayReportStats = Exclude<ReportsStatsOut, unknown[]>;
      `,
    },
    {
      filename: '/project/matching-expense.model.ts',
      code: `
        import type { ExpenseOut as ApiExpenseOut } from '@fylein/types';
        export type MatchingExpense = Extract<ApiExpenseOut, { id: string }>;
      `,
    },
    {
      filename: '/project/nullable-expense.model.ts',
      code: `
        import type { ExpenseOut as ApiExpenseOut } from '@fylein/types';
        export type NullableExpense = ApiExpenseOut | null;
      `,
    },
    {
      filename: '/project/expense.model.ts',
      code: `
        import type { ExpenseOut as ApiExpenseOut } from '@fylein/types';
        export type Expense = ApiExpenseOut;
      `,
    },
    {
      filename: '/project/expense-or-report.model.ts',
      code: `
        import type { ExpenseOut, ReportOut } from '@fylein/types';
        export type ExpenseOrReport = ExpenseOut | ReportOut;
      `,
    },
    {
      filename: '/project/expense-category.model.ts',
      code: `
        import type { ExpenseOut as ApiExpenseOut } from '@fylein/types';
        export type ExpenseCategory = ApiExpenseOut['category'];
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
      filename: '/project/merge-form.model.ts',
      code: `
        import type { ExpenseOut } from '@fylein/types';
        import type { Nullable } from './nullable.model';
        export type MergeForm = Nullable<{
          section: {
            expense: Pick<ExpenseOut, 'id'>;
          };
        }> & { selected: boolean };
      `,
    },
    {
      filename: '/project/expense-summary.model.ts',
      code: `
        import type { ExpenseOut } from '@fylein/types';
        export type ExpenseSummary = { expense: ExpenseOut };
      `,
    },
    {
      filename: '/project/expense-form.model.ts',
      code: `
        import type { ExpenseOut as ApiExpenseOut } from '@fylein/types';
        export type ExpenseForm = { expense: ApiExpenseOut } & { selected: boolean };
      `,
    },
    {
      filename: '/project/nullable-expense-selection.model.ts',
      code: `
        import type { ExpenseOut as ApiExpenseOut } from '@fylein/types';
        export type NullableExpenseSelection = (ApiExpenseOut | null) & { selected: boolean };
      `,
    },
    {
      filename: '/project/expense-category-details.model.ts',
      code: `
        import type { ExpenseOut as ApiExpenseOut } from '@fylein/types';
        export type ExpenseCategoryDetails = ApiExpenseOut['category'] & { label: string };
      `,
    },
    {
      filename: '/project/external-expense.model.ts',
      code: `
        import type { ExpenseOut } from '@another/types';
        export type ExternalExpense = ExpenseOut & { selected: boolean };
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
      errors: [{ messageId: 'extraExportedType' }],
    },
    {
      filename: '/project/expense-out.model.ts',
      code: `
        export type ExpenseOut = { id: string };
        export type OtherOut = { id: string };
        export type AnotherOut = { id: string };
      `,
      errors: [{ messageId: 'extraExportedType' }, { messageId: 'extraExportedType' }],
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
      filename: '/project/expense-out.model.ts',
      code: `
        import type { ExpenseOut as ApiExpenseOut } from '@fylein/types';
        export type ExpenseOut = ApiExpenseOut & { inlineEditable?: boolean };
      `,
      errors: [{ messageId: 'uiPrefixRequired', data: { exportName: 'ExpenseOut' } }],
    },
    {
      filename: '/project/expense-out.model.ts',
      code: `
        import type { ExpenseOut as ApiExpenseOut } from '@fylein/types';
        export type ExpenseOut = { inlineEditable?: boolean } & ApiExpenseOut;
      `,
      errors: [{ messageId: 'uiPrefixRequired', data: { exportName: 'ExpenseOut' } }],
    },
    {
      filename: '/project/expense-out.model.ts',
      code: `
        import type { ExpenseOut as ApiExpenseOut } from '@fylein/types/cross-role';
        export type ExpenseOut = ApiExpenseOut & { inlineEditable?: boolean };
      `,
      errors: [{ messageId: 'uiPrefixRequired', data: { exportName: 'ExpenseOut' } }],
    },
    {
      filename: '/project/expense-out.model.ts',
      code: `
        import type * as FyleTypes from '@fylein/types';
        export type ExpenseOut = FyleTypes.ExpenseOut & { inlineEditable?: boolean };
      `,
      errors: [{ messageId: 'uiPrefixRequired', data: { exportName: 'ExpenseOut' } }],
    },
    {
      filename: '/project/expense-out.model.ts',
      code: `
        import type { ExpenseOut as ApiExpenseOut } from '@fylein/types';
        import type { Dateify } from './dateify.model';
        export type ExpenseOut = Dateify<ApiExpenseOut> & { inlineEditable?: boolean };
      `,
      errors: [{ messageId: 'uiPrefixRequired', data: { exportName: 'ExpenseOut' } }],
    },
    {
      filename: '/project/expense-out.model.ts',
      code: `
        import type { ExpenseOut as ApiExpenseOut } from '@fylein/types';
        export type ExpenseOut = Omit<ApiExpenseOut, 'id'> & { temporaryId: string };
      `,
      errors: [{ messageId: 'uiPrefixRequired', data: { exportName: 'ExpenseOut' } }],
    },
    {
      filename: '/project/expense-out.model.ts',
      code: `
        import type { ExpenseOut as ApiExpenseOut } from '@fylein/types';
        export type ExpenseOut = Partial<Pick<ApiExpenseOut, 'id'>> & { selected: boolean };
      `,
      errors: [{ messageId: 'uiPrefixRequired', data: { exportName: 'ExpenseOut' } }],
    },
    {
      filename: '/project/report-stats.model.ts',
      code: `
        import type { ReportsStatsOut } from '@fylein/types';
        export type ReportStats = Exclude<ReportsStatsOut, unknown[]> & { reimbursableAmount: number };
      `,
      errors: [{ messageId: 'uiPrefixRequired', data: { exportName: 'ReportStats' } }],
    },
    {
      filename: '/project/expense-out.model.ts',
      code: `
        import type { ExpenseOut as ApiExpenseOut } from '@fylein/types';
        export type ExpenseOut = Extract<ApiExpenseOut, { id: string }> & { selected: boolean };
      `,
      errors: [{ messageId: 'uiPrefixRequired', data: { exportName: 'ExpenseOut' } }],
    },
    {
      filename: '/project/expense-out.model.ts',
      code: `
        import type { ExpenseOut as ApiExpenseOut } from '@fylein/types';
        import type { CustomWrapper } from './custom-wrapper.model';
        export type ExpenseOut = CustomWrapper<ApiExpenseOut> & { selected: boolean };
      `,
      errors: [{ messageId: 'uiPrefixRequired', data: { exportName: 'ExpenseOut' } }],
    },
  ],
});
