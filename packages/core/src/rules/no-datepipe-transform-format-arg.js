import { ESLintUtils } from '@typescript-eslint/utils';

const RULE_NAME = 'no-datepipe-transform-format-arg';

const createRule = ESLintUtils.RuleCreator(
  () =>
    'https://github.com/fylein/fyle-eslint-plugin/blob/main/packages/docs/rules/no-datepipe-transform-format-arg.md',
);

function isAngularCommonDatePipeType(type) {
  if (!type) {
    return false;
  }

  if (type.isUnion?.() || type.isIntersection?.()) {
    const types = type.types ?? [];
    return types.some((t) => isAngularCommonDatePipeType(t));
  }

  const symbol = type?.getSymbol?.() ?? type?.aliasSymbol ?? null;
  if (!symbol || symbol.getName() !== 'DatePipe') {
    return false;
  }

  const decls = symbol.getDeclarations?.() ?? [];
  if (decls.length === 0) {
    // Fallback if declarations are unavailable.
    return true;
  }

  return decls.some((d) => {
    const fileName = d.getSourceFile?.().fileName || '';
    return fileName.includes('@angular/common');
  });
}

export default createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow passing a second argument to DatePipe.transform; use org-level defaults instead',
    },
    schema: [],
    messages: {
      noFormatArg: 'Do not pass a second argument to DatePipe.transform. Use org-level formatting defaults instead.',
    },
  },
  defaultOptions: [],
  create(context) {
    const services = ESLintUtils.getParserServices(context);
    const checker = services.program.getTypeChecker();

    function checkCallExpression(node) {
      if (
        node.callee?.type !== 'MemberExpression' ||
        node.callee.property?.type !== 'Identifier' ||
        node.callee.property.name !== 'transform'
      ) {
        return;
      }

      if (!node.arguments || node.arguments.length < 2 || !node.arguments[1]) {
        return;
      }

      const tsReceiver = services.esTreeNodeToTSNodeMap.get(node.callee.object);
      const receiverType = checker.getTypeAtLocation(tsReceiver);

      if (!isAngularCommonDatePipeType(receiverType)) {
        return;
      }

      context.report({
        node: node.arguments[1],
        messageId: 'noFormatArg',
      });
    }

    return {
      CallExpression: checkCallExpression,
      // Optional chaining wraps the call in a ChainExpression.
      ChainExpression(node) {
        if (node.expression?.type === 'CallExpression') {
          checkCallExpression(node.expression);
        }
      },
    };
  },
});
