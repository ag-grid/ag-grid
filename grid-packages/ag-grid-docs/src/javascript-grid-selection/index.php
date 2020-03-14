<?php
$pageTitle = "Row Selection: Core Feature of our Datagrid";
$pageDescription = "Row Selection:  Select rows, Choose between click selection or checkbox selection, Selecting groups will select children. Core feature of ag-Grid supporting Angular, React, Javascript and many more. ";
$pageKeywords = "ag-Grid Selection";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 id="selection">Row Selection</h1>

    <p>
        Select a row by clicking on it. Selecting a row will remove any previous selection unless you
        hold down <code>Ctrl</code> while clicking. Selecting a row and holding down <code>Shift</code>
        while clicking a second row will select the range.
    </p>

    <p>
        Remember Row Selection works with all frameworks (e.g. Angular and React) as well as plain JavaScript.
    </p>

    <p>
        Configure row selection with the following properties:
    </p>

    <ul class="content">
        <li><code>rowSelection</code>: Type of row selection, set to either <code>'single'</code> or <code>'multiple'</code> to
            enable selection. <code>'single'</code> will use single row selection, such that when you select a row,
            any previously selected row gets unselected. <code>'multiple'</code> allows multiple rows to be selected.</li>
        <li><code>rowMultiSelectWithClick</code>: Set to <code>true</code> to allow multiple rows to be selected
            with clicks. For example, if you click to select one row and then click to select another row, the first
            row will stay selected as well. Clicking a selected row in this mode will deselect the row.
            This is useful for touch devices where <code>Ctrl</code> and <code>Shift</code> clicking is
            not an option.
        </li>
        <li><code>rowDeselection</code>: Set to <code>true</code> to allow rows to be deselected if
            you hold down <code>Ctrl</code> and click the row. By default the grid disallows deselection
            of rows (i.e. once a row is selected, it remains selected until another row is selected
            in its place).</li>
        <li><code>suppressRowClickSelection</code>: If <code>true</code>, rows won't be selected when clicked. Use, for
            example, when you want checkbox selection, and don't want to also select the row when the row
            is clicked.</li>
    </ul>

    <p>
        When you pass data to the grid, it wraps each data item in an node. This is explained
        in the section <a href="../javascript-grid-client-side-model/">Client-side Row Model</a>. When you query for
        the selected rows, there are two method types: ones that return nodes, and ones that
        return data items. To get the selected nodes / rows from the grid, use the following
        API methods:
    </p>

    <ul class="content">
        <li><code>api.getSelectedNodes()</code>: Returns an array of the selected nodes.</li>
        <li><code>api.getSelectedRows()</code>: Returns an array of data from the selected rows.</li>
    </ul>

    <p>
        Working with ag-Grid nodes is preferred over the row data as it provides you with
        more information and maps better to the internal representation of ag-Grid.
    </p>

    <h3 id="single-row-selection">Example: Single Row Selection</h3>

    <p>
        The example below shows single row selection.
        <ul>
            <li>
                Property <code>rowSelection='single'</code> is set to enable single row selection.
                It is not possible to select multiple rows.
            </li>
        </ul>
    </p>

    <?= grid_example('Single Row Selection', 'single-row-selection', 'generated', ['exampleHeight' => 600]) ?>

    <h3 id="multi-row-selection">Example: Multiple Row Selection</h3>

    <p>
        The example below shows multi-row selection.
        <ul>
            <li>
                Property <code>rowSelection='multiple'</code> is set to enable multiple row selection.
                Selecting multiple rows can be achieved by holding down <code>Ctrl</code> and mouse
                clicking the rows. A range of rows can be selected by using <code>Shift</code>.
            </li>
        </ul>
    </p>

    <?= grid_example('Multiple Row Selection', 'multiple-row-selection', 'generated', ['exampleHeight' => 600]) ?>

    <h3 id="multi-select-single-click">Example: Multi Select With Click</h3>

    <p>
        The example below shows multi select with click. Clicking multiple rows will
        select a range of rows without the need for <code>Ctrl</code> or <code>Shift</code>
        keys. Clicking a selected row will deselect it. This is useful for touch devices where
        <code>Ctrl</code> and <code>Shift</code> clicks are not available.
    </p>

    <p>
        <li>
            Property <code>rowMultiSelectWithClick=true</code> is set to enable multiple row
            selection with clicks.
        </li>
        <li>
            Clicking multiple rows will select multiple rows without needing to hit <code>Ctrl</code>
            or <code>Shift</code> keys.
        </li>
        <li>
            Clicking a selected row will deselect that row.
        </li>
    </p>

    <?= grid_example('Multi Select With Click', 'multi-select-single-click', 'generated', ['exampleHeight' => 600]) ?>

    <h2>Checkbox Selection</h2>

    <p>
        Checkbox selection can be used in two places: row selection and group selection.
    </p>
    <p>
        To include checkbox selection for a column, set the attribute <code>'checkboxSelection'</code> to <code>true</code>
        on the column definition. You can set this attribute on as many columns as you like, however
        it doesn't make sense to have it in more than one column in a table.
    </p>
    <p>
        To enable checkbox selection for groups, set the attribute <code>'checkbox'</code> to <code>true</code> for the
        group renderer. See the grouping section for details on the group renderer.
    </p>
    <p>
        <code>colDef.checkboxSelection</code> can also be a function that returns <code>true</code>/<code>false</code> - use this if
        you want checkboxes on some rows but not others. <code>gridOptions.checkboxSelection</code> can
        also be specified as a function - use this if you want, for example, the first column
        to have checkbox selection regardless of which column it is (you would do this by looping the columns using the
        column API, and check if the first column is the current one).
    </p>

    <h2>Group Selection</h2>

    <p>
        When doing grouping, you control what selecting a group means. This is controlled with
        the two properties <code>groupSelectsChildren</code> and <code>groupSelectsFiltered</code>.
    </p>

    <ul class="content">
        <li><code>groupSelectsChildren</code>: When <code>true</code>, selecting a group will have the impact of
            selecting all its children. The group will then display <code>'selected'</code> when all children
            are selected, <code>'unselected'</code> when none are selected and <code>'intermediate'</code> when children have
            a mix of selected and unselected. When the node is selecting children, it will never appear
            in the selected set when calling <code>api.getSelectedNodes()</code>.<br />
            When <code>false</code>, the group is selectable independently
            of the child nodes. When selecting the group node independently of the children, it will
            appear in the set when calling <code>api.getSelectedNodes()</code>.</li>
        <li><code>groupSelectsFiltered</code>: Used when <code>groupSelectsChildren=true</code>. When
            <code>true</code> only filtered children of the group will be selected / unselected. This means
            you can apply a filter, then try to select a group, and the group will end up in the
            intermediate state as only as subset of the children will be selected.</li>
    </ul>

    <h3>Example: Groups & Checkbox Selection</h3>

    <p>
        The example below shows checkbox selection with groups. Selecting the group has the
        effect of selecting the children. Likewise selecting all the children automatically
        selects the group. In this scenario the group itself will never appear in the <code>selectedRows</code>
        list.
    </p>

    <p>
        The example also shows a checkbox for selection on the age column. In practice, it is not
        normal to have more than one column for selection, the below is just for demonstration.
        Having a checkbox within a non-group row is best for grids that are not using grouping.
    </p>

    <?= grid_example('Groups & Checkbox Selection', 'group-selection', 'generated', ['enterprise' => true, 'exampleHeight' => 600]) ?>

    <h3>Example: Groups & Checkbox Selection With Unselectable Leaf Nodes</h3>

    <p>
        The example below is similar to the previous example except it does not put checkboxes
        on the leaf level nodes, allowing only entire groups to be selected. This is achieved
        by providing functions for
        <code>colDef.checkboxSelection</code> and <code>autoGroupColumnDef.cellRendererParams.checkbox</code>.
    </p>

    <?= grid_example('Groups & Checkbox Selection With Unselectable Leaf Nodes', 'selection-checkbox', 'generated', ['enterprise' => true, 'exampleHeight' => 600]) ?>

    <h3>Example: Groups & Checkbox Selection With Only Filtered Children</h3>

    <p>
        Lastly we show an example using <code>groupSelectsFiltered=true</code>. Here, when you filter
        the grid and select a group, only the filtered children get selected.
    </p>

    <p>
        To demonstrate, try this in the example:
        <ol>
            <li>Filter on swimming</li>
            <li>Select a country</li>
            <li>Notice that all filtered rows get selected. If you remove the filter, the non-filtered rows are not selected.</li>
            <li>Notice that the group becomes intermediate while all its filtered children get selected. This is because
            the selected state of the group node is independent to the filter, so it becomes intermediate as not all of its
            children are selected.</li>
        </ol>
    </p>

    <?= grid_example('Groups & Checkbox Selection With Only Filtered Children', 'selection-checkbox-filtered', 'generated', ['enterprise' => true, 'exampleHeight' => 590]) ?>

    <h2>Header Checkbox Selection</h2>

    <p>
        It is possible to have a checkbox in the header for selection. To configure the
        column to have a checkbox, set <code>colDef.headerCheckboxSelection=true</code>.
        <code>headerCheckboxSelection</code> can also be a function, if you want the checkbox
        to appear sometimes (e.g. if the column is ordered first in the grid).
    </p>

    <snippet>
