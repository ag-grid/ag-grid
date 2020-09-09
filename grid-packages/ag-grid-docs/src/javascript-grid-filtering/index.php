<?php
$pageTitle = "Column Filter: Core Feature of our Datagrid";
$pageDescription = "Filtering: appears in the column menu. The grid comes with filters out of the box: text, number, date and set filters. You can also create your own custom filter. Core feature of ag-Grid supporting Angular, React, Javascript and many more.";
$pageKeywords = "ag-Grid Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Column Filter</h1>

<p class="lead">
    Column filters are filters that are applied to the data at the column level. Many column filters can
    be active at once (e.g. filters set on different columns) and the grid will display rows that pass every
    column's filter.
</p>

<p>
    Column filters are accessed in the grid UI either through the
    <a href="../javascript-grid-column-menu/">Column Menu</a> or the
    <a href="../javascript-grid-tool-panel/">Tool Panel</a>.
</p>

<div style="display: flex; text-align: center; margin-top: 20px; margin-bottom: 40px;">
    <span style="flex: 1">
        <b>Access via Column Menu</b><br/>
        <img src="./openColumn.gif" style="border: 1px solid darkgray;"/>
    </span>
    <span style="flex: 1">
        <b>Access via Tool Panel</b><br/>
        <img src="./openToolPanel.gif" style="border: 1px solid darkgray;"/>
    </span>
</div>

<p>
    You can use the <a href="../javascript-grid-filter-provided/">Provided Filters</a> that come with the grid,
    or you can build your own <a href="../javascript-grid-filter-component/">Filter Components</a> if you want
    to customise the filter experience to your application.
</p>

<h3>Example: Simple Filters</h3>

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

<?= grid_example('Provided Simple', 'provided-simple', 'generated', ['exampleHeight' => 560, 'modules' => true, 'reactFunctional' => true]) ?>

<h2>Configuring Filters on Columns</h2>

<p>
    Set filtering on a column using the column definition property <code>filter</code>. The property can have
    one of the following values:

    <ul>
        <li><code>boolean</code>: Set to <code>true</code> to enable the default filter. The default is
        <a href="../javascript-grid-filter-text/">Text Filter</a> for ag-Grid Community and
        <a href="../javascript-grid-filter-set/">Set Filter</a> for ag-Grid Enterprise.</li>
        <li><code>string</code> / <code>Component</code>: Provide a specific filter to use instead of the default filter.</li>
    </ul>
</p>

<p>
    The code below shows some column definitions with filters set:
</p>

<?= createSnippet(<<<SNIPPET
columnDefs: [
    // sets the text filter
    { field: 'athlete', filter: 'agTextColumnFilter' },

    // sets the number filter
    { field: 'age',     filter: 'agNumberColumnFilter' },

    // use the default filter
    { field: 'gold',    filter: true },

    // use no filter (leaving unspecified means use no filter)
    { field: 'sport' }
]
SNIPPET
) ?>

<p>
    If you want to enable filters on all columns, you should set a filter on the
    <a href="../javascript-grid-column-definitions/#default-column-definitions">Default Column Definition</a>.
    The following code snippet shows setting <code>filter=true</code> for all columns via the
    <code>defaultColDef</code> and then setting <code>filter=false</code> for the Sport column, so all
    columns have a filter except Sport.
</p>

<?= createSnippet(<<<SNIPPET
gridOptions = {
    ...
    // anything specified in defaultColDef gets applied to all columns
    defaultColDef: {
        filter: true // set filtering on for all columns
    },

    // then set individual column definitions
    columnDefs: [
        // filter not specified, defaultColDef setting is used
        { field: 'athlete' },
        { field: 'age' },

        // filter specifically set to 'false'
        { field: 'sport', filter: false } // use no filter
    ]
}
SNIPPET
) ?>

<h2>Filter Parameters</h2>

<p>
    Each filter can take additional filter parameters by setting <code>colDef.filterParams</code>.
    The parameters each filter type accepts are specific to each filter; parameters for the provided
    filters are explained in their relevant sections.
</p>

<p>
    The code below shows configuring the text filter on the Athlete column and providing extra filter parameters
    (what the <code>buttons</code> do is explained in
    <a href="../javascript-grid-filter-provided/#apply-clear-reset-and-cancel-buttons">Apply, Clear, Reset and Cancel Buttons</a>).
</p>

<?= createSnippet(<<<SNIPPET
columnDefinition = {
    field: 'athlete'

    // set the column to use text filter
    filter: 'agTextColumnFilter',

    // pass in additional parameters to the text filter
    filterParams: {
        buttons: ['reset', 'apply'],
        debounceMs: 200
    }
}
SNIPPET
) ?>

<h2>Filter Events</h2>

<p>
    Filtering causes the following events to be emitted:
</p>

<ul>
    <li><b>Filter Changed:</b> Filter has changed and been applied by the grid.</li>
    <li><b>Filter Modified:</b> Filter UI has changed but not necessarily applied.
        This is useful when using an apply button if you want to know if the filter
        changed but was not applied.
    </li>
</ul>

<h2>Filtering Animation</h2>

<p>
    To enable animation of the rows when filtering, set the grid property <code>animateRows=true</code>.
</p>

<h2>Relation to Quick Filter and External Filter</h2>

<p>
    Column filters work independently of <a href="../javascript-grid-filter-quick/">Quick Filter</a>
    and <a href="../javascript-grid-filter-external/">External Filter</a>. If a quick filter and
    / or external filter are applied along with a column filter, each filter type is considered
    and the row will only show if it passes all three types.
</p>

<p>
    Column filters are tied to a specific column. Quick filter and external filter
    are not tied to any particular column. This section of the documentation talks about column filters only.
    For quick filter and external filter, click the links above to learn more.
</p>

<h2>Provided Filters</h2>

<p>
    There are four filters that are provided by the grid. These are as follows:
</p>

<?php createDocumentationFromFile('filtering.json', 'providedFilters') ?>

<p>
    See the <a href="../javascript-grid-filter-provided/">Provided Filters</a> section for more details on using them.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
