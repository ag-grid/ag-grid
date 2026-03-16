# Examples Guide

This guide covers working with examples in the AG Charts codebase, including guidelines, validation, and path mappings.

## Repo to Dev Server Paths

Example paths are mapped from repo paths:

-   `packages/ag-charts-website/src/content/gallery/_examples/${exampleName}/index.html` => `/charts/gallery/examples/${exampleName}`
-   `packages/ag-charts-website/src/content/docs/${pageName}/_examples/${exampleName}/index.html` => `/charts/vanilla/${pageName}/examples/${exampleName}`

## Example Guidelines

-   When adding examples, make sure to also update the Markdoc page relating to the example (index.mdoc adjacent to the enclosing `_examples/` folder). Load the `/spruce-docs` skill for how to structure documentation pages.
-   Never add inline documentation to examples.
-   `-test` page examples are for internal testing and don't typically need much documentation.
-   Any other examples should be documented in the related `index.mdoc` file which should be a sibling of the enclosing parent folder `_examples`.
-   Examples have a `index.html` which is just a HTML snippet, not a full HTML document.
    -   Do not include <script> or other tags to load resources.
    -   `main.ts` is automatically included at runtime.
    -   Trivial example:
        ```html
        <div id="myChart"></div>
        ```
    -   Complex example with controls:
        ```html
        <div class="example-controls">
            <div class="controls-row">
                <button id="toggleBtn" onclick="toggleUpdates()">Start Updates</button>
                <select id="methodSelect" onchange="updateMethod(event.target.value)">
                    <option value="updateDelta">updateDelta()</option>
                    <option value="applyTransaction">applyTransaction()</option>
                </select>
                <span id="cpuUsage" style="margin-left: 10px">CPU: 0%</span>
            </div>
        </div>
        <div id="myChart"></div>
        ```
    -   **Important**: Controls should be placed BEFORE the chart div, wrapped in `class="example-controls"` with `class="controls-row"` for each row of controls.
    -   For simple binary toggles (e.g. zoom/pan, enabled/disabled), use two `<button>` elements rather than a `<select>` dropdown.
-   Styles for examples should be put into an adjacent `styles.css` file which will automatically be included at runtime.
    -   Styles in `external/ag-website-shared/src/components/example-runner/styles/example-controls.css` are applied automatically, and should be favoured for presenting controls in examples.
-   Examples should include a `title` on the chart options. Do not disable tooltips (`tooltip: { enabled: false }`) or add explicit axis/option configurations that aren't needed — let defaults work and only configure what the example is demonstrating.
-   Examples typically have a `data.ts` with a `getData()` function (for single data-set examples) which includes the dataset used by the example.
-   If a TData type is useful for the example, `data.ts` should also declare this.
-   For deeper architectural context, see the main AGENTS.md file for Documentation Resources.
-   **Hash param persistence**: Examples with configurable state (e.g., high-frequency test examples) use a `FormConfig` pattern to persist selections to URL hash params (`loadConfig()`/`saveConfig()`/`hashchange` listener). When adding new configurable state to such an example, wire it into this infrastructure so settings round-trip correctly.

## Event Handlers and Functions

Functions called from HTML event handlers (onclick, onchange, etc.) should be declared as top-level functions in `main.ts`. The framework generator automatically handles making these functions available to the HTML.

**Correct Pattern:**

```typescript
const chart = AgCharts.create(options);

function toggleFeature() {
    options.someOption = !options.someOption;
    chart.update(options);
}
```

```html
<button onclick="toggleFeature()">Toggle</button>
```

**Anti-Pattern - Do NOT use:**

```typescript
// WRONG: Do not assign functions to window
(window as any).toggleFeature = toggleFeature;

// WRONG: Do not use window assignments
window.toggleFeature = toggleFeature;
```

The framework generator handles function exposure automatically. Using `window` assignments breaks framework transformation and is unnecessary.

## Module Registration

Examples must explicitly register the modules they use with `ModuleRegistry` **before** creating charts. Key rules:

