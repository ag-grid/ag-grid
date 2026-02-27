---
targets: ['*']
description: 'Testing strategies, Jest patterns, and verification for AG Grid'
globs: ['**/*.test.ts', '**/*.spec.ts', 'testing/**/*']
---

# Testing Guide

This guide covers testing strategies and best practices for the AG Grid codebase.

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

### Behavioural Tests (Vitest) – Primary Test Suite

Behavioural tests in `testing/behavioural/` are the primary test suite for verifying grid behaviour. They use Vitest. Watch mode is disabled by default:

```bash
# Run all behavioural tests
./behave.sh

# Run specific test file
./behave.sh "cell-editing-regression"

# Run specific test by name
./behave.sh "cell-editing-regression" -t "should handle"

# Run in watch mode
./behave.sh --watch
```

### Benchmarks

```bash
# Run all benchmarks
yarn nx run ag-behavioural-testing:benchmark

# Run specific benchmark file
yarn nx run ag-behavioural-testing:benchmark -- src/tree-data/datapath/benchmarks/tree-data-path.bench.ts
```

### Unit Tests (Jest)

Unit tests in `packages/` use Jest. Use `--testPathPattern` and `--testNamePattern`:

```bash
# Run all tests for a package
yarn nx test ag-grid-community

# Run specific test file
yarn nx test ag-grid-community --testPathPattern="featureName"

# Run specific test by name
yarn nx test ag-grid-community --testPathPattern="featureName" --testNamePattern="should handle"
```

### E2E Tests

```bash
# Run documentation E2E tests
yarn nx e2e ag-grid-docs
```

**Note:** Vitest does not support `--testPathPattern` or `--testNamePattern`. Use positional arguments for file matching and `-t` for test name filtering.

## Test Patterns

### Jest Unit Tests

Follow the AAA pattern (Arrange, Act, Assert):

```typescript
describe('FeatureName', () => {
    let instance: FeatureName;

    beforeEach(() => {
        // Arrange - setup
    });

    afterEach(() => {
        // Cleanup
        jest.resetAllMocks();
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
