<?php
$pageTitle = "Chart Tooltips";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Tooltips</h1>

<h2>Default tooltip</h2>

<p>
    The default chart tooltip has the following template:
</p>

<snippet language="html">
&lt;div class="ag-chart-tooltip"&gt;
    &lt;div class="ag-chart-tooltip-title"&gt;&lt;/div&gt;
    &lt;div class="ag-chart-tooltip-content"&gt;&lt;/div&gt;
&lt;/div&gt;
</snippet>

<p>
    The title element may or may not be there but the content element is always present.
    In the screenshots below the content element of both tooltips contains <code>Jun: 50.00</code>:
</p>

<p style="text-align: center;">
    <span>No Title&nbsp;</span>
    <img alt="Tooltip without the title element" src="tooltip-no-title.png" style="margin-bottom: 0px; height: 170px;">
    <span style="width: 50px; display: inline-block;"></span>
    <span>With Title&nbsp;</span>
    <img alt="Tooltip with a title element" src="tooltip-with-title.png" style="margin-bottom: 0px; height: 169px;">
</p>

<p>
    To make the tooltip title visible one needs to specify the series' <code>yName</code>
    or <code>yNames</code>. Or in the case of <code>'pie'</code> series &mdash; <code>labelName</code>.
    These configs give the keys used to fetch the series data a display name, because the keys themselves
    may not be presentable or descriptive.
</p>

<p>
    For example, in the sample data below the <code>value1</code> key is not descriptive,
    while <code>hats_made</code> is not very presentable because it's all lowercase and
    has an underscore in the name:
</p>

<snippet language="ts">
data: [{
    month: 'Jun',
    value1: 50,
    hats_made: 40
}, ...]
</snippet>

<p>
    Notice that when we change the <code>yNames</code> of the <code>'column'</code> series
    in the example below:
    <ul class="content">
        <li>
            The tooltip title is visible when <code>yNames</code> config is set, and gone when
            the <code>yNames</code> is reset.
        </li>
        <li>
            The <code>yNames</code> changes are reflected in the legend as well.
        </li>
        <li>
            The legend will show the <code>yKeys</code> even if the <code>yNames</code>
            is not set. The tooltip however will only feature a title if the <code>yNames</code>
            is set.
        </li>
    </ul>
</p>

<h3>Example: Default Tooltip</h3>

<?= chart_example('Default Tooltip', 'default-tooltip', 'generated'); ?>

<h2>Styling the default tooltip</h2>

<p>
    The default tooltip already uses <code>ag-chart-tooltip</code>, <code>ag-chart-tooltip-title</code>
    and <code>ag-chart-tooltip-content</code> CSS classes but these classes are not meant to be used
    directly, unless you want to change the styling of all tooltips in your app.
    Intead, users of the charting library should provide their own tooltip class name via the
    <code>chart.tooltipClass</code> config. This class name will be added to the class list of
    the tooltip element next to <code>ag-chart-tooltip</code> class name for this particular chart
    instance only.
</p>

<p>
    For example, if we wanted to set the tooltip's content <code>background-color</code>
    to <code>gold</code>, we'd add a custom class name to our chart in the code:
</p>

<snippet language="ts">
chart.tooltipClass = 'my-tooltip';
</snippet>

<p>And then in the CSS:</p>

<snippet language="css">
.my-tooltip > .ag-chart-tooltip-content {
    background-color: gold;
}
</snippet>

<p>
    This limits the styling changes to this chart instance alone (or instances that use the extract same
    <code>tooltipClass</code>). We could style the title element and the container element in the same manner.
</p>

<p>
    Note that your styles don't override the default tooltip styles but complement them.
</p>

<h3>Example: Tooltip Styling</h3>

<?= chart_example('Default Tooltip with Custom Styling', 'default-tooltip-styling', 'generated'); ?>

<h2>Using Tooltip Renderer</h2>

<p>
    <code>chart.tooltipClass</code> allows you to style the tooltip, but not to change its
    template or its content. If you need to do either, you have to use the series'
    <code>tooltipRenderer</code> config.
