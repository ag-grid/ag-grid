// ag-grid-enterprise v20.1.0
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var linearScale_1 = require("./scale/linearScale");
var ag_grid_community_1 = require("ag-grid-community");
var bandScale_1 = require("./scale/bandScale");
var canvas_1 = require("./canvas/canvas");
var canvasAxis_1 = require("./canvasAxis");
var gradientTheme = [
    ['#69C5EC', '#53AFD6'],
    ['#FDED7C', '#FDE95C'],
    ['#B6D471', '#A4CA4E'],
    ['#EC866B', '#E76846'],
    ['#FB9D5D', '#FA8535'],
];
var Chart = /** @class */ (function (_super) {
    __extends(Chart, _super);
    function Chart(chartOptions) {
        var _this = _super.call(this, "<div></div>") || this;
        _this.chartOptions = chartOptions;
        var canvas = canvas_1.createHdpiCanvas(_this.chartOptions.width, _this.chartOptions.height);
        _this.eCanvas = canvas;
        _this.datasource = chartOptions.datasource;
        _this.datasource.addEventListener('modelUpdated', _this.refresh.bind(_this));
        _this.refresh();
        return _this;
    }
    Chart.prototype.refresh = function () {
        var errors = this.datasource.getErrors();
        var eGui = this.getGui();
        ag_grid_community_1._.clearElement(eGui);
        if (errors && errors.length > 0) {
            var html_1 = [];
            html_1.push("Could not create chart:");
            html_1.push("<ul>");
            errors.forEach(function (error) { return html_1.push("<li>" + error + "</li>"); });
            html_1.push("</ul>");
            eGui.innerHTML = html_1.join('');
        }
        else {
            var ctx = this.eCanvas.getContext('2d');
            ctx.clearRect(0, 0, this.chartOptions.width, this.chartOptions.height);
            this.drawChart();
            eGui.appendChild(this.eCanvas);
        }
    };
    Chart.prototype.destroy = function () {
        if (this.chartOptions.datasource) {
            this.chartOptions.datasource.destroy();
        }
    };
    Chart.prototype.drawChart = function () {
        var yData = [];
        var yFieldNames = [];
        var ds = this.chartOptions.datasource;
        var xData = ds.getFieldNames();
        var yFields = ds.getFields();
        var rowCount = ds.getRowCount();
        var getValuesForField = function (field) {
            var res = [];
            for (var i = 0; i < rowCount; i++) {
                var val = ds.getValue(i, field);
                res.push(val);
            }
            return res;
        };
        yFieldNames = [];
        for (var i = 0; i < rowCount; i++) {
            yFieldNames.push(ds.getCategory(i));
        }
        yData = [];
        yFields.forEach(function (yField) {
            var values = getValuesForField(yField);
            yData.push(values);
        });
        var padding = {
            top: 20,
            right: 40,
            bottom: 40,
            left: 60
        };
        var canvasWidth = this.chartOptions.width;
        var canvasHeight = this.chartOptions.height;
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
        xBarScale.domain = yFieldNames;
        xBarScale.range = [0, groupWidth];
        xBarScale.padding = 0.1;
        xBarScale.round = true;
        var barWidth = xBarScale.bandwidth;
        var ctx = this.eCanvas.getContext('2d');
        ctx.font = '14px Verdana';
        var colors = gradientTheme;
        // bars
        ctx.save();
        ctx.translate(padding.left, padding.top);
        var _loop_1 = function (i) {
            var category = xData[i];
            var values = yData[i];
            var groupX = xGroupScale.convert(category); // x-coordinate of the group
            values.forEach(function (value, j) {
                var barX = xBarScale.convert(yFieldNames[j]); // x-coordinate of the bar within a group
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
                if (labelWidth < barWidth - 10) {
                    ctx.fillStyle = 'black';
                    ctx.fillText(label, x + barWidth / 2 - labelWidth / 2, y + 20);
                }
            });
        };
        for (var i = 0; i < xData.length; i++) {
            _loop_1(i);
        }
        ctx.restore();
        // y-axis
        var yAxis = new canvasAxis_1.CanvasAxis(yScale);
        yAxis.translation = [padding.left, padding.top];
        yAxis.render(ctx);
        // x-axis
        var xAxis = new canvasAxis_1.CanvasAxis(xGroupScale);
        xAxis.rotation = -Math.PI / 2;
        xAxis.translation = [padding.left, padding.top + seriesHeight];
        xAxis.flippedLabels = true;
        xAxis.render(ctx);
    };
    return Chart;
}(ag_grid_community_1.Component));
exports.Chart = Chart;
