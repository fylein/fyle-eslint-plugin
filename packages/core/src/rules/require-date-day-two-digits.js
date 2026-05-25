import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/fylein/fyle-eslint-plugin/blob/main/packages/docs/rules/require-date-day-two-digits.md',
);

const RULE_NAME = 'require-date-day-two-digits';

export default createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        "Require 'day' option to use '2-digit' when calling Date.prototype.toLocaleDateString to ensure two-digit day formatting (e.g., '01 Mar' not '1 Mar').",
      recommended: 'recommended',
    },
    schema: [],
    messages: {
      requireTwoDigit: "Use day: '2-digit' in toLocaleDateString options to produce two-digit day values.",
    },
  },
  defaultOptions: [],
  create(context) {
    function isToLocaleDateStringCall(node) {
      if (node.type !== AST_NODE_TYPES.CallExpression) return false;
      const callee = node.callee;
      if (callee.type !== AST_NODE_TYPES.MemberExpression) return false;
      const prop = callee.property;
      if (prop.type !== AST_NODE_TYPES.Identifier) return false;
      return prop.name === 'toLocaleDateString';
    }

    return {
      CallExpression(node) {
        if (!isToLocaleDateStringCall(node)) return;

        // Determine which argument is the options object.
        // toLocaleDateString(locales?, options?) -> options is arg[1] if arg0 is string/array, else arg[0] if it's an object
        const args = node.arguments || [];
        let optionsArg = null;
        if (args.length >= 2) {
          optionsArg = args[1];
        } else if (args.length === 1) {
          const first = args[0];
          if (first.type === AST_NODE_TYPES.ObjectExpression) optionsArg = first;
        }

        if (!optionsArg) return;

        // If optionsArg is not object literal, skip
        if (optionsArg.type !== AST_NODE_TYPES.ObjectExpression) return;

        // Find day property
        for (const prop of optionsArg.properties) {
          if (prop.type !== AST_NODE_TYPES.Property) continue;
          const key = prop.key;
          const value = prop.value;
          const keyName =
            key.type === AST_NODE_TYPES.Identifier
              ? key.name
              : key.type === AST_NODE_TYPES.Literal
                ? String(key.value)
                : null;
          if (keyName === 'day') {
            if (value.type === AST_NODE_TYPES.Literal && value.value === 'numeric') {
              context.report({ node: value, messageId: 'requireTwoDigit' });
            }
            break;
          }
        }
      },
    };
  },
});
