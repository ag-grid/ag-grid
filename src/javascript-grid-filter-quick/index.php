<?php
$pageTitle = "Quick Filter: Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Quick Filter. Quick Filter filters all columns simultaneously with a simple text search, just like how you filter your Gmail. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Quick Filter";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Quick Filter</h1>

<p>
    In addition to the column specific filtering, a 'quick filter' (influenced by how filtering is done in Google
    GMail) can also be applied. Set the quick filter by using the Grid's API:
</p>

    <snippet>
api.setQuickFilter('new filter text');</snippet>

    <p>If you are using a framework such as Angular or React, you can set bind the quick filter text to the
        <code>quickFilter</code> attribute.
    </p>

<p>
    The quick filter text will check all words provided against the full row. For example if the text provided
    is "Tony Ireland", the quick filter will bring back allow rows with both "Tony" AND "Ireland" in them.
</p>

<h2>Overriding the Quick Filter Value</h2>

<p>
    If your data contains complex objects, then the quick filter will end up with [object,object] inside it
    instead of searchable string values. Or maybe you want to format string values for searching (eg take out
    accent characters, or take out commas from numbers). If you want to do this, then provide a <code>getQuickFilterText</code>
    to the column definition, eg:
</p>

<snippet>
colDef = {
    headerName: "D", field: "d",
    getQuickFilterText: function(params) {
        return params.value.name;
    }
}</snippet>

<p>Params contains {value, node, data, column, colDef}.</p>

<note>
    You only need to override the quick filter value if you have a problem. If you don't have a quick filter
    problem, you don't need to use it, quick filter will work 'out of the box' in most cases.
</note>

<h2>Quick Filter Cache</h2>

<p>
    By default, the quick filter checks each columns value, including running it's value getters
    if present, each time the quick filter is executed. If your data set is large, you may wish
    to enable the quick filter cache by setting <code>cacheQuickFilter=true</code>.
</p>

<p>
    When the cache is enabled, each node gets a 'quick filter text' attached to it by
    concatenating all the values for each column. For example, a {Employee Name, Job} table could have a
    row with quick filter text of 'NIALL CROSBY\nCOFFEE MAKER'.
    The grid then does a simple string search, so if you search for 'Niall', it will find our example text.
    Joining all the columns values into one string gives a huge performance boost. The values
    are joined after the quick filter is requested for the first time and stored in the rowNode - the original
    data that you provide is not changed.
</p>

<h2>Reset Cache Text</h2>

<p>Quick filter cache text can be reset in any of the following ways: </p>

<ul class="content">
    <li>Each rowNode has a <code>resetQuickFilterAggregateText</code> method on it - call this to reset the quick filter</li>
    <li><code>rowNode.setDataValue(colKey, newValue)</code> will also reset the quick filter</li>
    <li>Lastly, if using the grid editing features, when you update a cell, the quick filter will get reset.</li>
</ul>

<p>
    If you are not using the cache setting, then you can ignore all this.
</p>

<h2>Quick Filter Example</h2>

<p>
    The example below shows the quick filter working on different data types. Each column demonstrates something
    different as follows:
</p>

<ul class="content">
    <li>A - Simple column, nothing complex.</li>
    <li>B - Complex object with 'dot' in field, quick filter works fine.</li>
    <li>C - Complex object and value getter used, again quick filter works fine.</li>
    <li>D - Complex object, quick filter would call 'toString' on the complex object, so getQuickFilterText is provided.</li>
    <li>E - Complex object, not getQuickFilterText provided, so the quick filter text ends up with '[object,object]' for this column.</li>
</ul>

    <p>
        The example also demonstrates using the quick filter cache vs not using the quick filter cache.
        The grid works very fast even when the cache is turned off - so you probably don't need it.
        However for those with very large data sets (eg over 10,000 rows), turning the cache on will
        improve quick filter speed. The cache is demonstrated as follows:
    </p>

    <ul class="content">
        <li>
            <b>Normal Quick Filter:</b> The cache is not used. Value getters are executed on each node each
            time the filter is executed. Hitting 'Print Quick Filter Texts' will always return back 'undefined'
            for every row because the cache is not used.
        </li>
        <li>
            <b>Cache Quick Filter:</b> The cache is used. Value getters are executed first time the quick
            filter is run. Hitting 'Print Quick Filter Texts' will return back the quick filter text for each
            row which will initially be undefined and then set the the quick filter text after the quick filter
            is executed for the first time. You will notice the quick filter text is correct
            for each column except E (which would be fixed by adding an appropriate getQuickFilterText method like D does).
        </li>
    </ul>

<?= example('Quick Filter', 'quick-filter', 'vanilla') ?>

<h2>Server Side Data</h2>

<p>
    Quick Filters only make sense with client side data (i.e. when using the In Memory row model).
    For the other row models (<a href="../javascript-grid-pagination/">pagination</a>,
    <a href="../javascript-grid-virtual-paging/">infinite scrolling</a> etc) you would need to implement your own server side sorting to
    replicate Quick Filter functionality.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
