import { createForbiddenComponentLifecycleRule } from '../utils/create-forbidden-component-lifecycle-rule.js';

const RULE_NAME = 'no-ng-on-changes-in-signal-based-component';

export default createForbiddenComponentLifecycleRule({
  name: RULE_NAME,
  forbiddenHooks: new Set(['ngOnChanges']),
  description: 'Disallow ngOnChanges in Angular components migrated to signal-based inputs',
  message:
    'Signal-based components must not implement {{hook}}(). Use computed() for derived input state and effect() for procedural input-change handling.',
});
