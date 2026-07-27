import path from 'node:path';
import { RuleTester } from '@typescript-eslint/rule-tester';
import tsParser from '@typescript-eslint/parser';
import rule from '../rules/enforce-fixture-setup.js';

const testDirectory = path.resolve(process.cwd(), 'src', 'tests');
const withFixtureFilename = path.join(
  testDirectory,
  'fixtures',
  'fixture-setup',
  'with-fixture',
  'fixture-backed.spec.ts',
);
const withoutFixtureFilename = path.join(
  testDirectory,
  'fixtures',
  'fixture-setup',
  'without-fixture',
  'missing-fixture.spec.ts',
);

const additionalFixtureBackedCalls = [
  {
    serviceName: 'ReportsService',
    moduleName: 'reports-service',
    methodName: 'bulkCreateForUsers',
    arguments: "1, 'approved', ['employee@example.com']",
    fixturePath: 'employees[].reports',
  },
  {
    serviceName: 'CorporateCardService',
    moduleName: 'corporate-card.service',
    methodName: 'createVisaRTFCard',
    arguments: "'4111111111111111'",
    fixturePath: 'corporate_cards[]',
  },
  {
    serviceName: 'CorporateCardService',
    moduleName: 'corporate-card.service',
    methodName: 'createMastercardRTFCard',
    arguments: "'5555555555554444'",
    fixturePath: 'corporate_cards[]',
  },
  {
    serviceName: 'CorporateCardService',
    moduleName: 'corporate-card.service',
    methodName: 'enrollCorporateCard',
    arguments: "'4111111111111111', 'visa'",
    fixturePath: 'corporate_cards[]',
  },
  {
    serviceName: 'ExpenseFieldsService',
    moduleName: 'expense-fields.service',
    methodName: 'createExpenseField',
    arguments: "'Department', 'TEXT', false, null",
    fixturePath: 'expense_fields[]',
  },
  {
    serviceName: 'ProjectsService',
    moduleName: 'projects.service',
    methodName: 'createProject',
    arguments: "'Project Alpha', ['Food']",
    fixturePath: 'projects[]',
  },
  {
    serviceName: 'TaxService',
    moduleName: 'tax.service',
    methodName: 'createTaxGroup',
    arguments: "'GST', 18",
    fixturePath: 'tax_groups[]',
  },
  {
    serviceName: 'PerDiemService',
    moduleName: 'per-diem.service',
    methodName: 'createPerDiemRate',
    arguments: "{ name: 'Domestic', currency: 'USD', rate: 100 }",
    fixturePath: 'per_diem_rates[]',
  },
  {
    serviceName: 'AutomateReportSubmissionService',
    moduleName: 'automate-report-submission-service',
    methodName: 'createSchedule',
    arguments: "'Weekly', 'fri'",
    fixturePath: 'report_submission_schedules[]',
  },
  {
    serviceName: 'MileageService',
    moduleName: 'mileage.service',
    methodName: 'createMileageRate',
    arguments: "10, 'Car'",
    fixturePath: 'mileage_rates[]',
  },
  {
    serviceName: 'RecurrencesService',
    moduleName: 'recurrences.service',
    methodName: 'createRecurringExpense',
    arguments: "100, 'Internet', 'Provider'",
    fixturePath: 'recurring_expenses[]',
  },
  {
    serviceName: 'AdvancesService',
    moduleName: 'advances.service',
    methodName: 'createAdvanceRequests',
    arguments: "{ amount: 100, purpose: 'Travel', currency: 'USD' }",
    fixturePath: 'advance_requests[]',
  },
  {
    serviceName: 'ExpenseRulesService',
    moduleName: 'expense-rules.service',
    methodName: 'createExpenseRule',
    arguments: "{ if: { merchant_contains: 'Uber' }, set: { purpose: 'Travel' } }",
    fixturePath: 'expense_rules[]',
  },
];

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

