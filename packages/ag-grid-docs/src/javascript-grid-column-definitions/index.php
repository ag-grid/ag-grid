<?php
$pageTitle = "ag-Grid - Core Grid Features: Column Definitions";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Column Definitions. Columns are configured in the grid by providing a list of Column Definitions. The attributes you set on the column definitions define how the columns behave e.g. title, width etc. Free and Commercial version available.";
$pageKeyboards = "ag-Grid Column Definitions";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>
    <h1>Column Definitions</h1>

    <p class="lead">
        Each column in the grid is defined using a column definition. Columns are positioned in the grid according to the order
        the ColDef's are specified in the grid options. The following example shows a simple grid with 3 columns defined:
    </p>

<snippet>
var gridOptions = {
    // define 3 columns
    columnDefs: [
        {headerName: 'Athlete', field: 'athlete'},
        {headerName: 'Sport', field: 'sport'},
        {headerName: 'Age', field: 'age'}
    ],

    // other grid options here...
}</snippet>

    <p>
        See <a href="../javascript-grid-column-properties/">Column Properties</a> for a
        list of all properties that can be applied to a column.
    </p>

    <p>
        If you want the columns to be grouped, then you include them as groups like
        the following:
    </p>

<snippet>
var gridOptions = {
    columnDefs: [
        // put the three columns into a group
        {headerName: 'Group A',
            children: [
                {headerName: 'Athlete', field: 'athlete'},
                {headerName: 'Sport', field: 'sport'},
                {headerName: 'Age', field: 'age'}
            ]
        }
    ],

    // other grid options here...
}</snippet>

    <p>
        Groups are explained in more detail in the section
        <a href="../javascript-grid-grouping-headers/">Column Groups</a>.
    </p>


    <h2 id="default-column-definitions">Custom Column Types</h2>

    <p>
        In addition to the above, the grid provides additional ways to
        help simplify and avoid duplication of column definitions. This is done through the following:
    </p>

    <ul class="content">
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

    <snippet>
var gridOptions = {
    rowData: myRowData,

    // define columns
    columnDefs: [
        // uses the default column properties
        {headerName: 'Col A', field: 'a'},

        // overrides the default with a number filter
        {headerName: 'Col B', field: 'b', filter: 'agNumberColumnFilter'},

        // overrides the default using a column type
        {headerName: 'Col C', field: 'c', type: 'nonEditableColumn'},

        // overrides the default using a multiple column types
        {headerName: 'Col D', field: 'd', type: ['dateColumn', 'nonEditableColumn']}
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
        "nonEditableColumn": {editable: false},
        "dateColumn": {filter: 'agDateColumnFilter', filterParams: {comparator: myDateComparator}, suppressMenu:true}
        }
    }

    // other grid options here...
}</snippet>

    <p>
        When the grid creates a column it starts with the default column, then adds in anything from the column
        type, then finally adds in items from the column definition.
    </p>
    <p>
        For example, the following is an outline of the steps used when creating 'Col C' shown above:
    </p>


<snippet>
// Step 1: the grid starts with an empty merged definition
{}

// Step 2: default column properties are merged in
{width: 100, editable: true, filter: 'agTextColumnFilter'}

// Step 3: column type properties are merged in (using the 'type' property)
{width: 100, editable: false, filter: 'agNumberColumnFilter'}

// Step 4: finally column definition properties are merged in
{headerName: 'Col C', field: 'c', width: 100, editable: false, filter: 'agNumberColumnFilter'}
   </snippet>

    <p>
        The following examples demonstrates this configuration.
    </p>

<?= example('Column Definition Example', 'column-definition', 'generated', array("processVue" => true, 'grid' => array('height' => '100%'))) ?>

<h2>Provided Column Types</h2>

<h3>Numeric Columns</h3>

<p>
The grid provides a handy shortcut for formatting numeric columns. 
Setting the column definition type to <code>numericColumn</code> aligns the column header and contents to the right, 
which makes the scanning of the data easier for the user.
</p>

<snippet>
var gridOptions = {
    columnDefs: [
        { headerName: "Column A", field: "a" },
        { headerName: "Column B", field: "b", type: "numericColumn" }
    ]
}</snippet>

<h2 id="column-ids">Column ID's</h2>

<p>
    Each column generated by the grid is given a unique ID. Parts of the Grid API use Column ID's (column identifiers).
</p>

<p>
    If you are
    using the API and the columns ID's are a little complex (eg what if two columns have the same <code>field</code>,
    or what if you are using <code>valueGetter</code> instead of <code>field</code>) then it is useful to understand
    how columns ID's are decided.
</p>

