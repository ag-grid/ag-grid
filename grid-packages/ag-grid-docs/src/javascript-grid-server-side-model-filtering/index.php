<?php
$pageTitle = "Server-Side Row Model - Filtering";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-Side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-Side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">SSRM Filtering</h1>

<p class="lead">
    This section covers Filtering using the Server-Side Row Model (SSRM).
</p>

<h2>Enabling Filtering</h2>

<p>
    Filtering is enabled in the grid via the <code>filter</code> column definition attribute. Some example column
    definitions with filtering enabled are shown below:
</p>

<?= createSnippet(<<<SNIPPET
gridOptions: {
    columnDefs: [
        // sets the 'text' filter
        { field: 'country', filter: 'agTextColumnFilter' },

        // use the default 'set' filter
        { field: 'year', filter: true },

        // no filter (unspecified)
        { field: 'sport' }
    ],

    // other options
}
SNIPPET
) ?>

<p>
    For more details on filtering configurations see the section on <a href="../javascript-grid-filtering/">Column Filtering</a>.
</p>

<h2>Infinite Store - Simple Filtering</h2>

<p>
    When using the Infinite Store, filtering of rows is performed on the server.
    When a filter is applied
    in the grid a request is made for more rows via the
    <a href="../javascript-grid-server-side-model-datasource/">Datasource</a>.
    The provided request contains filter metadata in the <code>filterModel</code> property.
</p>

<p>
    An example of the contents contained in the <code>filterModel</code> is shown below:
</p>

<?= createSnippet(<<<SNIPPET
// Example request with filter info
{
    filterModel: {
        athlete: {
            filterType: 'text',
            type: 'contains',
            filter: 'fred'
        },
        year: {
            filterType: 'number',
            type: 'greaterThan',
            filter: 2005,
            filterTo: null
        }
    },

    // other properties
}
SNIPPET
) ?>

<p>
    Notice in the snippet above that the <code>filterModel</code> object contains a
    <code>'text'</code> and <code>'number'</code> filter. This filter metadata can be
    used by the server to perform the actual filtering.
</p>

<p>
    For more details on properties and values used in these filters see the section on
    <a href="../javascript-grid-filter-provided-simple/">Simple Column Filters</a>.
</p>

<p>
    The example below demonstrates filtering using
    <a href="../javascript-grid-filter-provided-simple/">Simple Column Filters</a>
    and the Infinite Store. Notice the following:
</p>

<ul class="content">
    <li>
        The <b>Athlete</b> column has a <code>'text'</code> filter defined using <code>filter: 'agTextColumnFilter'</code>.
    </li>
    <li>
        The <b>Year</b> column has a <code>'number'</code> filter defined using <code>filter: 'agNumberColumnFilter'</code>.
    </li>
    <li>
        The medals columns have a <code>'number'</code> filter defined using <code>filter: 'agNumberColumnFilter'</code>
        on the <code>'number'</code> column type.
    </li>
    <li>
        The server uses the metadata contained in the <code>filterModel</code> to filter the rows.
    </li>
    <li>
        Open the browser's dev console to view the <code>filterModel</code> supplied in the request to the datasource.
    </li>
</ul>

<?= grid_example('Infinite Simple', 'infinite-simple', 'generated', ['enterprise' => true, 'extras' => ['alasql'], 'modules' => ['serverside', 'menu']]) ?>

<h2>Infinite Store - Set Filtering</h2>

<p>
    Filtering using the <a href="../javascript-grid-set-filtering/">Set Filter</a> has a few
    difference to filtering wih the simple filters.
</p>
<p>
    Entries in the <code>filterModel</code> have a different format to the Simple Filters.
    The following shows an example of a set filter where two items are selected:
</p>

<?= createSnippet(<<<SNIPPET
// IServerSideGetRowsRequest
{
    filterModel: {
        country: {
            filterType: 'set',
            values: ['Australia', 'Belgium']
        }
    },

    // other properties
}
SNIPPET
) ?>

<p>
    When using the Server-Side Row Model it is necessary to supply the values as the grid does not have all rows loaded.
    This can be done either synchronously or asynchronously using the <code>values</code> filter param as shown below:
</p>

<?= createSnippet(<<<SNIPPET
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
        values: function(params) {
            // simulating async delay
            setTimeout(function() {
                params.success(['Australia', 'China', 'Sweden']);
            }, 500);
        }
    }
}
SNIPPET
) ?>

<p>
    For more details on setting values, see
    <a href="../javascript-grid-filter-set-filter-list/#supplying-filter-values">Supplying Filter Values</a>.
    Once you have supplied values to the Set Filter, they will not change unless you ask for them to be refreshed;
    see <a href="../javascript-grid-filter-set-filter-list/#refreshing-values">Refreshing Values</a>
    for more information.
</p>

<p>
    The example below demonstrates server-side filtering using the Set Filter and the Infinite Row Store.
    Note the following:
</p>

<ul class="content">
    <li>
        The <b>Country</b> and <b>Sport</b> columns have Set Filters defined using <code>filter: 'agSetColumnFilter'</code>.
    </li>
    <li>
        Set Filter values are fetched asynchronously and supplied via the <code>params.success(values)</code> callback.
    </li>
    <li>
        The filter for the <b>Sport</b> column only shows the values which are available for the selected countries.
        When the filter for the <b>Country</b> column is changed, the values for the <b>Sport</b> filter are updated.
    </li>
    <li>
        The server uses the metadata contained in the <code>filterModel</code> to filter the rows.
    </li>
    <li>
        Open the browser's dev console to view the <code>filterModel</code> supplied in the request to the datasource.
    </li>
</ul>

<?= grid_example('Infinite Set', 'infinite-set', 'generated', ['enterprise' => true, 'extras' => ['alasql'], 'modules' => ['serverside', 'setfilter', 'menu']]) ?>

<!--<h2>Set Filter with Complex Object</h2>-->
<!---->
<?//= grid_example('Set Filter with Complex Object', 'set-filter-complex-object', 'generated', ['enterprise' => true, 'extras' => ['alasql']]) ?>

<h2>In-Memory Store Filtering</h2>

<p>
    When using the In Memory Store, filtering of rows is performed by the grid. There is nothing
    special to be done by the server.
</p>

<p>
    The example below demonstrates the In Memory Store filtering. Note the following:
</p>

<ul class="content">
    <li>The grid is using the In Memory Store by setting the grid property <code>serverSideStoreType = inMemory</code>.</li>
    <li>Columns are set up with the following filters:
        <ul>
            <li>Athlete column has Text Filter.</li>
            <li>County column has Set Filter.</li>
            <li>Year column has Number Filter.</li>
        </ul>
    </li>
    <li>Rows are loaded once. All filtering is then subsequently done by the grid.</li>
</ul>

<?= grid_example('In Memory Filtering', 'in-memory', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>

<p>
    Note that the Set Filter is provided values in both the Infinite and In-Memory Row Stores.
    Values are required for the Set Filter when used in the SSRM regardless of which row store is used.
</p>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about
    <a href="../javascript-grid-server-side-model-grouping/">Row Grouping</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
