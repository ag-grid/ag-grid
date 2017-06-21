function PriceChangesGrid() {
}

PriceChangesGrid.prototype.init = function (exchangeService,
                                            stockDetailPanel) {
    this.stockDetailPanel = stockDetailPanel;

    this.exchangeService = exchangeService;
    this.exchangeService.init();

    this.selectedExchange = this.exchangeService.getExchangeInformation("NASDAQ");

    this.gridOptions = {
        onGridReady: this.onGridReady.bind(this),
        onSelectionChanged: this.onSelectionChanged.bind(this),
        getRowNodeId: this.getRowNodeId,
        enableSorting: true,
        enableRangeSelection: true,
        rowSelection: 'single',
        columnDefs: [
            {
                field: 'symbol',
                headerName: 'Symbol',
                sort: 'asc'
            },
            {
                field: 'price',
                headerName: 'Price',
                valueFormatter: this.numberFormatter,
                cellRenderer: 'animateShowChange',
                cellStyle: {'text-align': 'right'}
            },
            {
                field: 'bid',
                headerName: 'Bid',
                valueFormatter: this.numberFormatter,
                cellRenderer: 'animateShowChange',
                cellStyle: {'text-align': 'right'}
            },
            {
                field: 'ask',
                headerName: 'Ask',
                valueFormatter: this.numberFormatter,
                cellRenderer: 'animateShowChange',
                cellStyle: {'text-align': 'right'}
            }
        ]
    };
};

PriceChangesGrid.prototype.numberFormatter = function (params) {
    if (typeof params.value === 'number') {
        return params.value.toFixed(2);
    } else {
        return params.value;
    }
};

PriceChangesGrid.prototype.onGridReady = function (params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    // make realistic - call in a batch
    let rowData = _.map(this.selectedExchange.supportedStocks, symbol => this.exchangeService.getTicker(symbol));
    this.gridApi.updateRowData({add: rowData});

    // select the first symbol to show the chart
    this.gridApi.getModel().getRow(0).setSelected(true);

    this.selectedExchange.supportedStocks.forEach(symbol => {
        this.exchangeService.addSubscriber(this.updateSymbol.bind(this), symbol);
    });

    this.gridApi.sizeColumnsToFit();
};

PriceChangesGrid.prototype.getRowNodeId = function (data) {
    return data.symbol;
};

PriceChangesGrid.prototype.onSelectionChanged = function () {
    let selectedNode = this.gridApi.getSelectedNodes()[0];
    this.stockDetailPanel.update(this.selectedExchange, selectedNode.data.symbol)
};

PriceChangesGrid.prototype.updateData = function (nextProps) {
    if (nextProps.selectedExchange.supportedStocks !== this.selectedExchange.supportedStocks) {
        if (!this.gridApi) {
            return;
        }
        this.gridApi.deselectAll();

        const currentSymbols = this.selectedExchange.supportedStocks;
        const nextSymbols = nextProps.selectedExchange.supportedStocks;

        // Unsubscribe to current ones that will be removed
        const symbolsRemoved = _.difference(currentSymbols, nextSymbols);
        _.forEach(symbolsRemoved, symbol => {
            this.exchangeService.removeSubscriber(this.updateSymbol, symbol);
        });

        // Remove ag-grid nodes as necessary
        const rowsToRemove = [];
        this.gridApi.forEachNode(node => {
            const {data} = node;
            if (includes(symbolsRemoved, data.symbol)) {
                rowsToRemove.push(data);
            }
        });
        this.gridApi.updateRowData({remove: rowsToRemove});

        // Subscribe to new ones that need to be added
        const symbolsAdded = _.difference(nextSymbols, currentSymbols);
        _.forEach(symbolsAdded, symbol => {
            this.exchangeService.addSubscriber(this.updateSymbol, symbol);
        });

        // Insert new ag-grid nodes as necessary
        let rowData = _.map(symbolsAdded, symbol => this.exchangeService.getTicker(symbol));
        this.gridApi.updateRowData({add: rowData});

        // select the first symbol to show the chart
        this.gridApi.getModel().getRow(0).setSelected(true);
    }
};

PriceChangesGrid.prototype.updateSymbol = function (symbol) {
    if (!this.gridApi) {
        // the grid isn't ready yet
        return;
    }

    this.gridApi.updateRowData({update: [symbol]});
};

PriceChangesGrid.prototype.render = function (id) {
    // lookup the container we want the Grid to use
    let eGridDiv = document.querySelector(`#${id}`);

    // create the grid passing in the div to use together with the columns & data we want to use
    new agGrid.Grid(eGridDiv, this.gridOptions);
};
