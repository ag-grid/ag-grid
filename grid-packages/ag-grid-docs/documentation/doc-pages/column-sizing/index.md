---
title: "Column Sizing"
---

All columns can be resized by dragging the top right portion of the column.

## Enable Sizing

Turn column resizing on for the grid by setting `resizable=true` for each column. To set resizing for each column, set `resizable=true` on the [default column definition](/column-definitions/#default-column-definitions).

The snippet below allows all columns except Address to be resized by explicitly setting each column.

<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'name', resizable: true },
        { field: 'age', resizable: true },
        { field: 'address' },
    ],
}
</snippet>

The snippet below allows all columns except Address to be resized by setting `resizable=true` on the default column definition and then `resizable=false` on the Address column.

<snippet>
const gridOptions = {
    defaultColDef: {
        resizable: true,
    },
    columnDefs: [
        { field: 'name' },
        { field: 'age' },
        { field: 'address', resizable: false },
    ],
}
</snippet>

## Size Columns to Fit

Call the Grid Api `api.sizeColumnsToFit(params)` to make the currently visible columns fit the screen. The columns will scale (growing or shrinking) to fit the available width.

<api-documentation source='grid-api/api.json' section='columns' names='["sizeColumnsToFit"]' ></api-documentation>


If you don't want a particular column to be included in the auto resize, then set the column definition `suppressSizeToFit=true`. This is helpful if, for example, you want the first column to remain fixed width, but all other columns to fill the width of the table.

The grid calculates new column widths while maintaining the ratio of the column default widths. So for example
if Column A has a default size twice as wide as Column B, then after calling `api.sizeColumnsToFit()` Column A
will still be twice the size of Column B, assuming no Column min-width or max-width constraints are violated.

Column default widths, rather than current widths, are used while calculating the new widths. This insures
the result is deterministic and not depend on any Column resizing the user may have manually done.

The function can receive a parameters object with minimum and maximum widths, either for all columns or for specific columns, to further restrain the columns resulting width from that function call. These widths will not exceed the column's defined minimum and maximum widths.

[[note]]
| For example assuming a grid with three Columns, the algorithm will be as follows:<br/>
|
| scale = availableWidth / (w1 + w2 + w3)<br/>
| w1 = round(w1 * scale)<br/>
| w2 = round(w2 * scale)<br/>
| w3 = totalGridWidth - (w1 + w2)<br/>
|
| Assuming the grid is 1,200 pixels wide and the Columns have default widths of 40, 120 and 300,
| then the calculation is as follows:
|
| availableWidth = 1,198 (available width is typically smaller as the grid typically has left and right boarders)<br/>
| scale = 1198 / (50 + 120 + 300) = 2.548936170212766<br/>
| col 1 = 50 * 2.54 = 127.44 -> rounded = 127<br/>
| col 2 = 120 * 2.54 = 305.87 -> rounded = 306<br/>
| col 3 = 1198 - (127 + 306) = 765 // last col gets the space that's left, which ensures all space is used, no rounding issues<br/>

In the following example, after clicking the button, note the following:
- The `athlete` column has `suppressSizeToFit` and is not resized.
- The `age` column has `maxWidth: 50`, which takes precedence over the functions `defaultMinWidth: 100`
- The `country` column has `maxWidth: 300`, which takes precedence over the functions `minWidth: 900` defined for the `country` column.

<grid-example title='Sizing Columns To Fit' name='column-sizing-to-fit' type='generated'></grid-example>

## Auto-Size Columns

Just like Excel, each column can be 'auto resized' by double clicking the right side of the header rather than dragging it. When you do this, the grid will work out the best width to fit the contents of the cells in the column.

Note the following with regards autosizing columns:

- The grid works out the best width by considering the virtually rendered rows only. For example, if your grid has 10,000 rows, but only 50 rendered due to virtualisation of rows, then only these 50 will be considered for working out the width to display. The rendered rows are all the rows you can see on the screen through the horizontal scroll plus a small buffer (default buffer size is 20).
- Autosizing columns looks at the rendered cells on the screen, and works out the width based on what it sees. It cannot see the columns that are not rendered due to column virtualisation. Thus it is not possible to autosize a column that is not visible on the screen.<br/><br/> Column Virtualisation is the technique the grid uses to render large amounts of columns without degrading performance by only rendering columns that are visible due to the horizontal scroll positions. For example, the grid can have 1,000 columns with only 10 rendered if the horizontal scroll is only showing 10 columns.<br/><br/>To get around this, you can turn off column virtualisation by setting grid property `suppressColumnVirtualisation=true`. The choice is yours, whether you want column virtualisation working OR auto-size working using off-screen columns.

By default the grid will also resize the column to fit the header. If you do not want the headers to be included in the autosize calculation, set the grid property `skipHeaderOnAutoSize=true`.

### Autosize Column API

Autosizing columns can also be done using the following column API methods. If `skipHeader=true`, the header won't be included when calculating the column widths.

