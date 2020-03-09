<?php
$pageTitle = "Charts - Bar and Column Series";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Bar and Column Series</h1>

<p class="lead">
    Because bar series are just transposed column series and have the same configuration,
    this section covers both series at once.
</p>

<p>
    Bar series are a good choice to show values for a discrete set of objects, such as
    item categories, specific items, or time periods such as years or quarters.
</p>

<h2>Column Series</h2>

<h3>Regular Columns</h3>

<p>
    To create a column chart, we need to use series type <code>'column'</code>.
    We also have to provide the <code>xKey</code> and at least one <code>yKey</code>.
</p>

<note>
    Since <code>'column'</code> and <code>'bar'</code> series can be stacked or grouped,
    they can have multiple <code>yKeys</code>, with one key for each stack/group component.
</note>

<p>
    A minimal <code>'column'</code> series config would therefore look like this:
</p>

<?= createSnippet(<<<SNIPPET
series: [{
    type: 'column',
    xKey: 'quarter',
    yKeys: ['iphone']
}]
SNIPPET
) ?>

<p>
    In the snippet above we are using the <code>'iphone'</code> as the only <code>yKey</code>,
    to show revenue per quarter for this product alone. Using this simple series config
    produces the following chart:
</p>

<?= chart_example('Regular Column Series', 'regular-column', 'generated'); ?>

<h3>Stacked Columns</h3>

<p>
    If the goal is to show the quarterly revenue for each product category, multiple <code>yKeys</code>
    can be used. To go from a <a href="#regular-columns">regular column chart</a> above
    to a stacked one below, all we do is add some more <code>yKeys</code> like so:
</p>

<?= createSnippet("yKeys: ['iphone', 'mac', 'ipad', 'wearables', 'services']") ?>

<p>
    And that simple change transforms our chart into this:
</p>

<?= chart_example('Stacked Column Series', 'stacked-column', 'generated'); ?>

<p>
    Note that in the example code we also added <code>yNames</code> along with
    <code>yKeys</code> which configure the display names to make sure we have nice looking tooltip headers and
    legend entries.
</p>

<?= createSnippet("yNames: ['iPhone', 'Mac', 'iPad', 'Wearables', 'Services']") ?>

<h3>Grouped Columns</h3>

<p>
    If we want to show quarterly revenue for each product category as grouped columns,
    we can simply take the <a href="#stacked-columns">stacked column</a> config from the example above
    and set the <code>grouped</code> property of the series to <code>true</code>:
</p>

<?= createSnippet('grouped: true') ?>

<p>
    This will produce the following chart:
</p>

<?= chart_example('Grouped Column Series', 'grouped-column', 'generated'); ?>

<h3>Normalized Columns</h3>

<p>
    Going back to our <a href="#stacked-columns">stacked column</a> example,
    if we wanted to normalize the totals so that each column's segments added up to
    a certain value, for example 100%, we could add the following to our series config:
</p>

<?= createSnippet('normalizedTo: 100') ?>

<note>
    It's possible to use any non-zero value to normalize to.
</note>

<?= chart_example('Normalized Column Series', 'normalized-column', 'generated'); ?>

<h3>Column Labels</h3>

<p>
    It's possible to add labels to columns, by adding the following to the series config:
</p>

<?= createSnippet('label: {}') ?>

<p>
    That's it. The config can be empty like that. However, you might want to
    customise your labels. For example, by default the values are rounded to two
    decimal places for the labels, but in the example below
    even that is too much, so we use a label formatter that simply returns the integer
    part of the number:
</p>

<?= createSnippet(<<<SNIPPET
label: {
    formatter: function (params) {
        // if the data contains values that are not valid numbers,
        // the formatter's `value` will be `undefined`
        return params.value === undefined ? '' : params.value.toFixed(0);
    }
}
SNIPPET
) ?>

<p>
    The above formatter produces an attractive chart where the labels
    don't stick out of their columns:
</p>

<?= chart_example('Column Series with Labels', 'labeled-column', 'generated'); ?>

<note>
    It's best to avoid using labels with grouped columns (or bars),
    because columns in grouped mode tend to be narrow and often won't fit
    a label.
</note>

<p>
    To learn more about label configuration please refer to the
    <a href="#barSeriesConfig.barSeriesConfig.label">API reference</a> below.
</p>

<h2>Bar Series</h2>

<p>
    <code>'bar'</code> series configuration is exactly the same as <code>'column'</code>
    series configuration and all the same modes (regular, stacked, grouped, normalized)
    apply to bars just as they do to columns.
</p>

<p>
    To create a bar chart all you need to do is use <code>type: 'bar'</code>
    instead of <code>type: 'column'</code> in the series config and swap the axes
    &mdash; the <code>'category'</code> axis moves from the bottom to the left
    of a chart, and the <code>'number'</code> axis takes its place instead, moving
    from the left to the bottom:
</p>

<?= createSnippet(<<<SNIPPET
axes: [
    {
        type: 'number',
        position: 'bottom'
    },
    {
        type: 'category',
        position: 'left'
    }
]
SNIPPET
) ?>

<p>
    With these simple changes we go from <a href="#stacked-columns">stacked columns</a>
    to stacked bars:
</p>

<?= chart_example('Stacked Bar Series', 'stacked-bar', 'generated'); ?>

<h2>API Reference</h2>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'barSeriesConfig') ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about <a href="../javascript-charts-area-series/">area series</a>.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
