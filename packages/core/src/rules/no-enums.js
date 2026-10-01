import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/fylein/fyle-eslint-plugin/blob/main/packages/docs/rules/no-enums.md',
);

const RULE_NAME = 'no-enums';

export default createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow TypeScript enums in favor of union types or as-const objects',
    },
    schema: [],
    messages: {
      noEnum: 'Avoid enums; use a union type or an as-const object instead.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      TSEnumDeclaration(node) {
        context.report({ node, messageId: 'noEnum' });
      },
    };
  },
});
