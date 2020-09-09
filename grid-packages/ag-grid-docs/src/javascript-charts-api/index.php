<?php
$pageTitle = "ag-Charts API Reference";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading">ag-Charts API Reference</h1>

<p class="lead">
    This page documents the ag-Charts API. You can find more details about getting started with ag-Charts in the
    <a href="../javascript-charts-overview/">Getting Started</a> section. You can also explore the API and see in
    real-time how different options affect charts using the <a href="../javascript-charts-api-explorer">API Explorer</a>.
</p>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', null, [], ['showSnippets' => true]) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
