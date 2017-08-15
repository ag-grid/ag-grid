<?php
$key = "ColumnDefs";
$pageTitle = "Column Definitions";
$pageDescription = "ag-Grid Column Definitions";
$pageKeyboards = "ag-Grid Column Definitions";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>
    <h1 id="columnDefinitions" class="first-h1">Column Definitions</h1>

    <p>
        Each column in the grid is defined using a column definition. Columns are positioned in the grid according to the order
        the ColDef's are specified in the grid options. The following example shows a simple grid with 3 columns defined:
    </p>

<pre>var gridOptions = {
    <span class="codeComment">// define 3 columns</span>
    columnDefs: [
        {headerName: 'Athlete', field: 'athlete'},
        {headerName: 'Sport', field: 'sport'},
        {headerName: 'Age', field: 'age'}
    ],

    <span class="codeComment">// other grid options here...</span>
}</pre>

    <p>
        See <a href="../javascript-grid-column-properties/">Column Properties</a> for a
        list of all properties that can be applied to a column.
    </p>

    <p>
        If you want the columns to be grouped, then you include them as groups like
        the following:
    </p>

<pre>var gridOptions = {
    columnDefs: [
        <span class="codeComment">// put the three columns into a group</span>
        {headerName: 'Group A',
            children: [
                {headerName: 'Athlete', field: 'athlete'},
                {headerName: 'Sport', field: 'sport'},
                {headerName: 'Age', field: 'age'}
            ]
        }
    ],

    <span class="codeComment">// other grid options here...</span>
}</pre>

    <p>
        Groups are explained in more detail in the section
        <a href="../javascript-grid-grouping-headers/">Column Groups</a>.
    </p>

    <h1 id="built-in-column-definitions">Numeric Columns</h1>

    <p>
    The grid provides a handy shortcut for formatting numeric columns. 
    Setting the column definition type to <code>numericColumn</code> aligns the column header and contents to the right, 
    which makes the scanning of the data easier for the user.
    </p>

    <pre>
    var gridOptions = {
        columnDefs: [
            { headerName: "Column A", field: "a" },
            { headerName: "Column B", field: "b", type: "numericColumn" }
        ]
    }
    </pre>

    <h1 id="default-column-definitions">Custom Column Types</h1>

    <p>
        In addition to the above, the grid provides additional ways to
        help simplify and avoid duplication of column definitions. This is done through the following:
    </p>

    <ul>
        <li><b>defaultColDef:</b> contains column properties all columns will inherit.</li>
        <li><b>defaultColGroupDef:</b> contains column group properties all column groups will inherit.</li>
        <li><b>columnTypes:</b> specific column types containing properties that column definitions can inherit.</li>
    </ul>

    <note>
        Default columns and column types can specify any of the <a href="../javascript-grid-column-properties/">column properties</a> available on a column.
    </note>

    <p>
        The following code snippet shows these three properties configures:
    </p>

    <pre>var gridOptions = {
    rowData: myRowData,

    <span class="codeComment">// define columns</span>
    columnDefs: [
        <span class="codeComment">// uses the default column properties</span>
        {headerName: 'Col A', field: 'a'},

        <span class="codeComment">// overrides the default with a number filter</span>
        {headerName: 'Col B', field: 'b', filter: 'number'},

        <span class="codeComment">// overrides the default using a column type</span>
        {headerName: 'Col C', field: 'c', type: 'nonEditableColumn'},

        <span class="codeComment">// overrides the default using a multiple column types</span>
        {headerName: 'Col D', field: 'd', type: 'dateColumn,nonEditableColumn'}
    ],

    <span class="codeComment">// a default column definition with properties that get applied to every column</span>
    defaultColDef: {
        <span class="codeComment">// set every column width</span>
        width: 100,
        <span class="codeComment">// make every column editable</span>
        editable: true,
        <span class="codeComment">// make every column use 'text' filter by default</span>
        filter: 'text'
    },

    <span class="codeComment">// if we had column groups, we could provide default group items here</span>
    defaultColGroupDef: {}

    <span class="codeComment">// define a column type (you can define as many as you like)</span>
    columnTypes: {
        "nonEditableColumn": {editable: false},
        "dateColumn": {filter: 'date', filterParams: {comparator: myDateComparator}, suppressMenu:true}
        }
    }

    <span class="codeComment">// other grid options here...</span>
}</pre>

    <p>
        When the grid creates a column it starts with the default column, then adds in anything from the column
        type, then finally adds in items from the column definition.
    </p>
    <p>
        For example, the following is an outline of the steps used when creating 'Col C' shown above:
    </p>


