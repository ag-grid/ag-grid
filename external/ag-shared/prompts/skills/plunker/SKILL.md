---
targets: ['*']
name: plunker
description: 'Create and manage Plunker (plnkr.co) examples for AG Charts. Use when working with plnkr.co URLs, creating shareable code demos, forking existing plunks, or troubleshooting Plunker structure issues.'
context: fork
---

# Plunker Guide

This guide covers working with Plunker for creating and sharing code examples.

## Framework Preference

**Always create plunkers in vanilla JavaScript unless:**

-   The user explicitly requests a specific framework (Angular, React, Vue)
-   The bug/feature is framework-specific and cannot be reproduced in vanilla JS

**When given a framework example (e.g., Angular) for a bug:**

1. Convert it to vanilla JS before using or creating a repro
2. Only keep the framework version if the issue is framework-specific

**Rationale:**

-   Vanilla JS examples are simpler and load faster
-   They work without framework dependencies or build systems
-   Easier to debug and share
-   Framework wrappers are thin - most bugs reproduce in vanilla JS

## Table of Contents

1. [Plunker API Reference](#plunker-api-reference) - Core API operations
2. [AG Charts Example Structure](#ag-charts-example-structure) - Specific requirements for AG Charts demos

---

## Plunker API Reference

### Reading a Plunk

Fetch any public plunk's content:

```bash
curl -s 'https://api.plnkr.co/plunks/{plunkId}'
```

Response structure:

```json
{
    "id": "U7l3QaCV6qeYyqnt",
    "description": "Example Title",
    "tags": ["tag1", "tag2"],
    "files": {
        "main.js": {
            "content": "// file content here",
            "filename": "main.js"
        }
    }
}
```

### Getting an Access Token

Required for creating/updating plunks:

```bash
curl -s -c /tmp/plnk-cookies.txt 'https://plnkr.co/edit/' > /dev/null
TOKEN=$(grep 'plnkr.access_token' /tmp/plnk-cookies.txt | awk '{print $7}')
```

**Notes:**

-   The `plnkr.access_token` cookie is a JWT that works as a Bearer token
-   Tokens expire - get a fresh one before each API session
-   Cookie-based auth does NOT work - must use Bearer token

### Creating a New Plunk

```bash
curl -s -X POST 'https://api.plnkr.co/v2/plunks' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d @payload.json
```

Payload structure:

```json
{
    "title": "My Example",
    "tags": ["tag1", "tag2"],
    "entries": [
        { "type": "file", "pathname": "index.html", "content": "..." },
        { "type": "file", "pathname": "main.js", "content": "..." }
    ]
}
```

**Important:**

-   Use `entries` array (not `files` object)
-   Each entry needs `type: "file"`, `pathname`, and `content`
-   Do NOT use `description` field (use `title` instead)

Response includes:

```json
{
    "id": "newPlunkId",
    "token": "privateToken123",
    "created_at": "2026-01-15T..."
}
```

Resulting URL: `https://plnkr.co/edit/{id}?open=main.js`

### Fork, Edit, and Save Workflow

Plunker doesn't have a direct "fork" API. Instead, read the original, modify, and create a new plunk:

#### Step 1: Read the Original Plunk

```bash
# Get the plunk content
PLUNK_ID="U7l3QaCV6qeYyqnt"
curl -s "https://api.plnkr.co/plunks/$PLUNK_ID" > /tmp/original.json
```

#### Step 2: Get Access Token

```bash
curl -s -c /tmp/plnk-cookies.txt 'https://plnkr.co/edit/' > /dev/null
TOKEN=$(grep 'plnkr.access_token' /tmp/plnk-cookies.txt | awk '{print $7}')
```

#### Step 3: Modify and Create New Plunk

```bash
node -e "
const fs = require('fs');
const original = JSON.parse(fs.readFileSync('/tmp/original.json', 'utf8'));

// Modify the content as needed
let mainJs = original.files['main.js'].content;
mainJs = mainJs.replace('oldValue', 'newValue');

// Build the new plunk payload
const payload = {
  title: original.description + ' (Fork)',
  tags: original.tags,
  entries: Object.entries(original.files).map(([pathname, file]) => ({
    type: 'file',
    pathname,
    content: pathname === 'main.js' ? mainJs : file.content
  }))
};

fs.writeFileSync('/tmp/fork-payload.json', JSON.stringify(payload));
"

# Create the forked plunk
curl -s -X POST 'https://api.plnkr.co/v2/plunks' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d @/tmp/fork-payload.json
```

#### Complete One-Liner Example

```bash
PLUNK_ID="U7l3QaCV6qeYyqnt" && \
curl -s "https://api.plnkr.co/plunks/$PLUNK_ID" > /tmp/original.json && \
curl -s -c /tmp/plnk-cookies.txt 'https://plnkr.co/edit/' > /dev/null && \
TOKEN=$(grep 'plnkr.access_token' /tmp/plnk-cookies.txt | awk '{print $7}') && \
node -e "
const fs = require('fs');
const original = JSON.parse(fs.readFileSync('/tmp/original.json', 'utf8'));

// Your modifications here
let mainJs = original.files['main.js'].content;
// mainJs = mainJs.replace(...);

const payload = {
  title: original.description + ' (Fork)',
  tags: original.tags,
  entries: Object.entries(original.files).map(([pathname, file]) => ({
    type: 'file',
    pathname,
    content: pathname === 'main.js' ? mainJs : file.content
  }))
};
fs.writeFileSync('/tmp/fork-payload.json', JSON.stringify(payload));
" && \
curl -s -X POST 'https://api.plnkr.co/v2/plunks' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d @/tmp/fork-payload.json | jq '{id, url: ("https://plnkr.co/edit/" + .id + "?open=main.js")}'
```

### Manual Creation via Website

1. Go to https://plnkr.co/edit/
2. Create files by clicking the "+" button
3. Paste content into each file
4. Run to verify it works
5. Save (creates a permanent URL)
6. Copy URL - format: `https://plnkr.co/edit/{plunkId}?open=main.js`

### Form POST Method

The AG Charts website creates Plunkers by POSTing a form:

```
POST https://plnkr.co/edit/?preview&open={fileToOpen}
```

With hidden inputs:

-   `tags[0]`, `tags[1]`, etc.
-   `private` = true
-   `description` = "Example title"
-   `files[index.html]` = HTML content
-   `files[main.js]` = JavaScript content

Implementation: `external/ag-website-shared/src/components/plunkr/utils/plunkr.ts`

### API Limitations

-   **No true fork endpoint** - Create a new plunk with modified content instead
-   **No update without token** - You can only update plunks you created (using the private `token` from creation response)
-   **Cookie auth doesn't work** - Always use Bearer token authorization

---

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
        <script src="data.js"></script>
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

For Enterprise features (Sankey, Treemap, etc.):

```html
<script src="https://cdn.jsdelivr.net/npm/ag-charts-enterprise@13.0.0/dist/umd/ag-charts-enterprise.js"></script>
```

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
 * Styles for control elements in examples
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

/* Required for proper chart sizing */
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

**Versioned (Recommended):**

-   Community: `https://cdn.jsdelivr.net/npm/ag-charts-community@13.0.0/dist/umd/ag-charts-community.js`
-   Enterprise: `https://cdn.jsdelivr.net/npm/ag-charts-enterprise@13.0.0/dist/umd/ag-charts-enterprise.js`

**Staging (testing unreleased features):**

-   `https://charts-staging.ag-grid.com/dev/ag-charts-community/dist/umd/ag-charts-community.js`

**Latest (not recommended - may break):**

-   `https://cdn.jsdelivr.net/npm/ag-charts-community/dist/umd/ag-charts-community.js`

### Common Issues

| Issue                | Cause                               | Fix                                                          |
| -------------------- | ----------------------------------- | ------------------------------------------------------------ |
| Chart appears small  | Missing vanilla framework styles    | Add the body flex and `div:has(> .ag-charts-wrapper)` styles |
| Chart doesn't render | Wrong CDN URL or missing global     | Check script src and use `agCharts.AgCharts`                 |
| Styling issues       | Missing inline styles in index.html | Add the `<style>` block in `<head>`                          |
| Broken after time    | Using unversioned CDN URLs          | Pin to specific version like `@13.0.0`                       |
| Layout breaks        | Extra HTML elements in body         | Remove all elements except `<div id="myChart">`              |

### Tips

1. **Test locally first** - Open index.html in browser before uploading
2. **Use console.log** - Plunker's preview has a console
3. **Keep examples minimal** - Focus on demonstrating one feature
4. **Never add extra HTML** - Use chart `title` and `subtitle` options for explanatory text, not `<h1>`, `<p>`, etc.
5. **Include comments** - Help readers understand the code
