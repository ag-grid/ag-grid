---
title: "Column Spanning"
---

By default, each cell will take up the width of one column. You can change this behaviour to allow cells to span multiple columns. This feature is similar to 'cell merging' in Excel or 'column spanning' in HTML tables.

## Configuring Column Spanning

Column spanning is set configured at the column definition level. To have a cell span more than one column, return how many columns to span in the callback `colDef.colSpan`.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'country',
            // col span is 2 for rows with Russia, but 1 for everything else
            colSpan: params => params.data.country === 'Russia' ? 2 : 1,
        }
    ],
}
</snippet>


The interface for the colSpan callback is as follows:

<api-documentation source='column-properties/properties.json' section='spanning' names='["colSpan"]'></api-documentation>

## Column Spanning Simple Example

Below shows a simple example using column spanning. The example doesn't make much sense, it just arbitrarily sets column span on some cells for demonstration purposes, however we thought it easier to show column spanning with the familiar Olympic winners data before going a bit deeper into its usages. The following can be noted:

- The Country column is configured to span 2 columns when 'Russia' and 4 columns when 'United States'. All other times it's normal (1 column).
- To help demonstrate the spanned column, the Country column is shaded using CSS styling.
- Resizing any columns that are spanned over will also resize the spanned cells. For example, resizing the column immediately to the right of 'Country' will resize all cells spanning over the resized column.
- The first two columns are pinned. If you drag the country column into the pinned area, you will notice that the spanning is constrained within the pinned section, e.g. if you place Country as the last pinned column, no spanning will occur, as the spanning can only happen over cells in the same region, and Country now has no further columns inside the pinned region.

<grid-example title='Column Spanning Simple' name='column-spanning-simple' type='generated'></grid-example>

## Column Spanning Complex Example

Column spanning will typically be used for creating reports with AG Grid. Below is something that would be more typical of the column spanning feature. The following can be noted from the example:

- The data is formatted in a certain way, it is not intended for the user to sort this data or reorder the columns.
- The dataset has meta-data inside it, the `data.section` attribute. This meta-data, provided by the application, is used in the grid configuration in order to set the column spans and the background colours.

<grid-example title='Column Spanning Complex' name='column-spanning-complex' type='generated' options='{ "exampleHeight": 795 }'></grid-example>

## Column Spanning Constraints

Column Spanning breaks out of the row / cell calculations that a lot of features in the grid are based on. If using Column Spanning, be aware of the following:

- [Range Selection](/range-selection/) will not work correctly when spanning cells. This is because it is not possible to cover all scenarios, as a range is no longer a perfect rectangle.
