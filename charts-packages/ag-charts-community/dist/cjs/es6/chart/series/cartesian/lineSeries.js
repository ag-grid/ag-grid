"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("../../../scene/shape/path");
const continuousScale_1 = require("../../../scale/continuousScale");
const selection_1 = require("../../../scene/selection");
const group_1 = require("../../../scene/group");
const series_1 = require("../series");
const array_1 = require("../../../util/array");
const node_1 = require("../../../scene/node");
const text_1 = require("../../../scene/shape/text");
const cartesianSeries_1 = require("./cartesianSeries");
const chartAxis_1 = require("../../chartAxis");
const util_1 = require("../../marker/util");
const observable_1 = require("../../../util/observable");
const chart_1 = require("../../chart");
const string_1 = require("../../../util/string");
const label_1 = require("../../label");
const sanitize_1 = require("../../../util/sanitize");
const value_1 = require("../../../util/value");
class LineSeriesLabel extends label_1.Label {
}
__decorate([
    observable_1.reactive('change')
], LineSeriesLabel.prototype, "formatter", void 0);
class LineSeriesTooltip extends series_1.SeriesTooltip {
}
__decorate([
    observable_1.reactive('change')
], LineSeriesTooltip.prototype, "renderer", void 0);
__decorate([
    observable_1.reactive('change')
], LineSeriesTooltip.prototype, "format", void 0);
exports.LineSeriesTooltip = LineSeriesTooltip;
class LineSeries extends cartesianSeries_1.CartesianSeries {
    constructor() {
        super();
        this.xDomain = [];
        this.yDomain = [];
        this.xData = [];
        this.yData = [];
        this.lineNode = new path_1.Path();
        // We use groups for this selection even though each group only contains a marker ATM
        // because in the future we might want to add label support as well.
        this.nodeSelection = selection_1.Selection.select(this.pickGroup).selectAll();
        this.nodeData = [];
        this.marker = new cartesianSeries_1.CartesianSeriesMarker();
        this.label = new LineSeriesLabel();
        this.stroke = '#874349';
        this.lineDash = [0];
        this.lineDashOffset = 0;
        this.strokeWidth = 2;
        this.strokeOpacity = 1;
        this.tooltip = new LineSeriesTooltip();
        this._xKey = '';
        this.xName = '';
        this._yKey = '';
        this.yName = '';
        const lineNode = this.lineNode;
        lineNode.fill = undefined;
        lineNode.lineJoin = 'round';
        lineNode.pointerEvents = node_1.PointerEvents.None;
        // Make line render before markers in the pick group.
        this.group.insertBefore(lineNode, this.pickGroup);
        this.addEventListener('update', this.scheduleUpdate);
        const { marker, label } = this;
        marker.fill = '#c16068';
        marker.stroke = '#874349';
        marker.addPropertyListener('shape', this.onMarkerShapeChange, this);
        marker.addEventListener('change', this.scheduleUpdate, this);
        label.enabled = false;
        label.addEventListener('change', this.scheduleUpdate, this);
    }
    onMarkerShapeChange() {
        this.nodeSelection = this.nodeSelection.setData([]);
        this.nodeSelection.exit.remove();
        this.fireEvent({ type: 'legendChange' });
    }
    setColors(fills, strokes) {
        this.stroke = fills[0];
        this.marker.stroke = strokes[0];
        this.marker.fill = fills[0];
    }
    set xKey(value) {
        if (this._xKey !== value) {
            this._xKey = value;
            this.xData = [];
            this.scheduleData();
        }
    }
    get xKey() {
        return this._xKey;
    }
    set yKey(value) {
        if (this._yKey !== value) {
            this._yKey = value;
            this.yData = [];
            this.scheduleData();
        }
    }
    get yKey() {
        return this._yKey;
    }
    processData() {
        const { xAxis, yAxis, xKey, yKey, xData, yData } = this;
        const data = xKey && yKey && this.data ? this.data : [];
        if (!xAxis || !yAxis) {
            return false;
        }
        const isContinuousX = xAxis.scale instanceof continuousScale_1.ContinuousScale;
        const isContinuousY = yAxis.scale instanceof continuousScale_1.ContinuousScale;
        xData.length = 0;
        yData.length = 0;
        for (let i = 0, n = data.length; i < n; i++) {
            const datum = data[i];
            const x = datum[xKey];
            const y = datum[yKey];
            const xDatum = this.checkDatum(x, isContinuousX);
            if (isContinuousX && xDatum === undefined) {
                continue;
            }
            else {
                xData.push(xDatum);
            }
            const yDatum = this.checkDatum(y, isContinuousY);
            yData.push(yDatum);
        }
        this.xDomain = isContinuousX ? this.fixNumericExtent(array_1.extent(xData, value_1.isContinuous), 'x', xAxis) : xData;
        this.yDomain = isContinuousY ? this.fixNumericExtent(array_1.extent(yData, value_1.isContinuous), 'y', yAxis) : yData;
        return true;
    }
    getDomain(direction) {
        if (direction === chartAxis_1.ChartAxisDirection.X) {
            return this.xDomain;
        }
        return this.yDomain;
    }
    onHighlightChange() {
        this.updateNodes();
    }
    resetHighlight() {
        this.lineNode.strokeWidth = this.strokeWidth;
    }
    update() {
        this.updatePending = false;
        this.updateSelections();
        this.updateNodes();
    }
    updateSelections() {
        if (!this.nodeDataPending) {
            return;
        }
        this.nodeDataPending = false;
        this.updateLinePath(); // this will create node data too
        this.updateNodeSelection();
    }
    updateLinePath() {
        const { data, xAxis, yAxis } = this;
        if (!data || !xAxis || !yAxis) {
            return;
        }
        const { xData, yData, lineNode, label, xKey, yKey } = this;
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;
        const linePath = lineNode.path;
        const nodeData = [];
        linePath.clear();
        let moveTo = true;
        let prevXInRange = undefined;
        let nextXYDatums = undefined;
        for (let i = 0; i < xData.length; i++) {
            const xyDatums = nextXYDatums || [xData[i], yData[i]];
            if (xyDatums[1] === undefined) {
                prevXInRange = undefined;
                moveTo = true;
            }
            else {
                const [xDatum, yDatum] = xyDatums;
                const x = xScale.convert(xDatum) + xOffset;
                if (isNaN(x)) {
                    prevXInRange = undefined;
                    moveTo = true;
                    continue;
                }
                const tolerance = (xScale.bandwidth || (this.marker.size * 0.5 + (this.marker.strokeWidth || 0))) + 1;
                nextXYDatums = yData[i + 1] === undefined ? undefined : [xData[i + 1], yData[i + 1]];
                const xInRange = xAxis.inRangeEx(x, 0, tolerance);
                const nextXInRange = nextXYDatums && xAxis.inRangeEx(xScale.convert(nextXYDatums[0]) + xOffset, 0, tolerance);
                if (xInRange === -1 && nextXInRange === -1) {
                    moveTo = true;
                    continue;
                }
                if (xInRange === 1 && prevXInRange === 1) {
                    moveTo = true;
                    continue;
                }
                prevXInRange = xInRange;
                const y = yScale.convert(yDatum) + yOffset;
                if (moveTo) {
                    linePath.moveTo(x, y);
                    moveTo = false;
                }
                else {
                    linePath.lineTo(x, y);
                }
                let labelText;
                if (label.formatter) {
                    labelText = label.formatter({ value: yDatum });
                }
                else {
                    labelText = typeof yDatum === 'number' && isFinite(yDatum) ? yDatum.toFixed(2) : yDatum ? String(yDatum) : '';
                }
                const seriesDatum = { [xKey]: xDatum, [yKey]: yDatum };
                nodeData.push({
                    series: this,
                    datum: seriesDatum,
                    point: { x, y },
                    label: labelText ? {
                        text: labelText,
                        fontStyle: label.fontStyle,
                        fontWeight: label.fontWeight,
                        fontSize: label.fontSize,
                        fontFamily: label.fontFamily,
                        textAlign: 'center',
                        textBaseline: 'bottom',
                        fill: label.color
                    } : undefined
                });
            }
        }
        // Used by marker nodes and for hit-testing even when not using markers
        // when `chart.tooltip.tracking` is true.
        this.nodeData = nodeData;
    }
    updateNodeSelection() {
        const { marker } = this;
        const nodeData = marker.shape ? this.nodeData : [];
        const MarkerShape = util_1.getMarker(marker.shape);
        const updateSelection = this.nodeSelection.setData(nodeData);
        updateSelection.exit.remove();
        const enterSelection = updateSelection.enter.append(group_1.Group);
        enterSelection.append(MarkerShape);
        enterSelection.append(text_1.Text);
        this.nodeSelection = updateSelection.merge(enterSelection);
    }
    updateNodes() {
        this.group.visible = this.visible;
        this.updateLineNode();
        this.updateMarkerNodes();
        this.updateTextNodes();
    }
    updateLineNode() {
        const { lineNode } = this;
        lineNode.stroke = this.stroke;
        lineNode.strokeWidth = this.getStrokeWidth(this.strokeWidth);
        lineNode.strokeOpacity = this.strokeOpacity;
        lineNode.lineDash = this.lineDash;
        lineNode.lineDashOffset = this.lineDashOffset;
        lineNode.opacity = this.getOpacity();
    }
    updateMarkerNodes() {
        if (!this.chart) {
            return;
        }
        const { marker, xKey, yKey, stroke: lineStroke, chart: { highlightedDatum }, highlightStyle: { fill: deprecatedFill, stroke: deprecatedStroke, strokeWidth: deprecatedStrokeWidth, item: { fill: highlightedFill = deprecatedFill, stroke: highlightedStroke = deprecatedStroke, strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth, } } } = this;
        const { size, formatter } = marker;
        const markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : this.strokeWidth;
        const MarkerShape = util_1.getMarker(marker.shape);
        this.nodeSelection.selectByClass(MarkerShape)
            .each((node, datum) => {
            const isDatumHighlighted = datum === highlightedDatum;
            const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill;
            const stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : marker.stroke || lineStroke;
            const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                ? highlightedDatumStrokeWidth
                : markerStrokeWidth;
            let format = undefined;
            if (formatter) {
                format = formatter({
                    datum: datum.datum,
                    xKey,
                    yKey,
                    fill,
                    stroke,
                    strokeWidth,
                    size,
                    highlighted: isDatumHighlighted
                });
            }
            node.fill = format && format.fill || fill;
            node.stroke = format && format.stroke || stroke;
            node.strokeWidth = format && format.strokeWidth !== undefined
                ? format.strokeWidth
                : strokeWidth;
            node.size = format && format.size !== undefined
                ? format.size
                : size;
            node.translationX = datum.point.x;
            node.translationY = datum.point.y;
            node.opacity = this.getOpacity(datum);
            node.visible = marker.enabled && node.size > 0;
        });
    }
    updateTextNodes() {
        this.nodeSelection.selectByClass(text_1.Text)
            .each((text, datum) => {
            const { point, label } = datum;
            const { enabled: labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color } = this.label;
            if (label && labelEnabled) {
                text.fontStyle = fontStyle;
                text.fontWeight = fontWeight;
                text.fontSize = fontSize;
                text.fontFamily = fontFamily;
                text.textAlign = label.textAlign;
                text.textBaseline = label.textBaseline;
                text.text = label.text;
                text.x = point.x;
                text.y = point.y - 10;
                text.fill = color;
                text.visible = true;
            }
            else {
                text.visible = false;
            }
        });
    }
    getNodeData() {
        return this.nodeData;
    }
    fireNodeClickEvent(event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event,
            series: this,
            datum: datum.datum,
            xKey: this.xKey,
            yKey: this.yKey
        });
    }
    getTooltipHtml(nodeDatum) {
        const { xKey, yKey, xAxis, yAxis } = this;
        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        const { xName, yName, tooltip, marker } = this;
        const { renderer: tooltipRenderer, format: tooltipFormat } = tooltip;
        const datum = nodeDatum.datum;
        const xValue = datum[xKey];
        const yValue = datum[yKey];
        const xString = xAxis.formatDatum(xValue);
        const yString = yAxis.formatDatum(yValue);
        const title = sanitize_1.sanitizeHtml(this.title || yName);
        const content = sanitize_1.sanitizeHtml(xString + ': ' + yString);
        const { formatter: markerFormatter, fill, stroke, strokeWidth: markerStrokeWidth, size } = marker;
        const strokeWidth = markerStrokeWidth !== undefined ? markerStrokeWidth : this.strokeWidth;
        let format = undefined;
        if (markerFormatter) {
            format = markerFormatter({
                datum,
                xKey,
                yKey,
                fill,
                stroke,
                strokeWidth,
                size,
                highlighted: false
            });
        }
        const color = format && format.fill || fill;
        const defaults = {
            title,
            backgroundColor: color,
            content
        };
        if (tooltipFormat || tooltipRenderer) {
            const params = {
                datum,
                xKey,
                xValue,
                xName,
                yKey,
                yValue,
                yName,
                title,
                color
            };
            if (tooltipFormat) {
                return chart_1.toTooltipHtml({
                    content: string_1.interpolate(tooltipFormat, params)
                }, defaults);
            }
            if (tooltipRenderer) {
                return chart_1.toTooltipHtml(tooltipRenderer(params), defaults);
            }
        }
        return chart_1.toTooltipHtml(defaults);
    }
    listSeriesItems(legendData) {
        const { id, data, xKey, yKey, yName, visible, title, marker, stroke, strokeOpacity } = this;
        if (data && data.length && xKey && yKey) {
            legendData.push({
                id: id,
                itemId: undefined,
                enabled: visible,
                label: {
                    text: title || yName || yKey
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill || 'rgba(0, 0, 0, 0)',
                    stroke: marker.stroke || stroke || 'rgba(0, 0, 0, 0)',
                    fillOpacity: 1,
                    strokeOpacity
                }
            });
        }
    }
}
LineSeries.className = 'LineSeries';
LineSeries.type = 'line';
__decorate([
    observable_1.reactive('layoutChange')
], LineSeries.prototype, "title", void 0);
__decorate([
    observable_1.reactive('update')
], LineSeries.prototype, "stroke", void 0);
__decorate([
    observable_1.reactive('update')
], LineSeries.prototype, "lineDash", void 0);
__decorate([
    observable_1.reactive('update')
], LineSeries.prototype, "lineDashOffset", void 0);
__decorate([
    observable_1.reactive('update')
], LineSeries.prototype, "strokeWidth", void 0);
__decorate([
    observable_1.reactive('update')
], LineSeries.prototype, "strokeOpacity", void 0);
__decorate([
    observable_1.reactive('update')
], LineSeries.prototype, "xName", void 0);
__decorate([
    observable_1.reactive('update')
], LineSeries.prototype, "yName", void 0);
exports.LineSeries = LineSeries;
//# sourceMappingURL=lineSeries.js.map