<?php
$key = "ag-Grid Graphing";
$pageTitle = "ag-Grid Graphing Integration";
$pageDescription = "ag-Grid Graphing Integration Examples";
$pageKeyboards = "ag-grid d3 d3.js sparkline examples";
$pageGroup = "thirdparty";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h3>ag-Grid Graphing Integration</h3>

    <p>ag-Grid is great at displaying tabular data - it is after all the Best Data Grid for Enterprise in the world!</p>

    <p>Sometimes however a picture (or graph) is worth a thousand words, so in this section we offer some examples of how
    you can interact with external Graphs, or embed Graphs into ag-Grid itself.</p>

    <h3>External Graphs using D3</h3>

    <p>D3 is a powerful Graphing Library. In this example we provide an example that displays a simple ag-Grid table of stock
    data that when clicked on provides a simple time-series chart of the corresponding data. Multiple rows (or stocks) can be
    selected to provide a comparison between stocks.</p>

<?= example('External Graphs using D3', 'stocks-master-detail', 'vanilla', array("enterprise" => 1, "exampleHeight" => 820)) ?>

    <h3>Inline Graphs using jQuery Sparklines</h3>

    <p>jQuery Sparklines is a great library that offers small but rich graphs - idea for use within ag-Grid.</p>

    <p>In this example we demonstrate the following:</p>

    <ul>
        <li>Close Trend: Inline <span style="font-style: italic">summary</span> trend graph. If clicked on the full time-series
        will be displayed below.</li>
        <li>Average Volume: The average volume per year in a Bar Graph.</li>
        <li>Target Expenditure: Illustrates how a graph can be used withing a cell editor. If double clicked (or enter
            pressed) a popup editor in the form of a Pie Chart will be shown - when a segment is clicked on the value
            will be saved down to the grid.</li>
        <li>Expenditure: Expenditure shown in a Pie Chart.</li>
    </ul>

    <?= example('Inline Graphs', 'inline-graphs', 'vanilla', array("enterprise" => 1, "exampleHeight" => 850, "extras" => array("lodash", "d3", "jquery", "sparkline"))) ?>

</div>
<?php include '../documentation-main/documentation_footer.php'; ?>
