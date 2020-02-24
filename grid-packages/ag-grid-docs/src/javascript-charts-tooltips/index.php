<?php
$pageTitle = "Chart Legend";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Tooltips</h1>

<h2>Styling the default tooltip</h2>

<p>
    The default chart tooltip has the following template:
</p>

<snippet language="html">
&lt;div class="ag-chart-tooltip"&gt;
    &lt;div class="ag-chart-tooltip-title"&gt;&lt;/div&gt;
    &lt;div class="ag-chart-tooltip-content"&gt;&lt;/div&gt;
&lt;/div>
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

<?= chart_example('Tooltip without title', 'tooltip-no-title', 'generated'); ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
