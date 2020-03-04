<?php
$pageTitle = "ag-Grid Row Models: The Server-side Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Sever-side Filtering </h1>

<p class="lead">
    This section covers Server-side Filtering using the Server-side Row Model.
</p>


<h2>Enabling Filtering</h2>

<p>
    Filtering is enabled in the grid via the <code>filter</code> column definition attribute. Some example column
    definitions with filtering enabled are shown below:
</p>

<snippet>
columnDefs: [
    // sets the 'number' filter
    {field: "country", filter: "agNumberColumnFilter"},

    // use the default 'set' filter
    {field: "year", filter: true},

    // no filter (unspecified)
    {field: "sport"}
]
</snippet>

<p>
    For more details on filtering configurations see the section on <a href="../javascript-grid-filtering/">Column Filtering</a>.
</p>

<h2>Filtering on the Server</h2>

<p>
    The actual filtering of rows is performed on the server when using the Server-side Row Model. When a filter is applied
    in the grid a request is made for more rows via <code>getRows(params)</code> on the
    <a href="../javascript-grid-server-side-model-datasource/#datasource-interface">Server-side Datasource</a>. The
    supplied params includes a request containing filter metadata contained in the <code>filterModel</code> property.
</p>

<p>
    An example of the contents contained in the <code>filterModel</code> is shown below:
</p>

<snippet>
{
    filterModel: {
        athlete: {
            filterType: "text",
            type: "contains",
            filter: "fred"
        },
        year: {
            filterType: "number",
            type: "greaterThan",
            filter: 2005,
            filterTo: null
        }
    }
}
</snippet>

<p>
    Notice in the snippet above that the <code>filterModel</code> object contains a 'text' and 'number' filter. This filter
    metadata can be used by the server to perform the actual filtering.
</p>
<p>
    For more details on properties and values used in these filters see the section on
    <a href="../javascript-grid-filter-provided-simple/">Simple Column Filters</a>.
</p>

<h2>Example - Simple Column Filters</h2>

<p>
    The example below demonstrates server-side filtering using
    <a href="../javascript-grid-filter-provided-simple/">Simple Column Filters</a>. Notice the following:
</p>

<ul class="content">
    <li>
        <b>Athlete</b> column has a 'text' filter defined using: <code>filter: "agTextColumnFilter"</code>.
    </li>
    <li>
        <b>Year</b> column has a 'number' filter defined using: <code>filter: "agNumberColumnFilter"</code>.
    </li>
    <li>
        The server uses the metadata contained in the <code>filterModel</code> to filter the rows.
    </li>
    <li>
        Open the browsers dev console to view the <code>filterModel</code> supplied in the request to the datasource.
    </li>
</ul>

<?= grid_example('Simple Column Filters', 'simple-column-filters', 'generated', array("enterprise" => 1, "processVue" => true, "extras" => array('alasql'))) ?>

<h2>Filtering with the Set Filter</h2>

<p>
    The <a href="../javascript-grid-filter-set/">Set Filter</a> is the default filter used if <code>filter: true</code>

    entries in the <code>filterModel</code>
    have a different format to the <a href="../javascript-grid-filter-provided-simple/">Simple Column Filters</a>.
</p>

<p>
    An example of the contents contained in the <code>filterModel</code> for the Set Filter is shown below:
</p>

<snippet>
{
    filterModel: {
        country: {
            filterType: "set",
            values: ["Australia", "Belgium"]
        }
    }
}
</snippet>

<p>The snippet above shows the <code>filterModel</code> for a single column with a Set Filter where two items are selected.</p>

<p>When using the Server-side Row Model it is necessary to supply the values as the grid does not have all rows loaded.
   This can be done either synchronously or asynchronously using the <code>values</code> filter param as shown below:
</p>

<snippet>
// colDef with Set Filter values supplied synchronously
{
    field: 'country',
    filter: 'agSetColumnFilter',
    filterParams: {
        values: ['Australia', 'China', 'Sweden']
    }
}

// colDef with Set Filter values supplied asynchronously
{
    field: 'country',
    filter: 'agSetColumnFilter',
    filterParams: {
        values: (params) => {
            // simulating async delay
            setTimeout(() => {
                params.success(['Australia', 'China', 'Sweden'])
            }, 500);
        }
    }
}
</snippet>

<p>
    For more details on setting values refer to the <a href="../javascript-grid-filter-set/">Set Filter</a> documentation.
</p>

<h2>Example - Set Filter</h2>

<p>
    The example below demonstrates server-side filtering using the Set Filter. Notice the following:
</p>

<ul class="content">
    <li>
        <b>Country</b> column has a Set Filter defined using: <code>filter: "agSetColumnFilter"</code>.
    </li>
    <li>
        Set Filter values are fetched asynchronously and supplied via the <code>params.success(values)</code> callback.
    </li>
    <li>
        The server uses the metadata contained in the <code>filterModel</code> to filter the rows.
    </li>
    <li>
        Open the browsers dev console to view the <code>filterModel</code> supplied in the request to the datasource.
    </li>
</ul>

<?= grid_example('Set Filter', 'set-filter', 'generated', array("enterprise" => 1, "processVue" => true, "extras" => array('alasql'))) ?>

<!--<h2>Set Filter with Complex Object</h2>-->
<!---->
<?//= grid_example('Set Filter with Complex Object', 'set-filter-complex-object', 'generated', array("enterprise" => 1, "processVue" => true, "extras" => array('alasql'))) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about
    <a href="../javascript-grid-server-side-model-grouping/">Server-side Row Grouping</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
