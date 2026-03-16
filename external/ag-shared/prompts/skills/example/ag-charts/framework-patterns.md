# Framework Example Patterns - Technical Reference

This guide provides detailed technical documentation about how AG Charts examples are transformed from vanilla TypeScript into React, Angular, and Vue variants.

## Overview

The example generation system (`plugins/ag-charts-generate-example-files`) automatically transforms vanilla TypeScript examples into framework-specific implementations. This transformation is pattern-based and relies on parsing the vanilla code structure to extract reusable components.

**Supported Frameworks:**

-   `vanilla` - Plain JavaScript (ES6)
-   `typescript` - TypeScript with SystemJS
-   `reactFunctional` - React with functional components (JSX)
-   `reactFunctionalTs` - React with functional components (TSX)
-   `angular` - Angular with standalone components
-   `vue3` - Vue 3 with Composition API

## Parser Architecture

### Extraction Process

The parser (`chart-vanilla-src-parser.ts`) uses TypeScript's AST to extract:

1. **Imports**: Module imports from ag-charts packages
2. **Options Object**: The `AgChartOptions` configuration
3. **Chart Instance**: Variable storing the chart
4. **Event Handlers**: Functions referenced in HTML onclick/onchange attributes
5. **Instance Methods**: Functions that manipulate the chart or options
6. **Global Variables**: Top-level variables and constants
7. **Type Declarations**: TypeScript type/interface declarations

### Container Extraction

The parser specifically looks for this pattern:

```typescript
const options: AgChartOptions = {
    container: document.getElementById('myChart'),
    // ...
};
```

**Requirements:**

-   Container must use `document.getElementById()`
-   Options must be assigned to a top-level variable
-   The ID from `getElementById()` maps to the HTML element

**Why This Matters**: Frameworks handle DOM differently:

-   React: Uses refs or direct DOM queries after mount
-   Angular: Uses `@ViewChild` or template variables
-   Vue: Uses template refs

## Framework Transformations

### React (Functional Components)

**Transformation Steps:**

1. **Options -> State**: Options object becomes `useState`

    ```typescript
    // Vanilla
    const options: AgChartOptions = {
        /* ... */
    };

    // React
    const [options, setOptions] = useState<AgChartOptions>({
        /* ... */
    });
    ```

2. **Chart Instance -> Ref**: Chart variable becomes `useRef`

    ```typescript
    // Vanilla
    const chart = AgCharts.create(options);

    // React
    const chartRef = useRef<AgChartsInstance>(null);
    // In component: <AgCharts ref={chartRef} options={options} />
    ```

3. **Update Functions**: Wrapped to use state setters

    ```typescript
    // Vanilla
    function updateChart() {
        options.data = newData;
        chart.update(options);
    }

    // React
    function updateChart() {
        const nextOptions = clone(options);
        nextOptions.data = newData;
        setOptions(nextOptions);
    }
    ```

4. **HTML Events**: Converted to React event handlers

    ```html
    <!-- Vanilla -->
    <button onclick="toggleSeries()">Toggle</button>

    <!-- React -->
    <button onClick="{toggleSeries}">Toggle</button>
    ```

**Chart Components Used:**

-   `AgCharts` - Standard charts
-   `AgFinancialCharts` - Financial charts
-   `AgGauge` - Gauge charts
-   `AgSparkline` - Sparklines

### Angular

**Transformation Steps:**

1. **Options -> Component Property**: Options become class property

    ```typescript
    // Vanilla
    const options: AgChartOptions = {
        /* ... */
    };

    // Angular
    export class AppComponent {
        options: AgChartOptions = {
            /* ... */
        };
    }
    ```

2. **Template Generation**: HTML is converted to Angular template

    ```typescript
    // Generated template in component
    template: `
        <div class="example-controls">
            <button (click)="toggleSeries()">Toggle</button>
        </div>
        <ag-charts [options]="options"></ag-charts>
    `;
    ```

3. **Update Functions**: Become component methods

    ```typescript
    export class AppComponent {
        options: AgChartOptions = {
            /* ... */
        };

        toggleSeries() {
            const options = clone(this.options);
            // ... modify options
            this.options = options;
        }
    }
    ```

**Components Used:**

-   `ag-charts` selector for `AgChartsAngular`
-   `ag-financial-charts` for financial charts
-   `ag-gauge` for gauges

