<?php
$pageTitle = "Charts - Bar and Column Series";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Bar and Column Series</h1>

<p class="lead">
    Because Bar series are just transposed Column series and share the exact same configs,
    this section covers both series at once.
</p>

<p>
    Bar series are a good choice to show values of a discreet set of objects. For example,
    item categories or specific items, time periods such as years or quarters, individuals,
    countries, etc.
</p>

<h2>Column Series</h2>

<h3>Regular Columns</h3>

<p>
    To create a column chart, we need to use series type <code>'column'</code>.
    We also have to provide the <code>xKey</code> and at least one <code>yKey</code>.
</p>

<note>
    Since <code>'column'</code> and <code>'bar'</code> series can be stacked or grouped,
    they can have multiple <code>yKeys</code> &mdash; one key per each stack/group component.
</note>

<p>
    A minimal <code>'column'</code> series config therefore would look like this:
</p>

<snippet language="ts">
series: [{
    type: 'column',
    xKey: 'quarter',
    yKeys: ['iphone']
}]
</snippet>

<p>
    In the snippet above we are using the <code>'iphone'</code> as the only <code>yKey</code>,
    to show revenue per quarter for this product alone. Just using this simple series config
    produces the following chart:
</p>

<?= chart_example('Regular Column Series', 'regular-column', 'generated'); ?>

<p>
    Note that in the code of the example above we also:
    <ul class="content">
        <li>
            Use the <code>yNames: ['iPhone']</code> series config which acts as a display name
            for the actual <code>yKey</code> used. That's what the user will see in column tooltips
            and the legend.
        </li>
        <li>
            Configure the <code>title</code> and <code>subtitle</code> of the chart to communicate
            what kind of data is being presented.
        </li>
    </ul>
</p>

<h3>Stacked Columns</h3>

<p>
    If the goal is to show the quarterly revenue for each product category, multiple <code>yKeys</code>
    can be used. To go from a <a href="#regular-columns">regular column chart</a> above
    to a stacked one below, all we did is added some more <code>yKeys</code> like so:
</p>

<snippet language="ts">
yKeys: ['iphone', 'mac', 'ipad', 'wearables', 'services']
</snippet>

<p>
    And that simple change transformed our chart into this:
</p>

<?= chart_example('Stacked Column Series', 'stacked-column', 'generated'); ?>

<p>
    Note that in the example code we also didn't forget to update <code>yNames</code> along with
    <code>yKeys</code>, to make sure we have nice looking tooltip headers and legend entries.
</p>

<snippet language="ts">
yNames: ['iPhone', 'Mac', 'iPad', 'Wearables', 'Services']
</snippet>

<h3>Grouped Columns</h3>

<p>
    If we want to show quarterly revenue for each product category as grouped columns,
    we can simply take the <a href="#stacked-columns">stacked column</a> config from the example above
    and set the <code>grouped</code> property of the series to <code>true</code>:
</p>

<snippet language="ts">
grouped: true
</snippet>

<p>
    That will produce the following chart:
</p>

<?= chart_example('Grouped Column Series', 'grouped-column', 'generated'); ?>

<h3>Normalized Columns</h3>

<p>
    Going back to our <a href="#stacked-columns">stacked column</a> example,
    if we wanted to normalize the totals so that each column's segments added up to
    a certain value, for example 100%, we could add the following to our series config:
</p>

<snippet language="ts">
normalizedTo: 100
</snippet>

<note>
    It's possible to use any non-zero value to normalize to.
</note>

<?= chart_example('Normalized Column Series', 'normalized-column', 'generated'); ?>

<p>
    Notice how the example above additionally uses a label formatter to add <code>%</code>
    suffix to axis labels:
</p>

<snippet language="ts">
label: {
    formatter: function (params) {
        return params.value + '%';
    }
}
</snippet>

<h3>Column Labels</h3>

<p>
    It's possible to add labels to columns, by adding the following to the series config:
</p>

<snippet language="ts">
label: {}
</snippet>

<p>
    That's it. The config can be empty like that. However, you might want to
    format your labels. For example, by default the values are rounded to two
    decimal places before they are used as labels. But for the example below
    even that is too much, so we use a label formatter that returns the integer
    part of the number only:
</p>

<snippet language="ts">
label: {
    formatter: function (params) {
        // for series datums that are not valid numbers,
        // the formatter's `value` will be `undefined`
        if (params.value !== undefined) {
            return params.value.toFixed(0);
        }
        return '';
    }
}
</snippet>

<p>
    The above formatter allows to produce a nice looking chart where the labels
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
    To create a bar chart all one needs to do is to use <code>type: 'bar'</code>
    instead of <code>type: 'column'</code> in the series config and swap the axes
    &mdash; the <code>'category'</code> axis moves from the bottom to the left
    of a chart, and the <code>'number'</code> axis takes its place instead, moving
    from the left to the bottom:
</p>

<snippet language="ts">
axes: [{
    type: 'number',
    position: 'bottom'
}, {
    type: 'category',
    position: 'left'
}]
</snippet>

<p>
    With these simple changes we go from <a href="#stacked-columns">stacked columns</a>
    to stacked bars:
</p>

<?= chart_example('Stacked Bar Series', 'stacked-bar', 'generated'); ?>

<h2>Bar/Column Series API Reference</h2>

<?php createDocumentationFromFile("../javascript-charts-api-explorer/config.json", "barSeriesConfig") ?>


<?php include '../documentation-main/documentation_footer.php'; ?>