[Column Groups](/column-groups/) are never considered when calculating the column widths.

<api-documentation source='column-api/api.json' section='Sizing' names='["autoSizeColumn", "autoSizeColumns", "autoSizeAllColumns"]'></api-documentation>

## Resizing Example

The example below shows resizing in action. Things to note are as follows:


- Each column can be resized by dragging (or double-clicking or auto resize) the right side of its header.
- The button 'Size to Fit' calls `api.sizeColumnsToFit()`
- The button 'Auto-Size All' calls `columnApi.autoSizeColumns([columnIds])`
- The button 'Auto-Size All (Skip Header)' calls `columnApi.autoSizeColumns([columnIds], true)`
- The first column is fixed width (i.e. `suppressSizeToFit = true`), which means its size does not change when `sizeColumnsToFit` is called.
- The `'age'` column has both a minimum and maximum size set, so resizing the column will be restricted by these, regardless of dragging the header or using any of the API buttons.

In the example below, also of note is the second column, which has both a min and max size set, which is also respected with `sizeColumnsToFit`. The remaining columns will spread to fill the remaining space after you press the button.

<grid-example title='Column Resizing' name='column-resizing' type='generated'></grid-example>

## Column Flex

It's often required that one or more columns fill the entire available space in the grid. For this scenario, it is possible to use the `flex` config. Some columns could be set with a regular `width` config, while other columns would have a flex config.

Flex sizing works by dividing the remaining space in the grid among all flex columns in proportion to their flex value. For example, suppose the grid has a total width of 450px and it has three columns: the first with `width: 150`; the second with `flex: 1`; and third with `flex: 2`. The first column will be 150px wide, leaving 300px remaining. The column with `flex: 2` has twice the size with `flex: 1`. So final sizes will be: 150px, 100px, 200px.

[[note]]
| The flex config does **not** work with a `width` config
| in same column. If you need to provide a minimum width for a column,
| you should use flex and the `minWidth` config. Flex will also take `maxWidth`
| into account.

[[note]]
| If you manually resize a column with flex either via the API or by dragging the resize handle,
| flex will automatically be disabled for that column.

The example below shows flex in action. Things to note are as follows:

- Column A is fixed size. You can resize it with the drag handle and the other two columns will adjust to fill the available space
- Column B has `flex: 2`, `minWidth: 200` and `maxWidth: 350`, so it should be constrained to this max/min width.
- Column C has `flex: 1` so should be half the size of column B, unless column B is being constrained by its `minWidth`/`maxWidth` rules, in which case it should take up the remaining available space.


<grid-example title='Column Flex' name='flex-columns' type='generated'></grid-example>

## Sizing Columns By Default

It is possible to have the grid auto size the columns to fill the width by default. Do this by calling `api.sizeColumnsToFit()` on the `gridReady` event.

Note that `api.sizeColumnsToFit()` needs to know the grid width in order to do its maths. If the grid is not attached to the DOM, then this will be unknown. In the example below, the grid is not attached to the DOM when it is created (and hence `api.sizeColumnsToFit()` should fail). The grid checks again after 100ms, and tries to resize again. This is needed for some frameworks (e.g. Angular) as DOM objects are used before getting attached.

<grid-example title='Default Resizing' name='default-resizing' type='generated'></grid-example>

## Shift Resizing

If you hold the <kbd>Shift</kbd> key while dragging the resize handle, the column will take space away from the column adjacent to it. This means the total width for all columns will be constant.

You can also change the default behaviour for resizing. Set the grid property `colResizeDefault='shift'` to have shift resizing as the default and normal resizing to happen when the <kbd>Shift</kbd> key is pressed.

In the example below, note the following:

- Grid property `colResizeDefault='shift'` so default column resizing will behave as if <kbd>Shift</kbd> key is pressed.
- Holding down <kbd>Shift</kbd> will then resize the normal default way.

<grid-example title='Shift Resizing' name='shift-resizing' type='generated'></grid-example>

## Resizing Groups

When you resize a group, it will distribute the extra room to all columns in the group equally. In the example below the groups can be resized as follows:

- The group 'Everything Resizes' will resize all columns.
- The group 'Only Year Resizes' will resize only year, because the other columns have `resizable=false`.
- The group 'Nothing Resizes' cannot be resized at all because all the columns in the groups have `resizable=false`.

<grid-example title='Resizing Groups' name='resizing-groups' type='generated'></grid-example>

## Resizing Columns When Data Is Rendered

When auto sizing columns, the grid uses the rendered cells to work out the appropriate widths. This means that the result 
of calling `columnApi.autoSizeColumns()` is dependent on the browser's rendering and may also change depending on 
asynchronous rendering in your framework.

If you intend to call `columnApi.autoSizeColumns()` after creating the grid, in most cases it should be sufficient to wait 
for the `firstDataRendered` event before resizing.