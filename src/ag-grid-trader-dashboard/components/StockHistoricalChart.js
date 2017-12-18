function StockHistoricalChart() {
}

StockHistoricalChart.prototype.init = function (graphId) {
    this.margin = {
        top: 20,
        right: 20,
        bottom: 50,
        left: 0
    };

    this.graphHeight = 200;
    this.graphWidth = 450;

    this.renderingHeight = this.graphHeight - this.margin.top - this.margin.bottom;
    this.renderingWidth = this.graphWidth - this.margin.left - this.margin.right;

    this.x = d3.scaleTime()
        .range([0, this.renderingWidth]);

    this.y = d3.scaleLinear()
        .rangeRound([this.renderingHeight, 0]);

    let self = this;
    this.line = d3.line()
        .x(function (d) {
            return self.x(d.date)
        })
        .y(function (d) {
            return self.y(d.price)
        });

    this.historyGraphTarget = document.getElementById(graphId)
};

StockHistoricalChart.prototype.renderGraph = function (historicalData) {
    if (!historicalData) {
        return;
    }

    let data = historicalData;
    let parseTime = d3.timeParse("%d-%m-%Y");
    data.forEach(function (datum) {
        datum.date = parseTime(datum.date);
        datum.price = +datum.price;
    });

    // clear out any previous graph
    d3.select(this.historyGraphTarget)
        .selectAll("svg")
        .remove();

    // create a new one
    let svg = d3.select(this.historyGraphTarget)
        .append('svg')
        .attr('height', this.graphHeight)
        .attr('width', this.graphWidth);

    let g = svg.append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.x.domain(d3.extent(data, function (d) {
        return d.date
    }));

    this.y.domain(d3.extent(data, function (d) {
        return d.price
    }));

    let scale = d3.scaleTime()
        .domain(d3.extent(data, function (d) {
            return d.date
        }))
        .range([0, this.renderingWidth]);

    // Add the x Axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (this.renderingHeight + 20 ) + ")")
        .call(d3.axisBottom(scale).tickFormat(d3.timeFormat("%Y-%m-%d")))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(55)")
        .style("text-anchor", "start");

    // Add the y Axis
    svg.append("g")
        .call(d3.axisLeft(this.y));

    g.append("g")
        .call(d3.axisLeft(this.y).tickFormat(""))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 9)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Price ($)");

    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", this.line);
};
