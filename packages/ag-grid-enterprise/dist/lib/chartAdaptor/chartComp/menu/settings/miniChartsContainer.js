// ag-grid-enterprise v21.2.2
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
var ag_grid_community_1 = require("ag-grid-community");
var chartTranslator_1 = require("../../chartTranslator");
var group_1 = require("../../../../charts/scene/group");
var scene_1 = require("../../../../charts/scene/scene");
var angle_1 = require("../../../../charts/util/angle");
var sector_1 = require("../../../../charts/scene/shape/sector");
var path_1 = require("../../../../charts/scene/shape/path");
var linearScale_1 = require("../../../../charts/scale/linearScale");
var line_1 = require("../../../../charts/scene/shape/line");
var clipRect_1 = require("../../../../charts/scene/clipRect");
var rect_1 = require("../../../../charts/scene/shape/rect");
var bandScale_1 = require("../../../../charts/scale/bandScale");
var arc_1 = require("../../../../charts/scene/shape/arc");
var MiniChartsContainer = /** @class */ (function (_super) {
    __extends(MiniChartsContainer, _super);
    function MiniChartsContainer(activePalette, chartController) {
        var _this = _super.call(this, MiniChartsContainer.TEMPLATE) || this;
        _this.wrappers = {};
        var palettes = chartController.getPalettes();
        _this.fills = palettes[activePalette].fills;
        _this.strokes = palettes[activePalette].strokes;
        _this.chartController = chartController;
        return _this;
    }
    MiniChartsContainer.prototype.init = function () {
        var _this = this;
        var chartGroups = {
            columnGroup: [
                MiniColumn,
                MiniStackedColumn,
                MiniNormalizedColumn
            ],
            barGroup: [
                MiniBar,
                MiniStackedBar,
                MiniNormalizedBar
            ],
            pieGroup: [
                MiniPie,
                MiniDoughnut
            ],
            lineGroup: [
                MiniLine
            ],
            scatterGroup: [
                MiniScatter,
                MiniBubble
            ],
            areaGroup: [
                MiniArea,
                MiniStackedArea,
                MiniNormalizedArea
            ]
        };
        var eGui = this.getGui();
        Object.keys(chartGroups).forEach(function (group) {
            var chartGroup = chartGroups[group];
            var groupComponent = new ag_grid_community_1.AgGroupComponent({
                title: _this.chartTranslator.translate(group),
                suppressEnabledCheckbox: true,
                enabled: true,
                suppressOpenCloseIcons: true
            });
            _this.getContext().wireBean(groupComponent);
            chartGroup.forEach(function (MiniClass) {
                var miniWrapper = document.createElement('div');
                ag_grid_community_1._.addCssClass(miniWrapper, 'ag-chart-mini-thumbnail');
                _this.addDestroyableEventListener(miniWrapper, 'click', function () {
                    _this.chartController.setChartType(MiniClass.chartType);
                    _this.refreshSelected();
                });
                _this.wrappers[MiniClass.chartType] = miniWrapper;
                var miniChart = new MiniClass(miniWrapper, _this.fills, _this.strokes);
                _this.getContext().wireBean(miniChart);
                groupComponent.addItem(miniWrapper);
            });
            eGui.appendChild(groupComponent.getGui());
        });
        this.refreshSelected();
    };
    MiniChartsContainer.prototype.refreshSelected = function () {
        var type = this.chartController.getChartType();
        for (var wrapper in this.wrappers) {
            ag_grid_community_1._.addOrRemoveCssClass(this.wrappers[wrapper], 'ag-selected', wrapper === type);
        }
    };
    MiniChartsContainer.TEMPLATE = '<div class="ag-chart-settings-mini-wrapper"></div>';
    __decorate([
        ag_grid_community_1.Autowired('chartTranslator'),
        __metadata("design:type", chartTranslator_1.ChartTranslator)
    ], MiniChartsContainer.prototype, "chartTranslator", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MiniChartsContainer.prototype, "init", null);
    return MiniChartsContainer;
}(ag_grid_community_1.Component));
exports.MiniChartsContainer = MiniChartsContainer;
var MiniChart = /** @class */ (function (_super) {
    __extends(MiniChart, _super);
    function MiniChart() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.size = 58;
        _this.padding = 5;
        _this.root = new group_1.Group();
        _this.scene = (function () {
            var scene = new scene_1.Scene({
                width: _this.size,
                height: _this.size
            });
            scene.root = _this.root;
            return scene;
        })();
        _this.element = _this.scene.canvas.element;
        return _this;
    }
    __decorate([
        ag_grid_community_1.Autowired('chartTranslator'),
        __metadata("design:type", chartTranslator_1.ChartTranslator)
    ], MiniChart.prototype, "chartTranslator", void 0);
    return MiniChart;
}(ag_grid_community_1.Component));
exports.MiniChart = MiniChart;
var MiniPie = /** @class */ (function (_super) {
    __extends(MiniPie, _super);
    function MiniPie(parent, fills, strokes) {
        var _this = _super.call(this) || this;
        _this.radius = (_this.size - _this.padding * 2) / 2;
        _this.center = _this.radius + _this.padding;
        _this.sectors = MiniPie.angles.map(function (pair) {
            var sector = sector_1.Sector.create(_this.center, _this.center, 0, _this.radius, pair[0], pair[1]);
            sector.stroke = undefined;
            return sector;
        });
        _this.scene.parent = parent;
        _this.root.append(_this.sectors);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniPie.prototype.init = function () {
        this.scene.canvas.element.title = this.chartTranslator.translate('pieTooltip');
    };
    MiniPie.prototype.updateColors = function (fills, strokes) {
        this.sectors.forEach(function (sector, i) {
            sector.fill = fills[i];
            sector.stroke = strokes[i];
        });
    };
    MiniPie.chartType = ag_grid_community_1.ChartType.Pie;
    MiniPie.angles = [
        [angle_1.toRadians(-90), angle_1.toRadians(30)],
        [angle_1.toRadians(30), angle_1.toRadians(120)],
        [angle_1.toRadians(120), angle_1.toRadians(180)],
        [angle_1.toRadians(180), angle_1.toRadians(210)],
        [angle_1.toRadians(210), angle_1.toRadians(240)],
        [angle_1.toRadians(240), angle_1.toRadians(270)]
    ];
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MiniPie.prototype, "init", null);
    return MiniPie;
}(MiniChart));
exports.MiniPie = MiniPie;
var MiniDoughnut = /** @class */ (function (_super) {
    __extends(MiniDoughnut, _super);
    function MiniDoughnut(parent, fills, strokes) {
        var _this = _super.call(this) || this;
        _this.radius = (_this.size - _this.padding * 2) / 2;
        _this.center = _this.radius + _this.padding;
        _this.sectors = MiniPie.angles.map(function (pair) {
            var sector = sector_1.Sector.create(_this.center, _this.center, _this.radius * 0.6, _this.radius, pair[0], pair[1]);
            sector.stroke = undefined;
            return sector;
        });
        _this.scene.parent = parent;
        _this.root.append(_this.sectors);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniDoughnut.prototype.init = function () {
        this.scene.canvas.element.title = this.chartTranslator.translate('doughnutTooltip');
    };
    MiniDoughnut.prototype.updateColors = function (fills, strokes) {
        this.sectors.forEach(function (sector, i) {
            sector.fill = fills[i];
            sector.stroke = strokes[i];
        });
    };
    MiniDoughnut.chartType = ag_grid_community_1.ChartType.Doughnut;
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MiniDoughnut.prototype, "init", null);
    return MiniDoughnut;
}(MiniChart));
var MiniLine = /** @class */ (function (_super) {
    __extends(MiniLine, _super);
    function MiniLine(parent, fills, strokes) {
        var _this = _super.call(this) || this;
        _this.scene.parent = parent;
        var size = _this.size;
        var padding = _this.padding;
        var xScale = linearScale_1.default();
        xScale.domain = [0, 4];
        xScale.range = [padding, size - padding];
        var yScale = linearScale_1.default();
        yScale.domain = [0, 10];
        yScale.range = [size - padding, padding];
        var data = [
            [9, 7, 8, 5, 6],
            [5, 6, 3, 4, 1],
            [1, 3, 4, 8, 7]
        ];
        var axisOvershoot = 3;
        var leftAxis = line_1.Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;
        var bottomAxis = line_1.Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;
        _this.lines = data.map(function (series) {
            var line = new path_1.Path();
            line.strokeWidth = 3;
            line.lineCap = 'round';
            line.fill = undefined;
            series.forEach(function (datum, i) {
                line.path[i > 0 ? 'lineTo' : 'moveTo'](xScale.convert(i), yScale.convert(datum));
            });
            return line;
        });
        var clipRect = new clipRect_1.ClipRect();
        clipRect.x = padding;
        clipRect.y = padding;
        clipRect.width = size - padding * 2;
        clipRect.height = size - padding * 2;
        clipRect.append(_this.lines);
        var root = _this.root;
        root.append(clipRect);
        root.append(leftAxis);
        root.append(bottomAxis);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniLine.prototype.init = function () {
        this.scene.canvas.element.title = this.chartTranslator.translate('lineTooltip');
    };
    MiniLine.prototype.updateColors = function (fills, strokes) {
        this.lines.forEach(function (line, i) {
            line.stroke = strokes[i];
        });
    };
    MiniLine.chartType = ag_grid_community_1.ChartType.Line;
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MiniLine.prototype, "init", null);
    return MiniLine;
}(MiniChart));
var MiniColumn = /** @class */ (function (_super) {
    __extends(MiniColumn, _super);
    function MiniColumn(parent, fills, strokes) {
        var _this = _super.call(this) || this;
        _this.scene.parent = parent;
        var size = _this.size;
        var padding = _this.padding;
        var data = [2, 3, 4];
        var xScale = new bandScale_1.BandScale();
        xScale.domain = [0, 1, 2];
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.3;
        xScale.paddingOuter = 0.3;
        var yScale = linearScale_1.default();
        yScale.domain = [0, 4];
        yScale.range = [size - padding, padding];
        var axisOvershoot = 3;
        var leftAxis = line_1.Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;
        var bottomAxis = line_1.Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;
        _this.axes = [leftAxis, bottomAxis];
        var rectLineWidth = 1;
        var alignment = Math.floor(rectLineWidth) % 2 / 2;
        var bottom = yScale.convert(0);
        _this.bars = data.map(function (datum, i) {
            var top = yScale.convert(datum);
            var rect = new rect_1.Rect();
            rect.strokeWidth = rectLineWidth;
            rect.x = Math.floor(xScale.convert(i)) + alignment;
            rect.y = Math.floor(top) + alignment;
            var width = xScale.bandwidth;
            var height = bottom - top;
            rect.width = Math.floor(width) + Math.floor(rect.x % 1 + width % 1);
            rect.height = Math.floor(height) + Math.floor(rect.y % 1 + height % 1);
            return rect;
        });
        var root = _this.root;
        root.append(_this.bars);
        root.append(leftAxis);
        root.append(bottomAxis);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniColumn.prototype.init = function () {
        this.scene.canvas.element.title = this.chartTranslator.translate('groupedColumnTooltip');
    };
    MiniColumn.prototype.updateColors = function (fills, strokes) {
        this.bars.forEach(function (bar, i) {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
        });
    };
    MiniColumn.chartType = ag_grid_community_1.ChartType.GroupedColumn;
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MiniColumn.prototype, "init", null);
    return MiniColumn;
}(MiniChart));
var MiniBar = /** @class */ (function (_super) {
    __extends(MiniBar, _super);
    function MiniBar(parent, fills, strokes) {
        var _this = _super.call(this) || this;
        _this.scene.parent = parent;
        var size = _this.size;
        var padding = _this.padding;
        var data = [2, 3, 4];
        var yScale = new bandScale_1.BandScale();
        yScale.domain = [0, 1, 2];
        yScale.range = [padding, size - padding];
        yScale.paddingInner = 0.3;
        yScale.paddingOuter = 0.3;
        var xScale = linearScale_1.default();
        xScale.domain = [0, 4];
        xScale.range = [size - padding, padding];
        var axisOvershoot = 3;
        var leftAxis = line_1.Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;
        var bottomAxis = line_1.Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;
        _this.axes = [leftAxis, bottomAxis];
        var rectLineWidth = 1;
        var alignment = Math.floor(rectLineWidth) % 2 / 2;
        var bottom = xScale.convert(0);
        _this.bars = data.map(function (datum, i) {
            var top = xScale.convert(datum);
            var rect = new rect_1.Rect();
            rect.strokeWidth = rectLineWidth;
            rect.x = Math.floor(padding) + alignment;
            rect.y = Math.floor(yScale.convert(i)) + alignment;
            var width = yScale.bandwidth;
            var height = bottom - top;
            rect.width = Math.floor(height) + Math.floor(rect.y % 1 + height % 1);
            rect.height = Math.floor(width) + Math.floor(rect.x % 1 + width % 1);
            return rect;
        });
        var root = _this.root;
        root.append(_this.bars);
        root.append(leftAxis);
        root.append(bottomAxis);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniBar.prototype.init = function () {
        this.scene.canvas.element.title = this.chartTranslator.translate('groupedBarTooltip');
    };
    MiniBar.prototype.updateColors = function (fills, strokes) {
        this.bars.forEach(function (bar, i) {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
        });
    };
    MiniBar.chartType = ag_grid_community_1.ChartType.GroupedBar;
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MiniBar.prototype, "init", null);
    return MiniBar;
}(MiniChart));
var MiniStackedColumn = /** @class */ (function (_super) {
    __extends(MiniStackedColumn, _super);
    function MiniStackedColumn(parent, fills, strokes) {
        var _this = _super.call(this) || this;
        _this.scene.parent = parent;
        var size = _this.size;
        var padding = _this.padding;
        var data = [
            [8, 12, 16],
            [6, 9, 12],
            [2, 3, 4]
        ];
        var xScale = new bandScale_1.BandScale();
        xScale.domain = [0, 1, 2];
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.3;
        xScale.paddingOuter = 0.3;
        var yScale = linearScale_1.default();
        yScale.domain = [0, 16];
        yScale.range = [size - padding, padding];
        var axisOvershoot = 3;
        var leftAxis = line_1.Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;
        var bottomAxis = line_1.Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;
        var rectLineWidth = 1;
        var alignment = Math.floor(rectLineWidth) % 2 / 2;
        var bottom = yScale.convert(0);
        _this.bars = data.map(function (series) {
            return series.map(function (datum, i) {
                var top = yScale.convert(datum);
                var rect = new rect_1.Rect();
                rect.strokeWidth = rectLineWidth;
                rect.x = Math.floor(xScale.convert(i)) + alignment;
                rect.y = Math.floor(top) + alignment;
                var width = xScale.bandwidth;
                var height = bottom - top;
                rect.width = Math.floor(width) + Math.floor(rect.x % 1 + width % 1);
                rect.height = Math.floor(height) + Math.floor(rect.y % 1 + height % 1);
                return rect;
            });
        });
        var root = _this.root;
        root.append([].concat.apply([], _this.bars));
        root.append(leftAxis);
        root.append(bottomAxis);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniStackedColumn.prototype.init = function () {
        this.scene.canvas.element.title = this.chartTranslator.translate('stackedColumnTooltip');
    };
    MiniStackedColumn.prototype.updateColors = function (fills, strokes) {
        this.bars.forEach(function (series, i) {
            series.forEach(function (bar) {
                bar.fill = fills[i];
                bar.stroke = strokes[i];
            });
        });
    };
    MiniStackedColumn.chartType = ag_grid_community_1.ChartType.StackedColumn;
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MiniStackedColumn.prototype, "init", null);
    return MiniStackedColumn;
}(MiniChart));
var MiniStackedBar = /** @class */ (function (_super) {
    __extends(MiniStackedBar, _super);
    function MiniStackedBar(parent, fills, strokes) {
        var _this = _super.call(this) || this;
        _this.scene.parent = parent;
        var size = _this.size;
        var padding = _this.padding;
        var data = [
            [8, 12, 16],
            [6, 9, 12],
            [2, 3, 4]
        ];
        var yScale = new bandScale_1.BandScale();
        yScale.domain = [0, 1, 2];
        yScale.range = [padding, size - padding];
        yScale.paddingInner = 0.3;
        yScale.paddingOuter = 0.3;
        var xScale = linearScale_1.default();
        xScale.domain = [0, 16];
        xScale.range = [size - padding, padding];
        var axisOvershoot = 3;
        var leftAxis = line_1.Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;
        var bottomAxis = line_1.Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;
        var rectLineWidth = 1;
        var alignment = Math.floor(rectLineWidth) % 2 / 2;
        var bottom = xScale.convert(0);
        _this.bars = data.map(function (series) {
            return series.map(function (datum, i) {
                var top = xScale.convert(datum);
                var rect = new rect_1.Rect();
                rect.strokeWidth = rectLineWidth;
                rect.x = Math.floor(padding) + alignment;
                rect.y = Math.floor(yScale.convert(i)) + alignment;
                var width = yScale.bandwidth;
                var height = bottom - top;
                rect.width = Math.floor(height) + Math.floor(rect.y % 1 + height % 1);
                rect.height = Math.floor(width) + Math.floor(rect.x % 1 + width % 1);
                return rect;
            });
        });
        var root = _this.root;
        root.append([].concat.apply([], _this.bars));
        root.append(leftAxis);
        root.append(bottomAxis);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniStackedBar.prototype.init = function () {
        this.scene.canvas.element.title = this.chartTranslator.translate('stackedBarTooltip');
    };
    MiniStackedBar.prototype.updateColors = function (fills, strokes) {
        this.bars.forEach(function (series, i) {
            series.forEach(function (bar) {
                bar.fill = fills[i];
                bar.stroke = strokes[i];
            });
        });
    };
    MiniStackedBar.chartType = ag_grid_community_1.ChartType.StackedBar;
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MiniStackedBar.prototype, "init", null);
    return MiniStackedBar;
}(MiniChart));
var MiniNormalizedColumn = /** @class */ (function (_super) {
    __extends(MiniNormalizedColumn, _super);
    function MiniNormalizedColumn(parent, fills, strokes) {
        var _this = _super.call(this) || this;
        _this.scene.parent = parent;
        var size = _this.size;
        var padding = _this.padding;
        var data = [
            [10, 10, 10],
            [6, 7, 8],
            [2, 4, 6]
        ];
        var xScale = new bandScale_1.BandScale();
        xScale.domain = [0, 1, 2];
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.3;
        xScale.paddingOuter = 0.3;
        var yScale = linearScale_1.default();
        yScale.domain = [0, 10];
        yScale.range = [size - padding, padding];
        var axisOvershoot = 3;
        var leftAxis = line_1.Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;
        var bottomAxis = line_1.Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;
        var rectLineWidth = 1;
        var alignment = Math.floor(rectLineWidth) % 2 / 2;
        var bottom = yScale.convert(0);
        _this.bars = data.map(function (series) {
            return series.map(function (datum, i) {
                var top = yScale.convert(datum);
                var rect = new rect_1.Rect();
                rect.strokeWidth = rectLineWidth;
                rect.x = Math.floor(xScale.convert(i)) + alignment;
                rect.y = Math.floor(top) + alignment;
                var width = xScale.bandwidth;
                var height = bottom - top;
                rect.width = Math.floor(width) + Math.floor(rect.x % 1 + width % 1);
                rect.height = Math.floor(height) + Math.floor(rect.y % 1 + height % 1);
                return rect;
            });
        });
        var root = _this.root;
        root.append([].concat.apply([], _this.bars));
        root.append(leftAxis);
        root.append(bottomAxis);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniNormalizedColumn.prototype.init = function () {
        this.scene.canvas.element.title = this.chartTranslator.translate('normalizedColumnTooltip');
    };
    MiniNormalizedColumn.prototype.updateColors = function (fills, strokes) {
        this.bars.forEach(function (series, i) {
            series.forEach(function (bar) {
                bar.fill = fills[i];
                bar.stroke = strokes[i];
            });
        });
    };
    MiniNormalizedColumn.chartType = ag_grid_community_1.ChartType.NormalizedColumn;
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MiniNormalizedColumn.prototype, "init", null);
    return MiniNormalizedColumn;
}(MiniChart));
var MiniNormalizedBar = /** @class */ (function (_super) {
    __extends(MiniNormalizedBar, _super);
    function MiniNormalizedBar(parent, fills, strokes) {
        var _this = _super.call(this) || this;
        _this.scene.parent = parent;
        var size = _this.size;
        var padding = _this.padding;
        var data = [
            [10, 10, 10],
            [6, 7, 8],
            [2, 4, 6]
        ];
        var yScale = new bandScale_1.BandScale();
        yScale.domain = [0, 1, 2];
        yScale.range = [padding, size - padding];
        yScale.paddingInner = 0.3;
        yScale.paddingOuter = 0.3;
        var xScale = linearScale_1.default();
        xScale.domain = [0, 10];
        xScale.range = [size - padding, padding];
        var axisOvershoot = 3;
        var leftAxis = line_1.Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;
        var bottomAxis = line_1.Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;
        var rectLineWidth = 1;
        var alignment = Math.floor(rectLineWidth) % 2 / 2;
        var bottom = xScale.convert(0);
        _this.bars = data.map(function (series) {
            return series.map(function (datum, i) {
                var top = xScale.convert(datum);
                var rect = new rect_1.Rect();
                rect.strokeWidth = rectLineWidth;
                rect.x = Math.floor(padding) + alignment;
                rect.y = Math.floor(yScale.convert(i)) + alignment;
                var width = yScale.bandwidth;
                var height = bottom - top;
                rect.width = Math.floor(height) + Math.floor(rect.y % 1 + height % 1);
                rect.height = Math.floor(width) + Math.floor(rect.x % 1 + width % 1);
                return rect;
            });
        });
        var root = _this.root;
        root.append([].concat.apply([], _this.bars));
        root.append(leftAxis);
        root.append(bottomAxis);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniNormalizedBar.prototype.init = function () {
        this.scene.canvas.element.title = this.chartTranslator.translate('normalizedBarTooltip');
    };
    MiniNormalizedBar.prototype.updateColors = function (fills, strokes) {
        this.bars.forEach(function (series, i) {
            series.forEach(function (bar) {
                bar.fill = fills[i];
                bar.stroke = strokes[i];
            });
        });
    };
    MiniNormalizedBar.chartType = ag_grid_community_1.ChartType.NormalizedBar;
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MiniNormalizedBar.prototype, "init", null);
    return MiniNormalizedBar;
}(MiniChart));
var MiniScatter = /** @class */ (function (_super) {
    __extends(MiniScatter, _super);
    function MiniScatter(parent, fills, strokes) {
        var _this = _super.call(this) || this;
        _this.scene.parent = parent;
        var size = _this.size;
        var padding = _this.padding;
        // [x, y] pairs
        var data = [
            [[0.3, 3], [1.1, 0.9], [2, 0.4], [3.4, 2.4]],
            [[0, 0.3], [1, 2], [2.4, 1.4], [3, 0]]
        ];
        var xScale = linearScale_1.default();
        xScale.domain = [-0.5, 4];
        xScale.range = [padding * 2, size - padding];
        var yScale = linearScale_1.default();
        yScale.domain = [-0.5, 3.5];
        yScale.range = [size - padding, padding];
        var axisOvershoot = 3;
        var leftAxis = line_1.Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;
        var bottomAxis = line_1.Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;
        var points = [];
        data.forEach(function (series, i) {
            series.forEach(function (datum, j) {
                var arc = new arc_1.Arc();
                arc.strokeWidth = 1;
                arc.centerX = xScale.convert(datum[0]);
                arc.centerY = yScale.convert(datum[1]);
                arc.radiusX = 2.5;
                arc.radiusY = 2.5;
                points.push(arc);
            });
        });
        _this.points = points;
        var clipRect = new clipRect_1.ClipRect();
        clipRect.x = padding;
        clipRect.y = padding;
        clipRect.width = size - padding * 2;
        clipRect.height = size - padding * 2;
        clipRect.append(_this.points);
        var root = _this.root;
        root.append(clipRect);
        root.append(leftAxis);
        root.append(bottomAxis);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniScatter.prototype.init = function () {
        this.scene.canvas.element.title = this.chartTranslator.translate('scatterTooltip');
    };
    MiniScatter.prototype.updateColors = function (fills, strokes) {
        this.points.forEach(function (line, i) {
            line.stroke = strokes[i % strokes.length];
            line.fill = fills[i % fills.length];
        });
    };
    MiniScatter.chartType = ag_grid_community_1.ChartType.Scatter;
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MiniScatter.prototype, "init", null);
    return MiniScatter;
}(MiniChart));
var MiniBubble = /** @class */ (function (_super) {
    __extends(MiniBubble, _super);
    function MiniBubble(parent, fills, strokes) {
        var _this = _super.call(this) || this;
        _this.scene.parent = parent;
        var size = _this.size;
        var padding = _this.padding;
        // [x, y, radius] triples
        var data = [
            [[0.1, 0.3, 5], [0.5, 0.4, 7], [0.2, 0.8, 7]], [[0.8, 0.7, 5], [0.7, 0.3, 9]]
        ];
        var xScale = linearScale_1.default();
        xScale.domain = [0, 1];
        xScale.range = [padding * 2, size - padding];
        var yScale = linearScale_1.default();
        yScale.domain = [0, 1];
        yScale.range = [size - padding, padding];
        var axisOvershoot = 3;
        var leftAxis = line_1.Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;
        var bottomAxis = line_1.Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;
        var points = [];
        data.forEach(function (series, i) {
            series.forEach(function (datum, j) {
                var arc = new arc_1.Arc();
                arc.strokeWidth = 1;
                arc.centerX = xScale.convert(datum[0]);
                arc.centerY = yScale.convert(datum[1]);
                arc.radiusX = datum[2];
                arc.radiusY = datum[2];
                arc.fillOpacity = 0.7;
                points.push(arc);
            });
        });
        _this.points = points;
        var clipRect = new clipRect_1.ClipRect();
        clipRect.x = padding;
        clipRect.y = padding;
        clipRect.width = size - padding * 2;
        clipRect.height = size - padding * 2;
        clipRect.append(_this.points);
        var root = _this.root;
        root.append(clipRect);
        root.append(leftAxis);
        root.append(bottomAxis);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniBubble.prototype.init = function () {
        this.scene.canvas.element.title = this.chartTranslator.translate('bubbleTooltip');
    };
    MiniBubble.prototype.updateColors = function (fills, strokes) {
        this.points.forEach(function (line, i) {
            line.stroke = strokes[i % strokes.length];
            line.fill = fills[i % fills.length];
        });
    };
    MiniBubble.chartType = ag_grid_community_1.ChartType.Bubble;
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MiniBubble.prototype, "init", null);
    return MiniBubble;
}(MiniChart));
var MiniArea = /** @class */ (function (_super) {
    __extends(MiniArea, _super);
    function MiniArea(parent, fills, strokes, data) {
        if (data === void 0) { data = MiniArea.data; }
        var _this = _super.call(this) || this;
        _this.scene.parent = parent;
        var size = _this.size;
        var padding = _this.padding;
        var xScale = new bandScale_1.BandScale();
        xScale.paddingInner = 1;
        xScale.paddingOuter = 0;
        xScale.domain = [0, 1, 2];
        xScale.range = [padding + 0.5, size - padding - 0.5];
        var yScale = linearScale_1.default();
        yScale.domain = [0, 6];
        yScale.range = [size - padding + 0.5, padding];
        var axisOvershoot = 3;
        var leftAxis = line_1.Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;
        var bottomAxis = line_1.Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;
        var xCount = data.length;
        var last = xCount * 2 - 1;
        var pathData = [];
        var bottomY = yScale.convert(0);
        for (var i = 0; i < xCount; i++) {
            var yDatum = data[i];
            var yCount = yDatum.length;
            var x = xScale.convert(i);
            var curr = void 0;
            for (var j = 0; j < yCount; j++) {
                curr = yDatum[j];
                var y = yScale.convert(curr);
                var points = pathData[j] || (pathData[j] = []);
                points[i] = {
                    x: x,
                    y: y
                };
                points[last - i] = {
                    x: x,
                    y: bottomY
                };
            }
        }
        _this.areas = pathData.reverse().map(function (points) {
            var area = new path_1.Path();
            area.strokeWidth = 1;
            area.fillOpacity = 0.7;
            var path = area.path;
            path.clear();
            points.forEach(function (point, i) {
                if (!i) {
                    path.moveTo(point.x, point.y);
                }
                else {
                    path.lineTo(point.x, point.y);
                }
            });
            path.closePath();
            return area;
        });
        var root = _this.root;
        root.append(_this.areas);
        root.append(leftAxis);
        root.append(bottomAxis);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniArea.prototype.init = function () {
        this.scene.canvas.element.title = this.chartTranslator.translate('groupedAreaTooltip');
    };
    MiniArea.prototype.updateColors = function (fills, strokes) {
        this.areas.forEach(function (area, i) {
            area.fill = fills[i];
            area.stroke = strokes[i];
        });
    };
    MiniArea.chartType = ag_grid_community_1.ChartType.Area;
    MiniArea.data = [
        [1, 3, 5],
        [2, 6, 4],
        [5, 3, 1]
    ];
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MiniArea.prototype, "init", null);
    return MiniArea;
}(MiniChart));
var MiniStackedArea = /** @class */ (function (_super) {
    __extends(MiniStackedArea, _super);
    function MiniStackedArea(parent, fills, strokes, data) {
        if (data === void 0) { data = MiniStackedArea.data; }
        var _this = _super.call(this) || this;
        _this.scene.parent = parent;
        var size = _this.size;
        var padding = _this.padding;
        var xScale = new bandScale_1.BandScale();
        xScale.paddingInner = 1;
        xScale.paddingOuter = 0;
        xScale.domain = [0, 1, 2];
        xScale.range = [padding + 0.5, size - padding - 0.5];
        var yScale = linearScale_1.default();
        yScale.domain = [0, 16];
        yScale.range = [size - padding + 0.5, padding + 0.5];
        var axisOvershoot = 3;
        var leftAxis = line_1.Line.create(padding, padding, padding, size - padding + axisOvershoot);
        leftAxis.stroke = 'gray';
        leftAxis.strokeWidth = 1;
        var bottomAxis = line_1.Line.create(padding - axisOvershoot, size - padding, size - padding, size - padding);
        bottomAxis.stroke = 'gray';
        bottomAxis.strokeWidth = 1;
        var xCount = data.length;
        var last = xCount * 2 - 1;
        var pathData = [];
        for (var i = 0; i < xCount; i++) {
            var yDatum = data[i];
            var yCount = yDatum.length;
            var x = xScale.convert(i);
            var prev = 0;
            var curr = void 0;
            for (var j = 0; j < yCount; j++) {
                curr = yDatum[j];
                var y = yScale.convert(prev + curr);
                var points = pathData[j] || (pathData[j] = []);
                points[i] = {
                    x: x,
                    y: y
                };
                points[last - i] = {
                    x: x,
                    y: yScale.convert(prev) // bottom y
                };
                prev += curr;
            }
        }
        _this.areas = pathData.map(function (points) {
            var area = new path_1.Path();
            area.strokeWidth = 1;
            var path = area.path;
            path.clear();
            points.forEach(function (point, i) {
                if (!i) {
                    path.moveTo(point.x, point.y);
                }
                else {
                    path.lineTo(point.x, point.y);
                }
            });
            path.closePath();
            return area;
        });
        var root = _this.root;
        root.append(_this.areas);
        root.append(leftAxis);
        root.append(bottomAxis);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniStackedArea.prototype.init = function () {
        this.scene.canvas.element.title = this.chartTranslator.translate('stackedAreaTooltip');
    };
    MiniStackedArea.prototype.updateColors = function (fills, strokes) {
        this.areas.forEach(function (area, i) {
            area.fill = fills[i];
            area.stroke = strokes[i];
        });
    };
    MiniStackedArea.chartType = ag_grid_community_1.ChartType.StackedArea;
    MiniStackedArea.data = [
        [2, 3, 2],
        [3, 6, 5],
        [6, 2, 2]
    ];
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MiniStackedArea.prototype, "init", null);
    return MiniStackedArea;
}(MiniChart));
var MiniNormalizedArea = /** @class */ (function (_super) {
    __extends(MiniNormalizedArea, _super);
    function MiniNormalizedArea(parent, fills, strokes, data) {
        if (data === void 0) { data = MiniNormalizedArea.data; }
        return _super.call(this, parent, fills, strokes, data) || this;
    }
    MiniNormalizedArea.prototype.init = function () {
        this.scene.canvas.element.title = this.chartTranslator.translate('normalizedAreaTooltip');
    };
    MiniNormalizedArea.chartType = ag_grid_community_1.ChartType.NormalizedArea;
    MiniNormalizedArea.data = MiniStackedArea.data.map(function (stack) {
        var sum = stack.reduce(function (p, c) { return p + c; }, 0);
        return stack.map(function (v) { return v / sum * 16; });
    });
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MiniNormalizedArea.prototype, "init", null);
    return MiniNormalizedArea;
}(MiniStackedArea));
