## AG Charts Example Structure

This section covers the Plunker-specific file structure for AG Charts demos. For general chart construction patterns (axes syntax, module registration, controls), see `.rulesync/skills/example/ag-charts/chart-construction.md`. For enterprise vs community feature decisions, see `.rulesync/skills/example/ag-charts/enterprise-features.md`.

**CRITICAL**: Follow this exact structure to match website-generated Plunkers.

### Required Files

1. `index.html` - HTML structure with inline styles
2. `main.js` - Chart configuration and creation
3. `ag-example-styles.css` - Copy from `<skill-base-directory>/assets/ag-example-styles.css`
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
-   Do NOT add `<h1>`, `<p>`, or any other elements — use the chart's `title`/`subtitle` options instead

For Enterprise features, use the enterprise CDN URL:

```html
<script src="https://cdn.jsdelivr.net/npm/ag-charts-enterprise@13.0.0/dist/umd/ag-charts-enterprise.js"></script>
```

### Enterprise vs Community

See `.rulesync/skills/example/ag-charts/enterprise-features.md` for the full feature matrix. Use `ag-charts-enterprise` CDN URL if the example uses any enterprise-only series, axis, or plugin.

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

**No module registration in vanilla JS:** Vanilla JS examples using UMD bundles do NOT call `AgCharts.setupModules()` or `ModuleRegistry.register()`. Module registration is only needed in framework/ESM examples. The UMD bundle automatically registers all included modules.

### Axes (v13+)

Use the **object-based axes syntax**: `axes: { x: { type: 'time' }, y: { type: 'number' } }`. See `.rulesync/skills/example/ag-charts/chart-construction.md` for full syntax and multiple axes patterns.

### ag-example-styles.css

Copy the CSS file directly from the skill assets — do not write it by hand:

```bash
cp "<skill-base-directory>/assets/ag-example-styles.css" "$PLNKR_DIR/ag-example-styles.css"
```

This file includes both the base control styles (buttons, inputs, etc.) and the vanilla framework styles needed for proper chart sizing. **Without these styles, the chart will appear small and not fill the available space.**

### Controls

If your example needs interactive controls, wrap them in `<div class="example-controls">` with `<div class="controls-row">` for each row. The chart `<div id="myChart">` sits **outside** the controls div as a sibling. Use `gap-left`, `gap-right`, `push-left`, `push-right` classes for layout. No additional CSS needed — base styles handle all control styling.

### package.json

```json
{
    "name": "ag-charts-example",
    "dependencies": {
        "ag-charts-community": "latest"
    }
}
```

For Enterprise, use `"ag-charts-enterprise": "latest"` instead.

### CDN URLs

**Staging (DEFAULT for testing):**

Use staging by default unless the user specifies a version. Add a cache-busting timestamp.

-   Community: `https://charts-staging.ag-grid.com/dev/ag-charts-community/dist/umd/ag-charts-community.js?t={timestamp}`
-   Enterprise: `https://charts-staging.ag-grid.com/dev/ag-charts-enterprise/dist/umd/ag-charts-enterprise.js?t={timestamp}`

Generate timestamp with: `date +%s%3N`

**Versioned (for reproduction/sharing):**

-   Community: `https://cdn.jsdelivr.net/npm/ag-charts-community@13.0.0/dist/umd/ag-charts-community.js`
-   Enterprise: `https://cdn.jsdelivr.net/npm/ag-charts-enterprise@13.0.0/dist/umd/ag-charts-enterprise.js`

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

In `index.html`, add `<script src="data.js"></script>` **before** `<script src="main.js"></script>`. In `main.js`, call `getData()`. For small datasets, inline the data directly.

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Chart appears small | Missing vanilla framework styles | Copy `ag-example-styles.css` from assets |
| Chart doesn't render | Wrong CDN URL or missing global | Check script src and use `agCharts.AgCharts` |
| Styling issues | Missing inline styles in index.html | Add the `<style>` block in `<head>` |
| Layout breaks | Extra HTML elements in body | Remove all elements except controls + `<div id="myChart">` |
| Wrong UMD global | Using `agChartsEnterprise`/`agChartsCommunity` | Always use `agCharts` — `const { AgCharts } = agCharts;` |
| Update API error | Using `AgCharts.update(chart, opts)` | Use instance method: `chart.update(options)` (v13+) |
| Container not found | Using string selector `'#myChart'` | Use `document.getElementById('myChart')` |
| Controls break chart layout | Chart div nested inside controls div | `<div id="myChart">` must be a **sibling** outside `<div class="example-controls">` |
