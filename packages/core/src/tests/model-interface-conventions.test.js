import { RuleTester } from '@typescript-eslint/rule-tester';
import tsParser from '@typescript-eslint/parser';
import rule from '../rules/model-interface-conventions.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

ruleTester.run('model-interface-conventions', rule, {
  valid: [
    {
      filename: 'models/type-a-out.model.ts',
      code: `
        import type { TypeAOut as ApiTypeAOut } from '@fylein/types';
        export interface TypeAOut extends ApiTypeAOut {}
      `,
    },
    {
      filename: '/project/features/expenses/ui-type-a-out.model.ts',
      code: `
        import type { TypeAOut } from '@fylein/types';

        export type UITypeAOut = TypeAOut & {
          additionalKey1?: string;
          displayName: string;
          'localValue': number;
        };
      `,
    },
    {
      filename: '/project/domain/ui-type-a-out.model.ts',
      code: `
        import type { TypeAOut as ApiTypeAOut } from '@fylein/types/spender';

        export type UITypeAOut = ApiTypeAOut & { additionalValue: string };
      `,
    },
    {
      filename: '/project/domain/ui-type-a-out.model.ts',
      code: `
        import type * as Contracts from '@fylein/types/admin';

        export type UITypeAOut = Contracts.TypeAOut & { additionalValue: string };
      `,
    },
    {
      filename: '/project/type-a-out.model.ts',
      code: `
        import type { TypeAOut as ApiTypeAOut } from '@fylein/types/owner';

        export interface TypeAOut extends ApiTypeAOut { value: string }
      `,
    },
    {
      filename: '/project/url-details-response.model.ts',
      code: `
        import type { URLDetailsResponse as ApiURLDetailsResponse } from '@fylein/types/owner';

        export interface URLDetailsResponse extends ApiURLDetailsResponse { value: string }
      `,
    },
    {
      filename: '/project/expense-in.model.ts',
      code: `
        import type { ExpenseIn } from '@fylein/types';
        export type { ExpenseIn };
      `,
    },
    {
      filename: '/project/ui-type-a-out.model.ts',
      code: `
        import type { TypeAOut } from '@fylein/types';
        export type { TypeAOut as UITypeAOut };
      `,
    },
    {
      filename: '/project/expenses-get-params.model.ts',
      code: `
        import type { ExpensesGetParams } from '@fylein/types';
        export type { ExpensesGetParams };
      `,
    },
    {
      filename: '/project/ui-combined-response.model.ts',
      code: `
        import type { TypeAOut, TypeBOut } from '@fylein/types';
        export type UICombinedResponse = TypeAOut & TypeBOut & { additionalValue: string };
      `,
    },
    {
      filename: '/project/domain/expense-details.interface.ts',
      code: `export interface ExpenseDetails { amount: number }`,
    },
    {
      filename: '/project/expense-details.interface.ts',
      code: `
        interface ExpenseDetails { amount: number }
        export { ExpenseDetails };
      `,
    },
    {
      filename: '/project/ui-state.interface.ts',
      code: `export interface UIState { loading: boolean }`,
    },
    {
      filename: '/project/src/example.component.ts',
      code: `export class ExampleComponent {}`,
    },
    {
      filename: '/project/generated.d.ts',
      code: `export type Generated = { snake_case: string };`,
    },
    {
      filename: '/project/readme.js',
      code: `export const value = 1;`,
    },
  ],
  invalid: [
    {
      filename: '/project/type-a.ts',
      code: `
        import type { TypeA as ApiTypeA } from '@fylein/types';
        export interface TypeA extends ApiTypeA {}
      `,
      errors: [{ messageId: 'contractFilenameSuffix' }, { messageId: 'filenameMustMatchExport' }],
    },
    {
      filename: '/project/type-a.model.ts',
      code: `
        import type { TypeA } from '@fylein/types';
        export type { TypeA };
      `,
      errors: [{ messageId: 'modelNameSuffix' }],
    },
    {
      filename: '/project/type-aout.model.ts',
      code: `
        import type { TypeAout } from '@fylein/types';
        export type { TypeAout };
      `,
      errors: [{ messageId: 'modelNameSuffix' }],
    },
    {
      filename: '/project/type-a-out.model.ts',
      code: `
        import type { TypeAOut } from '@fylein/types/spender';
        export type UITypeAOut = TypeAOut & { additionalValue: string };
      `,
      errors: [{ messageId: 'filenameMustMatchExport' }],
    },
    {
      filename: '/project/local-model-out.model.ts',
      code: `export interface LocalModelOut { value: string }`,
      errors: [{ messageId: 'missingContractImport' }],
    },
    {
      filename: '/project/expense-details.interface.ts',
      code: `export type ExpenseDetails = { amount: number };`,
      errors: [{ messageId: 'exportedInterfaceCount' }, { messageId: 'interfaceOnly' }],
    },
    {
      filename: '/project/expense-details.interface.ts',
      code: `export type { ExpenseDetails } from './expense-details';`,
      errors: [{ messageId: 'interfaceOnly' }, { messageId: 'exportedInterfaceCount' }],
    },
    {
      filename: '/project/expense-details.interface.ts',
      code: `
        export interface ExpenseDetails { amount: number }
        export const defaultAmount = 0;
      `,
      errors: [{ messageId: 'interfaceRuntimeDeclaration' }],
    },
    {
      filename: '/project/expense-details.interface.ts',
      code: `import type { Other } from './other';`,
      errors: [{ messageId: 'exportedInterfaceCount' }],
    },
    {
      filename: '/project/expense-details.interface.ts',
      code: `
        export interface ExpenseDetails { amount: number }
        export interface ExpenseOwner { name: string }
      `,
      errors: [{ messageId: 'exportedInterfaceCount' }],
    },
    {
      filename: '/project/ui-type-a-out.model.ts',
      code: `
        import type { TypeAOut } from '@fylein/types';
        import type { LocalHelper } from './local-helper.interface';
        export type UITypeAOut = TypeAOut & { localHelper: LocalHelper };
      `,
      errors: [{ messageId: 'forbiddenModelImport' }],
    },
    {
      filename: '/project/type-a-out.model.ts',
      code: `
        import type { TypeAOut, TypeBOut } from '@fylein/types';
        export interface TypeAOut extends TypeAOut {}
        export interface TypeBOut extends TypeBOut {}
      `,
      errors: [{ messageId: 'exportedTypeCount' }],
    },
    {
      filename: '/project/type-a-out.model.ts',
      code: `import '@fylein/types';`,
      errors: [{ messageId: 'missingContractImport' }, { messageId: 'exportedTypeCount' }],
    },
    {
      filename: '/project/type-a-out.model.ts',
      code: `
        import type { TypeAOut, TypeBOut } from '@fylein/types';
        export type { TypeAOut, TypeBOut };
      `,
      errors: [{ messageId: 'exportedTypeCount' }],
    },
    {
      filename: '/project/type-a-out.model.ts',
      code: `
        import type { TypeAOut } from '@fylein/types';
        type LocalType = TypeAOut;
        export type * from './types';
      `,
      errors: [{ messageId: 'exportedTypeCount' }],
    },
    {
      filename: '/project/type-a-out.model.ts',
      code: `
        import type { TypeAOut } from '@fylein/types';
        export type TypeAOut = TypeAOut & { additionalValue: string };
      `,
      errors: [{ messageId: 'uiTypeName' }],
    },
    {
      filename: '/project/ui-foo-out.model.ts',
      code: `
        import type { TypeAOut } from '@fylein/types';
        export type UIFooOut = TypeAOut & { additionalValue: string };
      `,
      errors: [{ messageId: 'uiTypeName' }],
    },
    {
      filename: '/project/ui-type-a-out.model.ts',
      code: `
        import type { TypeAOut } from '@fylein/types';
        export type UITypeAOut = TypeAOut & {};
      `,
      errors: [{ messageId: 'misleadingUiPrefix' }],
    },
    {
      filename: '/project/ui-type-a-out.model.ts',
      code: `
        import type { TypeAOut } from '@fylein/types';
        export type UITypeAOut = (TypeAOut & {}) & {};
      `,
      errors: [{ messageId: 'misleadingUiPrefix' }],
    },
    {
      filename: '/project/ui-type-a-out.model.ts',
      code: `
        import type { TypeAOut } from '@fylein/types';
        declare const dynamicKey: unique symbol;
        export type UITypeAOut = TypeAOut & {
          AdditionalKey: string;
          additional_key: string;
          'additional-key': string;
          1: string;
          [dynamicKey]: string;
        };
      `,
      errors: [
        { messageId: 'propertyCamelCase' },
        { messageId: 'propertyCamelCase' },
        { messageId: 'propertyCamelCase' },
        { messageId: 'propertyStaticName' },
        { messageId: 'propertyStaticName' },
      ],
    },
    {
      filename: '/project/ui-api-type-out.model.ts',
      code: `
        import type { TypeAOut as ApiType } from '@fylein/types';
        export type UIApiTypeOut = ApiType & { additionalValue: string };
      `,
      errors: [{ messageId: 'uiTypeName' }],
    },
    {
      filename: '/project/wrong-name.interface.ts',
      code: `export interface ExpenseDetails { amount: number }`,
      errors: [{ messageId: 'filenameMustMatchExport' }],
    },
  ],
});
