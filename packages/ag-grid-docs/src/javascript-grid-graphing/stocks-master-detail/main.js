/*************************************************************************************************************
 * ag-Grid Logic
 *************************************************************************************************************/
let columnDefs = [
    {headerName: 'Symbol', field: 'Symbol'},
    {headerName: 'Date', field: 'Date'},
    {headerName: 'Open', field: 'Open'},
    {headerName: 'High', field: 'High'},
    {headerName: 'Low', field: 'Low'},
    {headerName: 'Close', field: 'Close'},
    {headerName: 'Volume', field: 'Volume'}
];

let gridOptions = {
    columnDefs: columnDefs,
    enableSorting: true,
    enableColResize: true,
    rowSelection: 'multiple',
    onFirstDataRendered(params) {
        params.api.sizeColumnsToFit();
    },
    onSelectionChanged: function (params) {
        "use strict";
        publishSelectedSymbols();
    },
    onModelUpdated: () => {
        "use strict";
        // automatically select these symbols at load time
        let preselectedSymbols = ["aapl","adbe","intc","msft"];
        gridOptions.api.forEachNode((node) => {
            if(preselectedSymbols.indexOf(node.data.Symbol) !== -1) {
                node.setSelected(true);
            }
        })
    }
};

let selectedMetric = 'Close';
function metricChanged(metric) {
    "use strict";
    selectedMetric = metric;

    publishSelectedSymbols();
}


let selectedGraphType = 'Multi-Line Time Series';
function graphTypeChanged(graph) {
    "use strict";
    selectedGraphType = graph;

    switch (selectedGraphType) {
        case 'Bar':
            showDateFields(true);
            break;
        default:
            showDateFields(false);
    }

    publishSelectedSymbols();
}

let selectedYear = 2015;
function yearChanged(year) {
    "use strict";
    selectedYear = parseInt(year);

    publishSelectedSymbols();
}

let selectedMonth = 0;
function monthChanged(month) {
    "use strict";
    selectedMonth = parseInt(month);

    publishSelectedSymbols();
}

function showDateFields(show) {
    let dateFields = document.querySelector('#date');
    dateFields.style.display = show ? 'inline-block' : "None";
}

let getSelectedSymbols = function () {
    return gridOptions.api.getSelectedRows().map((row) => {
        return row.Symbol;
    });
};

let publishSelectedSymbols = function () {
    let selectedSymbols = getSelectedSymbols();
    loadStockDetail(selectedMetric, selectedGraphType, selectedSymbols, selectedYear, selectedMonth);
};

(function () {
    'use strict';

    //event listeners.
    document.addEventListener('DOMContentLoaded', function () {
        let gridDiv = document.querySelector('#myGrid');
        new agGrid.Grid(gridDiv, gridOptions);

        // do http request to get our sample data - not using any framework to keep the example self contained.
        // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
        let httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', '../javascript-grid-graphing/stocks-master-detail/stocks/summary.json');
        httpRequest.send();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                let httpResult = JSON.parse(httpRequest.responseText);
                gridOptions.api.setRowData(httpResult);
            }
        };
    });
}());

/*************************************************************************************************************
 * Graphing / D3 Logic
 *************************************************************************************************************/
function makeRequest(url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(JSON.parse(xhr.response));
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

let requestStockDataLoad = function (stockSymbols) {
    let promises = [];
    stockSymbols.forEach((stockSymbol) => {
        "use strict";
        promises.push(makeRequest(`../javascript-grid-graphing/stocks-master-detail/stocks/${stockSymbol}.json`))
    });
    return promises;
};

let loadStockDetail = function (metric, graphType, stockSymbols) {
    Promise.all(requestStockDataLoad(stockSymbols))
        .then(values => {
            "use strict";

            switch (graphType) {
                case 'Multi-Line Time Series':
                    renderMultiLineGraph(metric, values);
                    break;
                case 'Bar':
                    renderBarGraph(metric, selectedYear, selectedMonth, values);
                    break;
            }
        });
};

function renderMultiLineGraph(metric, values) {
    let svg = d3.select("#detail");
    svg.selectAll("*").remove();

    let margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = svg.attr("width") - margin.left - margin.right,
        height = svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let parseTime = d3.timeParse("%d-%b-%y");

    let x = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory10);

    let line = d3.line()
        .curve(d3.curveBasis)
        .x(function (d) {
            return x(d.Date);
        })
        .y(function (d) {
            return y(d[metric]);
        });

    let stocks = values.map(function (value) {
        let symbol = Object.keys(value)[0];
        return {
            id: symbol,
            values: value[symbol].map(function (datum) {
                let result = {
                    Date: parseTime(datum.Date)
                };
                result[metric] = +datum[metric];
                return result;
            })
        };
    });

    let data = values.map(function (value) {
        let symbol = Object.keys(value)[0];

        return value[symbol].map(function (stockValue) {
            let result = {
                Date: parseTime(stockValue.Date)
            };
            result[symbol] = +stockValue[metric];
            return result;
        });
    });
    data = _.merge(...data);

    x.domain(d3.extent(data, function (d) {
        return d.Date;
    }));

    y.domain([
        d3.min(stocks, function (c) {
            return d3.min(c.values, function (d) {
                return d[metric];
            });
        }),
        d3.max(stocks, function (c) {
            return d3.max(c.values, function (d) {
                return d[metric];
            });
        })
    ]);

    z.domain(stocks.map(function (c) {
        return c.id;
    }));

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text(metric);

    let stock = g.selectAll(".stock")
        .data(stocks)
        .enter().append("g")
        .attr("class", "stock");

    stock.append("path")
        .attr("class", "line")
        .attr("d", function (d) {
            return line(d.values);
        })
        .style("stroke", function (d) {
            return z(d.id);
        });

    stock.append("text")
        .datum(function (d) {
            return {id: d.id, value: d.values[0]};
        })
        .attr("transform", function (d) {
            return "translate(" + x(d.value.Date) + "," + y(d.value[metric]) + ")";
        })
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "10px sans-serif")
        .text(function (d) {
            return d.id;
        });
}

function renderBarGraph(metric, selectedYear, selectedMonth, values) {
    d3.select("#detail").selectAll("*").remove();

    let parseTime = d3.timeParse("%d-%b-%y");

    let data = values.map(function (stock) {
        "use strict";
        let symbol = Object.keys(stock)[0];
        let stockValues = stock[symbol];
        let filtered = stockValues.filter(function (datum) {
            let date = parseTime(datum.Date);
            return date.getFullYear() === selectedYear &&
                date.getMonth() === selectedMonth;
        });

        let total = filtered.reduce((total, value) => {
            return total + value[metric];
        }, 0);

        let result = {
            stock: symbol
        };
        result[metric] = filtered.length ? parseInt(total / filtered.length) : 0;
        return result;
    });

    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 60, left: 60},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    var y = d3.scaleLinear()
        .range([height, 0]);

    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#detail")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data in the domains
    x.domain(data.map(function (d) {
        return d.stock;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d[metric];
    })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.stock);
        })
        .attr("width", x.bandwidth())
        .attr("y", function (d) {
            return y(d[metric]);
        })
        .attr("height", function (d) {
            return height - y(d[metric]);
        });

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // text label for the x axis
    svg.append("text")
        .attr("transform",
            "translate(" + (width/2) + " ," +
            (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Stock");

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(`${metric} (avg)  ${selectedMonth+1}/${selectedYear}`);
}