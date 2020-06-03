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
import { Selection } from "../../../../scene/selection";
import { Group } from "../../../../scene/group";
import { numericExtent } from "../../../../util/array";
import { toFixed } from "../../../../util/number";
import { Candlestick } from "./marker/candlestick";
import { locale } from "../../../../util/time/format/defaultLocale";
import { CartesianSeries } from "../cartesianSeries";
import { reactive, Observable } from "../../../../util/observable";
import { ChartAxisDirection } from "../../../chartAxis";
import { Chart } from "../../../chart";
var OHLCSeries = /** @class */ (function (_super) {
    __extends(OHLCSeries, _super);
    function OHLCSeries() {
        var _this = _super.call(this) || this;
        _this.xDomain = [];
        _this.yDomain = [];
        // Have data separated by key, so that we can process the minimum amount of data
        // when a key changes.
        _this.dateData = [];
        _this.openData = [];
        _this.highData = [];
        _this.lowData = [];
        _this.closeData = [];
        _this.dirtyDateData = true;
        _this.dirtyOpenData = true;
        _this.dirtyHighData = true;
        _this.dirtyLowData = true;
        _this.dirtyCloseData = true;
        _this.groupSelection = Selection.select(_this.group).selectAll();
        _this.marker = new OHLCSeriesMarker();
        _this._dateKey = 'date';
        _this._openKey = 'open';
        _this._highKey = 'high';
        _this._lowKey = 'low';
        _this._closeKey = 'close';
        _this.dateName = 'Date';
        _this.openName = 'Open';
        _this.highName = 'High';
        _this.lowName = 'Low';
        _this.closeName = 'Close';
        _this.labelName = 'Label';
        _this.highlightStyle = {
            fill: 'yellow'
        };
        _this.dateFormatter = locale.format('%d %b, %Y');
        _this.marker.type = Candlestick;
        _this.marker.addEventListener('styleChange', _this.update, _this);
        _this.marker.addPropertyListener('type', _this.onMarkerTypeChange, _this);
        _this.addEventListener('dataChange', _this.onDataChange);
        return _this;
    }
    OHLCSeries.prototype.onDataChange = function () {
        this.dirtyDateData = true;
        this.dirtyOpenData = true;
        this.dirtyHighData = true;
        this.dirtyLowData = true;
        this.dirtyCloseData = true;
    };
    OHLCSeries.prototype.onMarkerTypeChange = function () {
        this.groupSelection = this.groupSelection.setData([]);
        this.groupSelection.exit.remove();
        this.update();
    };
    Object.defineProperty(OHLCSeries.prototype, "dateKey", {
        get: function () {
            return this._dateKey;
        },
        set: function (value) {
            if (this._dateKey !== value) {
                this._dateKey = value;
                this.dateData = [];
                this.dirtyDateData = true;
                this.fireEvent({ type: 'dataChange' });
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OHLCSeries.prototype, "openKey", {
        get: function () {
            return this._openKey;
        },
        set: function (value) {
            if (this._openKey !== value) {
                this._openKey = value;
                this.openData = [];
                this.dirtyOpenData = true;
                this.fireEvent({ type: 'dataChange' });
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OHLCSeries.prototype, "highKey", {
        get: function () {
            return this._highKey;
        },
        set: function (value) {
            if (this._highKey !== value) {
                this._highKey = value;
                this.highData = [];
                this.dirtyHighData = true;
                this.fireEvent({ type: 'dataChange' });
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OHLCSeries.prototype, "lowKey", {
        get: function () {
            return this._lowKey;
        },
        set: function (value) {
            if (this._lowKey !== value) {
                this._lowKey = value;
                this.lowData = [];
                this.dirtyLowData = true;
                this.fireEvent({ type: 'dataChange' });
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OHLCSeries.prototype, "closeKey", {
        get: function () {
            return this._closeKey;
        },
        set: function (value) {
            if (this._closeKey !== value) {
                this._closeKey = value;
                this.closeData = [];
                this.dirtyCloseData = true;
                this.fireEvent({ type: 'dataChange' });
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OHLCSeries.prototype, "labelKey", {
        get: function () {
            return this._labelKey;
        },
        set: function (value) {
            if (this._labelKey !== value) {
                this._labelKey = value;
                this.fireEvent({ type: 'dataChange' });
            }
        },
        enumerable: true,
        configurable: true
    });
    OHLCSeries.prototype.processData = function () {
        var _a = this, dateKey = _a.dateKey, openKey = _a.openKey, highKey = _a.highKey, lowKey = _a.lowKey, closeKey = _a.closeKey, dirtyDateData = _a.dirtyDateData, dirtyOpenData = _a.dirtyOpenData, dirtyHighData = _a.dirtyHighData, dirtyLowData = _a.dirtyLowData, dirtyCloseData = _a.dirtyCloseData;
        // if (!(chart && chart.xAxis && chart.yAxis)) {
        //     return false;
        // }
        var data = dateKey && openKey && highKey && lowKey && closeKey && this.data ? this.data : [];
        if (dirtyDateData) {
            this.xDomain = this.calculateDomain(this.dateData = data.map(function (d) { return d[dateKey]; }));
            this.dirtyDateData = false;
        }
        if (dirtyOpenData) {
            this.openData = data.map(function (d) { return d[openKey]; });
            this.dirtyOpenData = false;
        }
        if (dirtyHighData) {
            this.highData = data.map(function (d) { return d[highKey]; });
            this.dirtyHighData = false;
        }
        if (dirtyLowData) {
            this.lowData = data.map(function (d) { return d[lowKey]; });
            this.dirtyLowData = false;
        }
        if (dirtyCloseData) {
            this.closeData = data.map(function (d) { return d[closeKey]; });
            this.dirtyCloseData = false;
        }
        if (dirtyOpenData || dirtyHighData || dirtyLowData || dirtyCloseData) {
            var yDomains = new Array().concat(this.openData, this.highData, this.lowData, this.closeData);
            this.yDomain = this.calculateDomain(yDomains);
        }
        return true;
    };
    OHLCSeries.prototype.calculateDomain = function (data) {
        var domain = numericExtent(data) || [0, 1];
        var min = domain[0], max = domain[1];
        if (min === max) {
            domain[0] = min - 1;
            domain[1] = max + 1;
        }
        return domain;
    };
    OHLCSeries.prototype.getDomain = function (direction) {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        }
        else {
            return this.yDomain;
        }
    };
    OHLCSeries.prototype.update = function () {
        var _this = this;
        var _a = this, xAxis = _a.xAxis, yAxis = _a.yAxis;
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var xOffset = (xScale.bandwidth || 0) / 2;
        var yOffset = (yScale.bandwidth || 0) / 2;
        var _b = this, data = _b.data, dateData = _b.dateData, openData = _b.openData, highData = _b.highData, lowData = _b.lowData, closeData = _b.closeData, marker = _b.marker, highlightedDatum = _b.highlightedDatum;
        var Marker = marker.type;
        var groupSelectionData = dateData.map(function (dateDatum, i) {
            var open = openData[i];
            var close = closeData[i];
            var yOpen = yScale.convert(open) + yOffset;
            var yClose = yScale.convert(close) + yOffset;
            return {
                series: _this,
                seriesDatum: data[i],
                date: xScale.convert(dateDatum) + xOffset,
                open: yOpen,
                high: yScale.convert(highData[i]) + yOffset,
                low: yScale.convert(lowData[i]) + yOffset,
                close: yClose,
                fill: close > open ? marker.upFill : close < open ? marker.downFill : marker.noChangeFill,
                stroke: close > open ? marker.upStroke : close < open ? marker.downStroke : marker.noChangeStroke,
                strokeWidth: marker.strokeWidth,
                width: 3
            };
        });
        var updateGroups = this.groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();
        var enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Marker);
        var groupSelection = updateGroups.merge(enterGroups);
        var _c = this.highlightStyle, highlightFill = _c.fill, highlightStroke = _c.stroke;
        groupSelection.selectByClass(Marker)
            .each(function (node, datum) {
            var highlighted = highlightedDatum &&
                highlightedDatum.series === datum.series &&
                highlightedDatum.seriesDatum === datum.seriesDatum;
            node.date = datum.date;
            node.open = datum.open;
            node.high = datum.high;
            node.low = datum.low;
            node.close = datum.close;
            node.width = datum.width;
            node.fill = highlighted && highlightFill !== undefined ? highlightFill : datum.fill;
            node.stroke = highlighted && highlightStroke !== undefined ? highlightStroke : datum.stroke;
            node.fillOpacity = marker.fillOpacity;
            node.strokeOpacity = marker.strokeOpacity;
            node.strokeWidth = datum.strokeWidth;
            node.visible = datum.width > 0;
        });
        this.groupSelection = groupSelection;
    };
    OHLCSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, dateKey = _a.dateKey, openKey = _a.openKey, highKey = _a.highKey, lowKey = _a.lowKey, closeKey = _a.closeKey;
        if (!(dateKey && openKey && highKey && lowKey && closeKey)) {
            return '';
        }
        var _b = this, title = _b.title, tooltipRenderer = _b.tooltipRenderer, dateName = _b.dateName, openName = _b.openName, highName = _b.highName, lowName = _b.lowName, closeName = _b.closeName, labelKey = _b.labelKey, labelName = _b.labelName;
        var color = nodeDatum.fill || 'gray';
        if (tooltipRenderer) {
            return tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                dateKey: dateKey,
                openKey: openKey,
                highKey: highKey,
                lowKey: lowKey,
                closeKey: closeKey,
                dateName: dateName,
                openName: openName,
                highName: highName,
                lowName: lowName,
                closeName: closeName,
                title: title,
                color: color
            });
        }
        else {
            var titleStyle = "style=\"color: white; background-color: " + color + "\"";
            var titleHtml = title ? "<div class=\"" + Chart.defaultTooltipClass + "-title\" " + titleStyle + ">" + title + "</div>" : '';
            var seriesDatum = nodeDatum.seriesDatum;
            var dateValue = seriesDatum[dateKey];
            var openValue = seriesDatum[openKey];
            var highValue = seriesDatum[highKey];
            var lowValue = seriesDatum[lowKey];
            var closeValue = seriesDatum[closeKey];
            var contentHtml = "<b>" + dateName + "</b>: " + this.dateFormatter(dateValue)
                + ("<br><b>" + openName + "</b>: " + toFixed(openValue))
                + ("<br><b>" + highName + "</b>: " + toFixed(highValue))
                + ("<br><b>" + lowName + "</b>: " + toFixed(lowValue))
                + ("<br><b>" + closeName + "</b>: " + toFixed(closeValue));
            if (labelKey) {
                contentHtml = "<b>" + labelName + "</b>: " + seriesDatum[labelKey] + "<br>" + contentHtml;
            }
            return titleHtml + "<div class=\"" + Chart.defaultTooltipClass + "-content\">" + contentHtml + "</div>";
        }
    };
    OHLCSeries.prototype.listSeriesItems = function (legendData) {
        var _a = this, data = _a.data, id = _a.id, dateKey = _a.dateKey, closeKey = _a.closeKey, title = _a.title, visible = _a.visible;
        if (data && data.length && dateKey && closeKey) {
            legendData.push({
                id: id,
                itemId: undefined,
                enabled: visible,
                label: {
                    text: title || closeKey
                },
                marker: {
                    fill: 'gray',
                    stroke: 'black',
                    fillOpacity: 1,
                    strokeOpacity: 1
                }
            });
        }
    };
    OHLCSeries.className = 'OHLCSeries';
    __decorate([
        reactive('layoutChange')
    ], OHLCSeries.prototype, "title", void 0);
    return OHLCSeries;
}(CartesianSeries));
export { OHLCSeries };
var OHLCSeriesMarker = /** @class */ (function (_super) {
    __extends(OHLCSeriesMarker, _super);
    function OHLCSeriesMarker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Marker constructor function. A series will create one marker instance per data point.
         */
        _this.type = Candlestick;
        _this.upFill = '#33ae5b';
        _this.downFill = '#ff4734';
        _this.noChangeFill = '#b9bdc5';
        _this.upStroke = 'black';
        _this.downStroke = 'black';
        _this.noChangeStroke = 'black';
        _this.strokeWidth = 1;
        _this.fillOpacity = 1;
        _this.strokeOpacity = 1;
        return _this;
    }
    __decorate([
        reactive()
    ], OHLCSeriesMarker.prototype, "type", void 0);
    __decorate([
        reactive('styleChange')
    ], OHLCSeriesMarker.prototype, "upFill", void 0);
    __decorate([
        reactive('styleChange')
    ], OHLCSeriesMarker.prototype, "downFill", void 0);
    __decorate([
        reactive('styleChange')
    ], OHLCSeriesMarker.prototype, "noChangeFill", void 0);
    __decorate([
        reactive('styleChange')
    ], OHLCSeriesMarker.prototype, "upStroke", void 0);
    __decorate([
        reactive('styleChange')
    ], OHLCSeriesMarker.prototype, "downStroke", void 0);
    __decorate([
        reactive('styleChange')
    ], OHLCSeriesMarker.prototype, "noChangeStroke", void 0);
    __decorate([
        reactive('styleChange')
    ], OHLCSeriesMarker.prototype, "strokeWidth", void 0);
    __decorate([
        reactive('styleChange')
    ], OHLCSeriesMarker.prototype, "fillOpacity", void 0);
    __decorate([
        reactive('styleChange')
    ], OHLCSeriesMarker.prototype, "strokeOpacity", void 0);
    return OHLCSeriesMarker;
}(Observable));
export { OHLCSeriesMarker };
