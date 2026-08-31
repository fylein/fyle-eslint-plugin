import { createForbiddenComponentLifecycleRule } from '../utils/create-forbidden-component-lifecycle-rule.js';

const RULE_NAME = 'no-checked-lifecycle-hooks-in-onpush-component';

export default createForbiddenComponentLifecycleRule({
  name: RULE_NAME,
  forbiddenHooks: new Set(['ngDoCheck', 'ngAfterContentChecked', 'ngAfterViewChecked']),
  description: 'Disallow checked lifecycle hooks in OnPush Angular components',
  message:
    'OnPush components must not implement {{hook}}(). Replace lifecycle polling with explicit reactive state updates.',
});
