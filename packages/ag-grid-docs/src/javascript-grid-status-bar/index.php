<?php
$pageTitle = "Status Bar: Enterprise Grade Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Status Bar. The Status Panel appears on the bottom of the grid and shows aggregations (sum, min, max etc.) when you select a range of cells using range selection. This is similar to what happens in Excel. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid JavaScript Grid Status Bar";
$pageGroup = "feature";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>

<h1>Status Bar</h1>

<p class="lead">The status bar appears below the grid. By default we provide an aggregation component that when used in
    conjunction with range selection can display <strong>average, count, min, max, sum</strong>. You can also supply your own
    custom components in the status bar</p>

<h2>Aggregation Component</h2>
<p>If you have multiple ranges selected (by holding down ctrl while dragging) and a cell is in multiple
ranges, the cell will be only included once in the aggregation.</p>

<p>If the cell does not contain a simple number value, then it will not be included in average, min max or sum,
however it will still be included in count.</p>

<p>In the grid below, select a range by dragging the mouse over cells and notice the status bar
showing the aggregation values as you drag.</p>

<?= example('Status Bar', 'status-bar', 'generated', array("enterprise" => 1)) ?>

<p>By default all of the aggregations available will be displayed but you can configure the aggregation component to only
show a subset of the aggregations.</p>

<p>In this code snippet we have configured the aggregation component to only show <code>min, max and average</code>:</p>

<snippet>
gridOptions: {
    statusPanel: {
        components: [
            {
                component: 'agAggregationComponent',
                    componentParams : {
                        aggFuncs: ['min', 'max', 'avg']  // possible values are: 'count', 'sum', 'min', 'max', 'avg'
                    }
                }
            }
        ]
    }
...other properties
</snippet>

<p>To build your own status bar component please see the section on <a href="../javascript-grid-status-bar-component">
        Status Bar Components</a>.</p>

<?php include '../documentation-main/documentation_footer.php';?>
