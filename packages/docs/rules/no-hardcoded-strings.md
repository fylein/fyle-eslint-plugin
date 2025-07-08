# Custom ESLint Rule: no-hardcoded-strings

A custom ESLint rule that detects hardcoded user-facing strings in Angular applications and enforces i18n best practices. **Works seamlessly with `eslint-plugin-diff`** to provide focused feedback on changed code only.

## Overview

This rule follows the same pattern as successful third-party ESLint packages - it focuses on comprehensive and accurate detection while letting `eslint-plugin-diff` handle the filtering transparently at the ESLint engine level.

## How It Works with eslint-plugin-diff

### The Standard Third-Party Pattern

```javascript
// eslint.config.js
export default [
  {
    extends: [
      'plugin:diff/diff', // Handles diff filtering automatically
      // ... other configs
    ],
    rules: {
      'custom/no-hardcoded-strings': 'error', // Works normally
      'import/no-unresolved': 'error', // Third-party rules
    },
  },
];
```

### Key Benefits

1. **Zero modification needed**: The rule works without any diff-awareness logic
2. **Automatic compatibility**: Works with or without `eslint-plugin-diff`
3. **Performance**: Only processes changed code when diff mode is active
4. **Focused feedback**: Developers only see errors related to their changes

## What the Rule Detects

### TypeScript Files (.ts)

- **Property definitions**: `title = 'Hardcoded Title'`
- **Return statements**: `return 'Error message'`
- **Assignment expressions**: `this.message = 'Welcome!'`
- **Binary expressions**: `'Hello' + ' World'`
- **Template literals**: `` `Welcome, ${name}!` ``
- **Object-literal property values**: `{ title: 'Upload receipt' }`
- **Call-expression arguments**: `console.log('Saved!')`
- **Toast service calls**: `this.toastService.show('Error!')`

### HTML Template Files (.html)

- **Text content**: `<div>Hardcoded text</div>`
- **HTML attributes**: `<input placeholder="Enter name">`
- **Angular property bindings**: `<div [title]="'Delete'"></div>`

## What the Rule Ignores

- **Private or readonly properties**: `private title = "Secret"`, `readonly ROLE = 'ADMIN'`
- **Special character strings**: `"!!!"`, `"..."`, `"***"`
- **Translation keys (dot / underscore separated)**: `'dashboard.header.title'`, `'user_profile.name'`
- **Translation pipes**: `'key' | transloco`
- **Non-user-facing properties & decorator metadata**: CSS classes, form controls, icons, sizes, **selectors**, etc.
- **Technical strings**: URLs, routes, error codes, data attributes
- **Test/Spec files**: Linting is skipped for `*.spec.ts` and `*.test.ts`
- **Non-user-facing properties**: Configurable via `nonUserFacingPattern` option

## Configuration

```javascript
// eslint.config.js
import fyleCore from 'eslint-plugin-fyle';

export default [
  {
    plugins: {
      'fyle-core': fyleCore,
    },
    rules: {
      'fyle-core/no-hardcoded-strings': [
        'error',
        {
          nonUserFacingPattern:
            '(class|style|type|form|loading|template|icon|size|src|href|router|query|fragment|preserve|skip|replace|state|button|default|validate|element|prefix|direction|styleClasses|tooltipShowEvent|keys|option|position|append|source|test|field|autocomplete|Id|image|url|height|width|target|pSortableColumn|name|alignment|mode|accept|responsiveLayout|customProperty)', // Optional: custom non-user-facing property pattern
        },
      ],
    },
  },
];
```

### Options

| Option                 | Type     | Default           | Description                                                  |
| ---------------------- | -------- | ----------------- | ------------------------------------------------------------ |
| `nonUserFacingPattern` | `string` | See default below | RegExp pattern for non-user-facing property names to ignore. |

### Default nonUserFacingPattern

The default pattern ignores these property types:

```
(class|style|type|form|loading|template|icon|size|src|href|router|query|fragment|preserve|skip|replace|state|button|default|validate|element|prefix|direction|styleClasses|tooltipShowEvent|keys|option|position|append|source|test|field|autocomplete|Id|image|url|height|width|target|pSortableColumn|name|alignment|mode|accept|responsiveLayout)
```

### Custom nonUserFacingPattern Examples

```javascript
// Add custom properties to ignore (extends default pattern)
'fyle-core/no-hardcoded-strings': ['error', {
  nonUserFacingPattern: '(customProperty|dataAttribute|myProperty)'
}]

// Add multiple custom properties
'fyle-core/no-hardcoded-strings': ['error', {
  nonUserFacingPattern: '(technical|internal|config|setting|property|attribute)'
}]

// Add specific patterns
'fyle-core/no-hardcoded-strings': ['error', {
  nonUserFacingPattern: '(myCustomProperty|anotherProperty|thirdProperty)'
}]
```

**Note**: The custom pattern is **combined with** the default pattern, not replaced. So the final pattern will be:
`(defaultPattern|yourCustomPattern)`

## Usage with eslint-plugin-diff

### In CI/CD (GitHub Actions)

