<?php
$pageTitle = "Charts - Area Series";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Area Series</h1>

<p class="lead">
    Area series are like filled Line series, with more emphasis on the magnitude of the change.
    Area series additionally support stacking to emphasize the total value and the way
    individual values relate to the whole.
</p>

<h2>Single Area Series</h2>

<p>
    To create a simple area chart we need to use series type <code>'area'</code>.
    We also have to provide the <code>xKey</code> and at least one <code>yKey</code>.
</p>

<note>
    Since <code>'area'</code> series can be stacked on top of each other,
    they can have multiple <code>yKeys</code> &mdash; one key per each stack level.
</note>

<p>
    A minimal <code>'area'</code> series config therefore would look like this:
</p>

<snippet language="ts">
series: [{
    type: 'area',
    xKey: 'year',
    yKeys: ['ie']
}]
</snippet>

<p>
    In the snippet above we are using the <code>'ie'</code> as the only <code>yKey</code>,
    to show market share of this internet browser alone.
    Just using this simple series config produces the following chart:
</p>

<h3>Example: Basic Area Chart</h3>

<?= chart_example('Single Area Series', 'single-area', 'generated'); ?>

<note>
Even though area series support markers they are turned off by default
for this series type, as this stylization is the most common.
</note>

<p>
To enable area markers all we need to do is add this to the series config:
</p>

<snippet language="ts">
marker: {
    enabled: true
}
</snippet>

<p>
When markers are enabled, the tooltips will be shown on hover. In this case
the values shown are percentage values, however there is no <code>%</code>
suffix because the series don't know about the nature of the data (as it
is designed to work with all kinds of data). So for the purposes of this
example we additionally provide a <code>tooltipRenderer</code> to add the
<code>%</code> suffix. After this change, the tooltips will change like so:
</p>

<p style="text-align: center;">
    <span>Before&nbsp;</span>
    <img alt="Default Area Tooltip" src="default-area-tooltip.png" style="margin-bottom: 0px; height: 138px;">
    <span style="width: 50px; display: inline-block;">--></span>
    <span>After&nbsp;</span>
    <img alt="Custom Area Tooltip" src="custom-area-tooltip.png" style="margin-bottom: 0px; height: 146px;">
</p>

<p>
    The final result can be seen in the example below.
</p>

<h3>Example: Area Chart with Markers and Custom Tooltips</h3>

<?= chart_example('Single Area Series with Markers', 'single-area-markers', 'generated'); ?>

<h2>Multiple Area Series</h2>

<p>
    It is possible to use more than one <code>'area'</code> series in a single chart.
    For example, if we want one series to show the magnitude of change in market share
    of Internet Explorer and the other series the change in market share of Chrome,
    we could use the following <code>series</code> config:
</p>

<snippet language="ts">
series: [{
    type: 'area',
    xKey: 'year',
    yKeys: ['ie']
}, {
    type: 'area',
    xKey: 'year',
    yKeys: ['chrome']
}]
</snippet>

<note>
    Since multiple area series can overlap, it is a good idea to make the fill translucent.
    For example: <code>fillOpacity: 0.7</code>.
</note>

<h3>Example: Overlapping Area Series</h3>

<p>
    Note that in the example below we also:
    <ul class="content">
        <li>
            Configure chart's <code>title</code> and <code>subtitle</code>.
        </li>
        <li>
            Position the legend to the <code>'top'</code> and use the <code>yNames</code>
            configs of the series to control the text the legend displays.
        </li>
        <li>
            Enable series' <code>marker</code>s.
        </li>
        <li>
            Define custom <code>fills</code> and <code>strokes</code>.
        </li>
        <li>
            Make the fill translucent via <code>fillOpacity</code> config.
        </li>
    </ul>
</p>

<?= chart_example('Mutiple Area Series', 'multi-area', 'generated'); ?>

<h2>Stacked Area Series</h2>

<p>
    If we want the areas to be stacked on top of each other, instead of creating a new
    <code>'area'</code> series per stack level, we simply have to use multiple <code>yKeys</code>.
    For example, to have a stacked area chart that shows changes in market share for
    the most popular internet browsers we could use a config like this:
</p>

<snippet language="ts">
series: [{
    type: 'area',
    xKey: 'year',
    yKeys: ['ie', 'firefox', 'safari', 'chrome']
}]
</snippet>

<p>
    Please see an example of the stacked area chart below.
</p>

<h3>Example: Stacked Area Series</h3>

<?= chart_example('Stacked Area Series', 'stacked-area', 'generated'); ?>

<h2>Normalized Area Series</h2>

<p>
    Going back to our <a href="#example-stacked-area-series">stacked area series</a> example,
    if we wanted to normalize the totals so that for any given year stack levels always added up to
    a certain value, for example 100%, we could add the following to our series config:
</p>

<snippet language="ts">
normalizedTo: 100
</snippet>

<note>
    It's possible to use any non-zero value to normalize to.
</note>

<h3>Example: Normalized Stacked Area Series</h3>

<?= chart_example('Normalized Stacked Area Series', 'normalized-area', 'generated'); ?>

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

<h2>API Reference</h2>

<?php createDocumentationFromFile("../javascript-charts-api-explorer/config.json", "areaSeriesConfig") ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
