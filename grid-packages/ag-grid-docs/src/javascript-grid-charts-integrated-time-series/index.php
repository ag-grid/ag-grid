<?php
$pageTitle = "Charts: Time Series";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Time Series</h1>

    <p class="lead">
        This section covers how to chart time series data using integrated charts.
    </p>

    <?= grid_example('Simple Time Series', 'simple-time-series', 'generated', ['exampleHeight' => 710, 'enterprise' => true]) ?>


<?php include '../documentation-main/documentation_footer.php'; ?>
