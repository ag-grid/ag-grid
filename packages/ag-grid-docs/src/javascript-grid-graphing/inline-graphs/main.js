// for cell height & width
const CELL_DIMENSION_SIZE = 90;

let columnDefs = [
    {headerName: 'Symbol', field: 'Symbol', width: 85},
    {headerName: 'Date', field: 'Date', width: 82},
    {headerName: 'Open', field: 'Open', width: 72},
    {headerName: 'High', field: 'High', width: 72},
    {headerName: 'Low', field: 'Low', width: 72},
    {headerName: 'Close', field: 'Close', width: 72},
    {
        headerName: 'Close Trend',
        field: 'CloseTrends',
        width: 115,
        suppressResize: true,
        suppressSizeToFit: true,
        cellRenderer: 'lineChartLineRenderer'
    },
    {
        headerName: 'Avg Volume',
        field: 'AverageVolume',
        width: 115,
        suppressResize: true,
        suppressSizeToFit: true,
        cellRenderer: 'barChartLineRenderer'
    },
    {
        headerName: 'Target Exp',
        field: 'targetExpenditure',
        width: 110,
        editable: true,
        cellEditor: 'pieChartLineEditor',
        cellEditorParams: {
            segments: {
                "R&D": "#3366cc",
                "Marketing": "#dc3912",
                "Infrastructure": "#ff9900"
            },
            colToUseForRendering: "Expenditure"
        }
    },
    {
        headerName: 'Expenditure',
        field: 'Expenditure',
        width: 110,
        suppressResize: true,
        suppressSizeToFit: true,
        cellRenderer: 'pieChartLineRenderer',
        cellRendererParams: {
            segments: {
                "R&D": "#3366cc",
                "Marketing": "#dc3912",
                "Infrastructure": "#ff9900"
            }
        }
    }
];

let gridOptions = {
    columnDefs: columnDefs,
    enableSorting: true,
    rowSelection: 'single',
    rowHeight: 95,
    onCellClicked: (params) => {
        if (params.colDef.field !== "CloseTrends") {
            return;
        }
        renderLineGraph(params.data.Symbol);
    },
    components:{
        lineChartLineRenderer: LineChartLineRenderer,
        barChartLineRenderer: BarChartLineRenderer,
        pieChartLineEditor: PieChartLineEditor,
        pieChartLineRenderer: PieChartLineRenderer
    }
};


function LineChartLineRenderer() {
}

LineChartLineRenderer.prototype.init = function (params) {

    var eGui = document.createElement('div');
    this.eGui = eGui;

    // sparklines requires the eGui to be in the dom - so we put into a timeout to allow
    // the grid to complete it's job of placing the cell into the browser.
    setTimeout( () => {
        let values = params.value
            .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
            .map((datum) => datum.Close);
        $(eGui).sparkline(values, {height: CELL_DIMENSION_SIZE, width: CELL_DIMENSION_SIZE});
    }, 0);
};

LineChartLineRenderer.prototype.getGui = function () {
    return this.eGui;
};

function BarChartLineRenderer() {
}

BarChartLineRenderer.prototype.init = function (params) {
    var eGui = document.createElement('div');
    this.eGui = eGui;

    // sparklines requires the eGui to be in the dom - so we put into a timeout to allow
    // the grid to complete it's job of placing the cell into the browser.
    setTimeout(function(){
        let values = params.value
            .sort((a, b) => a.Year - b.Year)
            .map((datum) => datum.AverageVolume.toFixed());
        $(eGui).sparkline(values, {
            type: 'bar',
            barColor: 'green',
            chartRangeMin: 1000000,
            barWidth: 11,
            height: CELL_DIMENSION_SIZE,
            width: CELL_DIMENSION_SIZE
        });
    }, 0);
};

BarChartLineRenderer.prototype.getGui = function () {
    return this.eGui;
};

function PieChartLineRenderer() {
}

PieChartLineRenderer.prototype.init = function (params) {

    var eGui = document.createElement('div');
    this.eGui = eGui;

    // sparklines requires the eGui to be in the dom - so we put into a timeout to allow
    // the grid to complete it's job of placing the cell into the browser.
    setTimeout( function() {

        let segments = params.segments;
        // let segments = params.segments; alberto - used to be this

        let colourToNames = _.invert(segments);
        let values = Object.keys(segments).map((segment) => {
            return params.value[segment];
        });
        let sliceColours = Object.values(segments);
        $(eGui).sparkline(values,
            {
                type: 'pie',
                height: CELL_DIMENSION_SIZE,
                width: CELL_DIMENSION_SIZE,
                sliceColors: sliceColours,
                tooltipFormatter: (sparklines, options, segment) => {
                    return `<div class="jqsfield"><span style="color: ${segment.color}"</span>${colourToNames[segment.color]}: ${Math.round(segment.percent)}%</div>`;

                }
            }
        );
    });
};

