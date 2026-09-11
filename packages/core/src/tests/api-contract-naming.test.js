import { RuleTester } from '@typescript-eslint/rule-tester';
import tsParser from '@typescript-eslint/parser';
import rule from '../rules/api-contract-naming.js';

const ROOT_FOLDER = '/project/contracts';
const OPTIONS = [{ rootFolder: ROOT_FOLDER }];

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

ruleTester.run('api-contract-naming', rule, {
  valid: [
    {
      filename: 'model/type-a.model.ts',
      code: `
        import type { TypeA as ApiTypeA } from '@fylein/types';
        export interface TypeA extends ApiTypeA {}
      `,
    },
    {
      filename: '/project/contracts/model/type-a.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA } from '@fylein/types';

        export type UITypeA = TypeA & {
          additionalKey1?: string;
          displayName: string;
          'localValue': number;
        };
      `,
    },
    {
      filename: '/project/contracts/model/domain/type-a.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA as ApiType } from '@fylein/types/spender';

        export type UITypeA = ApiType & { additionalValue: string };
      `,
    },
    {
      filename: '/project/contracts/model/domain/type-a.model.ts',
      options: OPTIONS,
      code: `
        import type * as Contracts from '@fylein/types/admin';

        export type UITypeA = Contracts.TypeA & { additionalValue: string };
      `,
    },
    {
      filename: '/project/contracts/model/type-a.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA as ApiTypeA } from '@fylein/types/owner';

        export interface TypeA extends ApiTypeA { value: string }
      `,
    },
    {
      filename: '/project/contracts/model/url-details.model.ts',
      options: OPTIONS,
      code: `
        import type { URLDetails as ApiURLDetails } from '@fylein/types/owner';

        export interface URLDetails extends ApiURLDetails { value: string }
      `,
    },
    {
      filename: '/project/contracts/model/type-a.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA } from '@fylein/types';
        export type { TypeA };
      `,
    },
    {
      filename: '/project/contracts/model/type-a.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA } from '@fylein/types';
        export type { TypeA as UITypeA };
      `,
    },
    {
      filename: '/project/contracts/model/type-a.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA, TypeB } from '@fylein/types';
        export type UITypeA = TypeA & TypeB & { additionalValue: string };
      `,
    },
    {
      filename: '/project/contracts/interface/domain/expense-details.interface.ts',
      options: OPTIONS,
      code: `export interface ExpenseDetails { amount: number }`,
    },
    {
      filename: '/project/contracts/interface/expense-details.interface.ts',
      options: OPTIONS,
      code: `
        interface ExpenseDetails { amount: number }
        export { ExpenseDetails };
      `,
    },
    {
      filename: '/project/contracts/interface/ui-state.interface.ts',
      options: OPTIONS,
      code: `export interface UIState { loading: boolean }`,
    },
    {
      filename: '/project/src/example.component.ts',
      options: OPTIONS,
      code: `export class ExampleComponent {}`,
    },
    {
      filename: '/project/contracts/interface/generated.d.ts',
      options: OPTIONS,
      code: `export type Generated = { snake_case: string };`,
    },
    {
      filename: '/project/contracts/model/readme.js',
      options: OPTIONS,
      code: `export const value = 1;`,
    },
  ],
  invalid: [
    {
      filename: '/project/contracts/model/type-a.ts',
      options: OPTIONS,
      code: `
        import type { TypeA as ApiTypeA } from '@fylein/types';
        export interface TypeA extends ApiTypeA {}
      `,
      errors: [{ messageId: 'contractFilenameSuffix' }, { messageId: 'filenameMustMatchExport' }],
    },
    {
      filename: '/project/contracts/interface/type-a.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA as ApiTypeA } from '@fylein/types/spender';
        export interface TypeA extends ApiTypeA {}
      `,
      errors: [{ messageId: 'modelFolder' }],
    },
    {
      filename: '/project/elsewhere/type-a.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA as ApiTypeA } from '@fylein/types';
        export interface TypeA extends ApiTypeA {}
      `,
      errors: [{ messageId: 'modelFolder' }],
    },
    {
      filename: '/project/contracts/model/type-a.model.ts',
      options: OPTIONS,
      code: `export type TypeA = { value: string };`,
      errors: [
        { messageId: 'missingContractImport' },
        { messageId: 'interfaceFilenameSuffix' },
        { messageId: 'interfaceFolder' },
        { messageId: 'exportedInterfaceCount' },
        { messageId: 'interfaceOnly' },
      ],
    },
    {
      filename: '/project/contracts/model/expense-details.model.ts',
      options: OPTIONS,
      code: `export interface ExpenseDetails { amount: number }`,
      errors: [
        { messageId: 'missingContractImport' },
        { messageId: 'interfaceFilenameSuffix' },
        { messageId: 'interfaceFolder' },
        { messageId: 'filenameMustMatchExport' },
      ],
    },
    {
      filename: '/project/contracts/interface/expense-details.interface.ts',
      options: OPTIONS,
      code: `export type ExpenseDetails = { amount: number };`,
      errors: [{ messageId: 'exportedInterfaceCount' }, { messageId: 'interfaceOnly' }],
    },
    {
      filename: '/project/contracts/interface/expense-details.interface.ts',
      options: OPTIONS,
      code: `export type { ExpenseDetails } from './expense-details';`,
      errors: [{ messageId: 'interfaceOnly' }, { messageId: 'exportedInterfaceCount' }],
    },
    {
      filename: '/project/contracts/interface/expense-details.interface.ts',
      options: OPTIONS,
      code: `
        export interface ExpenseDetails { amount: number }
        export const defaultAmount = 0;
      `,
      errors: [{ messageId: 'interfaceRuntimeDeclaration' }],
    },
    {
      filename: '/project/contracts/interface/expense-details.interface.ts',
      options: OPTIONS,
      code: `import type { Other } from './other';`,
      errors: [{ messageId: 'exportedInterfaceCount' }],
    },
    {
      filename: '/project/contracts/interface/expense-details.interface.ts',
      options: OPTIONS,
      code: `
        export interface ExpenseDetails { amount: number }
        export interface ExpenseOwner { name: string }
      `,
      errors: [{ messageId: 'exportedInterfaceCount' }],
    },
    {
      filename: '/project/contracts/model/local-model.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA } from '@fylein/types';
        export interface LocalModel { value: string }
      `,
      errors: [{ messageId: 'missingContractImport' }],
    },
    {
      filename: '/project/contracts/model/type-a.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA } from '@fylein/types';
        import type { LocalHelper } from '../interface/local-helper.interface';
        export type UITypeA = TypeA & { localHelper: LocalHelper };
      `,
      errors: [{ messageId: 'forbiddenModelImport' }],
    },
    {
      filename: '/project/contracts/model/type-a.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA, TypeB } from '@fylein/types';
        export interface TypeAExtension extends TypeA {}
        export interface TypeBExtension extends TypeB {}
      `,
      errors: [{ messageId: 'exportedTypeCount' }],
    },
    {
      filename: '/project/contracts/model/type-a.model.ts',
      options: OPTIONS,
      code: `import '@fylein/types';`,
      errors: [{ messageId: 'missingContractImport' }, { messageId: 'exportedTypeCount' }],
    },
    {
      filename: '/project/contracts/model/type-a.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA, TypeB } from '@fylein/types';
        export type { TypeA, TypeB };
      `,
      errors: [{ messageId: 'exportedTypeCount' }],
    },
    {
      filename: '/project/contracts/model/type-a.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA } from '@fylein/types';
        type LocalType = TypeA;
        export type * from './types';
      `,
      errors: [{ messageId: 'exportedTypeCount' }],
    },
    {
      filename: '/project/contracts/model/type-a.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA } from '@fylein/types';
        export type TypeA = TypeA & { additionalValue: string };
      `,
      errors: [{ messageId: 'uiTypeName' }],
    },
    {
      filename: '/project/contracts/model/type-a.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA } from '@fylein/types';
        export type UIFoo = TypeA & { additionalValue: string };
      `,
      errors: [{ messageId: 'filenameMustMatchExport' }, { messageId: 'uiTypeName' }],
    },
    {
      filename: '/project/contracts/model/ui-type-a.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA } from '@fylein/types';
        export type UITypeA = TypeA & { additionalValue: string };
      `,
      errors: [{ messageId: 'filenameMustMatchExport' }],
    },
    {
      filename: '/project/contracts/model/type-a.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA } from '@fylein/types';
        export type UITypeA = TypeA & {};
      `,
      errors: [{ messageId: 'misleadingUiPrefix' }],
    },
    {
      filename: '/project/contracts/model/type-a.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA } from '@fylein/types';
        export type UITypeA = (TypeA & {}) & {};
      `,
      errors: [{ messageId: 'misleadingUiPrefix' }],
    },
    {
      filename: '/project/contracts/model/type-a.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA } from '@fylein/types';
        declare const dynamicKey: unique symbol;
        export type UITypeA = TypeA & {
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
      filename: '/project/contracts/model/type-a.model.ts',
      options: OPTIONS,
      code: `
        import type { TypeA as ApiType } from '@fylein/types';
        export type UIApiType = ApiType & { additionalValue: string };
      `,
      errors: [{ messageId: 'filenameMustMatchExport' }, { messageId: 'uiTypeName' }],
    },
    {
      filename: '/project/contracts/interface/wrong-name.interface.ts',
      options: OPTIONS,
      code: `export interface ExpenseDetails { amount: number }`,
      errors: [{ messageId: 'filenameMustMatchExport' }],
    },
  ],
});