-   Enterprise examples: single import from `ag-charts-enterprise` (re-exports all community modules; never mix packages)
-   Community examples: import from `ag-charts-community`
-   Register at the top of `main.ts`, before chart creation; list modules alphabetically

See `.rulesync/skills/example/ag-charts/chart-construction.md` for full import patterns (enterprise, community, financial) and common module listings.

## Axes Configuration (v13+)

Use the **object-based axes syntax** (`axes: { x: { type: 'time' }, y: { type: 'number' } }`), NOT the legacy array syntax. For multiple axes, use `yKeyAxis`/`xKeyAxis` on the series — there is no `axes` object on the series.

See `.rulesync/skills/example/ag-charts/chart-construction.md` for full axes syntax, multiple axes patterns, and migration details.

## Framework Generation

Examples written in vanilla TypeScript are automatically transformed into React, Angular, and Vue variants. Understanding how this transformation works is essential for creating examples that work across all frameworks.

### Framework Generation Patterns

The example generator parses your vanilla TypeScript code and transforms it into framework-specific implementations. The following patterns are supported and transform cleanly:

**Supported Patterns:**

-   **Container Setup**: Chart container must use `document.getElementById()`:

    ```typescript
    const options: AgChartOptions = {
        container: document.getElementById('myChart'),
        // ... other options
    };
    ```

-   **Chart Instance Storage**: Store chart instance in a top-level variable:

    ```typescript
    const chart = AgCharts.create(options);
    ```

-   **Options Object**: Declare options as a top-level variable (not `const options = {...}` inline in create call):

    ```typescript
    const options: AgChartOptions = {
        /* ... */
    };
    const chart = AgCharts.create(options);
    ```

-   **Event Handlers in HTML**: Use inline event handlers that call top-level functions:

    ```html
    <button onclick="updateData()">Update</button>
    <select onchange="changeTheme(event.target.value)">
        ...
    </select>
    ```

    **Important**: Always use `event.target.value` instead of `this.value` for select/input handlers. The `this.value` pattern doesn't work in React/Angular/Vue because `this` in the generated arrow functions refers to the component context, not the DOM element.

-   **Top-Level Functions**: Functions that update the chart should be top-level (not nested):

    ```typescript
    function updateData() {
        options.data = getNewData();
        chart.update(options);
    }
    ```

-   **Chart Updates**: Use either `chart.update(options)` or `chart.updateDelta(partial)`:

    ```typescript
    // Full update
    function changeData() {
        options.data = newData;
        chart.update(options);
    }

    // Delta update
    function changeTitle() {
        chart.updateDelta({ title: { text: 'New Title' } });
    }
    ```

-   **Using Chart API**: Access chart methods directly:

    ```typescript
    function downloadChart() {
        chart.download({ fileName: 'my-chart.png' });
    }
    ```

-   **Scoping Utility Functions**: Functions that use chart or state but aren't called from DOM need `/** inScope */`:

    ```typescript
    const options: AgChartOptions = {
        container: document.getElementById('myChart'),
        // ... options
    };

    const chart = AgCharts.create(options);

    let isRunning = false;

    // Called from DOM - automatically hoisted, no comment needed
    function toggleUpdates() {
        if (isRunning) {
            stopUpdates();
        } else {
            startUpdates();
        }
    }

    // Uses chart/state but NOT called from DOM - needs /** inScope */
    /** inScope */
    function startUpdates() {
        isRunning = true;
        // ... use chart
    }

    /** inScope */
    function stopUpdates() {
        isRunning = false;
        // ... use chart
    }
    ```

    **Important:** Chart must be initialized with `const chart = AgCharts.create(options)` immediately after options, not deferred with `let chart` and later assignment.

    **When to use `/** inScope \*/`:\*\*

    -   Function uses `chart` reference or module-level state variables
    -   Function is NOT directly called from DOM event handlers (onclick, onchange, etc.)
    -   Function is called by other functions or timers/intervals

    **When NOT to use `/** inScope \*/`:\*\*

    -   Function is called directly from HTML event handlers (auto-hoisted)
    -   Function is top-level and doesn't use chart/state

