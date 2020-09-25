<?php
$pageTitle = "Chart Tooltips";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Tooltips</h1>

<p>
    There are four ways of enabling the tooltips in ag-Charts by using:
    <ul>
        <li>default tooltips</li>
        <li>default tooltips with custom styling</li>
        <li>custom title / content (with default or custom styling)</li>
        <li>completely custom markup for tooltips</li>
    </ul>
</p>

<h2>Default Tooltip</h2>

<p>
    The default chart tooltip has the following template:
</p>

<?= createSnippet(<<<SNIPPET
<div class="ag-chart-tooltip">
    <div class="ag-chart-tooltip-title"></div>
    <div class="ag-chart-tooltip-content"></div>
</div>
SNIPPET
, 'html') ?>

<p>
    The title element may or may not exist but the content element is always present.
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
    To make the tooltip title visible you need to specify the series' <code>yName</code>
    or <code>yNames</code>, or <code>labelName</code> in the case of <code>'pie'</code> series.
    These configs supply the keys used to fetch the display names, because the keys themselves
    may not be presentable or descriptive.
</p>

<h3>Example: Default Tooltip</h3>

<p>
    In the sample data below the <code>value1</code> key is not descriptive,
    while <code>hats_made</code> is not very presentable:
</p>

<?= createSnippet(<<<SNIPPET
data: [
    {
        month: 'Jun',
        value1: 50,
        hats_made: 40
    },
    ...
]
SNIPPET
) ?>

<p>
    Notice that when we set the <code>yNames</code> of the <code>'column'</code> series:
    <ul class="content">
        <li>
            The tooltip title is visible when <code>yNames</code> config is set, and hidden when
            the <code>yNames</code> is reset.
        </li>
        <li>
            The <code>yNames</code> changes are reflected in the legend as well.
        </li>
        <li>
            The legend will use the <code>yKeys</code> when the <code>yNames</code>
            is not set. The tooltip however will only have a title if the <code>yNames</code> (or <code>title</code>)
            is set.
        </li>
    </ul>
</p>

<?= chart_example('Default Tooltip', 'default-tooltip', 'generated'); ?>

<h2>Styling the Default Tooltip</h2>

<p>
    The default tooltip already uses <code>ag-chart-tooltip</code>, <code>ag-chart-tooltip-title</code>
    and <code>ag-chart-tooltip-content</code> CSS classes, but these classes are not meant to be used directly
    to add custom CSS rules to, unless you want to change the styling of all the tooltips in your app. Instead,
    users of the charting library should provide their own tooltip class name via the <code>chart.tooltipClass</code> config.
    This class name will be added to the class list of the tooltip element for only that particular chart instance.
</p>

<p>
    For example, if we wanted to set the tooltip's content <code>background-color</code>
    to <code>gold</code>, we'd add a custom class name to our chart in the code:
</p>

<?= createSnippet("chart.tooltipClass = 'my-tooltip';") ?>

<p>And then in the CSS:</p>

<?= createSnippet(<<<SNIPPET
.my-tooltip .ag-chart-tooltip-content {
    background-color: gold;
}
SNIPPET
, 'css') ?>

<p>
    This limits the styling changes to this chart instance alone (or instances that use the same
    <code>tooltipClass</code>). We could style the title element and the container element in the same manner.
</p>

<p>
    Note that your styles don't override the default tooltip styles but complement them.
</p>

<h3>Example: Tooltip Styling</h3>

<p>In this example we show how to change the content's background color and the color of the tooltip's arrow to gold.</p>

<?= chart_example('Default Tooltip with Custom Styling', 'default-tooltip-styling', 'generated'); ?>

<h2>Modifying Content / Title</h2>

<p>
    To control what goes into the title and content divs of the tooltip one can set up a tooltip renderer function
    (one per series) that receives values associated with the highlighted data point and returns an object with
    the <code>title</code> and <code>content</code> fields containing plain text or inner HTML that goes into
    the corresponding divs:
</p>

<?= createSnippet(<<<SNIPPET
tooltipRenderer?: (params: AgTooltipRendererParams) => AgTooltipRendererResult;

interface AgTooltipRendererResult {
    title?: string;
    content?: string;
}
SNIPPET
) ?>

<p>
The actual type of the <code>params</code> object passed into the tooltip renderer will
depend on the series type being used. For example, bar series' tooltip renderer params
object will have the following structure:
</p>

