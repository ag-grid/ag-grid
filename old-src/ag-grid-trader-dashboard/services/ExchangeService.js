function ExchangeService() {
}

ExchangeService.prototype.init = function () {
    this.subscribers = {};
    this.timestamp = new Date();

    // create the initial state of data
    this.initialiseTickerData();
};

ExchangeService.prototype.addSubscriber = function (subscriber, symbol) {
    if (!this.subscribers[symbol]) {
        this.subscribers[symbol] = [];
    }
    this.subscribers[symbol].push(subscriber);

    if (!this.updateInterval) {
        this.updateInterval = setInterval(this.applyDeltasToTickerData.bind(this), 3500);
    }
};

ExchangeService.prototype.removeSubscriber = function (subscriber, symbol) {
    let subscribers = this.subscribers[symbol];
    subscribers.splice(subscribers.indexOf(subscriber), 1);
};

ExchangeService.prototype.removeSubscribers = function () {
    this.subscribers = {};
};

ExchangeService.prototype.getTicker = function (symbol) {
    return this.tickerData[symbol];
};

ExchangeService.prototype.getExchanges = function () {
    return EXCHANGES;
};

ExchangeService.prototype.getExchangeInformation = function (exchangeName) {
    return _.find(EXCHANGES, function(exchange) {
        return exchange.symbol === exchangeName;
    })
};

ExchangeService.prototype.getTickerDetail = function (symbol) {
    return this.createTickerDetail(symbol);
};

/*
 * the rest of this class exists primarily to create mock data - it can safely be ignored
 * as it is secondary to the main ideas being demonstrated by the rest of the application
 */
ExchangeService.prototype.initialiseTickerData = function () {
    this.tickerData = {};

    const allSymbols = _.uniq(_.concat(NASDAQ_SYMBOLS, LSE_SYMBOLS, JSE_SYMBOLS, DE_SYMBOLS));
    let self = this;
    allSymbols.forEach(function(symbol) {
        self.tickerData[symbol] = self.generateTickerRow(symbol);
    });
};

ExchangeService.prototype.generateTickerRow = function (symbol) {
    let price = this.random(10, 600);
    return {
        symbol:symbol,
        price:price,
        bid: price - this.random(1, 3),
        ask: price + this.random(1, 3),
        recommendation: ['Buy', 'Hold', 'Sell'][Math.floor(this.random(0, 2))]
    }
};

ExchangeService.prototype.random = function (min, max) {
    return parseFloat((Math.random() * (max - min + 1) + min))
};

ExchangeService.prototype.applyDeltasToTickerData = function () {
    let symbols = _.keys(this.subscribers);
    let properties = ['price', 'bid', 'ask'];

    let symbolsToAlter = _.sampleSize(symbols, symbols.length / 4);
    let propertyToAlter = _.sampleSize(properties, 1);

    let self = this;
    symbolsToAlter.forEach(function(symbol) {
        self.tickerData[symbol] = {
            symbol:symbol,
            price: self.tickerData[symbol].price,
            bid: self.tickerData[symbol].bid,
            ask: self.tickerData[symbol].ask
        };

        if(isNaN(self.tickerData[symbol].price)) {
            debugger
        }

        self.tickerData[symbol][propertyToAlter] = +self.tickerData[symbol][propertyToAlter] + self.random(-2, 2);
    });

    symbols.forEach(function(symbol) {
        self.subscribers[symbol].forEach(function(subscriber) {
            subscriber(self.tickerData[symbol]);
        });
    });
};

ExchangeService.prototype.formatNumber = function (input) {
    return parseFloat(input).toFixed(2);
};

