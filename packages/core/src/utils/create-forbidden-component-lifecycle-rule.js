import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/fylein/fyle-eslint-plugin/blob/master/packages/docs/rules/${name}.md`,
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
  const { computed, key } = node;

  if (!computed && key.type === 'Identifier') {
    return key.name;
  }

  if (key.type === 'Literal' && typeof key.value === 'string') {
    return key.value;
  }

  if (key.type === 'TemplateLiteral' && key.expressions.length === 0) {
    return key.quasis[0]?.value.cooked ?? null;
  }

  return null;
}

function isTrackedComponentDecorator(decorator, componentDecoratorNames, angularCoreNamespaceNames) {
  const expression = decorator.expression;
  const callee = expression.type === 'CallExpression' ? expression.callee : expression;

  if (callee.type === 'Identifier') {
    return componentDecoratorNames.has(callee.name);
  }

  return (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.object.type === 'Identifier' &&
    angularCoreNamespaceNames.has(callee.object.name) &&
    callee.property.type === 'Identifier' &&
    callee.property.name === 'Component'
  );
}

function isAngularComponentClass(classNode, componentDecoratorNames, angularCoreNamespaceNames) {
  return (classNode.decorators ?? []).some((decorator) =>
    isTrackedComponentDecorator(decorator, componentDecoratorNames, angularCoreNamespaceNames),
  );
}

export function createForbiddenComponentLifecycleRule({ name, forbiddenHooks, description, message }) {
  return createRule({
    name,
    meta: {
      type: 'problem',
      docs: {
        description,
      },
      schema: [],
      messages: {
        forbiddenHook: message,
      },
    },
    defaultOptions: [],
    create(context) {
      const componentDecoratorNames = new Set();
      const angularCoreNamespaceNames = new Set();

      function trackComponentImport(node) {
        if (node.source.value !== '@angular/core') {
          return;
        }

        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportSpecifier' && getImportedName(specifier) === 'Component') {
            componentDecoratorNames.add(specifier.local.name);
          } else if (specifier.type === 'ImportNamespaceSpecifier') {
            angularCoreNamespaceNames.add(specifier.local.name);
          }
        }
      }

      function checkMember(node) {
        if (node.static) {
          return;
        }

        const hook = getStaticMemberName(node);
        const classNode = node.parent?.parent;

        if (
          hook &&
          forbiddenHooks.has(hook) &&
          (classNode?.type === 'ClassDeclaration' || classNode?.type === 'ClassExpression') &&
          isAngularComponentClass(classNode, componentDecoratorNames, angularCoreNamespaceNames)
        ) {
          context.report({
            node,
            messageId: 'forbiddenHook',
            data: { hook },
          });
        }
      }

      return {
        ImportDeclaration: trackComponentImport,
        MethodDefinition: checkMember,
        PropertyDefinition: checkMember,
      };
    },
  });
}