### Framework Generation Restrictions

The following patterns **do not** transform cleanly to frameworks and should be avoided or require `@ag-skip-fws`:

**Unsupported Patterns:**

-   **Complex DOM Manipulation**: Direct DOM queries, element creation, or manipulation beyond simple controls
-   **External Libraries**: Third-party libraries (D3, Lodash, etc.) that aren't chart-related
-   **Advanced State Management**: Complex state beyond simple chart options updates
-   **Inline Arrow Functions in HTML**: Event handlers must call named functions, not inline arrows
-   **Chart Instance in Closures**: Don't capture chart in complex closures or nested scopes
-   **Dynamic HTML Generation**: Creating or modifying HTML structure in JavaScript
-   **Global Window Assignments**: Assigning to `window` object (except for event handlers which are handled automatically)
-   **Multiple Chart Instances**: Complex examples with multiple coordinated charts may not transform well
-   **Missing `/** inScope \*/`\*\*: Utility functions that use chart/state but aren't called from DOM must have this comment

**Examples Requiring `@ag-skip-fws`:**

```typescript
// External library integration
import * as d3 from 'd3';

import { getData } from './data';

const scale = d3.scaleLinear();

// Complex DOM manipulation
function updateUI() {
    document.querySelector('.status').innerHTML = '<div>Updated</div>';
    document.getElementById('myChart').style.height = '500px';
}

// Advanced async patterns
async function fetchAndUpdate() {
    const data = await complexAsyncOperation();
    await processData(data);
    chart.update(options);
}
```

### Writing Framework-Compatible Examples

Follow these guidelines to ensure your examples transform cleanly across all frameworks:

**Checklist for Framework-Compatible Examples:**

1. **Structure your code consistently:**

    ```typescript
    // 1. Imports
    import { AgChartOptions, AgCharts } from 'ag-charts-community';

    import { getData } from './data';

    // 2. Options object (top-level)
    const options: AgChartOptions = {
        container: document.getElementById('myChart'),
        data: getData(),
        // ... rest of options
    };

    // 3. Chart creation (top-level)
    const chart = AgCharts.create(options);

    // 4. Top-level functions for interactions
    function updateChart() {
        options.data = getNewData();
        chart.update(options);
    }
    ```

2. **Keep event handlers simple:**

    ```html
    <!-- Good: calls named function -->
    <button onclick="toggleSeries()">Toggle</button>
    <select onchange="updateInterval(event.target.value)">
        ...
    </select>

    <!-- Bad: inline logic -->
    <button onclick="chart.update({ title: { text: 'New' } })">Update</button>
    ```

3. **Use appropriate update methods:**

    ```typescript
    // Good: full options update
    function changeData() {
        options.data = newData;
        chart.update(options);
    }

    // Good: delta update for small changes
    function changeTitle() {
        chart.updateDelta({ title: { text: 'New Title' } });
    }

    // Avoid: mixing both patterns inconsistently
    ```

4. **Manage state in options object:**

    ```typescript
    // Good: state in options
    const options: AgChartOptions = {
        series: [{ type: 'line', xKey: 'x', yKey: 'y' }],
    };

    function toggleMarkers() {
        const series = options.series![0];
        series.marker = { enabled: !series.marker?.enabled };
        chart.update(options);
    }

    // Avoid: separate state variables
    let markersEnabled = true;
    function toggleMarkers() {
        markersEnabled = !markersEnabled;
        // ... this pattern doesn't transform well
    }
    ```

5. **Test across frameworks:**

    ```bash
    # Generate all framework variants
    nx run ag-charts-website-${pageName}_${exampleName}_main.ts:generate

    # Typecheck to verify transformations
    nx validate-examples

    # Visually test in dev server (switch frameworks in UI)
    nx dev
    ```

**Common Pitfalls:**

