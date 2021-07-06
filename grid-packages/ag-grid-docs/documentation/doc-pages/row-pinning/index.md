---
title: "Row Pinning"
---

Pinned rows appear either above or below the normal rows of a table.
This feature in other grids is also known as **Frozen Rows** or **Floating Rows**.

To put pinned rows into your grid, set `pinnedTopRowData` or `pinnedBottomRowData`
in the same way as you would set normal data into `rowData`.

After the grid is created, you can update the pinned rows by calling `api.setPinnedTopRowData(rows)`
and `setPinnedBottomRowData(rows)`.

## Cell Editing

Cell editing can take place as normal on pinned rows.

## Cell Rendering

Cell rendering can take place as normal on pinned rows. There is an additional
`colDef.pinnedRowCellRenderer` property you can use to give a pinned row cell a
different `cellRenderer` to the other cells. If both `cellRenderer` and `pinnedRowCellRenderer`
are provided, pinned rows will use `pinnedRowCellRenderer` over `cellRenderer`.

## Example

The example below shows pinned rows. Select the number of rows you want to pin at the top and the bottom using the selection above the grid.

In this example we're using Components to render custom pinned row values for Athlete and Age (colour blue and italics respectively).

<grid-example title='Row Pinning' name='row-pinning' type='generated' options='{ "exampleHeight": 580 }'></grid-example>

## Non Supported Items

Pinned rows are not part of the main row model. For this reason, the following is not possible:

- **Sorting**: Pinned rows cannot be sorted.
- **Filtering**: Pinned rows are not filtered.
- **Row Grouping**: Pinned rows cannot be grouped.
- **Row Selection**: Pinned rows cannot be selected.
