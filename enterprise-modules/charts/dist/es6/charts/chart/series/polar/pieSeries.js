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
import palette from "../../palettes";
import { Sector } from "../../../scene/shape/sector";
import { Label } from "../../label";
import { PointerEvents } from "../../../scene/node";
import { normalizeAngle180, toRadians } from "../../../util/angle";
import { Color } from "../../../util/color";
import { toFixed } from "../../../util/number";
import { reactive } from "../../../util/observable";
import { PolarSeries } from "./polarSeries";
import { ChartAxisDirection } from "../../chartAxis";
var PieSeriesNodeTag;
(function (PieSeriesNodeTag) {
    PieSeriesNodeTag[PieSeriesNodeTag["Sector"] = 0] = "Sector";
    PieSeriesNodeTag[PieSeriesNodeTag["Callout"] = 1] = "Callout";
    PieSeriesNodeTag[PieSeriesNodeTag["Label"] = 2] = "Label";
})(PieSeriesNodeTag || (PieSeriesNodeTag = {}));
var PieSeriesLabel = /** @class */ (function (_super) {
    __extends(PieSeriesLabel, _super);
    function PieSeriesLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.offset = 3; // from the callout line
        _this.minAngle = 20; // in degrees
        return _this;
    }
    __decorate([
        reactive(['change'])
    ], PieSeriesLabel.prototype, "offset", void 0);
    __decorate([
        reactive(['dataChange'])
    ], PieSeriesLabel.prototype, "minAngle", void 0);
    return PieSeriesLabel;
}(Label));
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
        _this.dataEnabled = [];
        /**
         * Defaults to make the callout colors the same as {@link strokeStyle}.
         */
        _this._calloutColors = palette.strokes;
        _this._calloutStrokeWidth = 1;
        _this._calloutLength = 10;
        _this.label = new PieSeriesLabel();
        _this._labelOffset = 3; // from the callout line
        _this._labelFontSize = 12;
        _this._labelFontFamily = 'Verdana, sans-serif';
        _this._labelColor = 'black';
        /**
         * The key of the numeric field to use to determine the angle (for example,
         * a pie slice angle).
         */
        _this._angleKey = '';
        _this._angleName = '';
        _this._fills = palette.fills;
        _this._strokes = palette.strokes;
        _this._fillOpacity = 1;
        _this._strokeOpacity = 1;
        /**
         * The series rotation in degrees.
         */
        _this._rotation = 0;
        _this._outerRadiusOffset = 0;
        _this._innerRadiusOffset = 0;
        _this._strokeWidth = 1;
        _this.highlightStyle = {
            fill: 'yellow'
        };
        _this.label.addEventListener('change', function () { return _this.scheduleLayout(); });
        _this.label.addEventListener('dataChange', function () { return _this.scheduleData(); });
        _this.addPropertyListener('data', function (event) {
            event.source.dataEnabled = event.value.map(function () { return true; });
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
    Object.defineProperty(PieSeries.prototype, "angleKey", {
        get: function () {
            return this._angleKey;
        },
        set: function (value) {
            if (this._angleKey !== value) {
                this._angleKey = value;
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "angleName", {
        get: function () {
            return this._angleName;
        },
        set: function (value) {
            if (this._angleName !== value) {
                this._angleName = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "radiusKey", {
        get: function () {
            return this._radiusKey;
        },
        set: function (value) {
            if (this._radiusKey !== value) {
                this._radiusKey = value;
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "radiusName", {
        get: function () {
            return this._radiusName;
        },
        set: function (value) {
            if (this._radiusName !== value) {
                this._radiusName = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "labelKey", {
        get: function () {
            return this._labelKey;
        },
        set: function (value) {
            if (this._labelKey !== value) {
                this._labelKey = value;
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "labelName", {
        get: function () {
            return this._labelName;
        },
        set: function (value) {
            if (this._labelName !== value) {
                this._labelName = value;
                this.update();
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
        if (!(node instanceof Sector)) {
            return;
        }
        this.highlightedNode = node;
        this.scheduleLayout();
    };
    PieSeries.prototype.dehighlightNode = function () {
        this.highlightedNode = undefined;
        this.scheduleLayout();
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
        var _a = this, data = _a.data, dataEnabled = _a.dataEnabled;
        var angleData = data.map(function (datum, index) { return dataEnabled[index] && +datum[_this.angleKey] || 0; });
        var angleDataTotal = angleData.reduce(function (a, b) { return a + b; }, 0);
        // The ratios (in [0, 1] interval) used to calculate the end angle value for every pie slice.
        // Each slice starts where the previous one ends, so we only keep the ratios for end angles.
        var angleDataRatios = (function () {
            var sum = 0;
            return angleData.map(function (datum) { return sum += datum / angleDataTotal; });
        })();
        var labelKey = this.label.enabled && this.labelKey;
        var labelData = labelKey ? data.map(function (datum) { return String(datum[labelKey]); }) : [];
        var radiusKey = this.radiusKey;
        var useRadiusKey = !!radiusKey && !this.innerRadiusOffset;
        var radiusData = [];
        if (useRadiusKey) {
            var radii = data.map(function (datum) { return Math.abs(datum[radiusKey]); });
            var maxDatum_1 = Math.max.apply(Math, radii);
            radiusData = radii.map(function (value) { return value / maxDatum_1; });
        }
        var _b = this, angleScale = _b.angleScale, groupSelectionData = _b.groupSelectionData;
        groupSelectionData.length = 0;
        var rotation = toRadians(this.rotation);
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
        var visible = this.group.visible = this.visible && this.dataEnabled.indexOf(true) >= 0;
        if (!visible || !chart || chart.dataPending || chart.layoutPending) {
            return;
        }
        var _a = this, fills = _a.fills, strokes = _a.strokes, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity, calloutColors = _a.calloutColors, outerRadiusOffset = _a.outerRadiusOffset, innerRadiusOffset = _a.innerRadiusOffset, radiusScale = _a.radiusScale, title = _a.title;
        radiusScale.range = [0, this.radius];
        this.group.translationX = this.centerX;
        this.group.translationY = this.centerY;
        if (title) {
            title.node.translationY = -this.radius - outerRadiusOffset - 2;
            title.node.visible = title.enabled;
        }
        var updateGroups = this.groupSelection.setData(this.groupSelectionData);
        updateGroups.exit.remove();
        var enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Sector).each(function (node) { return node.tag = PieSeriesNodeTag.Sector; });
        enterGroups.append(Line).each(function (node) {
            node.tag = PieSeriesNodeTag.Callout;
            node.pointerEvents = PointerEvents.None;
        });
        enterGroups.append(Text).each(function (node) {
            node.tag = PieSeriesNodeTag.Label;
            node.pointerEvents = PointerEvents.None;
        });
        var groupSelection = updateGroups.merge(enterGroups);
        var minOuterRadius = Infinity;
        var outerRadii = [];
        var centerOffsets = [];
        var _b = this, highlightedNode = _b.highlightedNode, _c = _b.highlightStyle, fill = _c.fill, stroke = _c.stroke, centerOffset = _c.centerOffset, shadow = _b.shadow, strokeWidth = _b.strokeWidth;
        groupSelection.selectByTag(PieSeriesNodeTag.Sector).each(function (sector, datum, index) {
            var radius = radiusScale.convert(datum.radius);
            var outerRadius = Math.max(0, radius + outerRadiusOffset);
            if (minOuterRadius > outerRadius) {
                minOuterRadius = outerRadius;
            }
            sector.outerRadius = outerRadius;
            sector.innerRadius = Math.max(0, innerRadiusOffset ? radius + innerRadiusOffset : 0);
            sector.startAngle = datum.startAngle;
            sector.endAngle = datum.endAngle;
            sector.fill = sector === highlightedNode && fill !== undefined ? fill : fills[index % fills.length];
            sector.stroke = sector === highlightedNode && stroke !== undefined ? stroke : strokes[index % strokes.length];
            sector.fillOpacity = fillOpacity;
            sector.strokeOpacity = strokeOpacity;
            sector.centerOffset = sector === highlightedNode && centerOffset !== undefined ? centerOffset : 0;
            sector.fillShadow = shadow;
            sector.strokeWidth = strokeWidth;
            sector.lineJoin = 'round';
            outerRadii.push(outerRadius);
            centerOffsets.push(sector.centerOffset);
        });
        var calloutLength = this.calloutLength;
        groupSelection.selectByTag(PieSeriesNodeTag.Callout).each(function (line, datum, index) {
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
        {
            var _d = this.label, offset_1 = _d.offset, fontStyle_1 = _d.fontStyle, fontWeight_1 = _d.fontWeight, fontSize_1 = _d.fontSize, fontFamily_1 = _d.fontFamily, color_1 = _d.color;
            groupSelection.selectByTag(PieSeriesNodeTag.Label).each(function (text, datum, index) {
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
                    text.fill = color_1;
                    text.textAlign = label.textAlign;
                    text.textBaseline = label.textBaseline;
                }
                else {
                    text.fill = undefined;
                }
            });
        }
        this.groupSelection = groupSelection;
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
            var titleString = title ? "<div class=\"title\" " + titleStyle + ">" + text + "</div>" : '';
            var label = labelKey ? nodeDatum.seriesDatum[labelKey] + ": " : '';
            var value = nodeDatum.seriesDatum[angleKey];
            var formattedValue = typeof value === 'number' ? toFixed(value) : value.toString();
            return titleString + "<div class=\"content\">" + label + formattedValue + "</div>";
        }
    };
    PieSeries.prototype.listSeriesItems = function (data) {
        var _this = this;
        var labelKey = this.labelKey;
        if (this.data.length && labelKey) {
            var _a = this, fills_1 = _a.fills, strokes_1 = _a.strokes, id_1 = _a.id;
            this.data.forEach(function (datum, index) {
                data.push({
                    id: id_1,
                    itemId: index,
                    enabled: _this.dataEnabled[index],
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
        this.dataEnabled[itemId] = enabled;
        this.scheduleData();
    };
    PieSeries.className = 'PieSeries';
    return PieSeries;
}(PolarSeries));
export { PieSeries };
