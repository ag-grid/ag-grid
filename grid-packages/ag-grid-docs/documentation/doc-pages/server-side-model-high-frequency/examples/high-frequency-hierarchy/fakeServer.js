var PRODUCT_NAMES = ['Palm Oil', 'Rubber', 'Wool', 'Amber', 'Copper', 'Lead', 'Zinc', 'Tin', 'Aluminium',
    'Aluminium Alloy', 'Nickel', 'Cobalt', 'Molybdenum', 'Recycled Steel', 'Corn', 'Oats', 'Rough Rice',
    'Soybeans', 'Rapeseed', 'Soybean Meal', 'Soybean Oil', 'Wheat', 'Milk', 'Coca', 'Coffee C',
    'Cotton No.2', 'Sugar No.11', 'Sugar No.14'];

var PORTFOLIO_NAMES = ['Aggressive', 'Defensive', 'Income', 'Speculative', 'Hybrid'];

class FakeServer {
    products = [];
    productsMap = {};
    tradeIdSequence = 0;
    valueCounter = 0;
    updateListeners = [];
    updateIntervalId = undefined;
    versionCounter = 0;

    constructor() {
        this.createData();
    }

    createData() {
        for (var i = 0; i < PRODUCT_NAMES.length; i++) {

            var productName = PRODUCT_NAMES[i];
            var productId = 'PRD_' + i;
            var product = {
                productName: productName,
                productId: productId,
                children: [],
                childrenMap: {}
            };
            this.products.push(product);
            this.productsMap[productId] = product;

            for (var j = 0; j < PORTFOLIO_NAMES.length; j++) {

                var portfolioName = PORTFOLIO_NAMES[j];
                var portfolioId = 'PFO_' + i + '_' + j;
                var portfolio = {
                    portfolioId: portfolioId,
                    portfolioName: portfolioName,
                    productName: productName,
                    productId: productId,
                    parent: product,
                    children: [],
                    childrenMap: {}
                };
                product.children.push(portfolio);
                product.childrenMap[portfolioId] = portfolio;

                for (var k = 0; k < 5; k++) {
                    var bookId = 'LB-' + i + '-' + j + '-' + k;
                    var book = {
                        portfolioId: portfolioId,
                        portfolioName: portfolioName,
                        productName: productName,
                        productId: productId,
                        bookId: bookId,
                        parent: portfolio,
                        children: [],
                        childrenMap: {}
                    };
                    portfolio.children.push(book);
                    portfolio.childrenMap[bookId] = book;

                    for (var l = 0; l < 5; l++) {
                        var trade = this.createTradeRecord(productId, productName, portfolioId, portfolioName, bookId, book);
                        book.children.push(trade);
                    }
                }
            }
        }
        this.aggregateTopDown();
    };

    aggregateTopDown() {
        var that = this;
        function recursiveAgg(item) {
            if (!item.children) { return; }
            item.children.forEach(recursiveAgg);
            that.sumValuesFromChildren(item);
        }
        this.products.forEach(recursiveAgg);
    };

    aggregateBottomUp(item) {
        var that = this;
        function recursiveAgg(item) {
            if (item.children) {
                that.sumValuesFromChildren(item);
            }
            if (item.parent) {
                recursiveAgg(item.parent);
            }
        }
        recursiveAgg(item);
    };

    sumValuesFromChildren(item) {
        item.current = 0;
        item.previous = 0;

        item.children.forEach(function (child) {
            item.current += child.current;
            item.previous += child.previous;
        });
    };

    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    createTradeRecord(productId, productName, portfolioId, portfolioName, bookId, book) {
        var current = Math.floor(Math.random() * 100000) + 100;
        var previous = current + Math.floor(Math.random() * 10000) - 2000;
        var trade = {
            portfolioId: portfolioId,
            portfolioName: portfolioName,
            productName: productName,
            productId: productId,
            bookId: bookId,
            parent: book,
            tradeId: 'TRD_' + this.tradeIdSequence++,
            submitterID: this.randomBetween(10, 1000),
            submitterDealID: this.randomBetween(10, 1000),
            dealType: (Math.random() < .2) ? 'Physical' : 'Financial',
            bidFlag: (Math.random() < .5) ? 'Buy' : 'Sell',
            current: current,
            previous: previous,
            pl1: this.randomBetween(100, 1000),
            pl2: this.randomBetween(100, 1000),
            gainDx: this.randomBetween(100, 1000),
            sxPx: this.randomBetween(100, 1000),
            _99Out: this.randomBetween(100, 1000)
        };
        return trade;
    };

    getNextValue() {
        return (Math.floor((this.valueCounter * 987654321) / 7)) % 10000;
    };

