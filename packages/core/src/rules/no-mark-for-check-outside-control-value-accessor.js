import { ESLintUtils } from '@typescript-eslint/utils';

const RULE_NAME = 'no-mark-for-check-outside-control-value-accessor';

const createRule = ESLintUtils.RuleCreator(
  () =>
    'https://github.com/fylein/fyle-eslint-plugin/blob/main/packages/docs/rules/no-mark-for-check-outside-control-value-accessor.md',
);

function getImportedName(specifier) {
  if (specifier.imported?.type === 'Identifier') {
    return specifier.imported.name;
  }

  if (specifier.imported?.type === 'Literal') {
    return specifier.imported.value;
  }

  return null;
}

function getStaticMemberName(node) {
  if (!node.computed && node.property.type === 'Identifier') {
    return node.property.name;
  }

  if (node.property.type === 'Literal' && typeof node.property.value === 'string') {
    return node.property.value;
  }

  if (node.property.type === 'TemplateLiteral' && node.property.expressions.length === 0) {
    return node.property.quasis[0]?.value.cooked ?? null;
  }

  return null;
}

function findContainingClass(node) {
  let current = node.parent;

  while (current) {
    if (current.type === 'ClassDeclaration' || current.type === 'ClassExpression') {
      return current;
    }

    current = current.parent;
  }

  return null;
}

function isControlValueAccessorReference(expression, controlValueAccessorNames, angularFormsNamespaceNames) {
  if (expression.type === 'Identifier') {
    return controlValueAccessorNames.has(expression.name);
  }

  return (
    expression.type === 'MemberExpression' &&
    !expression.computed &&
    expression.object.type === 'Identifier' &&
    angularFormsNamespaceNames.has(expression.object.name) &&
    expression.property.type === 'Identifier' &&
    expression.property.name === 'ControlValueAccessor'
  );
}

function implementsControlValueAccessor(classNode, controlValueAccessorNames, angularFormsNamespaceNames) {
  return (classNode.implements ?? []).some((implementation) =>
    isControlValueAccessorReference(implementation.expression, controlValueAccessorNames, angularFormsNamespaceNames),
  );
}

export default createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow markForCheck calls outside Angular ControlValueAccessor classes',
    },
    schema: [],
    messages: {
      markForCheckOutsideCva:
        'Do not call markForCheck() outside a ControlValueAccessor. Use template-consumed signals or AsyncPipe instead.',
    },
  },
  defaultOptions: [],
  create(context) {
    const controlValueAccessorNames = new Set();
    const angularFormsNamespaceNames = new Set();

    function trackControlValueAccessorImports(node) {
      for (const statement of node.body) {
        if (statement.type !== 'ImportDeclaration' || statement.source.value !== '@angular/forms') {
          continue;
        }

        for (const specifier of statement.specifiers) {
          if (specifier.type === 'ImportSpecifier' && getImportedName(specifier) === 'ControlValueAccessor') {
            controlValueAccessorNames.add(specifier.local.name);
          } else if (specifier.type === 'ImportNamespaceSpecifier') {
            angularFormsNamespaceNames.add(specifier.local.name);
          }
        }
      }
    }

    function checkCallExpression(node) {
      if (node.callee.type !== 'MemberExpression' || getStaticMemberName(node.callee) !== 'markForCheck') {
        return;
      }

      const containingClass = findContainingClass(node);

      if (
        !containingClass ||
        !implementsControlValueAccessor(containingClass, controlValueAccessorNames, angularFormsNamespaceNames)
      ) {
        context.report({
          node,
          messageId: 'markForCheckOutsideCva',
        });
      }
    }

    return {
      Program: trackControlValueAccessorImports,
      CallExpression: checkCallExpression,
    };
  },
});
