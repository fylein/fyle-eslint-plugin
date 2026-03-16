import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/fylein/fyle-eslint-plugin/blob/main/packages/docs/rules/no-mutate-format-tokens.md',
);

const RULE_NAME = 'no-mutate-format-tokens';

export default createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent mutating FORMAT_PREFERENCES / DATE_PIPE_DEFAULT_OPTIONS (org-level formatting tokens)',
    },
    schema: [],
    messages: {
      noMutateFormatTokens:
        'Do not mutate formatting tokens (FORMAT_PREFERENCES / DATE_PIPE_DEFAULT_OPTIONS). These are managed centrally via InitializationService.',
    },
  },
  defaultOptions: [],
  create(context) {
    // Local names for tokens (handle aliased imports).
    const formatPreferencesTokenLocalNames = new Set(['FORMAT_PREFERENCES']);
    const datePipeDefaultOptionsTokenLocalNames = new Set(['DATE_PIPE_DEFAULT_OPTIONS']);

    // Variables that reference either token object (or any alias of it / its nested objects).
    const protectedIdentifiers = new Set();

    function isInjectCall(node) {
      return (
        node &&
        node.type === 'CallExpression' &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'inject' &&
        node.arguments &&
        node.arguments.length >= 1 &&
        node.arguments[0].type === 'Identifier'
      );
    }

    function isFormattingTokenIdentifier(identifierNode) {
      if (!identifierNode || identifierNode.type !== 'Identifier') {
        return false;
      }
      return (
        formatPreferencesTokenLocalNames.has(identifierNode.name) ||
        datePipeDefaultOptionsTokenLocalNames.has(identifierNode.name)
      );
    }

    function getRootIdentifierNameFromMemberExpression(node) {
      /**
       * Get the "root" variable name for a member-expression chain.
       *
       * Examples:
       * - `fp.currencyFormat.decimalSeparator`     -> "fp"
       * - `this.formatPreferences.currencyFormat`  -> "formatPreferences"
       * - `this.datePipeOptions.dateFormat`        -> "datePipeOptions"
       */
      let current = node;
      while (current && current.type === 'MemberExpression') {
        const obj = current.object;

        if (obj && obj.type === 'Identifier') {
          return obj.name;
        }

        if (obj && obj.type === 'ThisExpression') {
          if (current.property && current.property.type === 'Identifier') {
            return current.property.name;
          }
          return null;
        }

        current = obj;
      }

      return null;
    }

    function isProtectedMutationTarget(node) {
      if (!node) {
        return false;
      }
      if (node.type === 'Identifier') {
        return protectedIdentifiers.has(node.name);
      }
      if (node.type === 'MemberExpression') {
        const root = getRootIdentifierNameFromMemberExpression(node);
        return !!root && protectedIdentifiers.has(root);
      }
      return false;
    }

    function trackIdentifierFromInit(id, init) {
      if (!id || id.type !== 'Identifier' || !init) {
        return;
      }

      // Direct token injection: const x = inject(FORMAT_PREFERENCES)
      if (isInjectCall(init) && isFormattingTokenIdentifier(init.arguments[0])) {
        protectedIdentifiers.add(id.name);
        return;
      }

      // Alias: const x = y; where y is already protected
      if (init.type === 'Identifier' && protectedIdentifiers.has(init.name)) {
        protectedIdentifiers.add(id.name);
        return;
      }

      // Alias to nested object: const x = fp.currencyFormat;
      if (init.type === 'MemberExpression') {
        const root = getRootIdentifierNameFromMemberExpression(init);
        if (root && protectedIdentifiers.has(root)) {
          protectedIdentifiers.add(id.name);
        }
      }
    }

    return {
      Program(programNode) {
        // Collect local import names for the tokens.
        for (const stmt of programNode.body || []) {
          if (stmt.type !== 'ImportDeclaration') {
            continue;
          }

          const source = stmt.source && stmt.source.value;
          if (source !== '@fyle/format-preferences-token' && source !== '@angular/common') {
            continue;
          }

          for (const spec of stmt.specifiers || []) {
            if (spec.type !== 'ImportSpecifier') {
              continue;
            }

            const importedName = spec.imported && spec.imported.type === 'Identifier' ? spec.imported.name : null;
            const localName = spec.local && spec.local.type === 'Identifier' ? spec.local.name : null;
            if (!importedName || !localName) {
              continue;
            }

            if (source === '@fyle/format-preferences-token' && importedName === 'FORMAT_PREFERENCES') {
              formatPreferencesTokenLocalNames.add(localName);
            }

            if (source === '@angular/common' && importedName === 'DATE_PIPE_DEFAULT_OPTIONS') {
              datePipeDefaultOptionsTokenLocalNames.add(localName);
            }
          }
        }
      },

      // const x = ...
      VariableDeclarator(node) {
        if (!node.init) {
          return;
        }

        // Disallow destructuring directly from the tokens: const { ... } = inject(FORMAT_PREFERENCES)
        if (
          node.id.type === 'ObjectPattern' &&
          isInjectCall(node.init) &&
          isFormattingTokenIdentifier(node.init.arguments[0])
        ) {
          context.report({ node: node.id, messageId: 'noMutateFormatTokens' });
          return;
        }

        trackIdentifierFromInit(node.id, node.init);
      },

      // class fields: private x = ...
      PropertyDefinition(node) {
        if (!node.value) {
          return;
        }
        if (!node.key || node.key.type !== 'Identifier') {
          return;
        }

        trackIdentifierFromInit(node.key, node.value);
      },

      // x = y (track aliases) and x.prop = ... (flag mutations)
      AssignmentExpression(node) {
        // Flag mutations like fp.timeFormat = ..., fp.currencyFormat.decimalSeparator = ...
        if (isProtectedMutationTarget(node.left)) {
          context.report({ node, messageId: 'noMutateFormatTokens' });
          return;
        }

        // Track aliasing through assignments: temp = inject(FORMAT_PREFERENCES) OR temp = fp.currencyFormat
        if (node.left.type === 'Identifier') {
          trackIdentifierFromInit(node.left, node.right);
        }
      },

      // ++fp.someField / fp.someField++
      UpdateExpression(node) {
        if (isProtectedMutationTarget(node.argument)) {
          context.report({ node, messageId: 'noMutateFormatTokens' });
        }
      },
    };
  },
});