    getData(request, parentData, callback) {

        var that = this;
        var serverVersion;
        var result;

        function getDataFromServer() {
            var groupKeys = request.groupKeys;

            var productId = parentData ? parentData.productId : null;
            var portfolioId = parentData ? parentData.portfolioId : null;
            var bookId = parentData ? parentData.bookId : null;

            switch (groupKeys.length) {
                case 0:
                    result = that.products.map(that.mapProduct.bind(this));
                    break;
                case 1:
                    var portfolios = that.productsMap[productId].children;
                    result = portfolios.map(that.mapPortfolio.bind(this));
                    break;
                case 2:
                    var books = that.productsMap[productId].childrenMap[portfolioId].children;
                    result = books.map(that.mapBook.bind(this));
                    break;
                case 3:
                    var trades = that.productsMap[productId].childrenMap[portfolioId].childrenMap[bookId].children;
                    result = trades.map(that.mapTrade.bind(this));
                    break;
            }

            serverVersion = that.versionCounter;
        }

        function returnResultToClient() {
            // call the success callback
            callback(result, serverVersion);
        }

        // To make the demo look real, we put in network time in both directions
        // to give async behaviour
        var timeToServer = 300;
        var timeToClient = 300;
        setTimeout(function () {
            console.log('getFromServer');
            getDataFromServer();
            setTimeout(returnResultToClient, timeToClient);
        }, timeToServer);

    };

    mapProduct(item) {
        return {
            productName: item.productName,
            productId: item.productId,
            current: item.current,
            previous: item.previous
        };
    };

    mapPortfolio(item) {
        return {
            portfolioId: item.portfolioId,
            portfolioName: item.portfolioName,
            productName: item.productName,
            productId: item.productId,
            current: item.current,
            previous: item.previous
        };
    };

    mapBook(item) {
        return {
            portfolioId: item.portfolioId,
            portfolioName: item.portfolioName,
            productName: item.productName,
            productId: item.productId,
            bookId: item.bookId,
            current: item.current,
            previous: item.previous
        };
    };

    mapTrade(item) {
        return {
            portfolioId: item.portfolioId,
            portfolioName: item.portfolioName,
            productName: item.productName,
            productId: item.productId,
            bookId: item.bookId,
            tradeId: item.tradeId,
            submitterID: item.submitterID,
            submitterDealID: item.submitterDealID,
            dealType: item.dealType,
            bidFlag: item.bidFlag,
            current: item.current,
            previous: item.previous,
            pl1: item.pl1,
            pl2: item.pl2,
            gainDx: item.gainDx,
            sxPx: item.sxPx,
            _99Out: item._99Out
        };
    };

    addUpdateListener(listener) {
        this.updateListeners.push(listener);
    };

    startUpdates() {
        if (this.intervalId != undefined) { return; }
        this.intervalId = setInterval(this.doBatch.bind(this), 50);
    };

    stopUpdates() {
        if (this.intervalId == undefined) { return; }
        clearInterval(this.intervalId);
        this.intervalId = undefined;
    };

    touchVersion() {
        this.versionCounter++;
    };

    doBatch() {
        var transactions = [];

        this.touchVersion();

        // pick book at random
        var product = this.products[Math.floor(Math.random() * this.products.length)];
        var portfolio = product.children[Math.floor(Math.random() * product.children.length)];
        var book1 = portfolio.children[Math.floor(Math.random() * portfolio.children.length)];
        var book2 = portfolio.children[Math.floor(Math.random() * portfolio.children.length)];

        // product = this.products[0];
        // portfolio = product.children[0];
        // book1 = portfolio.children[0];
        // book2 = portfolio.children[1];

        // create 4 trades in book 1 and 4 trades in book 2
        for (var i = 0; i < 4; i++) {
            this.createOneTrade(transactions, product, portfolio, book1);
            this.createOneTrade(transactions, product, portfolio, book2);
        }

        this.updateListeners.forEach(function (listener) {
            listener(transactions);
        });
    };

    insertOneRecord() {
        var transactions = [];

        this.touchVersion();

        // pick first book
        var product = this.products[0];
        var portfolio = product.children[0];
        var book = portfolio.children[0];

        this.createOneTrade(transactions, product, portfolio, book);

        this.updateListeners.forEach(function (listener) {
            listener(transactions);
        });
    };

    createOneTrade(transactions, product, portfolio, book) {

        var newTrade = this.createTradeRecord(product.productId, product.productName, portfolio.portfolioId, portfolio.portfolioName, book.bookId, book);

        book.children.push(newTrade);
        book.childrenMap[newTrade.tradeId] = newTrade;

        this.aggregateBottomUp(newTrade);

        transactions.push({
            serverVersion: this.versionCounter,
            route: [product.productName, portfolio.portfolioName, book.bookId],
            add: [newTrade]
        });

        transactions.push({
            serverVersion: this.versionCounter,
            route: [product.productName, portfolio.portfolioName],
            update: [book]
        });

        transactions.push({
            serverVersion: this.versionCounter,
            route: [product.productName],
            update: [portfolio]
        });

        transactions.push({
            serverVersion: this.versionCounter,
            route: [],
            update: [product]
        });
    };

}

