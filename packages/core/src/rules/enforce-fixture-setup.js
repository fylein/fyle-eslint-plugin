import fs from 'node:fs';
import path from 'node:path';
import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/fylein/fyle-eslint-plugin/blob/main/packages/docs/rules/enforce-fixture-setup.md',
);

const RULE_NAME = 'enforce-fixture-setup';
const FIXTURE_FILE_NAME = 'fixture.yml';
const SPEC_FILE_PATTERN = /\.spec\.[cm]?[jt]sx?$/u;
const FIXTURE_SETUP_ALLOW_PATTERN = /fixture-setup-allow:\s*\S/u;
const REPORT_STATES = new Set(['draft', 'submitted', 'sent_back', 'approved', 'processing', 'paid']);
const COMPLETE_EXPENSE_STATES = new Set(['complete']);

const alwaysSupported = () => true;

function hasLiteralArgumentValue(node, argumentIndex, supportedValues) {
  const argument = node.arguments[argumentIndex];
  return argument?.type === 'Literal' && supportedValues.has(argument.value);
}

const serviceDefinitions = {
  ReportsService: {
    modules: new Set(['reports-service']),
    methods: {
      bulkCreate: {
        fixturePath: 'employees[].reports',
        isSupported: (node) => hasLiteralArgumentValue(node, 1, REPORT_STATES),
      },
      bulkCreateForUsers: {
        fixturePath: 'employees[].reports',
        isSupported: (node) => hasLiteralArgumentValue(node, 1, REPORT_STATES),
      },
    },
  },
  ExpensesService: {
    modules: new Set(['expenses-service']),
    methods: {
      createReimbursableExpenses: {
        fixturePath: 'employees[].unreported_expenses or employees[].reports[].expenses',
        isSupported: (node) => hasLiteralArgumentValue(node, 1, COMPLETE_EXPENSE_STATES),
      },
    },
  },
  PolicyService: {
    modules: new Set(['policy-service']),
    methods: {
      createFlaggingPolicy: {
        fixturePath: 'policies[]',
        isSupported: alwaysSupported,
      },
    },
  },
  CorporateCardService: {
    modules: new Set(['corporate-card.service']),
    methods: {
      createVisaRTFCard: {
        fixturePath: 'corporate_cards[]',
        isSupported: alwaysSupported,
      },
      createMastercardRTFCard: {
        fixturePath: 'corporate_cards[]',
        isSupported: alwaysSupported,
      },
      enrollCorporateCard: {
        fixturePath: 'corporate_cards[]',
        isSupported: alwaysSupported,
      },
    },
  },
  CategoriesService: {
    modules: new Set(['categories.service']),
    methods: {
      createCategory: {
        fixturePath: 'categories[]',
        isSupported: alwaysSupported,
      },
    },
  },
  SubscriptionsService: {
    modules: new Set(['subscriptions.service']),
    methods: {
      changePlanToBusiness: {
        fixturePath: 'subscription.plan',
        isSupported: alwaysSupported,
      },
    },
  },
  OrgSettingsService: {
    modules: new Set(['org-settings-service']),
    methods: {
      updateOrgSettings: {
        fixturePath: 'org_settings',
        isSupported: alwaysSupported,
      },
    },
  },
  ExpenseFieldsService: {
    modules: new Set(['expense-fields.service']),
    methods: {
      createExpenseField: {
        fixturePath: 'expense_fields[]',
        isSupported: alwaysSupported,
      },
    },
  },
  CostCentersService: {
    modules: new Set(['cost-centers.service']),
    methods: {
      createCostCenter: {
        fixturePath: 'cost_centers[]',
        isSupported: alwaysSupported,
      },
    },
  },
  ProjectsService: {
    modules: new Set(['projects.service', 'projects-service']),
    methods: {
      createProject: {
        fixturePath: 'projects[]',
        isSupported: alwaysSupported,
      },
    },
  },
  TaxService: {
    modules: new Set(['tax.service']),
    methods: {
      createTaxGroup: {
        fixturePath: 'tax_groups[]',
        isSupported: alwaysSupported,
      },
    },
  },
  PerDiemService: {
    modules: new Set(['per-diem.service']),
    methods: {
      createPerDiemRate: {
        fixturePath: 'per_diem_rates[]',
        isSupported: alwaysSupported,
      },
    },
  },
  AutomateReportSubmissionService: {
    modules: new Set(['automate-report-submission-service']),
    methods: {
      createSchedule: {
        fixturePath: 'report_submission_schedules[]',
        isSupported: alwaysSupported,
      },
    },
  },
  MileageService: {
    modules: new Set(['mileage.service']),
    methods: {
      createMileageRate: {
        fixturePath: 'mileage_rates[]',
        isSupported: alwaysSupported,
      },
    },
  },
  RecurrencesService: {
    modules: new Set(['recurrences.service']),
    methods: {
      createRecurringExpense: {
        fixturePath: 'recurring_expenses[]',
        isSupported: alwaysSupported,
      },
    },
  },
  AdvancesService: {
    modules: new Set(['advances.service']),
    methods: {
      createAdvanceRequests: {
        fixturePath: 'advance_requests[]',
        isSupported: alwaysSupported,
      },
    },
  },
  ExpenseRulesService: {
    modules: new Set(['expense-rules.service']),
    methods: {
      createExpenseRule: {
        fixturePath: 'expense_rules[]',
        isSupported: alwaysSupported,
      },
    },
  },
};

