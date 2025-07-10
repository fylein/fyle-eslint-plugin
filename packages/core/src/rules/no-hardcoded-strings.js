import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  () => `https://github.com/fylein/fyle-app/blob/master/custom-eslint-rules/no-hardcoded-strings/README.md`,
);

const RULE_NAME = 'no-hardcoded-strings';

/**
 * Checks if a string contains meaningful user-facing content (must have alphabetic chars).
 * Strings with only special characters/punctuation are ignored.
 */
function hasAlphabeticChars(str) {
  // Use Unicode aware regex so non-ASCII letters (é, ö, च, 书 …) are treated as alphabetic
  return /\p{L}/u.test(str);
}

export default createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallows hard-coded user-facing text. Works seamlessly with eslint-plugin-diff.',
      recommended: 'recommended',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          nonUserFacingPattern: {
            type: 'string',
            description: 'RegExp pattern for non-user-facing property names to ignore.',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noHardString:
        'Hard-coded string "{{text}}" should be replaced with a translation key. Refer to https://www.notion.so/fyleuniverse/i18n-translation-file-structure-1ea2ed8bfcb3803da113d3bfc2774ec1#1ea2ed8bfcb3809a9a0ddc05a548eb49 for more details.',
    },
  },
  defaultOptions: [{}],

  create(context) {
    const { nonUserFacingPattern } = context.options[0] || {};

    if (nonUserFacingPattern) {
      try {
        // More comprehensive ReDoS detection
        const isUnsafePattern = (pattern) => {
          if (pattern.length > 1000) return true;
          const unsafePatterns = [
            '(.*+)+',
            '(.*)*',
            '(.+)+',
            '(.?)+',
            '(.{',
            '(a|b)*+',
            '(a|b)+*',
            '(.*|.*)',
            '((',
            ')))',
            '{999',
            '{9999',
          ];
          return unsafePatterns.some((unsafePattern) => pattern.includes(unsafePattern));
        };

        // Allow grouping and commas if needed
        const allowedChars = /^[a-zA-Z0-9|_\-(),]+$/;

        if (!allowedChars.test(nonUserFacingPattern)) {
          throw new Error('Pattern contains disallowed characters');
        }

        if (isUnsafePattern(nonUserFacingPattern)) {
          throw new Error('Potentially unsafe pattern detected');
        }

        // Instead of testing with RegExp, we'll use a safer approach
        // Split the pattern and validate each part
        const patternParts = nonUserFacingPattern.split(/[|,()]/).filter((part) => part.trim());
        for (const part of patternParts) {
          if (part.trim() && !/^[a-zA-Z0-9_]+$/.test(part.trim())) {
            throw new Error('Invalid pattern part: ' + part);
          }
        }
      } catch (error) {
        context.report({
          loc: { line: 1, column: 1 },
          message: `Invalid or unsafe nonUserFacingPattern: "${nonUserFacingPattern}". ${error.message}. Using default pattern only.`,
        });
      }
    }

    // Create a safe function to test property names instead of using dynamic RegExp
    function isNonUserFacingProperty(propertyName) {
      // Test against default pattern first (hardcoded for safety)
      const defaultPattern =
        /(class|style|type|form|loading|template|icon|size|src|href|router|query|fragment|preserve|skip|replace|state|button|default|validate|element|prefix|direction|styleClasses|tooltipShowEvent|keys|option|position|append|source|test|field|autocomplete|Id|image|url|height|width|target|pSortableColumn|name|alignment|mode|accept|responsiveLayout)/i;

      if (defaultPattern.test(propertyName)) {
        return true;
      }

      // Test against custom pattern if available (using string operations)
      if (nonUserFacingPattern) {
        const customParts = nonUserFacingPattern.split(/[|,()]/).filter((part) => part.trim());
        return customParts.some((part) => part.toLowerCase() === propertyName.toLowerCase());
      }

      return false;
    }

    // Translation keys are usually dot or underscore separated; hyphens alone shouldn't be considered a key
    // Using a safer approach to avoid ReDoS vulnerability - simple string validation instead of complex regex
    function isValidTranslationKey(str) {
      // Must start with alphanumeric
      if (!/^[a-z0-9]/.test(str)) return false;

      // Must end with alphanumeric
      if (!/[a-z0-9]$/.test(str)) return false;

      // Split by dots and underscores and validate each part
      const parts = str.split(/[._]/);
      return parts.length >= 2 && parts.every((part) => /^[a-z0-9]+$/.test(part));
    }

    // Track toast service variables by their TypeScript type annotations
    // const toastServiceVars = new Set();

    const isTestFile = context.filename && /\.(spec|test)\.[jt]s$/.test(context.filename);

    function report(node, text) {
      // Skip technical/system strings that are not user-facing
      const technicalStringPattern =
        /^(\/|#|https?:\/\/|access_denied|error_|success_|warning_|info_|debug_|data-|aria-)/i;
      const trimmedText = text.trim();

      // Ignore strings with underscores or hyphens, as they are likely technical identifiers
      if (/[_-]/.test(trimmedText)) {
        return;
      }

      // Ignore email patterns
      const emailPattern = /\S+@\S+\.\S+/;
      if (emailPattern.test(trimmedText)) {
        return;
      }

      // Ignore common file extensions
      const reservedWords = ['xlsx', 'xlx', 'csv', 'pdf', 'png'];
      if (reservedWords.includes(trimmedText.toLowerCase())) {
        return;
      }

      if (technicalStringPattern.test(trimmedText) || isValidTranslationKey(trimmedText)) {
        return;
      }

      context.report({
        node,
        messageId: 'noHardString',
        data: { text: text.slice(0, 50) },
      });
    }

    /*
    function isTrackingCall(callNode) {
      // Skip eventTrack(...) or *trackingService*.method(...)
      if (!callNode || callNode.type !== AST_NODE_TYPES.CallExpression) {
        return false;
      }

      const isIdentifierMatch = (ident) => ident && ident.type === AST_NODE_TYPES.Identifier && ident.name === 'eventTrack';

      // eventTrack(...)
      if (callNode.callee.type === AST_NODE_TYPES.Identifier && isIdentifierMatch(callNode.callee)) {
        return true;
      }

      // this.eventTrack(...)  OR  someObj.eventTrack(...)
      if (callNode.callee.type === AST_NODE_TYPES.MemberExpression) {
        const { object, property } = callNode.callee;
        if (property.type === AST_NODE_TYPES.Identifier && property.name === 'eventTrack') {
          return true;
        }

        // *.trackingService.*(...)
        const matchesTrackingService = (expr) => expr && expr.type === AST_NODE_TYPES.Identifier && /trackingService/i.test(expr.name);
        if (matchesTrackingService(object)) {
          return true;
        }
        if (object.type === AST_NODE_TYPES.MemberExpression && matchesTrackingService(object.property)) {
          return true;
        }
      }

      return false;
    }
    */

    return {
      // For standalone HTML template files, use Angular template AST nodes
      Text(node) {
        // Only process if this is an HTML file
        if (context.filename && context.filename.endsWith('.html')) {
          const text = node.value.trim();
          if (hasAlphabeticChars(text)) {
            report(node, text);
          }
        }
      },

      // Handle hardcoded strings in HTML attributes
      TextAttribute(node) {
        if (context.filename && context.filename.endsWith('.html')) {
          const attrName = node.name;
          const attrValue = node.value;

          // Check user-facing attributes
          if (['placeholder', 'title', 'alt', 'aria-label', 'aria-description'].includes(attrName)) {
            if (hasAlphabeticChars(attrValue)) {
              report(node, attrValue);
            }
          }
        }
      },

      // Handle Angular property bindings with hardcoded strings
      BoundAttribute(node) {
        if (context.filename && context.filename.endsWith('.html')) {
          const bindingName = node.name;

          // Skip non-user-facing property bindings using safe function
          if (isNonUserFacingProperty(bindingName)) {
            return;
          }

          // Check if the binding contains a pipe (translation)
          if (node.value && node.value.ast) {
            // Skip if it contains transloco pipe (translation keys)
            const sourceSpan = node.value.source;
            if (sourceSpan && (sourceSpan.includes('| transloco') || sourceSpan.includes('|transloco'))) {
              return;
            }

            // Check for literal strings in the binding
            if (node.value.ast.type === 'LiteralPrimitive' && typeof node.value.ast.value === 'string') {
              const stringValue = node.value.ast.value;
              if (hasAlphabeticChars(stringValue)) {
                report(node, stringValue);
              }
            }
          }
        }
      },

      /*
      // Track constructor parameters with toast service types
      'MethodDefinition[key.name="constructor"] Parameter'(node) {
        if (node.typeAnnotation && 
            node.typeAnnotation.typeAnnotation && 
            node.typeAnnotation.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
            node.typeAnnotation.typeAnnotation.typeName &&
            node.typeAnnotation.typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier) {
          
          const typeName = node.typeAnnotation.typeAnnotation.typeName.name;
          if (typeName.includes('ToastMessageService')) {
            
            if (node.type === AST_NODE_TYPES.Identifier) {
              toastServiceVars.add(node.name);
            }
          }
        }
      },

      // Check method calls on tracked toast service variables
      'CallExpression'(node) {
        // Check if this is a method call on a service object (this.someService.method())
        if (
          node.callee.type === AST_NODE_TYPES.MemberExpression &&
          node.callee.object.type === AST_NODE_TYPES.MemberExpression &&
          node.callee.object.object.type === AST_NODE_TYPES.ThisExpression &&
          node.callee.object.property.type === AST_NODE_TYPES.Identifier
        ) {
          const serviceName = node.callee.object.property.name;
          
          // Check if this service variable was identified as a toast service
          if (toastServiceVars.has(serviceName)) {
            // Check all arguments for hardcoded strings
            node.arguments.forEach(arg => {
              if (
                arg.type === AST_NODE_TYPES.Literal &&
                typeof arg.value === 'string' &&
                hasAlphabeticChars(arg.value)
              ) {
                report(arg, arg.value);
              }
            });
          }
        }
      },
      */

      // Check individual string literals in TypeScript code
      Literal(node) {
        if (isTestFile) {
          return;
        }
        if (context.filename && context.filename.endsWith('.ts')) {
          if (typeof node.value === 'string' && hasAlphabeticChars(node.value)) {
            // Check if this is a property definition
            if (node.parent && node.parent.type === AST_NODE_TYPES.PropertyDefinition) {
              // Skip private properties
              if (node.parent.accessibility === 'private' || node.parent.readonly) {
                return;
              }

              // Check if the property name is non-user-facing
              if (node.parent.key.type === AST_NODE_TYPES.Identifier) {
                const propertyName = node.parent.key.name;
                if (isNonUserFacingProperty(propertyName)) {
                  return;
                }
              }

              report(node, node.value);
            }
          }
        }
      },

      // Check template literals
      TemplateLiteral() {
        if (isTestFile) {
          return;
        }
        /*
        if (context.filename && context.filename.endsWith('.ts')) {
          // Quick skip for template literals that are pure translation keys
          if (node.quasis.length === 1 && translationKeyPattern.test(node.quasis[0].value.raw.trim())) {
            return;
          }
          // Check if this template literal is being assigned to a private property
          if (node.parent && node.parent.type === AST_NODE_TYPES.AssignmentExpression) {
            const assignmentTarget = node.parent.left;
            if (assignmentTarget.type === AST_NODE_TYPES.MemberExpression &&
                assignmentTarget.object.type === AST_NODE_TYPES.ThisExpression &&
                assignmentTarget.property.type === AST_NODE_TYPES.Identifier) {
              
              // Find the property definition to check if it's private
              const propertyName = assignmentTarget.property.name;
              
              // Walk up to find the class declaration
              let current = node.parent;
              while (current && current.type !== AST_NODE_TYPES.ClassDeclaration) {
                current = current.parent;
              }
              
              if (current && current.type === AST_NODE_TYPES.ClassDeclaration) {
                // Look for the property definition in the class
                const propertyDef = current.body.body.find(member => 
                  member.type === AST_NODE_TYPES.PropertyDefinition &&
                  member.key.type === AST_NODE_TYPES.Identifier &&
                  member.key.name === propertyName
                );
                
                // Skip if the property is private
                if (propertyDef && propertyDef.accessibility === 'private') {
                  return;
                }
              }
            }
          }
          
          node.quasis.forEach(quasi => {
            if (quasi.value.raw && hasAlphabeticChars(quasi.value.raw) && !translationKeyPattern.test(quasi.value.raw.trim())) {
              report(quasi, quasi.value.raw);
            }
          });
        }
        */
      },
    };
  },
});
