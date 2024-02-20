---
title: "Column Definitions"
---

<framework-specific-section frameworks="javascript,angular,vue">
|Each column in the grid is defined using a Column Definition (`ColDef`). Columns are positioned in the grid according to the order the Column Definitions are specified in the Grid Options.
</framework-specific-section>

<framework-specific-section frameworks="react">
<video-section id="aDCepyF_DUY" title="React Column Definitions" header="true">
Each column in the grid is defined using a Column Definition (<code>ColDef</code>). Columns are positioned in the grid according to the order the Column Definitions are specified in the Grid Options.
</video-section>
</framework-specific-section>


The following example shows a simple grid with 3 columns defined:

<snippet>
const gridOptions = {
    // define 3 columns
    columnDefs: [
        { field: 'athlete' },
        { field: 'sport' },
        { field: 'age' },
    ]
}
</snippet>

See [Column Properties](/column-properties/) for a list of all properties that can be applied to a column.

If you want the columns to be grouped, you can include them as children like so:

<snippet suppressFrameworkContext="true">
const gridOptions = {
    // put the three columns into a group
    columnDefs: [
        {
            headerName: 'Group A',
            children: [
                { field: 'athlete' },
                { field: 'sport' },
                { field: 'age' }
            ]
        }
    ]
}
</snippet>

Groups are explained in more detail in the section [Column Groups](/column-groups/).

## Custom Column Types {#default-column-definitions}

In addition to the above, the grid provides additional ways to help simplify and avoid duplication of column definitions. This is done through the following:

- `defaultColDef`: contains properties that all columns will inherit.
- `defaultColGroupDef`: contains properties that all column groups will inherit.
- `columnTypes`: contains a set of properties that can be reused by referencing them in the `type` property of a column definition.

Default columns can specify any of the [column properties](/column-properties/) available on a column.
Column types can specify any of the [column properties](/column-properties/) except `type`.

<note>
Column Types are designed to work on Columns only, i.e. they won't be applied to Column Groups.
</note>

The following code snippet demonstrates these three properties:

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        // uses the default column properties
        { headerName: 'Col A', field: 'a'},
        // overrides the default with a number filter
        { headerName: 'Col B', field: 'b', filter: 'agNumberColumnFilter' },
        // overrides the default using a column type
        { headerName: 'Col C', field: 'c', type: 'nonEditableColumn' },
        // overrides the default using a multiple column types
        { headerName: 'Col D', field: 'd', type: ['dateColumn', 'nonEditableColumn'] }
    ],
    // a default column definition with properties that get applied to every column
    defaultColDef: {
        // set every column width
        width: 100,
        // make every column editable
        editable: true,
        // make every column use 'text' filter by default
        filter: 'agTextColumnFilter',
    },
    // a default column group definition with properties that get applied to every column group 
    defaultColGroupDef: {
      marryChildren: true,
    },
    // define a column type (you can define as many as you like)
    columnTypes: {
        nonEditableColumn: { editable: false },
        dateColumn: {
            filter: 'agDateColumnFilter',
            filterParams: { comparator: myDateComparator },
            suppressHeaderMenuButton: true
        }
    }
}
</snippet>

When the grid creates a column it starts with the default column definition, then adds properties defined on the [Cell Data Type](/cell-data-types/) if enabled, then adds properties defined via column types, and then finally adds in properties from the specific column definition.

At each stage if a column property already exists, the latter will override the existing value. For example, if the `defaultColDef` sets `editable: true` but a `columnType` sets `editable: false` then this column will not be editable. 

For example, the following is an outline of the steps used when creating 'Col C' shown above:

<snippet transform="false">
|// Step 1: the grid starts with an empty definition
|{}
|
|// Step 2: default column properties are merged in
|{ width: 100, editable: true, filter: 'agTextColumnFilter' }
|
|// Step 3: column type properties are merged in (using the 'type' property), overriding where necessary
|{ width: 100, editable: false, filter: 'agTextColumnFilter' }
|
|// Step 4: finally column definition properties are merged in, overriding where necessary
|{ headerName: 'Col C', field: 'c', width: 100, editable: false, filter: 'agTextColumnFilter' }
</snippet>

The following example demonstrates the different configuration properties in action.

<grid-example title='Column Definition Example' name='column-definition' type='generated'></grid-example>

## Right Aligned and Numeric Columns

The grid provides a handy shortcut for aligning columns to the right. Setting the column definition type to `rightAligned` aligns the column header and contents to the right, which makes the scanning of the data easier for the user.

<note>
Because right alignment is used for numbers, we also provided an alias `numericColumn` that can be used to align the header and cell text to the right.
</note>

<snippet>
const gridOptions = {
    columnDefs: [
        { headerName: 'Column A', field: 'a' },
        { headerName: 'Column B', field: 'b', type: 'rightAligned' },
        { headerName: 'Column C', field: 'c', type: 'numericColumn' },
    ]
}
</snippet>


The `rightAligned` column type works by setting the header and cell class properties as follows. If you manually set either `headerClass` or `cellClass` then you may need to include the right aligned CSS classes yourself as column type properties are overridden by explicitly defined column properties.

```ts
rightAligned: {
    headerClass: 'ag-right-aligned-header',
    cellClass: 'ag-right-aligned-cell'
}
```

## Column IDs

Each column generated by the grid is given a unique Column ID, which is used in parts of the Grid API.

If you are using the API and the column IDs are a little complex (e.g. if two columns have the same `field`, or if you are using `valueGetter` instead of `field`) then it is useful to understand how column IDs are generated.

If the user provides `colId` in the column definition, then this is used, otherwise the `field` is used. If both `colId` and `field` exist then `colId` gets preference. If neither `colId` nor `field` exists then a number is assigned. Finally, the ID is ensured to be unique by appending `'_n'` if necessary, where `n` is the first positive number that allows uniqueness.

In the example below, columns are set up to demonstrate the different ways IDs are generated. Open the example in a new tab and observe the output in the dev console. Note the following:

- Col 1 and Col 2 both use `colId`. The grid appends `'_1'` to Col 2 to make the ID unique.
- Col 3 and Col 4 both use `field`. The grid appends `'_1'` to Col 4 to make the ID unique.
- Col 5 and Col 6 have neither `colId` or `field` so the grid generates column IDs.

<grid-example title='Column IDs' name='column-ids' type='generated'></grid-example>
