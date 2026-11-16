---
targets: ['*']
description: 'Create a manual test project from a documentation example'
---

# Manual Test Scaffolding

Create a manual test project from an AG Grid documentation example or a Plunker, in `testing/manual/{name}/` (a sibling of `template/`), copied from `testing/manual/template/`.

## Input

`$ARGUMENTS` may contain a docs URL, a Plunker URL, a text description, or a mix. If empty, ask the user what example they want to scaffold.

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
6. The `exampleName` is the tag's `name` attribute, the folder under `_examples/` (the `title` is display text: title `Enabling Grand Total Row` has name `enabling-grand-total`)
7. Read the example source files at `documentation/ag-grid-docs/src/content/docs/{pageName}/_examples/{exampleName}/`:
    - `main.ts` (required)
    - `data.ts`, `index.html`, `styles.css` (if present)
    - Component files at the folder root (`<name>_typescript.ts`, `<name>_reactFunctionalTs.tsx`, `<name>_vue3.ts`, `<name>.component_angular.ts`)
    - Per-framework overrides under `provided/<framework>/` (if present)

### 1b in the case of a plunker URL

Plunker URLs look like `https://plnkr.co/edit/xKgvPnzSSdQPw9Fv`

Use the JSON API to get the content of the example: `https://api.plnkr.co/v2/plunks/{id}`

Titles in plunkers are sometimes stale and misleading, consider both the title attribute and the content and derive an `exampleName` from the title if it is appropriate or the content if not.

## Step 2: Create the test project

1. Derive a kebab-case project name from the page name and example name, e.g. `row-selection-checkbox`
2. Verify the directory `testing/manual/{name}/` does not already exist. If it does, ask the user for an alternative name.
3. Copy the template:
    ```bash
    rsync -a --exclude='node_modules' --exclude='dist' testing/manual/template/ testing/manual/{name}/
    ```
4. Run `touch yarn.lock && yarn install` in the new directory. The template ships no `yarn.lock` (its `.gitignore` excludes one) and `testing/manual` is not a workspace of the root project, so Yarn refuses to install there until an empty `yarn.lock` marks it as its own project; the install then ignores the root `yarn.lock`. The grid packages resolve to the checkout's source through the aliases in the template's `vite.config.ts`.

## Step 3: Update `src/config.ts`

The template's `src/config.ts` registers the modules and exports `gridOptions`, the one export every framework entry imports (`src/javascript/main.ts`, `src/react/App.tsx`, `src/vue/App.vue`, `src/angular/app.component.ts`). Its row data interface (`IOlympicData`) and `columnDefs` const are local, and it loads its data in `onGridReady`. Port the example into this file:

- **Match module registration:** if the source registers specific modules (e.g. `ClientSideRowModelModule`, `ColumnsToolPanelModule`, `SideBarModule`) instead of `AllCommunityModule` and `AllEnterpriseModule`, register the same ones: all modules can enable features the original lacks (e.g. row grouping panels in the columns tool panel).
- Replace the row data interface with one matching the example's data, and type `ColDef<…>` and `GridOptions<…>` with it.
- Put column definitions, `defaultColDef` and every other grid option into `gridOptions`, with the utility functions, value formatters and cell class rules `main.ts` defines.
- Inline data, or `data.ts` exports, go into the file (inlined or re-exported); a fetch stays a fetch, run from `onGridReady` as the template does.
- Import from `ag-grid-community` and `ag-grid-enterprise` as needed.

## Step 4: Handle custom UI and components

Check the example source for elements that go beyond grid configuration:

- **Custom controls** in `index.html`: buttons, dropdowns, inputs with `onclick` handlers that call grid API methods
- **Custom components** (cell renderers, cell editors, filters, overlays, etc.): the component files at the example's root and the overrides in `provided/<framework>/`

If none are needed, skip this step.

If custom UI or components are needed:

1. Summarise what custom elements are required (e.g. "2 buttons that call `api.deselectAll()` and `api.selectAll()`", "a custom cell renderer that shows a flag icon")
2. Ask the user which framework to build them for:
    - **JavaScript**: `src/javascript/`
    - **React**: `src/react/`
    - **Angular**: `src/angular/` (served only under `ANGULAR=1 yarn dev`)
    - **Vue**: `src/vue/`
    - **All**: every framework
    - **Skip**: TODO comments for manual implementation
3. Implement the custom UI/components in the chosen framework's entry files

## Step 5: Verify and report

1. Run `yarn build` in the project directory and fix what it reports. It catches build and import errors only: `vite build` does not type-check, and the Angular plugin sets `disableTypeChecking: true`.
2. Report the project path, the source page and example, what was configured (grid options, data, custom UI) and how to run it: `cd testing/manual/{name} && yarn dev` (`ANGULAR=1 yarn dev` for the Angular page).
