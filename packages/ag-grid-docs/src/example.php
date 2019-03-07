<?php
$navKey = "demo";
require "example-runner/utils.php";
include_once 'includes/html-helpers.php';
?>
<!DOCTYPE html>
<html class="stretch-html">
<head lang="en">
<?php
meta_and_links("Demo of ag-Grid: Datagrid with 63 features and great performance", "react angular angularjs data grid example", "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This is our fully interactive demo showcasing all of our features and our performance with large datasets.", false);
?>
<link rel="stylesheet" href="./dist/homepage.css">

<style></style>

</head>

<body>
<div id="example-wrapper">
<header id="nav" class="compact">
<?php 
    $version = 'latest';
    include './includes/navbar.php';
 ?>
</header>

<div class="example-toolbar collapsed">
    <div class="options-container">
        <div>
            <label for="data-size">Data Size:</label>
            <select onchange="onDataSizeChanged(this.value)" id="data-size">
            </select>

            <span id="message" style="margin-left: 10px;">
                <i class="fa fa-spinner fa-pulse fa-fw margin-bottom"></i>
            </span>
        </div>
        <div>
            <label for="grid-theme">Theme:</label>

            <select onchange="onThemeChanged(this.value)" id="grid-theme">
                <option value="">-none-</option>
                <option value="ag-theme-balham" selected>Balham</option>
                <option value="ag-theme-balham-dark">Balham (dark)</option>
                <option value="ag-theme-material">Material</option>
            </select>
        </div>
        <div>
            <label for="global-filter">Filter:</label>
            <input 
            placeholder="Filter any column..." type="text"
            oninput="onFilterChanged(this.value)"
            ondblclick="filterDoubleClicked(event)"
            class="hide-when-small"
            id="global-filter"
            style="flex: 1"
            />
        </div>
    </div>
</div>
<div class="options-expander">
    <span id="messageText"></span>
    <div class="options-toggle" onclick="toggleOptionsCollapsed()"><span>&nbsp;</span>OPTIONS</div>
    <span>&nbsp;</span>
</div>

<!-- The table div -->
<div id="grid-wrapper" style="padding: 1rem; padding-top: 0;">
    <div id="myGrid" style="height: 100%; overflow: hidden;" class="ag-theme-balham"></div>
</div>
</div> <!-- example wrapper -->

<?= globalAgGridScript(true) ?>

<script src="example.js"></script>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>

<script src="dist/homepage.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue"></script>
<script src="https://unpkg.com/vue-router/dist/vue-router.js"></script>
<script src="tutorial.js"></script>



</body>
</html>
