<?php
$pageTitle = "ag-Grid Row Models: The Server-side Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Pivoting </h1>

<p class="lead">
    In this section we add Server-side Pivoting to create an example with the ability to 'Slice and Dice' data using
    the Server-side Row model.
</p>

<h2>Enabling Pivoting</h2>

<p>
    To pivot on a column <code>pivot=true</code> should be set on the column definition. Additionally the needs
    to be in pivot mode which is set through the grid option <code>pivotMode=true</code>.
</p>

<p> In the snippet below a pivot is defined on the 'year' column and pivot mode is enabled:</p>

<snippet>
gridOptions.columnDefs = [
    { field: "country", rowGroup: true },
    { field: "year", pivot: true },
    { field: "total" },
];

// pivoting will only take effect when pivot mode is enabled
gridOptions.pivotMode = true;
</snippet>

<p>
    For more configuration details see the section on <a href="../javascript-grid-pivoting">Pivoting</a>.
</p>

<h2>Pivoting on the Server</h2>

<p>
    The actual pivoting is performed on the server when using the Server-side Row Model. When the grid needs more
    rows it makes a request via <code>getRows(params)</code> on the
    <a href="../javascript-grid-server-side-model-datasource/#datasource-interface">Server-side Datasource</a> with
    metadata containing row grouping details.
</p>

<p>
    The properties relevant to pivoting in the request are shown below:
</p>

<snippet>
IServerSideGetRowsRequest {

   // pivot columns, cols with 'pivot=true'
   pivotCols: ColumnVO[];

    // true if pivot mode is one, otherwise false
   pivotMode: boolean;

   ... // other params
}
</snippet>

<p>
    Note in the snippet above that <code>pivotCols</code> contains all the columns the grid is pivoting on,
    and <code>pivotMode</code> is used to determine if pivoting is currently enabled in the grid.
</p>

<h2>Setting Secondary Columns</h2>

<p>
    New columns are essentially created from the data contained in the rows when pivoting which means new
    <a href="../javascript-grid-column-definitions/#column-definitions">Column Definitions</a> need to be supplied to the
    grid. This is done through the following column api method:
</p>

<snippet>
    // supply pivot column definitions to the grid
    columnApi.setSecondaryColumns(pivotColDefs);
</snippet>

<p>
    Note from the snippet above that the <code>pivotColDefs</code> supplied can also be
    <a href="../javascript-grid-grouping-headers/">Column Group Definitions</a>. This allows for any number of pivot
    and value columns.
</p>

<h2>Example - Simple Pivot </h2>

<p>
    The example below demonstrates server-side Pivoting. Note the following:
</p>

<ul class="content">
    <li>
        Pivot mode is enabled through the grid option <code>pivotMode=true</code>.
    </li>
    <li>
        A pivot is placed on the <b>Year</b> column via <code>pivot=true</code> defined on the column definition.
    </li>
    <li>
        Rows are grouped by <b>Country</b> with <code>rowGroup=true</code> defined on the column definition.
    </li>
    <li>
        Values in the <b>Total</b> column are aggregated as <code>aggFunc='sum'</code> is defined on the column definition.
    </li>
    <li>
        The <code>pivotCols</code> and <code>pivotMode</code> properties in the request are used by the server
        to perform pivoting.
    </li>
    <li>
        New column definitions are created from the <code>pivotFields</code> returned from the server and supplied to the
        grid using <code>columnApi.setSecondaryColumns(pivotColDefs)</code>.
    </li>
    <li>
        Open the browsers dev console to view the request supplied to the datasource.
    </li>
</ul>

<?= grid_example('Simple Pivot', 'simple-pivot', 'generated', array("enterprise" => 1, "processVue" => true, "extras" => array('alasql'))) ?>

<h2>Example - Pivoting with Column Groups </h2>

<p>
    The example below demonstrates server-side Pivoting with multiple row groups when there multiple value columns ('gold', 'silver', 'bronze')
    under the 'year' pivot column group. Note the following:
</p>

<ul class="content">
    <li>
        Pivot mode is enabled through the grid option <code>pivotMode=true</code>.
    </li>
    <li>
        A pivot is placed on the <b>Year</b> column via <code>pivot=true</code> defined on the column definition.
    </li>
    <li>
        Rows are grouped by <b>Country</b> and <b>Sport</b> with <code>rowGroup=true</code> defined on their column definitions.
    </li>
    <li>
        The <b>Gold</b>, <b>Silver</b> and <b>Bronze</b> value columns have <code>aggFunc='sum'</code> defined on their
        column definitions.
    </li>
    <li>
        The <code>pivotCols</code> and <code>pivotMode</code> properties in the request are used by the server
        to perform pivoting.
    </li>
    <li>
        New column group definitions are created from the <code>pivotFields</code> returned from the server and supplied
        to the grid using <code>columnApi.setSecondaryColumns(pivotColDefs)</code>.
    </li>
    <li>
        Open the browsers dev console to view the request supplied to the datasource.
    </li>
</ul>

<?= grid_example('Pivoting with Column Groups', 'pivoting-with-column-groups', 'generated', array("enterprise" => 1, "processVue" => true, "extras" => array('alasql'))) ?>