<?= createSnippet(<<<SNIPPET
interface AgTooltipRendererParams {
    // the element of the series' data represented by the highlighted item
    datum: any;
    // the title of the series, if any
    title?: string;
    // the color of the series
    color?: string;

    // the xKey used to fetch the xValue from the datum, same as series xKey
    xKey: string;
    // the actual xValue used
    xValue?: any;
    // same as series.xName
    xName?: string;

    // the yKey used to fetch the yValue from the datum,
    // equals to one of the elements in the series.yKeys array,
    // depending on which bar inside a stack/group is highlighted
    yKey: string;
    // the actuall yValue used
    yValue?: any;
    // equals to one of the elements in the series.yNames array
    yName?: string;
}
SNIPPET
) ?>

<p>
    Let's say we wanted to remove the digits after the decimal point from the values shown in
    tooltips (by default the tooltips show two digits after the decimal point for numeric values).
    We could use the following <code>tooltipRenderer</code> to achieve that:
</p>

<?= createSnippet(<<<SNIPPET
tooltipRenderer: function (params) {
    return {
        content: params.yValue.toFixed(0),
        title: params.xValue // optional, same as default
    };
}
SNIPPET
) ?>

<p>
    The example below demonstrates the above tooltip renderer in action:
</p>

<?= chart_example("Modifying Tooltips's Content", 'tooltip-content-title', 'generated'); ?>

<h2>Using Custom Tooltips</h2>

<p>
    Intead of having the tooltip renderer return an object with title and content strings
    to be used in the default tooltip template, you can return a string with completely
    custom markup that will override not just the title and content but the template as well.
</p>

<p>
    Let's say we wanted to remove the digits after the decimal point from the values shown in
    tooltips (by default the tooltips show two digits after the decimal point for numeric values).
    We could use the following <code>tooltipRenderer</code> to achieve that:
</p>

<?= createSnippet(<<<SNIPPET
series: [{
    type: 'column',
    tooltipRenderer: function (params) {
        var xValue = params.datum[params.xKey];
        var yValue = params.datum[params.yKey].toFixed(0);
        return '<div class="ag-chart-tooltip-title" ' + 'style="background-color:' + params.color + '">' + xValue + '</div>' + '<div class="ag-chart-tooltip-content">' + yValue + '</div>';
    }
}]
SNIPPET
) ?>

<p>
    The tooltip renderer function receives the <code>params</code> object as a single parameter.
    Inside that object you get a reference to the raw <code>datum</code> element (from the <code>chart.data</code>
    or <code>series.data</code> array) that corresponds to the highlighted series item.
    You also get a reference to the series' <code>xKey</code> and <code>yKey</code>, so that you could fetch
    the actual values like so: <code>params.datum[params.yKey]</code>. You can then process the raw
    values however you like before using them as a part of the returned HTML string.
</p>

<p>
    Notice that stacked series (like <code>'column'</code>, <code>'bar'</code> and <code>'area'</code>) that have the
    <code>yKeys</code> property still receive a single <code>yKey</code> inside the tooltip renderer's
    <code>params</code> object. This is because the tooltip renderer is only given the <code>yKey</code> for the
    currently highlighted series item.
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
            Returns two <code>div</code> elements, one for the tooltip's title and another for its content.
        </li>
        <li>
            The value of the title comes from <code>params.datum[params.xKey]</code> which is the name of the month.
        </li>
        <li>
            The title element gets its background color from the <code>params</code> object.
            The provided color matches the color of the series.
        </li>
        <li>
            The <code>'Sweaters Made'</code> value comes from the <code>params.datum[params.yKey]</code>, which we then
            stringify as an integer via <code>toFixed(0)</code>.
        </li>
        <li>
            We use the default class names on the returned <code>div</code> elements, so that our tooltip
            gets the default styling. You could however add your own classes to the class list, or replace the default
            CSS classes with your own. The structure of the returned DOM is also up to you, we are just following the
            convention for this example.
        </li>
    </ul>
</p>

<?= chart_example('Column Series with Tooltip Renderer', 'tooltip-renderer', 'generated'); ?>

<h2>API Reference</h2>

<h3>Bar/Column Tooltips</h3>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'bar', ['tooltipEnabled', 'tooltipRenderer']) ?>

<h3>Area Tooltips</h3>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'area', ['tooltipEnabled', 'tooltipRenderer']) ?>

<h3>Line Tooltips</h3>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'line', ['tooltipEnabled', 'tooltipRenderer']) ?>

<h3>Scatter/Bubble Tooltips</h3>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'scatter', ['tooltipEnabled', 'tooltipRenderer']) ?>

<h3>Pie/Doughnut Tooltips</h3>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'pie', ['tooltipEnabled', 'tooltipRenderer']) ?>

<h3>Histogram Tooltips</h3>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'histogram', ['tooltipEnabled', 'tooltipRenderer']) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about <a href="../javascript-charts-axis/">axes</a>.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
