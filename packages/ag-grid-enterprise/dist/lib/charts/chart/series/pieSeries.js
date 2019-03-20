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
Object.defineProperty(exports, "__esModule", { value: true });
var polarSeries_1 = require("./polarSeries");
var group_1 = require("../../scene/group");
var arc_1 = require("../../scene/shape/arc");
var line_1 = require("../../scene/shape/line");
var text_1 = require("../../scene/shape/text");
var selection_1 = require("../../scene/selection");
var linearScale_1 = require("../../scale/linearScale");
var angle_1 = require("../../util/angle");
var colors_1 = require("../colors");
var color_1 = require("../../util/color");
var PieSeriesNodeTag;
(function (PieSeriesNodeTag) {
    PieSeriesNodeTag[PieSeriesNodeTag["Sector"] = 0] = "Sector";
    PieSeriesNodeTag[PieSeriesNodeTag["Callout"] = 1] = "Callout";
    PieSeriesNodeTag[PieSeriesNodeTag["Label"] = 2] = "Label";
})(PieSeriesNodeTag || (PieSeriesNodeTag = {}));
var PieSeries = /** @class */ (function (_super) {
    __extends(PieSeries, _super);
    function PieSeries() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.fieldPropertiesX = ['angleField'];
        _this.fieldPropertiesY = ['radiusField'];
        /**
         * The name of the numeric field to use to determine the angle (for example,
         * a pie slice angle).
         */
        _this._angleField = null;
        _this._labelField = null;
        _this.labelFont = '12px Tahoma';
        _this.labelColor = 'black';
        _this.labelRotation = 0;
        _this.labelMinAngle = 20; // in degrees
        /**
         * `null` means make the callout color the same as {@link strokeStyle}.
         */
        _this.calloutColor = null;
        _this.calloutWidth = 2;
        _this.calloutLength = 10;
        _this.calloutPadding = 3;
        _this.colors = colors_1.default;
        _this.strokeColors = colors_1.default.map(function (color) { return color_1.Color.fromHexString(color).darker().toHexString(); });
        /**
         * The stroke style to use for all pie sectors.
         * `null` value here doesn't mean invisible stroke, as it normally would
         * (see `Shape.strokeStyle` comments), it means derive stroke colors from fill
         * colors by darkening them. To make the stroke appear invisible use the same
         * color as the background of the chart (such as 'white').
         */
        _this.strokeStyle = null;
        _this.lineWidth = 2;
        _this.shadow = null;
        /**
         * The name of the numeric field to use to determine the radii of pie slices.
         */
        _this._radiusField = '';
        _this.angleScale = (function () {
            var scale = linearScale_1.default();
            // Each slice is a ratio of the whole, where all ratios add up to 1.
            scale.domain = [0, 1];
            // Add 90 deg to start the first pie at 12 o'clock.
            scale.range = [-Math.PI, Math.PI].map(function (angle) { return angle + Math.PI / 2; });
            return scale;
        })();
        _this.radiusScale = linearScale_1.default();
        _this.groupSelection = selection_1.Selection.select(_this.group).selectAll();
        /**
         * The processed data that gets visualized.
         */
        _this.sectorsData = [];
        _this._data = [];
        return _this;
    }
    Object.defineProperty(PieSeries.prototype, "chart", {
        get: function () {
            return this._chart;
        },
        set: function (chart) {
            if (this._chart !== chart) {
                this._chart = chart;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "angleField", {
        get: function () {
            return this._angleField;
        },
        set: function (value) {
            if (this._angleField !== value) {
                this._angleField = value;
                if (this.processData()) {
                    this.update();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "labelField", {
        get: function () {
            return this._labelField;
        },
        set: function (value) {
            if (this._labelField !== value) {
                this._labelField = value;
                this.processData();
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "rotation", {
        get: function () {
            return this._rotation;
        },
        set: function (value) {
            if (this._rotation !== value) {
                this._rotation = value;
                if (this.processData()) {
                    this.update();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "radiusField", {
        get: function () {
            return this._radiusField;
        },
        set: function (value) {
            if (this._radiusField !== value) {
                this._radiusField = value;
                if (this.processData()) {
                    this.update();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (data) {
            this._data = data;
            if (this.processData()) {
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    PieSeries.prototype.getDomainX = function () {
        return this.angleScale.domain;
    };
    PieSeries.prototype.getDomainY = function () {
        return this.radiusScale.domain;
    };
    PieSeries.prototype.processData = function () {
        var _this = this;
        var data = this.data;
        var centerX = this.centerX + this.offsetX;
        var centerY = this.centerY + this.offsetY;
        this.group.translationX = centerX;
        this.group.translationY = centerY;
        var angleData = data.map(function (datum) { return datum[_this.angleField]; });
        var angleDataTotal = angleData.reduce(function (a, b) { return a + b; }, 0);
        // The ratios (in [0, 1] interval) used to calculate the end angle value for every pie slice.
        // Each slice starts where the previous one ends, so we only keep the ratios for end angles.
        var angleDataRatios = (function () {
            var sum = 0;
            return angleData.map(function (datum) { return sum += datum / angleDataTotal; });
        })();
        var labelField = this.labelField;
        var labelData = [];
        if (labelField) {
            labelData = data.map(function (datum) { return datum[labelField]; });
        }
        var radiusField = this.radiusField;
        var radiusData = [];
        if (radiusField) {
            radiusData = data.map(function (datum) { return datum[radiusField]; });
            this.radiusScale.domain = [0, Math.max.apply(Math, radiusData.concat([1]))];
            this.radiusScale.range = [0, this.radius];
        }
        var angleScale = this.angleScale;
        var labelFont = this.labelFont;
        var labelColor = this.labelColor;
        var sectorsData = this.sectorsData;
        sectorsData.length = 0;
        var rotation = angle_1.toRadians(this.rotation);
        var colors = this.colors;
        var strokeColor = this.strokeStyle;
        var strokeColors = this.strokeColors;
        var calloutColor = this.calloutColor;
        var sectorIndex = 0;
        // Simply use reduce here to pair up adjacent ratios.
        angleDataRatios.reduce(function (start, end) {
            var radius = radiusField ? _this.radiusScale.convert(radiusData[sectorIndex]) : _this.radius;
            var startAngle = angleScale.convert(start + rotation);
            var endAngle = angleScale.convert(end + rotation);
            var midAngle = (startAngle + endAngle) / 2;
            var span = Math.abs(endAngle - startAngle);
            var midCos = Math.cos(midAngle);
            var midSin = Math.sin(midAngle);
            var calloutLength = _this.calloutLength;
            var labelMinAngle = angle_1.toRadians(_this.labelMinAngle);
            var labelVisible = labelField && span > labelMinAngle;
            var strokeStyle = strokeColor ? strokeColor : strokeColors[sectorIndex % strokeColors.length];
            var calloutStrokeStyle = calloutColor ? calloutColor : strokeStyle;
            sectorsData.push({
                index: sectorIndex,
                radius: radius,
                startAngle: startAngle,
                endAngle: endAngle,
                midAngle: angle_1.normalizeAngle180(midAngle),
                fillStyle: colors[sectorIndex % colors.length],
                strokeStyle: strokeStyle,
                lineWidth: _this.lineWidth,
                shadow: _this.shadow,
                label: labelVisible ? {
                    text: labelData[sectorIndex],
                    font: labelFont,
                    fillStyle: labelColor,
                    x: midCos * (radius + calloutLength + _this.calloutPadding),
                    y: midSin * (radius + calloutLength + _this.calloutPadding)
                } : undefined,
                callout: labelVisible ? {
                    start: {
                        x: midCos * radius,
                        y: midSin * radius
                    },
                    end: {
                        x: midCos * (radius + calloutLength),
                        y: midSin * (radius + calloutLength)
                    },
                    strokeStyle: calloutStrokeStyle
                } : undefined
            });
            sectorIndex++;
            return end;
        }, 0);
        return true;
    };
    PieSeries.prototype.update = function () {
        var _this = this;
        var chart = this.chart;
        if (!chart || chart && chart.layoutPending) {
            return;
        }
        var updateGroups = this.groupSelection.setData(this.sectorsData);
        updateGroups.exit.remove();
        var enterGroups = updateGroups.enter.append(group_1.Group);
        enterGroups.append(arc_1.Arc).each(function (node) { return node.tag = PieSeriesNodeTag.Sector; });
        enterGroups.append(line_1.Line).each(function (node) { return node.tag = PieSeriesNodeTag.Callout; });
        enterGroups.append(text_1.Text).each(function (node) { return node.tag = PieSeriesNodeTag.Label; });
        var groupSelection = updateGroups.merge(enterGroups);
        groupSelection.selectByTag(PieSeriesNodeTag.Sector)
            .each(function (arc, datum) {
            arc.type = arc_1.ArcType.Round;
            arc.radiusX = datum.radius;
            arc.radiusY = datum.radius;
            arc.startAngle = datum.startAngle;
            arc.endAngle = datum.endAngle;
            arc.fillStyle = datum.fillStyle;
            arc.strokeStyle = datum.strokeStyle;
            arc.shadow = datum.shadow;
            arc.lineWidth = datum.lineWidth;
            arc.lineJoin = 'round';
        });
        groupSelection.selectByTag(PieSeriesNodeTag.Callout)
            .each(function (line, datum) {
            var callout = datum.callout;
            if (callout) {
                line.lineWidth = _this.calloutWidth;
                line.strokeStyle = callout.strokeStyle;
                line.x1 = callout.start.x;
                line.y1 = callout.start.y;
                line.x2 = callout.end.x;
                line.y2 = callout.end.y;
            }
            else {
                line.strokeStyle = null;
            }
        });
        var halfPi = Math.PI / 2;
        groupSelection.selectByTag(PieSeriesNodeTag.Label)
            .each(function (text, datum) {
            var angle = datum.midAngle;
            // Split the circle into quadrants like so: ⊗
            var quadrantStart = -3 * Math.PI / 4; // same as `normalizeAngle180(toRadians(-135))`
            if (angle >= quadrantStart && angle < (quadrantStart += halfPi)) {
                text.textAlign = 'center';
                text.textBaseline = 'bottom';
            }
            else if (angle >= quadrantStart && angle < (quadrantStart += halfPi)) {
                text.textAlign = 'left';
                text.textBaseline = 'middle';
            }
            else if (angle >= quadrantStart && angle < (quadrantStart += halfPi)) {
                text.textAlign = 'center';
                text.textBaseline = 'hanging';
            }
            else {
                text.textAlign = 'right';
                text.textBaseline = 'middle';
            }
            var label = datum.label;
            if (label) {
                text.font = label.font;
                text.text = label.text;
                text.x = label.x;
                text.y = label.y;
                text.fillStyle = label.fillStyle;
            }
            else {
                text.fillStyle = null;
            }
        });
        this.groupSelection = groupSelection;
    };
    return PieSeries;
}(polarSeries_1.PolarSeries));
exports.PieSeries = PieSeries;