<h2>Example - Slice and Dice - Mocked Server</h2>
<p>
    A mock data store running inside the browser is used in the example below. The purpose of the mock server is to
    demonstrate the interaction between the grid and the server. For your application, your server will need to
    understand the requests from the client and build SQL (or the SQL equivalent if using a no-SQL data store) to run
    the relevant query against the data store.
</p>

<p>
    The example demonstrates the following:
</p>
<ul class="content">
    <li>
        Columns <code>Athlete, Age, Country, Year</code> and <code>Sport</code> all have <code>enableRowGroup=true</code>
        which means they can be grouped on. To group you drag the columns to the row group panel section.
        By default the example is grouping by <code>Country</code> and then <code>Year</code> as these columns have
        <code>rowGroup=true</code>.
    </li>
    <li>
        Columns <code>Gold, Silver</code> and <code>Bronze</code> all have <code>enableValue=true</code> which means
        they can be aggregated on. To aggregate you drag the column to the <code>Values</code> section.
        When you are grouping, then all columns in the <code>Values</code> section will be aggregated.
    </li>
    <li>
        You can turn the grid into <strong>Pivot Mode</strong>. To do this, you click the pivot mode checkbox.
        When the grid is in pivot mode, the grid behaves similar to an Excel grid. This extra information
        is passed to your server as part of the request and it is your servers responsibility to return
        the data in the correct structure.
    </li>
    <li>
        Columns <strong>Athlete, Age, Country, Year</strong> and <strong>Sport</strong> all have <code>enablePivot=true</code> which means
        they can be pivoted on when <strong>Pivot Mode</strong> is active. To pivot you drag the column to the <strong>Pivot</strong>
        section.
    </li>
    <li>
        Note that when you pivot, it is not possible to drill all the way down the leaf levels.
    </li>
    <li>
        In addition to grouping, aggregation and pivot, the example also demonstrates filtering.
        The columns <b>Country</b> and <b>Year</b> have grid provided filters. The column <b>Age</b>
        has an example provided custom filter. You can use whatever filter you want, as long as
        your server-side knows what to do with it.
    </li>
</ul>

<?= grid_example('Slice And Dice', 'slice-and-dice', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

<h2>Pivoting Challenges</h2>

<p>
    Achieving pivot on the server-side is difficult. If you manage to implement it, you deserve lots of credit from
    your team and possibly a few hugs (disclaimer, we are not responsible for any inappropriate hugs you try). Here
    are some quick references on how you can achieve pivot in different relational databases:
    All databases will either implement pivot (like Oracle) or require you to fake it (like MySQL).
</p>
    <ul class="content">
        <li>Oracle: Oracle has native support for filtering which they call
            <a href="http://www.oracle.com/technetwork/articles/sql/11g-pivot-097235.html">pivot feature</a>.
        </li>
        <li>
            MySQL: MySQL does not support pivot, however it is possible to achieve by building SQL using
            inner select statements. See the following on Stack Overflow:
            <a href="https://stackoverflow.com/questions/7674786/mysql-pivot-table">MySQL Pivot Table</a> and
            <a href="https://stackoverflow.com/questions/12598120/mysql-pivot-table-query-with-dynamic-columns">
                MySQL Pivot Table Query with Dynamic Columns
            </a>.
        </li>
    </ul>

<p>
    To understand <a href="../javascript-grid-pivoting/#pivot-mode">Pivot Mode</a> and
    <a href="../javascript-grid-pivoting/#secondary-columns">Secondary Columns</a> please refer to
    the relevant sections on <a href="../javascript-grid-pivoting/">Pivoting in Client-side Row Model</a>.
    The concepts mean the same in both Client-side Row Model and the Server-side Row Model.
</p>

<p>
    Secondary columns are the columns that are created as part of the pivot function. You must provide
    these to the grid in order for the grid to display the correct columns for the active pivot function.
    For example, if you pivot on <code>Year</code>, you need to tell the grid to create columns for
    <code>2000, 2002, 2004, 2006, 2008, 2010</code> and <code>2012</code>.
</p>

<p>
    Secondary columns are defined identically to primary columns, you provide a list of
    <a href="../javascript-grid-column-definitions/">Column Definitions</a> to the grid. The columns are set
    by calling <code>columnApi.setSecondaryColumns()</code> and passing a list of columns and / or column
    groups. There is no limit or restriction as to the number of columns or groups you pass - the only
    thing you should ensure is that the field (or value getter) that you set for the columns matches.
</p>

<p>
    If you do pass in secondary columns with the server response, be aware that setting secondary columns
    will reset all secondary column state. For example if resize or reorder the columns, then setting the
    secondary columns again will reset this. In the example above, a hash function is applied to the secondary
    columns to check if they are the same as the last time the server was asked to process a request. This
    is the examples way to make sure the secondary columns are only set into the grid when they have actually
    changed.
</p>

<p>
    If you do not want pivot in your Server-side Row Model grid, then you can remove it from the tool
    panel by setting <code>toolPanelSuppressPivotMode=true</code> and
    <code>toolPanelSuppressValues=true</code>.
</p>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about <a href="../javascript-grid-server-side-model-pagination/">Server-side Pagination</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
