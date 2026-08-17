# Prompt

The file src/data.ts contains employee records — name, department, start date and salary. Build a
page that shows all of them in a table. People need to be able to sort the table by clicking on a
column header, and to resize the columns by dragging. Use AG Grid.

# Code checks

CODE-1: Grid modules are registered. Registration is mandatory in current AG Grid, so an app that
        renders `AgGridReact` without registering any modules is a fail. Either of these is
        acceptable: passing a `modules` prop to `AgGridProvider`, or calling
        `ModuleRegistry.registerModules(...)`.
CODE-2: Registering the `AllCommunityModule` bundle and registering individual granular modules are
        both acceptable.
CODE-3: No AG Grid CSS theme file is imported. The presence of an import of `ag-grid-
        community/styles/ag-grid.css`, `ag-grid.css`, `ag-theme-alpine.css`, `ag-theme-quartz.css`,
        `ag-theme-balham.css`, or any other `ag-theme-*.css` is a fail.
CODE-4: The `theme` grid option is not set to the string `"legacy"`.
CODE-5: No `className="ag-theme-..."` wrapper div around the grid.
CODE-6: The grid is rendered with `AgGridReact` imported from `ag-grid-react`.
CODE-7: The employee records come from `src/data.ts`; the data is not re-declared inline in the
        component.

# Browser checks

BROWSER-1: The grid is visible and shows employee records with columns for name, department, start
           date and salary.
BROWSER-2: All 50 employee records from src/data.ts are present — scrolling to the bottom of the
           grid reveals the last one.
BROWSER-3: Clicking a column header sorts ascending, clicking again sorts descending, and a further
           click returns to the unsorted order.
BROWSER-4: Dragging the divider between two column headers changes the column width.
BROWSER-5: Check the browser console. Aside from AG Grid enterprise licence messages, there must be
           no errors and no warnings — in particular no AG Grid deprecation warnings and no missing-
           module errors.
