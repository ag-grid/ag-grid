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
import { Path } from "../../../scene/shape/path";
import ContinuousScale from "../../../scale/continuousScale";
import { Selection } from "../../../scene/selection";
import { Group } from "../../../scene/group";
import palette from "../../palettes";
import { numericExtent } from "../../../util/array";
import { toFixed } from "../../../util/number";
import { PointerEvents } from "../../../scene/node";
import { Marker } from "../../marker/marker";
import { CartesianSeries, CartesianSeriesMarker } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
var LineSeries = /** @class */ (function (_super) {
    __extends(LineSeries, _super);
    function LineSeries() {
        var _this = _super.call(this) || this;
        _this.xDomain = [];
        _this.yDomain = [];
        _this.xData = [];
        _this.yData = [];
        _this.lineNode = new Path();
        // We use groups for this selection even though each group only contains a marker ATM
        // because in the future we might want to add label support as well.
        _this.groupSelection = Selection.select(_this.group).selectAll();
        _this.marker = new CartesianSeriesMarker();
        _this._xKey = '';
        _this._xName = '';
        _this._yKey = '';
        _this._yName = '';
        _this._fill = palette.fills[0];
        _this._stroke = palette.strokes[0];
        _this._strokeWidth = 2;
        _this._fillOpacity = 1;
        _this._strokeOpacity = 1;
        _this.highlightStyle = { fill: 'yellow' };
        var lineNode = _this.lineNode;
        lineNode.fill = undefined;
        lineNode.lineJoin = 'round';
        lineNode.pointerEvents = PointerEvents.None;
        _this.group.append(lineNode);
        var marker = _this.marker;
        marker.addPropertyListener('type', function () { return _this.onMarkerTypeChange(); });
        marker.addPropertyListener('enabled', function (event) {
            if (!event.value) {
                _this.groupSelection = _this.groupSelection.setData([]);
                _this.groupSelection.exit.remove();
            }
        });
        marker.addEventListener('change', function () { return _this.update(); });
        return _this;
    }
    LineSeries.prototype.onMarkerTypeChange = function () {
        this.groupSelection = this.groupSelection.setData([]);
        this.groupSelection.exit.remove();
        this.update();
        this.fireEvent({ type: 'legendChange' });
    };
    Object.defineProperty(LineSeries.prototype, "title", {
        get: function () {
            return this._title;
        },
        set: function (value) {
            if (this._title !== value) {
                this._title = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineSeries.prototype, "xKey", {
        get: function () {
            return this._xKey;
        },
        set: function (value) {
            if (this._xKey !== value) {
                this._xKey = value;
                this.xData = [];
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineSeries.prototype, "xName", {
        get: function () {
            return this._xName;
        },
        set: function (value) {
            if (this._xName !== value) {
                this._xName = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineSeries.prototype, "yKey", {
        get: function () {
            return this._yKey;
        },
        set: function (value) {
            if (this._yKey !== value) {
                this._yKey = value;
                this.yData = [];
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineSeries.prototype, "yName", {
        get: function () {
            return this._yName;
        },
        set: function (value) {
            if (this._yName !== value) {
                this._yName = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    LineSeries.prototype.processData = function () {
        var _a = this, xAxis = _a.xAxis, xKey = _a.xKey, yKey = _a.yKey, xData = _a.xData, yData = _a.yData;
        var data = xKey && yKey ? this.data : [];
        if (!xAxis) {
            return false;
        }
        var isContinuousX = xAxis.scale instanceof ContinuousScale;
        xData.length = 0;
        yData.length = 0;
        for (var i = 0, n = data.length; i < n; i++) {
            var datum = data[i];
            var x = datum[xKey];
            var y = datum[yKey];
            if (x == null || (isContinuousX && isNaN(x)) || y == null || isNaN(y)) {
                continue;
            }
            xData.push(x);
            yData.push(y);
        }
        this.xDomain = isContinuousX ? this.fixNumericExtent(numericExtent(xData), 'x') : xData;
        this.yDomain = this.fixNumericExtent(numericExtent(yData), 'y');
        return true;
    };
    LineSeries.prototype.getDomain = function (direction) {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        }
        else {
            return this.yDomain;
        }
    };
    Object.defineProperty(LineSeries.prototype, "fill", {
        get: function () {
            return this._fill;
        },
        set: function (value) {
            if (this._fill !== value) {
                this._fill = value;
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineSeries.prototype, "stroke", {
        get: function () {
            return this._stroke;
        },
        set: function (value) {
            if (this._stroke !== value) {
                this._stroke = value;
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineSeries.prototype, "strokeWidth", {
        get: function () {
            return this._strokeWidth;
        },
        set: function (value) {
            if (this._strokeWidth !== value) {
                this._strokeWidth = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineSeries.prototype, "fillOpacity", {
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
    Object.defineProperty(LineSeries.prototype, "strokeOpacity", {
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
    LineSeries.prototype.highlightNode = function (node) {
        if (!(node instanceof Marker)) {
            return;
        }
        this.highlightedNode = node;
        this.scheduleLayout();
    };
    LineSeries.prototype.dehighlightNode = function () {
        this.highlightedNode = undefined;
        this.scheduleLayout();
    };
    LineSeries.prototype.update = function () {
        var _a = this, chart = _a.chart, xAxis = _a.xAxis, yAxis = _a.yAxis;
        this.group.visible = this.visible;
        if (!xAxis || !yAxis || !chart || chart.layoutPending || chart.dataPending) {
            return;
        }
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var xOffset = (xScale.bandwidth || 0) / 2;
        var yOffset = (yScale.bandwidth || 0) / 2;
        var _b = this, data = _b.data, xData = _b.xData, yData = _b.yData, marker = _b.marker, lineNode = _b.lineNode;
        var groupSelectionData = [];
        var linePath = lineNode.path;
        linePath.clear();
        xData.forEach(function (xDatum, i) {
            var yDatum = yData[i];
            var x = xScale.convert(xDatum) + xOffset;
            var y = yScale.convert(yDatum) + yOffset;
            if (i > 0) {
                linePath.lineTo(x, y);
            }
            else {
                linePath.moveTo(x, y);
            }
            if (marker) {
                groupSelectionData.push({
                    seriesDatum: data[i],
                    x: x,
                    y: y
                });
            }
        });
        lineNode.stroke = this.stroke;
        lineNode.strokeWidth = this.strokeWidth;
        this.updateGroupSelection(groupSelectionData);
    };
    LineSeries.prototype.updateGroupSelection = function (groupSelectionData) {
        var _a = this, marker = _a.marker, xKey = _a.xKey, yKey = _a.yKey, highlightedNode = _a.highlightedNode, fill = _a.fill, stroke = _a.stroke, strokeWidth = _a.strokeWidth;
        var groupSelection = this.groupSelection;
        var Marker = marker.type;
        var updateGroups = groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();
        var enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Marker);
        var _b = this.highlightStyle, highlightFill = _b.fill, highlightStroke = _b.stroke;
        var markerFormatter = marker.formatter;
        var markerSize = marker.size;
        var markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : strokeWidth;
        groupSelection = updateGroups.merge(enterGroups);
        groupSelection.selectByClass(Marker)
            .each(function (node, datum) {
            var isHighlightedNode = node === highlightedNode;
            var markerFill = isHighlightedNode && highlightFill !== undefined ? highlightFill : marker.fill || fill;
            var markerStroke = isHighlightedNode && highlightStroke !== undefined ? highlightStroke : marker.stroke || stroke;
            var markerFormat = undefined;
            if (markerFormatter) {
                markerFormat = markerFormatter({
                    datum: datum.seriesDatum,
                    xKey: xKey,
                    yKey: yKey,
                    fill: markerFill,
                    stroke: markerStroke,
                    strokeWidth: markerStrokeWidth,
                    size: markerSize,
                    highlighted: isHighlightedNode
                });
            }
            node.fill = markerFormat && markerFormat.fill || markerFill;
            node.stroke = markerFormat && markerFormat.stroke || markerStroke;
            node.strokeWidth = markerFormat && markerFormat.strokeWidth !== undefined
                ? markerFormat.strokeWidth
                : markerStrokeWidth;
            node.size = markerFormat && markerFormat.size !== undefined
                ? markerFormat.size
                : markerSize;
            node.translationX = datum.x;
            node.translationY = datum.y;
            node.visible = marker.enabled && node.size > 0;
        });
        this.groupSelection = groupSelection;
    };
    LineSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, xKey = _a.xKey, yKey = _a.yKey;
        if (!xKey || !yKey) {
            return '';
        }
        var _b = this, xName = _b.xName, yName = _b.yName, color = _b.fill, title = _b.title, tooltipRenderer = _b.tooltipRenderer;
        if (tooltipRenderer) {
            return tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                xKey: xKey,
                xName: xName,
                yKey: yKey,
                yName: yName,
                title: title,
                color: color,
            });
        }
        else {
            var titleStyle = "style=\"color: white; background-color: " + color + "\"";
            var titleString = title ? "<div class=\"title\" " + titleStyle + ">" + title + "</div>" : '';
            var seriesDatum = nodeDatum.seriesDatum;
            var xValue = seriesDatum[xKey];
            var yValue = seriesDatum[yKey];
            var xString = typeof xValue === 'number' ? toFixed(xValue) : String(xValue);
            var yString = typeof yValue === 'number' ? toFixed(yValue) : String(yValue);
            return titleString + "<div class=\"content\">" + xString + ": " + yString + "</div>";
        }
    };
    LineSeries.prototype.listSeriesItems = function (data) {
        var _a = this, id = _a.id, xKey = _a.xKey, yKey = _a.yKey, yName = _a.yName, title = _a.title, visible = _a.visible, marker = _a.marker, fill = _a.fill, stroke = _a.stroke, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity;
        if (this.data.length && xKey && yKey) {
            data.push({
                id: id,
                itemId: undefined,
                enabled: visible,
                label: {
                    text: title || yName || yKey
                },
                marker: {
                    type: marker.type,
                    fill: marker.fill || fill,
                    stroke: marker.stroke || stroke,
                    fillOpacity: fillOpacity,
                    strokeOpacity: strokeOpacity
                }
            });
        }
    };
    LineSeries.className = 'LineSeries';
    return LineSeries;
}(CartesianSeries));
export { LineSeries };