### Vue 3

**Transformation Steps:**

1. **Options -> Reactive State**: Options become `ref`

    ```typescript
    // Vanilla
    const options: AgChartOptions = {
        /* ... */
    };

    // Vue
    const options = ref<AgChartOptions>({
        /* ... */
    });
    ```

2. **Template**: HTML converted to Vue template

    ```vue
    <template>
        <div class="example-controls">
            <button @click="toggleSeries">Toggle</button>
        </div>
        <ag-charts :options="options"></ag-charts>
    </template>
    ```

3. **Update Functions**: Functions that modify `options.value`

    ```typescript
    function toggleSeries() {
        const nextOptions = clone(options.value);
        // ... modify nextOptions
        options.value = nextOptions;
    }
    ```

## Supported Code Patterns

### Pattern: Simple Static Chart

**Vanilla:**

```typescript
import { AgChartOptions, AgCharts } from 'ag-charts-community';

import { getData } from './data';

const options: AgChartOptions = {
    container: document.getElementById('myChart'),
    data: getData(),
    series: [{ type: 'line', xKey: 'x', yKey: 'y' }],
};

AgCharts.create(options);
```

**Result**: Transforms cleanly to all frameworks

### Pattern: Interactive Controls with Updates

**Vanilla:**

```typescript
import { AgChartOptions, AgCharts } from 'ag-charts-community';

const options: AgChartOptions = {
    container: document.getElementById('myChart'),
    series: [{ type: 'line', xKey: 'x', yKey: 'y' }],
};

const chart = AgCharts.create(options);

function toggleMarkers() {
    const series = options.series![0];
    series.marker = { enabled: !series.marker?.enabled };
    chart.update(options);
}
```

**HTML:**

```html
<button onclick="toggleMarkers()">Toggle Markers</button>
<div id="myChart"></div>
```

**Result**: Transforms cleanly - event handler and state management work

### Pattern: Delta Updates

**Vanilla:**

```typescript
const chart = AgCharts.create(options);

function changeTitle() {
    chart.updateDelta({ title: { text: 'New Title' } });
}
```

**Result**: Transforms cleanly - `updateDelta` is handled for frameworks

### Pattern: Using Chart API Methods

**Vanilla:**

```typescript
const chart = AgCharts.create(options);

function downloadChart() {
    AgCharts.download(chart, { fileName: 'my-chart.png' });
}
```

**Result**: Transforms cleanly - chart ref is properly mapped

### Pattern: Multiple Functions with Shared State

**Vanilla:**

```typescript
const options: AgChartOptions = {
    /* ... */
};
const chart = AgCharts.create(options);

function updateData() {
    options.data = getNewData();
    chart.update(options);
}

function changeTheme() {
    options.theme = getNewTheme();
    chart.update(options);
}
```

**Result**: Transforms cleanly - all functions access shared options

## Unsupported Patterns

### Pattern: Complex DOM Manipulation

**Vanilla:**

```typescript
function updateUI() {
    const status = document.getElementById('status');
    status.innerHTML = '<div class="updated">Updated!</div>';
    status.classList.add('active');
}
```

**Result**: Does not transform - frameworks manage DOM differently

**Solution**: Use `@ag-skip-fws` or keep UI updates within framework templates

### Pattern: External Library Integration

**Vanilla:**

```typescript
import * as d3 from 'd3';

import { getData } from './data';

const scale = d3.scaleLinear().domain([0, 100]).range([0, 500]);

const options: AgChartOptions = {
    container: document.getElementById('myChart'),
    data: getData().map((d) => ({ ...d, scaled: scale(d.value) })),
};
```

**Result**: Does not transform - external library imports not handled

**Solution**: Use `@ag-skip-fws`

### Pattern: Async/Await Complex Workflows

**Vanilla:**

```typescript
async function loadAndUpdate() {
    const response = await fetch('/api/data');
    const data = await response.json();
    const processed = await processData(data);

    options.data = processed;
    chart.update(options);
}
```

**Result**: May transform but framework timing issues likely

**Solution**: Simple async is OK, but complex workflows should use `@ag-skip-fws`

### Pattern: Multiple Chart Instances

**Vanilla:**

