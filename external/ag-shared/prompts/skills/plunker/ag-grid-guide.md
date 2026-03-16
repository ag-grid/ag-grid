## AG Grid Example Structure

This section covers the Plunker-specific file structure for AG Grid demos.

**CRITICAL**: Follow this exact structure to match website-generated Plunkers.

### Required Files

1. `index.html` - HTML structure with inline styles
2. `main.js` - Grid configuration and creation
3. `ag-example-styles.css` - Copy from `<skill-base-directory>/assets/ag-example-styles.css`
4. `package.json` - Dependencies
5. `data.js` (optional) - Data if not inline

### index.html

**WITHOUT controls:**

```html
<html lang="en">
    <head>
        <title>AG Grid Example - Demo Name</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <link rel="stylesheet" href="ag-example-styles.css" />
        <style>
            body {
                padding: 1rem;
            }
        </style>
    </head>
    <body>
        <div id="myGrid" style="height: 500px" class="ag-theme-quartz"></div>
        <script src="https://cdn.jsdelivr.net/npm/ag-grid-community@33.0.0/dist/ag-grid-community.min.js"></script>
        <script src="main.js"></script>
    </body>
</html>
```

**WITH controls:**

```html
<html lang="en">
    <head>
        <title>AG Grid Example - Demo Name</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <link rel="stylesheet" href="ag-example-styles.css" />
        <style>
            body {
                padding: 1rem;
            }
        </style>
    </head>
    <body>
        <div class="example-controls">
            <div class="controls-row">
                <!-- Your controls here -->
            </div>
        </div>
        <div id="myGrid" style="height: 500px" class="ag-theme-quartz"></div>
        <script src="https://cdn.jsdelivr.net/npm/ag-grid-community@33.0.0/dist/ag-grid-community.min.js"></script>
        <script src="main.js"></script>
    </body>
</html>
```

**Key points:**

-   Include `<meta name="robots" content="noindex" />` to prevent indexing
-   The grid container **must** have an explicit `style="height: 500px"` (or similar) — without it the grid collapses to zero height
-   Apply a theme class to the container: `ag-theme-quartz` (default), `ag-theme-alpine`, or `ag-theme-balham`
-   Use a **specific version** (e.g., `@33.0.0`) with optional cache-busting timestamp (`?t=1768428202375`)
-   Generate timestamp with: `date +%s%3N`
-   Do NOT add `<h1>`, `<p>`, or other decorative elements

For Enterprise features, use the enterprise CDN URL:

```html
<script src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise@33.0.0/dist/ag-grid-enterprise.min.js"></script>
```

### Enterprise vs Community

Use `ag-grid-enterprise` CDN URL if the example uses any enterprise-only feature (e.g., row grouping, server-side row model, tree data, master/detail, range selection, integrated charts, status bar, sidebar, etc.).

### main.js

```javascript
const gridOptions = {
    rowData: getData(), // or inline array
    columnDefs: [
        { field: 'make' },
        { field: 'model' },
        { field: 'price' },
    ],
    defaultColDef: {
        flex: 1,
    },
};

const gridElement = document.getElementById('myGrid');
agGrid.createGrid(gridElement, gridOptions);
```

**Key points:**

-   The UMD global is `agGrid` — use `agGrid.createGrid(element, options)`
-   Do NOT use `new Grid()` (deprecated) or `agGrid.Grid` — use `agGrid.createGrid()`
-   The first argument must be a DOM element, not a string selector

### ag-example-styles.css

Copy the CSS file directly from the skill assets — do not write it by hand:

```bash
cp "<skill-base-directory>/assets/ag-example-styles.css" "$PLNKR_DIR/ag-example-styles.css"
```

This file includes both the base control styles (buttons, inputs, etc.) and the vanilla framework styles needed for proper layout.

### Controls

If your example needs interactive controls, wrap them in `<div class="example-controls">` with `<div class="controls-row">` for each row. The grid `<div id="myGrid">` sits **outside** the controls div as a sibling. Use `gap-left`, `gap-right`, `push-left`, `push-right` classes for layout.

### package.json

```json
{
    "name": "ag-grid-example",
    "dependencies": {
        "ag-grid-community": "latest"
    }
}
```

For Enterprise, use `"ag-grid-enterprise": "latest"` instead.

### CDN URLs

**Staging (DEFAULT for testing):**

Use staging by default unless the user specifies a version. Add a cache-busting timestamp.

-   Community: `https://grid-staging.ag-grid.com/dev/ag-grid-community/dist/ag-grid-community.min.js?t={timestamp}`
-   Enterprise: `https://grid-staging.ag-grid.com/dev/ag-grid-enterprise/dist/ag-grid-enterprise.min.js?t={timestamp}`

Generate timestamp with: `date +%s%3N`

**Versioned (for reproduction/sharing):**

-   Community: `https://cdn.jsdelivr.net/npm/ag-grid-community@33.0.0/dist/ag-grid-community.min.js`
-   Enterprise: `https://cdn.jsdelivr.net/npm/ag-grid-enterprise@33.0.0/dist/ag-grid-enterprise.min.js`

### data.js (Optional Separate Data File)

Create a `data.js` when data is large enough to warrant separation (roughly >20 rows or >30 lines). Define a `getData()` function:

```javascript
function getData() {
    return [
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        // ...
    ];
}
```

In `index.html`, add `<script src="data.js"></script>` **before** `<script src="main.js"></script>`. In `main.js`, call `getData()`. For small datasets, inline the data directly.

### Integrated Charts (AG Charts inside AG Grid)

When the grid example uses integrated charts (e.g., chart ranges, pivot charts), you must load AG Charts Enterprise **before** AG Grid Enterprise:

```html
<script src="https://cdn.jsdelivr.net/npm/ag-charts-enterprise@13.0.0/dist/umd/ag-charts-enterprise.js"></script>
<script src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise@33.0.0/dist/ag-grid-enterprise.min.js"></script>
```

Load order matters — AG Charts Enterprise must be loaded first so AG Grid can detect and use it.

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Grid collapses to zero height | Missing explicit height on container | Add `style="height: 500px"` to `#myGrid` |
| Grid doesn't render | Wrong CDN URL or missing global | Check script src and use `agGrid.createGrid()` |
| `new Grid()` error | Using deprecated API | Use `agGrid.createGrid(element, options)` |
| No theme styling | Missing theme class | Add `class="ag-theme-quartz"` to grid container |
| Styling issues | Missing example styles | Copy `ag-example-styles.css` from assets |
| Controls break grid layout | Grid div nested inside controls div | `<div id="myGrid">` must be a **sibling** outside `<div class="example-controls">` |
| Integrated charts not working | Wrong script load order | Load `ag-charts-enterprise` **before** `ag-grid-enterprise` |
| Container not found | Using string selector | Use `document.getElementById('myGrid')` |
