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
Object.defineProperty(exports, "__esModule", { value: true });
var group_1 = require("../../scene/group");
var line_1 = require("../../scene/shape/line");
var text_1 = require("../../scene/shape/text");
var selection_1 = require("../../scene/selection");
var linearScale_1 = require("../../scale/linearScale");
var angle_1 = require("../../util/angle");
var palettes_1 = require("../palettes");
var sector_1 = require("../../scene/shape/sector");
var series_1 = require("./series");
var node_1 = require("../../scene/node");
var number_1 = require("../../util/number");
var ag_grid_community_1 = require("ag-grid-community");
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
        _this.radiusScale = linearScale_1.default();
        _this.groupSelection = selection_1.Selection.select(_this.group).selectAll();
        /**
         * The processed data that gets visualized.
         */
        _this.groupSelectionData = [];
        _this.enabled = [];
        _this.angleScale = (function () {
            var scale = linearScale_1.default();
            // Each slice is a ratio of the whole, where all ratios add up to 1.
            scale.domain = [0, 1];
            // Add 90 deg to start the first pie at 12 o'clock.
            scale.range = [-Math.PI, Math.PI].map(function (angle) { return angle + Math.PI / 2; });
            return scale;
        })();
        _this._title = undefined;
        /**
         * `null` means make the callout color the same as {@link strokeStyle}.
         */
        _this._calloutColors = palettes_1.default.strokes;
        _this._calloutStrokeWidth = 1;
        _this._calloutLength = 10;
        _this._labelOffset = 3; // from the callout line
        _this._labelFontStyle = undefined;
        _this._labelFontWeight = undefined;
        _this._labelFontSize = 12;
        _this._labelFontFamily = 'Verdana, sans-serif';
        _this._labelColor = 'black';
        _this._labelMinAngle = 20; // in degrees
        /**
         * The name of the numeric field to use to determine the angle (for example,
         * a pie slice angle).
         */
        _this._angleField = '';
        /**
         * The name of the numeric field to use to determine the radii of pie slices.
         * The largest value will correspond to the full radius and smaller values to
         * proportionally smaller radii. To prevent confusing visuals, this config only works
         * if {@link innerRadiusOffset} is zero.
         */
        _this._radiusField = '';
        /**
         * The value of the label field is supposed to be a string.
         * If it isn't, it will be coerced to a string value.
         */
        _this._labelField = '';
        _this._labelEnabled = true;
        _this._fills = palettes_1.default.fills;
        _this._strokes = palettes_1.default.strokes;
        _this._fillOpacity = 1;
        _this._strokeOpacity = 1;
        /**
         * The series rotation in degrees.
         */
        _this._rotation = 0;
        _this._outerRadiusOffset = 0;
        _this._innerRadiusOffset = 0;
        _this._strokeWidth = 1;
        _this._shadow = undefined;
        _this.highlightStyle = {
            fill: 'yellow'
        };
        return _this;
    }
    Object.defineProperty(PieSeries.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (data) {
            this._data = data;
            var enabled = this.enabled;
            enabled.length = data.length;
            for (var i = 0, ln = data.length; i < ln; i++) {
                enabled[i] = true;
            }
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "title", {
        get: function () {
            return this._title;
        },
        set: function (value) {
            var _this = this;
            var oldTitle = this._title;
            if (oldTitle !== value) {
                if (oldTitle) {
                    oldTitle.onLayoutChange = undefined;
                    this.group.removeChild(oldTitle.node);
                }
                if (value) {
                    value.node.textBaseline = 'bottom';
                    value.onLayoutChange = function () { return _this.scheduleLayout(); };
                    this.group.appendChild(value.node);
                }
                this._title = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "calloutColors", {
        get: function () {
            return this._calloutColors;
        },
        set: function (value) {
            if (this._calloutColors !== value) {
                this._calloutColors = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "calloutStrokeWidth", {
        get: function () {
            return this._calloutStrokeWidth;
        },
        set: function (value) {
            if (this._calloutStrokeWidth !== value) {
                this._calloutStrokeWidth = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "calloutLength", {
        get: function () {
            return this._calloutLength;
        },
        set: function (value) {
            if (this._calloutLength !== value) {
                this._calloutLength = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "labelOffset", {
        get: function () {
            return this._labelOffset;
        },
        set: function (value) {
            if (this._labelOffset !== value) {
                this._labelOffset = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "labelFontStyle", {
        get: function () {
            return this._labelFontStyle;
        },
        set: function (value) {
            if (this._labelFontStyle !== value) {
                this._labelFontStyle = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "labelFontWeight", {
        get: function () {
            return this._labelFontWeight;
        },
        set: function (value) {
            if (this._labelFontWeight !== value) {
                this._labelFontWeight = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "labelFontSize", {
        get: function () {
            return this._labelFontSize;
        },
        set: function (value) {
            if (this._labelFontSize !== value) {
                this._labelFontSize = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "labelFontFamily", {
        get: function () {
            return this._labelFontFamily;
        },
        set: function (value) {
            if (this._labelFontFamily !== value) {
                this._labelFontFamily = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "labelColor", {
        get: function () {
            return this._labelColor;
        },
        set: function (value) {
            if (this._labelColor !== value) {
                this._labelColor = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "labelMinAngle", {
        get: function () {
            return this._labelMinAngle;
        },
        set: function (value) {
            if (this._labelMinAngle !== value) {
                this._labelMinAngle = value;
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "chart", {
        get: function () {
            return this._chart;
        },
        set: function (chart) {
            if (this._chart !== chart) {
                this._chart = chart;
                this.scheduleLayout();
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
                this.scheduleData();
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
                this.scheduleData();
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
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "labelEnabled", {
        get: function () {
            return this._labelEnabled;
        },
        set: function (value) {
            if (this._labelEnabled !== value) {
                this._labelEnabled = value;
                this.scheduleData();
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
            this.strokes = values.map(function (color) { return ag_grid_community_1.Color.fromString(color).darker().toHexString(); });
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
            this.calloutColors = values;
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "fillOpacity", {
        get: function () {
            return this._fillOpacity;
        },
        set: function (value) {
            if (this._fillOpacity !== value) {
                this._fillOpacity = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "strokeOpacity", {
        get: function () {
            return this._strokeOpacity;
        },
        set: function (value) {
            if (this._strokeOpacity !== value) {
                this._strokeOpacity = value;
                this.scheduleLayout();
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
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "outerRadiusOffset", {
        get: function () {
            return this._outerRadiusOffset;
        },
        set: function (value) {
            if (this._outerRadiusOffset !== value) {
                this._outerRadiusOffset = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "innerRadiusOffset", {
        get: function () {
            return this._innerRadiusOffset;
        },
        set: function (value) {
            if (this._innerRadiusOffset !== value) {
                this._innerRadiusOffset = value;
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "strokeWidth", {
        get: function () {
            return this._strokeWidth;
        },
        set: function (value) {
            if (this._strokeWidth !== value) {
                this._strokeWidth = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "shadow", {
        get: function () {
            return this._shadow;
        },
        set: function (value) {
            if (this._shadow !== value) {
                this._shadow = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    PieSeries.prototype.highlightNode = function (node) {
        if (!(node instanceof sector_1.Sector)) {
            return;
        }
        this.highlightedNode = node;
        this.scheduleLayout();
    };
    PieSeries.prototype.dehighlightNode = function () {
        this.highlightedNode = undefined;
        this.scheduleLayout();
    };
    PieSeries.prototype.getDomainX = function () {
        return this.angleScale.domain;
    };
    PieSeries.prototype.getDomainY = function () {
        return this.radiusScale.domain;
    };
    PieSeries.prototype.processData = function () {
        var _this = this;
        var data = this.data;
        var enabled = this.enabled;
        var angleData = data.map(function (datum, index) { return enabled[index] && +datum[_this.angleField] || 0; });
        var angleDataTotal = angleData.reduce(function (a, b) { return a + b; }, 0);
        // The ratios (in [0, 1] interval) used to calculate the end angle value for every pie slice.
        // Each slice starts where the previous one ends, so we only keep the ratios for end angles.
        var angleDataRatios = (function () {
            var sum = 0;
            return angleData.map(function (datum) { return sum += datum / angleDataTotal; });
        })();
        var labelField = this.labelEnabled && this.labelField;
        var labelData = [];
        if (labelField) {
            labelData = data.map(function (datum) { return String(datum[labelField]); });
        }
        var radiusField = this.radiusField;
        var useRadiusField = !!radiusField && !this.innerRadiusOffset;
        var radiusData = [];
        if (useRadiusField) {
            radiusData = data.map(function (datum) { return Math.abs(datum[radiusField]); });
            var maxDatum_1 = Math.max.apply(Math, radiusData);
            radiusData.forEach(function (value, index, array) { return array[index] = value / maxDatum_1; });
        }
        var angleScale = this.angleScale;
        var groupSelectionData = this.groupSelectionData;
        groupSelectionData.length = 0;
        var rotation = angle_1.toRadians(this.rotation);
        var halfPi = Math.PI / 2;
        var datumIndex = 0;
        // Simply use reduce here to pair up adjacent ratios.
        angleDataRatios.reduce(function (start, end) {
            var radius = useRadiusField ? radiusData[datumIndex] : 1;
            var startAngle = angleScale.convert(start) + rotation;
            var endAngle = angleScale.convert(end) + rotation;
            var midAngle = (startAngle + endAngle) / 2;
            var span = Math.abs(endAngle - startAngle);
            var midCos = Math.cos(midAngle);
            var midSin = Math.sin(midAngle);
            var labelMinAngle = angle_1.toRadians(_this.labelMinAngle);
            var labelVisible = labelField && span > labelMinAngle;
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
                index: datumIndex,
                seriesDatum: data[datumIndex],
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
        var _this = this;
        var chart = this.chart;
        var visible = this.group.visible = this.visible && this.enabled.indexOf(true) >= 0;
        if (!chart || !visible || chart.dataPending || chart.layoutPending) {
            return;
        }
        var fills = this.fills;
        var strokes = this.strokes;
        var fillOpacity = this.fillOpacity;
        var strokeOpacity = this.strokeOpacity;
        var calloutColors = this.calloutColors;
        var outerRadiusOffset = this.outerRadiusOffset;
        var innerRadiusOffset = this.innerRadiusOffset;
        var radiusScale = this.radiusScale;
        radiusScale.range = [0, chart.radius];
        this.group.translationX = chart.centerX;
        this.group.translationY = chart.centerY;
        var title = this.title;
        if (title) {
            title.node.translationY = -chart.radius - outerRadiusOffset - 2;
            title.node.visible = title.enabled;
        }
        var updateGroups = this.groupSelection.setData(this.groupSelectionData);
        updateGroups.exit.remove();
        var enterGroups = updateGroups.enter.append(group_1.Group);
        enterGroups.append(sector_1.Sector).each(function (node) { return node.tag = PieSeriesNodeTag.Sector; });
        enterGroups.append(line_1.Line).each(function (node) {
            node.tag = PieSeriesNodeTag.Callout;
            node.pointerEvents = node_1.PointerEvents.None;
        });
        enterGroups.append(text_1.Text).each(function (node) {
            node.tag = PieSeriesNodeTag.Label;
            node.pointerEvents = node_1.PointerEvents.None;
        });
        var groupSelection = updateGroups.merge(enterGroups);
        var minOuterRadius = Infinity;
        var outerRadii = [];
        var centerOffsets = [];
        var highlightedNode = this.highlightedNode;
        groupSelection.selectByTag(PieSeriesNodeTag.Sector)
            .each(function (sector, datum, index) {
            var radius = radiusScale.convert(datum.radius);
            var outerRadius = Math.max(0, radius + outerRadiusOffset);
            if (minOuterRadius > outerRadius) {
                minOuterRadius = outerRadius;
            }
            sector.outerRadius = outerRadius;
            sector.innerRadius = Math.max(0, innerRadiusOffset ? radius + innerRadiusOffset : 0);
            sector.startAngle = datum.startAngle;
            sector.endAngle = datum.endAngle;
            sector.fill = sector === highlightedNode && _this.highlightStyle.fill !== undefined
                ? _this.highlightStyle.fill
                : fills[index % fills.length];
            sector.stroke = sector === highlightedNode && _this.highlightStyle.stroke !== undefined
                ? _this.highlightStyle.stroke
                : strokes[index % strokes.length];
            sector.fillOpacity = fillOpacity;
            sector.strokeOpacity = strokeOpacity;
            sector.centerOffset = sector === highlightedNode && _this.highlightStyle.centerOffset !== undefined
                ? _this.highlightStyle.centerOffset
                : 0;
            sector.fillShadow = _this.shadow;
            sector.strokeWidth = _this.strokeWidth;
            sector.lineJoin = 'round';
            outerRadii.push(outerRadius);
            centerOffsets.push(sector.centerOffset);
        });
        var calloutLength = this.calloutLength;
        groupSelection.selectByTag(PieSeriesNodeTag.Callout)
            .each(function (line, datum, index) {
            if (datum.label) {
                var outerRadius = centerOffsets[index] + outerRadii[index];
                line.strokeWidth = _this.calloutStrokeWidth;
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
        var labelOffset = this.labelOffset;
        groupSelection.selectByTag(PieSeriesNodeTag.Label)
            .each(function (text, datum, index) {
            var label = datum.label;
            if (label) {
                var outerRadius = outerRadii[index];
                var labelRadius = centerOffsets[index] + outerRadius + calloutLength + labelOffset;
                text.fontStyle = _this.labelFontStyle;
                text.fontWeight = _this.labelFontWeight;
                text.fontSize = _this.labelFontSize;
                text.fontFamily = _this.labelFontFamily;
                text.text = label.text;
                text.x = datum.midCos * labelRadius;
                text.y = datum.midSin * labelRadius;
                text.fill = _this.labelColor;
                text.textAlign = label.textAlign;
                text.textBaseline = label.textBaseline;
            }
            else {
                text.fill = undefined;
            }
        });
        this.groupSelection = groupSelection;
    };
    PieSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var html = '';
        var angleField = this.angleField;
        if (!angleField) {
            return html;
        }
        var title = this.title ? this.title.text : undefined;
        var color = this.fills[nodeDatum.index % this.fills.length];
        if (this.tooltipRenderer) {
            html = this.tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                angleField: angleField,
                radiusField: this.radiusField,
                labelField: this.labelField,
                title: title,
                color: color
            });
        }
        else {
            var titleStyle = "style=\"color: white; background-color: " + color + "\"";
            title = title ? "<div class=\"title\" " + titleStyle + ">" + title + "</div>" : '';
            var label = this.labelField ? nodeDatum.seriesDatum[this.labelField] + ": " : '';
            var value = nodeDatum.seriesDatum[angleField];
            var formattedValue = typeof (value) === 'number' ? number_1.toFixed(value) : value.toString();
            html = title + "<div class=\"content\">" + label + formattedValue + "</div>";
        }
        return html;
    };
    PieSeries.prototype.listSeriesItems = function (data) {
        var _this = this;
        var labelField = this.labelField;
        if (this.data.length && labelField) {
            var fills_1 = this.fills;
            var strokes_1 = this.strokes;
            var id_1 = this.id;
            this.data.forEach(function (datum, index) {
                data.push({
                    id: id_1,
                    itemId: index,
                    enabled: _this.enabled[index],
                    label: {
                        text: String(datum[labelField])
                    },
                    marker: {
                        fill: fills_1[index % fills_1.length],
                        stroke: strokes_1[index % strokes_1.length]
                    }
                });
            });
        }
    };
    PieSeries.prototype.toggleSeriesItem = function (itemId, enabled) {
        this.enabled[itemId] = enabled;
        this.scheduleData();
    };
    PieSeries.className = 'PieSeries';
    return PieSeries;
}(series_1.Series));
exports.PieSeries = PieSeries;
