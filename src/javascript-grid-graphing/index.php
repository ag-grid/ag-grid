<?php
$pageTitle = "ag-Grid Examples: Datagrid and D3 Graphs Integration";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. We don't offer charting out of the box but have built and example of integrating with the popular d3 charting library.";
$pageKeyboards = "ag-grid d3 d3.js sparkline examples";
$pageGroup = "thirdparty";
include '../documentation-main/documentation_header.php';
?>

    <h1>ag-Grid Graphing Integration</h1>

    <p>ag-Grid is great at displaying tabular data - it is after all the Best Data Grid for Enterprise in the world!</p>

    <p>Sometimes however a picture (or graph) is worth a thousand words, so in this section we offer some examples of how
    you can interact with external Graphs, or embed Graphs into ag-Grid itself.</p>

    <h2>External Graphs using D3</h2>

    <p>D3 is a powerful Graphing Library. In this example we provide an example that displays a simple ag-Grid table of stock
    data that when clicked on provides a simple time-series chart of the corresponding data. Multiple rows (or stocks) can be
    selected to provide a comparison between stocks.</p>

<?= example('External Graphs using D3', 'stocks-master-detail', 'vanilla', array("enterprise" => 1, "exampleHeight" => 820)) ?>

    <h2>Inline Graphs using jQuery Sparklines</h2>

    <p>jQuery Sparklines is a great library that offers small but rich graphs - ideal for use within ag-Grid.</p>

    <p>In this example we demonstrate the following:</p>

    <ul class="content">
        <li>Close Trend: Inline summary trend graph. If clicked on the full time-series
        will be displayed below.</li>
        <li>Average Volume: The average volume per year in a Bar Graph.</li>
        <li>Target Expenditure: Illustrates how a graph can be used withing a cell editor. If double clicked (or enter
            pressed) a popup editor in the form of a Pie Chart will be shown - when a segment is clicked on the value
            will be saved down to the grid.</li>
        <li>Expenditure: Expenditure shown in a Pie Chart.</li>
    </ul>

    <?= example('Inline Graphs', 'inline-graphs', 'vanilla', array("enterprise" => 1, "exampleHeight" => 850, "extras" => array("lodash", "d3", "jquery", "sparkline"))) ?>


<?php include '../documentation-main/documentation_footer.php'; ?>
