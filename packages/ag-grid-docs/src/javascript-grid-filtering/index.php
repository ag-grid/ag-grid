<?php
$pageTitle = "Column Filter: Core Feature of our Datagrid";
$pageDescription = "Filtering: appears in the column menu. The grid comes with filters out of the box: text, number, date and set filters. You can also create your own custom filter. Core feature of ag-Grid supporting Angular, React, Javascript and many more.";
$pageKeyboards = "ag-Grid Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Column Filter</h1>

    <p class="lead">
        Column filters are filters that are applied to the data at the column level. Many column filters can
        be active (eg filters set on different columns) and the grid will display rows that pass each
        column's filter.
    </p>

    <p>
        Column filters are access in the grid UI either in the
        <a href="../javascript-grid-column-menu/">Column Menu</a> or the
        <a href="../javascript-grid-tool-panel/">Tool Panel</a>.
    </p>

    <p style="display: flex; text-align: center; margin-top: 20px; margin-bottom: 40px;">
        <span style="flex: 1">
            <b>Access via Column Menu</b><br/>
            <img src="./openColumn.gif" style="border: 1px solid darkgray;"/>
        </span>
        <span style="flex: 1">
            <b>Access via Tool Panel</b><br/>
            <img src="./openToolPanel.gif" style="border: 1px solid darkgray;"/>
        </span>
    </p>

    <p>
        You can use the <a href="../javascript-grid-filter-provided/">Provided Filters</a> that come with the grid,
        or you can build your own <a href="../javascript-grid-filter-component/">Filter Components</a> if you want
        to customise the filter experience to your application.
    </p>

    <h2>Example Simple Filters</h2>

    <p>
        The example below demonstrates simple filters. The following can be noted:
    </p>

    <ul>
        <li>
            Column <b>Athlete</b> has a simple text filter.
        </li>
        <li>
            Column <b>Age</b> has a simple number filter.
        </li>
        <li>
            Column <b>Date</b> has a simple date filter.
        </li>
    </ul>

    <?= example('Provided Simple', 'provided-simple', 'generated', array("processVue" => true)) ?>

    <h2>Configuring Filters to Columns</h2>

    <p>
        Set filtering on a column using the column definition property <code>filter</code>. The property can have
        one of the following values:
        <ul>
            <li>boolean: Set to 'true' to enable the default filter. the default is Text Filter for ag-Grid
                Community and Set Filter for ag-Grid Enterprise</li>
            <li>string / component: Provide a specific filter to use over the default filter.</li>
        </ul>
    </p>

    <p>
        Below shows some column definitions with filters set:
    </p>

<snippet>
columnDefs: [

    // sets the text filter
    {field: "athlete", filter: "agTextColumnFilter"},

    // sets the number filter
    {field: "age",     filter: "agNumberColumnFilter"},

    // use the default filter
    {field: "gold",    filter: true},

    // use no filter (leaving unspecified means use no filter)
    {field: "sport"}
]</snippet>

    <p>
        If you want to enable filters on all columns then set a filter on the
        <a href="../javascript-grid-column-definitions/#default-column-definitions">Default Column Definition</a>.
        The following code snippet shows setting <code>filter=true</code> for all columns via the
        <code>defaultColDef</code> and then setting <code>filter=false</code> for the Sport column, so all
        columns have a filter except Sport.
    </p>

<snippet>
gridOptions = {
    ...

    // anything specified in defaultColDef gets applied on all columns
    defaultColDef: {
        filter: true // set filtering on for all cols
    },

    // then define individual column definitions
    columnDefs: [
        // filter not specified, defaultColDef setting is used
        {field: "athlete"},
        {field: "age"},

        // filter specifically set to 'false'
        {field: "sport", filter: false} // use no filter
    ]
}</snippet>

    <h2>Filter Parameters</h2>

    <p>
        Each filter can take additional filter parameters by setting <code>colDef.filterParams</code>.
        What parameters each filter type takes is specific to each filter. The parameters for the provided
        filters are explained in their relevant sections.
    </p>

    <p>
        Below shows configuring the text filter on an Athlete column and providing extra filter parameters
        (what <code>clearButton</code> and <code>applyButton</code> do are explained later).
    </p>

    <snippet>
columnDefinition = {

    field: 'athlete'

    // set the column to use text filter
    filter: 'agTextColumnFilter',

    // pass in additional parameters to the text filter
    filterParams: {
        clearButton: true,
        applyButton: true,
        debounceMs: 200
    }
}</snippet>






    <h2>Filter Events</h2>

    <p>
        Filtering results in the following events getting emitted:
    </p>

    <ul>
        <li><b>Filter Changed:</b> Filter has changed and applied by the grid.</li>
        <li><b>Filter Modified:</b> Filter UI has changed but not necessarily applied.
            This is useful when using an apply button and you want to know if the filter
            changed but not applied.
        </li>
    </ul>

    <h2>Filtering Animation</h2>

    <p>
        To enable animation of the rows after filtering, set grid property <code>animateRows=true</code>.
    </p>


    <h2>Relation to Quick Filter and External Filter</h2>

    <p>
        Column filters work independent to <a href="../javascript-grid-filter-quick/">Quick Filter</a>
        and <a href="../javascript-grid-filter-external/">External Filter</a>. If a quick filter and
        / or external filter are applied along with a column filter, then each filter type is considered
        and the row will only pass if it passes all three types.
    </p>

    <p>
        Column filters are tied to a column. Quick filter and external filter
        are not tied to a column. This section of the documentation talks about column filters only.
        For quick filter and external filter, see the relevant sections of the documentation.
    </p>


    <h2>Provided Filters</h2>

    <p>
        There are four provided filters that come with the grid. The provided filters are as follows:
    </p>

    <table class="table reference">
        <tr>
            <th>Filter</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>agNumberColumnFilter</th>
            <td>A Number Filter for number comparisons.</td>
        </tr>
        <tr>
            <th>agTextColumnFilter</th>
            <td>A Text Filter for string comparisons.</td>
        </tr>
        <tr>
            <th>agDateColumnFilter</th>
            <td>A Date Filter for date comparisons.</td>
        </tr>
        <tr>
            <th>agSetColumnFilter</th>
            <td>A Set Filter, influenced by how filters work in
                Microsoft Excel. This is an ag-Grid-Enterprise
                feature.</td>
        </tr>
    </table>

    <p>
        The section <a href="../javascript-grid-filter-provided/">Provided Filters</a> for details on using them.
    </p>

<?php include '../documentation-main/documentation_footer.php';?>
