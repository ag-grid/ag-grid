// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
function initDashboard() {
    let exchangeService = new ExchangeService();
    exchangeService.init();

    let fxDataService = new FxDataService();
    fxDataService.init();

    let stockHistoricalChart = new StockHistoricalChart();
    stockHistoricalChart.init("historyGraph");

    let stockDetailPanel = new StockDetailPanel();
    stockDetailPanel.init(exchangeService, stockHistoricalChart);

    let priceChangesGrid = new PriceChangesGrid();
    priceChangesGrid.init(exchangeService, stockDetailPanel);

    let fxQuoteMatrix = new FxQuoteMatrix();
    fxQuoteMatrix.init(fxDataService);

    let topMoversGrid = new TopMoversGrid();
    topMoversGrid.init(fxDataService);

    fxDataService.addFxDataSubscriber(fxQuoteMatrix);
    fxDataService.addFxTopMoverSubscriber(topMoversGrid);

    priceChangesGrid.render("priceChangesGrid");
    topMoversGrid.render("topMovers");
    fxQuoteMatrix.render("quoteMatrix");
}

if (document.readyState == "complete") {
    initDashboard();
} else {
    document.addEventListener("readystatechange", initDashboard);
}
