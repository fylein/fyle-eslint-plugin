import { ESLintUtils } from '@typescript-eslint/utils';
import path from 'path';

const createRule = ESLintUtils.RuleCreator(
  () =>
    `https://github.com/fylein/fyle-app/blob/master/custom-eslint-rules/i18n-key-naming-convention/README.md`
);

const RULE_NAME = 'i18n-key-naming-convention';

function kebabToCamelCase(str) {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function stripPrefixes(rawName, suffix, prefixes = ['feature-', 'ui-']) {
  let name = rawName;
  for (const prefix of prefixes) {
    if (name.startsWith(prefix)) {
      name = name.slice(prefix.length);
    }
  }
  return name.replace(suffix, '');
}

function getContextInfo(filename) {
  const base = path.basename(filename);

  if (base.endsWith('.component.html') || base.endsWith('.component.ts')) {
    const cleaned = stripPrefixes(
      base.replace(/\.(html|ts)$/, ''),
      '.component'
    );
    return { prefix: kebabToCamelCase(cleaned), type: 'component' };
  }
  if (base.endsWith('.service.ts')) {
    const cleaned = stripPrefixes(base.replace(/\.ts$/, ''), '.service');
    return { prefix: `services.${kebabToCamelCase(cleaned)}`, type: 'service' };
  }
  if (base.endsWith('.pipe.ts')) {
    const cleaned = stripPrefixes(base.replace(/\.ts$/, ''), '.pipe');
    return { prefix: `pipes.${kebabToCamelCase(cleaned)}`, type: 'pipe' };
  }
  if (base.endsWith('.directive.ts')) {
    const cleaned = stripPrefixes(base.replace(/\.ts$/, ''), '.directive');
    return {
      prefix: `directives.${kebabToCamelCase(cleaned)}`,
      type: 'directive',
    };
  }
  return null;
}

function checkKey(key, contextInfo, context, node, ignoredPrefixes) {
  const { prefix, type } = contextInfo;
  const keyParts = key.split('.');

  // Check if key should be ignored based on ignoredPrefixes
  if (ignoredPrefixes.some((ignoredPrefix) => key.startsWith(ignoredPrefix))) {
    return;
  }

  // Reject keys with empty segments (e.g., trailing dot, consecutive dots)
  if (keyParts.some((p) => p.length === 0)) {
    const minPartsRequired = type === 'component' ? 2 : 3;
    context.report({
      node,
      messageId: 'notEnoughParts',
      data: {
        key,
        minParts: minPartsRequired,
        type,
        example:
          minPartsRequired === 2
            ? 'signIn.warningAccountLockSoon'
            : 'services.warningAccountLockSoon.example',
      },
    });
    return;
  }

  // prefix must match – exact match allowed to validate length later
  if (!(key === prefix || key.startsWith(prefix + '.'))) {
    context.report({
      node,
      messageId: 'mismatchedKey',
      data: { key, expectedPrefix: prefix },
    });
    return;
  }

  if (type === 'component') {
    if (keyParts.length < 2) {
      context.report({
        node,
        messageId: 'notEnoughParts',
        data: {
          key,
          minParts: 2,
          type,
          example: 'signIn.warningAccountLockSoon',
        },
      });
    } else if (keyParts.length > 2) {
      context.report({
        node,
        messageId: 'tooManyParts',
        data: {
          key,
          maxParts: 2,
          type,
          example: 'signIn.warningAccountLockSoon',
        },
      });
    }
  } else {
    if (keyParts.length < 3) {
      context.report({
        node,
        messageId: 'notEnoughParts',
        data: {
          key,
          minParts: 3,
          type,
          example: 'services.warningAccountLockSoon.example',
        },
      });
    } else if (keyParts.length > 3) {
      context.report({
        node,
        messageId: 'tooManyParts',
        data: {
          key,
          maxParts: 3,
          type,
          example: 'services.warningAccountLockSoon.example',
        },
      });
    }
  }
}

function extractKeysFromTemplate(template) {
  const keys = [];
  // Capture any interpolation that pipes into transloco and may include additional
  // arguments/pipes after it. Example: {{ 'foo.bar' | transloco : {count: n} }}
  const interpolationPattern = /{{\s*([^{}]*?)\|\s*transloco\b[^{}]*}}/g;

  // Accept any non-space, non-quote string that contains at least one dot. This
  // is inclusive (even keys that *start* with digits) so that we can still flag
  // them as invalid/mismatched later during validation.
  const keyPattern = /['"]([^\s'".]+[\w.-]*\.[^\s'".]+)['"]/g;
  let match;
  while ((match = interpolationPattern.exec(template)) !== null) {
    const expr = match[1];
    let keyMatch;
    while ((keyMatch = keyPattern.exec(expr)) !== null) {
      keys.push(keyMatch[1]);
    }
  }
  // structural directive *transloco="... read: 'key'"
  const structuralPattern =
    /\bread\s*:\s*['"]([^\s'".]+[\w.-]*\.[^\s'".]+)['"]/g;
  while ((match = structuralPattern.exec(template)) !== null) {
    keys.push(match[1]);
  }
  return keys;
}

function extractKeysFromExpression(exprSource) {
  // Accept any non-space, non-quote string that contains at least one dot. This
  // is inclusive (even keys that *start* with digits) so that we can still flag
  // them as invalid/mismatched later during validation.
  const keyPattern = /['"]([^\s'".]+[\w.-]*\.[^\s'".]+)['"]/g;
  const keys = [];
  let m;
  while ((m = keyPattern.exec(exprSource)) !== null) {
    keys.push(m[1]);
  }
  return keys;
}

export default createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce i18n key naming convention based on file type and name (TypeScript and HTML)',
      category: 'Best Practices',
    },
    messages: {
      mismatchedKey:
        "Key '{{ key }}' does not follow naming convention. Expected the i18n key to start with '{{ expectedPrefix }}.'",
      tooManyParts:
        "Key '{{ key }}' is too long. Max depth for a {{ type }} is {{ maxParts }}. For example, '{{ example }}'",
      notEnoughParts:
        "Key '{{ key }}' is too short. Min depth for a {{ type }} is {{ minParts }}. For example, '{{ example }}'",
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoredPrefixes: {
            type: 'array',
            items: {
              type: 'string',
            },
            description:
              'Array of key prefixes to ignore (e.g., ["common.", "shared."])',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ ignoredPrefixes: [] }],
  create(context) {
    const filename = context.filename ?? '';
    const contextInfo = getContextInfo(filename);
    if (!contextInfo) return {};

    const options = context.options[0] || {};
    const ignoredPrefixes = options.ignoredPrefixes || [];

    const variableTracker = new Map();

    function findLiteralsInTsExpression(expr) {
      const literals = [];
      function dive(node) {
        if (!node) return;
        if (node.type === 'Literal' && typeof node.value === 'string') {
          literals.push(node);
        } else if (node.type === 'ConditionalExpression') {
          dive(node.consequent);
          dive(node.alternate);
        } else if (node.type === 'TemplateLiteral') {
          node.quasis.forEach((quasi) => {
            if (quasi.value && quasi.value.raw) {
              literals.push({
                type: 'Literal',
                value: quasi.value.raw,
                raw: `'${quasi.value.raw}'`,
              });
            }
          });
        }
      }
      dive(expr);
      return literals;
    }

    function trackVariableAssignment(varName, expr) {
      const literals = findLiteralsInTsExpression(expr);
      if (literals.length > 0) {
        const existing = variableTracker.get(varName) || [];
        variableTracker.set(varName, [...existing, ...literals]);
      }
    }

    const tsHandlers = {
      VariableDeclarator(node) {
        if (node.id.type === 'Identifier' && node.init) {
          trackVariableAssignment(node.id.name, node.init);
        }
      },
      AssignmentExpression(node) {
        if (node.left.type === 'Identifier') {
          trackVariableAssignment(node.left.name, node.right);
        }
      },
      Property(node) {
        if (
          node.key.type === 'Identifier' &&
          node.key.name === 'template' &&
          (node.value.type === 'Literal' ||
            node.value.type === 'TemplateLiteral')
        ) {
          let templateContent = '';
          if (node.value.type === 'Literal') {
            templateContent = String(node.value.value);
          } else {
            templateContent = node.value.quasis
              .map((q) => q.value.raw)
              .join('');
          }
          const keys = extractKeysFromTemplate(templateContent);
          keys.forEach((k) =>
            checkKey(k, contextInfo, context, node.value, ignoredPrefixes)
          );
        }
      },
      CallExpression(node) {
        if (
          !(
            node.callee.type === 'MemberExpression' &&
            node.callee.property.type === 'Identifier' &&
            ['translate', 'instant'].includes(node.callee.property.name)
          )
        )
          return;

        const arg = node.arguments[0];
        if (!arg) return;

        if (arg.type === 'Literal' && typeof arg.value === 'string') {
          checkKey(arg.value, contextInfo, context, arg, ignoredPrefixes);
        } else if (arg.type === 'Identifier') {
          if (variableTracker.has(arg.name)) {
            const literals = variableTracker.get(arg.name);
            for (const literalNode of literals) {
              checkKey(
                literalNode.value,
                contextInfo,
                context,
                literalNode,
                ignoredPrefixes
              );
            }
          }
        } else if (arg.type === 'ConditionalExpression') {
          const literals = findLiteralsInTsExpression(arg);
          for (const literalNode of literals) {
            checkKey(
              literalNode.value,
              contextInfo,
              context,
              literalNode,
              ignoredPrefixes
            );
          }
        }
      },
    };

    const ngTemplateHandlers = {
      Text(node) {
        // Plain text node that might contain an interpolation with transloco pipe
        if (typeof node.value !== 'string') return;
        if (!node.value.includes('| transloco')) return;

        const keys = extractKeysFromExpression(node.value);
        keys.forEach((k) =>
          checkKey(k, contextInfo, context, node, ignoredPrefixes)
        );
      },

      TextAttribute(node) {
        // structural directive like *transloco="... read: 'key'"
        if (node.name !== 'transloco' && !/transloco/i.test(node.value)) return;
        const keys = extractKeysFromExpression(node.value);
        keys.forEach((k) =>
          checkKey(k, contextInfo, context, node, ignoredPrefixes)
        );
      },

      BoundAttribute(node) {
        if (!node.value || !node.value.source) return;
        if (!node.value.source.includes('transloco')) return;
        const keys = extractKeysFromExpression(node.value.source);
        keys.forEach((k) =>
          checkKey(k, contextInfo, context, node, ignoredPrefixes)
        );
      },
    };

    ngTemplateHandlers.BoundText = function (node) {
      if (
        node.value &&
        node.value.source &&
        node.value.source.includes('transloco')
      ) {
        const keys = extractKeysFromExpression(node.value.source);
        keys.forEach((k) =>
          checkKey(k, contextInfo, context, node, ignoredPrefixes)
        );
      }
    };

    return {
      ...tsHandlers,
      ...ngTemplateHandlers,
    };
  },
});
