import { RuleTester } from '@typescript-eslint/rule-tester';
import tsParser from '@typescript-eslint/parser';
import rule from '../rules/no-type-declarations-in-artifacts.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

ruleTester.run('no-type-declarations-in-artifacts', rule, {
  valid: [
    { filename: '/project/example.component.ts', code: 'export class ExampleComponent {}' },
    { filename: '/project/example.service.ts', code: 'export function createExample() { return {}; }' },
    { filename: '/project/example.directive.ts', code: 'export const ExampleDirective = {};' },
    { filename: '/project/example.ts', code: 'type Example = string;' },
  ],
  invalid: [
    {
      filename: '/project/example.component.ts',
      code: 'type Example = string;',
      errors: [{ messageId: 'noTypeDeclaration' }],
    },
    {
      filename: '/project/example.service.ts',
      code: 'interface Example { value: string }',
      errors: [{ messageId: 'noTypeDeclaration' }],
    },
    {
      filename: '/project/example.directive.ts',
      code: `
        type Example = string;
        interface OtherExample { value: string }
      `,
      errors: [{ messageId: 'noTypeDeclaration' }, { messageId: 'noTypeDeclaration' }],
    },
  ],
});
