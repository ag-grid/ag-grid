"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const group_1 = require("../../../scene/group");
const selection_1 = require("../../../scene/selection");
const series_1 = require("../series");
const node_1 = require("../../../scene/node");
const path_1 = require("../../../scene/shape/path");
const cartesianSeries_1 = require("./cartesianSeries");
const chartAxis_1 = require("../../chartAxis");
const util_1 = require("../../marker/util");
const chart_1 = require("../../chart");
const array_1 = require("../../../util/array");
const equal_1 = require("../../../util/equal");
const observable_1 = require("../../../util/observable");
const string_1 = require("../../../util/string");
const text_1 = require("../../../scene/shape/text");
const label_1 = require("../../label");
const sanitize_1 = require("../../../util/sanitize");
const value_1 = require("../../../util/value");
const continuousScale_1 = require("../../../scale/continuousScale");
class AreaSeriesLabel extends label_1.Label {
}
__decorate([
    observable_1.reactive('change')
], AreaSeriesLabel.prototype, "formatter", void 0);
class AreaSeriesTooltip extends series_1.SeriesTooltip {
}
__decorate([
    observable_1.reactive('change')
], AreaSeriesTooltip.prototype, "renderer", void 0);
__decorate([
    observable_1.reactive('change')
], AreaSeriesTooltip.prototype, "format", void 0);
exports.AreaSeriesTooltip = AreaSeriesTooltip;
class AreaSeries extends cartesianSeries_1.CartesianSeries {
    constructor() {
        super();
        this.tooltip = new AreaSeriesTooltip();
        this.areaGroup = this.group.insertBefore(new group_1.Group, this.pickGroup);
        this.strokeGroup = this.group.insertBefore(new group_1.Group, this.pickGroup);
        this.markerGroup = this.pickGroup.appendChild(new group_1.Group);
        this.labelGroup = this.group.appendChild(new group_1.Group);
        this.fillSelection = selection_1.Selection.select(this.areaGroup).selectAll();
        this.strokeSelection = selection_1.Selection.select(this.strokeGroup).selectAll();
        this.markerSelection = selection_1.Selection.select(this.markerGroup).selectAll();
        this.labelSelection = selection_1.Selection.select(this.labelGroup).selectAll();
        /**
         * The assumption is that the values will be reset (to `true`)
         * in the {@link yKeys} setter.
         */
        this.seriesItemEnabled = new Map();
        this.xData = [];
        this.yData = [];
        this.areaSelectionData = [];
        this.markerSelectionData = [];
        this.labelSelectionData = [];
        this.yDomain = [];
        this.directionKeys = {
            x: ['xKey'],
            y: ['yKeys']
        };
        this.marker = new cartesianSeries_1.CartesianSeriesMarker();
        this.label = new AreaSeriesLabel();
        this.fills = [
            '#c16068',
            '#a2bf8a',
            '#ebcc87',
            '#80a0c3',
            '#b58dae',
            '#85c0d1'
        ];
        this.strokes = [
            '#874349',
            '#718661',
            '#a48f5f',
            '#5a7088',
            '#7f637a',
            '#5d8692'
        ];
        this.fillOpacity = 1;
        this.strokeOpacity = 1;
        this.lineDash = [0];
        this.lineDashOffset = 0;
        this._xKey = '';
        this.xName = '';
        this._yKeys = [];
        this.yNames = [];
        this.strokeWidth = 2;
        this.addEventListener('update', this.scheduleUpdate);
        const { marker, label } = this;
        marker.enabled = false;
        marker.addPropertyListener('shape', this.onMarkerShapeChange, this);
        marker.addEventListener('change', this.scheduleUpdate, this);
        label.enabled = false;
        label.addEventListener('change', this.scheduleUpdate, this);
    }
    onMarkerShapeChange() {
        this.markerSelection = this.markerSelection.setData([]);
        this.markerSelection.exit.remove();
        this.fireEvent({ type: 'legendChange' });
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
    set yKeys(values) {
        if (!equal_1.equal(this._yKeys, values)) {
            this._yKeys = values;
            this.yData = [];
            const { seriesItemEnabled } = this;
            seriesItemEnabled.clear();
            values.forEach(key => seriesItemEnabled.set(key, true));
            this.scheduleData();
        }
    }
    get yKeys() {
        return this._yKeys;
    }
    setColors(fills, strokes) {
        this.fills = fills;
        this.strokes = strokes;
    }
    set normalizedTo(value) {
        const absValue = value ? Math.abs(value) : undefined;
        if (this._normalizedTo !== absValue) {
            this._normalizedTo = absValue;
            this.scheduleData();
        }
    }
    get normalizedTo() {
        return this._normalizedTo;
    }
    processData() {
        const { xKey, yKeys, seriesItemEnabled } = this;
        const data = xKey && yKeys.length && this.data ? this.data : [];
        // If the data is an array of rows like so:
        //
        // [{
        //   xKy: 'Jan',
        //   yKey1: 5,
        //   yKey2: 7,
        //   yKey3: -9,
        // }, {
        //   xKey: 'Feb',
        //   yKey1: 10,
        //   yKey2: -15,
        //   yKey3: 20
        // }]
        //
        let keysFound = true; // only warn once
        this.xData = data.map(datum => {
            if (keysFound && !(xKey in datum)) {
                keysFound = false;
                console.warn(`The key '${xKey}' was not found in the data: `, datum);
            }
            return datum[xKey];
        });
        this.yData = data.map(datum => yKeys.map(yKey => {
            if (keysFound && !(yKey in datum)) {
                keysFound = false;
                console.warn(`The key '${yKey}' was not found in the data: `, datum);
            }
            const value = datum[yKey];
            return isFinite(value) && seriesItemEnabled.get(yKey) ? value : 0;
        }));
        // xData: ['Jan', 'Feb']
        //
        // yData: [
        //   [5, 7, -9],
        //   [10, -15, 20]
        // ]
        const { yData, normalizedTo } = this;
        const yMinMax = yData.map(values => array_1.findMinMax(values)); // used for normalization
        const yLargestMinMax = this.findLargestMinMax(yMinMax);
        // Calculate the sum of the absolute values of all items in each stack. Used for normalization of stacked areas.
        const yAbsTotal = this.yData.map(values => values.reduce((acc, stack) => {
            acc += Math.abs(stack);
            return acc;
        }, 0));
        let yMin;
        let yMax;
        if (normalizedTo && isFinite(normalizedTo)) {
            yMin = yLargestMinMax.min < 0 ? -normalizedTo : 0;
            yMax = yLargestMinMax.max > 0 ? normalizedTo : 0;
            yData.forEach((stack, i) => stack.forEach((y, j) => stack[j] = y / yAbsTotal[i] * normalizedTo));
        }
        else {
            yMin = yLargestMinMax.min;
            yMax = yLargestMinMax.max;
        }
        if (yMin === 0 && yMax === 0) {
            yMax = 1;
        }
        this.yDomain = this.fixNumericExtent([yMin, yMax], 'y');
        this.fireEvent({ type: 'dataProcessed' });
        return true;
    }
    findLargestMinMax(totals) {
        let min = 0;
        let max = 0;
        for (const total of totals) {
            if (total.min < min) {
                min = total.min;
            }
            if (total.max > max) {
                max = total.max;
            }
        }
        return { min, max };
    }
    getDomain(direction) {
        if (direction === chartAxis_1.ChartAxisDirection.X) {
            return this.xData;
        }
        else {
            return this.yDomain;
        }
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
        this.createSelectionData();
        this.updateFillSelection();
        this.updateStrokeSelection();
        this.updateMarkerSelection();
        this.updateLabelSelection();
    }
    updateNodes() {
        this.group.visible = this.visible && this.xData.length > 0 && this.yData.length > 0;
        this.updateFillNodes();
        this.updateStrokeNodes();
        this.updateMarkerNodes();
        this.updateLabelNodes();
    }
    createSelectionData() {
        const { data, xAxis, yAxis, xData, yData, areaSelectionData, markerSelectionData, labelSelectionData } = this;
        if (!data || !xAxis || !yAxis || !xData.length || !yData.length) {
            return;
        }
        const { yKeys, marker, label, fills, strokes } = this;
        const { scale: xScale } = xAxis;
        const { scale: yScale } = yAxis;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;
        const last = xData.length * 2 - 1;
        areaSelectionData.length = 0;
        markerSelectionData.length = 0;
        labelSelectionData.length = 0;
        xData.forEach((xDatum, i) => {
            const yDatum = yData[i];
            const seriesDatum = data[i];
            const x = xScale.convert(xDatum) + xOffset;
            let prevMin = 0;
            let prevMax = 0;
            yDatum.forEach((curr, j) => {
                const prev = curr < 0 ? prevMin : prevMax;
                const continuousY = yScale instanceof continuousScale_1.ContinuousScale;
                const y = yScale.convert(prev + curr, continuousY ? continuousScale_1.clamper : undefined);
                const yKey = yKeys[j];
                const yValue = seriesDatum[yKey];
                if (marker) {
                    markerSelectionData.push({
                        index: i,
                        series: this,
                        itemId: yKey,
                        datum: seriesDatum,
                        yValue,
                        yKey,
                        point: { x, y },
                        fill: fills[j % fills.length],
                        stroke: strokes[j % strokes.length]
                    });
                }
                let labelText;
                if (label.formatter) {
                    labelText = label.formatter({ value: yValue });
                }
                else {
                    labelText = value_1.isNumber(yValue) ? yValue.toFixed(2) : String(yValue);
                }
                if (label) {
                    labelSelectionData.push({
                        index: i,
                        itemId: yKey,
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
                const areaDatum = areaSelectionData[j] || (areaSelectionData[j] = { itemId: yKey, points: [] });
                const areaPoints = areaDatum.points;
                areaPoints[i] = { x, y };
                areaPoints[last - i] = { x, y: yScale.convert(prev) + yOffset }; // bottom y
                if (curr < 0) {
                    prevMin += curr;
                }
                else {
                    prevMax += curr;
                }
            });
        });
    }
    updateFillSelection() {
        const updateFills = this.fillSelection.setData(this.areaSelectionData);
        updateFills.exit.remove();
        const enterFills = updateFills.enter.append(path_1.Path)
            .each(path => {
            path.lineJoin = 'round';
            path.stroke = undefined;
            path.pointerEvents = node_1.PointerEvents.None;
        });
        this.fillSelection = updateFills.merge(enterFills);
    }
    updateFillNodes() {
        const { fills, fillOpacity, strokes, strokeOpacity, strokeWidth, shadow, seriesItemEnabled } = this;
        this.fillSelection.each((shape, datum, index) => {
            const path = shape.path;
            shape.fill = fills[index % fills.length];
            shape.fillOpacity = fillOpacity;
            shape.stroke = strokes[index % strokes.length];
            shape.strokeOpacity = strokeOpacity;
            shape.strokeWidth = strokeWidth;
            shape.lineDash = this.lineDash;
            shape.lineDashOffset = this.lineDashOffset;
            shape.fillShadow = shadow;
            shape.visible = !!seriesItemEnabled.get(datum.itemId);
            shape.opacity = this.getOpacity(datum);
            path.clear();
            const { points } = datum;
            points.forEach(({ x, y }, i) => {
                if (i > 0) {
                    path.lineTo(x, y);
                }
                else {
                    path.moveTo(x, y);
                }
            });
            path.closePath();
        });
    }
    updateStrokeSelection() {
        const updateStrokes = this.strokeSelection.setData(this.areaSelectionData);
        updateStrokes.exit.remove();
        const enterStrokes = updateStrokes.enter.append(path_1.Path)
            .each(path => {
            path.fill = undefined;
            path.lineJoin = path.lineCap = 'round';
            path.pointerEvents = node_1.PointerEvents.None;
        });
        this.strokeSelection = updateStrokes.merge(enterStrokes);
    }
    updateStrokeNodes() {
        if (!this.data) {
            return;
        }
        const { data, strokes, strokeOpacity, seriesItemEnabled } = this;
        this.strokeSelection.each((shape, datum, index) => {
            const path = shape.path;
            shape.visible = !!seriesItemEnabled.get(datum.itemId);
            shape.opacity = this.getOpacity(datum);
            shape.stroke = strokes[index % strokes.length];
            shape.strokeWidth = this.getStrokeWidth(this.strokeWidth, datum);
            shape.strokeOpacity = strokeOpacity;
            shape.lineDash = this.lineDash;
            shape.lineDashOffset = this.lineDashOffset;
            path.clear();
            const { points } = datum;
            // The stroke doesn't go all the way around the fill, only on top,
            // that's why we iterate until `data.length` (rather than `points.length`) and stop.
            for (let i = 0; i < data.length; i++) {
                const { x, y } = points[i];
                if (i > 0) {
                    path.lineTo(x, y);
                }
                else {
                    path.moveTo(x, y);
                }
            }
        });
    }
    updateMarkerSelection() {
        const MarkerShape = util_1.getMarker(this.marker.shape);
        const data = MarkerShape ? this.markerSelectionData : [];
        const updateMarkers = this.markerSelection.setData(data);
        updateMarkers.exit.remove();
        const enterMarkers = updateMarkers.enter.append(MarkerShape);
        this.markerSelection = updateMarkers.merge(enterMarkers);
    }
    updateMarkerNodes() {
        if (!this.chart) {
            return;
        }
        const { xKey, marker, seriesItemEnabled, yKeys, fills, strokes, chart: { highlightedDatum }, highlightStyle: { fill: deprecatedFill, stroke: deprecatedStroke, strokeWidth: deprecatedStrokeWidth, item: { fill: highlightedFill = deprecatedFill, stroke: highlightedStroke = deprecatedStroke, strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth, } } } = this;
        const { size, formatter } = marker;
        const markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : this.strokeWidth;
        this.markerSelection.each((node, datum) => {
            const yKeyIndex = yKeys.indexOf(datum.yKey);
            const isDatumHighlighted = datum === highlightedDatum;
            const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill || fills[yKeyIndex % fills.length];
            const stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : marker.stroke || strokes[yKeyIndex % fills.length];
            const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                ? highlightedDatumStrokeWidth
                : markerStrokeWidth;
            let format = undefined;
            if (formatter) {
                format = formatter({
                    datum: datum.datum,
                    xKey,
                    yKey: datum.yKey,
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
            node.visible = marker.enabled && node.size > 0 && !!seriesItemEnabled.get(datum.yKey) && !isNaN(datum.point.x);
            node.opacity = this.getOpacity(datum);
        });
    }
    updateLabelSelection() {
        const updateLabels = this.labelSelection.setData(this.labelSelectionData);
        updateLabels.exit.remove();
        const enterLabels = updateLabels.enter.append(text_1.Text);
        this.labelSelection = updateLabels.merge(enterLabels);
    }
    updateLabelNodes() {
        if (!this.chart) {
            return;
        }
        const { enabled: labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color } = this.label;
        this.labelSelection.each((text, datum) => {
            const { point, label } = datum;
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
                text.opacity = this.getOpacity(datum);
            }
            else {
                text.visible = false;
            }
        });
    }
    getNodeData() {
        return this.markerSelectionData;
    }
    fireNodeClickEvent(event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event,
            series: this,
            datum: datum.datum,
            xKey: this.xKey,
            yKey: datum.yKey
        });
    }
    getTooltipHtml(nodeDatum) {
        const { xKey } = this;
        const { yKey } = nodeDatum;
        if (!(xKey && yKey)) {
            return '';
        }
        const datum = nodeDatum.datum;
        const xValue = datum[xKey];
        const yValue = datum[yKey];
        const { xAxis, yAxis } = this;
        if (!(xAxis && yAxis && value_1.isNumber(yValue))) {
            return '';
        }
        const x = xAxis.scale.convert(xValue);
        const y = yAxis.scale.convert(yValue);
        // Don't show the tooltip for the off-screen markers.
        // Node: some markers might still go off-screen despite virtual rendering
        //       (to connect the dots and render the area properly).
        if (!(xAxis.inRange(x) && yAxis.inRange(y))) {
            return '';
        }
        const { xName, yKeys, yNames, yData, fills, strokes, tooltip, marker } = this;
        const { size, formatter: markerFormatter, strokeWidth: markerStrokeWidth, fill: markerFill, stroke: markerStroke } = marker;
        const xString = xAxis.formatDatum(xValue);
        const yString = yAxis.formatDatum(yValue);
        const yKeyIndex = yKeys.indexOf(yKey);
        const yGroup = yData[nodeDatum.index];
        const processedYValue = yGroup[yKeyIndex];
        const yName = yNames[yKeyIndex];
        const title = sanitize_1.sanitizeHtml(yName);
        const content = sanitize_1.sanitizeHtml(xString + ': ' + yString);
        const strokeWidth = markerStrokeWidth !== undefined ? markerStrokeWidth : this.strokeWidth;
        const fill = markerFill || fills[yKeyIndex % fills.length];
        const stroke = markerStroke || strokes[yKeyIndex % fills.length];
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
        const color = format && format.fill || markerFill;
        const defaults = {
            title,
            backgroundColor: color,
            content
        };
        const { renderer: tooltipRenderer, format: tooltipFormat } = tooltip;
        if (tooltipFormat || tooltipRenderer) {
            const params = {
                datum,
                xKey,
                xName,
                xValue,
                yKey,
                yValue,
                processedYValue,
                yName,
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
        const { data, id, xKey, yKeys, yNames, seriesItemEnabled, marker, fills, strokes, fillOpacity, strokeOpacity } = this;
        if (data && data.length && xKey && yKeys.length) {
            yKeys.forEach((yKey, index) => {
                legendData.push({
                    id,
                    itemId: yKey,
                    enabled: seriesItemEnabled.get(yKey) || false,
                    label: {
                        text: yNames[index] || yKeys[index]
                    },
                    marker: {
                        shape: marker.shape,
                        fill: marker.fill || fills[index % fills.length],
                        stroke: marker.stroke || strokes[index % strokes.length],
                        fillOpacity,
                        strokeOpacity
                    }
                });
            });
        }
    }
    toggleSeriesItem(itemId, enabled) {
        this.seriesItemEnabled.set(itemId, enabled);
        this.scheduleData();
    }
}
AreaSeries.className = 'AreaSeries';
AreaSeries.type = 'area';
__decorate([
    observable_1.reactive('dataChange')
], AreaSeries.prototype, "fills", void 0);
__decorate([
    observable_1.reactive('dataChange')
], AreaSeries.prototype, "strokes", void 0);
__decorate([
    observable_1.reactive('update')
], AreaSeries.prototype, "fillOpacity", void 0);
__decorate([
    observable_1.reactive('update')
], AreaSeries.prototype, "strokeOpacity", void 0);
__decorate([
    observable_1.reactive('update')
], AreaSeries.prototype, "lineDash", void 0);
__decorate([
    observable_1.reactive('update')
], AreaSeries.prototype, "lineDashOffset", void 0);
__decorate([
    observable_1.reactive('update')
], AreaSeries.prototype, "xName", void 0);
__decorate([
    observable_1.reactive('update')
], AreaSeries.prototype, "yNames", void 0);
__decorate([
    observable_1.reactive('update')
], AreaSeries.prototype, "strokeWidth", void 0);
__decorate([
    observable_1.reactive('update')
], AreaSeries.prototype, "shadow", void 0);
exports.AreaSeries = AreaSeries;
//# sourceMappingURL=areaSeries.js.map