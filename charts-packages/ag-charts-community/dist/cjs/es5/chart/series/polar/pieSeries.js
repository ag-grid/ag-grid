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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var group_1 = require("../../../scene/group");
var line_1 = require("../../../scene/shape/line");
var text_1 = require("../../../scene/shape/text");
var selection_1 = require("../../../scene/selection");
var linearScale_1 = require("../../../scale/linearScale");
var continuousScale_1 = require("../../../scale/continuousScale");
var sector_1 = require("../../../scene/shape/sector");
var series_1 = require("./../series");
var label_1 = require("../../label");
var node_1 = require("../../../scene/node");
var angle_1 = require("../../../util/angle");
var number_1 = require("../../../util/number");
var caption_1 = require("../../../caption");
var observable_1 = require("../../../util/observable");
var polarSeries_1 = require("./polarSeries");
var chartAxis_1 = require("../../chartAxis");
var chart_1 = require("../../chart");
var PieHighlightStyle = /** @class */ (function (_super) {
    __extends(PieHighlightStyle, _super);
    function PieHighlightStyle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PieHighlightStyle;
}(series_1.HighlightStyle));
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
        _this.formatter = undefined;
        return _this;
    }
    return PieSeriesLabel;
}(label_1.Label));
var PieSeriesCallout = /** @class */ (function (_super) {
    __extends(PieSeriesCallout, _super);
    function PieSeriesCallout() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.colors = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];
        _this.length = 10;
        _this.strokeWidth = 1;
        return _this;
    }
    return PieSeriesCallout;
}(observable_1.Observable));
var PieSeriesTooltip = /** @class */ (function (_super) {
    __extends(PieSeriesTooltip, _super);
    function PieSeriesTooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = undefined;
        return _this;
    }
    return PieSeriesTooltip;
}(series_1.SeriesTooltip));
exports.PieSeriesTooltip = PieSeriesTooltip;
var PieTitle = /** @class */ (function (_super) {
    __extends(PieTitle, _super);
    function PieTitle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.showInLegend = false;
        return _this;
    }
    return PieTitle;
}(caption_1.Caption));
exports.PieTitle = PieTitle;
var PieSeries = /** @class */ (function (_super) {
    __extends(PieSeries, _super);
    function PieSeries() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.radiusScale = new linearScale_1.LinearScale();
        _this.groupSelection = selection_1.Selection.select(_this.pickGroup).selectAll();
        _this.highlightSelection = selection_1.Selection.select(_this.highlightGroup).selectAll();
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
        _this.tooltip = new PieSeriesTooltip();
        /**
         * The key of the numeric field to use to determine the angle (for example,
         * a pie slice angle).
         */
        _this.angleKey = '';
        _this.angleName = '';
        /**
         * The key of the numeric field to use to determine the radii of pie slices.
         * The largest value will correspond to the full radius and smaller values to
         * proportionally smaller radii.
         */
        _this.radiusKey = undefined;
        _this.radiusName = undefined;
        _this.radiusMin = undefined;
        _this.radiusMax = undefined;
        _this.labelKey = undefined;
        _this.labelName = undefined;
        _this.fills = ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'];
        _this.strokes = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];
        _this.fillOpacity = 1;
        _this.strokeOpacity = 1;
        _this.lineDash = [0];
        _this.lineDashOffset = 0;
        _this.formatter = undefined;
        /**
         * The series rotation in degrees.
         */
        _this.rotation = 0;
        _this.outerRadiusOffset = 0;
        _this.innerRadiusOffset = 0;
        _this.strokeWidth = 1;
        _this.shadow = undefined;
        _this.highlightStyle = new PieHighlightStyle();
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
                    this.seriesGroup.removeChild(oldTitle.node);
                }
                if (value) {
                    value.node.textBaseline = 'bottom';
                    this.seriesGroup.appendChild(value.node);
                }
                this._title = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (input) {
            this._data = input;
            this.processSeriesItemEnabled();
        },
        enumerable: true,
        configurable: true
    });
    PieSeries.prototype.visibleChanged = function () {
        this.processSeriesItemEnabled();
    };
    PieSeries.prototype.processSeriesItemEnabled = function () {
        var _a;
        var _b = this, data = _b.data, visible = _b.visible;
        this.seriesItemEnabled = ((_a = data) === null || _a === void 0 ? void 0 : _a.map(function () { return visible; })) || [];
    };
    PieSeries.prototype.setColors = function (fills, strokes) {
        this.fills = fills;
        this.strokes = strokes;
        this.callout.colors = strokes;
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
        var _a = this, angleKey = _a.angleKey, radiusKey = _a.radiusKey, seriesItemEnabled = _a.seriesItemEnabled, angleScale = _a.angleScale, groupSelectionData = _a.groupSelectionData, label = _a.label;
        var data = angleKey && this.data ? this.data : [];
        var angleData = data.map(function (datum, index) { return (seriesItemEnabled[index] && Math.abs(+datum[angleKey])) || 0; });
        var angleDataTotal = angleData.reduce(function (a, b) { return a + b; }, 0);
        // The ratios (in [0, 1] interval) used to calculate the end angle value for every pie slice.
        // Each slice starts where the previous one ends, so we only keep the ratios for end angles.
        var angleDataRatios = (function () {
            var sum = 0;
            return angleData.map(function (datum) { return (sum += datum / angleDataTotal); });
        })();
        var labelFormatter = label.formatter;
        var labelKey = label.enabled && this.labelKey;
        var labelData = [];
        var radiusData = [];
        if (labelKey) {
            if (labelFormatter) {
                labelData = data.map(function (datum) { return labelFormatter({ value: datum[labelKey] }); });
            }
            else {
                labelData = data.map(function (datum) { return String(datum[labelKey]); });
            }
        }
        if (radiusKey) {
            var _b = this, radiusMin = _b.radiusMin, radiusMax = _b.radiusMax;
            var radii = data.map(function (datum) { return Math.abs(datum[radiusKey]); });
            var min_1 = (radiusMin !== null && radiusMin !== void 0 ? radiusMin : 0);
            var max = radiusMax ? radiusMax : Math.max.apply(Math, __spread(radii));
            var delta_1 = max - min_1;
            radiusData = radii.map(function (value) { return (delta_1 ? (value - min_1) / delta_1 : 1); });
        }
        groupSelectionData.length = 0;
        var rotation = angle_1.toRadians(this.rotation);
        var halfPi = Math.PI / 2;
        var datumIndex = 0;
        var quadrantTextOpts = [
            { textAlign: 'center', textBaseline: 'bottom' },
            { textAlign: 'left', textBaseline: 'middle' },
            { textAlign: 'center', textBaseline: 'hanging' },
            { textAlign: 'right', textBaseline: 'middle' },
        ];
        // Process segments.
        var end = 0;
        angleDataRatios.forEach(function (start) {
            if (isNaN(start)) {
                return;
            } // No segments displayed - nothing to do.
            var radius = radiusKey ? radiusData[datumIndex] : 1;
            var startAngle = angleScale.convert(start) + rotation;
            var endAngle = angleScale.convert(end) + rotation;
            var midAngle = (startAngle + endAngle) / 2;
            var span = Math.abs(endAngle - startAngle);
            var midCos = Math.cos(midAngle);
            var midSin = Math.sin(midAngle);
            var labelMinAngle = angle_1.toRadians(label.minAngle);
            var labelVisible = labelKey && span > labelMinAngle;
            var midAngle180 = angle_1.normalizeAngle180(midAngle);
            // Split the circle into quadrants like so: ⊗
            var quadrantStart = (-3 * Math.PI) / 4; // same as `normalizeAngle180(toRadians(-135))`
            var quadrantOffset = midAngle180 - quadrantStart;
            var quadrant = Math.floor(quadrantOffset / halfPi);
            var quadrantIndex = number_1.mod(quadrant, quadrantTextOpts.length);
            var _a = quadrantTextOpts[quadrantIndex], textAlign = _a.textAlign, textBaseline = _a.textBaseline;
            groupSelectionData.push({
                series: _this,
                datum: data[datumIndex],
                itemId: datumIndex,
                index: datumIndex,
                radius: radius,
                startAngle: startAngle,
                endAngle: endAngle,
                midAngle: midAngle,
                midCos: midCos,
                midSin: midSin,
                label: labelVisible
                    ? {
                        text: labelData[datumIndex],
                        textAlign: textAlign,
                        textBaseline: textBaseline,
                    }
                    : undefined,
            });
            datumIndex++;
            end = start; // Update for next iteration.
        });
        return true;
    };
    PieSeries.prototype.createNodeData = function () {
        return [];
    };
    PieSeries.prototype.update = function () {
        var _a = this, radius = _a.radius, innerRadiusOffset = _a.innerRadiusOffset, outerRadiusOffset = _a.outerRadiusOffset, title = _a.title;
        this.radiusScale.range = [
            innerRadiusOffset ? radius + innerRadiusOffset : 0,
            radius + (outerRadiusOffset || 0),
        ];
        this.group.translationX = this.centerX;
        this.group.translationY = this.centerY;
        if (title) {
            var outerRadius = Math.max(0, this.radiusScale.range[1]);
            if (outerRadius === 0) {
                title.node.visible = false;
            }
            else {
                title.node.translationY = -radius - outerRadiusOffset - 2;
                title.node.visible = title.enabled;
            }
        }
        this.updateSelections();
        this.updateNodes();
    };
    PieSeries.prototype.updateSelections = function () {
        this.updateGroupSelection();
    };
    PieSeries.prototype.updateGroupSelection = function () {
        var _this = this;
        var _a = this, groupSelection = _a.groupSelection, highlightSelection = _a.highlightSelection;
        var update = function (selection, appendLabels) {
            var updateGroups = selection.setData(_this.groupSelectionData);
            updateGroups.exit.remove();
            var enterGroups = updateGroups.enter.append(group_1.Group);
            enterGroups.append(sector_1.Sector).each(function (node) { return (node.tag = PieNodeTag.Sector); });
            if (appendLabels) {
                enterGroups.append(line_1.Line).each(function (node) {
                    node.tag = PieNodeTag.Callout;
                    node.pointerEvents = node_1.PointerEvents.None;
                });
                enterGroups.append(text_1.Text).each(function (node) {
                    node.tag = PieNodeTag.Label;
                    node.pointerEvents = node_1.PointerEvents.None;
                });
            }
            return updateGroups.merge(enterGroups);
        };
        this.groupSelection = update(groupSelection, true);
        this.highlightSelection = update(highlightSelection, false);
    };
    PieSeries.prototype.updateNodes = function () {
        var _this = this;
        var _a, _b;
        if (!this.chart) {
            return;
        }
        var isVisible = this.seriesItemEnabled.indexOf(true) >= 0;
        this.group.visible = isVisible;
        this.seriesGroup.visible = isVisible;
        this.highlightGroup.visible = isVisible && ((_b = (_a = this.chart) === null || _a === void 0 ? void 0 : _a.highlightedDatum) === null || _b === void 0 ? void 0 : _b.series) === this;
        this.seriesGroup.opacity = this.getOpacity();
        var _c = this, fills = _c.fills, strokes = _c.strokes, seriesFillOpacity = _c.fillOpacity, strokeOpacity = _c.strokeOpacity, radiusScale = _c.radiusScale, callout = _c.callout, shadow = _c.shadow, highlightedDatum = _c.chart.highlightedDatum, _d = _c.highlightStyle, deprecatedFill = _d.fill, deprecatedStroke = _d.stroke, deprecatedStrokeWidth = _d.strokeWidth, _e = _d.item, _f = _e.fill, highlightedFill = _f === void 0 ? deprecatedFill : _f, _g = _e.fillOpacity, highlightFillOpacity = _g === void 0 ? seriesFillOpacity : _g, _h = _e.stroke, highlightedStroke = _h === void 0 ? deprecatedStroke : _h, _j = _e.strokeWidth, highlightedDatumStrokeWidth = _j === void 0 ? deprecatedStrokeWidth : _j, angleKey = _c.angleKey, radiusKey = _c.radiusKey, formatter = _c.formatter;
        var centerOffsets = [];
        var innerRadius = radiusScale.convert(0);
        var updateSectorFn = function (sector, datum, index, isDatumHighlighted) {
            var radius = radiusScale.convert(datum.radius, continuousScale_1.clamper);
            var fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : fills[index % fills.length];
            var fillOpacity = isDatumHighlighted ? highlightFillOpacity : seriesFillOpacity;
            var stroke = isDatumHighlighted && highlightedStroke !== undefined
                ? highlightedStroke
                : strokes[index % strokes.length];
            var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                ? highlightedDatumStrokeWidth
                : _this.getStrokeWidth(_this.strokeWidth);
            var format = undefined;
            if (formatter) {
                format = formatter({
                    datum: datum.datum,
                    angleKey: angleKey,
                    radiusKey: radiusKey,
                    fill: fill,
                    stroke: stroke,
                    strokeWidth: strokeWidth,
                    highlighted: isDatumHighlighted,
                });
            }
            // Bring highlighted slice's parent group to front.
            var parent = sector.parent && sector.parent.parent;
            if (isDatumHighlighted && parent) {
                parent.removeChild(sector.parent);
                parent.appendChild(sector.parent);
            }
            sector.innerRadius = Math.max(0, innerRadius);
            sector.outerRadius = Math.max(0, radius);
            sector.startAngle = datum.startAngle;
            sector.endAngle = datum.endAngle;
            sector.fill = (format && format.fill) || fill;
            sector.stroke = (format && format.stroke) || stroke;
            sector.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
            sector.fillOpacity = fillOpacity;
            sector.strokeOpacity = strokeOpacity;
            sector.lineDash = _this.lineDash;
            sector.lineDashOffset = _this.lineDashOffset;
            sector.fillShadow = shadow;
            sector.lineJoin = 'round';
            centerOffsets.push(sector.centerOffset);
        };
        this.groupSelection
            .selectByTag(PieNodeTag.Sector)
            .each(function (node, datum, index) { return updateSectorFn(node, datum, index, false); });
        this.highlightSelection.selectByTag(PieNodeTag.Sector).each(function (node, datum, index) {
            var isDatumHighlighted = !!highlightedDatum && highlightedDatum.series === _this && datum.itemId === highlightedDatum.itemId;
            node.visible = isDatumHighlighted;
            if (node.visible) {
                updateSectorFn(node, datum, index, isDatumHighlighted);
            }
        });
        var calloutColors = callout.colors, calloutLength = callout.length, calloutStrokeWidth = callout.strokeWidth;
        this.groupSelection.selectByTag(PieNodeTag.Callout).each(function (line, datum, index) {
            var radius = radiusScale.convert(datum.radius, continuousScale_1.clamper);
            var outerRadius = Math.max(0, radius);
            if (datum.label && outerRadius !== 0) {
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
            var _k = this.label, offset_1 = _k.offset, fontStyle_1 = _k.fontStyle, fontWeight_1 = _k.fontWeight, fontSize_1 = _k.fontSize, fontFamily_1 = _k.fontFamily, color_1 = _k.color;
            this.groupSelection.selectByTag(PieNodeTag.Label).each(function (text, datum, index) {
                var label = datum.label;
                var radius = radiusScale.convert(datum.radius, continuousScale_1.clamper);
                var outerRadius = Math.max(0, radius);
                if (label && outerRadius !== 0) {
                    var labelRadius = centerOffsets[index] + outerRadius + calloutLength + offset_1;
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
            datum: datum.datum,
            angleKey: this.angleKey,
            labelKey: this.labelKey,
            radiusKey: this.radiusKey,
        });
    };
    PieSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var angleKey = this.angleKey;
        if (!angleKey) {
            return '';
        }
        var _a = this, fills = _a.fills, tooltip = _a.tooltip, angleName = _a.angleName, radiusKey = _a.radiusKey, radiusName = _a.radiusName, labelKey = _a.labelKey, labelName = _a.labelName;
        var tooltipRenderer = tooltip.renderer;
        var color = fills[nodeDatum.index % fills.length];
        var datum = nodeDatum.datum;
        var label = labelKey ? datum[labelKey] + ": " : '';
        var angleValue = datum[angleKey];
        var formattedAngleValue = typeof angleValue === 'number' ? number_1.toFixed(angleValue) : angleValue.toString();
        var title = this.title ? this.title.text : undefined;
        var content = label + formattedAngleValue;
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content,
        };
        if (tooltipRenderer) {
            return chart_1.toTooltipHtml(tooltipRenderer({
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
        return chart_1.toTooltipHtml(defaults);
    };
    PieSeries.prototype.listSeriesItems = function (legendData) {
        var _this = this;
        var _a = this, labelKey = _a.labelKey, data = _a.data;
        if (data && data.length && labelKey) {
            var _b = this, fills_1 = _b.fills, strokes_1 = _b.strokes, id_1 = _b.id;
            var titleText_1 = this.title && this.title.showInLegend && this.title.text;
            data.forEach(function (datum, index) {
                var labelParts = [];
                titleText_1 && labelParts.push(titleText_1);
                labelParts.push(String(datum[labelKey]));
                legendData.push({
                    id: id_1,
                    itemId: index,
                    enabled: _this.seriesItemEnabled[index],
                    label: {
                        text: labelParts.join(' - '),
                    },
                    marker: {
                        fill: fills_1[index % fills_1.length],
                        stroke: strokes_1[index % strokes_1.length],
                        fillOpacity: _this.fillOpacity,
                        strokeOpacity: _this.strokeOpacity,
                    },
                });
            });
        }
    };
    PieSeries.prototype.toggleSeriesItem = function (itemId, enabled) {
        this.seriesItemEnabled[itemId] = enabled;
        this.nodeDataRefresh = true;
    };
    PieSeries.className = 'PieSeries';
    PieSeries.type = 'pie';
    return PieSeries;
}(polarSeries_1.PolarSeries));
exports.PieSeries = PieSeries;
