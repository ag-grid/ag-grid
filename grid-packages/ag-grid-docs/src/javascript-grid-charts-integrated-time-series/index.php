<?php
$pageTitle = "Charts: Time Series";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Time Series</h1>

<p class="lead">
    This section covers how to chart time series data using Integrated Charts.
</p>

<p>
    Integrated Charts supports the charting of time series data using line and area charts when a time axis is chosen
    instead of a category or numeric Axis.
</p>


<h2>Time vs Category Axis</h2>

<p>
    A <a href="../javascript-charts-axis/#time-axis">Time Axis</a> is used to plot continuous date / time values,
    whereas a <a href="../javascript-charts-axis/#category-axis">Category Axis</a> is used to plot discrete values or
    categories.
</p>

<p>
    The example below highlights the differences between time and category axes. Notice that the time axis contains all
    days for the range of values provided, whereas the category axis only shows axis labels for the discrete values
    provide.
</p>

<?= grid_example('Time vs Category Axis', 'time-vs-category', 'generated', ['exampleHeight' => 740, 'enterprise' => true]) ?>


<h2>Time Axis Configuration</h2>

<p>
    Columns that contain date object values will be automatically plotted using a
    <a href="../javascript-charts-axis/#time-axis">Time Axis</a> unless it has been explicitly changed through the
    <code>chartDataType</code> column definition property.
</p>

<p>
    Numeric timestamps in a unix format are also allowed but the column should be explicitly configured to use a time
    axis via <code>chartDataType='time'</code> on the column definition.
</p>

<p>
    The following snippet shows how different time series values can be configured to enable a time axis:
</p>

<?= createSnippet(<<<SNIPPET
gridOptions = {
    columnDefs: [
        { field: 'someDate' }, // date objects are treated as time by default
        { field: 'someTimestamp', chartDataType: 'time' },
    ],
    rowData: [
        {
            someDate: new Date(2019, 0, 1), // date object
            someTimestamp: 1167609600000, // numeric timestamp (unix format)
        },
        // ... more rows
    ]
    // ... more grid options
}
SNIPPET
) ?>

<p>
Notice that no configuration is necessary for date objects but numeric timestamps and calendar date string require
that <code>chartDataType='time'</code> is set on the column definitions.
</p>

<p>
    The following example demonstrates how a column containing numeric timestamps can be configured to use a time axis
    using the <code>chartDataType='time'</code> property on the 'timestamp' column definition:
</p>

<?= grid_example('Time Axis Configuration', 'time-axis-config', 'generated', ['exampleHeight' => 740, 'enterprise' => true]) ?>


<h2>Next Up</h2>
<p>
    Continue to the next section to learn about: <a href="../javascript-grid-graphing/">Third-Party Charting</a>.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