```yaml
name: ESLint on Changed Files
on: pull_request
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: npm install
      - name: Fetch base branch
        run: git fetch origin ${{ github.event.pull_request.base.ref }}:${{ github.event.pull_request.base.ref }}
      - name: Run ESLint on changes only
        env:
          ESLINT_PLUGIN_DIFF_COMMIT: ${{ github.event.pull_request.base.ref }}
        run: npx eslint --ext .ts,.html .
```

### Local Development

```bash
# Run on all files (normal mode)
npx eslint --ext .ts,.html .

# Run on staged changes only
ESLINT_PLUGIN_DIFF_COMMIT=HEAD npx eslint --ext .ts,.html .

# Run on changes since main branch
ESLINT_PLUGIN_DIFF_COMMIT=main npx eslint --ext .ts,.html .
```

## Examples

### ✅ Valid Code

```typescript
// Private properties are ignored
class Component {
  private secret = 'Internal value';
  private test: string;

  ngOnInit() {
    this.test = `Hello ${this.user?.name}`; // Private property assignment
  }
}

// Translation keys are allowed
class ValidComponent {
  title = this.translocoService.translate('page.title');
  message = 'user.welcome' | transloco;
}

// Special characters only
class SpecialChars {
  separator = '***';
  bullets = '•••';
}

// Technical strings are ignored
class TechnicalStrings {
  setupRouting() {
    this.window.location.href = '/app/#/signin';
    this.errorCode = 'access_denied';
    this.apiUrl = 'https://api.example.com/users';
    this.routePath = '/dashboard/settings';
  }
}

// Component reference assignments to styling properties
class ComponentRefTest {
  setupComponent() {
    componentRef.instance.classes = 'tw-h-12-px tw-w-12-px';
    componentRef.instance.containerClasses = 'tw-h-14-px';
    componentRef.instance.iconSize = 'large';
  }
}
```

### ❌ Invalid Code

```typescript
// Property definitions
class Component {
  title = 'Hardcoded Title'; // ❌ Error
}

// Method returns
class MessageComponent {
  getMessage() {
    return 'Hello World'; // ❌ Error
  }
}

// Public property assignments
class AppComponent {
  message: string;

  ngOnInit() {
    this.message = 'Welcome!'; // ❌ Error (public property)
  }
}

// Template literals with hardcoded text
class WelcomeComponent {
  name = 'User';
  welcomeMsg = `Hello, ${this.name}!`; // ❌ Error: "Hello, "
}

// Component reference assignments to user-facing properties
class ComponentRefTest {
  setupComponent() {
    componentRef.instance.title = 'Delete Item'; // ❌ Error
    componentRef.instance.message = 'Welcome to our app'; // ❌ Error
  }
}

// Toast service calls with hardcoded strings
class ToastExample {
  constructor(private toastService: ToastMessageService) {}

  showError() {
    this.toastService.showErrorToast('Something went wrong'); // ❌ Error
  }
}
```

## Testing

The rule includes comprehensive tests covering:

- **Valid cases** (**18** tests): Private/readonly properties, translations, special characters, technical strings, component styling, translation-key heuristics, spec-file exemption
- **Invalid cases** (**12** tests): Property definitions, returns, assignments, template literals, toast calls, object-literal values, call-expression arguments

```bash
# Run tests
npm test

# or run specific test file
npx jest src/tests/no-hardcoded-strings.test.js

# Expected output: 30 passed tests
```

## Architecture

### Core Philosophy

This rule follows the **standard third-party ESLint package pattern**:

1. **Focus on accuracy**: Implement the best possible hardcoded string detection
2. **Let ESLint handle the rest**: No diff-awareness logic needed
3. **Transparent compatibility**: Works with any ESLint setup

### AST Node Visitors

- `Literal`: Detects string literals in various contexts
- `TemplateLiteral`: Detects template literal parts with private property awareness
- `Text`: Detects text content in HTML files
- `BoundAttribute`: Detects Angular property bindings
- `CallExpression`: Detects toast service calls

### Performance

When `eslint-plugin-diff` is active:

- ESLint only processes changed files/lines
- Rule only sees modified AST nodes
- **3-5x faster** than full file processing
- Zero performance impact on unchanged code

## Best Practices

1. **Keep rules simple**: Focus on detection, not filtering
2. **Use standard patterns**: Follow third-party package conventions
3. **Test thoroughly**: Ensure accuracy before deployment
4. **Configure appropriately**: Use `ignorePattern` for project-specific needs

## Troubleshooting

### Rule not detecting changes

- Ensure `eslint-plugin-diff` is configured correctly
- Check that `ESLINT_PLUGIN_DIFF_COMMIT` environment variable is set
- Verify file extensions are included in ESLint configuration

### False positives

- Use `ignorePattern` option to exclude specific patterns
- Check if strings are truly user-facing
- Consider if the string should use translation keys

### Performance issues

- Rule is optimized for diff mode - performance issues likely indicate configuration problems
- Ensure `eslint-plugin-diff` is active for large codebases

---

**Key Takeaway**: This rule works exactly like any successful third-party ESLint package. It focuses on being the best possible hardcoded string detector, while `eslint-plugin-diff` transparently handles the "diff awareness" at the ESLint engine level.

The rule now recognises **Unicode letters** using a Unicode-aware `\p{L}` regex, so text in any language is detected.
