# Prompt

src/data.ts has our employee records in it. Show them in a table on the page, styled to match the
rest of our product: a dark background, our accent colour #6C5CE7 used to highlight the row the
mouse is over, rows a little more compact than the default, and a heavier font weight in the header
row. Use AG Grid.

# Code checks

CODE-1: The styling is applied through the grid's Theming API: the `theme` grid option is set to a
        theme object. Acceptable forms include a built-in theme with parameters applied — for
        example `themeQuartz.withParams({ ... })` — or a theme assembled with `createTheme`,
        optionally combined with theme parts.
CODE-2: The accent colour `#6C5CE7`, the row spacing and the header font weight are supplied as
        theme parameters, not as hand-written CSS.
CODE-3: No AG Grid CSS theme file is imported. An import of `ag-grid.css`, `ag-theme-alpine.css`,
        `ag-theme-quartz.css`, `ag-theme-balham.css`, or any other `ag-theme-*.css` is a fail.
CODE-4: The `theme` grid option is not set to the string `"legacy"`.
CODE-5: The styling is not achieved by declaring `--ag-*` CSS custom properties in a stylesheet, and
        not by writing CSS rules that target the grid's internal `.ag-*` class names.
CODE-6: Grid modules are registered, via either `AgGridProvider`'s `modules` prop or
        `ModuleRegistry.registerModules(...)`.
CODE-7: The employee records come from `src/data.ts`.

# Browser checks

BROWSER-1: The grid is visible and shows the employee records from src/data.ts.
BROWSER-2: The grid renders with a dark background, not the default light one.
BROWSER-3: Hovering the mouse over a row highlights it in the accent colour #6C5CE7.
BROWSER-4: Row height is visibly tighter than the AG Grid default.
BROWSER-5: The header row text is visibly heavier than the body text.
BROWSER-6: Check the browser console. Aside from AG Grid enterprise licence messages, there must be
           no errors and no warnings — in particular no AG Grid deprecation warnings and no missing-
           module errors.
