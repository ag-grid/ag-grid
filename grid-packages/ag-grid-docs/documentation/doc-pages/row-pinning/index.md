---
title: "Row Pinning"
---

Pinned rows appear either above or below the normal rows of a table.
This feature in other grids is also known as **Frozen Rows** or **Floating Rows**.

To put pinned rows into your grid, set `pinnedTopRowData` or `pinnedBottomRowData`
in the same way as you would set normal data into `rowData`.
After the grid is created, you can update the pinned rows by calling `api.setPinnedTopRowData(rows)`
and `setPinnedBottomRowData(rows)`.

<api-documentation source='grid-options/properties.json' section='rowPinning' names='["pinnedTopRowData", "pinnedBottomRowData"]' ></api-documentation>


<api-documentation source='grid-api/api.json' section='pinned' names='["setPinnedTopRowData", "setPinnedBottomRowData"]'></api-documentation>

## Cell Editing

Cell editing can take place as normal on pinned rows.

## Cell Rendering

Cell rendering can take place as normal on pinned rows. If you want to use a different
Cell Renderer for pinned rows vs normal rows, use `colDef.cellRendererSelector` to specify
different Cell Renderers for different rows.

<api-documentation source='column-properties/properties.json' section='styling' names='["cellRendererSelector"]' ></api-documentation>

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