<pre><span class="codeComment">// Step 1: the grid starts with an empty merged definition</span>
{}

<span class="codeComment">// Step 2: default column properties are merged in</span>
{width: 100, editable: true, filter: 'text'}

<span class="codeComment">// Step 3: column type properties are merged in (using the 'type' property)</span>
{width: 100, editable: false, filter: 'number'}

<span class="codeComment">// Step 4: finally column definition properties are merged in</span>
{headerName: 'Col C', field: 'c', width: 100, editable: false, filter: 'number'}
    </pre>

    <p>
        The following examples demonstrates this configuration.
    </p>

<show-example example="columnDefinitionExample"></show-example>

<h1 id="changing-column-headers">Updating Column Definitions</h1>

<p>
    After the grid has been initialised it may be necessary to update the column definition. It is important to understand
    that when a column is created it is assigned a copy of the column definition defined in the GridOptions. For this reason
    it is necessary to obtain the column definition directly from the column.
</p>

<p>
    The following example shows how to update a column header name after the grid has been initialised. As we want to update
    the header name immediately we explicitly invoke <i>refreshHeader()</i> via the <a href="../javascript-grid-api/">Grid API</a>.
</p>

<pre>
<span class="codeComment">// get a reference to the column</span>
var col = gridOptions.columnApi.getColumn("colId");

<span class="codeComment">// obtain the column definition from the column</span>
var colDef = col.getColDef();

<span class="codeComment">// update the header name</span>
colDef.headerName = "New Header";

<span class="codeComment">// the column is now updated. to reflect the header change, get the grid refresh the header</span>
gridOptions.api.refreshHeader();
</pre>



<h1 id="saving-and-restoring-column-state">Saving and Restoring Column State</h1>

<p>
It is possible to save and subsequently restore the column state via the <a href="../javascript-column-api/">Column API</a>.
Examples of state include column visibility, width, row groups and values.
</p>
<p>
    This is primarily achieved using the following methods:
</p>
<ul>
    <li><b>columnApi.getColumnState()</b>: Returns the state of a particular column.</li>
    <li><b>columnApi.setColumnState(state)</b>: To set the state of a particular column.</li>
</ul>

<p>
    The column state used by the above methods is an array of objects that mimic the colDef's which can be converted to and from JSON.
    An example is shown below:
</p>

<pre>[
  {colId: "athlete", aggFunc: "sum",  hide: false, rowGroupIndex: 0,    width: 150, pinned: null},
  {colId: "age",     aggFunc: null,   hide: true,  rowGroupIndex: null, width: 90,  pinned: 'left'}
]
</pre>

<p>
    The values have the following meaning:
<ul>
    <li><b>colId</b>: The ID of the column. See
        <a href="../javascript-grid-column-definitions/">column definitions</a> for explanation
        of column ID
    </li>
    <li><b>aggFunc</b>: If this column is a value column, this field specifies the aggregation function.
        If the column is not a value column, this field is null.
    </li>
    <li><b>hide</b>: True if the column is hidden, otherwise false.</li>
    <li><b>rowGroupIndex</b>: The index of the row group. If the column is not grouped, this field is null.
        If multiple columns are used to group, this index provides the order of the grouping.
    </li>
    <li><b>width</b>: The width of the column. If the column was resized, this reflects the new value.</li>
    <li><b>pinned</b>: The pinned state of the column. Can be either 'left' or 'right'</li>
</ul>
</p>


<h1 id="column-api-example">Column API Example</h1>
<p>This section illustrates how to store and restore column state using the <a href="../javascript-column-api/">Column API</a>.
</p>

<ul>
    <li>hiding / showing columns as well as saving / restoring the entire state</li>
    <li><b>registering for column events, the result of which are printed to the console.</b></li>
</ul>

<show-example example="columnStateExample"></show-example>

<?php include '../documentation-main/documentation_footer.php';?>
