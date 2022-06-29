---
title: "Row Sorting"
---

This page describes how to get your grid data sorting. Row sorting works with all frameworks as well as plain JavaScript.


## Enable Sorting

Enable sorting for columns by setting the `sortable` column definition attribute.
You can then sort a column by clicking on the column header.

<snippet>
const gridOptions = {
    // enable sorting on 'name' and 'age' columns only
    columnDefs: [
        { field: 'name', sortable: true },
        { field: 'age', sortable: true },
        { field: 'address' },
    ],
}
</snippet>

To enable sorting for all columns, set sorting in the [default column definition](/column-definitions/).

<snippet>
const gridOptions = {
    // enable sorting on all columns by default
    defaultColDef: {
        sortable: true
    },
    columnDefs: [
        { field: 'name' },
        { field: 'age' },
        // suppress sorting on address column
        { field: 'address', sortable: false },
    ],
}
</snippet>

## Custom Sorting

Custom sorting is provided at a column level by configuring a comparator on the column definition.

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        {
            field: 'age',
            // simple number comparator
            comparator: (valueA, valueB, nodeA, nodeB, isDescending) => valueA - valueB
        },
        {
            field: 'name',
            // simple string comparator
            comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
                if (valueA == valueB) return 0;
                return (valueA > valueB) ? 1 : -1;
            }
        }
    ]
}
</snippet>

The parameters are as follows:

- `valueA, valueB`: The values in the cells to be compared. Typically sorts are done on these values only.
- `nodeA, nodeB`: The [Row Nodes](/row-object/) for the rows getting sorted. These can be used if more information, such as data from other columns, are needed for the comparison.
- `isDescending`: `true` for Descending, `false` for Ascending.


### Custom Sorting Example

Example below shows the following:

- Default sorting on the **Athlete** column.
- When the **Year** column is not sorted, it shows a custom icon (up/down arrow).
- The **Date** column has strings as the row data, but has a custom comparator so that when you sort this column it sorts as dates, not as strings.

<grid-example title='Custom Sorting' name='custom-sorting' type='generated'></grid-example>

### Custom Sorting Groups Example

When [Row Grouping](/grouping/) it is possible to override the sort order of the Row Group columns. If using the Auto Group Column, provide a comparator via the `autoGroupColumnDef` grid property.


<snippet>
var gridOptions = {
    autoGroupColumnDef: {
        field: 'athlete',
        comparator: function(valueA, valueB, nodeA, nodeB, isDescending) {
            return (valueA == valueB) ? 0 : (valueA > valueB) ? 1 : -1;
        },
    }
};
</snippet>

<grid-example title='Custom Sorting Groups' name='custom-sorting-groups' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping" ] }'></grid-example>

## Multi Column Sorting

It is possible to sort by multiple columns. The default action for multiple column sorting is for
the user to hold down <kbd>Shift</kbd> while clicking the column header. To change the default action to use
the <kbd>Ctrl</kbd> key (or <kbd>Command</kbd> key on Apple) instead set the property `multiSortKey='ctrl'`.

The example below demonstrates the following:

- The grid sorts by **Country** then **Athlete** by default.
- The property `multiSortKey='ctrl'` is set so multiple column sorting is achieved by holding down <kbd>Ctrl</kbd> (or <kbd>Command</kbd> on Apple) and selecting multiple columns.

<grid-example title='Multi Column Sort' name='multi-column' type='generated'></grid-example>

[[note]]
|You can suppress the multi sorting behaviour by enabling the `suppressMultiSort` option, or force the behaviour without key press by enabling
|the `alwaysMultiSort` option.

## Sorting Animation

To enable animation of the rows after sorting, set grid property `animateRows=true`.

## Sorting Order

By default, the sorting order is as follows:

**ascending -> descending -> none**.


In other words, when you click a column that is not sorted, it will sort ascending. The next click
will make it sort descending. Another click will remove the sort.

It is possible to override this behaviour by providing your own `sortingOrder` on either
the `gridOptions` or the `colDef`. If defined both in `colDef` and
`gridOptions`, the `colDef` will get preference, allowing you to define a common default,
and then tailor per column.


## Example: Sorting Order and Animation


The example below shows animation of the rows plus different combinations of sorting orders as follows:


- **Default Columns:** descending -> ascending -> no sort
- **Column Athlete:** ascending -> descending
- **Column Age:** descending -> ascending
- **Column Country:** descending -> no sort
- **Column Year:** ascending only


<grid-example title='Sorting Order and Animation' name='sorting-order-and-animation' type='generated'></grid-example>

## Sorting API

What sorting is applied is controlled via [Column State](/column-state/). The below examples uses the Column State API to control column sorting.

<grid-example title='Sorting API' name='sorting-api' type='generated'></grid-example>

## Accented Sort


By default sorting doesn't take into consideration locale-specific characters. If you need to make your sort
locale-specific you can configure this by setting the grid option `accentedSort = true`.

Using this feature is more expensive; if you need to sort a very large amount of data, you might find that this
causes the sort to be noticeably slower.

The following example is configured to use this feature.

<grid-example title='Accented Sort' name='accented-sort' type='generated'></grid-example>

## Post-Sort

It is also possible to perform some post-sorting if you require additional control over the sorted rows.

This is provided via the `postSortRows` grid callback function as shown below:

<api-documentation source='grid-options/properties.json' section='sort' names='["postSortRows"]' ></api-documentation>

<snippet>
const gridOptions = {
    postSortRows: params => {
        let rowNodes = params.rowNodes;
        // here we put Ireland rows on top while preserving the sort order
        let nextInsertPos = 0;
        for (let i = 0; i < rowNodes.length; i++) {
            const country = rowNodes[i].data.country;
            if (country === 'Ireland') {
                rowNodes.splice(nextInsertPos, 0, rowNodes.splice(i, 1)[0]);
                nextInsertPos++;
            }
        }
    }
};
</snippet>

The following example uses this configuration to perform a post-sort on the rows. The custom function
puts rows with Ireland at the top always.

<grid-example title='Post Sort' name='post-sort' type='generated'></grid-example>
