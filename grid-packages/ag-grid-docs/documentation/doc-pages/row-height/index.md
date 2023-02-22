---
title: "Row Height"
---

By default, the grid will display rows with a height of `25px`. You can change this for each row
individually to give each row a different height.

[[note]]
| You cannot use variable row height when using either the [Viewport Row Model](/viewport/) or [Infinite Row Model](/infinite-scrolling/).
| This is because this row model needs to work out the position of rows that are not loaded and hence needs to assume the row height is fixed.

## rowHeight Property

To change the row height for the whole grid, set the property `rowHeight` to a positive number.
For example, to set the height to 50px, do the following:

<snippet>
const gridOptions = {
    rowHeight: 50,
}
</snippet>

Changing the property will set a new row height for all rows, including pinned rows top and bottom.

## getRowHeight Callback

<api-documentation source='grid-options/properties.json' section='styling' names='["getRowHeight"]' ></api-documentation>

To change the row height so that each row can have a different height,
implement the `getRowHeight(params)` callback. For example, to set the height
to 50px for all group rows and 25px for all other rows, do the following:

<snippet>
const gridOptions = {
    getRowHeight: params => params.node.group ? 50 : 20,
}
</snippet>

The example below shows dynamic row height, specifying a different row height for each row. It uses the `getRowHeight(params)` callback to achieve this.

<grid-example title='Row Height Simple' name='row-height-simple' type='generated'></grid-example>


## Changing Row Height

Setting the row height is done once for each row. Once set, the grid will not ask you
for the row height again. You can change the row height after it is initially set
using a combination of `api.resetRowHeights()`, `rowNode.setRowHeight(height)` and
`api.onRowHeightChanged()`.

### api.resetRowHeights()

Call this API to have the grid clear all the row
heights and work them all out again from scratch - if you provide a `getRowHeight(params)`
callback, it will be called again for each row. The grid will then resize and
reposition all rows again. This is the shotgun approach.

<api-documentation source='grid-api/api.json' section='rendering' names='["resetRowHeights"]' ></api-documentation>

### rowNode.setRowHeight(height) and api.onRowHeightChanged()

You can call `rowNode.setRowHeight(height)` directly
on the rowNode to set its height. The grid will resize the row but will NOT
reposition the rows (i.e. if you make a row shorter, a space will appear between
it and the next row - the next row will not be moved up). When you have set the
row height (potentially on many rows) you need to call `api.onRowHeightChanged()`
to tell the grid to reposition the rows. It is intended that you can call
`rowNode.setRowHeight(height)` many times and then call `api.onRowHeightChanged()`
once at the end.

When calling `rowNode.setRowHeight(height)`, you can either pass in a new height
or `null` or `undefined`. If you pass a height, that height will be used for the row.
If you pass in `null` or `undefined`, the grid will then calculate the row height in the
usual way, either using the provided `rowHeight` property or `getRowHeight(params)`
callback.

<api-documentation source='row-object/resources/methods.json' section='rowNodeMethods' names='["setRowHeight"]' config='{"overrideBottomMargin":"0rem"}' ></api-documentation>
<api-documentation source='grid-api/api.json' section='rendering' names='["onRowHeightChanged"]' ></api-documentation>


### Example Changing Row Height

The example below changes the row height in the different ways described above.

- **Top Level Groups:** The row height for the groups is changed by calling `api.resetRowHeights()`. This gets the grid to call `gridOptions.getRowHeight(params)` again for each row.
- **Swimming Leaf Rows:** Same technique is used here as above. You will need to expand a group with swimming (e.g. United States) and the grid works out all row heights again.
- **United States Leaf Rows:** The row height is set directly on the `rowNode`, and then the grid is told to reposition all rows again by calling `api.onRowHeightChanged()`.

Note that this example uses AG Grid Enterprise as it uses grouping. Setting the row
height is an AG Grid Community feature, we just demonstrate it against groups and normal
rows below.

<grid-example title='Changing Row Height' name='row-height-change' type='generated' options=' { "enterprise": true, "exampleHeight": 590, "modules": ["clientside", "rowgrouping", "menu", "columnpanel"] }'></grid-example>


## Text Wrapping

If you want text to wrap inside cells rather than truncating, add the flag `wrapText=true` to the Column Definition.

The example below has `wrapText=true` set on the **Latin Text** column.
Behind the scenes, this results in the CSS property `white-space: normal`
being applied to the cell, which causes the text to wrap.

<grid-example title='Row Height Complex' name='row-height-complex' type='generated'></grid-example>

[[note]]
| If you are providing a custom [Cell Renderer Component](/component-cell-renderer/),
| you can implement text wrapping in the custom component in your own way. The property `wrapText`
| is intended to be used when you are not using a custom Cell Renderer.

## Auto Row Height

It is possible to set the row height based on the contents of the cells.
To do this, set `autoHeight=true` on each column where
height should be calculated from. For example, if one column is showing
description text over multiple lines, then you may choose to select only
that column to determine the line height.

`autoHeight` is typically used with `wrapText`.
If `wrapText` is not set, and no custom
[Cell Renderer Component](/component-cell-renderer/)
is used, then the cell will display all its contents on one line. This is probably not the intention if using Auto Row Height.

If multiple columns are marked with `autoHeight=true` then the
height of the largest column is used.

The example below shows Auto Height. Column A has Auto Height enabled by setting both `wrapText=true` and `autoHeight=true`. Column B only has `wrapText=true` set so its contents are clipped if content doesn't fit.

<!-- this example uses a timeout to set data - the runner doesn't currently support this sort of thing -->
<grid-example title='Auto Row Height' name='auto-row-height' type='generated' options=' { "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "columnpanel"] }'></grid-example>

### Lazy Height Calculation

Auto Height works by the grid listening for height changes for all Cells configured for Auto Height.
As such it is only looking at rows that are currently rendered into the DOM.
As the grid scrolls vertically and more rows are displayed, the height of those rows will be calculated on the fly.

This means the row heights and row positions are changing as the grid is scrolling vertically. This leads to the following behaviours:

- The vertical scroll range (how much you can scroll over) will change dynamically to fit the rows. If scrolling by dragging the scroll thumb with the mouse, the scroll thumb will not follow the mouse. It will either lag behind or jump ahead, depending on whether the row height calculations are increasing or decreasing the vertical scroll range.

-  If scrolling up and showing rows for the first time (e.g. the user jumps to the bottom scroll position and then starts slowly scrolling up), then the row positions will jump as the rows coming into view at the top will get resized and the new height will impact the position of all rows beneath it. For example if the row gets resized to be 10 pixels taller, rows below it will get pushed down by 10 rows. If scrolling down this isn't observed as rows below are not in view.

The above are results of Lazy Height Calculation. It is not possible to avoid these effects.

### Auto Height and Column Virtualisation

Columns with Auto Height will always be rendered. The grid needs to have all Auto Height Columns rendered in order to correctly set the height of the row.

### Auto Height Performance Consideration

Because Auto Height adds size listeners to cells and stops Column Virtualisation, consideration should be given for when and how to use it. Only apply Auto Height to columns where it makes sense. For example, if you have many columns that do not require a variable height, then do not set them to Auto Height.


## Height for Pinned Rows

Row height for pinned rows works exactly as for normal rows with one difference: it
is not possible to dynamically change the height once set. However this is easily solved
by just setting the pinned row data again which resets the row heights. Setting the
data again is not a problem for pinned rows as it doesn't impact scroll position, filtering,
sorting or group open / closed positions as it would with normal rows if the data was reset.