PieChartLineRenderer.prototype.getGui = function () {
    return this.eGui;
};

function PieChartLineEditor() {
}

PieChartLineEditor.prototype.init = function (params) {
    this.params = params;
    this.value = this.params.value;
    this.parentGui = document.createElement('div');
    this.parentGui.style.width = CELL_DIMENSION_SIZE + 5;
    this.parentGui.style.height = CELL_DIMENSION_SIZE + 5;
    this.parentGui.style.backgroundColor = "lightblue";
    this.parentGui.style.border = "1px solid grey";
    this.parentGui.style.borderRadius = "5px";
    this.parentGui.style.paddingLeft = "5px";
    this.parentGui.style.paddingTop = "5px";

    this.eGui = document.createElement('div');

    this.parentGui.appendChild(this.eGui);
};

PieChartLineEditor.prototype.getGui = function () {
    return this.parentGui;
};

// editors have afterGuiAttached callback to know when the dom
// element is attached. so we can use this instead of using timeouts.
PieChartLineEditor.prototype.afterGuiAttached = function () {
    let segments = this.params.segments;
    let colourToNames = _.invert(segments);
    let values = Object.keys(segments).map((segment) => {
        return this.params.node.data[this.params.colToUseForRendering][segment];
    });
    let sliceColours = Object.values(segments);

    let thisSparkline = $(this.eGui);
    thisSparkline.sparkline(values,
        {
            type: 'pie',
            height: CELL_DIMENSION_SIZE,
            width: CELL_DIMENSION_SIZE,
            sliceColors: sliceColours,
            tooltipFormatter: (sparklines, options, segment) => {
                return `<div class="jqsfield"><span style="color: ${segment.color}"</span>${colourToNames[segment.color]}: ${Math.round(segment.percent)}%</div>`;

            }
        }
    );

    thisSparkline.bind('sparklineClick', (ev) => {
        let segmentClicked = ev.sparklines[0].getCurrentRegionFields();
        this.value = colourToNames[segmentClicked.color];
        this.params.api.stopEditing();
    });
};

PieChartLineEditor.prototype.getValue = function () {
    return this.value;
};

PieChartLineEditor.prototype.isPopup = function () {
    return true;
};

PieChartLineEditor.prototype.destroy = function () {
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    let gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    let httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://rawgit.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/javascript-grid-graphing/inline-graphs/stocks/summaryExpanded.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            let httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});


function renderLineGraph(symbol) {
    let httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', `https://rawgit.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/javascript-grid-graphing/inline-graphs/stocks/${symbol}-close-trend.json`);
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            let noRowsMessage = document.querySelector('.centerInline');
            noRowsMessage.style.display = "None";

            let svg = d3.select("#detailInline");
            svg.selectAll("*").remove();

            let parseTime = d3.timeParse("%d-%b-%y");
            let margin = {top: 20, right: 20, bottom: 30, left: 50},
                width = +svg.attr("width") - margin.left - margin.right,
                height = +svg.attr("height") - margin.top - margin.bottom,
                g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            let x = d3.scaleTime()
                .rangeRound([0, width]);

            let y = d3.scaleLinear()
                .rangeRound([height, 0]);

            let line = d3.line()
                .x(function (d) {
                    return x(d.Date);
                })
                .y(function (d) {
                    return y(d.Close);
                });

            let data = JSON.parse(httpRequest.responseText)
                .map((datum) => {
                    return {
                        Date: parseTime(datum.Date),
                        Close: +datum.Close
                    }
                });
            x.domain(d3.extent(data, function (d) {
                return d.Date;
            }));
            y.domain(d3.extent(data, function (d) {
                return d.Close;
            }));

            g.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .select(".domain");

            g.append("g")
                .call(d3.axisLeft(y))
                .append("text")
                .attr("fill", "#000")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Cost ($)");

            g.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1.5)
                .attr("d", line);
        }
    };
}