<p>
    If the user provides <code>colId</code> in the column definition, then this is used, otherwise the <code>field</code>
    is used. If both <code>coldId</code> and <code>field</code> then <code>colId</code> gets preference. If neither
    <code>colId</code> or <code>field</code> then numeric is provided. Then finally the ID ensured to be unique by
    appending '_[n]' where n is the first positive number that allows uniqueness.
</p>

<p>
    In the example below, columns are set up to demonstrate the different ways ID's are generated.
    Open the example in a new tab and observe the output in the dev console. Note the following:
</p>

<ul>
    <li>
        Col 1 and Col 2 both use <code>colId</code>. The grid appends '_1' to Col 2 to make the ID unique.
    </li>
    <li>
        Col 3 and Col 4 both use <code>field</code>. The grid appends '_1' to Col 4 to make the ID unique.
    </li>
    <li>
        Col 5 and Col 6 have neither <code>colId</code> or <code>field</code> so the grid generates columns.
    </li>
</ul>

<?= example('Column IDs', 'column-ids', 'generated') ?>

<h2 id="saving-and-restoring-column-state">Saving and Restoring Column State</h2>

<p>
It is possible to save and subsequently restore the column state via the <a href="../javascript-grid-column-api//">Column API</a>.
Examples of state include column visibility, width, row groups and values.
</p>
<p>
    This is primarily achieved using the following methods:
</p>

<ul class="content">
    <li><code>columnApi.getColumnState()</code>: Returns the state of a particular column.</li>
    <li><code>columnApi.setColumnState(state)</code>: To set the state of a particular column.</li>
</ul>

<p>
    The column state used by the above methods is an array of objects that mimic the colDef's which can be converted to and from JSON.
    An example is shown below:
</p>

<snippet>
[
  {colId: "athlete", aggFunc: "sum",  hide: false, rowGroupIndex: 0,    width: 150, pinned: null},
  {colId: "age",     aggFunc: null,   hide: true,  rowGroupIndex: null, width: 90,  pinned: 'left'}
]</snippet>

<p>
    The values have the following meaning:
</p>
<ul class="content">
    <li><code>colId</code>: The ID of the column.
    </li>
    <li><code>aggFunc</code>: If this column is a value column, this field specifies the aggregation function.
        If the column is not a value column, this field is null.
    </li>
    <li><code>hide</code>: True if the column is hidden, otherwise false.</li>
    <li><code>rowGroupIndex</code>: The index of the row group. If the column is not grouped, this field is null.
        If multiple columns are used to group, this index provides the order of the grouping.
    </li>
    <li><code>width</code>: The width of the column. If the column was resized, this reflects the new value.</li>
    <li><code>pinned</code>: The pinned state of the column. Can be either <code>'left'</code> or <code>'right'</code></li>
</ul>

<note>
    To suppress events raised when invoking <code>columnApi.setColumnState(state)</code>, and also
    <code>columnApi.resetColumnState()</code>, use: <code>gridOptions.suppressSetColumnStateEvents = true</code>.
</note>

<h2 id="column-api-example">Column API Example</h2>
<p>The example below shows using the grid's <a href="../javascript-grid-column-api/">Column API</a>.
</p>

<?= example('Column State Example', 'column-state', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

<note>
    This example also includes <a href="../javascript-grid-grouping-headers/">Column Groups</a> which are
    covered in the next section, in order to demonstrate saving and restoring the expanded state.
</note>


<h2 id="column-changes">Column Changes</h2>

<p>
    It is possible to add and remove columns after the grid is created. This is done by
    either calling <code>api.setColumnDefs()</code> or setting the bound property
    <code>columnDefs</code>.
</p>

<p>
    When new columns are set, the grid will compare with current columns and work
    out which columns are old (to be removed), new (new columns created) or kept
    (columns that remain will keep their state including position, filter and sort).
</p>

<p>
    Comparison of column definitions is done on 1) object reference comparison and 2)
    column ID eg <code>colDef.colId</code>. If either the object reference matches, or
    the column ID matches, then the grid treats the columns as the same column. For example
    if the grid has a column with ID 'country' and the user sets new columns, one of which
    also has ID of 'country', then the old country column is kept in place of the new one
    keeping it's internal state such as width, position, sort and filter.
</p>

<note>
    If you are updating the columns (not replacing the entire set) then you must either
    provide column ID's or reuse the column definition object instances. Otherwise the grid will
    not know that the columns are in fact the same columns.
</note>

