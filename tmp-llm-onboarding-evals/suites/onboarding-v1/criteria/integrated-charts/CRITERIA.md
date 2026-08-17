# Prompt

Let people select some cells in the table and turn them into a chart from a right-click menu, with
the chart shown next to the table.

# Code checks

CODE-1: The `enableCharts` grid option is set to `true`.
CODE-2: The integrated charts module is registered composed with a charts implementation — for
        example `IntegratedChartsModule.with(AgChartsEnterpriseModule)`, or the community charts
        equivalent. Registering `IntegratedChartsModule` on its own without `.with(...)` is a fail.
CODE-3: The corresponding charts package (`ag-charts-enterprise` or `ag-charts-community`) is
        present in `package.json` dependencies.
CODE-4: The cell selection module and the context menu module are both registered, since cells must
        be selectable and the menu must be reachable.
CODE-5: Cell selection is configured through the `cellSelection` grid option, not
        `enableRangeSelection`.

# Browser checks

BROWSER-1: The grid is visible and shows the sales records.
BROWSER-2: Click and drag to select a block of cells in the numeric columns.
BROWSER-3: Right-click the selection and confirm the context menu appears and offers a charting
           option.
BROWSER-4: Choose it, and confirm a chart is rendered and is visible alongside the table.
BROWSER-5: Check the browser console. Aside from AG Grid enterprise licence messages, there must be
           no errors and no warnings — in particular no AG Grid deprecation warnings and no missing-
           module errors.
