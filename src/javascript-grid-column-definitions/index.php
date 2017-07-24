<?php
$key = "ColumnDefs";
$pageTitle = "Column Definitions";
$pageDescription = "ag-Grid Column Definitions";
$pageKeyboards = "ag-Grid Column Definitions";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>
    <h2 id="columnDefinitions">Columns Definitions</h2>

    <p>
        Each column in the grid is defined using a column definition. To avoid duplicating column properties when defining
        columns, there are also options to create a default column properties, default column group properties and specific
        column types.
    </p>

    <ul>
        <li><b>columnDefs:</b>  contains the columns definitions in the grid.</li>
        <li><b>defaultColDef (Optional):</b> contains column properties all columns will inherit.</li>
        <li><b>defaultColGroupDef (Optional):</b> contains column group properties all column groups will inherit.</li>
        <li><b>columnTypes (Optional):</b> specific column types containing properties that column definitions can inherit.</li>
    </ul>

    <note>
        Default columns and column types can specify any of the <a href="../javascript-grid-column-properties/">column properties</a> available on a column.
    </note>

    <p>
        The section on <a href="../javascript-grid-grouping-headers/">column groups</a> details how to group columns in the headers.
    </p>

    <p>
        The column definition options listed above can be used as follows:
    </p>

    <pre>var gridOptions = {
    rowData: myRowData,

    <span class="codeComment">// define columns</span>
    columnDefs: {
        <span class="codeComment">// uses the default column properties</span>
        {headerName: 'Col A', field: 'a'}

        <span class="codeComment">// overrides the default with a number filter</span>
        {headerName: 'Col B', field: 'b', filter: 'number'}

        <span class="codeComment">// overrides the default using a column type</span>
        {headerName: 'Col C', field: 'c', type: 'nonEditableColumn'}

        <span class="codeComment">// overrides the default using a multiple column types</span>
        {headerName: 'Col D', field: 'd', type: 'dateColumn,nonEditableColumn'}
    },

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

    <p>Columns are positioned in the order the ColDef's are specified in the grid options.</p>

    <p>
        When the grid creates a column it applies an order of precedence when selecting the properties to use.
    </p>
    <p>
        Below is an outline of the steps used when creating 'Col C' shown above:
    </p>


<pre><span class="codeComment">// Step 1: start with an empty column definition</span>
{}

<span class="codeComment">// Step 2: select the default column properties</span>
{width: 100, editable: true, filter: 'text'}

<span class="codeComment">// Step 3: merge the column type properties (using the 'type' property)</span>
{width: 100, editable: false, filter: 'number'}

<span class="codeComment">// Step 4: finally merge in the colDef properties</span>
{headerName: 'Col C', field: 'c', width: 100, editable: false, filter: 'number'}
    </pre>

    <p>
        The following examples demonstrates these column definitions in action:
    </p>

<show-example example="columnDefinitionExample"></show-example>

<h2 id="deep-dive-save-restore-full-state">Deep Dive - Save / Restore Full State</h2>

<p>
    It is also possible to store the entire state of the columns and restore them again via
    the API. This includes visibility, width, row groups and values.
</p>

<ul>
    <li><b>columnApi.getColumnState()</b>: Returns the state of a particular column.</li>
    <li><b>columnApi.setColumnState(state)</b>: To set the state of a particular column.</li>
</ul>

<p>
    The methods above get and set the state. The result is a Javascript array object that
    can be converted to / from JSON. An example of what the JSON might look like is as follows:
</p>

<pre>[
{colId: "athlete", aggFunc: "sum",  hide: false, rowGroupIndex: 0,    width: 150, pinned: null},
{colId: "age",     aggFunc: null,   hide: true,  rowGroupIndex: null, width: 90,  pinned: 'left'}
]
</pre>

<p>
    It is intended that the values in the json mimic the values in the column definitions.
    So if you want to re-apply the state to a set of column definitions as the default
    values, override the values of the same name in the corresponding column definition.
</p>

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

<p>
    The example below shows hiding / showing columns as well as saving / restoring the entire state.
    The example also registers for column events, the result of which are printed to the console.
</p>

<show-example example="columnStateExample"></show-example>

<?php include '../documentation-main/documentation_footer.php';?>
