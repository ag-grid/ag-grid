---
title: "Column Definitions"
---
Each column in the grid is defined using a Column Definition (`ColDef`). Columns are positioned in the
grid according to the order the `ColDef`s are specified in the grid options.

The following example shows a simple grid with 3 columns defined:

```js
var gridOptions = {
    // define 3 columns
    columnDefs: [
        { headerName: 'Athlete', field: 'athlete' },
        { headerName: 'Sport', field: 'sport' },
        { headerName: 'Age', field: 'age' }
    ],

    // other grid options here...
}
```

See [Column Properties](../column-properties/) for a
list of all properties that can be applied to a column.

If you want the columns to be grouped, you can include them as children like so:

```js
var gridOptions = {
    columnDefs: [
        // put the three columns into a group
        {
            headerName: 'Group A',
            children: [
                { headerName: 'Athlete', field: 'athlete' },
                { headerName: 'Sport', field: 'sport' },
                { headerName: 'Age', field: 'age' }
            ]
        }
    ],

    // other grid options here...
}
```

Groups are explained in more detail in the section [Column Groups](../grouping-headers/).

## Declarative Columns

If you're using either Angular (`ag-grid-column`) or React (`AgGridColumn`) you additionally have
the option to declare your column definitions declaratively; please refer to the [Angular](../angular-markup)
and [React](../react-column-configuration/) documentation for more information.

## Custom Column Types {#default-column-definitions}

In addition to the above, the grid provides additional ways to help simplify and avoid duplication of column definitions.
This is done through the following:

- `defaultColDef`: contains properties that all columns will inherit.
- `defaultColGroupDef`: contains properties that all column groups will inherit.
- `columnTypes`: specific column types containing properties that column definitions can inherit.

Default columns and column types can specify any of the [column properties](../column-properties/) available on a column.

[[note]]
| Column Types are designed to work on Columns only, i.e. they won't be applied to Column Groups.

The following code snippet demonstrates these three properties:

```js
var gridOptions = {
    rowData: myRowData,

    // define columns
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
        filter: 'agTextColumnFilter'
    },

    // if we had column groups, we could provide default group items here
    defaultColGroupDef: {}

    // define a column type (you can define as many as you like)
    columnTypes: {
        'nonEditableColumn': { editable: false },
        'dateColumn': {
            filter: 'agDateColumnFilter',
            filterParams: { comparator: myDateComparator },
            suppressMenu: true
        }
    }

    // other grid options here...
}
```

When the grid creates a column it starts with the default column definition, then adds in anything from the column
type, then finally adds in items from the specific column definition.

For example, the following is an outline of the steps used when creating 'Col C' shown above:

```js
// Step 1: the grid starts with an empty definition
{}

// Step 2: default column properties are merged in
{ width: 100, editable: true, filter: 'agTextColumnFilter' }

// Step 3: column type properties are merged in (using the 'type' property)
{ width: 100, editable: false, filter: 'agNumberColumnFilter' }

// Step 4: finally column definition properties are merged in
{ headerName: 'Col C', field: 'c', width: 100, editable: false, filter: 'agNumberColumnFilter' }
```

The following example demonstrates the different configuration properties in action.

<example-runner name="column-definitions/column-definition" title="Column Definition Example" type="generated" options='{ "grid": { "height": "100%" }}'></example-runner>

## Provided Column Types

### Right Aligned and Numeric Columns

The grid provides a handy shortcut for aligning columns to the right.
Setting the column definition type to `rightAligned` aligns the column header and contents to the right,
which makes the scanning of the data easier for the user.

[[note]]
| Because right alignment is used for numbers, we also provided an alias `numericColumn`
| that can be used to align the header and cell text to the right.

```js
var gridOptions = {
    columnDefs: [
        { headerName: 'Column A', field: 'a' },
        { headerName: 'Column B', field: 'b', type: 'rightAligned' },
        { headerName: 'Column C', field: 'c', type: 'numericColumn' }
    ]
}
```

## Column IDs

Each column generated by the grid is given a unique Column ID, which is used in parts of the Grid API.

If you are using the API and the columns IDs are a little complex (e.g. if two columns have the same
`field`, or if you are using `valueGetter` instead of `field`) then it is useful to
understand how columns IDs are generated.

If the user provides `colId` in the column definition, then this is used, otherwise the `field`
is used. If both `colId` and `field` exist then `colId` gets preference. If neither
`colId` nor `field` exists then a number is assigned. Finally, the ID is ensured to be unique by
appending `'_n'` if necessary, where `n` is the first positive number that allows uniqueness.

In the example below, columns are set up to demonstrate the different ways IDs are generated.
Open the example in a new tab and observe the output in the dev console. Note the following:

- Col 1 and Col 2 both use `colId`. The grid appends `'_1'` to Col 2 to make the ID unique.
- Col 3 and Col 4 both use `field`. The grid appends `'_1'` to Col 4 to make the ID unique.
- Col 5 and Col 6 have neither `colId` or `field` so the grid generates column IDs.

<example-runner name="column-definitions/column-ids" title="Column IDs" type="generated"></example-runner>
