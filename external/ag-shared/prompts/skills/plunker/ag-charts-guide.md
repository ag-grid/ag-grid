## AG Charts Example Structure

This section covers the specific file structure and content needed for AG Charts demos on Plunker.

**CRITICAL**: Follow this exact structure to match website-generated Plunkers.

### Required Files

1. `index.html` - HTML structure with inline styles
2. `main.js` - Chart configuration and creation
3. `ag-example-styles.css` - Base styles plus framework styles
4. `package.json` - Dependencies
5. `data.js` (optional) - Data if not inline

### index.html

**WITHOUT controls:**

```html
<html lang="en">
    <head>
        <title>AG Charts Example - Demo Name</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <link rel="stylesheet" href="ag-example-styles.css" />
        <style>
            body {
                padding: 1rem;
            }
            div:has(> .ag-charts-wrapper),
            ag-charts,
            ag-financial-charts {
                padding: 0 !important;
                border: none !important;
            }
        </style>
    </head>
    <body>
        <div id="myChart"></div>
        <script src="https://cdn.jsdelivr.net/npm/ag-charts-community@13.0.0/dist/umd/ag-charts-community.js"></script>
        <script src="main.js"></script>
    </body>
</html>
```

**WITH controls:**

```html
<html lang="en">
    <head>
        <title>AG Charts Example - Demo Name</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <link rel="stylesheet" href="ag-example-styles.css" />
        <style>
            body {
                padding: 1rem;
            }
            div:has(> .ag-charts-wrapper),
            ag-charts,
            ag-financial-charts {
                padding: 0 !important;
                border: none !important;
            }
        </style>
    </head>
    <body>
        <div class="example-controls">
            <div class="controls-row">
                <!-- Your controls here -->
            </div>
        </div>
        <div id="myChart"></div>
        <script src="https://cdn.jsdelivr.net/npm/ag-charts-community@13.0.0/dist/umd/ag-charts-community.js"></script>
        <script src="main.js"></script>
    </body>
</html>
```

**Key points:**

-   Include `<meta name="robots" content="noindex" />` to prevent indexing
-   Include the inline `<style>` block - required for proper sizing
-   Use a **specific version** (e.g., `@13.0.0`) with optional cache-busting timestamp (`?t=1768428202375`)
-   Generate timestamp with: `date +%s%3N`

**NO extra HTML elements:**

-   Do NOT add `<h1>`, `<p>`, `<div>` or any other elements above or below `<div id="myChart"></div>`
-   Use the chart's `title` and `subtitle` options for explanatory text instead
-   Extra elements break the layout and are inconsistent with website examples

For Enterprise features, use the enterprise CDN URL:

```html
<script src="https://cdn.jsdelivr.net/npm/ag-charts-enterprise@13.0.0/dist/umd/ag-charts-enterprise.js"></script>
```

### Enterprise-Only Features

The following features require the **enterprise** CDN bundle. If your example uses any of these, you **must** use `ag-charts-enterprise` — the community bundle will silently skip them.

| Category | Enterprise-only | Community |
|----------|----------------|-----------|
| **Series** | box-plot, candlestick, ohlc, heatmap, range-area, range-bar, waterfall, funnel, cone-funnel, nightingale, radar-area, radar-line, radial-bar, radial-column, map-shape, map-line, map-marker, pyramid, linear-gauge, radial-gauge, sunburst, treemap, chord, sankey | bar, line, area, scatter, bubble, pie, donut, histogram |
| **Axes** | ordinal-time, angle-category, angle-number, radius-category, radius-number | number, log, time, unit-time, category, grouped-category |
| **Plugins** | annotations, zoom, navigator, scrollbar, crosshair, animation, context-menu, toolbar, sync, ranges, gradient-legend, error-bars, data-source | legend, locale |
| **Presets** | financial charts (price-volume), gauge | sparkline |

**Rule of thumb:** If it's a specialised chart type (financial, statistical, hierarchical, geographic) or an interactive plugin (zoom, annotations, navigator), it's enterprise.

### main.js

```javascript
const { AgCharts } = agCharts;

const options = {
    container: document.getElementById('myChart'),
    title: { text: 'Chart Title Here' },
    subtitle: { text: 'Explanatory text goes in the subtitle' },
    data: getData(), // or inline array
    series: [
        // series configuration
    ],
};

AgCharts.create(options);
```