function normalizeModuleName(importSource) {
  const normalizedSource = importSource.replaceAll('\\', '/');
  if (!/(?:^|\/)common\/setup\//u.test(normalizedSource)) {
    return null;
  }

  return path.posix.basename(normalizedSource).replace(/\.[cm]?[jt]s$/u, '');
}

function unwrapExpression(node) {
  let current = node;

  while (current) {
    if (current.type === 'AwaitExpression') {
      current = current.argument;
      continue;
    }

    if (
      current.type === 'ChainExpression' ||
      current.type === 'TSAsExpression' ||
      current.type === 'TSNonNullExpression' ||
      current.type === 'TSTypeAssertion'
    ) {
      current = current.expression;
      continue;
    }

    break;
  }

  return current;
}

function isStaticValue(node) {
  const value = unwrapExpression(node);
  if (!value) {
    return false;
  }

  if (value.type === 'Literal') {
    return true;
  }

  if (value.type === 'Identifier') {
    return value.name === 'undefined';
  }

  if (value.type === 'TemplateLiteral') {
    return value.expressions.length === 0;
  }

  if (value.type === 'UnaryExpression') {
    return ['+', '-', '!', '~'].includes(value.operator) && isStaticValue(value.argument);
  }

  if (value.type === 'ArrayExpression') {
    return value.elements.every(
      (element) => element !== null && element.type !== 'SpreadElement' && isStaticValue(element),
    );
  }

  if (value.type === 'ObjectExpression') {
    return value.properties.every(
      (property) =>
        property.type === 'Property' &&
        property.kind === 'init' &&
        !property.computed &&
        !property.method &&
        isStaticValue(property.value),
    );
  }

  return false;
}

function getUnusedExpressionStatement(node) {
  let current = node;

  while (
    current.parent &&
    (current.parent.type === 'AwaitExpression' ||
      current.parent.type === 'ChainExpression' ||
      current.parent.type === 'TSAsExpression' ||
      current.parent.type === 'TSNonNullExpression' ||
      current.parent.type === 'TSTypeAssertion')
  ) {
    current = current.parent;
  }

  return current.parent?.type === 'ExpressionStatement' ? current.parent : null;
}

