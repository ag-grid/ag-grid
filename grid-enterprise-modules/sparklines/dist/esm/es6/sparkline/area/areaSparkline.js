import { _Scale, _Scene, _Util } from 'ag-charts-community';
import { Sparkline, ZINDICIES } from '../sparkline';
import { toTooltipHtml } from '../tooltip/sparklineTooltip';
import { getMarker } from '../marker/markerFactory';
import { getLineDash } from '../../util/lineDash';
const { extent } = _Util;
const { BandScale } = _Scale;
class SparklineMarker {
    constructor() {
        this.enabled = true;
        this.shape = 'circle';
        this.size = 0;
        this.fill = 'rgb(124, 181, 236)';
        this.stroke = 'rgb(124, 181, 236)';
        this.strokeWidth = 1;
        this.formatter = undefined;
    }
}
class SparklineLine {
    constructor() {
        this.stroke = 'rgb(124, 181, 236)';
        this.strokeWidth = 1;
    }
}
class SparklineCrosshairs {
    constructor() {
        this.xLine = {
            enabled: true,
            stroke: 'rgba(0,0,0, 0.54)',
            strokeWidth: 1,
            lineDash: 'solid',
            lineCap: undefined,
        };
        this.yLine = {
            enabled: false,
            stroke: 'rgba(0,0,0, 0.54)',
            strokeWidth: 1,
            lineDash: 'solid',
            lineCap: undefined,
        };
    }
}
export class AreaSparkline extends Sparkline {
    constructor() {
        super();
        this.fill = 'rgba(124, 181, 236, 0.25)';
        this.strokePath = new _Scene.Path();
        this.fillPath = new _Scene.Path();
        this.xCrosshairLine = new _Scene.Line();
        this.yCrosshairLine = new _Scene.Line();
        this.areaSparklineGroup = new _Scene.Group();
        this.xAxisLine = new _Scene.Line();
        this.markers = new _Scene.Group();
        this.markerSelection = _Scene.Selection.select(this.markers, () => this.markerFactory());
        this.markerSelectionData = [];
        this.marker = new SparklineMarker();
        this.line = new SparklineLine();
        this.crosshairs = new SparklineCrosshairs();
        this.rootGroup.append(this.areaSparklineGroup);
        this.xAxisLine.zIndex = ZINDICIES.AXIS_LINE_ZINDEX;
        this.fillPath.zIndex = ZINDICIES.SERIES_FILL_ZINDEX;
        this.strokePath.zIndex = ZINDICIES.SERIES_STROKE_ZINDEX;
        this.xCrosshairLine.zIndex = ZINDICIES.CROSSHAIR_ZINDEX;
        this.yCrosshairLine.zIndex = ZINDICIES.CROSSHAIR_ZINDEX;
        this.markers.zIndex = ZINDICIES.SERIES_MARKERS_ZINDEX;
        this.areaSparklineGroup.append([
            this.fillPath,
            this.xAxisLine,
            this.strokePath,
            this.xCrosshairLine,
            this.yCrosshairLine,
            this.markers,
        ]);
    }
    markerFactory() {
        const { shape } = this.marker;
        const MarkerShape = getMarker(shape);
        return new MarkerShape();
    }
    getNodeData() {
        return this.markerSelectionData;
    }
    update() {
        const data = this.generateNodeData();
        if (!data) {
            return;
        }
        const { nodeData, fillData, strokeData } = data;
        this.markerSelectionData = nodeData;
        this.updateSelection(nodeData);
        this.updateNodes();
        this.updateStroke(strokeData);
        this.updateFill(fillData);
    }
    updateYScaleDomain() {
        const { yData, yScale } = this;
        const yMinMax = extent(yData);
        let yMin = 0;
        let yMax = 1;
        if (yMinMax !== undefined) {
            yMin = this.min = yMinMax[0];
            yMax = this.max = yMinMax[1];
        }
        // if yMin is positive, set yMin to 0
        yMin = yMin < 0 ? yMin : 0;
        // if yMax is negative, set yMax to 0
        yMax = yMax < 0 ? 0 : yMax;
        yScale.domain = [yMin, yMax];
    }
    generateNodeData() {
        const { data, yData, xData, xScale, yScale } = this;
        if (!data) {
            return;
        }
        const continuous = !(xScale instanceof BandScale);
        const offsetX = !continuous ? xScale.bandwidth / 2 : 0;
        const n = yData.length;
        const nodeData = [];
        const fillData = [];
        const strokeData = [];
        let firstValidX;
        let lastValidX;
        let previousX;
        let nextX;
        const yZero = yScale.convert(0);
        for (let i = 0; i < n; i++) {
            const yDatum = yData[i];
            const xDatum = xData[i];
            const x = xScale.convert(continuous ? xScale.toDomain(xDatum) : xDatum) + offsetX;
            const y = yDatum === undefined ? NaN : yScale.convert(yDatum);
            // if this iteration is not the last, set nextX using the next value in the data array
            if (i + 1 < n) {
                nextX = xScale.convert(continuous ? xScale.toDomain(xData[i + 1]) : xData[i + 1]) + offsetX;
            }
            // set stroke data regardless of missing/ undefined values. Undefined values will be handled in the updateStroke() method
            strokeData.push({
                seriesDatum: { x: xDatum, y: yDatum },
                point: { x, y },
            });
            if (yDatum === undefined && previousX !== undefined) {
                // if yDatum is undefined and there is a valid previous data point, add a phantom point at yZero
                // if a next data point exists, add a phantom point at yZero at the next X
                fillData.push({ seriesDatum: undefined, point: { x: previousX, y: yZero } });
                if (nextX !== undefined) {
                    fillData.push({ seriesDatum: undefined, point: { x: nextX, y: yZero } });
                }
            }
            else if (yDatum !== undefined) {
                fillData.push({
                    seriesDatum: { x: xDatum, y: yDatum },
                    point: { x, y },
                });
                // set node data only if yDatum is not undefined. These values are used in the updateSelection() method to update markers
                nodeData.push({
                    seriesDatum: { x: xDatum, y: yDatum },
                    point: { x, y },
                });
                firstValidX = firstValidX !== undefined ? firstValidX : x;
                lastValidX = x;
            }
            previousX = x;
        }
        // phantom points for creating closed area
        fillData.push({ seriesDatum: undefined, point: { x: lastValidX, y: yZero } }, { seriesDatum: undefined, point: { x: firstValidX, y: yZero } });
        return { nodeData, fillData, strokeData };
    }
    updateAxisLine() {
        const { xScale, yScale, axis, xAxisLine } = this;
        xAxisLine.x1 = xScale.range[0];
        xAxisLine.x2 = xScale.range[1];
        xAxisLine.y1 = xAxisLine.y2 = 0;
        xAxisLine.stroke = axis.stroke;
        xAxisLine.strokeWidth = axis.strokeWidth;
        const yZero = yScale.convert(0);
        xAxisLine.translationY = yZero;
    }
    updateSelection(selectionData) {
        this.markerSelection.update(selectionData);
    }
    updateNodes() {
        const { highlightedDatum, highlightStyle, marker } = this;
        const { size: highlightSize, fill: highlightFill, stroke: highlightStroke, strokeWidth: highlightStrokeWidth, } = highlightStyle;
        const markerFormatter = marker.formatter;
        this.markerSelection.each((node, datum, index) => {
            const { point, seriesDatum } = datum;
            if (!point) {
                return;
            }
            const highlighted = datum === highlightedDatum;
            const markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill;
            const markerStroke = highlighted && highlightStroke !== undefined ? highlightStroke : marker.stroke;
            const markerStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : marker.strokeWidth;
            const markerSize = highlighted && highlightSize !== undefined ? highlightSize : marker.size;
            let markerFormat;
            if (markerFormatter) {
                const first = index === 0;
                const last = index === this.markerSelectionData.length - 1;
                const min = seriesDatum.y === this.min;
                const max = seriesDatum.y === this.max;
                markerFormat = markerFormatter({
                    datum,
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
                    min,
                    max,
                    first,
                    last,
                    fill: markerFill,
                    stroke: markerStroke,
                    strokeWidth: markerStrokeWidth,
                    size: markerSize,
                    highlighted,
                });
            }
            node.size = markerFormat && markerFormat.size != undefined ? markerFormat.size : markerSize;
            node.fill = markerFormat && markerFormat.fill != undefined ? markerFormat.fill : markerFill;
            node.stroke = markerFormat && markerFormat.stroke != undefined ? markerFormat.stroke : markerStroke;
            node.strokeWidth =
                markerFormat && markerFormat.strokeWidth != undefined ? markerFormat.strokeWidth : markerStrokeWidth;
            node.translationX = point.x;
            node.translationY = point.y;
            node.visible =
                markerFormat && markerFormat.enabled != undefined
                    ? markerFormat.enabled
                    : marker.enabled && node.size > 0;
        });
    }
    updateStroke(strokeData) {
        const { strokePath, yData, line } = this;
        if (yData.length < 2) {
            return;
        }
        const path = strokePath.path;
        const n = strokeData.length;
        let moveTo = true;
        path.clear();
        for (let i = 0; i < n; i++) {
            const { point, seriesDatum } = strokeData[i];
            const x = point.x;
            const y = point.y;
            if (seriesDatum.y == undefined) {
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
        strokePath.lineJoin = strokePath.lineCap = 'round';
        strokePath.fill = undefined;
        strokePath.stroke = line.stroke;
        strokePath.strokeWidth = line.strokeWidth;
    }
    updateFill(areaData) {
        const { fillPath, yData, fill } = this;
        const path = fillPath.path;
        const n = areaData.length;
        path.clear();
        if (yData.length < 2) {
            return;
        }
        for (let i = 0; i < n; i++) {
            const { point } = areaData[i];
            const x = point.x;
            const y = point.y;
            if (i > 0) {
                path.lineTo(x, y);
            }
            else {
                path.moveTo(x, y);
            }
        }
        path.closePath();
        fillPath.lineJoin = 'round';
        fillPath.stroke = undefined;
        fillPath.fill = fill;
    }
    updateXCrosshairLine() {
        var _a;
        const { yScale, xCrosshairLine, highlightedDatum, crosshairs: { xLine }, } = this;
        if (!xLine.enabled || highlightedDatum == undefined) {
            xCrosshairLine.strokeWidth = 0;
            return;
        }
        xCrosshairLine.y1 = yScale.range[0];
        xCrosshairLine.y2 = yScale.range[1];
        xCrosshairLine.x1 = xCrosshairLine.x2 = 0;
        xCrosshairLine.stroke = xLine.stroke;
        xCrosshairLine.strokeWidth = (_a = xLine.strokeWidth) !== null && _a !== void 0 ? _a : 1;
        xCrosshairLine.lineCap = xLine.lineCap === 'round' || xLine.lineCap === 'square' ? xLine.lineCap : undefined;
        const { lineDash } = xLine;
        xCrosshairLine.lineDash = Array.isArray(lineDash)
            ? lineDash
            : getLineDash(xCrosshairLine.lineCap, xLine.lineDash);
        xCrosshairLine.translationX = highlightedDatum.point.x;
    }
    updateYCrosshairLine() {
        var _a;
        const { xScale, yCrosshairLine, highlightedDatum, crosshairs: { yLine }, } = this;
        if (!yLine.enabled || highlightedDatum == undefined) {
            yCrosshairLine.strokeWidth = 0;
            return;
        }
        yCrosshairLine.x1 = xScale.range[0];
        yCrosshairLine.x2 = xScale.range[1];
        yCrosshairLine.y1 = yCrosshairLine.y2 = 0;
        yCrosshairLine.stroke = yLine.stroke;
        yCrosshairLine.strokeWidth = (_a = yLine.strokeWidth) !== null && _a !== void 0 ? _a : 1;
        yCrosshairLine.lineCap = yLine.lineCap === 'round' || yLine.lineCap === 'square' ? yLine.lineCap : undefined;
        const { lineDash } = yLine;
        yCrosshairLine.lineDash = Array.isArray(lineDash)
            ? lineDash
            : getLineDash(yCrosshairLine.lineCap, yLine.lineDash);
        yCrosshairLine.translationY = highlightedDatum.point.y;
    }
    getTooltipHtml(datum) {
        var _a, _b;
        const { dataType } = this;
        const { seriesDatum } = datum;
        const yValue = seriesDatum.y;
        const xValue = seriesDatum.x;
        const content = this.formatNumericDatum(yValue);
        const title = dataType === 'array' || dataType === 'object' ? this.formatDatum(xValue) : undefined;
        const defaults = {
            content,
            title,
        };
        const tooltipRenderer = (_b = (_a = this.processedOptions) === null || _a === void 0 ? void 0 : _a.tooltip) === null || _b === void 0 ? void 0 : _b.renderer;
        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
                context: this.context,
                datum: seriesDatum,
                yValue,
                xValue,
            }), defaults);
        }
        return toTooltipHtml(defaults);
    }
}
AreaSparkline.className = 'AreaSparkline';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJlYVNwYXJrbGluZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zcGFya2xpbmUvYXJlYS9hcmVhU3BhcmtsaW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRTVELE9BQU8sRUFBMEIsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDNUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3BELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUVsRCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxNQUFNLENBQUM7QUFRN0IsTUFBTSxlQUFlO0lBQXJCO1FBQ0ksWUFBTyxHQUFZLElBQUksQ0FBQztRQUN4QixVQUFLLEdBQVcsUUFBUSxDQUFDO1FBQ3pCLFNBQUksR0FBVyxDQUFDLENBQUM7UUFDakIsU0FBSSxHQUFZLG9CQUFvQixDQUFDO1FBQ3JDLFdBQU0sR0FBWSxvQkFBb0IsQ0FBQztRQUN2QyxnQkFBVyxHQUFXLENBQUMsQ0FBQztRQUN4QixjQUFTLEdBQXFELFNBQVMsQ0FBQztJQUM1RSxDQUFDO0NBQUE7QUFFRCxNQUFNLGFBQWE7SUFBbkI7UUFDSSxXQUFNLEdBQVcsb0JBQW9CLENBQUM7UUFDdEMsZ0JBQVcsR0FBVyxDQUFDLENBQUM7SUFDNUIsQ0FBQztDQUFBO0FBRUQsTUFBTSxtQkFBbUI7SUFBekI7UUFDSSxVQUFLLEdBQXlCO1lBQzFCLE9BQU8sRUFBRSxJQUFJO1lBQ2IsTUFBTSxFQUFFLG1CQUFtQjtZQUMzQixXQUFXLEVBQUUsQ0FBQztZQUNkLFFBQVEsRUFB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