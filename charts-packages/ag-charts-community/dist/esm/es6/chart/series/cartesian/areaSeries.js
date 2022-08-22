import { SeriesTooltip, } from '../series';
import { PointerEvents } from '../../../scene/node';
import { CartesianSeries, CartesianSeriesMarker } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { getMarker } from '../../marker/util';
import { toTooltipHtml } from '../../chart';
import { extent } from '../../../util/array';
import { equal } from '../../../util/equal';
import { interpolate } from '../../../util/string';
import { Text } from '../../../scene/shape/text';
import { Label } from '../../label';
import { sanitizeHtml } from '../../../util/sanitize';
import { checkDatum, isContinuous, isNumber } from '../../../util/value';
import { clamper, ContinuousScale } from '../../../scale/continuousScale';
import { doOnce } from '../../../util/function';
class AreaSeriesLabel extends Label {
    constructor() {
        super(...arguments);
        this.formatter = undefined;
    }
}
export class AreaSeriesTooltip extends SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
        this.format = undefined;
    }
}
var AreaSeriesTag;
(function (AreaSeriesTag) {
    AreaSeriesTag[AreaSeriesTag["Fill"] = 0] = "Fill";
    AreaSeriesTag[AreaSeriesTag["Stroke"] = 1] = "Stroke";
    AreaSeriesTag[AreaSeriesTag["Marker"] = 2] = "Marker";
    AreaSeriesTag[AreaSeriesTag["Label"] = 3] = "Label";
})(AreaSeriesTag || (AreaSeriesTag = {}));
export class AreaSeries extends CartesianSeries {
    constructor() {
        super({
            pathsPerSeries: 2,
            pathsZIndexSubOrderOffset: [0, 1000],
            pickGroupIncludes: ['markers'],
            features: ['markers'],
        });
        this.tooltip = new AreaSeriesTooltip();
        this.xData = [];
        this.yData = [];
        this.yDomain = [];
        this.xDomain = [];
        this.directionKeys = {
            x: ['xKey'],
            y: ['yKeys'],
        };
        this.marker = new CartesianSeriesMarker();
        this.label = new AreaSeriesLabel();
        this.fills = ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'];
        this.strokes = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];
        this.fillOpacity = 1;
        this.strokeOpacity = 1;
        this.lineDash = [0];
        this.lineDashOffset = 0;
        this._xKey = '';
        this.xName = '';
        this._yKeys = [];
        this.yNames = [];
        this.strokeWidth = 2;
        this.shadow = undefined;
        const { marker, label } = this;
        marker.enabled = false;
        label.enabled = false;
    }
    set xKey(value) {
        this._xKey = value;
        this.xData = [];
    }
    get xKey() {
        return this._xKey;
    }
    set yKeys(values) {
        if (!equal(this._yKeys, values)) {
            this._yKeys = values;
            this.yData = [];
            this.processSeriesItemEnabled();
        }
    }
    get yKeys() {
        return this._yKeys;
    }
    set visibles(visibles) {
        this._visibles = visibles;
        this.processSeriesItemEnabled();
    }
    get visibles() {
        return this._visibles;
    }
    processSeriesItemEnabled() {
        const { seriesItemEnabled, _visibles: visibles = [] } = this;
        seriesItemEnabled.clear();
        this._yKeys.forEach((key, idx) => { var _a; return seriesItemEnabled.set(key, (_a = visibles[idx], (_a !== null && _a !== void 0 ? _a : true))); });
    }
    setColors(fills, strokes) {
        this.fills = fills;
        this.strokes = strokes;
    }
    set normalizedTo(value) {
        const absValue = value ? Math.abs(value) : undefined;
        if (this._normalizedTo !== absValue) {
            this._normalizedTo = absValue;
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
        //   xKey: 'Jan',
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
        const isContinuousX = xAxis.scale instanceof ContinuousScale;
        const isContinuousY = yAxis.scale instanceof ContinuousScale;
        const normalized = normalizedTo && isFinite(normalizedTo);
        const yData = [];
        const xData = [];
        const xValues = [];
        for (let datum of data) {
            // X datum
            if (!(xKey in datum)) {
                doOnce(() => console.warn(`The key '${xKey}' was not found in the data: `, datum), `${xKey} not found in data`);
                continue;
            }
            const xDatum = checkDatum(datum[xKey], isContinuousX);
            if (isContinuousX && xDatum === undefined) {
                continue;
            }
            else {
                xValues.push(xDatum);
                xData.push({ xDatum, seriesDatum: datum });
            }
            // Y datum
            yKeys.forEach((yKey, i) => {
                if (!(yKey in datum)) {
                    doOnce(() => console.warn(`The key '${yKey}' was not found in the data: `, datum), `${yKey} not found in data`);
                    return;
                }
                const value = datum[yKey];
                const seriesYs = yData[i] || (yData[i] = []);
                if (!seriesItemEnabled.get(yKey)) {
                    seriesYs.push(NaN);
                }
                else {
                    const yDatum = checkDatum(value, isContinuousY);
                    seriesYs.push(yDatum);
                }
            });
        }
        this.yData = yData;
        this.xData = xData;
        this.xDomain = isContinuousX ? this.fixNumericExtent(extent(xValues, isContinuous), xAxis) : xValues;
        // xData: ['Jan', 'Feb', undefined]
        //
        // yData: [
        //   [5, 10], <- series 1 (yKey1)
        //   [7, -15], <- series 2 (yKey2)
        //   [-9, 20] <- series 3 (yKey3)
        // ]
        let yMin = undefined;
        let yMax = undefined;
        for (let i = 0; i < xData.length; i++) {
            const total = { sum: 0, absSum: 0 };
            for (let seriesYs of yData) {
                if (seriesYs[i] === undefined || isNaN(seriesYs[i])) {
                    continue;
                }
                const y = +seriesYs[i]; // convert to number as the value could be a Date object
                total.absSum += Math.abs(y);
                total.sum += y;
                if (total.sum >= ((yMax !== null && yMax !== void 0 ? yMax : 0))) {
                    yMax = total.sum;
                }
                else if (total.sum <= ((yMin !== null && yMin !== void 0 ? yMin : 0))) {
                    yMin = total.sum;
                }
            }
            if (!(normalized && normalizedTo)) {
                continue;
            }
            let normalizedTotal = undefined;
            // normalize y values using the absolute sum of y values in the stack
            for (let seriesYs of yData) {
                const normalizedY = (+seriesYs[i] / total.absSum) * normalizedTo;
                seriesYs[i] = normalizedY;
                if (!isNaN(normalizedY)) {
                    // sum normalized values to get updated yMin and yMax of normalized area
                    normalizedTotal = ((normalizedTotal !== null && normalizedTotal !== void 0 ? normalizedTotal : 0)) + normalizedY;
                }
                else {
                    continue;
                }
                if (normalizedTotal >= ((yMax !== null && yMax !== void 0 ? yMax : 0))) {
                    yMax = normalizedTotal;
                }
                else if (normalizedTotal <= ((yMin !== null && yMin !== void 0 ? yMin : 0))) {
                    yMin = normalizedTotal;
                }
            }
        }
        if (normalized && normalizedTo) {
            // multiplier to control the unused whitespace in the y domain, value selected by subjective visual 'niceness'.
            const domainWhitespaceAdjustment = 0.5;
            // set the yMin and yMax based on cumulative sum of normalized values
            yMin = ((yMin !== null && yMin !== void 0 ? yMin : 0)) < -normalizedTo * domainWhitespaceAdjustment ? -normalizedTo : yMin;
            yMax = ((yMax !== null && yMax !== void 0 ? yMax : 0)) > normalizedTo * domainWhitespaceAdjustment ? normalizedTo : yMax;
        }
        this.yDomain = this.fixNumericExtent(yMin === undefined && yMax === undefined ? undefined : [(yMin !== null && yMin !== void 0 ? yMin : 0), (yMax !== null && yMax !== void 0 ? yMax : 0)], yAxis);
        return true;
    }
    getDomain(direction) {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        }
        else {
            return this.yDomain;
        }
    }
    createNodeData() {
        const { data, xAxis, yAxis, xData, yData } = this;
        if (!data || !xAxis || !yAxis || !xData.length || !yData.length) {
            return [];
        }
        const contexts = [];
        const { yKeys, marker, label, fills, strokes } = this;
        const { scale: xScale } = xAxis;
        const { scale: yScale } = yAxis;
        const continuousY = yScale instanceof ContinuousScale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const cumulativePathValues = new Array(xData.length)
            .fill(null)
            .map(() => ({ left: 0, right: 0 }));
        const cumulativeMarkerValues = new Array(xData.length).fill(0);
        const createPathCoordinates = (xDatum, yDatum, idx, side) => {
            const x = xScale.convert(xDatum) + xOffset;
            const prevY = cumulativePathValues[idx][side];
            const currY = cumulativePathValues[idx][side] + yDatum;
            const prevYCoordinate = yScale.convert(prevY, continuousY ? clamper : undefined);
            const currYCoordinate = yScale.convert(currY, continuousY ? clamper : undefined);
            cumulativePathValues[idx][side] = currY;
            return [
                { x, y: currYCoordinate, size: marker.size },
                { x, y: prevYCoordinate, size: marker.size },
            ];
        };
        const createMarkerCoordinate = (xDatum, yDatum, idx, rawYDatum) => {
            let currY;
            // if not normalized, the invalid data points will be processed as `undefined` in processData()
            // if normalized, the invalid data points will be processed as 0 rather than `undefined`
            // check if unprocessed datum is valid as we only want to show markers for valid points
            const normalized = this.normalizedTo && isFinite(this.normalizedTo);
            const normalizedAndValid = normalized && continuousY && isContinuous(rawYDatum);
            const valid = (!normalized && !isNaN(rawYDatum)) || normalizedAndValid;
            if (valid) {
                currY = cumulativeMarkerValues[idx] += yDatum;
            }
            const x = xScale.convert(xDatum) + xOffset;
            const y = yScale.convert(currY, continuousY ? clamper : undefined);
            return { x, y, size: marker.size };
        };
        yData.forEach((seriesYs, seriesIdx) => {
            const yKey = yKeys[seriesIdx];
            const labelSelectionData = [];
            const markerSelectionData = [];
            const strokeSelectionData = { itemId: yKey, points: [], yValues: [] };
            const fillSelectionData = { itemId: yKey, points: [] };
            contexts[seriesIdx] = {
                itemId: yKey,
                fillSelectionData,
                labelData: labelSelectionData,
                nodeData: markerSelectionData,
                strokeSelectionData,
            };
            if (!this.seriesItemEnabled.get(yKey)) {
                return;
            }
            const fillPoints = fillSelectionData.points;
            const fillPhantomPoints = [];
            const strokePoints = strokeSelectionData.points;
            const yValues = strokeSelectionData.yValues;
            seriesYs.forEach((rawYDatum, datumIdx) => {
                var _a;
                const yDatum = isNaN(rawYDatum) ? undefined : rawYDatum;
                const { xDatum, seriesDatum } = xData[datumIdx];
                const nextXDatum = (_a = xData[datumIdx + 1]) === null || _a === void 0 ? void 0 : _a.xDatum;
                const rawNextYDatum = seriesYs[datumIdx + 1];
                const nextYDatum = isNaN(rawNextYDatum) ? undefined : rawNextYDatum;
                // marker data
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
                        stroke: strokes[seriesIdx % strokes.length],
                    });
                }
                // label data
                let labelText;
                if (label.formatter) {
                    labelText = label.formatter({ value: yDatum });
                }
                else {
                    labelText = isNumber(yDatum) ? Number(yDatum).toFixed(2) : String(yDatum);
                }
                if (label) {
                    labelSelectionData.push({
                        index: datumIdx,
                        itemId: yKey,
                        point,
                        label: this.seriesItemEnabled.get(yKey) && labelText
                            ? {
                                text: labelText,
                                fontStyle: label.fontStyle,
                                fontWeight: label.fontWeight,
                                fontSize: label.fontSize,
                                fontFamily: label.fontFamily,
                                textAlign: 'center',
                                textBaseline: 'bottom',
                                fill: label.color,
                            }
                            : undefined,
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
            for (let i = fillPhantomPoints.length - 1; i >= 0; i--) {
                fillPoints.push(fillPhantomPoints[i]);
            }
        });
        return contexts;
    }
    isPathOrSelectionDirty() {
        return this.marker.isDirty();
    }
    updatePaths(opts) {
        const { contextData: { fillSelectionData, strokeSelectionData }, paths: [fill, stroke], } = opts;
        fill.datum = fillSelectionData;
        fill.tag = AreaSeriesTag.Fill;
        fill.lineJoin = 'round';
        fill.stroke = undefined;
        fill.pointerEvents = PointerEvents.None;
        stroke.datum = strokeSelectionData;
        stroke.tag = AreaSeriesTag.Stroke;
        stroke.fill = undefined;
        stroke.lineJoin = stroke.lineCap = 'round';
        stroke.pointerEvents = PointerEvents.None;
    }
    updatePathNodes(opts) {
        const { paths: [fill, stroke], seriesIdx, itemId, } = opts;
        const { strokes, fills, fillOpacity, strokeOpacity, strokeWidth, shadow } = this;
        {
            const { datum: { points }, } = fill;
            fill.fill = fills[seriesIdx % fills.length];
            fill.fillOpacity = fillOpacity;
            fill.strokeOpacity = strokeOpacity;
            fill.strokeWidth = strokeWidth;
            fill.lineDash = this.lineDash;
            fill.lineDashOffset = this.lineDashOffset;
            fill.fillShadow = shadow;
            const path = fill.path;
            path.clear({ trackChanges: true });
            let i = 0;
            for (const p of points) {
                if (i++ > 0) {
                    path.lineTo(p.x, p.y);
                }
                else {
                    path.moveTo(p.x, p.y);
                }
            }
            path.closePath();
            fill.checkPathDirty();
        }
        {
            const { datum: { points, yValues }, } = stroke;
            let moveTo = true;
            stroke.stroke = strokes[seriesIdx % strokes.length];
            stroke.strokeWidth = this.getStrokeWidth(this.strokeWidth, { itemId });
            stroke.strokeOpacity = strokeOpacity;
            stroke.lineDash = this.lineDash;
            stroke.lineDashOffset = this.lineDashOffset;
            const path = stroke.path;
            path.clear({ trackChanges: true });
            let i = 0;
            for (const p of points) {
                if (yValues[i++] === undefined) {
                    moveTo = true;
                }
                else if (moveTo) {
                    path.moveTo(p.x, p.y);
                    moveTo = false;
                }
                else {
                    path.lineTo(p.x, p.y);
                }
            }
            stroke.checkPathDirty();
        }
    }
    updateMarkerSelection(opts) {
        let { nodeData, markerSelection } = opts;
        const { marker: { enabled, shape }, } = this;
        const data = enabled && nodeData ? nodeData : [];
        const MarkerShape = getMarker(shape);
        if (this.marker.isDirty()) {
            markerSelection = markerSelection.setData([]);
            markerSelection.exit.remove();
        }
        const updateMarkerSelection = markerSelection.setData(data);
        updateMarkerSelection.exit.remove();
        const enterMarkers = updateMarkerSelection.enter.append(MarkerShape).each((marker) => {
            marker.tag = AreaSeriesTag.Marker;
        });
        return updateMarkerSelection.merge(enterMarkers);
    }
    updateMarkerNodes(opts) {
        const { markerSelection, isHighlight: isDatumHighlighted } = opts;
        const { xKey, marker, seriesItemEnabled, yKeys, fills, strokes, fillOpacity: seriesFillOpacity, marker: { fillOpacity: markerFillOpacity = seriesFillOpacity }, strokeOpacity, highlightStyle: { fill: deprecatedFill, stroke: deprecatedStroke, strokeWidth: deprecatedStrokeWidth, item: { fill: highlightedFill = deprecatedFill, fillOpacity: highlightFillOpacity = markerFillOpacity, stroke: highlightedStroke = deprecatedStroke, strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth, }, }, } = this;
        const { size, formatter } = marker;
        const markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : this.strokeWidth;
        markerSelection.each((node, datum) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const yKeyIndex = yKeys.indexOf(datum.yKey);
            const fill = isDatumHighlighted && highlightedFill !== undefined
                ? highlightedFill
                : marker.fill || fills[yKeyIndex % fills.length];
            const fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
            const stroke = isDatumHighlighted && highlightedStroke !== undefined
                ? highlightedStroke
                : marker.stroke || strokes[yKeyIndex % fills.length];
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
                    highlighted: isDatumHighlighted,
                });
            }
            node.fill = (format && format.fill) || fill;
            node.stroke = (format && format.stroke) || stroke;
            node.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
            node.fillOpacity = (fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1);
            node.strokeOpacity = (_b = (_a = marker.strokeOpacity, (_a !== null && _a !== void 0 ? _a : strokeOpacity)), (_b !== null && _b !== void 0 ? _b : 1));
            node.size = format && format.size !== undefined ? format.size : size;
            node.translationX = (_d = (_c = datum.point) === null || _c === void 0 ? void 0 : _c.x, (_d !== null && _d !== void 0 ? _d : 0));
            node.translationY = (_f = (_e = datum.point) === null || _e === void 0 ? void 0 : _e.y, (_f !== null && _f !== void 0 ? _f : 0));
            node.visible =
                node.size > 0 &&
                    !!seriesItemEnabled.get(datum.yKey) &&
                    !isNaN(((_g = datum.point) === null || _g === void 0 ? void 0 : _g.x) || 0) &&
                    !isNaN(((_h = datum.point) === null || _h === void 0 ? void 0 : _h.y) || 0);
        });
        if (!isDatumHighlighted) {
            this.marker.markClean();
        }
    }
    updateLabelSelection(opts) {
        const { labelData, labelSelection } = opts;
        const updateLabels = labelSelection.setData(labelData);
        updateLabels.exit.remove();
        const enterLabels = updateLabels.enter.append(Text).each((text) => {
            text.tag = AreaSeriesTag.Label;
        });
        return updateLabels.merge(enterLabels);
    }
    updateLabelNodes(opts) {
        const { labelSelection } = opts;
        const { enabled: labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color } = this.label;
        labelSelection.each((text, datum) => {
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
            }
            else {
                text.visible = false;
            }
        });
    }
    fireNodeClickEvent(event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event,
            series: this,
            datum: datum.datum,
            xKey: this.xKey,
            yKey: datum.yKey,
        });
    }
    getTooltipHtml(nodeDatum) {
        const { xKey } = this;
        const { yKey } = nodeDatum;
        if (!(xKey && yKey) || !this.seriesItemEnabled.get(yKey)) {
            return '';
        }
        const datum = nodeDatum.datum;
        const xValue = datum[xKey];
        const yValue = datum[yKey];
        const { xAxis, yAxis } = this;
        if (!(xAxis && yAxis && isNumber(yValue))) {
            return '';
        }
        const { xName, yKeys, yNames, yData, fills, strokes, tooltip, marker } = this;
        const { size, formatter: markerFormatter, strokeWidth: markerStrokeWidth, fill: markerFill, stroke: markerStroke, } = marker;
        const xString = xAxis.formatDatum(xValue);
        const yString = yAxis.formatDatum(yValue);
        const yKeyIndex = yKeys.indexOf(yKey);
        const seriesYs = yData[yKeyIndex];
        const processedYValue = seriesYs[nodeDatum.index];
        const yName = yNames[yKeyIndex];
        const title = sanitizeHtml(yName);
        const content = sanitizeHtml(xString + ': ' + yString);
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
                highlighted: false,
            });
        }
        const color = (format && format.fill) || fill;
        const defaults = {
            title,
            backgroundColor: color,
            content,
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
                color,
                title,
            };
            if (tooltipFormat) {
                return toTooltipHtml({
                    content: interpolate(tooltipFormat, params),
                }, defaults);
            }
            if (tooltipRenderer) {
                return toTooltipHtml(tooltipRenderer(params), defaults);
            }
        }
        return toTooltipHtml(defaults);
    }
    listSeriesItems(legendData) {
        var _a, _b;
        const { data, id, xKey, yKeys, yNames, seriesItemEnabled, marker, fills, strokes, fillOpacity, strokeOpacity } = this;
        if (!data || !data.length || !xKey || !yKeys.length) {
            return;
        }
        // Area stacks should be listed in the legend in reverse order, for symmetry with the
        // vertical stack display order.
        for (let index = yKeys.length - 1; index >= 0; index--) {
            const yKey = yKeys[index];
            legendData.push({
                id,
                itemId: yKey,
                enabled: seriesItemEnabled.get(yKey) || false,
                label: {
                    text: yNames[index] || yKeys[index],
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill || fills[index % fills.length],
                    stroke: marker.stroke || strokes[index % strokes.length],
                    fillOpacity: (_a = marker.fillOpacity, (_a !== null && _a !== void 0 ? _a : fillOpacity)),
                    strokeOpacity: (_b = marker.strokeOpacity, (_b !== null && _b !== void 0 ? _b : strokeOpacity)),
                },
            });
        }
    }
}
AreaSeries.className = 'AreaSeries';
AreaSeries.type = 'area';
