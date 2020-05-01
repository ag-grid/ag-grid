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
Object.defineProperty(exports, "__esModule", { value: true });
var group_1 = require("../../../scene/group");
var line_1 = require("../../../scene/shape/line");
var text_1 = require("../../../scene/shape/text");
var selection_1 = require("../../../scene/selection");
var linearScale_1 = require("../../../scale/linearScale");
var palettes_1 = require("../../palettes");
var sector_1 = require("../../../scene/shape/sector");
var label_1 = require("../../label");
var node_1 = require("../../../scene/node");
var angle_1 = require("../../../util/angle");
var color_1 = require("../../../util/color");
var number_1 = require("../../../util/number");
var observable_1 = require("../../../util/observable");
var polarSeries_1 = require("./polarSeries");
var chartAxis_1 = require("../../chartAxis");
var chart_1 = require("../../chart");
var PieNodeTag;
(function (PieNodeTag) {
    PieNodeTag[PieNodeTag["Sector"] = 0] = "Sector";
    PieNodeTag[PieNodeTag["Callout"] = 1] = "Callout";
    PieNodeTag[PieNodeTag["Label"] = 2] = "Label";
})(PieNodeTag || (PieNodeTag = {}));
var PieSeriesLabel = /** @class */ (function (_super) {
    __extends(PieSeriesLabel, _super);
    function PieSeriesLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.offset = 3; // from the callout line
        _this.minAngle = 20; // in degrees
        return _this;
    }
    __decorate([
        observable_1.reactive('change')
    ], PieSeriesLabel.prototype, "offset", void 0);
    __decorate([
        observable_1.reactive('dataChange')
    ], PieSeriesLabel.prototype, "minAngle", void 0);
    return PieSeriesLabel;
}(label_1.Label));
var PieSeriesCallout = /** @class */ (function (_super) {
    __extends(PieSeriesCallout, _super);
    function PieSeriesCallout() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.colors = palettes_1.default.strokes;
        _this.length = 10;
        _this.strokeWidth = 1;
        return _this;
    }
    __decorate([
        observable_1.reactive('change')
    ], PieSeriesCallout.prototype, "colors", void 0);
    __decorate([
        observable_1.reactive('change')
    ], PieSeriesCallout.prototype, "length", void 0);
    __decorate([
        observable_1.reactive('change')
    ], PieSeriesCallout.prototype, "strokeWidth", void 0);
    return PieSeriesCallout;
}(observable_1.Observable));
var PieSeries = /** @class */ (function (_super) {
    __extends(PieSeries, _super);
    function PieSeries() {
        var _this = _super.call(this) || this;
        _this.radiusScale = new linearScale_1.LinearScale();
        _this.groupSelection = selection_1.Selection.select(_this.group).selectAll();
        /**
         * The processed data that gets visualized.
         */
        _this.groupSelectionData = [];
        _this.angleScale = (function () {
            var scale = new linearScale_1.LinearScale();
            // Each slice is a ratio of the whole, where all ratios add up to 1.
            scale.domain = [0, 1];
            // Add 90 deg to start the first pie at 12 o'clock.
            scale.range = [-Math.PI, Math.PI].map(function (angle) { return angle + Math.PI / 2; });
            return scale;
        })();
        // When a user toggles a series item (e.g. from the legend), its boolean state is recorded here.
        _this.seriesItemEnabled = [];
        _this.label = new PieSeriesLabel();
        _this.callout = new PieSeriesCallout();
        /**
         * The key of the numeric field to use to determine the angle (for example,
         * a pie slice angle).
         */
        _this.angleKey = '';
        _this.angleName = '';
        _this._fills = palettes_1.default.fills;
        _this._strokes = palettes_1.default.strokes;
        _this.fillOpacity = 1;
        _this.strokeOpacity = 1;
        /**
         * The series rotation in degrees.
         */
        _this.rotation = 0;
        _this.outerRadiusOffset = 0;
        _this.innerRadiusOffset = 0;
        _this.strokeWidth = 1;
        _this.highlightStyle = { fill: 'yellow' };
        _this.addEventListener('update', _this.update, _this);
        _this.label.addEventListener('change', _this.scheduleLayout, _this);
        _this.label.addEventListener('dataChange', _this.scheduleData, _this);
        _this.callout.addEventListener('change', _this.scheduleLayout, _this);
        _this.addPropertyListener('data', function (event) {
            event.source.seriesItemEnabled = event.value.map(function () { return true; });
        });
        return _this;
    }
    Object.defineProperty(PieSeries.prototype, "title", {
        get: function () {
            return this._title;
        },
        set: function (value) {
            var oldTitle = this._title;
            if (oldTitle !== value) {
                if (oldTitle) {
                    oldTitle.removeEventListener('change', this.scheduleLayout);
                    this.group.removeChild(oldTitle.node);
                }
                if (value) {
                    value.node.textBaseline = 'bottom';
                    value.addEventListener('change', this.scheduleLayout);
                    this.group.appendChild(value.node);
                }
                this._title = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "fills", {
        get: function () {
            return this._fills;
        },
        set: function (values) {
            this._fills = values;
            this.strokes = values.map(function (color) { return color_1.Color.fromString(color).darker().toHexString(); });
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "strokes", {
        get: function () {
            return this._strokes;
        },
        set: function (values) {
            this._strokes = values;
            this.callout.colors = values;
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    PieSeries.prototype.onHighlightChange = function () {
        this.updateNodes();
    };
    PieSeries.prototype.getDomain = function (direction) {
        if (direction === chartAxis_1.ChartAxisDirection.X) {
            return this.angleScale.domain;
        }
        else {
            return this.radiusScale.domain;
        }
    };
    PieSeries.prototype.processData = function () {
        var _this = this;
        var _a = this, angleKey = _a.angleKey, radiusKey = _a.radiusKey, seriesItemEnabled = _a.seriesItemEnabled, angleScale = _a.angleScale, groupSelectionData = _a.groupSelectionData;
        var data = angleKey && this.data ? this.data : [];
        var angleData = data.map(function (datum, index) { return seriesItemEnabled[index] && Math.abs(+datum[angleKey]) || 0; });
        var angleDataTotal = angleData.reduce(function (a, b) { return a + b; }, 0);
        // The ratios (in [0, 1] interval) used to calculate the end angle value for every pie slice.
        // Each slice starts where the previous one ends, so we only keep the ratios for end angles.
        var angleDataRatios = (function () {
            var sum = 0;
            return angleData.map(function (datum) { return sum += datum / angleDataTotal; });
        })();
        var labelKey = this.label.enabled && this.labelKey;
        var labelData = labelKey ? data.map(function (datum) { return String(datum[labelKey]); }) : [];
        var useRadiusKey = !!radiusKey && !this.innerRadiusOffset;
        var radiusData = [];
        if (useRadiusKey) {
            var radii = data.map(function (datum) { return Math.abs(datum[radiusKey]); });
            var maxDatum_1 = Math.max.apply(Math, radii);
            radiusData = radii.map(function (value) { return value / maxDatum_1; });
        }
        groupSelectionData.length = 0;
        var rotation = angle_1.toRadians(this.rotation);
        var halfPi = Math.PI / 2;
        var datumIndex = 0;
        // Simply use reduce here to pair up adjacent ratios.
        angleDataRatios.reduce(function (start, end) {
            var radius = useRadiusKey ? radiusData[datumIndex] : 1;
            var startAngle = angleScale.convert(start) + rotation;
            var endAngle = angleScale.convert(end) + rotation;
            var midAngle = (startAngle + endAngle) / 2;
            var span = Math.abs(endAngle - startAngle);
            var midCos = Math.cos(midAngle);
            var midSin = Math.sin(midAngle);
            var labelMinAngle = angle_1.toRadians(_this.label.minAngle);
            var labelVisible = labelKey && span > labelMinAngle;
            var midAngle180 = angle_1.normalizeAngle180(midAngle);
            // Split the circle into quadrants like so: ⊗
            var quadrantStart = -3 * Math.PI / 4; // same as `normalizeAngle180(toRadians(-135))`
            var textAlign;
            var textBaseline;
            if (midAngle180 >= quadrantStart && midAngle180 < (quadrantStart += halfPi)) {
                textAlign = 'center';
                textBaseline = 'bottom';
            }
            else if (midAngle180 >= quadrantStart && midAngle180 < (quadrantStart += halfPi)) {
                textAlign = 'left';
                textBaseline = 'middle';
            }
            else if (midAngle180 >= quadrantStart && midAngle180 < (quadrantStart += halfPi)) {
                textAlign = 'center';
                textBaseline = 'hanging';
            }
            else {
                textAlign = 'right';
                textBaseline = 'middle';
            }
            groupSelectionData.push({
                series: _this,
                seriesDatum: data[datumIndex],
                index: datumIndex,
                radius: radius,
                startAngle: startAngle,
                endAngle: endAngle,
                midAngle: midAngle,
                midCos: midCos,
                midSin: midSin,
                label: labelVisible ? {
                    text: labelData[datumIndex],
                    textAlign: textAlign,
                    textBaseline: textBaseline
                } : undefined
            });
            datumIndex++;
            return end;
        }, 0);
        return true;
    };
    PieSeries.prototype.update = function () {
        var chart = this.chart;
        var visible = this.group.visible = this.visible && this.seriesItemEnabled.indexOf(true) >= 0;
        if (!visible || !chart || chart.dataPending || chart.layoutPending) {
            return;
        }
        this.radiusScale.range = [0, this.radius];
        this.group.translationX = this.centerX;
        this.group.translationY = this.centerY;
        var title = this.title;
        if (title) {
            title.node.translationY = -this.radius - this.outerRadiusOffset - 2;
            title.node.visible = title.enabled;
        }
        this.updateGroupSelection();
        this.updateNodes();
    };
    PieSeries.prototype.updateGroupSelection = function () {
        var updateGroups = this.groupSelection.setData(this.groupSelectionData);
        updateGroups.exit.remove();
        var enterGroups = updateGroups.enter.append(group_1.Group);
        enterGroups.append(sector_1.Sector).each(function (node) { return node.tag = PieNodeTag.Sector; });
        enterGroups.append(line_1.Line).each(function (node) {
            node.tag = PieNodeTag.Callout;
            node.pointerEvents = node_1.PointerEvents.None;
        });
        enterGroups.append(text_1.Text).each(function (node) {
            node.tag = PieNodeTag.Label;
            node.pointerEvents = node_1.PointerEvents.None;
        });
        this.groupSelection = updateGroups.merge(enterGroups);
    };
    PieSeries.prototype.updateNodes = function () {
        var _a = this, fills = _a.fills, strokes = _a.strokes, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity, strokeWidth = _a.strokeWidth, outerRadiusOffset = _a.outerRadiusOffset, innerRadiusOffset = _a.innerRadiusOffset, radiusScale = _a.radiusScale, callout = _a.callout, shadow = _a.shadow, _b = _a.highlightStyle, fill = _b.fill, stroke = _b.stroke, centerOffset = _b.centerOffset;
        var highlightedDatum = this.chart.highlightedDatum;
        var minOuterRadius = Infinity;
        var outerRadii = [];
        var centerOffsets = [];
        this.groupSelection.selectByTag(PieNodeTag.Sector).each(function (sector, datum, index) {
            var radius = radiusScale.convert(datum.radius);
            var outerRadius = Math.max(0, radius + outerRadiusOffset);
            if (minOuterRadius > outerRadius) {
                minOuterRadius = outerRadius;
            }
            sector.outerRadius = outerRadius;
            sector.innerRadius = Math.max(0, innerRadiusOffset ? radius + innerRadiusOffset : 0);
            sector.startAngle = datum.startAngle;
            sector.endAngle = datum.endAngle;
            var highlighted = datum === highlightedDatum;
            sector.fill = highlighted && fill !== undefined ? fill : fills[index % fills.length];
            sector.stroke = highlighted && stroke !== undefined ? stroke : strokes[index % strokes.length];
            sector.fillOpacity = fillOpacity;
            sector.strokeOpacity = strokeOpacity;
            sector.centerOffset = highlighted && centerOffset !== undefined ? centerOffset : 0;
            sector.fillShadow = shadow;
            sector.strokeWidth = strokeWidth;
            sector.lineJoin = 'round';
            outerRadii.push(outerRadius);
            centerOffsets.push(sector.centerOffset);
        });
        var calloutColors = callout.colors, calloutLength = callout.length, calloutStrokeWidth = callout.strokeWidth;
        this.groupSelection.selectByTag(PieNodeTag.Callout).each(function (line, datum, index) {
            if (datum.label) {
                var outerRadius = centerOffsets[index] + outerRadii[index];
                line.strokeWidth = calloutStrokeWidth;
                line.stroke = calloutColors[index % calloutColors.length];
                line.x1 = datum.midCos * outerRadius;
                line.y1 = datum.midSin * outerRadius;
                line.x2 = datum.midCos * (outerRadius + calloutLength);
                line.y2 = datum.midSin * (outerRadius + calloutLength);
            }
            else {
                line.stroke = undefined;
            }
        });
        {
            var _c = this.label, offset_1 = _c.offset, fontStyle_1 = _c.fontStyle, fontWeight_1 = _c.fontWeight, fontSize_1 = _c.fontSize, fontFamily_1 = _c.fontFamily, color_2 = _c.color;
            this.groupSelection.selectByTag(PieNodeTag.Label).each(function (text, datum, index) {
                var label = datum.label;
                if (label) {
                    var outerRadius = outerRadii[index];
                    var labelRadius = centerOffsets[index] + outerRadius + calloutLength + offset_1;
                    text.fontStyle = fontStyle_1;
                    text.fontWeight = fontWeight_1;
                    text.fontSize = fontSize_1;
                    text.fontFamily = fontFamily_1;
                    text.text = label.text;
                    text.x = datum.midCos * labelRadius;
                    text.y = datum.midSin * labelRadius;
                    text.fill = color_2;
                    text.textAlign = label.textAlign;
                    text.textBaseline = label.textBaseline;
                }
                else {
                    text.fill = undefined;
                }
            });
        }
    };
    PieSeries.prototype.fireNodeClickEvent = function (datum) {
        this.fireEvent({
            type: 'nodeClick',
            series: this,
            datum: datum.seriesDatum,
            angleKey: this.angleKey,
            radiusKey: this.radiusKey
        });
    };
    PieSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var angleKey = this.angleKey;
        if (!angleKey) {
            return '';
        }
        var _a = this, title = _a.title, fills = _a.fills, tooltipRenderer = _a.tooltipRenderer, angleName = _a.angleName, radiusKey = _a.radiusKey, radiusName = _a.radiusName, labelKey = _a.labelKey, labelName = _a.labelName;
        var text = title ? title.text : undefined;
        var color = fills[nodeDatum.index % fills.length];
        if (tooltipRenderer) {
            return tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                angleKey: angleKey,
                angleName: angleName,
                radiusKey: radiusKey,
                radiusName: radiusName,
                labelKey: labelKey,
                labelName: labelName,
                title: text,
                color: color,
            });
        }
        else {
            var titleStyle = "style=\"color: white; background-color: " + color + "\"";
            var titleString = title ? "<div class=\"" + chart_1.Chart.defaultTooltipClass + "-title\" " + titleStyle + ">" + text + "</div>" : '';
            var label = labelKey ? nodeDatum.seriesDatum[labelKey] + ": " : '';
            var value = nodeDatum.seriesDatum[angleKey];
            var formattedValue = typeof value === 'number' ? number_1.toFixed(value) : value.toString();
            return titleString + "<div class=\"" + chart_1.Chart.defaultTooltipClass + "-content\">" + label + formattedValue + "</div>";
        }
    };
    PieSeries.prototype.listSeriesItems = function (legendData) {
        var _this = this;
        var _a = this, labelKey = _a.labelKey, data = _a.data;
        if (data && data.length && labelKey) {
            var _b = this, fills_1 = _b.fills, strokes_1 = _b.strokes, id_1 = _b.id;
            data.forEach(function (datum, index) {
                legendData.push({
                    id: id_1,
                    itemId: index,
                    enabled: _this.seriesItemEnabled[index],
                    label: {
                        text: String(datum[labelKey])
                    },
                    marker: {
                        fill: fills_1[index % fills_1.length],
                        stroke: strokes_1[index % strokes_1.length],
                        fillOpacity: _this.fillOpacity,
                        strokeOpacity: _this.strokeOpacity
                    }
                });
            });
        }
    };
    PieSeries.prototype.toggleSeriesItem = function (itemId, enabled) {
        this.seriesItemEnabled[itemId] = enabled;
        this.scheduleData();
    };
    PieSeries.className = 'PieSeries';
    PieSeries.type = 'pie';
    __decorate([
        observable_1.reactive('dataChange')
    ], PieSeries.prototype, "angleKey", void 0);
    __decorate([
        observable_1.reactive('update')
    ], PieSeries.prototype, "angleName", void 0);
    __decorate([
        observable_1.reactive('dataChange')
    ], PieSeries.prototype, "radiusKey", void 0);
    __decorate([
        observable_1.reactive('update')
    ], PieSeries.prototype, "radiusName", void 0);
    __decorate([
        observable_1.reactive('dataChange')
    ], PieSeries.prototype, "labelKey", void 0);
    __decorate([
        observable_1.reactive('update')
    ], PieSeries.prototype, "labelName", void 0);
    __decorate([
        observable_1.reactive('layoutChange')
    ], PieSeries.prototype, "fillOpacity", void 0);
    __decorate([
        observable_1.reactive('layoutChange')
    ], PieSeries.prototype, "strokeOpacity", void 0);
    __decorate([
        observable_1.reactive('dataChange')
    ], PieSeries.prototype, "rotation", void 0);
    __decorate([
        observable_1.reactive('layoutChange')
    ], PieSeries.prototype, "outerRadiusOffset", void 0);
    __decorate([
        observable_1.reactive('dataChange')
    ], PieSeries.prototype, "innerRadiusOffset", void 0);
    __decorate([
        observable_1.reactive('layoutChange')
    ], PieSeries.prototype, "strokeWidth", void 0);
    __decorate([
        observable_1.reactive('layoutChange')
    ], PieSeries.prototype, "shadow", void 0);
    return PieSeries;
}(polarSeries_1.PolarSeries));
exports.PieSeries = PieSeries;
//# sourceMappingURL=pieSeries.js.map