// the name column header always has a checkbox in the header
colDef = {
    field: 'name',
    headerCheckboxSelection: true,
    ...
}

// the country column header only has checkbox if it is the first column
colDef = {
    field: 'country',
    headerCheckboxSelection: function(params) {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        return displayedColumns[0] === params.column;
    },
    ...
}</snippet>

    <p>
        If <code>headerCheckboxSelection</code> is a function, the function will be called every
        time there is a change to the displayed columns, to check for changes.
    </p>

    <h2>Select Everything or Just Filtered</h2>

    <p>
        The header checkbox has two modes of operation, <code>'normal'</code> and <code>'filtered only'</code>.
</p>
        <ul class="content">
            <li><b>colDef.headerCheckboxSelectionFilteredOnly=false</b>: The checkbox
            will select all rows when checked, and un-select all rows when unchecked.
            The checkbox will update its state based on all rows.</li>
            <li><b>colDef.headerCheckboxSelectionFilteredOnly=true</b>: The checkbox
            will select only filtered rows when checked and un-select only filtered
            rows when unchecked. The checkbox will update its state based only on
            filtered rows.</li>
        </ul>
    <p>
        The examples below demonstrate both of these options.
    </p>

    <h3>Example: Just Filtered</h3>

    <p>
        This example has the following characteristics:
    </p>
        <ul class="content">
            <li>The checkbox works on filtered rows only. That means if you filter first, then hit the checkbox to select
                or un-select, then only the filtered rows are affected.</li>
            <li>The checkbox is always on the athlete column, even if the athlete column is moved.</li>
        </ul>

    <?= grid_example('Just Filtered', 'header-checkbox', 'generated', ['exampleHeight' => 590]) ?>

    <h3>Example: Select Everything</h3>

    <p>
        The next example is similar to the one above with the following changes:
    </p>
        <ul class="content">
        <li>The checkbox selects everything, not just filtered.</li>
        <li>The column that the selection checkbox appears in is always the first column.
        This can be observed by dragging the columns to reorder them.</li>
    </ul>

    <?= grid_example('Select Everything', 'header-checkbox-entire-set', 'generated', ['exampleHeight' => 590]) ?>

    <h2 id="specify-selectable-rows">Specify Selectable Rows</h2>

    <p>
        It is possible to specify which rows can be selected via the <code>gridOptions.isRowSelectable(rowNode)</code>
        callback function.
    </p>
    <p>
        For instance if we only wanted to allow rows where the 'year' property is less than 2007, we could implement
        the following:
    </p>

    <snippet>
        gridOptions.isRowSelectable: function(rowNode) {
            return rowNode.data ? rowNode.data.year < 2007 : false;
        }</snippet>

    <h3>Example: Selectable Rows with Header Checkbox</h3>

    <p>This example demonstrates the following: </p>

    <ul class="content">
        <li>The <code>isRowSelectable()</code> callback only allows selections on rows where the year < 2007.</li>
        <li>The country column has <code>headerCheckboxSelection: true</code> and <code>checkboxSelection: true</code>,
            but only rows which are selectable will obtain a selectable checkbox. Similarly, the header checkbox
            will only select selectable rows.
        </li>
    </ul>

    <?= grid_example('Selectable Rows with Header Checkbox', 'specify-selectable-rows', 'generated', ['exampleHeight' => 600]) ?>

    <h3>Example: Specifying Selectable Rows with Groups</h3>

    <p>This example demonstrates the following: </p>

    <ul class="content">
        <li>The <code>isRowSelectable()</code> callback allows rows with a year of 2004 or 2008 to be selectable.</li>
        <li>As <code>gridOptions.groupSelectsChildren = true</code> selecting groups will also select 'selectable' children.</li>
        <li>As <code>gridOptions.groupSelectsFiltered = true</code> selecting groups will only select 'selectable' children
        that pass the filter.</li>
        <li>To demonstrate, follow these steps:
            <ol>
                <li>Click 'Filter by Year 2008 & 2012'.</li>
                <li>Select checkbox beside 'United States'.</li>
                <li>Click 'Clear Filter'.</li>
                <li>Notice that only 'United States' for 2008 is selected.</li>
            </ol>
        </li>
    </ul>

    <?= grid_example('Specifying Selectable Rows with Groups', 'specify-selectable-rows-with-groups', 'generated', ['enterprise' => true, 'exampleHeight' => 590]) ?>

    <h2>Selection Events</h2>

    <p>
        There are two events with regards to selection:<br/>
    </p>
        <ul class="content">
            <li><b>rowSelected</b>: Called when a row is selected or deselected.
                The event contains the node in question, so call the node's <code>isSelected()</code>
                method to see if it was just selected or deselected.</li>
            <li><b>selectionChanged</b>: Called when one or more rows are
                selected or deselected. Use the grid API to get a list of selected nodes
                if you want them.</li>
        </ul>

    <?= grid_example('Selection Events', 'selection-events', 'generated', ['exampleHeight' => 600]) ?>

    <h2>Node Selection API</h2>

    <p>
        To select rows programmatically, use the <code>node.setSelected()</code> method. This method takes two
        parameters:
</p>
    <ul class="content">
        <li><b>selected</b>: set to <code>true</code> to select, <code>false</code> to un-select.</li>
        <li><b>clearSelection</b> (optional): for selection only. If <code>true</code>, any other selected nodes will be deselected.
            Use this if you do not want multi-selection and want this node to be exclusively selected.</li>
    </ul>
    <snippet>
// set selected, keep any other selections
node.setSelected(true);

// set selected, exclusively, remove any other selections
node.setSelected(true, true);

// un-select
node.setSelected(false);

// check status of node selection
var selected = node.isSelected();</snippet>

    The <code>isSelected()</code> method returns <code>true</code> if the node is selected, or <code>false</code> if it is not selected. If the
    node is a group node and the group selection is set to <code>'children'</code>, this will return <code>true</code> if all child
    (and grandchild) nodes are selected, <code>false</code> if all unselected, or <code>undefined</code> if a mixture.
    </p>

    <h2>Grid Selection API</h2>

    <p>
        The grid API has the following methods for selection:
    </p>
        <ul class="content">
        <li><code>api.selectAll()</code>: Select all rows in the grid, regardless of filtering.</li>
        <li><code>api.deselectAll()</code>: Un-select all rows, regardless of filtering.</li>
        <li><code>api.selectAllFiltered()</code>: Select all filtered rows in the grid.</li>
        <li><code>api.deselectAllFiltered()</code>: Un-select all filtered rows.</li>
        <li><code>api.getSelectedNodes()</code>: Returns a list of all the selected row nodes, regardless
        of filtering.</li>
    </ul>
    <p>
        If you want to select only filtered-out row nodes, you could do this using the following:
        <snippet>