ruleTester.run('enforce-fixture-setup', rule, {
  valid: [
    {
      filename: withFixtureFilename,
      code: `
        import { test } from '../../../../common/fixtures';

        test('uses its fixture', async ({ page }) => {
          await page.goto('/');
        });
      `,
    },
    {
      filename: withFixtureFilename,
      code: `
        import { CorporateCardService } from '../../../../common/setup/corporate-card.service';

        async function setup(account) {
          const corporateCardService = await CorporateCardService.init(account);
          const card = await corporateCardService.createVisaRTFCard('4111111111111111');
          return card.id;
        }
      `,
    },
    {
      filename: withFixtureFilename,
      code: `
        import { PolicyService } from '../../../../common/setup/policy-service';

        async function setup(account, data) {
          const policyService = await PolicyService.init(account);
          await policyService.createFlaggingPolicy(data.maxAmount);
        }
      `,
    },
    {
      filename: withFixtureFilename,
      code: `
        import { PolicyService } from '../../../../common/setup/policy-service';

        async function testPolicyCreation(account) {
          const policyService = await PolicyService.init(account);
          // fixture-setup-allow: policy creation is the behavior under test
          await policyService.createFlaggingPolicy(100);
        }
      `,
    },
    {
      filename: withFixtureFilename,
      code: `
        import { ExpensesService } from '../../../../common/setup/expenses-service';

        async function setup(account) {
          const expensesService = await ExpensesService.init(account);
          await expensesService.createUnassignedTransaction('bcard123');
          await expensesService.createReimbursableExpenses(1, 'incomplete');
        }
      `,
    },
    {
      filename: path.join(testDirectory, 'ordinary-file.ts'),
      code: `
        export const value = 1;
      `,
    },
  ],
  invalid: [
    {
      filename: withoutFixtureFilename,
      code: `
        import { test } from '../../../../common/fixtures';

        test('has no fixture', async () => {});
      `,
      errors: [{ messageId: 'missingFixture' }],
    },
    {
      filename: withFixtureFilename,
      code: `
        import { PolicyService } from '../../../../common/setup/policy-service';
        import { CategoriesService } from '../../../../common/setup/categories.service';
        import { SubscriptionsService } from '../../../../common/setup/subscriptions.service';
        import { OrgSettingsService } from '../../../../common/setup/org-settings-service';

        async function setup(account) {
          const policyService = await PolicyService.init(account);
          const categoriesService = await CategoriesService.init(account);
          const subscriptionsService = await SubscriptionsService.init(account);
          const orgSettingsService = await OrgSettingsService.init(account);

          await policyService.createFlaggingPolicy(100, 'Test Policy');
          await categoriesService.createCategory('Food');
          await subscriptionsService.changePlanToBusiness();
          await orgSettingsService.updateOrgSettings({ project_settings: { enabled: true } });
        }
      `,
      errors: [
        {
          messageId: 'useFixture',
          data: {
            serviceName: 'PolicyService',
            methodName: 'createFlaggingPolicy',
            fixturePath: 'policies[]',
          },
        },
        {
          messageId: 'useFixture',
          data: {
            serviceName: 'CategoriesService',
            methodName: 'createCategory',
            fixturePath: 'categories[]',
          },
        },
        {
          messageId: 'useFixture',
          data: {
            serviceName: 'SubscriptionsService',
            methodName: 'changePlanToBusiness',
            fixturePath: 'subscription.plan',
          },
        },
        {
          messageId: 'useFixture',
          data: {
            serviceName: 'OrgSettingsService',
            methodName: 'updateOrgSettings',
            fixturePath: 'org_settings',
          },
        },
      ],
    },
    {
      filename: withFixtureFilename,
      code: `
        import { ReportsService as ReportSetup } from '../../../../common/setup/reports-service';
        import { ExpensesService } from '../../../../common/setup/expenses-service';

        let reportsService;

        async function setup(account) {
          reportsService = await ReportSetup.init(account);
          const expensesService = new ExpensesService(account);

          await reportsService.bulkCreate(2, 'submitted');
          await expensesService.createReimbursableExpenses(3, 'complete');
        }
      `,
      errors: [
        {
          messageId: 'useFixture',
          data: {
            serviceName: 'ReportsService',
            methodName: 'bulkCreate',
            fixturePath: 'employees[].reports',
          },
        },
        {
          messageId: 'useFixture',
          data: {
            serviceName: 'ExpensesService',
            methodName: 'createReimbursableExpenses',
            fixturePath: 'employees[].unreported_expenses or employees[].reports[].expenses',
          },
        },
      ],
    },
    {
      filename: withoutFixtureFilename,
      code: `
        import { CostCentersService } from '../../../../common/setup/cost-centers.service';

        async function setup(account) {
          const costCentersService = await CostCentersService.init(account);
          await costCentersService.createCostCenter('Sales');
        }
      `,
      errors: [{ messageId: 'missingFixture' }, { messageId: 'useFixture' }],
    },
    ...additionalFixtureBackedCalls.map(({ serviceName, moduleName, methodName, arguments: args, fixturePath }) => {
      const instanceName = `${serviceName[0].toLowerCase()}${serviceName.slice(1)}`;

      return {
        filename: withFixtureFilename,
        code: `
          import { ${serviceName} } from '../../../../common/setup/${moduleName}';

          async function setup(account) {
            const ${instanceName} = await ${serviceName}.init(account);
            await ${instanceName}.${methodName}(${args});
          }
        `,
        errors: [
          {
            messageId: 'useFixture',
            data: {
              serviceName,
              methodName,
              fixturePath,
            },
          },
        ],
      };
    }),
  ],
});