ExchangeService.prototype.formatWithDecimalPlaces = function (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

ExchangeService.prototype.createTickerDetail = function (symbol) {
    let ticker = this.getTicker(symbol);
    let currentPrice = ticker.price;
    let tenthOfCurrentPrice = currentPrice / 10;
    let previousPrice = +currentPrice + this.random(-tenthOfCurrentPrice, tenthOfCurrentPrice);

    let twentiethOfCurrentPrice = currentPrice / 20;
    let yearAgoPrice = this.random(-twentiethOfCurrentPrice, twentiethOfCurrentPrice);

    let range = this.formatNumber(previousPrice) + ' - ' + this.formatNumber(currentPrice);
    let fiftyTwoWeek = this.formatNumber(yearAgoPrice) + ' - ' + this.formatNumber(currentPrice);

    let open = this.formatNumber(ticker.bid); // not the same, but will do for demo purposes

    let vol = this.formatWithDecimalPlaces(this.random(5000, 20000).toFixed(2));
    let avg = this.formatNumber(this.random(10, 30)) + 'M';

    let dividend = this.random(0, 1).toFixed(2);
    let yld = this.random(1, 2).toFixed(2);

    let eps = this.random(5, 10).toFixed(2);

    let shares = this.random(3000, 10000).toFixed(2) + 'M';

    let marketCap = this.random(100000, 900000).toFixed(2) + 'M';

    let historicalData = this.generateHistoricalData(100, this.timestamp, currentPrice);

    return {
        pricingDelta: {
            currentPrice:currentPrice,
            previousPrice:previousPrice
        },
        timestamp: this.timestamp.toDateString(),
        tickerSummary: {
            range:range,
            fiftyTwoWeek:fiftyTwoWeek,
            open:open,
            vol:vol,
            avg:avg,
            dividend:dividend,
            yld:yld,
            eps:eps,
            shares:shares,
            marketCap:marketCap
        },
        historicalData:historicalData
    }
};

ExchangeService.prototype.formatDate = function (date) {
    return date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
};

ExchangeService.prototype.generateHistoricalData = function (numberOfPoints, endDate, endPrice) {
    let historicalData = [{
        "date": this.formatDate(endDate),
        "price": endPrice
    }];

    let numberOfTransitions = 15;
    let pointsPerTransition = numberOfPoints / numberOfTransitions;

    let lastDate = endDate;
    let lastPrice = endPrice;
    for (let transition = 0; transition < numberOfTransitions; transition++) {
        let swing = (Math.random() >= 0.5) ? 1 : -1;

        for (let i = 0; i <= pointsPerTransition; i++) {
            lastDate.setDate(lastDate.getDate() - 1);
            lastPrice = lastPrice + (swing * this.random(-1, 10));
            lastPrice = lastPrice < 0 ? 0 : lastPrice;

            historicalData.splice(0, 0, ({
                "date": this.formatDate(lastDate),
                "price": lastPrice
            }));
        }
    }

    return historicalData;
};


const NASDAQ_SYMBOLS = [
    "SNCL.L",
    "RNK.L",
    "SWJ.L",
    "JDT.L",
    "UANC.L",
    "SDP.L",
    "HSBA.L",
    "XPL.L",
    "KLR.L",
    "SSE.L",
    "JSI.L",
    "UBMN.L",
    "WPC.L",
    "VTC.L",
    "UTG.L",
    "DOR.L",
    "44RS.L",
    "GPOR.L",
    "ASL.L",
    "40JP.L",
    "133716",
    "PJF.L",
    "MLC.L",
    "137817",
    "GHE.L",
    "PML.L",
    "SBRY.L",
    "LEN.L",
    "STS.L",
    "138654",
    "PTEC.L"
];

const LSE_SYMBOLS = [
    "PVG.L",
    "SN.L,",
    "SWJ.L",
    "JDT.L",
    "UANC.L",
    "SDP.L",
    "HSBA.L",
    "XPL.L",
    "KLR.L",
    "SSE.L",
    "JSI.L",
    "UBMN.L",
    "DLN.L",
    "SIR.L",
    "SEC.L",
    "DOR.L",
    "44RS.L",
    "GPOR.L",
    "ASL.L",
    "40JP.L",
    "133716",
    "PJF.L",
    "MLC.L",
    "137817",
    "GHE.L",
    "PML.L",
    "SBRY.L",
    "LEN.L",
    "MAV4.L",
    "GLEN.L",
    "EDGD.L",
];

const JSE_SYMBOLS = [
    "ECV.L",
    "MHN.L",
    "SWJ.L",
    "JDT.L",
    "UANC.L",
    "PLAZ.L",
    "CLDN.L",
    "XPL.L",
    "KLR.L",
    "SSE.L",
    "JSI.L",
    "UBMN.L",
    "WPC.L",
    "VTC.L",
    "UTG.L",
    "DOR.L",
    "44RS.L",
    "GPOR.L",
    "ASL.L",
    "40JP.L",
    "133716",
    "CRW.L",
    "JPR.L",
    "UTLC.L",
    "GHS.L",
    "PML.L",
    "SBRY.L",
    "LEN.L",
    "STS.L",
    "138654",
    "RWS.L"
];

const DE_SYMBOLS = [
    "ECV.L",
    "MHN.L",
    "SWJ.L",
    "JDT.L",
    "UANC.L",
    "SDP.L",
    "KBC.L",
    "VM.L,",
    "KLR.L",
    "SSE.L",
    "JSI.L",
    "UBMN.L",
    "WPC.L",
    "VTC.L",
    "UTG.L",
    "DOR.L",
    "44RS.L",
    "GPOR.L",
    "ASL.L",
    "40JP.L",
    "133716",
    "PJF.L",
    "MLC.L",
    "DPV6.L",
    "LMIN.L",
    "PML.L",
    "SBRY.L",
    "LEN.L",
    "STS.L",
    "BKIR.L",
    "AFMF.L",
];

const EXCHANGES = [
    {name: 'Nasdaq Stock Market', symbol: 'NASDAQ', supportedStocks: NASDAQ_SYMBOLS},
    {name: 'London Stock Exchange', symbol: 'LSE', supportedStocks: LSE_SYMBOLS},
    {name: 'Japan Exchange Group', symbol: 'JSE', supportedStocks: JSE_SYMBOLS},
    {name: 'Deutsche Börse', symbol: 'DE', supportedStocks: DE_SYMBOLS}
];
