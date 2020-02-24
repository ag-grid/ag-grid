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
    For example, in the sample data below the <code>value1</code>
    key is not descriptive &mdash; as far as we can tell, it can contain the value of anything. The
    <code>aama_value</code> key is some sort of abbreviation which may make sense to some but
    is not very presentable because of the ambiguity, its all lowercase nature and underscore
    in the name:
</p>

<snippet language="ts">
data: [{
    month: 'Jun',
    value1: 50, // sweaters made in June
    // 'aama' could mean 'American Apparel Manufacture Association'
    // or 'American Association of Medical Assistants'
    // or something else
    aama_value: 40
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
            Since the series uses two <code>yKeys</code> but only a single value is given
            in the <code>yNames</code> config, the changes only affect the tooltip and the
            legend item of the bottom stack.
        </li>
        <li>
            The legend will show the <code>yKeys</code> even if the <code>yNames</code>
            is not set. The tooltip however will only feature a title if the <code>yNames</code>
            is set.
        </li>
    </ul>
</p>

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
    tooltips (by default the tooltips show 2 digits after the decimal point for numeric values).
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

<?= chart_example('Column Series with a Tooltip Renderer', 'tooltip-renderer', 'generated'); ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
