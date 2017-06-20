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

    <p>This section documents how to get started with ag-Grid and JavaScript as quickly as possible. You will start off
        with
        a simple application and section by section add Grid features to the application ending up with a fully fledged
        application with ag-Grid at the heart of it.</p>


    <show-complex-example example="dashboard.html"
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