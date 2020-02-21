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

<h3>Single Area Series</h3>

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
<code>%</code> suffix. After this change, the tooltips will change from this
(left) to this (right):
</p>

<p style="text-align: center;">
    <img alt="Default Area Tooltip" src="default-area-tooltip.png" style="margin-bottom: 0px; height: 138px;">
    <span style="width: 50px; display: inline-block;">--></span>
    <img alt="Custom Area Tooltip" src="custom-area-tooltip.png" style="margin-bottom: 0px; height: 146px;">
</p>

<?= chart_example('Single Area Series with Markers', 'single-area-markers', 'generated'); ?>

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

<h3>Multiple Area Series</h3>

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

<?= chart_example('Mutiple Area Series', 'multi-area', 'generated'); ?>

<h3>Stacked Area Series</h3>

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

<?= chart_example('Stacked Area Series', 'stacked-area', 'generated'); ?>

<p>
    Note that in the example code we also didn't forget to update <code>yNames</code> along with
    <code>yKeys</code>, to make sure we have nice looking tooltip headers and legend entries.
</p>

<snippet language="ts">
yNames: ['iPhone', 'Mac', 'iPad', 'Wearables', 'Services']
</snippet>

<h3>Normalized Area Series</h3>

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

<?php include '../documentation-main/documentation_footer.php'; ?>
