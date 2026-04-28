---
targets: ['*']
description: 'Create a manual test project from a documentation example'
---

# Manual Test Scaffolding

You are a developer tooling agent that creates manual test projects from AG Grid documentation examples. The test projects live in `testing/manual/` (as siblings of the `template/` directory) and are based on the template at `testing/manual/template/`.

## Input

`$ARGUMENTS` may contain a docs URL, a text description, or both. If empty, ask the user what example they want to scaffold.

## Step 1: Locate the example source

### 1a in the case of a docs URL

Docs URLs follow the pattern: `https://ag-grid.com/javascript-data-grid/{pageName}/#{fragment}` - `ag-grid.com` may be a different URL or localhost, and the URL may use any framework prefix (`javascript-data-grid`, `react-data-grid`, `angular-data-grid`, `vue-data-grid`).

1. Extract `pageName` from the URL path (last segment before trailing slash)
2. Extract the fragment identifier if present (the part after `#`)
3. Read the docs page at `documentation/ag-grid-docs/src/content/docs/{pageName}/index.mdoc`
4. If a fragment was provided:
    - Find the heading that matches the fragment (convert hyphens to spaces, case-insensitive match)
    - Find the first `{% gridExampleRunner` tag after that heading
5. If no fragment was provided:
    - If the user's description is specific enough to identify a section, find it
    - Otherwise, list the available examples on the page (search for all `{% gridExampleRunner` tags and their `title` attributes) and ask the user to pick one
6. The `exampleName` is derived from the `title` attribute: convert to kebab-case (lowercase, replace spaces with hyphens)
7. Read the example source files at `documentation/ag-grid-docs/src/content/docs/{pageName}/_examples/{exampleName}/`:
    - `main.ts` (required)
    - `data.ts` (if present)
    - `index.html` (if present)
    - Any files in `provided/` directory (if present)

### 1b in the case of a plunker URL

Plunker URLs look like `https://plnkr.co/edit/xKgvPnzSSdQPw9Fv`

Use the JSON API to get the content of the exaple: `https://api.plnkr.co/v2/plunks/{id}`

Titles in plunkers are sometimes stale and misleading, consider both the title attribute and the content and derive an `exampleName` from the title if it is appropriate or the content if not.

## Step 2: Create the test project

1. Derive a kebab-case project name from the page name and example name, e.g. `row-selection-checkbox`
2. Verify the directory `testing/manual/{name}/` does not already exist. If it does, ask the user for an alternative name.
3. Copy the template:
    ```bash
    rsync -a --exclude='node_modules' --exclude='dist' testing/manual/template/ testing/manual/{name}/
    ```
4. Run `yarn install` in the new directory (uses the existing `yarn.lock` in the template as a starting point)

## Step 3: Update `src/config.ts`

The template's `src/config.ts` handles both module registration and grid configuration. It has a typed structure that must be preserved:

```typescript
import { AllCommunityModule, type ColDef, type GridOptions, ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

export interface RowData {
    // fields matching the data shape
}

export const columnDefs: ColDef<RowData>[] = [
    /* ... */
];

export const rowData: RowData[] = [
    /* ... */
];

export const gridOptions: GridOptions<RowData> = {
    columnDefs,
    rowData,
    // other grid options
};
```

Port the example into this structure:

- **Match module registration:** The template registers `AllCommunityModule` and `AllEnterpriseModule`. If the source example registers specific modules instead (e.g. `ClientSideRowModelModule`, `ColumnsToolPanelModule`, `SideBarModule`), update the `ModuleRegistry.registerModules()` call to register the same specific modules. This ensures the test project behaves identically to the source — registering all modules can enable features (e.g. row grouping panels in the columns tool panel) that aren't present in the original example.
- Define `RowData` interface matching the data shape from the example
- Port `columnDefs` with proper `ColDef<RowData>` typing
- Port `rowData` — if the example uses inline data, include it directly; if it fetches from a URL, keep the fetch pattern but adapt it to work with the template
- Port `defaultColDef` if present (export it separately)
- Port all other grid options into the `gridOptions` object
- Add necessary imports from `ag-grid-community` and `ag-grid-enterprise` as needed
- If the example uses `data.ts`, incorporate its exports (inline the data or re-export)
- Port any utility functions, value formatters, cell class rules etc. that are defined in `main.ts`

**Important:** The `gridOptions` export must not include `columnDefs` or `rowData` as literal values — they should be referenced as the separately exported constants (this allows framework wrappers to bind them independently).

## Step 4: Handle custom UI and components

Check the example source for elements that go beyond grid configuration:

- **Custom controls** in `index.html`: buttons, dropdowns, inputs with `onclick` handlers that call grid API methods
- **Custom components** in `provided/` directory: cell renderers, cell editors, filters, overlays, etc.

If none are needed, skip this step.

If custom UI or components are needed:

1. Summarise what custom elements are required (e.g. "2 buttons that call `api.deselectAll()` and `api.selectAll()`", "a custom cell renderer that shows a flag icon")
2. Ask the user which framework to build them for:
    - **JavaScript** — implement in `src/javascript/`
    - **React** — implement in `src/react/`
    - **Angular** — implement in `src/angular/`
    - **Vue** — implement in `src/vue/`
    - **All** — implement in all frameworks
    - **Skip** — leave as TODO comments for manual implementation
3. Implement the custom UI/components in the chosen framework's entry files

## Step 5: Verify and report

1. Run `yarn build` in the project directory to check for TypeScript and build errors
2. Fix any errors that arise
3. Report to the user:
    - Project path: `testing/manual/{name}/`
    - Source example: page name and example name
    - What was configured: grid options, data, any custom UI
    - How to run: `cd testing/manual/{name} && yarn dev`
