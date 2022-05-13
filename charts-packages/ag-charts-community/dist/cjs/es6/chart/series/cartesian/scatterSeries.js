"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const selection_1 = require("../../../scene/selection");
const series_1 = require("../series");
const array_1 = require("../../../util/array");
const linearScale_1 = require("../../../scale/linearScale");
const observable_1 = require("../../../util/observable");
const cartesianSeries_1 = require("./cartesianSeries");
const chartAxis_1 = require("../../chartAxis");
const util_1 = require("../../marker/util");
const chart_1 = require("../../chart");
const continuousScale_1 = require("../../../scale/continuousScale");
const sanitize_1 = require("../../../util/sanitize");
const label_1 = require("../../label");
const text_1 = require("../../../scene/shape/text");
const hdpiCanvas_1 = require("../../../canvas/hdpiCanvas");
const value_1 = require("../../../util/value");
class ScatterSeriesTooltip extends series_1.SeriesTooltip {
}
__decorate([
    observable_1.reactive('change')
], ScatterSeriesTooltip.prototype, "renderer", void 0);
exports.ScatterSeriesTooltip = ScatterSeriesTooltip;
class ScatterSeries extends cartesianSeries_1.CartesianSeries {
    constructor() {
        super();
        this.xDomain = [];
        this.yDomain = [];
        this.xData = [];
        this.yData = [];
        this.validData = [];
        this.sizeData = [];
        this.sizeScale = new linearScale_1.LinearScale();
        this.nodeData = [];
        this.markerSelection = selection_1.Selection.select(this.pickGroup).selectAll();
        this.labelData = [];
        this.labelSelection = selection_1.Selection.select(this.group).selectAll();
        this.marker = new cartesianSeries_1.CartesianSeriesMarker();
        this.label = new label_1.Label();
        this._fill = '#c16068';
        this._stroke = '#874349';
        this._strokeWidth = 2;
        this._fillOpacity = 1;
        this._strokeOpacity = 1;
        this.xKey = '';
        this.yKey = '';
        this.xName = '';
        this.yName = '';
        this.sizeName = 'Size';
        this.labelName = 'Label';
        this.tooltip = new ScatterSeriesTooltip();
        const { marker, label } = this;
        marker.addPropertyListener('shape', this.onMarkerShapeChange, this);
        marker.addEventListener('change', this.scheduleUpdate, this);
        this.addPropertyListener('xKey', () => this.xData = []);
        this.addPropertyListener('yKey', () => this.yData = []);
        this.addPropertyListener('sizeKey', () => this.sizeData = []);
        label.enabled = false;
        label.addEventListener('change', this.scheduleUpdate, this);
        label.addEventListener('dataChange', this.scheduleData, this);
    }
    /**
     * @deprecated Use {@link marker.fill} instead.
     */
    set fill(value) {
        if (this._fill !== value) {
            this._fill = value;
            this.scheduleUpdate();
        }
    }
    get fill() {
        return this._fill;
    }
    /**
     * @deprecated Use {@link marker.stroke} instead.
     */
    set stroke(value) {
        if (this._stroke !== value) {
            this._stroke = value;
            this.scheduleUpdate();
        }
    }
    get stroke() {
        return this._stroke;
    }
    /**
     * @deprecated Use {@link marker.strokeWidth} instead.
     */
    set strokeWidth(value) {
        if (this._strokeWidth !== value) {
            this._strokeWidth = value;
            this.scheduleUpdate();
        }
    }
    get strokeWidth() {
        return this._strokeWidth;
    }
    /**
     * @deprecated Use {@link marker.fillOpacity} instead.
     */
    set fillOpacity(value) {
        if (this._fillOpacity !== value) {
            this._fillOpacity = value;
            this.scheduleUpdate();
        }
    }
    get fillOpacity() {
        return this._fillOpacity;
    }
    /**
     * @deprecated Use {@link marker.strokeOpacity} instead.
     */
    set strokeOpacity(value) {
        if (this._strokeOpacity !== value) {
            this._strokeOpacity = value;
            this.scheduleUpdate();
        }
    }
    get strokeOpacity() {
        return this._strokeOpacity;
    }
    onHighlightChange() {
        this.updateMarkerNodes();
    }
    onMarkerShapeChange() {
        this.markerSelection = this.markerSelection.setData([]);
        this.markerSelection.exit.remove();
        this.fireEvent({ type: 'legendChange' });
    }
    setColors(fills, strokes) {
        this.fill = fills[0];
        this.stroke = strokes[0];
        this.marker.fill = fills[0];
        this.marker.stroke = strokes[0];
    }
    processData() {
        const { xKey, yKey, sizeKey, labelKey, xAxis, yAxis, marker, label } = this;
        if (!xAxis || !yAxis) {
            return false;
        }
        const data = xKey && yKey && this.data ? this.data : [];
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const isContinuousX = xScale instanceof continuousScale_1.ContinuousScale;
        const isContinuousY = yScale instanceof continuousScale_1.ContinuousScale;
        this.validData = data.filter(d => this.checkDatum(d[xKey], isContinuousX) !== undefined && this.checkDatum(d[yKey], isContinuousY) !== undefined);
        this.xData = this.validData.map((d) => d[xKey]);
        this.yData = this.validData.map((d) => d[yKey]);
        this.sizeData = sizeKey ? this.validData.map((d) => d[sizeKey]) : [];
        const font = label.getFont();
        this.labelData = labelKey ? this.validData.map((d) => {
            const text = String(d[labelKey]);
            const size = hdpiCanvas_1.HdpiCanvas.getTextSize(text, font);
            return Object.assign({ text }, size);
        }) : [];
        this.sizeScale.domain = marker.domain ? marker.domain : array_1.extent(this.sizeData, value_1.isContinuous) || [1, 1];
        if (xAxis.scale instanceof continuousScale_1.ContinuousScale) {
            this.xDomain = this.fixNumericExtent(array_1.extent(this.xData, value_1.isContinuous), 'x', xAxis);
        }
        else {
            this.xDomain = this.xData;
        }
        if (yAxis.scale instanceof continuousScale_1.ContinuousScale) {
            this.yDomain = this.fixNumericExtent(array_1.extent(this.yData, value_1.isContinuous), 'y', yAxis);
        }
        else {
            this.yDomain = this.yData;
        }
        return true;
    }
    getDomain(direction) {
        if (direction === chartAxis_1.ChartAxisDirection.X) {
            return this.xDomain;
        }
        else {
            return this.yDomain;
        }
    }
    getNodeData() {
        return this.nodeData;
    }
    getLabelData() {
        return this.nodeData;
    }
    fireNodeClickEvent(event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event,
            series: this,
            datum: datum.datum,
            xKey: this.xKey,
            yKey: this.yKey,
            sizeKey: this.sizeKey
        });
    }
    createNodeData() {
        const { chart, data, visible, xAxis, yAxis } = this;
        if (!(chart && data && visible && xAxis && yAxis) || chart.layoutPending || chart.dataPending) {
            return [];
        }
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const isContinuousX = xScale instanceof continuousScale_1.ContinuousScale;
        const isContinuousY = yScale instanceof continuousScale_1.ContinuousScale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;
        const { xData, yData, validData, sizeData, sizeScale, marker } = this;
        const nodeData = [];
        sizeScale.range = [marker.size, marker.maxSize];
        for (let i = 0; i < xData.length; i++) {
            const xy = this.checkDomainXY(xData[i], yData[i], isContinuousX, isContinuousY);
            if (!xy) {
                continue;
            }
            const x = xScale.convert(xy[0]) + xOffset;
            const y = yScale.convert(xy[1]) + yOffset;
            if (!this.checkRangeXY(x, y, xAxis, yAxis)) {
                continue;
            }
            nodeData.push({
                series: this,
                datum: validData[i],
                point: { x, y },
                size: sizeData.length ? sizeScale.convert(sizeData[i]) : marker.size,
                label: this.labelData[i]
            });
        }
        return this.nodeData = nodeData;
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
        this.createNodeData();
        this.updateMarkerSelection();
        this.updateLabelSelection();
    }
    updateNodes() {
        this.group.visible = this.visible;
        this.updateMarkerNodes();
        this.updateLabelNodes();
    }
    updateLabelSelection() {
        const placedLabels = this.chart && this.chart.placeLabels().get(this) || [];
        const updateLabels = this.labelSelection.setData(placedLabels);
        updateLabels.exit.remove();
        const enterLabels = updateLabels.enter.append(text_1.Text);
        this.labelSelection = updateLabels.merge(enterLabels);
    }
    updateMarkerSelection() {
        const MarkerShape = util_1.getMarker(this.marker.shape);
        const updateMarkers = this.markerSelection.setData(this.nodeData);
        updateMarkers.exit.remove();
        const enterMarkers = updateMarkers.enter.append(MarkerShape);
        this.markerSelection = updateMarkers.merge(enterMarkers);
    }
    updateLabelNodes() {
        const { label } = this;
        this.labelSelection.each((text, datum) => {
            text.text = datum.text;
            text.fill = label.color;
            text.x = datum.x;
            text.y = datum.y;
            text.fontStyle = label.fontStyle;
            text.fontWeight = label.fontWeight;
            text.fontSize = label.fontSize;
            text.fontFamily = label.fontFamily;
            text.textAlign = 'left';
            text.textBaseline = 'top';
        });
    }
    updateMarkerNodes() {
        if (!this.chart) {
            return;
        }
        const { marker, xKey, yKey, strokeWidth, fillOpacity, strokeOpacity, fill: seriesFill, stroke: seriesStroke, chart: { highlightedDatum }, sizeScale, sizeData, highlightStyle: { fill: deprecatedFill, stroke: deprecatedStroke, strokeWidth: deprecatedStrokeWidth, item: { fill: highlightedFill = deprecatedFill, stroke: highlightedStroke = deprecatedStroke, strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth, } } } = this;
        const markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : strokeWidth;
        const { formatter } = marker;
        sizeScale.range = [marker.size, marker.maxSize];
        this.markerSelection.each((node, datum, index) => {
            const isDatumHighlighted = datum === highlightedDatum;
            const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill || seriesFill;
            const stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : marker.stroke || seriesStroke;
            const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                ? highlightedDatumStrokeWidth
                : this.getStrokeWidth(markerStrokeWidth, datum);
            const size = sizeData.length ? sizeScale.convert(sizeData[index]) : marker.size;
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
            node.fillOpacity = marker.fillOpacity !== undefined ? marker.fillOpacity : fillOpacity;
            node.strokeOpacity = marker.strokeOpacity !== undefined ? marker.strokeOpacity : strokeOpacity;
            node.translationX = datum.point.x;
            node.translationY = datum.point.y;
            node.opacity = this.getOpacity(datum);
            node.zIndex = isDatumHighlighted ? series_1.Series.highlightedZIndex : index;
            node.visible = marker.enabled && node.size > 0;
        });
    }
    getTooltipHtml(nodeDatum) {
        const { xKey, yKey, xAxis, yAxis } = this;
        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        const { fill: seriesFill, stroke: seriesStroke, marker, tooltip, xName, yName, sizeKey, sizeName, labelKey, labelName } = this;
        const fill = marker.fill || seriesFill;
        const stroke = marker.stroke || seriesStroke;
        const strokeWidth = this.getStrokeWidth(marker.strokeWidth || this.strokeWidth, nodeDatum);
        const { formatter } = this.marker;
        let format = undefined;
        if (formatter) {
            format = formatter({
                datum: nodeDatum,
                xKey,
                yKey,
                fill,
                stroke,
                strokeWidth,
                size: nodeDatum.size,
                highlighted: false
            });
        }
        const color = format && format.fill || fill || 'gray';
        const title = this.title || yName;
        const datum = nodeDatum.datum;
        const xValue = datum[xKey];
        const yValue = datum[yKey];
        const xString = sanitize_1.sanitizeHtml(xAxis.formatDatum(xValue));
        const yString = sanitize_1.sanitizeHtml(yAxis.formatDatum(yValue));
        let content = `<b>${sanitize_1.sanitizeHtml(xName || xKey)}</b>: ${xString}<br>` +
            `<b>${sanitize_1.sanitizeHtml(yName || yKey)}</b>: ${yString}`;
        if (sizeKey) {
            content += `<br><b>${sanitize_1.sanitizeHtml(sizeName || sizeKey)}</b>: ${sanitize_1.sanitizeHtml(datum[sizeKey])}`;
        }
        if (labelKey) {
            content = `<b>${sanitize_1.sanitizeHtml(labelName || labelKey)}</b>: ${sanitize_1.sanitizeHtml(datum[labelKey])}<br>` + content;
        }
        const defaults = {
            title,
            backgroundColor: color,
            content
        };
        const { renderer: tooltipRenderer } = tooltip;
        if (tooltipRenderer) {
            return chart_1.toTooltipHtml(tooltipRenderer({
                datum,
                xKey,
                xValue,
                xName,
                yKey,
                yValue,
                yName,
                sizeKey,
                sizeName,
                labelKey,
                labelName,
                title,
                color
            }), defaults);
        }
        return chart_1.toTooltipHtml(defaults);
    }
    listSeriesItems(legendData) {
        const { id, data, xKey, yKey, yName, title, visible, marker, fill, stroke, fillOpacity, strokeOpacity } = this;
        if (data && data.length && xKey && yKey) {
            legendData.push({
                id,
                itemId: undefined,
                enabled: visible,
                label: {
                    text: title || yName || yKey
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill || fill || 'rgba(0, 0, 0, 0)',
                    stroke: marker.stroke || stroke || 'rgba(0, 0, 0, 0)',
                    fillOpacity: marker.fillOpacity !== undefined ? marker.fillOpacity : fillOpacity,
                    strokeOpacity: marker.strokeOpacity !== undefined ? marker.strokeOpacity : strokeOpacity
                }
            });
        }
    }
}
ScatterSeries.className = 'ScatterSeries';
ScatterSeries.type = 'scatter';
__decorate([
    observable_1.reactive('layoutChange')
], ScatterSeries.prototype, "title", void 0);
__decorate([
    observable_1.reactive('dataChange')
], ScatterSeries.prototype, "xKey", void 0);
__decorate([
    observable_1.reactive('dataChange')
], ScatterSeries.prototype, "yKey", void 0);
__decorate([
    observable_1.reactive('dataChange')
], ScatterSeries.prototype, "sizeKey", void 0);
__decorate([
    observable_1.reactive('dataChange')
], ScatterSeries.prototype, "labelKey", void 0);
exports.ScatterSeries = ScatterSeries;
//# sourceMappingURL=scatterSeries.js.map