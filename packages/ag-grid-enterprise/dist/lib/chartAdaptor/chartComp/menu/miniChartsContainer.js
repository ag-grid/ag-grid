// ag-grid-enterprise v21.0.1
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
var MiniChartsContainer = /** @class */ (function (_super) {
    __extends(MiniChartsContainer, _super);
    function MiniChartsContainer(activePalette, chartController) {
        var _this = _super.call(this, MiniChartsContainer.TEMPLATE) || this;
        _this.wrappers = [];
        var palettes = chartController.getPalettes();
        _this.fills = palettes[activePalette].fills;
        _this.strokes = palettes[activePalette].strokes;
        _this.chartController = chartController;
        return _this;
    }
    MiniChartsContainer.prototype.init = function () {
        var _this = this;
        var classes = [MiniBar, MiniStackedBar, MiniLine, MiniPie, MiniDonut];
        var eGui = this.getGui();
        classes.forEach(function (MiniClass, idx) {
            var miniWrapper = document.createElement('div');
            ag_grid_community_1._.addCssClass(miniWrapper, 'ag-chart-mini-thumbnail');
            _this.addDestroyableEventListener(miniWrapper, 'click', function () {
                _this.chartController.setChartType(idx);
                _this.refreshSelected();
            });
            _this.wrappers.push(miniWrapper);
            new MiniClass(miniWrapper, _this.fills, _this.strokes);
            eGui.appendChild(miniWrapper);
        });
        this.refreshSelected();
    };
    MiniChartsContainer.prototype.refreshSelected = function () {
        var type = this.chartController.getChartType();
        ag_grid_community_1._.radioCssClass(this.wrappers[type], 'ag-selected');
    };
    MiniChartsContainer.TEMPLATE = '<div class="ag-chart-settings-mini-wrapper"></div>';
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MiniChartsContainer.prototype, "init", null);
    return MiniChartsContainer;
}(ag_grid_community_1.Component));
exports.MiniChartsContainer = MiniChartsContainer;
var group_1 = require("../../../charts/scene/group");
var scene_1 = require("../../../charts/scene/scene");
var angle_1 = require("../../../charts/util/angle");
var sector_1 = require("../../../charts/scene/shape/sector");
var path_1 = require("../../../charts/scene/shape/path");
var linearScale_1 = require("../../../charts/scale/linearScale");
var line_1 = require("../../../charts/scene/shape/line");
var clipRect_1 = require("../../../charts/scene/clipRect");
var rect_1 = require("../../../charts/scene/shape/rect");
var bandScale_1 = require("../../../charts/scale/bandScale");
var MiniChart = /** @class */ (function () {
    function MiniChart() {
        var _this = this;
        this.size = 80;
        this.padding = 5;
        this.root = new group_1.Group();
        this.scene = (function () {
            var scene = new scene_1.Scene(_this.size, _this.size);
            scene.root = _this.root;
            return scene;
        })();
        this.element = this.scene.hdpiCanvas.canvas;
    }
    return MiniChart;
}());
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
    MiniPie.prototype.updateColors = function (fills, strokes) {
        this.sectors.forEach(function (sector, i) {
            sector.fill = fills[i];
            sector.stroke = strokes[i];
        });
    };
    MiniPie.angles = [
        [angle_1.toRadians(-90), angle_1.toRadians(30)],
        [angle_1.toRadians(30), angle_1.toRadians(120)],
        [angle_1.toRadians(120), angle_1.toRadians(180)],
        [angle_1.toRadians(180), angle_1.toRadians(210)],
        [angle_1.toRadians(210), angle_1.toRadians(240)],
        [angle_1.toRadians(240), angle_1.toRadians(270)]
    ];
    return MiniPie;
}(MiniChart));
exports.MiniPie = MiniPie;
var MiniDonut = /** @class */ (function (_super) {
    __extends(MiniDonut, _super);
    function MiniDonut(parent, fills, strokes) {
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
    MiniDonut.prototype.updateColors = function (fills, strokes) {
        this.sectors.forEach(function (sector, i) {
            sector.fill = fills[i];
            sector.stroke = strokes[i];
        });
    };
    return MiniDonut;
}(MiniChart));
exports.MiniDonut = MiniDonut;
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
    MiniLine.prototype.updateColors = function (fills, strokes) {
        this.lines.forEach(function (line, i) {
            line.stroke = strokes[i];
        });
    };
    return MiniLine;
}(MiniChart));
var MiniBar = /** @class */ (function (_super) {
    __extends(MiniBar, _super);
    function MiniBar(parent, fills, strokes) {
        var _this = _super.call(this) || this;
        _this.scene.parent = parent;
        var size = _this.size;
        var padding = _this.padding;
        var data = [2, 3, 4];
        var xScale = new bandScale_1.BandScale();
        xScale.domain = [0, 1, 2];
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.4;
        xScale.paddingOuter = 0.4;
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
    MiniBar.prototype.updateColors = function (fills, strokes) {
        this.bars.forEach(function (bar, i) {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
        });
    };
    return MiniBar;
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
        var xScale = new bandScale_1.BandScale();
        xScale.domain = [0, 1, 2];
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.4;
        xScale.paddingOuter = 0.4;
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
    MiniStackedBar.prototype.updateColors = function (fills, strokes) {
        this.bars.forEach(function (series, i) {
            series.forEach(function (bar) {
                bar.fill = fills[i];
                bar.stroke = strokes[i];
            });
        });
    };
    return MiniStackedBar;
}(MiniChart));
