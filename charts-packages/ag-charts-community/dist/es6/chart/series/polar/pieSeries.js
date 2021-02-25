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
import { Group } from "../../../scene/group";
import { Line } from "../../../scene/shape/line";
import { Text } from "../../../scene/shape/text";
import { Selection } from "../../../scene/selection";
import { LinearScale } from "../../../scale/linearScale";
import { Sector } from "../../../scene/shape/sector";
import { SeriesTooltip } from "./../series";
import { Label } from "../../label";
import { PointerEvents } from "../../../scene/node";
import { normalizeAngle180, toRadians } from "../../../util/angle";
import { Color } from "../../../util/color";
import { toFixed } from "../../../util/number";
import { reactive, Observable } from "../../../util/observable";
import { PolarSeries } from "./polarSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { toTooltipHtml } from "../../chart";
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
        reactive('change')
    ], PieSeriesLabel.prototype, "offset", void 0);
    __decorate([
        reactive('dataChange')
    ], PieSeriesLabel.prototype, "minAngle", void 0);
    return PieSeriesLabel;
}(Label));
var PieSeriesCallout = /** @class */ (function (_super) {
    __extends(PieSeriesCallout, _super);
    function PieSeriesCallout() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.colors = [];
        _this.length = 10;
        _this.strokeWidth = 1;
        return _this;
    }
    __decorate([
        reactive('change')
    ], PieSeriesCallout.prototype, "colors", void 0);
    __decorate([
        reactive('change')
    ], PieSeriesCallout.prototype, "length", void 0);
    __decorate([
        reactive('change')
    ], PieSeriesCallout.prototype, "strokeWidth", void 0);
    return PieSeriesCallout;
}(Observable));
var PieSeriesTooltip = /** @class */ (function (_super) {
    __extends(PieSeriesTooltip, _super);
    function PieSeriesTooltip() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        reactive('change')
    ], PieSeriesTooltip.prototype, "renderer", void 0);
    return PieSeriesTooltip;
}(SeriesTooltip));
export { PieSeriesTooltip };
var PieSeries = /** @class */ (function (_super) {
    __extends(PieSeries, _super);
    function PieSeries() {
        var _this = _super.call(this) || this;
        _this.radiusScale = new LinearScale();
        _this.groupSelection = Selection.select(_this.group).selectAll();
        /**
         * The processed data that gets visualized.
         */
        _this.groupSelectionData = [];
        _this.angleScale = (function () {
            var scale = new LinearScale();
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
        _this.tooltip = new PieSeriesTooltip();
        /**
         * The key of the numeric field to use to determine the angle (for example,
         * a pie slice angle).
         */
        _this.angleKey = '';
        _this.angleName = '';
        _this._fills = [
            '#c16068',
            '#a2bf8a',
            '#ebcc87',
            '#80a0c3',
            '#b58dae',
            '#85c0d1'
        ];
        _this._strokes = [
            '#874349',
            '#718661',
            '#a48f5f',
            '#5a7088',
            '#7f637a',
            '#5d8692'
        ];
        _this.fillOpacity = 1;
        _this.strokeOpacity = 1;
        _this.lineDash = undefined;
        _this.lineDashOffset = 0;
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
        _this.callout.colors = _this.strokes;
        _this.addPropertyListener('data', function (event) {
            if (event.value) {
                event.source.seriesItemEnabled = event.value.map(function () { return true; });
            }
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
            this.strokes = values.map(function (color) { return Color.fromString(color).darker().toHexString(); });
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
    PieSeries.prototype.setColors = function (fills, strokes) {
        this.fills = fills;
        this.strokes = strokes;
        this.callout.colors = strokes;
    };
    PieSeries.prototype.getDomain = function (direction) {
        if (direction === ChartAxisDirection.X) {
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
        var radiusData = [];
        if (radiusKey) {
            var _b = this, radiusMin = _b.radiusMin, radiusMax = _b.radiusMax;
            var radii = data.map(function (datum) { return Math.abs(datum[radiusKey]); });
            var min_1 = radiusMin !== undefined ? radiusMin : Math.min.apply(Math, radii);
            var max = radiusMax !== undefined ? radiusMax : Math.max.apply(Math, radii);
            var delta_1 = max - min_1;
            radiusData = radii.map(function (value) { return delta_1 ? (value - min_1) / delta_1 : 1; });
        }
        groupSelectionData.length = 0;
        var rotation = toRadians(this.rotation);
        var halfPi = Math.PI / 2;
        var datumIndex = 0;
        // Simply use reduce here to pair up adjacent ratios.
        angleDataRatios.reduce(function (start, end) {
            var radius = radiusKey ? radiusData[datumIndex] : 1;
            var startAngle = angleScale.convert(start) + rotation;
            var endAngle = angleScale.convert(end) + rotation;
            var midAngle = (startAngle + endAngle) / 2;
            var span = Math.abs(endAngle - startAngle);
            var midCos = Math.cos(midAngle);
            var midSin = Math.sin(midAngle);
            var labelMinAngle = toRadians(_this.label.minAngle);
            var labelVisible = labelKey && span > labelMinAngle;
            var midAngle180 = normalizeAngle180(midAngle);
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
        var _a = this, radius = _a.radius, innerRadiusOffset = _a.innerRadiusOffset, outerRadiusOffset = _a.outerRadiusOffset, title = _a.title;
        this.radiusScale.range = [
            innerRadiusOffset ? radius + innerRadiusOffset : 0,
            radius + (outerRadiusOffset || 0)
        ];
        this.group.translationX = this.centerX;
        this.group.translationY = this.centerY;
        if (title) {
            title.node.translationY = -radius - outerRadiusOffset - 2;
            title.node.visible = title.enabled;
        }
        this.updateGroupSelection();
        this.updateNodes();
    };
    PieSeries.prototype.updateGroupSelection = function () {
        var updateGroups = this.groupSelection.setData(this.groupSelectionData);
        updateGroups.exit.remove();
        var enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Sector).each(function (node) { return node.tag = PieNodeTag.Sector; });
        enterGroups.append(Line).each(function (node) {
            node.tag = PieNodeTag.Callout;
            node.pointerEvents = PointerEvents.None;
        });
        enterGroups.append(Text).each(function (node) {
            node.tag = PieNodeTag.Label;
            node.pointerEvents = PointerEvents.None;
        });
        this.groupSelection = updateGroups.merge(enterGroups);
    };
    PieSeries.prototype.updateNodes = function () {
        var _this = this;
        if (!this.chart) {
            return;
        }
        var _a = this, fills = _a.fills, strokes = _a.strokes, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity, strokeWidth = _a.strokeWidth, outerRadiusOffset = _a.outerRadiusOffset, radiusScale = _a.radiusScale, callout = _a.callout, shadow = _a.shadow, _b = _a.highlightStyle, fill = _b.fill, stroke = _b.stroke, centerOffset = _b.centerOffset, angleKey = _a.angleKey, radiusKey = _a.radiusKey, formatter = _a.formatter;
        var highlightedDatum = this.chart.highlightedDatum;
        var centerOffsets = [];
        var innerRadius = radiusScale.convert(0);
        this.groupSelection.selectByTag(PieNodeTag.Sector).each(function (sector, datum, index) {
            var radius = radiusScale.convert(datum.radius);
            var outerRadius = Math.max(0, radius + outerRadiusOffset);
            var highlighted = datum === highlightedDatum;
            var sectorFill = highlighted && fill !== undefined ? fill : fills[index % fills.length];
            var sectorStroke = highlighted && stroke !== undefined ? stroke : strokes[index % strokes.length];
            var format = undefined;
            if (formatter) {
                format = formatter({
                    datum: datum.seriesDatum,
                    fill: sectorFill,
                    stroke: sectorStroke,
                    strokeWidth: strokeWidth,
                    highlighted: highlighted,
                    angleKey: angleKey,
                    radiusKey: radiusKey
                });
            }
            sector.innerRadius = innerRadius;
            sector.outerRadius = radius;
            sector.startAngle = datum.startAngle;
            sector.endAngle = datum.endAngle;
            sector.fill = format && format.fill || sectorFill;
            sector.stroke = format && format.stroke || sectorStroke;
            sector.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
            sector.fillOpacity = fillOpacity;
            sector.strokeOpacity = strokeOpacity;
            sector.lineDash = _this.lineDash;
            sector.lineDashOffset = _this.lineDashOffset;
            sector.centerOffset = highlighted && centerOffset !== undefined ? centerOffset : 0;
            sector.fillShadow = shadow;
            sector.lineJoin = 'round';
            centerOffsets.push(sector.centerOffset);
        });
        var calloutColors = callout.colors, calloutLength = callout.length, calloutStrokeWidth = callout.strokeWidth;
        this.groupSelection.selectByTag(PieNodeTag.Callout).each(function (line, datum, index) {
            if (datum.label) {
                var radius = radiusScale.convert(datum.radius);
                line.strokeWidth = calloutStrokeWidth;
                line.stroke = calloutColors[index % calloutColors.length];
                line.x1 = datum.midCos * radius;
                line.y1 = datum.midSin * radius;
                line.x2 = datum.midCos * (radius + calloutLength);
                line.y2 = datum.midSin * (radius + calloutLength);
            }
            else {
                line.stroke = undefined;
            }
        });
        {
            var _c = this.label, offset_1 = _c.offset, fontStyle_1 = _c.fontStyle, fontWeight_1 = _c.fontWeight, fontSize_1 = _c.fontSize, fontFamily_1 = _c.fontFamily, color_1 = _c.color;
            this.groupSelection.selectByTag(PieNodeTag.Label).each(function (text, datum, index) {
                var label = datum.label;
                if (label) {
                    var radius = radiusScale.convert(datum.radius);
                    var labelRadius = centerOffsets[index] + radius + calloutLength + offset_1;
                    text.fontStyle = fontStyle_1;
                    text.fontWeight = fontWeight_1;
                    text.fontSize = fontSize_1;
                    text.fontFamily = fontFamily_1;
                    text.text = label.text;
                    text.x = datum.midCos * labelRadius;
                    text.y = datum.midSin * labelRadius;
                    text.fill = color_1;
                    text.textAlign = label.textAlign;
                    text.textBaseline = label.textBaseline;
                }
                else {
                    text.fill = undefined;
                }
            });
        }
    };
    PieSeries.prototype.fireNodeClickEvent = function (event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event: event,
            series: this,
            datum: datum.seriesDatum,
            angleKey: this.angleKey,
            labelKey: this.labelKey,
            radiusKey: this.radiusKey
        });
    };
    PieSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var angleKey = this.angleKey;
        if (!angleKey) {
            return '';
        }
        var _a = this, fills = _a.fills, tooltip = _a.tooltip, angleName = _a.angleName, radiusKey = _a.radiusKey, radiusName = _a.radiusName, labelKey = _a.labelKey, labelName = _a.labelName;
        var _b = tooltip.renderer, tooltipRenderer = _b === void 0 ? this.tooltipRenderer : _b;
        var color = fills[nodeDatum.index % fills.length];
        var datum = nodeDatum.seriesDatum;
        var label = labelKey ? datum[labelKey] + ": " : '';
        var angleValue = datum[angleKey];
        var formattedAngleValue = typeof angleValue === 'number' ? toFixed(angleValue) : angleValue.toString();
        var title = this.title ? this.title.text : undefined;
        var content = label + formattedAngleValue;
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content
        };
        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
                datum: datum,
                angleKey: angleKey,
                angleValue: angleValue,
                angleName: angleName,
                radiusKey: radiusKey,
                radiusValue: radiusKey ? datum[radiusKey] : undefined,
                radiusName: radiusName,
                labelKey: labelKey,
                labelName: labelName,
                title: title,
                color: color,
            }), defaults);
        }
        return toTooltipHtml(defaults);
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
        reactive('dataChange')
    ], PieSeries.prototype, "angleKey", void 0);
    __decorate([
        reactive('update')
    ], PieSeries.prototype, "angleName", void 0);
    __decorate([
        reactive('dataChange')
    ], PieSeries.prototype, "radiusKey", void 0);
    __decorate([
        reactive('update')
    ], PieSeries.prototype, "radiusName", void 0);
    __decorate([
        reactive('dataChange')
    ], PieSeries.prototype, "radiusMin", void 0);
    __decorate([
        reactive('dataChange')
    ], PieSeries.prototype, "radiusMax", void 0);
    __decorate([
        reactive('dataChange')
    ], PieSeries.prototype, "labelKey", void 0);
    __decorate([
        reactive('update')
    ], PieSeries.prototype, "labelName", void 0);
    __decorate([
        reactive('layoutChange')
    ], PieSeries.prototype, "fillOpacity", void 0);
    __decorate([
        reactive('layoutChange')
    ], PieSeries.prototype, "strokeOpacity", void 0);
    __decorate([
        reactive('update')
    ], PieSeries.prototype, "lineDash", void 0);
    __decorate([
        reactive('update')
    ], PieSeries.prototype, "lineDashOffset", void 0);
    __decorate([
        reactive('update')
    ], PieSeries.prototype, "formatter", void 0);
    __decorate([
        reactive('dataChange')
    ], PieSeries.prototype, "rotation", void 0);
    __decorate([
        reactive('layoutChange')
    ], PieSeries.prototype, "outerRadiusOffset", void 0);
    __decorate([
        reactive('dataChange')
    ], PieSeries.prototype, "innerRadiusOffset", void 0);
    __decorate([
        reactive('layoutChange')
    ], PieSeries.prototype, "strokeWidth", void 0);
    __decorate([
        reactive('layoutChange')
    ], PieSeries.prototype, "shadow", void 0);
    return PieSeries;
}(PolarSeries));
export { PieSeries };
