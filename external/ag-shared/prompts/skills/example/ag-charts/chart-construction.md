# AG Charts — Chart Construction

Patterns for building AG Charts examples in gallery, docs, and Plunker contexts.

## Example File Structure

### Gallery / Docs Examples (TypeScript, module-based)

- `index.html` — HTML snippet (not a full document). No `<script>` tags; `main.ts` is included automatically.
- `main.ts` — Chart configuration and creation
- `data.ts` — Dataset with `getData()` function (and optional `TData` type)
- `styles.css` — Only if absolutely required (rare)

### Plunker Examples (UMD, vanilla JS)

- `index.html` — Full HTML document with CDN `<script>` tags
- `main.js` — Chart configuration using UMD global (`const { AgCharts } = agCharts;`)
- `data.js` — Optional separate data file with `getData()` function
- `ag-example-styles.css` — Copy from plunker skill assets
- `package.json` — Dependencies

## Container Pattern

```typescript
const options: AgCartesianChartOptions = {
    container: document.getElementById('myChart'),
    data: getData(),
    // ...
};

const chart = AgCharts.create(options);
```

Always use `document.getElementById('myChart')` — never string selectors like `'#myChart'`.

## Controls HTML Structure

Controls go BEFORE the chart div in `index.html`:

```html
<div class="example-controls">
    <div class="controls-row">
        <button onclick="toggleFeature()">Toggle</button>
        <select onchange="updateMethod(event.target.value)">
            <option value="a">Option A</option>
            <option value="b">Option B</option>
        </select>
    </div>
</div>
<div id="myChart"></div>
```

- Wrap in `class="example-controls"` with `class="controls-row"` for each row
- Chart `<div id="myChart">` is a **sibling** outside the controls div
- Use `gap-left`, `gap-right`, `push-left`, `push-right` classes for layout
- For binary toggles, prefer two `<button>` elements over a `<select>` dropdown
- Use `event.target.value` (not `this.value`) for select/input handlers — `this` breaks in framework transforms
- Do not add `<h1>`, `<p>`, or other elements — use chart `title`/`subtitle` options instead

## Axes Configuration (v13+)

**IMPORTANT**: Use the object-based axes syntax, NOT the legacy array syntax:

```typescript
// CORRECT — New object syntax (v13+)
axes: {
    x: { type: 'time' },
    y: { type: 'number' },
}

// WRONG — Legacy array syntax (pre-v13, deprecated)
axes: [
    { type: 'time', position: 'bottom' },
    { type: 'number', position: 'left' },
]
```

Only specify options that differ from defaults:

```typescript
// Minimal
axes: {
    x: { type: 'time' },
}

// With additional options
axes: {
    x: { type: 'time' },
    y: { type: 'number', title: { text: 'Price' } },
}
```

### Multiple Axes

Use `yKeyAxis` or `xKeyAxis` on the series to associate with named axes. There is **no `axes` object on the series**.

```typescript
axes: {
    x: { type: 'time' },
    y: { type: 'number', title: { text: 'Price' } },
    y2: { type: 'number', position: 'right', title: { text: 'Volume' } },
},
series: [
    { type: 'line', xKey: 'date', yKey: 'price' },
    { type: 'bar', xKey: 'date', yKey: 'volume', yKeyAxis: 'y2' },
],
```

## Module Registration

Examples must explicitly register the modules they use with `ModuleRegistry` **before** creating charts.

### Enterprise Examples — Single Package Import

Import everything from `ag-charts-enterprise` (it re-exports all community modules):

```typescript
// CORRECT — single import
import {
    AgCartesianChartOptions,
    AgCharts,
    AnimationModule,
    BarSeriesModule,
    CategoryAxisModule,
    ModuleRegistry,
    NumberAxisModule,
} from 'ag-charts-enterprise';

import { getData } from './data';

ModuleRegistry.registerModules([AnimationModule, BarSeriesModule, CategoryAxisModule, NumberAxisModule]);

const options: AgCartesianChartOptions = {
    container: document.getElementById('myChart'),
    data: getData(),
    // ...
};

const chart = AgCharts.create(options);
```

Never mix imports from `ag-charts-community` and `ag-charts-enterprise`.

### Community Examples

```typescript
import {
    AgCartesianChartOptions,
    AgCharts,
    BarSeriesModule,
    CategoryAxisModule,
    ModuleRegistry,
    NumberAxisModule,
} from 'ag-charts-community';

import { getData } from './data';

ModuleRegistry.registerModules([BarSeriesModule, CategoryAxisModule, NumberAxisModule]);
```

### Financial Charts

```typescript
import { AgCharts, AgFinancialChartOptions, FinancialChartModule, ModuleRegistry } from 'ag-charts-enterprise';

ModuleRegistry.registerModules([FinancialChartModule]);

const options: AgFinancialChartOptions = {
    container: document.getElementById('myChart'),
    data: getData(),
    volume: true,
    navigator: true,
};

const chart = AgCharts.createFinancialChart(options);
```

### Best Practices

- Use a **single import statement** from the appropriate package
- Register modules at the top of `main.ts`, before chart creation
- Only import and register modules actually used
- List modules alphabetically in both import and registration

## Chart Update Patterns

```typescript
// Full update — mutate options then call update
function changeData() {
    options.data = newData;
    chart.update(options);
}

// Delta update — for small changes
function changeTitle() {
    chart.updateDelta({ title: { text: 'New Title' } });
}
```

## Event Handlers

Functions called from HTML event handlers (`onclick`, `onchange`) must be **top-level functions** in `main.ts`. The framework generator handles exposing them automatically.

```typescript
const chart = AgCharts.create(options);

function toggleFeature() {
    options.someOption = !options.someOption;
    chart.update(options);
}
```

**Never** assign functions to `window`:

```typescript
// WRONG
(window as any).toggleFeature = toggleFeature;
```

### Scoping Utility Functions

Functions that use chart/state but aren't called from DOM need `/** inScope */`:

```typescript
// Called from DOM — automatically hoisted
function toggleUpdates() {
    if (isRunning) stopUpdates();
    else startUpdates();
}

// Uses chart/state but NOT called from DOM — needs /** inScope */
/** inScope */
function startUpdates() {
    isRunning = true;
    // ... use chart
}
```

## Chart Options

- Always include a `title` on chart options
- Use specific chart types: `AgCartesianChartOptions` (cartesian), `AgPolarChartOptions` (polar), `AgFinancialChartOptions` (financial). Hierarchy charts (treemap, sunburst) use generic `AgChartOptions`.
- All axes must have `type` specified
- Do not disable tooltips or add unnecessary explicit configurations — let defaults work
