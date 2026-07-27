# Custom ESLint rule: `enforce-fixture-setup`

Require every E2E spec to have a sibling `fixture.yml` and prevent straightforward prerequisite data from being created at runtime when the resource is supported by fixtures.

## What the rule checks

For files whose name matches `*.spec.ts`, `*.spec.js`, or their JSX/module variants, the rule:

1. Checks for `fixture.yml` in the same directory as the spec.
2. Tracks supported service classes imported from `common/setup`.
3. Tracks service instances created with `Service.init(account)` or `new Service(account)`.
4. Reports supported creation methods when the result is unused and every argument is statically representable in YAML.

The rule does not edit `fixture.yml`. Moving setup can affect counts, totals, ordering, and every sibling spec that shares the fixture, so migration requires review.

## Supported runtime setup

| Service method                                             | Fixture destination                             |
| ---------------------------------------------------------- | ----------------------------------------------- |
| `ReportsService.bulkCreate*`                               | `employees[].reports`                           |
| `ExpensesService.createReimbursableExpenses`               | Employee unreported expenses or report expenses |
| `PolicyService.createFlaggingPolicy`                       | `policies[]`                                    |
| `CorporateCardService.create*Card` / `enrollCorporateCard` | `corporate_cards[]`                             |
| `CategoriesService.createCategory`                         | `categories[]`                                  |
| `SubscriptionsService.changePlanToBusiness`                | `subscription.plan`                             |
| `OrgSettingsService.updateOrgSettings`                     | `org_settings`                                  |
| `ExpenseFieldsService.createExpenseField`                  | `expense_fields[]`                              |
| `CostCentersService.createCostCenter`                      | `cost_centers[]`                                |
| `ProjectsService.createProject`                            | `projects[]`                                    |
| `TaxService.createTaxGroup`                                | `tax_groups[]`                                  |
| `PerDiemService.createPerDiemRate`                         | `per_diem_rates[]`                              |
| `AutomateReportSubmissionService.createSchedule`           | `report_submission_schedules[]`                 |
| `MileageService.createMileageRate`                         | `mileage_rates[]`                               |
| `RecurrencesService.createRecurringExpense`                | `recurring_expenses[]`                          |
| `AdvancesService.createAdvanceRequests`                    | `advance_requests[]`                            |
| `ExpenseRulesService.createExpenseRule`                    | `expense_rules[]`                               |

Only `complete` reimbursable expense creation and fixture-supported report states are reported. Raw unassigned card transactions and other unsupported operations are not reported.

## Incorrect

```ts
import { PolicyService } from '../../../common/setup/policy-service';

test.beforeEach(async ({ account }) => {
  const policyService = await PolicyService.init(account);
  await policyService.createFlaggingPolicy(100);
});
```

Move the prerequisite into the sibling fixture:

```yaml
policies:
  - maxAmount: 100
```

## Correct when the returned resource is needed

Calls whose result is consumed are not reported:

```ts
const corporateCard = await corporateCardService.createVisaRTFCard('4111111111111111');
await expensesService.createUnassignedTransaction(corporateCard.id);
```

## Correct when runtime creation is intentional

Add an adjacent comment with a non-empty reason when creation is the behavior being tested:

```ts
// fixture-setup-allow: policy creation is the behavior under test
await policyService.createFlaggingPolicy(100);
```

Dynamic calls are also left alone because their values cannot be represented safely by an ESLint fix:

```ts
await policyService.createFlaggingPolicy(data.maxAmount);
```

## Usage

```js
import fyleCore from '@fyle/eslint-plugin';

export default [
  {
    files: ['e2e/**/*.ts'],
    plugins: {
      '@fyle': fyleCore,
    },
    rules: {
      '@fyle/enforce-fixture-setup': 'error',
    },
  },
];
```

The rule checks the filesystem while linting a spec. If a lint processor filters unchanged TypeScript files, add a separate full-repository CI check to ensure deleting only a `fixture.yml` cannot bypass the rule.
