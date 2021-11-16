---
title: "Column Pinning"
---

You can pin columns by setting the `pinned` attribute on the column definition to either `'left'` or `'right'`.

<snippet suppressFrameworkContext="true">
const gridOptions = {
    columnDefs: [
        { field: 'athlete', pinned: 'left' }
    ],
}
</snippet>

Below shows an example with two pinned columns on the left and one pinned column on the right. The example also demonstrates changing the pinning via the API at runtime.

The grid will reorder the columns so that 'left pinned' columns come first and 'right pinned' columns come last. In the example below the state of pinned columns impacts the order of the columns such that when 'Country' is pinned, it jumps to the first position.

## Jump To & Pinning

Below shows jumping to rows and columns via the API. Jumping to a pinned column makes no sense, as the pinned columns, by definition, are always visible. So below, if you try to jump to a pinned column no action will be taken.

## Example Pinning

<grid-example title='Column Pinning' name='column-pinning' type='generated' options='{ "exampleHeight": 570 }'></grid-example>

## Pinning via Column Dragging

It is possible to pin a column by moving the column in the following ways:

- When other columns are pinned, drag the column to the existing pinned area.
- When no columns are pinned, drag the column to the edge of the grid and wait for approximately one second. The grid will then assume you want to pin and create a pinned area and place the column into it.

<image-caption src="column-pinning/resources/pinning-by-moving.gif" alt="Pinning via Column Dragging" maxwidth="30.5rem" centered="true" constrained="true"></image-caption>

## Lock Pinned

If you do not want the user to be able to pin using the UI, set the property `lockPinned=true`. This will block the UI in the following way:

- Dragging a column to the pinned section will not pin the column.
- For AG Grid Enterprise, the column menu will not have a pin option.

The example below demonstrates columns with pinning locked. The following can be noted:

- The column **Athlete** is pinned via the configuration and has `lockPinned=true`. This means the column will be pinned always, it is not possible to drag the column out of the pinned section.
- The column **Age** is not pinned and has `lockPinned=true`. This means the column cannot be pinned by dragging the column.
- All other columns act as normal. They can be added and removed from the pinned section by dragging.

<grid-example title='Lock Pinned' name='lock-pinned' type='generated'></grid-example>

