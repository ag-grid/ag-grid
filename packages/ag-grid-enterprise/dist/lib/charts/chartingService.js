// ag-grid-enterprise v20.0.0
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var rangeController_1 = require("../rangeController");
var linearScale_1 = require("./scale/linearScale");
var bandScale_1 = require("./scale/bandScale");
var canvas_1 = require("./canvas/canvas");
var axis_1 = require("./axis");
var ChartingService = /** @class */ (function () {
    function ChartingService() {
    }
    ChartingService.prototype.createChart = function () {
        var ranges = this.rangeController.getCellRanges();
        if (!ranges)
            return;
        var values = [];
        this.rowModel.forEachNode(function (node, index) {
            if (index >= ranges[0].start.rowIndex && index < ranges[0].end.rowIndex) {
                // @ts-ignore
                var value = node.data[ranges[0].columns[0].getId()];
                values.push(value);
            }
        });
        // showVerticalBarChart(values);
        // showHorizontalBarChart(values);
        showStackedBarChart();
        showGroupedBarChart();
    };
    __decorate([
        ag_grid_community_1.Autowired('rangeController'),
        __metadata("design:type", rangeController_1.RangeController)
    ], ChartingService.prototype, "rangeController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], ChartingService.prototype, "rowModel", void 0);
    ChartingService = __decorate([
        ag_grid_community_1.Bean('chartingService')
    ], ChartingService);
    return ChartingService;
}());
exports.ChartingService = ChartingService;
function showVerticalBarChart(data) {
    var padding = {
        top: 20,
        right: 40,
        bottom: 40,
        left: 40
    };
    var n = data.length;
    var xData = data.map(function (d, i) { return i.toString(); });
    var yData = data;
    var canvasWidth = document.body.getBoundingClientRect().width;
    var canvasHeight = 480;
    var seriesWidth = canvasWidth - padding.left - padding.right;
    var seriesHeight = canvasHeight - padding.top - padding.bottom;
    var yScale = linearScale_1.default();
    yScale.domain = [0, Math.max.apply(Math, yData)];
    yScale.range = [seriesHeight, 0];
    var xScale = new bandScale_1.BandScale();
    xScale.domain = xData;
    xScale.range = [0, seriesWidth];
    xScale.paddingInner = 0.1;
    xScale.paddingOuter = 0.3;
    var bandwidth = xScale.bandwidth;
    var canvas = canvas_1.createHdpiCanvas(canvasWidth, canvasHeight);
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    ctx.font = '14px Verdana';
    // bars
    ctx.save();
    ctx.translate(padding.left, padding.top);
    for (var i = 0; i < n; i++) {
        var category = xData[i];
        var value = yData[i];
        var x = xScale.convert(category);
        var y = yScale.convert(value);
        ctx.fillStyle = '#4983B2';
        ctx.fillRect(x, y, bandwidth, seriesHeight - y);
        ctx.fillStyle = 'black';
        var label = value.toString();
        var labelWidth = ctx.measureText(label).width;
        ctx.fillText(label, x + bandwidth / 2 - labelWidth / 2, y + 20);
    }
    ctx.restore();
    // y-axis
    var yAxis = new axis_1.Axis(yScale);
    yAxis.translation = [padding.left, padding.top];
    yAxis.render(ctx);
    // x-axis
    var xAxis = new axis_1.Axis(xScale);
    xAxis.rotation = -Math.PI / 2;
    xAxis.translation = [padding.left, padding.top + seriesHeight];
    xAxis.flippedLabels = true;
    xAxis.render(ctx);
}
function showHorizontalBarChart(data) {
    var padding = {
        top: 20,
        right: 40,
        bottom: 40,
        left: 40
    };
    var n = data.length;
    var xData = data.map(function (d, i) { return i.toString(); });
    var yData = data;
    var canvasWidth = document.body.getBoundingClientRect().width;
    var canvasHeight = 480;
    var seriesWidth = canvasWidth - padding.left - padding.right;
    var seriesHeight = canvasHeight - padding.top - padding.bottom;
    var xScale = linearScale_1.default();
    xScale.domain = [0, Math.max.apply(Math, yData)];
    xScale.range = [0, seriesWidth];
    var yScale = new bandScale_1.BandScale();
    yScale.domain = xData;
    yScale.range = [seriesHeight, 0];
    yScale.paddingInner = 0.1;
    yScale.paddingOuter = 0.3;
    var bandwidth = yScale.bandwidth;
    var canvas = canvas_1.createHdpiCanvas(canvasWidth, canvasHeight);
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    ctx.font = '14px Verdana';
    ctx.textBaseline = 'middle';
    // bars
    ctx.save();
    ctx.translate(padding.left, padding.top);
    for (var i = 0; i < n; i++) {
        var category = xData[i];
        var value = yData[i];
        var x = xScale.convert(value);
        var y = yScale.convert(category);
        ctx.fillStyle = '#4983B2';
        ctx.fillRect(0, y, x, bandwidth);
        ctx.fillStyle = 'black';
        var label = value.toString();
        var labelWidth = ctx.measureText(label).width;
        ctx.fillText(label, x - labelWidth - 10, y + bandwidth / 2);
    }
    ctx.restore();
    // x-axis
    var xAxis = new axis_1.Axis(xScale);
    xAxis.rotation = -Math.PI / 2;
    xAxis.translation = [padding.left, padding.top + seriesHeight];
    xAxis.flippedLabels = true;
    xAxis.render(ctx);
    // y-axis
    var yAxis = new axis_1.Axis(yScale);
    yAxis.translation = [padding.left, padding.top];
    yAxis.render(ctx);
}
function drawRect(ctx, x1, y1, x2, y2, fill, stroke) {
    if (fill) {
        ctx.fillStyle = fill;
    }
    if (stroke) {
        ctx.strokeStyle = stroke;
    }
    var width = x2 - x1;
    var height = y2 - y1;
    ctx.fillRect(x1, y1, width, height);
    ctx.strokeRect(x1, y1, width, height);
}
var colorTheme1 = [
    '#5BC0EB',
    '#FDE74C',
    '#9BC53D',
    '#E55934',
    '#FA7921',
];
var colorTheme2 = [
    '#94ae0a',
    '#115fa6',
    '#a61120',
    '#ff8809',
    '#ffd13e',
    '#a61187',
    '#24ad9a',
];
var colorTheme3 = [
    ['#69C5EC', '#53AFD6'],
    ['#FDED7C', '#FDE95C'],
    ['#B6D471', '#A4CA4E'],
    ['#EC866B', '#E76846'],
    ['#FB9D5D', '#FA8535'],
];
function showStackedBarChart() {
    var data = [
        {
            category: 'Coffee',
            q1Budget: 500,
            q2Budget: 500,
            q3Budget: 500,
            q4Budget: 500,
            q1Actual: 450,
            q2Actual: 560,
            q3Actual: 600,
            q4Actual: 700
        },
        {
            category: 'Tea',
            q1Budget: 350,
            q2Budget: 400,
            q3Budget: 450,
            q4Budget: 500,
            q1Actual: 270,
            q2Actual: 380,
            q3Actual: 450,
            q4Actual: 520
        },
        {
            category: 'Milk',
            q1Budget: 200,
            q2Budget: 180,
            q3Budget: 180,
            q4Budget: 180,
            q1Actual: 180,
            q2Actual: 170,
            q3Actual: 190,
            q4Actual: 200
        },
    ];
    var yFields = ['q1Actual', 'q2Actual', 'q3Actual', 'q4Actual'];
    var yFieldNames = ['Q1', 'Q2', 'Q3', 'Q4'];
    var colors = colorTheme3;
    var padding = {
        top: 20,
        right: 40,
        bottom: 40,
        left: 60
    };
    var n = data.length;
    var xData = data.map(function (d) { return d.category; });
    // For each category returns an array of values representing the top
    // of each bar in the stack, the last value being the height of the stack.
    var yData = data.map(function (datum) {
        var values = [];
        var sum = 0;
        yFields.forEach(function (field) { return values.push(sum += datum[field]); });
        return values;
    });
    var canvasWidth = document.body.getBoundingClientRect().width;
    var canvasHeight = 480;
    var seriesWidth = canvasWidth - padding.left - padding.right;
    var seriesHeight = canvasHeight - padding.top - padding.bottom;
    var yScale = linearScale_1.default();
    // Get the height of each stack and find the highest one.
    yScale.domain = [0, Math.max.apply(Math, yData.map(function (d) { return d[d.length - 1]; }))];
    yScale.range = [seriesHeight, 0];
    var xScale = new bandScale_1.BandScale();
    xScale.domain = xData;
    xScale.range = [0, seriesWidth];
    xScale.paddingInner = 0.1;
    xScale.paddingOuter = 0.3;
    var barWidth = xScale.bandwidth;
    var canvas = canvas_1.createHdpiCanvas(canvasWidth, canvasHeight);
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    ctx.font = '14px Verdana';
    // bars
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 15;
    ctx.translate(padding.left, padding.top);
    var _loop_1 = function (i) {
        var category = xData[i];
        var values = yData[i];
        var x = xScale.convert(category);
        // Using reduce here simply to get pairs of numbers in the `values` array:
        // the bottom and top of each bar.
        var j = 0;
        values.reduce(function (bottom, top) {
            var yBottom = yScale.convert(bottom);
            var yTop = yScale.convert(top);
            var color = colors[j % colors.length];
            if (Array.isArray(color)) {
                var gradient = ctx.createLinearGradient(x, yTop, x + barWidth, yBottom);
                gradient.addColorStop(0, color[0]);
                gradient.addColorStop(1, color[1]);
                ctx.fillStyle = gradient;
            }
            else {
                ctx.fillStyle = color;
            }
            ctx.fillRect(x, yTop, barWidth, yBottom - yTop);
            ctx.strokeRect(x, yTop, barWidth, yBottom - yTop);
            var label = yFieldNames[j] + ': ' + data[i][yFields[j]].toString();
            var labelWidth = ctx.measureText(label).width;
            ctx.fillStyle = 'black';
            ctx.fillText(label, x + barWidth / 2 - labelWidth / 2, yTop + 20);
            j++;
            return top;
        }, 0);
    };
    for (var i = 0; i < n; i++) {
        _loop_1(i);
    }
    ctx.restore();
    // y-axis
    var yAxis = new axis_1.Axis(yScale);
    yAxis.translation = [padding.left, padding.top];
    yAxis.render(ctx);
    // x-axis
    var xAxis = new axis_1.Axis(xScale);
    xAxis.rotation = -Math.PI / 2;
    xAxis.translation = [padding.left, padding.top + seriesHeight];
    xAxis.flippedLabels = true;
    xAxis.render(ctx);
}
function showGroupedBarChart() {
    var data = [
        {
            category: 'Coffee',
            q1Budget: 500,
            q2Budget: 500,
            q3Budget: 500,
            q4Budget: 500,
            q1Actual: 450,
            q2Actual: 560,
            q3Actual: 600,
            q4Actual: 700
        },
        {
            category: 'Tea',
            q1Budget: 350,
            q2Budget: 400,
            q3Budget: 450,
            q4Budget: 500,
            q1Actual: 270,
            q2Actual: 380,
            q3Actual: 450,
            q4Actual: 520
        },
        {
            category: 'Milk',
            q1Budget: 200,
            q2Budget: 180,
            q3Budget: 180,
            q4Budget: 180,
            q1Actual: 180,
            q2Actual: 170,
            q3Actual: 190,
            q4Actual: 200
        },
    ];
    var yFields = ['q1Actual', 'q2Actual', 'q3Actual', 'q4Actual'];
    var yFieldNames = ['Q1', 'Q2', 'Q3', 'Q4'];
    var colors = colorTheme3;
    var padding = {
        top: 20,
        right: 40,
        bottom: 40,
        left: 60
    };
    var n = data.length;
    var xData = data.map(function (d) { return d.category; });
    // For each category returns an array of values representing the height
    // of each bar in the group.
    var yData = data.map(function (datum) {
        var values = [];
        yFields.forEach(function (field) { return values.push(datum[field]); });
        return values;
    });
    var canvasWidth = document.body.getBoundingClientRect().width;
    var canvasHeight = 480;
    var seriesWidth = canvasWidth - padding.left - padding.right;
    var seriesHeight = canvasHeight - padding.top - padding.bottom;
    var yScale = linearScale_1.default();
    // Find the tallest bar in each group, then the tallest bar overall.
    yScale.domain = [0, Math.max.apply(Math, yData.map(function (values) { return Math.max.apply(Math, values); }))];
    yScale.range = [seriesHeight, 0];
    var xGroupScale = new bandScale_1.BandScale();
    xGroupScale.domain = xData;
    xGroupScale.range = [0, seriesWidth];
    xGroupScale.paddingInner = 0.1;
    xGroupScale.paddingOuter = 0.3;
    var groupWidth = xGroupScale.bandwidth;
    var xBarScale = new bandScale_1.BandScale();
    xBarScale.domain = yFields;
    xBarScale.range = [0, groupWidth];
    xBarScale.padding = 0.1;
    xBarScale.round = true;
    var barWidth = xBarScale.bandwidth;
    var canvas = canvas_1.createHdpiCanvas(canvasWidth, canvasHeight);
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    ctx.font = '14px Verdana';
    // bars
    ctx.save();
    ctx.translate(padding.left, padding.top);
    var _loop_2 = function (i) {
        var category = xData[i];
        var values = yData[i];
        var groupX = xGroupScale.convert(category); // x-coordinate of the group
        values.forEach(function (value, j) {
            var barX = xBarScale.convert(yFields[j]); // x-coordinate of the bar within a group
            var x = groupX + barX;
            var y = yScale.convert(value);
            var color = colors[j % colors.length];
            if (Array.isArray(color)) {
                var gradient = ctx.createLinearGradient(x, y, x + barWidth, seriesHeight);
                gradient.addColorStop(0, color[0]);
                gradient.addColorStop(1, color[1]);
                ctx.fillStyle = gradient;
            }
            else {
                ctx.fillStyle = color;
            }
            ctx.fillRect(x, y, barWidth, seriesHeight - y);
            ctx.strokeRect(x, y, barWidth, seriesHeight - y);
            var label = yFieldNames[j];
            var labelWidth = ctx.measureText(label).width;
            ctx.fillStyle = 'black';
            ctx.fillText(label, x + barWidth / 2 - labelWidth / 2, y + 20);
        });
    };
    for (var i = 0; i < n; i++) {
        _loop_2(i);
    }
    ctx.restore();
    // y-axis
    var yAxis = new axis_1.Axis(yScale);
    yAxis.translation = [padding.left, padding.top];
    yAxis.render(ctx);
    // x-axis
    var xAxis = new axis_1.Axis(xGroupScale);
    xAxis.rotation = -Math.PI / 2;
    xAxis.translation = [padding.left, padding.top + seriesHeight];
    xAxis.flippedLabels = true;
    xAxis.render(ctx);
}