| Issue                         | Problem                        | Solution                                      |
| ----------------------------- | ------------------------------ | --------------------------------------------- |
| Chart not updating            | Not calling `chart.update()`   | Always call `update()` after changing options |
| "No data to display" after partial update | Using `chart.update()` with subset of options | `chart.update()` is a **full replacement** — omitted options (axes, series, etc.) are wiped. Use `chart.updateDelta()` for partial updates |
| TypeScript errors in React    | Using `chart` in wrong scope   | Ensure chart stored in top-level variable     |
| Event handlers not working    | Complex inline handlers        | Use simple function calls                     |
| Options not persisting        | Creating new options each time | Mutate the options object, then update        |
| Multiple charts coordination  | Complex state synchronization  | Simplify to single chart or separate examples |
| Type errors in generated code | Missing type imports           | Import all needed types in main.ts            |

### Framework Generation Requirements

**CRITICAL**: All public documentation examples MUST work across all frameworks. The `@ag-skip-fws` directive is ONLY for internal use.

**Public vs Internal Examples:**

-   **Public examples** (documentation pages): MUST be framework-compatible
-   **Internal examples** (`benchmarks`, `*-test` pages): Can use `@ag-skip-fws` if needed

**For Public Documentation Examples:**

If your example requires patterns that don't transform to frameworks (complex DOM manipulation, external libraries, etc.), you MUST redesign the example to be framework-compatible. Do NOT use `@ag-skip-fws`.

**Example Redesign Strategies:**

-   **Complex DOM manipulation** -> Keep controls simple, let frameworks handle UI
-   **External libraries** -> Use AG Charts native features instead
-   **Multiple coordinated charts** -> Show individual chart capabilities separately
-   **Advanced async patterns** -> Simplify to basic async or use static data

**For Internal Test/Benchmark Examples Only:**

Use the `// @ag-skip-fws` directive in `main.ts` for internal testing or benchmarking:

```typescript
// @ag-skip-fws
import { AgChartOptions, AgCharts } from 'ag-charts-community';

// ... rest of example
```

**Valid uses of `@ag-skip-fws` (internal only):**

-   **Performance Testing**: Benchmarks or high-frequency update examples
-   **Test Examples**: Internal `-test` page examples for specific edge cases
-   **Complex DOM Testing**: Shadow DOM, iframe, or other browser API testing
-   **Framework-specific Testing**: Examples specifically testing framework integration issues

**Decision Tree:**

```
Is this a public documentation example?
|-- YES -> MUST be framework-compatible
|   |-- Simple controls? -> Implement as shown in patterns
|   |-- Complex patterns needed? -> Redesign to be simpler and framework-compatible
|   +-- Cannot simplify? -> Reconsider if example belongs in public docs
|
+-- NO (benchmark or *-test page) -> Can use @ag-skip-fws if genuinely needed
    |-- Performance testing -> Use @ag-skip-fws
    |-- Browser API testing -> Use @ag-skip-fws
    +-- Could be made compatible? -> Prefer framework-compatible even for tests
```

**Note on Provided Examples**: A mechanism exists at `provided/modules/{framework}/` to manually override generated framework files, but this is **strongly discouraged** as it requires manual maintenance for each framework update. Do not use this mechanism.

## Example Validation + Building

-   **Gallery example**: `yarn nx run ag-charts-website-gallery_${exampleName}_main.ts:generate` + `:typecheck`
-   **Docs example**: `yarn nx run ag-charts-website-${pageName}_${exampleName}_main.ts:generate` + `:typecheck`
-   **All examples**: `yarn nx validate-examples` (batch typecheck; much faster than individual targets)
-   **Full generation**: `yarn nx generate-examples ag-charts-website`
-   **Thumbnails**: `yarn nx generate-thumbnails ag-charts-website`

See `.rulesync/skills/example/ag-charts/validation.md` for full validation workflow, decision tree, and common failure fixes.

## Reading External Examples (Plnkr, CodePen, etc.)

