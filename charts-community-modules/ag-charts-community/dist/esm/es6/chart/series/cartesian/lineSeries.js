var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ContinuousScale } from '../../../scale/continuousScale';
import { SeriesTooltip, SeriesNodePickMode, valueProperty } from '../series';
import { extent } from '../../../util/array';
import { PointerEvents } from '../../../scene/node';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesNodeClickEvent, CartesianSeriesNodeDoubleClickEvent, } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { getMarker } from '../../marker/util';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { interpolate } from '../../../util/string';
import { Label } from '../../label';
import { sanitizeHtml } from '../../../util/sanitize';
import { NUMBER, OPT_FUNCTION, OPT_LINE_DASH, OPT_STRING, OPT_COLOR_STRING, Validate } from '../../../util/validation';
import { DataModel } from '../../data/dataModel';
import * as easing from '../../../motion/easing';
class LineSeriesLabel extends Label {
    constructor() {
        super(...arguments);
        this.formatter = undefined;
    }
}
__decorate([
    Validate(OPT_FUNCTION)
], LineSeriesLabel.prototype, "formatter", void 0);
class LineSeriesTooltip extends SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
        this.format = undefined;
    }
}
__decorate([
    Validate(OPT_FUNCTION)
], LineSeriesTooltip.prototype, "renderer", void 0);
__decorate([
    Validate(OPT_STRING)
], LineSeriesTooltip.prototype, "format", void 0);
export class LineSeries extends CartesianSeries {
    constructor(moduleCtx) {
        super({
            moduleCtx,
            hasMarkers: true,
            pickModes: [
                SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST,
                SeriesNodePickMode.NEAREST_NODE,
                SeriesNodePickMode.EXACT_SHAPE_MATCH,
            ],
        });
        this.marker = new CartesianSeriesMarker();
        this.label = new LineSeriesLabel();
        this.title = undefined;
        this.stroke = '#874349';
        this.lineDash = [0];
        this.lineDashOffset = 0;
        this.strokeWidth = 2;
        this.strokeOpacity = 1;
        this.tooltip = new LineSeriesTooltip();
        this.xKey = undefined;
        this.xName = undefined;
        this.yKey = undefined;
        this.yName = undefined;
        const { marker, label } = this;
        marker.fill = '#c16068';
        marker.stroke = '#874349';
        label.enabled = false;
    }
    processData() {
        return __awaiter(this, void 0, void 0, function* () {
            const { xAxis, yAxis, xKey = '', yKey = '' } = this;
            const data = xKey && yKey && this.data ? this.data : [];
            const isContinuousX = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.scale) instanceof ContinuousScale;
            const isContinuousY = (yAxis === null || yAxis === void 0 ? void 0 : yAxis.scale) instanceof ContinuousScale;
            this.dataModel = new DataModel({
                props: [
                    valueProperty(xKey, isContinuousX, { id: 'xValue' }),
                    valueProperty(yKey, isContinuousY, { id: 'yValue', invalidValue: undefined }),
                ],
                dataVisible: this.visible,
            });
            this.processedData = this.dataModel.processData(data !== null && data !== void 0 ? data : []);
        });
    }
    getDomain(direction) {
        const { xAxis, yAxis, dataModel, processedData } = this;
        if (!processedData || !dataModel)
            return [];
        const xDef = dataModel.resolveProcessedDataDefById(`xValue`);
        if (direction === ChartAxisDirection.X) {
            const domain = dataModel.getDomain(`xValue`, processedData);
            if ((xDef === null || xDef === void 0 ? void 0 : xDef.valueType) === 'category') {
                return domain;
            }
            return this.fixNumericExtent(extent(domain), xAxis);
        }
        else {
            const domain = dataModel.getDomain(`yValue`, processedData);
            return this.fixNumericExtent(domain, yAxis);
        }
    }
    createNodeData() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __awaiter(this, void 0, void 0, function* () {
            const { processedData, dataModel, xAxis, yAxis, marker: { enabled: markerEnabled, size: markerSize, strokeWidth }, ctx: { callbackCache }, } = this;
            if (!processedData || !dataModel || !xAxis || !yAxis) {
                return [];
            }
            const { label, yKey = '', xKey = '', id: seriesId } = this;
            const xScale = xAxis.scale;
            const yScale = yAxis.scale;
            const xOffset = ((_a = xScale.bandwidth) !== null && _a !== void 0 ? _a : 0) / 2;
            const yOffset = ((_b = yScale.bandwidth) !== null && _b !== void 0 ? _b : 0) / 2;
            const nodeData = new Array(processedData.data.length);
            const size = markerEnabled ? markerSize : 0;
            const xIdx = (_e = (_d = (_c = this.dataModel) === null || _c === void 0 ? void 0 : _c.resolveProcessedDataIndexById(`xValue`)) === null || _d === void 0 ? void 0 : _d.index) !== null && _e !== void 0 ? _e : -1;
            const yIdx = (_h = (_g = (_f = this.dataModel) === null || _f === void 0 ? void 0 : _f.resolveProcessedDataIndexById(`yValue`)) === null || _g === void 0 ? void 0 : _g.index) !== null && _h !== void 0 ? _h : -1;
            let moveTo = true;
            let prevXInRange = undefined;
            let nextPoint = undefined;
            let actualLength = 0;
            for (let i = 0; i < processedData.data.length; i++) {
                const { datum, values } = nextPoint !== null && nextPoint !== void 0 ? nextPoint : processedData.data[i];
                const xDatum = values[xIdx];
                const yDatum = values[yIdx];
                if (yDatum === undefined) {
                    prevXInRange = undefined;
                    moveTo = true;
                }
                else {
                    const x = xScale.convert(xDatum) + xOffset;
                    if (isNaN(x)) {
                        prevXInRange = undefined;
                        moveTo = true;
                        continue;
                    }
                    const tolerance = ((_j = xScale.bandwidth) !== null && _j !== void 0 ? _j : markerSize * 0.5 + (strokeWidth !== null && strokeWidth !== void 0 ? strokeWidth : 0)) + 1;
                    nextPoint =
                        ((_k = processedData.data[i + 1]) === null || _k === void 0 ? void 0 : _k.values[yIdx]) === undefined ? undefined : processedData.data[i + 1];
                    const nextXDatum = (_l = processedData.data[i + 1]) === null || _l === void 0 ? void 0 : _l.values[xIdx];
                    const xInRange = xAxis.inRangeEx(x, 0, tolerance);
                    const nextXInRange = nextPoint && xAxis.inRangeEx(xScale.convert(nextXDatum) + xOffset, 0, tolerance);
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
                    let labelText;
                    if (label.formatter) {
                        labelText = callbackCache.call(label.formatter, { value: yDatum, seriesId });
                    }
                    if (labelText !== undefined) {
                        // Label retrieved from formatter successfully.
                    }
                    else if (typeof yDatum === 'number' && isFinite(yDatum)) {
                        labelText = yDatum.toFixed(2);
                    }
                    else if (yDatum) {
                        labelText = String(yDatum);
                    }
                    nodeData[actualLength++] = {
                        series: this,
                        datum,
                        yKey,
                        xKey,
                        point: { x, y, moveTo, size },
                        nodeMidPoint: { x, y },
                        label: labelText
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
                    };
                    moveTo = false;
                }
            }
            nodeData.length = actualLength;
            return [{ itemId: yKey, nodeData, labelData: nodeData }];
        });
    }
    isPathOrSelectionDirty() {
        return this.marker.isDirty();
    }
    markerFactory() {
        const { shape } = this.marker;
        const MarkerShape = getMarker(shape);
        return new MarkerShape();
    }
    updateMarkerSelection(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            let { nodeData } = opts;
            const { markerSelection } = opts;
            const { shape, enabled } = this.marker;
            nodeData = shape && enabled ? nodeData : [];
            if (this.marker.isDirty()) {
                markerSelection.clear();
            }
            return markerSelection.update(nodeData);
        });
    }
    updateMarkerNodes(opts) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { markerSelection, isHighlight: isDatumHighlighted } = opts;
            const { marker, marker: { fillOpacity: markerFillOpacity }, xKey = '', yKey = '', stroke: lineStroke, strokeOpacity, highlightStyle: { item: { fill: highlightedFill, fillOpacity: highlightFillOpacity = markerFillOpacity, stroke: highlightedStroke, strokeWidth: highlightedDatumStrokeWidth, }, }, id: seriesId, ctx: { callbackCache }, } = this;
            const { size, formatter } = marker;
            const markerStrokeWidth = (_a = marker.strokeWidth) !== null && _a !== void 0 ? _a : this.strokeWidth;
            const customMarker = typeof marker.shape === 'function';
            markerSelection.each((node, datum) => {
                var _a, _b, _c, _d, _e, _f, _g;
                const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill;
                const fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
                const stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : (_a = marker.stroke) !== null && _a !== void 0 ? _a : lineStroke;
                const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : markerStrokeWidth;
                let format = undefined;
                if (formatter) {
                    format = callbackCache.call(formatter, {
                        datum: datum.datum,
                        xKey,
                        yKey,
                        fill,
                        stroke,
                        strokeWidth,
                        size,
                        highlighted: isDatumHighlighted,
                        seriesId,
                    });
                }
                node.fill = (_b = format === null || format === void 0 ? void 0 : format.fill) !== null && _b !== void 0 ? _b : fill;
                node.stroke = (_c = format === null || format === void 0 ? void 0 : format.stroke) !== null && _c !== void 0 ? _c : stroke;
                node.strokeWidth = (_d = format === null || format === void 0 ? void 0 : format.strokeWidth) !== null && _d !== void 0 ? _d : strokeWidth;
                node.fillOpacity = fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1;
                node.strokeOpacity = (_f = (_e = marker.strokeOpacity) !== null && _e !== void 0 ? _e : strokeOpacity) !== null && _f !== void 0 ? _f : 1;
                node.size = (_g = format === null || format === void 0 ? void 0 : format.size) !== null && _g !== void 0 ? _g : size;
                node.translationX = datum.point.x;
                node.translationY = datum.point.y;
                node.visible = node.size > 0 && !isNaN(datum.point.x) && !isNaN(datum.point.y);
                if (!customMarker || node.dirtyPath) {
                    return;
                }
                // Only for cutom marker shapes
                node.path.clear({ trackChanges: true });
                node.updatePath();
                node.checkPathDirty();
            });
            if (!isDatumHighlighted) {
                this.marker.markClean();
            }
        });
    }
    updateLabelSelection(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            let { labelData } = opts;
            const { labelSelection } = opts;
            const { shape, enabled } = this.marker;
            labelData = shape && enabled ? labelData : [];
            return labelSelection.update(labelData);
        });
    }
    updateLabelNodes(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { labelSelection } = opts;
            const { enabled: labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color } = this.label;
            labelSelection.each((text, datum) => {
                const { point, label } = datum;
                if (datum && label && labelEnabled) {
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
        });
    }
    getNodeClickEvent(event, datum) {
        var _a, _b;
        return new CartesianSeriesNodeClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    }
    getNodeDoubleClickEvent(event, datum) {
        var _a, _b;
        return new CartesianSeriesNodeDoubleClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    }
    getTooltipHtml(nodeDatum) {
        var _a, _b;
        const { xKey, yKey, xAxis, yAxis } = this;
        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        const { xName, yName, tooltip, marker, id: seriesId } = this;
        const { renderer: tooltipRenderer, format: tooltipFormat } = tooltip;
        const datum = nodeDatum.datum;
        const xValue = datum[xKey];
        const yValue = datum[yKey];
        const xString = xAxis.formatDatum(xValue);
        const yString = yAxis.formatDatum(yValue);
        const title = sanitizeHtml((_a = this.title) !== null && _a !== void 0 ? _a : yName);
        const content = sanitizeHtml(xString + ': ' + yString);
        const { formatter: markerFormatter, fill, stroke, strokeWidth: markerStrokeWidth, size } = marker;
        const strokeWidth = markerStrokeWidth !== null && markerStrokeWidth !== void 0 ? markerStrokeWidth : this.strokeWidth;
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
                seriesId,
            });
        }
        const color = (_b = format === null || format === void 0 ? void 0 : format.fill) !== null && _b !== void 0 ? _b : fill;
        const defaults = {
            title,
            backgroundColor: color,
            content,
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
                color,
                seriesId,
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
    getLegendData() {
        var _a, _b, _c, _d, _e, _f, _g;
        const { id, data, xKey, yKey, yName, visible, title, marker, stroke, strokeOpacity } = this;
        if (!((data === null || data === void 0 ? void 0 : data.length) && xKey && yKey)) {
            return [];
        }
        const legendData = [
            {
                legendType: 'category',
                id: id,
                itemId: yKey,
                seriesId: id,
                enabled: visible,
                label: {
                    text: (_a = title !== null && title !== void 0 ? title : yName) !== null && _a !== void 0 ? _a : yKey,
                },
                marker: {
                    shape: marker.shape,
                    fill: (_b = marker.fill) !== null && _b !== void 0 ? _b : 'rgba(0, 0, 0, 0)',
                    stroke: (_d = (_c = marker.stroke) !== null && _c !== void 0 ? _c : stroke) !== null && _d !== void 0 ? _d : 'rgba(0, 0, 0, 0)',
                    fillOpacity: (_e = marker.fillOpacity) !== null && _e !== void 0 ? _e : 1,
                    strokeOpacity: (_g = (_f = marker.strokeOpacity) !== null && _f !== void 0 ? _f : strokeOpacity) !== null && _g !== void 0 ? _g : 1,
                },
            },
        ];
        return legendData;
    }
    animateEmptyUpdateReady({ markerSelections, labelSelections, contextData, paths, seriesRect, }) {
        contextData.forEach(({ nodeData }, contextDataIndex) => {
            var _a, _b;
            const [lineNode] = paths[contextDataIndex];
            const { path: linePath } = lineNode;
            lineNode.fill = undefined;
            lineNode.lineJoin = 'round';
            lineNode.pointerEvents = PointerEvents.None;
            lineNode.stroke = this.stroke;
            lineNode.strokeWidth = this.getStrokeWidth(this.strokeWidth);
            lineNode.strokeOpacity = this.strokeOpacity;
            lineNode.lineDash = this.lineDash;
            lineNode.lineDashOffset = this.lineDashOffset;
            const duration = 1000;
            const markerDuration = 200;
            const animationOptions = {
                from: 0,
                to: (_a = seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width) !== null && _a !== void 0 ? _a : 0,
                disableInteractions: true,
                ease: easing.linear,
                repeat: 0,
            };
            (_b = this.animationManager) === null || _b === void 0 ? void 0 : _b.animate(`${this.id}_empty-update-ready`, Object.assign(Object.assign({}, animationOptions), { duration,
                onUpdate(xValue) {
                    linePath.clear({ trackChanges: true });
                    nodeData.forEach((datum, index) => {
                        if (datum.point.x <= xValue) {
                            // Draw/move the full segment if past the end of this segment
                            if (datum.point.moveTo) {
                                linePath.moveTo(datum.point.x, datum.point.y);
                            }
                            else {
                                linePath.lineTo(datum.point.x, datum.point.y);
                            }
                        }
                        else if (index > 0 && nodeData[index - 1].point.x < xValue) {
                            // Draw/move partial line if in between the start and end of this segment
                            const start = nodeData[index - 1].point;
                            const end = datum.point;
                            const x = xValue;
                            const y = start.y + ((x - start.x) * (end.y - start.y)) / (end.x - start.x);
                            if (datum.point.moveTo) {
                                linePath.moveTo(x, y);
                            }
                            else {
                                linePath.lineTo(x, y);
                            }
                        }
                    });
                    lineNode.checkPathDirty();
                } }));
            markerSelections[contextDataIndex].each((marker, datum) => {
                var _a, _b, _c, _d;
                const delay = (seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width) ? (datum.point.x / seriesRect.width) * duration : 0;
                const format = this.animateFormatter(datum);
                const size = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
                (_c = this.animationManager) === null || _c === void 0 ? void 0 : _c.animate(`${this.id}_empty-update-ready_${marker.id}`, Object.assign(Object.assign({}, animationOptions), { to: (_d = format === null || format === void 0 ? void 0 : format.size) !== null && _d !== void 0 ? _d : size, delay, duration: markerDuration, onUpdate(size) {
                        marker.size = size;
                    } }));
            });
            labelSelections[contextDataIndex].each((label, datum) => {
                var _a;
                const delay = (seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width) ? (datum.point.x / seriesRect.width) * duration : 0;
                (_a = this.animationManager) === null || _a === void 0 ? void 0 : _a.animate(`${this.id}_empty-update-ready_${label.id}`, {
                    from: 0,
                    to: 1,
                    delay,
                    duration: markerDuration,
                    ease: easing.linear,
                    repeat: 0,
                    onUpdate: (opacity) => {
                        label.opacity = opacity;
                    },
                });
            });
        });
    }
    animateReadyUpdate(data) {
        this.resetMarkersAndPaths(data);
    }
    animateReadyResize(data) {
        var _a;
        (_a = this.animationManager) === null || _a === void 0 ? void 0 : _a.stop();
        this.resetMarkersAndPaths(data);
    }
    resetMarkersAndPaths({ markerSelections, contextData, paths, }) {
        contextData.forEach(({ nodeData }, contextDataIndex) => {
            const [lineNode] = paths[contextDataIndex];
            const { path: linePath } = lineNode;
            lineNode.stroke = this.stroke;
            lineNode.strokeWidth = this.getStrokeWidth(this.strokeWidth);
            lineNode.strokeOpacity = this.strokeOpacity;
            lineNode.lineDash = this.lineDash;
            lineNode.lineDashOffset = this.lineDashOffset;
            linePath.clear({ trackChanges: true });
            nodeData.forEach((datum) => {
                if (datum.point.moveTo) {
                    linePath.moveTo(datum.point.x, datum.point.y);
                }
                else {
                    linePath.lineTo(datum.point.x, datum.point.y);
                }
            });
            lineNode.checkPathDirty();
            markerSelections[contextDataIndex].each((marker, datum) => {
                var _a, _b, _c;
                const format = this.animateFormatter(datum);
                const size = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
                marker.size = (_c = format === null || format === void 0 ? void 0 : format.size) !== null && _c !== void 0 ? _c : size;
            });
        });
    }
    animateFormatter(datum) {
        var _a, _b;
        const { marker, xKey = '', yKey = '', stroke: lineStroke, id: seriesId, ctx: { callbackCache }, } = this;
        const { size, formatter } = marker;
        const fill = marker.fill;
        const stroke = (_a = marker.stroke) !== null && _a !== void 0 ? _a : lineStroke;
        const strokeWidth = (_b = marker.strokeWidth) !== null && _b !== void 0 ? _b : this.strokeWidth;
        let format = undefined;
        if (formatter) {
            format = callbackCache.call(formatter, {
                datum: datum.datum,
                xKey,
                yKey,
                fill,
                stroke,
                strokeWidth,
                size,
                highlighted: false,
                seriesId,
            });
        }
        return format;
    }
    isLabelEnabled() {
        return this.label.enabled;
    }
}
LineSeries.className = 'LineSeries';
LineSeries.type = 'line';
__decorate([
    Validate(OPT_STRING)
], LineSeries.prototype, "title", void 0);
__decorate([
    Validate(OPT_COLOR_STRING)
], LineSeries.prototype, "stroke", void 0);
__decorate([
    Validate(OPT_LINE_DASH)
], LineSeries.prototype, "lineDash", void 0);
__decorate([
    Validate(NUMBER(0))
], LineSeries.prototype, "lineDashOffset", void 0);
__decorate([
    Validate(NUMBER(0))
], LineSeries.prototype, "strokeWidth", void 0);
__decorate([
    Validate(NUMBER(0, 1))
], LineSeries.prototype, "strokeOpacity", void 0);
__decorate([
    Validate(OPT_STRING)
], LineSeries.prototype, "xKey", void 0);
__decorate([
    Validate(OPT_STRING)
], LineSeries.prototype, "xName", void 0);
__decorate([
    Validate(OPT_STRING)
], LineSeries.prototype, "yKey", void 0);
__decorate([
    Validate(OPT_STRING)
], LineSeries.prototype, "yName", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZVNlcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9zZXJpZXMvY2FydGVzaWFuL2xpbmVTZXJpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRWpFLE9BQU8sRUFBbUIsYUFBYSxFQUF5QixrQkFBa0IsRUFBRSxhQUFhLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDckgsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRTdDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUdwRCxPQUFPLEVBQ0gsZUFBZSxFQUNmLHFCQUFxQixFQUNyQiw2QkFBNkIsRUFFN0IsbUNBQW1DLEdBQ3RDLE1BQU0sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUN0RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFdEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQVN2SCxPQUFPLEVBQUUsU0FBUyxFQUFxQixNQUFNLHNCQUFzQixDQUFDO0FBQ3BFLE9BQU8sS0FBSyxNQUFNLE1BQU0sd0JBQXdCLENBQUM7QUFtQmpELE1BQU0sZUFBZ0IsU0FBUSxLQUFL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