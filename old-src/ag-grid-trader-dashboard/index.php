<?php
$key = "Trader Dashboard";
$pageTitle = "Trader Dashboard";
$pageDescription = "An example of using ag-Grid in a Trader Dashboard, utilising many of the update options available.";
$pageKeyboards = "Javascript Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

    <h1>
        Trader Dashboard
    </h1>

    <p>This example illustrates a number of different ways to provide live updates to the Grid - each of the grids below
        use a slightly different mechanism to update Grid values.</p>

    <?php include 'dashboard.html'; ?>

    <show-complex-example example=""
                          sourcesOnly="true"
                          sources="{
                            [
                                { root: './', files: 'dashboard.js,dashboard.html' },
                                { root: './components/', files: 'PriceChangesGrid.js,FxQuoteMatrix.js,StockDetailPanel.js,StockHistoricalChart.js,TopMoversGrid.js' },
                                { root: './components/renderers/', files: 'HorizontalBarComponent.js' },
                                { root: './services/', files: 'ExchangeService.js,FxDataService.js' }
                            ]
                          }"
                          exampleHeight="925px">
    </show-complex-example>

<?php include '../documentation-main/documentation_footer.php'; ?>

<!-- due to changes in how we do examples (in documentation_footer somewhere) agGrid is not what dashboard needs -->
<!-- re-import it here so the example works -->
<script src="../dist/ag-grid/ag-grid.js"></script>