<p>
    The example below demonstrates changing columns. Select the checkboxes for
    the columns to display and hit Apply. Note the following:
    <ul>
        <li>
            <b>Column Width:</b> If you change the width of a column (eg Year)
            and then add or remove other columns (eg remove Age) then the width
            of Year remains unchanged.
        </li>
        <li>
            <b>Column Sort:</b> If you sort the data by a column (eg Year)
            and then add or remove other columns (eg remove Age) then the sort
            remains unchanged. Conversely if you remove a column with a sort
            (eg remove Year while also sorting by Year) then the sort
            order is removed.
        </li>
        <li>
            <b>Column Filter:</b> If you filter the data by a column (eg Year)
            and then add or remove other columns (eg remove Year) then the filter
            remains unchanged. Conversely if you remove a column with a filter
            (eg remove Year while also filtering on Year) then the filter
            is removed.
        </li>
        <li>
            <b>Row Group & Pivot:</b> If you row group or pivot the data by a column
            (eg Year) and then add or remove other columns (eg remove Age) then the row group
            or pivot remains unchanged. Conversely if you remove a column with a row group
            or pivot (eg remove Year while also row grouping or pivoting on Year) then the
            row group or pivot is removed.
        </li>
        <li>
            The <a href="../javascript-grid-tool-panel-columns/">Columns Tool Panel</a>
            and <a href="../javascript-grid-tool-panel-filters/">Filters Tool Panel</a>
            updates with the new columns. The order of columns in both tool panels
            will always match the order of the columns supplied in the column definitions.
            To observe this, hit the Reverse button which does same as Apply but
            reverses the order of the columns first. This will result in the columns
            appearing in the tool panels in reverse order.
        </li>
    </ul>
</p>

<?= example('Column Changes', 'column-changes', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

<h2 id="delta-columns">Delta Columns</h2>

<p>
    By default when new columns are loaded into the grid, the following properties are not used:
    <ul>
        <li>Column Order</li>
        <li>Aggregation Function <code>(colDef.aggFunc)</code></li>
        <li>Width (<code>colDef.width</code>)</li>
        <li>Pivot (<code>colDef.pivot or colDef.pivotIndex</code>)</li>
        <li>Row Group (<code>colDef.rowGroup or colDef.rowGroupIndex</code>)</li>
        <li>Pinned (<code>colDef.pinned</code>)</li>
    </ul>
    This is done on purpose to avoid unexpected behaviour for the application user.
</p>

<p>
    For example - suppose the application user rearranges the order of the columns. Then if the application
    sets new column definitions for the purposes of adding one extra column into the grid, then it would be
    a bad user experience to reset the order of all the columns.
</p>

<p>
    Likewise if the user changes an aggregation function, or the width of a column, or whether a column was
    pinned, all of these changes the user does should not get undone because the application decided
    to update the column definitions.
</p>

<p>
    To change this behaviour and have column attributes above (order, width, row group etc) take effect
    each time the application updates the grid columns, then set <code>gridOption.deltaColumnMode=true</code>.
    The responsibility is then on your application to make sure the provided column definitions are in sync
    with what is in the grid if you don't want undesired visible changes - eg if the user changes the width
    of a column, the application should listen to the grid event <code>columnWidthChanged</code> and update
    the applications column definition with the new width - otherwise the width will reset back to the default
    after the application updates the column definitions into the grid.
</p>

<p>
    The example below demonstrates Delta Column Mode. Note the following:
    <ul>
        <li>
            Grid property <code>deltaColumnMode</code> is set to true.
        </li>
        <li>
            Each button sets a different list of columns into the grid. Because each column
            definition provides an ID, the grid knows the instance of the column is to be kept.
            This means any active sorting or filtering associated with the column will be kept
            between column changes.
        </li>
        <li>
            Each button changes the column definitions in a way that would be otherwise ignored
            if <code>deltaColumnMode</code> was not set. The changes are as follows:
            <ul>
                <li>
                    <b>Normal</b>: Columns are set as normal. This is the default. It will make
                    the other button actions easier to understand if Normal is pressed before
                    pushing the other buttons.
                </li>
                <li>
                    <b>Reverse Order</b>: Columns are provided in reverse order.
                </li>
                <li>
                    <b>Widths</b>: Columns are provided with different widths.
                </li>
                <li>
                    <b>Visibility</b>: Columns are provided with <code>colDef.hidden=true</code>.
                    The columns will still be in the grid and listed in the tool panel, however
                    they will not be visible.
                </li>
                <li>
                    <b>Grouping</b>: Rows will be grouped by Sport.
                </li>
                <li>
                    <b>No Resize or Sort</b>: Clicking the columns will not sort and it will not be possible
                    to resize the column via dragging it's edge.
                </li>
                <li>
                    <b>Pinned</b>: Columns will be pinned to the left and right.
                </li>
            </ul>
        </li>
    </ul>
</p>

<?= example('Delta Columns', 'delta-columns', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

<?php include '../documentation-main/documentation_footer.php';?>