### Axes Configuration (v13+)

**IMPORTANT**: Use the object-based axes syntax, NOT the legacy array syntax:

```javascript
// ✅ CORRECT - New object syntax (v13+)
axes: {
    x: { type: 'time' },
    y: { type: 'number' },
}

// ❌ WRONG - Legacy array syntax (pre-v13, deprecated)
axes: [
    { type: 'time', position: 'bottom' },
    { type: 'number', position: 'left' },
]
```

Only options that differ from defaults need to be specified:

```javascript
// Minimal - just specify what you need
axes: {
    x: { type: 'time' },
}

// With additional options
axes: {
    x: { type: 'time' },
    y: { type: 'number', title: { text: 'Price' } },
}
```

See [Upgrade to AG Charts 13](https://www.ag-grid.com/charts/javascript/upgrade-to-ag-charts-13/) for migration details.

### ag-example-styles.css

The CSS file must include **TWO parts**:

1. **Base styles** - Control element styling (buttons, inputs, etc.)
2. **Vanilla framework styles** - Required for proper chart sizing

**Without the vanilla framework styles, the chart will appear small and not fill the available space.**

```css
/**
 * Styles for control elements in examples, not required for the examples' functionality
 */
:root {
    --main-fg: #101828;
    --main-bg: #fff;

    --chart-bg: #fff;
    --chart-border: #d0d5dd;

    --button-fg: #212529;
    --button-bg: transparent;
    --button-border: #d0d5dd;
    --button-hover-bg: rgba(0, 0, 0, 0.1);

    --input-accent: #0e4491;
    --input-focus-border: #3d7acd;
    --range-track-bg: #efefef;

    --row-gap: 6px;

    --select-chevron: url('data:image/svg+xml;utf8,<svg fill="none" stroke="%23667085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6 9L12 15L18 9"/></svg>');
    --checkbox-tick-icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6L9 17L4 12'/%3E%3C/svg%3E");
}

:root[data-dark-mode='true'] {
    --main-fg: #fff;
    --main-bg: #141d2c;

    --chart-bg: #192232;
    --chart-border: #344054;

    --button-fg: #f8f9fa;
    --button-bg: transparent;
    --button-border: rgba(255, 255, 255, 0.2);
    --button-hover-bg: #2a343e;

    --input-accent: #a9c5ec;
    --input-focus-border: #3d7acd;
    --range-track-bg: #4a5465;

    --select-chevron: url('data:image/svg+xml;utf8,<svg fill="none" stroke="%239CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6 9L12 15L18 9"/></svg>');
    --checkbox-tick-icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232a343e' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6L9 17L4 12'/%3E%3C/svg%3E");
}

*,
*::before,
*::after {
    box-sizing: border-box;
}

:root,
body {
    height: 100%;
    width: 100%;
    margin: 0;
    overflow: hidden;
}

/* Hide codesandbox highlighter */
body > #highlighter {
    display: none;
}

.example-controls {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
}

.example-controls *,
.example-controls *::before,
.example-controls *::after {
    margin: 0;
    font-family: -apple-system, 'system-ui', sans-serif;
    font-size: 14px;
    font-weight: 500;
    line-height: 17px;
    letter-spacing: 0.01em;
    color: var(--main-fg);
}

.example-controls :where(button, textarea, select, input[type='submit'], input[type='text'], input[type='number']) {
    appearance: none;
    display: inline-block;
    height: 36px;
    padding: 5px 14px 7px;
    white-space: nowrap;
    border-radius: 6px;
    color: var(--button-fg);
    background-color: var(--button-bg);
    border: 1px solid var(--button-border);
    box-shadow: 0 0 0 0 transparent;
    transition:
        background-color 0.25s ease-in-out,
        border-color 0.25s ease-in-out,
        box-shadow 0.25s ease-in-out;
    align-self: flex-start;
}

.example-controls :where(button, select, input[type='submit']) {
    cursor: pointer;
}

.example-controls select {
    appearance: none;
    padding-right: 32px;
    padding-left: 14px;
    background: no-repeat center right 4px var(--select-chevron);
}

.example-controls textarea {
    height: auto;
    padding: 7px 14px;
}

.example-controls pre,
.example-controls code {
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}

.example-controls input {
    appearance: none;
}

.example-controls input[type='checkbox'],
.example-controls input[type='radio'] {
    border: 1px solid var(--button-border);
    cursor: pointer;
}

.example-controls input[type='radio'] {
    width: 20px;
    height: 20px;
    border-radius: 50%;
}

.example-controls input[type='radio']:checked {
    border-width: 0;
    box-shadow: inset 0 0 0 6px var(--input-accent);
}

.example-controls input[type='radio']:checked:focus-visible {
    box-shadow:
        inset 0 0 0 2px var(--input-focus-border),
        inset 0 0 0 3px var(--main-bg),
        inset 0 0 0 6px var(--input-accent);
}

.example-controls input[type='checkbox'] {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    cursor: pointer;
}

.example-controls input[type='checkbox']:checked {
    background: var(--input-accent) no-repeat center/14px var(--checkbox-tick-icon);
    border-color: var(--input-accent);
}

.example-controls input[type='range'] {
    appearance: none;
    min-width: 160px;
    border-radius: 8px;
    cursor: pointer;
    overflow: hidden; /*  slider progress trick  */
    background: var(--range-track-bg);
}

.example-controls input[type='range']::-webkit-slider-runnable-track {
    appearance: none;
    height: 16px;
    background: var(--range-track-bg);
}

.example-controls input[type='range']::-moz-range-track {
    appearance: none;
    height: 16px;
    background: var(--range-track-bg);
}

.example-controls input[type='range']::-webkit-slider-thumb {
    appearance: none;
    height: 16px;
    width: 16px;
    background-color: var(--main-bg);
    border-radius: 50%;
    border: 2px solid var(--input-accent);
    box-shadow: -1007px 0 0 1000px var(--input-accent); /*  slider progress trick  */
}

.example-controls input[type='range']::-moz-range-thumb {
    appearance: none;
    height: 16px;
    width: 16px;
    background-color: var(--main-bg);
    border-radius: 50%;
    border: 2px solid var(--input-accent);
    box-shadow: -1007px 0 0 1000px var(--input-accent); /*  slider progress trick  */
}

.example-controls :is(button, input[type='submit'], select):hover {
    background-color: var(--button-hover-bg);
}

.example-controls :is(button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible) {
    border-color: var(--input-focus-border);
    box-shadow:
        inset 0 0 0 1px var(--input-focus-border),
        inset 0 0 0 2px var(--main-bg);
    outline: none;
}

.controls-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--row-gap);
    font-variant: tabular-nums;
}

.controls-row + .controls-row {
    margin-top: var(--row-gap);
}

.controls-row.center {
    justify-content: center;
}

.controls-row .push-right {
    margin-left: auto;
}

.controls-row .push-left {
    margin-right: auto;
}

.controls-row .gap-right {
    margin-right: calc(var(--row-gap) * 6);
}

.controls-row .gap-left {
    margin-left: calc(var(--row-gap) * 6);
}

body {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 8px;
}

div:has(> .ag-charts-wrapper) {
    padding: 1rem;
    height: 100%;
    border-radius: 8px;
    background-color: var(--chart-bg);
    border: 1px solid var(--chart-border);
    overflow: hidden;
    transform: translate3d(0, 0, 0);
}
```

**Without these styles, the chart will appear small and not fill the available space.**

### Source Locations

These are the authoritative sources for example styling in the codebase:

| File                                                                                                     | Purpose                                     |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `external/ag-website-shared/src/components/example-runner/styles/example-controls.css`                   | Base control styles (buttons, inputs, etc.) |
| `plugins/ag-charts-generate-example-files/src/executors/generate/generator/styles/getFrameworkStyles.ts` | Vanilla framework styles for chart sizing   |
| `external/ag-website-shared/src/components/plunkr/utils/plunkr.ts`                                       | How the website generates Plunkers          |
| `packages/ag-charts-website/src/content/docs/examples-controls-test/index.mdoc`                          | Example controls documentation and demo     |

### Adding Example Controls

If your example needs interactive controls (buttons, dropdowns, checkboxes, etc.), follow the patterns documented in the [Example Controls](https://www.ag-grid.com/charts/javascript/examples-controls-test/) page.

**Key structure:**

```html
<div class="example-controls">
    <div class="controls-row">
        <button onclick="myFunction()">Click Me</button>
        <select onchange="handleChange(event)">
            <option value="a">Option A</option>
            <option value="b">Option B</option>
        </select>
    </div>
</div>

<div id="myChart"></div>
```

**Important:**

-   Wrap all controls in `<div class="example-controls">`
-   Each row of controls uses `<div class="controls-row">`
-   The chart `<div id="myChart">` sits **outside** the controls div
-   Use `gap-left`, `gap-right`, `push-left`, `push-right` classes for layout
-   No additional CSS should be needed - base styles handle all control styling

### package.json

```json
{
    "name": "ag-charts-example",
    "dependencies": {
        "ag-charts-community": "latest"
    }
}
```

For Enterprise:

```json
{
    "name": "ag-charts-example",
    "dependencies": {
        "ag-charts-enterprise": "latest"
    }
}
```

### CDN URLs

**Staging (DEFAULT for testing):**

Use staging by default unless the user specifies a version. Add a cache-busting timestamp.

-   Community: `https://charts-staging.ag-grid.com/dev/ag-charts-community/dist/umd/ag-charts-community.js?t={timestamp}`
-   Enterprise: `https://charts-staging.ag-grid.com/dev/ag-charts-enterprise/dist/umd/ag-charts-enterprise.js?t={timestamp}`

Generate timestamp with: `date +%s%3N`

**Versioned (for reproduction/sharing):**

-   Community: `https://cdn.jsdelivr.net/npm/ag-charts-community@13.0.0/dist/umd/ag-charts-community.js`
-   Enterprise: `https://cdn.jsdelivr.net/npm/ag-charts-enterprise@13.0.0/dist/umd/ag-charts-enterprise.js`

**Latest (not recommended - may break):**

-   `https://cdn.jsdelivr.net/npm/ag-charts-community/dist/umd/ag-charts-community.js`

### data.js (Optional Separate Data File)

Create a `data.js` when data is large enough to warrant separation (roughly >20 rows or >30 lines). Define a `getData()` function:

```javascript
function getData() {
    return [
        { month: 'Jan', value: 10 },
        { month: 'Feb', value: 20 },
        // ...
    ];
}
```

In `index.html`, add `<script src="data.js"></script>` **before** `<script src="main.js"></script>`:

```html
<script src="{CDN_URL}"></script>
<script src="data.js"></script>
<script src="main.js"></script>
```

In `main.js`, call `getData()`:

```javascript
data: getData(),
```

For small datasets (a few rows), inline the data directly in `main.js` instead.

### Common Issues

| Issue                         | Cause                                    | Fix                                                          |
| ----------------------------- | ---------------------------------------- | ------------------------------------------------------------ |
| Chart appears small           | Missing vanilla framework styles         | Add the body flex and `div:has(> .ag-charts-wrapper)` styles |
| Chart doesn't render          | Wrong CDN URL or missing global          | Check script src and use `agCharts.AgCharts`                 |
| Styling issues                | Missing inline styles in index.html      | Add the `<style>` block in `<head>`                          |
| Broken after time             | Using unversioned CDN URLs               | Pin to specific version like `@13.0.0`                       |
| Layout breaks                 | Extra HTML elements in body              | Remove all elements except controls + `<div id="myChart">`   |
| Wrong UMD global              | Using `agChartsEnterprise`/`agChartsCommunity` | Always use `agCharts` — `const { AgCharts } = agCharts;` |
| Update API error              | Using `AgCharts.update(chart, opts)`     | Use instance method: `chart.update(options)` (v13+)          |
| Container not found           | Using string selector `'#myChart'`       | Use `document.getElementById('myChart')`                     |
| Controls break chart layout   | Chart div nested inside controls div     | `<div id="myChart">` must be a **sibling** outside `<div class="example-controls">` |

### Tips

1. **Test locally first** - Open index.html in browser before uploading
2. **Use console.log** - Plunker's preview has a console
3. **Keep examples minimal** - Focus on demonstrating one feature
4. **Never add extra HTML** - Use chart `title` and `subtitle` options for explanatory text, not `<h1>`, `<p>`, etc.
5. **Include comments** - Help readers understand the code
