---
title: "Row Selection"
---

Select a row by clicking on it. Selecting a row will remove any previous selection unless you
hold down <kbd>Ctrl</kbd> while clicking. Selecting a row and holding down <kbd>Shift</kbd>
while clicking a second row will select the range.

Configure row selection with the following properties:

- `rowSelection`: Type of row selection, set to either `'single'` or `'multiple'` to enable selection. `'single'` will use single row selection, such that when you select a row, any previously selected row gets unselected. `'multiple'` allows multiple rows to be selected.

- `rowMultiSelectWithClick`: Set to `true` to allow multiple rows to be selected with clicks. For example, if you click to select one row and then click to select another row, the first row will stay selected as well. Clicking a selected row in this mode will deselect the row. This is useful for touch devices where <kbd>Ctrl</kbd> and <kbd>Shift</kbd> clicking is not an option.

- `suppressRowDeselection`: Set to `true` to prevent rows from being deselected if you hold down <kbd>Ctrl</kbd> and click the row (i.e. once a row is selected, it remains selected until another row is selected in its place). By default the grid allows deselection of rows.

- `suppressRowClickSelection`: If `true`, rows won't be selected when clicked. Use, for example, when you want checkbox selection or your managing selection from a custom component and don't want to select the row when the row is clicked.

When you pass data to the grid, it wraps each data item in a node object. This is explained in the section [Client-Side Row Model](/client-side-model/). When you query for the selected rows, there are two method types: ones that return nodes, and ones that return data items. To get the selected nodes / rows from the grid, use the following API methods:

<api-documentation source='grid-api/api.json' section='selection' names='["getSelectedNodes", "getSelectedRows"]'></api-documentation>

Working with AG Grid nodes is preferred over the row data as it provides you with more information and maps better to the internal representation of AG Grid.

### Example: Single Row Selection

The example below shows single row selection.

- Property `rowSelection='single'` is set to enable single row selection. It is not possible to select multiple rows.

<grid-example title='Single Row Selection' name='single-row-selection' type='generated'></grid-example>

### Example: Multiple Row Selection

The example below shows multi-row selection.

- Property `rowSelection='multiple'` is set to enable multiple row selection. Selecting multiple rows can be achieved by holding down <kbd>Ctrl</kbd> and mouse clicking the rows. A range of rows can be selected by using <kbd>Shift</kbd>.

<grid-example title='Multiple Row Selection' name='multiple-row-selection' type='generated'></grid-example>

### Example: Multi Select With Click

The example below shows multi-select with click. Clicking multiple rows will select a range of rows without the need for <kbd>Ctrl</kbd> or <kbd>Shift</kbd> keys. Clicking a selected row will deselect it. This is useful for touch devices where <kbd>Ctrl</kbd> and <kbd>Shift</kbd> clicks are not available.

- Property `rowMultiSelectWithClick=true` is set to enable multiple row selection with clicks.
- Clicking multiple rows will select multiple rows without needing to press <kbd>Ctrl</kbd> or <kbd>Shift</kbd> keys.
- Clicking a selected row will deselect that row.

<grid-example title='Multi Select With Click' name='multi-select-single-click' type='generated'></grid-example>

## Checkbox Selection

Checkbox selection can be used in two places: row selection and group selection.

<api-documentation source='column-properties/properties.json' section='columns' names='["checkboxSelection", "showDisabledCheckboxes"]'></api-documentation>

To include checkbox selection for a column, set the attribute `'checkboxSelection'` to `true` on the column definition. 
You can set this attribute on as many columns as you like, however it doesn't make sense to have it in more than one 
column in a table.

To enable checkbox selection for groups, set the attribute `'checkbox'` to `true` for the group renderer. See the 
grouping section for details on the group renderer.

`checkboxSelection` can also be specified as a function. This allows dynamically setting whether a cell
has a checkbox or not. The callback is called when the Cell is drawn, and called again if there are any changes
to the row's data or the column positions (e.g. the callback could be showing the checkbox depending on what
value is displayed, or if the column in question is the first column to show a checkbox for the first column only).

If the function returns false, a selection checkbox will still be created and in the DOM, 
however it will not be visible using CSS `visibility: hidden`. This is to ensure the following UX properties:

1. Where a column has a checkbox for only some cells, the values will remain aligned.
2. When a checkbox visibility changes, the cells contents don't jump.

To be clear, there is a slight difference between a callback returning false, and false value provided explicitly.
When a callback is used and returns false, the grid assumes a checkbox is sometimes used and as such creates one
that is not visible.

```ts
// do not create checkbox
colDef.checkboxSelection = false;

// create checkbox, make checkbox not visible
colDef.checkboxSelection = () => false;
```
### Example: Displaying Disabled Checkboxes

It is possible to change the default behaviour for when a checkbox is not displayed, and instead have the checkbox visible but disabled. This can be done by enabling the column property `showDisabledCheckboxes`.

<grid-example title='Displaying Disabled Checkboxes' name='disabled-checkboxes' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "columnpanel"] }'></grid-example>

### Example: Forcing Checkboxes As Selected

It is possible to select a row via API and disable its checkbox to prevent users from de-selecting it. This can be achieved by providing a predicate to the `checkboxSelection` property which will determine whether a row’s checkbox is selectable or disabled.

In the example below please note that only rows with Year=2012 are selectable. All remaining rows have disabled checkboxes and cannot be selected by the user.

Please note that clicking the header checkbox selects all rows even if their checkboxes are disabled.

<grid-example title='Forcing Checkboxes As Selected' name='force-enable-checkboxes' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "columnpanel"] }'></grid-example>

## Group Selection

When doing grouping, you control what selecting a group means. This is controlled with the two grid properties `groupSelectsChildren` and `groupSelectsFiltered`.

- `groupSelectsChildren`: When `true`, selecting a group will have the impact of selecting all its children. The group will then display `'selected'` when all children are selected, `'unselected'` when none are selected and `'intermediate'` when children have a mix of selected and unselected. When the node is selecting children, it will never appear in the selected set when calling `api.getSelectedNodes()`.<br /> When `false`, the group is selectable independently of the child nodes. When selecting the group node independently of the children, it will appear in the set when calling `api.getSelectedNodes()`.

- `groupSelectsFiltered`: Used when `groupSelectsChildren=true`. When `true` only filtered children of the group will be selected / unselected. This means you can apply a filter, then try to select a group, and the group will end up in the intermediate state as only as subset of the children will be selected.

### Example: Groups & Checkbox Selection

The example below shows checkbox selection with groups. Selecting the group has the effect of selecting the children. Likewise selecting all the children automatically selects the group. In this scenario the group itself will never appear in the `selectedRows` list.

The example also shows a checkbox for selection on the age column. In practice, it is not normal to have more than one column for selection, the below is just for demonstration. Having a checkbox within a non-group row is best for grids that are not using grouping.

<grid-example title='Groups & Checkbox Selection' name='group-selection' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "columnpanel"] }'></grid-example>

### Example: Groups & Checkbox Selection With Unselectable Leaf Nodes

The example below is similar to the previous example except it does not put checkboxes on the leaf level nodes, allowing only entire groups to be selected. This is achieved by providing functions for `colDef.checkboxSelection` and `autoGroupColumnDef.cellRendererParams.checkbox`.

<grid-example title='Groups & Checkbox Selection With Unselectable Leaf Nodes' name='selection-checkbox' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "columnpanel"] }'></grid-example>

### Example: Groups & Checkbox Selection With Only Filtered Children

Lastly we show an example using `groupSelectsFiltered=true`. Here, when you filter the grid and select a group, only the filtered children get selected.

To demonstrate, try this in the example:

1. Filter on swimming
1. Select a country
1. Notice that all filtered rows get selected. If you remove the filter, the non-filtered rows are not selected.
1. Notice that the group checkbox becomes indeterminate while all its filtered children get selected. This is because the selected state of the group node is independent to the filter, so it becomes indeterminate as not all of its children are selected.

<grid-example title='Groups & Checkbox Selection With Only Filtered Children' name='selection-checkbox-filtered' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "modules": ["clientside", "rowgrouping", "setfilter", "menu", "columnpanel"] }'></grid-example>