export default createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Require fixture.yml for E2E specs and prevent straightforward fixture-backed runtime setup',
    },
    schema: [],
    messages: {
      missingFixture:
        'E2E spec "{{specFile}}" must have a sibling {{fixtureFile}}. Fixtures are resolved from the spec directory.',
      useFixture:
        '{{serviceName}}.{{methodName}}() has fixture support at "{{fixturePath}}" and its result is unused. Move this prerequisite setup to fixture.yml, or add an adjacent "fixture-setup-allow: <reason>" comment when runtime creation is intentional.',
    },
  },
  defaultOptions: [],
  create(context) {
    const filename = context.getFilename();
    if (filename === '<input>' || filename === '<text>' || !SPEC_FILE_PATTERN.test(filename)) {
      return {};
    }

    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const importedServiceClasses = new Map();
    const serviceInstances = new Map();

    function getServiceFromInitializer(initializer) {
      const expression = unwrapExpression(initializer);
      if (!expression) {
        return null;
      }

      if (expression.type === 'NewExpression' && expression.callee.type === 'Identifier') {
        return importedServiceClasses.get(expression.callee.name) ?? null;
      }

      if (
        expression.type === 'CallExpression' &&
        expression.callee.type === 'MemberExpression' &&
        !expression.callee.computed &&
        expression.callee.object.type === 'Identifier' &&
        expression.callee.property.type === 'Identifier' &&
        expression.callee.property.name === 'init'
      ) {
        return importedServiceClasses.get(expression.callee.object.name) ?? null;
      }

      return null;
    }

    function trackServiceInstance(target, initializer) {
      if (target.type !== 'Identifier') {
        return;
      }

      const serviceName = getServiceFromInitializer(initializer);
      if (serviceName) {
        serviceInstances.set(target.name, serviceName);
      }
    }

    function hasFixtureSetupAllowComment(statement) {
      return sourceCode.getCommentsBefore(statement).some((comment) => {
        const isAdjacent = statement.loc && comment.loc && statement.loc.start.line - comment.loc.end.line <= 1;
        return isAdjacent && FIXTURE_SETUP_ALLOW_PATTERN.test(comment.value);
      });
    }

    return {
      Program(node) {
        const fixturePath = path.join(path.dirname(filename), FIXTURE_FILE_NAME);
        if (!fs.existsSync(fixturePath)) {
          context.report({
            node,
            messageId: 'missingFixture',
            data: {
              specFile: path.basename(filename),
              fixtureFile: FIXTURE_FILE_NAME,
            },
          });
        }
      },

      ImportDeclaration(node) {
        if (typeof node.source.value !== 'string') {
          return;
        }

        const moduleName = normalizeModuleName(node.source.value);
        if (!moduleName) {
          return;
        }

        for (const specifier of node.specifiers) {
          if (specifier.type !== 'ImportSpecifier' || specifier.imported.type !== 'Identifier') {
            continue;
          }

          const serviceName = specifier.imported.name;
          const definition = serviceDefinitions[serviceName];
          if (definition?.modules.has(moduleName)) {
            importedServiceClasses.set(specifier.local.name, serviceName);
          }
        }
      },

      VariableDeclarator(node) {
        if (node.init) {
          trackServiceInstance(node.id, node.init);
        }
      },

      AssignmentExpression(node) {
        trackServiceInstance(node.left, node.right);
      },

      CallExpression(node) {
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.computed ||
          node.callee.object.type !== 'Identifier' ||
          node.callee.property.type !== 'Identifier'
        ) {
          return;
        }

        const serviceName = serviceInstances.get(node.callee.object.name);
        if (!serviceName) {
          return;
        }

        const methodName = node.callee.property.name;
        const methodDefinition = serviceDefinitions[serviceName].methods[methodName];
        if (!methodDefinition || !methodDefinition.isSupported(node)) {
          return;
        }

        const statement = getUnusedExpressionStatement(node);
        if (!statement || !node.arguments.every(isStaticValue) || hasFixtureSetupAllowComment(statement)) {
          return;
        }

        context.report({
          node,
          messageId: 'useFixture',
          data: {
            serviceName,
            methodName,
            fixturePath: methodDefinition.fixturePath,
          },
        });
      },
    };
  },
});