// loop through each node when it is filtered out
api.forEachNodeAfterFilter(function(node) {
  // select the node
  node.setSelected(true);
});</snippet>
    </p>

    <h3 id="deep-dive-example-using-for-each-node">Example: Using <code>forEachNode</code></h3>

    <p>
        There is an API function <code>forEachNode</code>. This is useful for doing group selections
        on a business key. The example below shows selecting all rows with country = 'United States'.
        This method is also useful when you load data and need to know the node equivalent of the
        data for selection purposes.
    </p>

    <?= grid_example('Using forEachNode', 'using-foreachnode', 'generated', ['exampleHeight' => 590]) ?>

    <h3>Example: Selection with Keyboard Arrow Keys</h3>

    <p>
        By default, you can select a row on mouse click, and navigate up and down the rows
        using your keyboard keys. However, the selection state does not correlate with the navigation keys,
        but we can add this behaviour using our own
        <a href="../javascript-grid-keyboard-navigation/#customNavigation">Custom Navigation</a>.
    </p>

    <p>
        First we need to provide a callback to the <code>navigateToNextCell</code> property in <code>gridOptions</code> to
        override the default arrow key navigation:
    </p>

    <snippet>
var gridOptions = {
    navigateToNextCell: myNavigation,
    ...
}</snippet>


    <p>
        From the code below you can see that we iterate over each node and call the <code>setSelected()</code>
        method if it matches the current <code>rowIndex</code>.</p>

    <snippet>
function myNavigation(params) {
   var previousCell = params.previousCellDef;
   var suggestedNextCell = params.nextCellDef;

   var KEY_UP = 38;
   var KEY_DOWN = 40;
   var KEY_LEFT = 37;
   var KEY_RIGHT = 39;

   switch (params.key) {
       case KEY_DOWN:
           previousCell = params.previousCellDef;
           // set selected cell on current cell + 1
           gridOptions.api.forEachNode(function(node) {
               if (previousCell.rowIndex + 1 === node.rowIndex) {
                   node.setSelected(true);
               }
           });
           return suggestedNextCell;
       case KEY_UP:
           previousCell = params.previousCellDef;
           // set selected cell on current cell - 1
           gridOptions.api.forEachNode(function(node) {
               if (previousCell.rowIndex - 1 === node.rowIndex) {
                   node.setSelected(true);
               }
           });
           return suggestedNextCell;
       case KEY_LEFT:
       case KEY_RIGHT:
           return suggestedNextCell;
       default:
           throw "this will never happen, navigation is always one of the 4 keys above";
   }
}</snippet>

<?= grid_example('Selection with Keyboard Arrow Keys', 'selection-with-arrow-keys') ?>

<?php include '../documentation-main/documentation_footer.php';?>
