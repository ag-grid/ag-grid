---
targets: ['*']
description: 'Testing strategies, Vitest patterns, and verification for AG Grid'
globs: ['**/*.test.ts', '**/*.spec.ts', 'testing/**/*']
---

# Testing Guide

This guide covers testing strategies and best practices for the AG Grid codebase.

## Test Framework

All tests use **Vitest** as the unified test runner. The monorepo has a vitest workspace (`vitest.workspace.ts`) that defines all test projects:

-   `testing/behavioural` — Primary grid behaviour tests (jsdom environment)
-   `packages/ag-grid-community` — Community package unit tests
-   `packages/ag-grid-enterprise` — Enterprise package unit tests (jsdom environment)
-   `plugins/ag-grid-generate-example-files` — Plugin tests
-   `plugins/stylelint-plugin-ag` — Stylelint plugin tests
-   `community-modules/locale` — Locale tests
-   `documentation/ag-grid-docs` — Documentation tests
-   `external/ag-website-shared` — Website shared tests

## Behavioural Tests — Primary Test Suite

Behavioural tests in `testing/behavioural/` are the primary test suite for AG Grid. They test the grid as a **black box**, instantiating the full grid to verify complex behaviours and features.

**Key principles:**

-   The unit under test is a **behaviour**, not a function, class, method, or file
-   **Avoid mocking** — prefer fakes instead (e.g., fake DOM)
-   Test at the edges of the system to ensure real integration using public APIs

## Test Structure

### Directory Layout

```
testing/
├── accessibility/     # Accessibility compliance tests
├── behavioural/       # Grid behaviour verification
├── csp/               # Content Security Policy tests
├── module-size/       # Bundle size monitoring
├── performance/       # Performance regression tests
└── shared/            # Shared test utilities
```

### Package Tests

Unit and integration tests are co-located with source code:

```
packages/ag-grid-community/src/
├── feature/
│   ├── featureName.ts
│   └── featureName.test.ts
```

## Running Tests

### All Tests

```bash
# Run all vitest tests across the entire workspace
npx vitest run

# Run in watch mode
npx vitest --watch

# Run a single project's tests
npx vitest run --project ag-behavioural-testing
npx vitest run --project ag-grid-community
npx vitest run --project ag-grid-enterprise
```

### Behavioural Tests — Primary Test Suite

```bash
# Run specific test file
npx vitest run "cell-editing-regression"

# Run specific test by name
npx vitest run "cell-editing-regression" -t "should handle"

# Update GridRows inline snapshots
UPDATE_GRID_ROWS_SNAPSHOTS=1 npx vitest run

# Update snapshots in matching test files only
UPDATE_GRID_ROWS_SNAPSHOTS=1 npx vitest run "cell-editing"

# Dry-run: show what would change
UPDATE_GRID_ROWS_SNAPSHOTS=dry npx vitest run
```

### Package Tests (via Nx)

```bash
# Run all tests for a package via Nx
yarn nx test ag-grid-community
yarn nx test ag-grid-enterprise

# Run specific test file directly
npx vitest run --project ag-grid-community src/edit/editApi

# Run specific test by name
npx vitest run --project ag-grid-community -t "should handle"
```

### Benchmarks

```bash
# Run all benchmarks
yarn nx run ag-behavioural-testing:benchmark

# Run specific benchmark file
yarn nx run ag-behavioural-testing:benchmark -- src/tree-data/datapath/benchmarks/tree-data-path.bench.ts
```

### E2E Tests

```bash
# Run documentation E2E tests
yarn nx e2e ag-grid-docs
```

## Test Patterns

### Unit Tests

Follow the AAA pattern (Arrange, Act, Assert):

```typescript
describe('FeatureName', () => {
    let instance: FeatureName;

    beforeEach(() => {
        // Arrange - setup
    });

    afterEach(() => {
        // Cleanup
        vi.resetAllMocks();
    });

    describe('#methodName', () => {
        it('should handle expected case', () => {
            // Arrange
            const input = createInput();

            // Act
            const result = instance.methodName(input);

            // Assert
            expect(result).toBe(expected);
        });
    });
});
```

### Parameterised Tests

Use `it.each()` for testing multiple cases:

```typescript
it.each([
    ['case1', input1, expected1],
    ['case2', input2, expected2],
])('should handle %s', (_, input, expected) => {
    expect(functionUnderTest(input)).toBe(expected);
});
```

### Test Data Records

For complex test cases, use records:

```typescript
const EXAMPLES: Record<string, TestCase> = {
    BASIC: {
        input: {
            /* ... */
        },
        expected: {
            /* ... */
        },
    },
    EDGE_CASE: {
        input: {
            /* ... */
        },
        expected: {
            /* ... */
        },
    },
};

for (const [name, example] of Object.entries(EXAMPLES)) {
    it(`handles ${name}`, () => {
        expect(process(example.input)).toEqual(example.expected);
    });
}
```

## Best Practices

1. **Test behaviour, not implementation** - Focus on what the code does, not how
2. **Keep tests independent** - Each test should be able to run in isolation
3. **Use descriptive names** - Test names should describe the expected behaviour
4. **Avoid test helpers that hide behaviour** - Tests should be readable without jumping to helpers
5. **Clean up after tests** - Reset mocks and state in `afterEach`
6. **Review similar tests** - When adding tests, check related tests for consistency

## Coverage

-   Aim for meaningful coverage, not 100%
-   Focus on edge cases and error handling
-   Critical paths should have comprehensive tests
