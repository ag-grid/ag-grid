// for cell height & width
const CELL_DIMENSION_SIZE = 90;

let columnDefs = [
    {headerName: 'Symbol', field: 'Symbol', width: 222},
    {headerName: 'Date', field: 'Date', width: 190},
    {headerName: 'Open', field: 'Open', width: 180},
    {headerName: 'High', field: 'High', width: 160},
    {headerName: 'Low', field: 'Low', width: 150},
    {headerName: 'Close', field: 'Close', width: 170},
    {
        headerName: 'Close Trend',
        field: 'CloseTrends',
        width: 110,
        suppressResize: true,
        suppressSizeToFit: true,
        cellRenderer: LineChartLineRenderer
    },
    {
        headerName: 'Average Volume',
        field: 'AverageVolume',
        width: 130,
        suppressResize: true,
        suppressSizeToFit: true,
        cellRenderer: BarChartLineRenderer
    },
    {
        headerName: 'Target Expenditure',
        field: 'targetExpenditure',
        width: 415,
        editable: true,
        cellEditor: PieChartLineEditor,
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
        width: 120,
        suppressResize: true,
        suppressSizeToFit: true,
        cellRenderer: PieChartLineRenderer,
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
        enableColResize: false,
        rowSelection: 'single',
        rowHeight: 95,
        onGridReady: function (params) {
            params.api.sizeColumnsToFit();
        },
        onModelUpdated: () => {
            let updatedNodes = [];
            gridOptions.api.forEachNode(function (node) {
                updatedNodes.push(node);
            });
            // now tell the grid it needs refresh all these column, and let jquery do its thing
            gridOptions.api.refreshCells({
                rowNodes: updatedNodes,
                columns: ['CloseTrends', 'AverageVolume', 'Expenditure'],
                force: true
            });
        },
        onCellClicked: (params) => {
            if (params.colDef.field !== "CloseTrends") {
                return;
            }

            renderLineGraph(params.data.Symbol);
        }
    }
;


function LineChartLineRenderer() {
}

LineChartLineRenderer.prototype.init = function (params) {
    this.eGui = document.createElement('div');
    this.eGui.id = `${params.colDef.field}_${params.rowIndex}_line`;
};

LineChartLineRenderer.prototype.getGui = function () {
    return this.eGui;
};

LineChartLineRenderer.prototype.refresh = function (params) {
    // first sort by date, then retrieve the Close values
    let values = params.value
        .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
        .map((datum) => datum.Close);
    $(`#${this.eGui.id}`).sparkline(values, {height: CELL_DIMENSION_SIZE, width: CELL_DIMENSION_SIZE});
};


function BarChartLineRenderer() {
}

BarChartLineRenderer.prototype.init = function (params) {
    this.eGui = document.createElement('div');
    this.eGui.id = `${params.colDef.field}_${params.rowIndex}_bar`
};

BarChartLineRenderer.prototype.getGui = function () {
    return this.eGui;
};

BarChartLineRenderer.prototype.refresh = function (params) {
    // first sort by year, then extract values
    let values = params.value
        .sort((a, b) => a.Year - b.Year)
        .map((datum) => datum.AverageVolume.toFixed());
    $(`#${this.eGui.id}`).sparkline(values, {
        type: 'bar',
        barColor: 'green',
        chartRangeMin: 1000000,
        barWidth: 11,
        height: CELL_DIMENSION_SIZE,
        width: CELL_DIMENSION_SIZE
    });
};

function PieChartLineRenderer() {
}

PieChartLineRenderer.prototype.init = function (params) {
    this.eGui = document.createElement('div');
    this.eGui.id = `${params.colDef.field}_${params.rowIndex}_pie`
};

PieChartLineRenderer.prototype.getGui = function () {
    return this.eGui;
};

PieChartLineRenderer.prototype.refresh = function (params) {
    let segments = params.segments;
    let colourToNames = _.invert(segments);
    let values = Object.keys(segments).map((segment) => {
        return params.value[segment];
    });
    let sliceColours = Object.values(segments);
    $(`#${this.eGui.id}`).sparkline(values,
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
    this.eGui.id = `${params.column.colDef.field}_${params.rowIndex}_pie_editor`;

    this.parentGui.appendChild(this.eGui);
};

PieChartLineEditor.prototype.getGui = function () {
    return this.parentGui;
};

PieChartLineEditor.prototype.afterGuiAttached = function () {
    let segments = this.params.segments;
    let colourToNames = _.invert(segments);
    let values = Object.keys(segments).map((segment) => {
        return this.params.node.data[this.params.colToUseForRendering][segment];
    });
    let sliceColours = Object.values(segments);

    let thisSparkline = $(`#${this.eGui.id}`);
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
    httpRequest.open('GET', '../javascript-grid-graphing/inline-graphs/stocks/summaryExpanded.json');
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
    httpRequest.open('GET', `../javascript-grid-graphing/inline-graphs/stocks/${symbol}-close-trend.json`);
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
