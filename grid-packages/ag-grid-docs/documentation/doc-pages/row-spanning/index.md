---
title: "Row Spanning"
---

By default, each cell will take up the height of one row. You can change this behaviour
to allow cells to span multiple rows. This feature is similar to 'cell merging' in Excel
or 'row spanning' in HTML tables.


## Configuring Row Spanning

To allow row spanning, the grid must have property `suppressRowTransform=true`.
Row spanning is then configured at the column definition level. To have a cell
span more than one row, return how many rows to span in the callback
`colDef.rowSpan`.

<api-documentation source='column-properties/properties.json' section='spanning' names='["rowSpan"]' ></api-documentation>

<snippet spaceBetweenProperties="true">
const gridOptions = {
    // turn off row translation
    suppressRowTransform: true,
    columnDefs: [
        {
            field: 'country',
            // row span is 2 for rows with Russia, but 1 for everything else
            rowSpan: params => params.data.country === 'Russia' ? 2 : 1,
        },
        // other column definitions ...
    ]
}
</snippet>

[[note]]
| The property `suppressRowTransform=true` is used to stop the grid positioning rows using CSS
| `transform` and instead the grid will use CSS `top`.
| For an explanation of the difference between these two methods see the article
| [JavaScript GPU Animation with Transform and Translate](https://medium.com/ag-grid/javascript-gpu-animation-with-transform-and-translate-bf09c7000aa6).
| The reason row span will not work with CSS `transform` is that CSS `transform` creates a
| [stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)
| which constrains CSS `z-index` from placing cells on top of other cells in another row.
| Having cells extend into other rows is necessary for row span which means it will not work
| when using CSS `transform`. The downside to not using `transform` is performance; row animation
| (after sort or filter) will be slower.


## Row Spanning Simple Example

Below is a simple example using row spanning. The example doesn't make much sense,
it just arbitrarily sets row span on some cells for demonstration purposes.

- The **Athlete** column is configured to span 2 rows for 'Aleksey Nemov' and 4 rows for 'Ryan Lochte'.
- The **Athlete** column is configured to apply a CSS class to give a background to the cell. This is important because if a background was not set, the cell background would be transparent and the underlying cell would still be visible.


<grid-example title='Row Spanning Simple' name='row-spanning-simple' type='generated' options=' { "exampleHeight":  580 }'></grid-example>

## Row Spanning Complex Example

Row spanning will typically be used for creating reports with AG Grid. Below
is something that would be more typical of the row spanning feature. The following
can be noted from the example:


- Column **Show** row spans by 4 rows when it has content.
- Column **Show** uses CSS class rules to specify background and border.
- Column **Show** has a custom cell renderer to make use of the extra space.


<grid-example title='Row Spanning Complex' name='row-spanning-complex' type='generated' options=' { "exampleHeight": 580 } '></grid-example>

## Constraints with Row Spanning


Row Spanning breaks out of the row / cell calculations that a lot of features in the grid are based on.
If using Row Spanning, be aware of the following:

- Responsibility is with the developer to not span past the last row. This is especially true if sorting and filtering (e.g. a cell may span outside the grid after the data is sorted and the cell's row ends up at the bottom of the grid).

- Responsibility is with the developer to apply a background style to spanning cells so that overwritten cells cannot be seen.

- Overwritten cells will still exist, but will not be visible. This means cell navigation will go to the other cells - e.g. if a row spanned cell has focus, and the user hits the 'arrow down' key, the focus will go to a hidden cell.

- Row span does not work with dynamic row height or auto-height. The row span assumes default row height is used when calculating how high the cell should be.

- Sorting and filtering will provide strange results when row spanning. For example a cell may span 4 rows, however applying a filter or a sort will probably change the requirements of what rows should be spanned.

- [Range Selection](/range-selection/) will not work correctly when spanning cells. This is because it is not possible to cover all scenarios, as a range is no longer a perfect rectangle.