</p>

<p>
    The <code>tooltipRenderer</code> is a function that gets a config object and returns an HTML
    string that includes both the tooltip's template and the content. Basically everything that
    should go inside the <code>&lt;div class="ag-chart-tooltip"&gt;&lt;/div&gt;</code> container
    element.
</p>

<p>
    Let's say we wanted to remove the digits after the decimal point from the values shown in
    tooltips (by default the tooltips show two digits after the decimal point for numeric values).
    We could use the following <code>tooltipRenderer</code> to accomplish that:
</p>

<snippet language="ts">
series: [{
    type: 'column',
    tooltipRenderer: function (params) {
        return '&lt;div class="ag-chart-tooltip-title" style="background-color:' + params.color + '"&gt;' +
            params.datum[params.xKey] +
        '&lt;/div&gt;' +
        '&lt;div class="ag-chart-tooltip-content"&gt;' +
            params.datum[params.yKey].toFixed(0) +
        '&lt;/div&gt;';
    }
}]
</snippet>

<p>
    The tooltip renderer function receives the <code>params</code> object as a single parameter.
    Inside that object you get a reference to the raw <code>datum</code> element (from the <code>chart.data</code>
    or <code>series.data</code> array) that corresponds to the highlight series item, in this case column segment.
    You also get a reference to the series' <code>xKey</code> and <code>yKey</code>, so that you could fetch
    the actual values like so: <code>params.datum[params.yKey]</code>. You can then process the fetched raw
    values however you like before you stringify them and use as a part of the returned HTML string.
</p>

<p>
    Notice that stacked series (like 'column', 'bar' and 'area') that have the <code>yKeys</code> property,
    still receive a single <code>yKey</code> inside the tooltip renderer's <code>params</code> object.
    That's because the tooltip renderer is only given the <code>yKey</code> for the currently highlighted
    series item.
</p>

<note>
    Different series types get different tooltip renderer parameters. You can find out which parameters
    are supported by which series using the <a href="#api-reference">API reference</a> below.
</note>

<p>The effect of applying the tooltip renderer from the snippet above can be seen in the example below.</p>

<h3>Example: Tooltip Renderer</h3>

<p>
    Notice that the tooltip renderer in the example below:
    <ul class="content">
        <li>
            Returns two <code>div</code> elements, one for the tooltip's title and the other one for its content.
        </li>
        <li>
            The value of the title comes from <code>params.datum[params.xKey]</code> which is the name of the month.
        </li>
        <li>
            The title element gets its background color from the <code>params</code> object.
            The provided color matches the color of the series.
        </li>
        <li>
            The 'Sweaters Made' value comes from the <code>params.datum[params.yKey]</code>, which we then stringify
            as an integer via <code>toFixed(0)</code>.
        </li>
        <li>
            Finally we use the default class names on the returned <code>div</code> elements, so that our tooltip
            gets the default styling. You could however add your own classes to the class list, or replace the default
            CSS classes with your own. The structure of the returned DOM is also up to you, we are just following the
            convention for this example.
        </li>
    </ul>
</p>

<?= chart_example('Column Series with a Tooltip Renderer', 'tooltip-renderer', 'generated'); ?>

<h2>API Reference</h2>

<h3>Bar and Column Tooltips</h3>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'barSeriesConfig',
    ['tooltipEnabled', 'tooltipRenderer']) ?>

<h3>Area Tooltips</h3>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'areaSeriesConfig',
    ['tooltipEnabled', 'tooltipRenderer']) ?>


<h3>Line Tooltips</h3>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'lineSeriesConfig',
    ['tooltipEnabled', 'tooltipRenderer']) ?>

<h3>Scatter Tooltips</h3>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'scatterSeriesConfig',
    ['tooltipEnabled', 'tooltipRenderer']) ?>

<h3>Pie Tooltips</h3>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'pieSeriesConfig',
    ['tooltipEnabled', 'tooltipRenderer']) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
