<?php
require "example-runner/utils.php";
?>
<!DOCTYPE html>
<html class="height-100">

<head>
    <title>Test new theme</title>
    <meta name="description"
          content="Example of using ag-Grid demonstrating that it can work very fast with thousands of rows.">
    <meta name="keywords" content="react angular angularjs data grid example"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="./style.css">

    <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico"/>

    <?= globalAgGridScript(true) ?>

    <script src="bare.js"></script>

</head>

<body style="height: 100%; margin: 0px; padding: 20px;">

<div id="myGrid" style="height: 100%; overflow: hidden;" class="ag-theme-fresh"></div>

</body>

</html>
