<?php
$pageTitle = "Server-Side Row Model - Pivoting";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-Side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-Side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Server-Side Pivoting </h1>

<p class="lead">
    In this section we add Server-Side Pivoting to create an example with the ability to 'Slice and Dice' data using
    the Server-Side Row model.
</p>

<h2>Enabling Pivoting</h2>

<p>
    To pivot on a column <code>pivot=true</code> should be set on the column definition. Additionally the needs
    to be in pivot mode which is set through the grid option <code>pivotMode=true</code>.
</p>

<p> In the snippet below a pivot is defined on the 'year' column and pivot mode is enabled:</p>

<snippet>
gridOptions: {
    // pivot mode enabled
    pivotMode: true,

    columnDefs: [
        { field: "country", rowGroup: true },
        { field: "year", pivot: true }, // pivot enabled
        { field: "total" }
    ],

    // other options
}
</snippet>

<p>
    For more configuration details see the section on <a href="../javascript-grid-pivoting">Pivoting</a>.
</p>

<h2>Pivoting on the Server</h2>

<p>
    The actual pivoting is performed on the server when using the Server-Side Row Model. When the grid needs more
    rows it makes a request via <code>getRows(params)</code> on the
    <a href="../javascript-grid-server-side-model-datasource/#datasource-interface">Server-Side Datasource</a> with
    metadata containing row grouping details.
</p>

<p>
    The properties relevant to pivoting in the request are shown below:
</p>

<snippet>
// IServerSideGetRowsRequest
{
   // pivot columns, cols with 'pivot=true'
   pivotCols: ColumnVO[];

    // true if pivot mode is one, otherwise false
   pivotMode: boolean;

   ... // other properties
}
</snippet>

<p>
    Note in the snippet above that <code>pivotCols</code> contains all the columns the grid is pivoting on,
    and <code>pivotMode</code> is used to determine if pivoting is currently enabled in the grid.
</p>

<h2>Setting Secondary Columns</h2>

<p>
    Secondary columns are the columns that are created as part of the pivot function. You must provide
    these to the grid in order for the grid to display the correct columns for the active pivot function.
</p>

<p>
    For example, if you pivot on <code>Year</code>, you need to columns to the grid for each year contained in the
    data, e.g. <code>2000, 2002, 2004 etc...</code>
</p>

<p>
    Secondary columns are defined identically to primary columns, you provide a list of
    <a href="../javascript-grid-column-definitions/">Column Definitions</a> passing a list of columns and / or column
    groups using the following column api method:
</p>

<snippet>
columnApi.setSecondaryColumns(pivotColDefs);
</snippet>

<p>
    There is no limit or restriction as to the number of columns or groups you pass. However it's important that the
    field (or value getter) that you set for the columns match.
</p>

<note>
    Setting secondary columns will reset all secondary column state which means resized or reordered columns will be
    reset. To avoid this applications should keep track of the previously supplied secondary columns and only update the
    secondary columns in the grid if they have changed.
</note>


<h2>Example: Simple Pivot </h2>

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

<?= grid_example('Simple Pivot', 'simple-pivot', 'generated', ['enterprise' => true, 'exampleHeight' => 605, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping', 'menu', 'columnpanel']]) ?>

<h2>Example: Pivot Column Groups </h2>

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

<?= grid_example('Pivot Column Groups', 'pivot-column-groups', 'generated', ['enterprise' => true, 'exampleHeight' => 610, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping', 'menu', 'columnpanel']]) ?>

<h2>Example: Slice and Dice</h2>
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

<?= grid_example('Slice And Dice', 'slice-and-dice', 'generated', ['enterprise' => true, 'exampleHeight' => 605, 'modules' => ['serverside', 'rowgrouping', 'menu', 'columnpanel']]) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about <a href="../javascript-grid-server-side-model-pagination/">Server-Side Pagination</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