When implementing features or updating gallery examples based on external code examples (Plnkr, CodePen, etc.), follow this approach to extract code:

**Note**: When working with Plunker URLs (creating, modifying, or reading plunks), use the `plunker` skill (`/plunker` or Skill tool with skill="plunker") instead of manual browser automation or API calls. The skill provides guided workflows for common Plunker operations.

### Primary Method: Using Plnkr API

The most efficient way to extract Plnkr code is through their JSON API:

1. **Extract the Plunk ID from the URL**:

    - From `https://plnkr.co/edit/95LNJoaB0eYqh6DU?open=main.js` -> ID is `95LNJoaB0eYqh6DU`
    - From `https://embed.plnkr.co/plunk/mWWciY` -> ID is `mWWciY`

2. **Fetch the plunk data via API**:

    ```
    https://api.plnkr.co/plunks/{plunkId}
    ```

    This returns JSON with all file contents in the `files` object.

3. **Extract file contents programmatically**:

    - The response includes a `files` object with keys like `main.js`, `index.html`, `styles.css`, `data.ts`
    - Each file has a `content` property with the full source code
    - Raw files are also accessible at `//run.plnkr.co/plunks/{plunkId}/{filename}`

4. **Example API response structure**:
    ```json
    {
      "id": "95LNJoaB0eYqh6DU",
      "files": {
        "main.js": {
          "content": "const { AgCharts } = agCharts;\n...",
          "filename": "main.js",
          "raw_url": "//run.plnkr.co/plunks/95LNJoaB0eYqh6DU/main.js"
        },
        "index.html": { ... }
      },
      "description": "Example description",
      "tags": ["ag-grid", "ag-charts", "example"]
    }
    ```

### Practical Usage Examples

#### Using WebFetch tool (for AI agents):

```
WebFetch url="https://api.plnkr.co/plunks/95LNJoaB0eYqh6DU"
        prompt="Extract the main.js and data.ts file contents from this plunk"
```

#### Using fetch in code:

```typescript
async function extractPlunkCode(plunkId: string) {
    const response = await fetch(`https://api.plnkr.co/plunks/${plunkId}`);
    const data = await response.json();

    return {
        mainJs: data.files['main.js']?.content,
        dataTs: data.files['data.ts']?.content,
        indexHtml: data.files['index.html']?.content,
        styles: data.files['styles.css']?.content,
    };
}
```

#### Direct raw file access:

```
// For direct file access without API:
https://run.plnkr.co/plunks/95LNJoaB0eYqh6DU/main.js
https://run.plnkr.co/plunks/95LNJoaB0eYqh6DU/data.ts
```

### Fallback Method: Manual Extraction

If the API is unavailable or access fails, use this fallback approach:

1. **Navigate to the Plnkr URL** and take a screenshot to capture the editor view
2. **Use page text extraction** to parse the visible code:
    - Use browser automation (e.g., `mcp__claude-in-chrome__javascript_tool` or `mcp__claude-in-chrome__get_page_text`) to extract text content
    - Look for file content in the DOM or use `document.body.innerText`
3. **Copy the visible code manually from the screenshot** if extraction fails:
    - Read the line numbers and code visually from the screenshot
    - Type it into your implementation
4. **Verify against original example** by comparing:
    - Data structure (fields, types, values)
    - Formatter patterns (especially for multi-font text segments)
    - Label positioning (offset values, placement options)

### Key Pattern Example: Multi-Font Text Segments

When copying label formatter patterns, ensure you preserve:

```typescript
// Original Plnkr pattern:
calloutLabel: {
  formatter: ({ datum }) => [
    { text: datum.value.toString(), fontSize: 20, color: 'purple', fontWeight: 'bold' },
    { text: '\n' + datum.label, fontSize: 10, color: 'grey' },
  ],
}

