import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/fylein/fyle-eslint-plugin/blob/main/packages/docs/rules/require-test-assignee-comment.md',
);

const RULE_NAME = 'require-test-assignee-comment';

const ASSIGNEE_COMMENT_PATTERN = /Assignee:\s+@[\w.-]+/i;

export default createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Require an explicit assignee comment for Playwright `test.fixme` and `test.fail` cases.',
      recommended: 'recommended',
    },
    schema: [],
    messages: {
      missingAssignee:
        'test.fixme/test.fail must include an explicit assignee comment immediately above the call, e.g. "// @assignee @username".',
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();

    function isTestFixmeOrFailCall(node) {
      if (node.type !== AST_NODE_TYPES.CallExpression) {
        return false;
      }

      const callee = node.callee;
      if (callee.type !== AST_NODE_TYPES.MemberExpression) {
        return false;
      }

      const object = callee.object;
      const property = callee.property;
      if (object.type !== AST_NODE_TYPES.Identifier || object.name !== 'test') {
        return false;
      }

      return property.type === AST_NODE_TYPES.Identifier && (property.name === 'fixme' || property.name === 'fail');
    }

    function hasAssigneeComment(node) {
      const statement = node.parent && node.parent.type === AST_NODE_TYPES.ExpressionStatement ? node.parent : node;
      const leadingComments = sourceCode.getCommentsBefore(statement);

      return leadingComments.some((comment) => ASSIGNEE_COMMENT_PATTERN.test(comment.value));
    }

    return {
      CallExpression(node) {
        if (!isTestFixmeOrFailCall(node)) {
          return;
        }

        if (!hasAssigneeComment(node)) {
          context.report({ node, messageId: 'missingAssignee' });
        }
      },
    };
  },
});
