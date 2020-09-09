<?php
$pageTitle = "ag-Charts Themes API Reference";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading">ag-Charts Themes API Reference</h1>

<p class="lead">
    This page documents the ag-Charts Themes API. You can find more details about ag-Chart themes in the
    <a href="../javascript-charts-themes/">Themes</a> section.
</p>

<?php createDocumentationFromFile('themes.json', null, [], ['showSnippets' => true]) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
