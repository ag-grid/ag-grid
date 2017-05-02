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

    <show-complex-example example="./stocksMasterDetail.html"
                          sources="{
                            [
                                { root: './', files: 'stocksMasterDetail.html,stocksMasterDetail.js' }
                            ]
                          }"
                          plunker="",
                          exampleheight="800px">
    </show-complex-example>

    <h3>Inline Graphs using jQuery Sparklines</h3>

    <p>jQuery Sparklines is a great library that offers small but rich graphs - idea for use within ag-Grid.</p>

    <show-complex-example example="./inlineGraphs.html"
                          sources="{
                            [
                                { root: './', files: 'inlineGraphs.html,inlineGraphs.js' }
                            ]
                          }"
                          plunker="">
    </show-complex-example>

</div>
<?php include '../documentation-main/documentation_footer.php'; ?>
