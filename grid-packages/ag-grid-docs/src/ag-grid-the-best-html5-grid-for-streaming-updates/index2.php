<?php

$pageTitle = "ag-Grid Blog: The Best HTML5 Grid for Streaming Updates";
$pageDescription = "Demonstrates ag-Grid processing large amounts of streaming data updates.";
$pageKeyboards = "javascript datagrid streaming updates";
$socialUrl = "https://www.ag-grid.com/ag-grid-the-best-html5-grid-for-streaming-updates/";
$socialImage = "https://www.ag-grid.com/ag-grid-the-best-html5-grid-for-streaming-updates/TheFastestGrid.png";

include('../includes/mediaHeader.php');
?>

<div>

    <div class="row">
        <div class="col-md-8">

            <?= example('Load and Stress Test of ag-Grid', 'load-and-stress-test-mod', 'vanilla', array('enterprise' => true)) ?>

        </div>
    </div>

</div>

<?php
include('../includes/mediaFooter.php');
?>