```typescript
const chart1 = AgCharts.create({
    container: document.getElementById('chart1'),
    /* ... */
});

const chart2 = AgCharts.create({
    container: document.getElementById('chart2'),
    /* ... */
});

function syncCharts() {
    // Complex coordination between charts
}
```

**Result**: Does not transform well - multiple instances complex

**Solution**: Use `@ag-skip-fws` for multi-chart examples

### Pattern: Window/Global Assignments

**Vanilla:**

```typescript
// Explicit global assignment
window.myChart = chart;
window.updateChart = updateChart;
```

**Result**: Does not transform

**Note**: Event handlers ARE automatically added to window/scope, but explicit assignments are not supported.

## Common Transformation Issues

### Issue: TypeScript Errors in Generated Code

**Symptom**: Generated React/Vue code has type errors

**Causes:**

-   Missing type imports
-   Incorrect chart options type (using `AgChartOptions` instead of specific type)
-   Type narrowing issues

**Solutions:**

```typescript
// Import all used types
import { AgCartesianChartOptions, AgCharts, AgLineSeriesOptions } from 'ag-charts-community';

// Use specific chart type
const options: AgCartesianChartOptions = {
    /* ... */
};

// Use type assertions when needed
const series = options.series![0] as AgLineSeriesOptions;
```

### Issue: Event Handlers Not Working

**Symptom**: Clicking buttons doesn't trigger functions

**Causes:**

-   Using arrow functions inline in HTML
-   Event handler not at top-level
-   Event handler name mismatch

**Solutions:**

```html
<!-- Good -->
<button onclick="updateChart()">Update</button>

<!-- Bad - inline arrow -->
<button onclick="() => updateChart()">Update</button>

<!-- Bad - inline logic -->
<button onclick="chart.update(options)">Update</button>
```

### Issue: Chart Not Updating in React

**Symptom**: Changes don't reflect in chart after state update

**Cause**: Not using proper state management or clone

**Solution:**

```typescript
// Good - proper clone and state update
function updateChart() {
    const nextOptions = clone(options);
    nextOptions.data = newData;
    setOptions(nextOptions);
}

// Bad - mutating state directly
function updateChart() {
    options.data = newData;
    setOptions(options); // Same reference, React won't update
}
```

### Issue: `@ag-skip-clone` Directive

For performance-critical examples with frequent updates, use `@ag-skip-clone`:

```typescript
// @ag-skip-clone

const options: AgChartOptions = {
    /* ... */
};
```

This suppresses the `clone()` call in React/Vue, but be aware of state mutation implications.

## Testing Framework Variants

### Generate and Test

```bash
# Generate framework variants for specific example
nx run ag-charts-website-${pageName}_${exampleName}_main.ts:generate

# Typecheck generated code
nx run ag-charts-website-${pageName}_${exampleName}_main.ts:typecheck

# Batch validate all examples
nx validate-examples
```

### Visual Testing

1. Start dev server: `yarn nx dev`
2. Navigate to example page
3. Use framework switcher in UI (JavaScript/TypeScript/React/Angular/Vue)
4. Test interactions in each framework
5. Verify:
    - Chart renders correctly
    - Controls work as expected
    - No console errors
    - State updates propagate

### Debugging Generated Code

Generated files are in `dist/packages/ag-charts-website/public/generated-examples/`:

```
dist/packages/ag-charts-website/public/generated-examples/
+-- ${pageName}/
    +-- ${exampleName}/
        |-- vanilla/
        |   |-- main.js
        |   +-- index.html
        |-- typescript/
        |   +-- main.ts
        |-- reactFunctional/
        |   +-- index.jsx
        |-- reactFunctionalTs/
        |   +-- index.tsx
        |-- angular/
        |   |-- app.component.ts
        |   +-- main.ts
        +-- vue3/
            +-- main.ts
```

**Debugging Steps:**

1. Generate examples: `yarn nx generate-examples ag-charts-website`
2. Open generated file for problematic framework
3. Check transformation output
4. Compare with vanilla source
5. Identify pattern mismatch

### Common Debug Patterns

**Missing imports:**

```typescript
// Check generated file has all necessary imports
import { AgChartOptions /* other types */, AgCharts } from 'ag-charts-community';
```

**Incorrect refs:**

```typescript
// React: ensure chartRef is created and used
const chartRef = useRef<AgChartsInstance>(null);
// ... later
AgCharts.download(chartRef.current!, { fileName: 'chart.png' });
```