## Header Checkbox Selection

It is possible to have a checkbox in the header for selection. To configure the column to have a checkbox, set `colDef.headerCheckboxSelection=true`. `headerCheckboxSelection` can also be a function, if you want the checkbox to appear sometimes (e.g. if the column is ordered first in the grid).

<api-documentation source='column-properties/properties.json' section='header' names='["headerCheckboxSelection"]'></api-documentation>

<snippet>
const gridOptions = {
    columnDefs: [
        // the name column header always has a checkbox in the header
        {
            field: 'name',
            headerCheckboxSelection: true
        },
        // the country column header only has checkbox if it is the first column
        {
            field: 'country',
            headerCheckboxSelection: params => {
                const displayedColumns = params.columnApi.getAllDisplayedColumns();
                return displayedColumns[0] === params.column;
            }
        },
    ],
}
</snippet>

If `headerCheckboxSelection` is a function, the function will be called every time there is a change to the displayed columns, to check for changes.

## Select Everything or Just Filtered

The header checkbox has three modes of operation, `'normal'`, `'filtered only'` and `'current page'`.

- **colDef.headerCheckboxSelectionFilteredOnly=false**: The checkbox will select all rows when checked, and un-select all rows when unchecked. The checkbox will update its state based on all rows.

- **colDef.headerCheckboxSelectionFilteredOnly=true**: The checkbox will select only filtered rows when checked and un-select only filtered rows when unchecked. The checkbox will update its state based only on filtered rows.

- **colDef.headerCheckboxSelectionCurrentPageOnly=true**: The checkbox will select only the rows on the current page when checked, and un-select only the rows on the current page when unchecked.

The examples below demonstrate all of these options.

### Example: Just Filtered

This example has the following characteristics:

- The checkbox works on filtered rows only. That means if you filter first, then hit the checkbox to select or un-select, then only the filtered rows are affected.

- The checkbox is always on the athlete column, even if the athlete column is moved.

<grid-example title='Just Filtered' name='header-checkbox' type='generated' options='{ "exampleHeight": 590 }'></grid-example>

### Example: Select Everything

The next example is similar to the one above with the following changes:

- The checkbox selects everything, not just filtered.
- The column that the selection checkbox appears in is always the first column. This can be observed by dragging the columns to reorder them.

<grid-example title='Select Everything' name='header-checkbox-entire-set' type='generated' options='{ "exampleHeight": 590 }'></grid-example>

### Example: Select Only the Current Page

The next example demonstrates the `headerCheckboxSelectionCurrentPageOnly` property, note the following:

- The checkbox selects collapsed groups and all of their children.
- The checkbox will select expanded group nodes, but only the children which are also on the current page.

<grid-example title='Selecting Current Page' name='header-checkbox-current-page' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"] }'></grid-example>

### Example: Current Page with Group Selects Children

The next example demonstrates the `headerCheckboxSelectionCurrentPageOnly` property while using `groupSelectsChildren`, note the following:

- The checkbox selects collapsed groups and all of their children.
- The checkbox will select expanded group nodes only if all of the children are selected.

<grid-example title='Selecting Current Page with Group Selects Children' name='header-checkbox-current-page' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Specify Selectable Rows

It is possible to specify which rows can be selected via the `gridOptions.isRowSelectable(rowNode)` callback function.

<api-documentation source='grid-options/properties.json' section='selection' names='["isRowSelectable"]'></api-documentation>

For instance if we only wanted to allow rows where the 'year' property is less than 2007, we could implement the following:

<snippet>
const gridOptions = {
    isRowSelectable: rowNode => rowNode.data ? rowNode.data.year < 2007 : false,
}
</snippet>

### Example: Selectable Rows with Header Checkbox

This example demonstrates the following:

- The `isRowSelectable(node)` callback only allows selections on rows where the year < 2007.
- The country column has `headerCheckboxSelection: true` and `checkboxSelection: true`, but only rows which are selectable will obtain a selectable checkbox. Similarly, the header checkbox will only select selectable rows.

<grid-example title='Selectable Rows with Header Checkbox' name='specify-selectable-rows' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"] }'></grid-example>