// In your example, maintain this structure:
// - Array of text segment objects (not a string)
// - Each segment has: text, fontSize, color, fontWeight properties
// - Use '\n' for line breaks between segments
```

### Gallery Example Updates

When updating gallery examples from external references:

1. Identify what feature is being showcased (e.g., "multi-font labels")
2. Update relevant gallery example `main.ts` with the formatter pattern
3. If data source changes, update `data.ts` to match the reference example
4. Validate with `yarn nx validate-examples` before committing
5. Test locally via `yarn nx dev` to verify visual appearance

### Best Practices for External Code Extraction

1. **Always try the API first**: The JSON API is more reliable than manual extraction
2. **Preserve exact formatting**: When copying formatter functions, maintain the exact structure including array syntax for text segments
3. **Check for dependencies**: Some plunks may reference external libraries - verify these in `index.html`
4. **Validate data types**: Ensure numeric values aren't accidentally converted to strings
5. **Test the extracted code**: Always run the extracted code locally to verify it works as expected
6. **Document the source**: Include a comment with the original Plnkr URL for future reference

### Common Plnkr URL Patterns

-   Edit view: `https://plnkr.co/edit/{plunkId}`
-   Embed view: `https://embed.plnkr.co/plunk/{plunkId}`
-   Preview: `https://embed.plnkr.co/{plunkId}/preview`
-   API endpoint: `https://api.plnkr.co/plunks/{plunkId}`
-   Raw file: `https://run.plnkr.co/plunks/{plunkId}/{filename}`

## Quick Playbook: Example-only Change

1. Edit the example files (`index.html`, `main.ts`, optional `styles.css`/`data.ts`)
2. Mirror updates in the sibling `index.mdoc` docs page (load `/spruce-docs` for documentation patterns)
3. Run the relevant generation/typecheck command plus `yarn nx validate-examples`

## AG Grid Integrated Charts

When creating examples that use AG Grid's integrated charts feature (`enableCharts: true` with `createRangeChart()`):

-   **Load AG Charts before AG Grid**: Always include the AG Charts script tag BEFORE AG Grid Enterprise in the HTML. Without this, `enableCharts` will fail with error #200 "Unable to use enableCharts as either the ag-charts-community or ag-charts-enterprise script needs to be included alongside ag-grid-enterprise."

    ```html
    <!-- Correct order -->
    <script src="https://cdn.jsdelivr.net/npm/ag-charts-enterprise@11.0.0/dist/umd/ag-charts-enterprise.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise@33.1.0/dist/ag-grid-enterprise.js"></script>
    ```

-   **Use chartDataType: 'time' for timestamps**: When displaying time-series data in integrated charts, set `chartDataType: 'time'` on timestamp columns (not just `'category'`). This ensures proper time-axis rendering.

    ```typescript
    columnDefs: [
        {
            field: 'timestamp',
            chartDataType: 'time', // For time-series data
            valueFormatter: (params) => new Date(params.value).toLocaleString(),
        },
        { field: 'value', chartDataType: 'series' },
    ];
    ```

## AG Charts API Guidelines

When working with AG Charts API features in examples:

-   **initialState zoom structure**: Use `rangeX`/`rangeY` (not `x`/`y`) with `start`/`end` properties (not `min`/`max`). For date values, use `AgStateSerializableDate` format:

    ```typescript
    // Correct structure
    const initialState = {
        zoom: {
            rangeX: {
                start: { __type: 'date', value: timestamp },
                end: { __type: 'date', value: timestamp }
            }
        }
    };

    // Wrong - incorrect property names
    const initialState = {
        zoom: {
            x: { min: timestamp, max: timestamp }  // Wrong
        }
    };
    ```

-   **AgStateSerializableDate format**: When using dates in `initialState`, wrap timestamps in the proper format with `__type: 'date'` and `value` property as required by the `AgStateSerializableDate` type.

## Related Resources

-   `/spruce-docs` skill - How to write documentation pages that reference examples
-   `.rulesync/skills/spruce-docs/checklist.md` - Validation checklist for documentation pages
-   [Code Quality Guide](./code-quality.md) - Code quality standards that apply to examples
