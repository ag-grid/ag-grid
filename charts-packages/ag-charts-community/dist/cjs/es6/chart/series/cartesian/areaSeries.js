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
        this.fillSelectionData = [];
        this.strokeSelectionData = [];
        this.markerSelectionData = [];
        this.labelSelectionData = [];
        this.yDomain = [];
        this.xDomain = [];
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
        const { xKey, yKeys, seriesItemEnabled, xAxis, yAxis, normalizedTo } = this;
        const data = xKey && yKeys.length && this.data ? this.data : [];
        if (!xAxis || !yAxis) {
            return false;
        }
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
        const isContinuousX = xAxis.scale instanceof continuousScale_1.ContinuousScale;
        const isContinuousY = yAxis.scale instanceof continuousScale_1.ContinuousScale;
        const normalized = normalizedTo && isFinite(normalizedTo);
        let keysFound = true; // only warn once
        this.xData = data.map(datum => {
            if (keysFound && !(xKey in datum)) {
                keysFound = false;
                console.warn(`The key '${xKey}' was not found in the data: `, datum);
            }
            if (isContinuousX) {
                return value_1.isContinuous(datum[xKey]) ? datum[xKey] : undefined;
            }
            else {
                // i.e. category axis
                return value_1.isDiscrete(datum[xKey]) ? datum[xKey] : String(datum[xKey]);
            }
        });
        this.yData = data.map(datum => yKeys.map(yKey => {
            if (keysFound && !(yKey in datum)) {
                keysFound = false;
                console.warn(`The key '${yKey}' was not found in the data: `, datum);
            }
            const value = datum[yKey];
            if (!seriesItemEnabled.get(yKey)) {
                return 0;
            }
            if (isContinuousY) {
                return value_1.isContinuous(value) ? value : normalized ? 0 : undefined;
            }
            else {
                return value_1.isDiscrete(value) ? value : String(value);
            }
        }));
        this.xDomain = isContinuousX ? this.fixNumericExtent(array_1.extent(this.xData, value_1.isContinuous), 'x', xAxis) : this.xData;
        // xData: ['Jan', 'Feb']
        //
        // yData: [
        //   [5, 7, -9],
        //   [10, -15, 20]
        // ]
        const { yData } = this;
        const processedYData = [];
        let yMin = 0;
        let yMax = 0;
        for (let stack of yData) {
            // find the sum of y values in the stack, used for normalization of stacked areas and determining yDomain of data
            const total = { sum: 0, absSum: 0 };
            for (let i = 0; i < stack.length; i++) {
                const y = +stack[i]; // convert to number as the value could be a Date object
                total.absSum += Math.abs(y);
                total.sum += y;
                if (total.sum > yMax) {
                    yMax = total.sum;
                }
                else if (total.sum < yMin) {
                    yMin = total.sum;
                }
            }
            let normalizedTotal = 0;
            for (let i = 0; i < stack.length; i++) {
                if (normalized && normalizedTo) {
                    // normalize y values using the absolute sum of y values in the stack
                    const normalizedY = +stack[i] / total.absSum * normalizedTo;
                    stack[i] = normalizedY;
                    // sum normalized values to get updated yMin and yMax of normalized area
                    normalizedTotal += normalizedY;
                    if (normalizedTotal > yMax) {
                        yMax = normalizedTotal;
                    }
                    else if (normalizedTotal < yMin) {
                        yMin = normalizedTotal;
                    }
                }
                // TODO: test performance to see impact of this
                // process data to be in the format required for creating node data and rendering area paths
                (processedYData[i] || (processedYData[i] = [])).push(stack[i]);
            }
        }
        if (normalized && normalizedTo) {
            // Multiplier to control the unused whitespace in the y domain, value selected by subjective visual 'niceness'.
            const domainWhitespaceAdjustment = 0.5;
            // set the yMin and yMax based on cumulative sum of normalized values
            yMin = yMin < (-normalizedTo * domainWhitespaceAdjustment) ? -normalizedTo : yMin;
            yMax = yMax > (normalizedTo * domainWhitespaceAdjustment) ? normalizedTo : yMax;
        }
        this.yData = processedYData;
        this.yDomain = this.fixNumericExtent([yMin, yMax], 'y', yAxis);
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
            return this.xDomain;
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
        const { data, xAxis, yAxis, xData, yData, labelSelectionData, markerSelectionData, strokeSelectionData, fillSelectionData, xKey } = this;
        if (!data || !xAxis || !yAxis || !xData.length || !yData.length) {
            return;
        }
        const { yKeys, marker, label, fills, strokes } = this;
        const { scale: xScale } = xAxis;
        const { scale: yScale } = yAxis;
        const continuousY = yScale instanceof continuousScale_1.ContinuousScale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        markerSelectionData.length = 0;
        labelSelectionData.length = 0;
        strokeSelectionData.length = 0;
        fillSelectionData.length = 0;
        const cumulativePathValues = new Array(xData.length).fill(null).map(() => ({ left: 0, right: 0 }));
        const cumulativeMarkerValues = new Array(xData.length).fill(0);
        const createPathCoordinates = (xDatum, yDatum, idx, side) => {
            const x = xScale.convert(xDatum) + xOffset;
            const prevY = cumulativePathValues[idx][side];
            const currY = cumulativePathValues[idx][side] + yDatum;
            const prevYCoordinate = yScale.convert(prevY, continuousY ? continuousScale_1.clamper : undefined);
            const currYCoordinate = yScale.convert(currY, continuousY ? continuousScale_1.clamper : undefined);
            cumulativePathValues[idx][side] = currY;
            return [
                { x, y: currYCoordinate },
                { x, y: prevYCoordinate },
            ];
        };
        const createMarkerCoordinate = (xDatum, yDatum, idx, rawYDatum) => {
            let currY;
            // if not normalized, the invalid data points will be processed as `undefined` in processData()
            // if normalized, the invalid data points will be processed as 0 rather than `undefined`
            // check if unprocessed datum is valid as we only want to show markers for valid points
            const normalized = this.normalizedTo && isFinite(this.normalizedTo);
            const normalizedAndValid = normalized && continuousY && value_1.isContinuous(rawYDatum);
            if (!normalized || normalizedAndValid) {
                currY = cumulativeMarkerValues[idx] += yDatum;
            }
            const x = xScale.convert(xDatum) + xOffset;
            const y = yScale.convert(currY, continuousY ? continuousScale_1.clamper : undefined);
            return { x, y };
        };
        yData.forEach((seriesYs, seriesIdx) => {
            const yKey = yKeys[seriesIdx];
            const fillSelectionForSeries = fillSelectionData[seriesIdx] || (fillSelectionData[seriesIdx] = { itemId: yKey, points: [] });
            const fillPoints = fillSelectionForSeries.points;
            const fillPhantomPoints = [];
            const strokeDatum = strokeSelectionData[seriesIdx] || (strokeSelectionData[seriesIdx] = { itemId: yKey, points: [], yValues: [] });
            const strokePoints = strokeDatum.points;
            const yValues = strokeDatum.yValues;
            seriesYs.forEach((yDatum, datumIdx) => {
                const xDatum = xData[datumIdx];
                const nextXDatum = xData[datumIdx + 1];
                const nextYDatum = seriesYs[datumIdx + 1];
                // marker data
                const seriesDatum = data[datumIdx];
                const point = createMarkerCoordinate(xDatum, +yDatum, datumIdx, seriesDatum[yKey]);
                if (marker) {
                    markerSelectionData.push({
                        index: datumIdx,
                        series: this,
                        itemId: yKey,
                        datum: seriesDatum,
                        yValue: yDatum,
                        yKey,
                        point,
                        fill: fills[seriesIdx % fills.length],
                        stroke: strokes[seriesIdx % strokes.length]
                    });
                }
                // label data
                let labelText;
                if (label.formatter) {
                    labelText = label.formatter({ value: yDatum });
                }
                else {
                    labelText = value_1.isNumber(yDatum) ? Number(yDatum).toFixed(2) : String(yDatum);
                }
                if (label) {
                    labelSelectionData.push({
                        index: datumIdx,
                        itemId: yKey,
                        point,
                        label: this.seriesItemEnabled.get(yKey) && labelText ? {
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
                // fill data
                // Handle data in pairs of current and next x and y values
                const windowX = [xDatum, nextXDatum];
                const windowY = [yDatum, nextYDatum];
                if (windowX.some((v) => v == undefined)) {
                    return;
                }
                if (windowY.some((v) => v == undefined)) {
                    windowY[0] = 0;
                    windowY[1] = 0;
                }
                const currCoordinates = createPathCoordinates(windowX[0], +windowY[0], datumIdx, 'right');
                fillPoints.push(currCoordinates[0]);
                fillPhantomPoints.push(currCoordinates[1]);
                const nextCoordinates = createPathCoordinates(windowX[1], +windowY[1], datumIdx, 'left');
                fillPoints.push(nextCoordinates[0]);
                fillPhantomPoints.push(nextCoordinates[1]);
                // stroke data
                strokePoints.push({ x: NaN, y: NaN }); // moveTo
                yValues.push(undefined);
                strokePoints.push(currCoordinates[0]);
                yValues.push(yDatum);
                if (nextYDatum !== undefined) {
                    strokePoints.push(nextCoordinates[0]);
                    yValues.push(yDatum);
                }
            });
            fillPoints.push(...fillPhantomPoints.slice().reverse());
        });
    }
    updateFillSelection() {
        const updateFills = this.fillSelection.setData(this.fillSelectionData);
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
        const { fills, fillOpacity, strokeOpacity, strokeWidth, shadow, seriesItemEnabled } = this;
        this.fillSelection.each((shape, datum, index) => {
            shape.fill = fills[index % fills.length];
            shape.fillOpacity = fillOpacity;
            shape.strokeOpacity = strokeOpacity;
            shape.strokeWidth = strokeWidth;
            shape.lineDash = this.lineDash;
            shape.lineDashOffset = this.lineDashOffset;
            shape.fillShadow = shadow;
            shape.visible = !!seriesItemEnabled.get(datum.itemId);
            shape.opacity = this.getOpacity(datum);
            const { points } = datum;
            const path = shape.path;
            path.clear();
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
        const updateStrokes = this.strokeSelection.setData(this.strokeSelectionData);
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
        const { strokes, strokeOpacity, seriesItemEnabled } = this;
        let moveTo = true;
        this.strokeSelection.each((shape, datum, index) => {
            shape.visible = !!seriesItemEnabled.get(datum.itemId);
            shape.opacity = this.getOpacity(datum);
            shape.stroke = strokes[index % strokes.length];
            shape.strokeWidth = this.getStrokeWidth(this.strokeWidth, datum);
            shape.strokeOpacity = strokeOpacity;
            shape.lineDash = this.lineDash;
            shape.lineDashOffset = this.lineDashOffset;
            const { points, yValues } = datum;
            const path = shape.path;
            path.clear();
            for (let i = 0; i < points.length; i++) {
                const { x, y } = points[i];
                if (yValues[i] === undefined) {
                    moveTo = true;
                }
                else {
                    if (moveTo) {
                        path.moveTo(x, y);
                        moveTo = false;
                    }
                    else {
                        path.lineTo(x, y);
                    }
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
            node.visible = marker.enabled && node.size > 0 && !!seriesItemEnabled.get(datum.yKey) && !isNaN(datum.point.x) && !isNaN(datum.point.y);
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
        const { xName, yKeys, yNames, yData, fills, strokes, tooltip, marker } = this;
        const { size, formatter: markerFormatter, strokeWidth: markerStrokeWidth, fill: markerFill, stroke: markerStroke } = marker;
        const xString = xAxis.formatDatum(xValue);
        const yString = yAxis.formatDatum(yValue);
        const yKeyIndex = yKeys.indexOf(yKey);
        const seriesYs = yData[yKeyIndex];
        const processedYValue = seriesYs[nodeDatum.index];
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