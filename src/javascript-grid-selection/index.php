<?php
$key = "Selection";
$pageTitle = "ag-Grid Selection";
$pageDescription = "ag-Grid Selection";
$pageKeyboards = "ag-Grid Selection";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="selection">Selection</h2>

    <p>
        When you pass data to the grid, it wraps each data item in an node. This is explained
        in the section <a href="../javascript-grid-model/">Grid Model</a>. When you query for
        the selected rows, there are two method types, ones that return nodes, and ones that
        return data items. To get the selected nodes / rows from the grid, use the following
        API methods:
        <ul>
            <li><b>api.getSelectedNodes()</b>: Returns an array of the selected nodes.</li>
            <li><b>api.getSelectedRows()</b>: Returns a array of selected rows data.</li>
        </ul>
    </p>

    <p>
        Working with the ag-Grid nodes is preferred over the row data as it provide you with
        more information and maps better to the internal representation of ag-grid.
    </p>

    <p>The following properties are relevant to selection:</p>
    <ul>
        <li><b>rowSelection</b>: Type of row selection, set to either 'single' or 'multiple' to
            enable selection.</li>
        <li><b>rowDeselection</b>: Set to true or false. If true, then rows will be deselected if
            you hold down ctrl + click the row. Normal behaviour with the grid disallows deselection
            of nodes (ie once a node is selected, it remains selected until another row is selected
            in it's place).</li>
        <li><b>suppressRowClickSelection</b>: If true, rows won't be selected when clicked. Use, for
            example, when you want checkbox selection, and don't want to also select when the row
            is clicked.</li>
    </ul>

    <h3 id="singleRowSelectionExample">Example - Single Row Selection</h3>

    <p>
        The example below shows single row selection.
    </p>

    <show-example example="example1" example-height="450px"></show-example>

    <h3 id="multiRowSelectionExample">Example - Multiple Row Selection</h3>

    <p>
        The example below shows multi-row selection.
    </p>

    <show-example example="example2" example-height="450px"></show-example>

    <h3 id="checkboxSelection">Checkbox Selection</h3>

    <p>
        Checkbox selection can be used in two places: a) row selection and b) group selection.
    </p>

    <p>
        To include checkbox selection for a column, set the attribute 'checkboxSelection' to true
        on the column definition. You can set this attribute on as many columns as you like, however
        it doesn't make sense to have it in more one column in a table.
    </p>
    <p>
        To enable checkbox selection for groups, set the attribute 'checkbox' to true for the
        group renderer. See the grouping section for details on the group renderer.
    </p>
    <p>
        colDef.checkboxSelection can also be a function that returns true/false - use this if
        you want only checkboxes on some rows but not others. gridOptions.checkboxSelection can
        also be specified as a function - use this if you want, for example, the first column
        to have checkbox selection regardless of which column it is (you would do this by looping the columns using the
        column API, and check if the first column is the current one (in checkboxSelection).
    </p>

    <h3 id="groupSelection">Group Selection</h3>

    <p>
        When doing grouping, you control what selecting a group means. This is controlled with
        the two properties <i>groupSelectsChildren</i> and <i>groupSelectsFiltered</i>.
    <ul>
        <li><b>groupSelectsChildren</b>: When <b>true</b>, selecting a group will have the impact of
            selecting all it's children. The group will then display 'selected' when all children
            are selected, 'unselected' when none are selected and 'intermediate' when children have
            a mix of selected and unselected. When the node is selecting children, it will never appear
            in the selected set when calling <i>api.getSelectedNodes()</i>.
            When <b>false</b>, then the group is selectable independently
            of the child nodes.</li> When selecting the group node independently of the children, it will
            appear in the set when calling <i>api.getSelectedNodes()</i>.
        <li><b>groupSelectsFiltered</b>: Gets used when <i>groupSelectsChildren=true</i>. When
            <b>true</b> only filtered children of the group will be selected / unselected. This means
            you can apply a filter, then try to select a group, the group will end up in the
            intermediate state as only as subset of the children will be selected.</li>
    </ul>
    </p>

    <h4 id="groupsSelectionExample1">Groups & Checkbox Selection Example 1</h4>

    <p>
        The example below shows checkbox selection with groups. Selecting the group has the
        effect of selecting the children. Likewise selecting all the children automatically
        selects the group. In this scenario the group itself will never appear in the <i>selectedRows</i>
        list.
    </p>

    <p>
        The example also shows a checkbox for selection on the age column. In practice, it is not
        normal to have more than two columns for selection, the below is just for demonstration.
        Having a checkbox within a non-group row is best for grids that are not using grouping.
    </p>

    <show-example example="exampleGroupSelection" example-height="450px"></show-example>

    <h4 id="groupsSelectionExample2"><img src="../images/enterprise_50.png" title="Enterprise Feature" /> Groups & Checkbox Selection Example 2 - No Select Leaf Nodes</h4>

    <p>
        The example below is similar to the previous example except it does not put checkboxes
        on the leaf level nodes, only allowing entire groups to be selected. This is achieved
        by providing functions for
        <i>colDef.checkboxSelection</i> and <i>groupColumnDef.cellRendererParams.checkbox</i>.
    </p>

    <show-example example="exampleSelectionCheckbox" example-height="450px"></show-example>

    <h4 id="groupsSelectionExample3">Groups & Checkbox Selection Example 3 - Only Filtered</h4>

    <p>
        Lastly we show an example using <i>groupSelectsFiltered=true</i>. Here, when you filter
        the grid and select a group, only the filtered children get selected.
    </p>

    <p>
        To demonstrate, try this in the example:
        <ol>
        <li>Filter on swimming</li>
        <li>Select a country</li>
        <li>Notice that all filtered records get selected. If you remove the filter, the non filtered are not selected.</li>
        <li>Notice that the group becomes intermediate while all it's filtered children get selected. This is because
        the selected state of the group node is independent to the filter - so it becomes intermediate as not all of it's
        children are selected.</li>
    </ol>
    </p>

    <show-example example="exampleSelectionCheckboxFiltered"></show-example>

    <h3 id="headerCheckboxSelection">Header Checkbox Selection</h3>

    <p>
        It is possible to have a checkbox in the header for selection. To configure the
        column to have checkbox, set <i>colDef.headerCheckboxSelection=true</i>.
        <i>headerCheckboxSelection</i> can also be a function, if you want the checkbox
        to appear sometimes (eg if the columns is ordered first in the grid).
    </p>

    <pre><span class="codeComment">// the name column header always has a checkbox in the header</span>
colDef = {
    field: 'name',
    headerCheckboxSelection: true
    ...
}

<span class="codeComment">// the country column header only has checkbox if it is the first column</span>
colDef = {
    field: 'country',
    headerCheckboxSelection: function(params) {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;
        return thisIsFirstColumn;
    }
    ...
}</pre>

    <p>
        If <i>headerCheckboxSelection</i> is a function, the function will be called every
        time there is a change to the displayed columns, to check for changes.
    </p>

    <h4 id="select-everything-or-just-filtered">Select Everything or just Filtered</h4>

    <p>
        The header checkbox has two modes of operation, 'normal' and 'filtered only'.
        <ul>
            <li><b>colDef.headerCheckboxSelectionFilteredOnly=false</b>: The checkbox
            will select all rows when checked, and un-select all rows when unchecked.
            The checkbox will update it's state based on all rows.</li>
            <li><b>colDef.headerCheckboxSelectionFilteredOnly=true</b>: The checkbox
            will select only filtered rows when checked and un-select only filtered
            rows when unchecked. The checkbox will update it's state base on only
            filtered rows.</li>
        </ul>
        The examples below demonstrate both of these options.
    </p>

    <h4 id="headerSelectionExample1">Header Checkbox Example 1 - Filtered Only = true</h4>

    <p>
        This example has the following characteristics:
        <ul>
            <li>The checkbox works on filtered only. That means if you filter first, then hit the checkbox to select
                or un-select, then only the filtered results get impacted.</li>
            <li>The checkbox is always on the athlete column, even if the athlete column is moved.</li>
        </ul>
    </p>

    <show-example example="exampleHeaderCheckbox"></show-example>

    <h4 id="headerSelectionExample2">Header Checkbox Example 2 - Filtered Only = false</h4>

    <p>
        The next example is similar to the one above with the following changes:
        <ul>
        <li>The select selects everything, not just filtered.</li>
        <li>The column that the selection checkbox goes on is always the first column.
        This can be observed by dragging the columns to reorder them.</li>
    </ul>
    </p>

    <show-example example="exampleHeaderCheckboxEntireSet"></show-example>

    <h3 id="selectionEvents">Selection Events</h3>

    <p>
        There are two events with regards selection:<br/>
        <ul>
            <li><b>rowSelected</b>: Gets called when a row is selected or deselected.
                The event contains the node in question, so call the nodes 'isSelected()'
                method to see if it was just selected or deselected.</li>
            <li><b>selectionChanged</b>: Gets called when one or more rows are
                selected or deselected. Use the grid API get a list of selected nodes
                if you want them.</li>
        </ul>
    </p>

    <show-example example="example3"></show-example>

    <h3 id="nodeSelectionApi">Node Selection API</h3>

    <p>
        To select rows programmatically, use the node.setSelected() method. This method takes two
        parameters:
    <ul>
        <li><b>selected</b>: set to true to select, false to un-select.</li>
        <li><b>clearSelection</b> (optional): for selection only. If true, other nodes selection will be cleared.
            Use this if you do not want multi selection and want this node to be exclusively selected.</li>
    </ul>
    <pre><span class="codeComment">// set selected, keep any other selections</span>
node.setSelected(true);

<span class="codeComment">// set selected, exclusively, remove any other selections</span>
node.setSelected(true, true);

<span class="codeComment">// un-select</span>
node.setSelected(false);

<span class="codeComment">// check status of node selection</span>
var selected = node.isSelected();</pre>

    The selected status method returns true if the node is selected, or false if it is not selected. If the
    node is a group node and the group selection is set to 'children', then this will return true if all child
    (and grand child) nodes are selected, false if all unselected, or undefined if a mixture.
    </p>

    <h3 id="gridSelectionApi">Grid Selection API</h3>

    <p>
        The grid API has the following methods for selection:
        <ul>
        <li><b>api.selectAll()</b>: Select all rows in the grid. This is independent to filtering, it will always
        select everything regardless of filtering.</li>
        <li><b>api.deselectAll()</b>: Un-select all rows, again regardless of filtering.</li>
        <li><b>api.selectAllFiltered()</b>: Select all filtered rows in the grid.</li>
        <li><b>api.deselectAllFiltered()</b>: Un-select all filtered rows.</li>
        <li><b>api.getSelectedNodes()</b>: Returns a list of all the selected row nodes. This again is regardless
        of what filters are set.</li>
    </ul>
    </p>
    <p>
        If you want to select only filtered out rows nodes, then you do this following:
        <pre><span class="codeComment">// loop through each node after filter</span>
api.forEachNodeAfterFilter( function(node) {
  <span class="codeComment">// select the node</span>
  node.setSelected(true);
});</pre>
    </p>

    <h3 id="deep-dive-example-using-for-each-node">Deep Dive Example - Using <i>forEachNode</i></h3>

    <p>
        There is an api function <i>forEachNode</i>. This is useful for doing group selections
        on a business key. The example below shows selecting all rows with country = 'United States'.
        This method is also useful when you load data and need to know the node equivalent of the
        data for selection purposes.
    </p>

    <show-complex-example example="example4.html"
                      sources="{
                            [
                                { root: './', files: 'example4.html,example4.js' }
                            ]
                          }"
                      plunker="https://embed.plnkr.co/ehKrzYNuZ64CYBOClbL6/"
                      exampleheight="500px">
    </show-complex-example>

    <h3 id="selectionArrowKeys">Selection with Keyboard Arrow Keys</h3>

    <p>
        By default, you can select a row on mouse click. And you can navigate up and down the rows
        using your keyboard keys. But the selection state does not correlate with the navigation keys.
        However, we can add this behaviour using your own
        <a href="/javascript-grid-keyboard-navigation/#customNavigation">Custom Navigation</a>.
    </p>

    <p>
        First we need to provide a callback to the navigateToNextCell property in gridOptions to
        override the default arrow key navigation
    </p>

    <pre><code>var gridOptions = {

        // ...

        navigateToNextCell: myNavigation

}</code></pre>


    <p>
        From the code below you can see that we iterate over each node and call the <i>setSelected()</i>
        method if matches the current rowIndex.</p>

    <pre><code>function myNavigation(params) {

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
           gridOptions.api.forEachNode( (node) => {
               if (previousCell.rowIndex + 1 === node.rowIndex) {
                   node.setSelected(true);
               }
           });
           return suggestedNextCell;
       case KEY_UP:
           previousCell = params.previousCellDef;
           // set selected cell on current cell - 1
           gridOptions.api.forEachNode( (node) => {
               if (previousCell.rowIndex - 1 === node.rowIndex) {
                   node.setSelected(true);
               }
           });
           return suggestedNextCell;
       case KEY_LEFT:
       case KEY_RIGHT:
           return suggestedNextCell;
       default:
           throw "this will never happen, navigation is always on of the 4 keys above";
   }
}</code></pre>

    <show-example example="example5" example-height="450px"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
