<?php
$pageTitle = "Quick Filter: Core Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Quick Filter, which filters all columns simultaneously with a simple text search, just like how you filter your Gmail. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid Quick Filter";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Quick Filter</h1>

<p>
    In addition to the column specific filtering, a 'quick filter' (influenced by how filtering is done in Google's
    Gmail) can also be applied. Set the quick filter by using the Grid's API:
</p>

<?= createSnippet("api.setQuickFilter('new filter text');") ?>

<p>If you are using a framework such as Angular or React, you can bind the quick filter text to the
    <code>quickFilter</code> attribute.
</p>

<p>
    The quick filter text will check all words provided against the full row. For example if the text provided
    is "Tony Ireland", the quick filter will only include rows with both "Tony" AND "Ireland" in them.
</p>

<h2>Overriding the Quick Filter Value</h2>

<p>
    If your data contains complex objects, the quick filter will end up comparing against <code>[object Object]</code>
    instead of searchable string values. Alternatively, you might want to format string values specifically for searching
    (e.g. replace accented characters in strings, or remove commas from numbers). If you want to do this, provide
    <code>getQuickFilterText</code> to the column definition, e.g.:
</p>

<?= createSnippet(<<<SNIPPET
colDef = {
    headerName: 'D', field: 'd',
    getQuickFilterText: function(params) {
        return params.value.name;
    }
}
SNIPPET
) ?>

<p>The <code>params</code> object contains <code>{ value, node, data, column, colDef, context }</code>.</p>

<note>
    The quick filter will work 'out of the box' in most cases, so you should only override the quick filter value if you
    have a particular problem to resolve.
</note>

<h2>Quick Filter Cache</h2>

<p>
    By default, the quick filter checks each column's value, including running value getters
    if present, every time the quick filter is executed. If your data set is large, you may wish
    to enable the quick filter cache by setting <code>cacheQuickFilter = true</code>.
</p>

<p>
    When the cache is enabled, a 'quick filter text' is generated for each node by
    concatenating all the values for each column. For example, a table with columns of "Employee Name" and "Job" could
    have a row with quick filter text of <code>'NIALL CROSBY\nCOFFEE MAKER'</code>. The grid then performs a simple string
    search, so if you search for <code>'Niall'</code>, it will find our example text. Joining all the column's values
    into one string gives a huge performance boost. The values are joined after the quick filter is requested for the
    first time and stored in the <code>rowNode</code> - the original data that you provide is not changed.
</p>

<h2>Reset Cache Text</h2>

<p>When in use, the quick filter cache text can be reset in any of the following ways:</p>

<ul class="content">
    <li>Each rowNode has a <code>resetQuickFilterAggregateText</code> method on it, which can be called to reset the cache text</li>
    <li><code>rowNode.setDataValue(colKey, newValue)</code> will also reset the cache text</li>
    <li>Lastly, if using the grid editing features, when you update a cell, the cache text will be reset</li>
</ul>

<h2>Example: Quick Filter</h2>

<p>
    The example below shows the quick filter working on different data types. Each column demonstrates something
    different as follows:
</p>

<ul class="content">
    <li>A - Simple column, nothing complex.</li>
    <li>B - Complex object with 'dot' in field, quick filter works fine.</li>
    <li>C - Complex object and value getter used, again quick filter works fine.</li>
    <li>D - Complex object, quick filter would call <code>toString</code> on the complex object, so <code>getQuickFilterText</code> is provided.</li>
    <li>E - Complex object, no <code>getQuickFilterText</code> is provided, so the quick filter text ends up with <code>[object Object]</code> for this column.</li>
</ul>

<p>
    The example also demonstrates having the quick filter cache turned on or off.
    The grid works very fast even when the cache is turned off, so you probably don't need it.
    However, for those with very large data sets (e.g. over 10,000 rows), turning the cache on will
    improve quick filter speed. The cache is demonstrated as follows:
</p>

<ul class="content">
    <li>
        <b>Normal Quick Filter:</b> The cache is not used. Value getters are executed on every node each
        time the filter is executed. Hitting 'Print Quick Filter Texts' will always return <code>undefined</code>
        for every row because the cache is not used.
    </li>
    <li>
        <b>Cache Quick Filter:</b> The cache is used. Value getters are executed the first time the quick
        filter is run. Hitting 'Print Quick Filter Texts' will return back the quick filter text for each
        row which will initially be <code>undefined</code> and then return the quick filter text after the quick filter
        is executed for the first time. You will notice the quick filter text is correct
        for each column except E (which would be fixed by adding an appropriate <code>getQuickFilterText</code> method as we do for D).
    </li>
</ul>

<?= grid_example('Quick Filter', 'quick-filter', 'vanilla', ['exampleHeight' => 580]) ?>

<h2>Server Side Data</h2>

<p>
    Quick Filters only make sense with client side data (i.e. when using
    the <a href="../javascript-grid-client-side-model/">client-side row model</a>).
    For the other row models you would need to implement your own server-side filtering to
    replicate Quick Filter functionality.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