**Options not reactive:**

```typescript
// Vue: options should be ref
const options = ref<AgChartOptions>({
    /* ... */
});

// Access with .value
options.value.data = newData;
```

## Special Directives

### `@ag-skip-fws`

Skip framework generation entirely:

```typescript
// @ag-skip-fws
import { AgChartOptions, AgCharts } from 'ag-charts-community';

// Example will only generate vanilla and typescript variants
```

**CRITICAL**: This directive is ONLY for internal use (benchmarks and `*-test` pages). All public documentation examples MUST work across all frameworks.

**When to Use (Internal Only):**

-   Performance benchmarks (`benchmarks` pages)
-   Internal test examples (`*-test` pages)
-   Complex DOM testing (Shadow DOM, iframes)
-   Framework-specific integration testing

**NEVER Use For:**

-   Public documentation examples
-   Gallery examples
-   Any example visible to users in documentation

**If a public example needs patterns that don't transform**: Redesign the example to be framework-compatible. Complex features can be demonstrated with simpler, framework-compatible examples.

### `@ag-skip-clone`

Skip `clone()` call in framework transformations:

```typescript
// @ag-skip-clone

const options: AgChartOptions = {
    /* ... */
};
```

**When to Use:**

-   High-frequency updates
-   Performance-critical examples
-   When you know options object is replaced entirely each update

**Caution**: May cause state mutation issues in React/Vue if not careful.

### `@ag-skip-container-check`

Skip validation of container setup:

```typescript
// @ag-skip-container-check

const options: AgChartOptions = {
    container: someComplexContainerSetup(),
    // ...
};
```

**When to Use**: Rarely - only when you have a custom container setup pattern that's valid but doesn't match the standard pattern.

### `@ag-options-extract`

Extract options for JSON serialization (used internally for option APIs):

```typescript
// @ag-options-extract

const options: AgChartOptions = {
    /* ... */
};
```

**When to Use**: Internal use for documentation generation. Most examples don't need this.

## Best Practices Summary

### Do

-   Use `document.getElementById()` for container
-   Store chart in top-level variable: `const chart = AgCharts.create(options)`
-   Keep event handlers as simple function calls in HTML
-   Use top-level functions for all interactions
-   Import all types you use
-   Use specific chart option types (`AgCartesianChartOptions`, etc.)
-   Test generated variants before committing
-   Structure code consistently (imports, options, chart, functions)
-   Design all public examples to be framework-compatible
-   Simplify or redesign examples that don't transform cleanly

### Don't

-   Use `@ag-skip-fws` for public documentation examples (internal use only)
-   Manipulate DOM outside simple controls
-   Use external libraries in public examples
-   Create inline arrow functions in HTML
-   Nest functions inside other functions (except utility functions)
-   Assign to `window` object explicitly
-   Create multiple coordinated charts in public examples
-   Use complex async workflows that don't transform
-   Forget to call `chart.update()` after changing options

## Quick Reference

| Pattern             | Vanilla -> Framework    | Support |
| ------------------- | ----------------------- | ------- |
| Static chart        | Direct component props  | Yes     |
| Top-level options   | State/reactive          | Yes     |
| Chart instance      | Ref/component instance  | Yes     |
| Button onclick      | Framework event handler | Yes     |
| Select onchange     | Framework event handler | Yes     |
| chart.update()      | State update            | Yes     |
| chart.updateDelta() | State update            | Yes     |
| AgCharts.download() | Via chart ref           | Yes     |
| Complex DOM queries | N/A                     | No      |
| External libraries  | N/A                     | No      |
| Multiple charts     | N/A                     | No      |
| window assignments  | N/A                     | No      |
| Complex async       | Framework-specific      | Partial |

## Further Reading

-   [Examples Guide](./examples.md) - User-facing guide for creating examples
-   [Testing Guide](./testing.md) - Testing patterns for examples
-   Parser implementation: `plugins/ag-charts-generate-example-files/src/executors/generate/generator/transformation-scripts/chart-vanilla-src-parser.ts`
-   React transformer: `chart-vanilla-to-react-functional-ts.ts`
-   Angular transformer: `chart-vanilla-to-angular.ts`
-   Vue transformer: `chart-vanilla-to-vue3.ts`
