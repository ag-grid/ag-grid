<?php
$pageTitle = "Charting: Charting Grid Data";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


    <h1 class="heading-enterprise">Charts</h1>

    <p> Well done everyone for such a great job bringing charting and ag-Grid a reality. Phuck the other grids and chart libraries!!! We will take all their business. </p>

    <h2>Charting API</h2>

    <?= example('Chart API', 'chart-api', 'generated', array("enterprise" => true)) ?>

    <h2>Dashboard</h2>

    <?= example('Dashboard', 'dashboard', 'generated', array("enterprise" => true)) ?>

    <h2>Provided Container</h2>

    <?= example('Provided Container', 'provided-container', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