### Example: Specifying Selectable Rows with Groups

This example demonstrates the following:

- The `isRowSelectable(node)` callback allows rows with a year of 2004 or 2008 to be selectable.
- As `gridOptions.groupSelectsChildren = true` selecting groups will also select 'selectable' children.
- As `gridOptions.groupSelectsFiltered = true` selecting groups will only select 'selectable' children that pass the filter.
- To demonstrate, follow these steps:

    1. Click 'Filter by Year 2008 & 2012'.
    1. Select checkbox beside 'United States'.
    1. Click 'Clear Filter'.
    1. Notice that only 'United States' for 2008 is selected.

<grid-example title='Specifying Selectable Rows with Groups' name='specify-selectable-rows-with-groups' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "modules": ["clientside", "rowgrouping", "setfilter", "menu", "columnpanel"] }'></grid-example>

## Selection Events

There are two events with regards to selection:<br/>

<api-documentation source='grid-events/events.json' section='selection' names='["rowSelected", "selectionChanged"]'></api-documentation>

<grid-example title='Selection Events' name='selection-events' type='generated'></grid-example>

## Node Selection API

To select rows programmatically, use the `node.setSelected(params)` method.

<api-documentation source='row-object/resources/methods.json' section='rowNodeMethods' names='["setSelected", "isSelected"]'></api-documentation>

<snippet>
|// set selected, keep any other selections
|node.setSelected(true);
|
|// set selected, exclusively, remove any other selections
|node.setSelected(true, true);
|
|// un-select
|node.setSelected(false);
|
|// check status of node selection
|const selected = node.isSelected();
</snippet>

The `isSelected()` method returns `true` if the node is selected, or `false` if it is not selected. If the node is a group node and the group selection is set to `'children'`, this will return `true` if all child (and grandchild) nodes are selected, `false` if all unselected, or `undefined` if a mixture.

## Grid Selection API

The grid API has the following methods for selection:

<api-documentation source='grid-api/api.json' section='selection' names='["selectAll","deselectAll","selectAllFiltered","deselectAllFiltered","getSelectedNodes", "getSelectedRows"]'></api-documentation>

If you want to select only filtered-out row nodes, you could do this using the following:

<snippet>
// loop through each node when it is filtered out
gridOptions.api.forEachNodeAfterFilter(node => {
    // select the node
    node.setSelected(true);
});
</snippet>

### Example: Using forEachNode

There is an API function `forEachNode`. This is useful for doing group selections on a business key. The example below shows selecting all rows with country = 'United States'. This method is also useful when you load data and need to know the node equivalent of the data for selection purposes.

<grid-example title='Using forEachNode' name='using-foreachnode' type='generated' options='{ "exampleHeight": 590 }'></grid-example>

### Example: Selection with Keyboard Arrow Keys

By default, you can select a row on mouse click, and navigate up and down the rows using your keyboard keys. However, the selection state does not correlate with the navigation keys, but we can add this behaviour using our own [Custom Navigation](/keyboard-navigation/#custom-navigation).

We need to provide a callback to the `navigateToNextCell` grid option to override the default arrow key navigation:

<api-documentation source='grid-options/properties.json' section='nav' names='["navigateToNextCell"]'></api-documentation>

<snippet>
|const gridOptions = {
|    navigateToNextCell: params => {
|        const suggestedNextCell = params.nextCellPosition;
|
|        // this is some code
|        const KEY_UP = 'ArrowUp';
|        const KEY_DOWN = 'ArrowDown';
|
|        const noUpOrDownKeyPressed = params.key!==KEY_DOWN && params.key!==KEY_UP;
|        if (noUpOrDownKeyPressed) {
|            return suggestedNextCell;
|        }
|
|        params.api.forEachNode(node => {
|            if (node.rowIndex === suggestedNextCell.rowIndex) {
|                node.setSelected(true);
|            }
|        });
|
|        return suggestedNextCell;
|    },
|}
</snippet>

From the code above you can see that we iterate over each node and call the `setSelected()` method if it matches the current `rowIndex`.

<grid-example title='Selection with Keyboard Arrow Keys' name='selection-with-arrow-keys' type='generated'></grid-example>

