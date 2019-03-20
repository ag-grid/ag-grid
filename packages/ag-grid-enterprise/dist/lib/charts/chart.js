// ag-grid-enterprise v20.2.0
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
var linearScale_1 = require("./scale/linearScale");
var ag_grid_community_1 = require("ag-grid-community");
var bandScale_1 = require("./scale/bandScale");
var canvas_1 = require("./canvas/canvas");
var canvasAxis_1 = require("./canvasAxis");
var cartesianChart_1 = require("./chart/cartesianChart");
var categoryAxis_1 = require("./chart/axis/categoryAxis");
var numberAxis_1 = require("./chart/axis/numberAxis");
var barSeries_1 = require("./chart/series/barSeries");
var gradientTheme = [
    ['#69C5EC', '#53AFD6'],
    ['#FDED7C', '#FDE95C'],
    ['#B6D471', '#A4CA4E'],
    ['#EC866B', '#E76846'],
    ['#FB9D5D', '#FA8535'],
];
var Chart_Old = /** @class */ (function (_super) {
    __extends(Chart_Old, _super);
    function Chart_Old(chartOptions) {
        var _this = _super.call(this, "<div></div>") || this;
        _this.chartOptions = chartOptions;
        var canvas = canvas_1.createHdpiCanvas(_this.chartOptions.width, _this.chartOptions.height);
        _this.eCanvas = canvas;
        _this.datasource = chartOptions.datasource;
        _this.datasource.addEventListener('modelUpdated', _this.refresh.bind(_this));
        _this.refresh();
        return _this;
    }
    Chart_Old.prototype.refresh = function () {
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
    Chart_Old.prototype.destroy = function () {
        if (this.chartOptions.datasource) {
            this.chartOptions.datasource.destroy();
        }
    };
    Chart_Old.prototype.drawChart = function () {
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
    return Chart_Old;
}(ag_grid_community_1.Component));
exports.Chart_Old = Chart_Old;
var Chart = /** @class */ (function (_super) {
    __extends(Chart, _super);
    function Chart(chartOptions) {
        var _this = _super.call(this, "<div><div ref=\"eChart\"></div><div ref=\"eErrors\"></div></div>") || this;
        _this.chartOptions = chartOptions;
        _this.datasource = chartOptions.datasource;
        _this.datasource.addEventListener('modelUpdated', _this.refresh.bind(_this));
        _this.setupChart();
        _this.refresh();
        return _this;
    }
    Chart.prototype.setupChart = function () {
        this.chart = new cartesianChart_1.CartesianChart(new categoryAxis_1.CategoryAxis(), new numberAxis_1.NumberAxis(), this.eChart);
        this.chart.width = 1200;
        this.chart.height = 800;
        this.chart.padding = {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50
        };
        this.barSeries = new barSeries_1.BarSeries();
        this.chart.addSeries(this.barSeries);
        this.barSeries.grouped = false;
    };
    Chart.prototype.refresh = function () {
        var errors = this.datasource.getErrors();
        var eGui = this.getGui();
        var errorsExist = errors && errors.length > 0;
        ag_grid_community_1._.setVisible(this.eChart, !errorsExist);
        ag_grid_community_1._.setVisible(this.eErrors, errorsExist);
        if (errorsExist) {
            var html_2 = [];
            html_2.push("Could not create chart:");
            html_2.push("<ul>");
            errors.forEach(function (error) { return html_2.push("<li>" + error + "</li>"); });
            html_2.push("</ul>");
            eGui.innerHTML = html_2.join('');
        }
        else {
            this.drawChart();
        }
    };
    Chart.prototype.destroy = function () {
        if (this.chartOptions.datasource) {
            this.chartOptions.datasource.destroy();
        }
    };
    Chart.prototype.drawChart = function () {
        var ds = this.datasource;
        var data = [];
        var rowCount = ds.getRowCount();
        var fields = ds.getFields();
        this.barSeries.yFieldNames = ds.getFieldNames();
        var _loop_2 = function (i) {
            var item = {
                category: ds.getCategory(i)
            };
            fields.forEach(function (field) { return item[field] = ds.getValue(i, field); });
            data.push(item);
        };
        // this.barSeries.yFields = fields;
        // this.barSeries.xField = 'category';
        for (var i = 0; i < rowCount; i++) {
            _loop_2(i);
        }
        // this.barSeries.data = data;
        this.barSeries.setDataAndFields(data, 'category', fields);
        /*
        let yData: any[][] = [];
        let yFieldNames: string[] = [];

        const ds = this.chartOptions.datasource;
        const xData = ds.getFieldNames();
        const yFields = ds.getFields();
        const rowCount = ds.getRowCount();

        const getValuesForField = (field: string): any[] => {
            const res: any[] = [];
            for (let i = 0; i<rowCount; i++) {
                const val = ds.getValue(i, field);
                res.push(val);
            }
            return res;
        };

        yFieldNames = [];
        for (let i = 0; i<rowCount; i++) {
            yFieldNames.push(ds.getCategory(i));
        }

        yData = [];
        yFields.forEach( yField => {
            const values = getValuesForField(yField);
            yData.push(values);
        });

        const padding = {
            top: 20,
            right: 40,
            bottom: 40,
            left: 60
        };

        const canvasWidth = this.chartOptions.width;
        const canvasHeight = this.chartOptions.height;
        const seriesWidth = canvasWidth - padding.left - padding.right;
        const seriesHeight = canvasHeight - padding.top - padding.bottom;

        const yScale = scaleLinear();
        // Find the tallest bar in each group, then the tallest bar overall.
        yScale.domain = [0, Math.max(...yData.map(values => Math.max(...values)))];
        yScale.range = [seriesHeight, 0];

        const xGroupScale = new BandScale<string>();
        xGroupScale.domain = xData;
        xGroupScale.range = [0, seriesWidth];
        xGroupScale.paddingInner = 0.1;
        xGroupScale.paddingOuter = 0.3;
        const groupWidth = xGroupScale.bandwidth;

        const xBarScale = new BandScale<string>();
        xBarScale.domain = yFieldNames;
        xBarScale.range = [0, groupWidth];
        xBarScale.padding = 0.1;
        xBarScale.round = true;
        const barWidth = xBarScale.bandwidth;

        const ctx = this.eCanvas.getContext('2d')!;
        ctx.font = '14px Verdana';

        const colors = gradientTheme;

        // bars
        ctx.save();
        ctx.translate(padding.left, padding.top);
        for (let i = 0; i < xData.length; i++) {
            const category = xData[i];
            const values = yData[i];
            const groupX = xGroupScale.convert(category); // x-coordinate of the group
            values.forEach((value, j) => {
                const barX = xBarScale.convert(yFieldNames[j]); // x-coordinate of the bar within a group
                const x = groupX + barX;
                const y = yScale.convert(value);

                const color = colors[j % colors.length];
                if (Array.isArray(color)) {
                    const gradient = ctx.createLinearGradient(x, y, x + barWidth, seriesHeight);
                    gradient.addColorStop(0, color[0]);
                    gradient.addColorStop(1, color[1]);
                    ctx.fillStyle = gradient;
                } else {
                    ctx.fillStyle = color;
                }
                ctx.fillRect(x, y, barWidth, seriesHeight - y);
                ctx.strokeRect(x, y, barWidth, seriesHeight - y);

                const label = yFieldNames[j];
                const labelWidth = ctx.measureText(label).width;
                if (labelWidth < barWidth - 10) {
                    ctx.fillStyle = 'black';
                    ctx.fillText(label, x + barWidth / 2 - labelWidth / 2, y + 20);
                }
            })
        }
        ctx.restore();

        // y-axis
        const yAxis = new CanvasAxis<number>(yScale);
        yAxis.translation = [padding.left, padding.top];
        yAxis.render(ctx);

        // x-axis
        const xAxis = new CanvasAxis<string>(xGroupScale);
        xAxis.rotation = -Math.PI / 2;
        xAxis.translation = [padding.left, padding.top + seriesHeight];
        xAxis.flippedLabels = true;
        xAxis.render(ctx);*/
    };
    __decorate([
        ag_grid_community_1.RefSelector('eChart'),
        __metadata("design:type", HTMLElement)
    ], Chart.prototype, "eChart", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eErrors'),
        __metadata("design:type", HTMLElement)
    ], Chart.prototype, "eErrors", void 0);
    return Chart;
}(ag_grid_community_1.Component));
exports.Chart = Chart;
