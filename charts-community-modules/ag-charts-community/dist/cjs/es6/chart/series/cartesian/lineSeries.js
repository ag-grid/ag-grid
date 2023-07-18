"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineSeries = void 0;
const continuousScale_1 = require("../../../scale/continuousScale");
const series_1 = require("../series");
const array_1 = require("../../../util/array");
const node_1 = require("../../../scene/node");
const cartesianSeries_1 = require("./cartesianSeries");
const chartAxisDirection_1 = require("../../chartAxisDirection");
const util_1 = require("../../marker/util");
const tooltip_1 = require("../../tooltip/tooltip");
const string_1 = require("../../../util/string");
const label_1 = require("../../label");
const sanitize_1 = require("../../../util/sanitize");
const validation_1 = require("../../../util/validation");
class LineSeriesLabel extends label_1.Label {
    constructor() {
        super(...arguments);
        this.formatter = undefined;
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], LineSeriesLabel.prototype, "formatter", void 0);
class LineSeriesTooltip extends series_1.SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
        this.format = undefined;
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], LineSeriesTooltip.prototype, "renderer", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], LineSeriesTooltip.prototype, "format", void 0);
class LineSeries extends cartesianSeries_1.CartesianSeries {
    constructor(moduleCtx) {
        super({
            moduleCtx,
            hasMarkers: true,
            pickModes: [
                series_1.SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST,
                series_1.SeriesNodePickMode.NEAREST_NODE,
                series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH,
            ],
        });
        this.marker = new cartesianSeries_1.CartesianSeriesMarker();
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
    processData(dataController) {
        return __awaiter(this, void 0, void 0, function* () {
            const { axes, xKey = '', yKey = '' } = this;
            const data = xKey && yKey && this.data ? this.data : [];
            const xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
            const yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
            const isContinuousX = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.scale) instanceof continuousScale_1.ContinuousScale;
            const isContinuousY = (yAxis === null || yAxis === void 0 ? void 0 : yAxis.scale) instanceof continuousScale_1.ContinuousScale;
            const { dataModel, processedData } = yield dataController.request(this.id, data !== null && data !== void 0 ? data : [], {
                props: [
                    series_1.valueProperty(this, xKey, isContinuousX, { id: 'xValue' }),
                    series_1.valueProperty(this, yKey, isContinuousY, { id: 'yValue', invalidValue: undefined }),
                ],
                dataVisible: this.visible,
            });
            this.dataModel = dataModel;
            this.processedData = processedData;
        });
    }
    getDomain(direction) {
        const { axes, dataModel, processedData } = this;
        if (!processedData || !dataModel)
            return [];
        const xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
        const yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
        const xDef = dataModel.resolveProcessedDataDefById(this, `xValue`);
        if (direction === chartAxisDirection_1.ChartAxisDirection.X) {
            const domain = dataModel.getDomain(this, `xValue`, 'value', processedData);
            if ((xDef === null || xDef === void 0 ? void 0 : xDef.def.type) === 'value' && xDef.def.valueType === 'category') {
                return domain;
            }
            return this.fixNumericExtent(array_1.extent(domain), xAxis);
        }
        else {
            const domain = dataModel.getDomain(this, `yValue`, 'value', processedData);
            return this.fixNumericExtent(domain, yAxis);
        }
    }
    createNodeData() {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            const { processedData, dataModel, axes, marker: { enabled: markerEnabled, size: markerSize, strokeWidth }, ctx: { callbackCache }, } = this;
            const xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
            const yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
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
            const xIdx = dataModel.resolveProcessedDataIndexById(this, `xValue`).index;
            const yIdx = dataModel.resolveProcessedDataIndexById(this, `yValue`).index;
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
                        nextPoint = undefined;
                        continue;
                    }
                    const tolerance = ((_c = xScale.bandwidth) !== null && _c !== void 0 ? _c : markerSize * 0.5 + (strokeWidth !== null && strokeWidth !== void 0 ? strokeWidth : 0)) + 1;
                    nextPoint =
                        ((_d = processedData.data[i + 1]) === null || _d === void 0 ? void 0 : _d.values[yIdx]) === undefined ? undefined : processedData.data[i + 1];
                    const nextXDatum = (_e = processedData.data[i + 1]) === null || _e === void 0 ? void 0 : _e.values[xIdx];
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
                        yValue: yDatum,
                        xValue: xDatum,
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
        const MarkerShape = util_1.getMarker(shape);
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
        return new cartesianSeries_1.CartesianSeriesNodeClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    }
    getNodeDoubleClickEvent(event, datum) {
        var _a, _b;
        return new cartesianSeries_1.CartesianSeriesNodeDoubleClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    }
    getTooltipHtml(nodeDatum) {
        var _a, _b;
        const { xKey, yKey, axes } = this;
        const xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
        const yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        const { xName, yName, tooltip, marker, id: seriesId } = this;
        const { renderer: tooltipRenderer, format: tooltipFormat } = tooltip;
        const { datum, xValue, yValue } = nodeDatum;
        const xString = xAxis.formatDatum(xValue);
        const yString = yAxis.formatDatum(yValue);
        const title = sanitize_1.sanitizeHtml((_a = this.title) !== null && _a !== void 0 ? _a : yName);
        const content = sanitize_1.sanitizeHtml(xString + ': ' + yString);
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
                return tooltip_1.toTooltipHtml({
                    content: string_1.interpolate(tooltipFormat, params),
                }, defaults);
            }
            if (tooltipRenderer) {
                return tooltip_1.toTooltipHtml(tooltipRenderer(params), defaults);
            }
        }
        return tooltip_1.toTooltipHtml(defaults);
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
    animateEmptyUpdateReady({ markerSelections, labelSelections, contextData, paths, }) {
        contextData.forEach(({ nodeData }, contextDataIndex) => {
            var _a, _b, _c;
            const [lineNode] = paths[contextDataIndex];
            const { path: linePath } = lineNode;
            const nodeLengths = [0];
            const lineLength = nodeData.reduce((sum, datum, index) => {
                if (index === 0)
                    return sum;
                const prev = nodeData[index - 1];
                if (isNaN(datum.point.x) || isNaN(datum.point.y) || isNaN(prev.point.x) || isNaN(prev.point.y)) {
                    nodeLengths.push(sum);
                    return sum;
                }
                const length = Math.sqrt(Math.pow(datum.point.x - prev.point.x, 2) + Math.pow(datum.point.y - prev.point.y, 2));
                nodeLengths.push(sum + length);
                return sum + length;
            }, 0);
            lineNode.fill = undefined;
            lineNode.lineJoin = 'round';
            lineNode.pointerEvents = node_1.PointerEvents.None;
            lineNode.stroke = this.stroke;
            lineNode.strokeWidth = this.getStrokeWidth(this.strokeWidth);
            lineNode.strokeOpacity = this.strokeOpacity;
            lineNode.lineDash = this.lineDash;
            lineNode.lineDashOffset = this.lineDashOffset;
            const duration = (_b = (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.defaultOptions.duration) !== null && _b !== void 0 ? _b : 1000;
            const markerDuration = 200;
            const animationOptions = {
                from: 0,
                to: lineLength,
            };
            (_c = this.ctx.animationManager) === null || _c === void 0 ? void 0 : _c.animate(`${this.id}_empty-update-ready`, Object.assign(Object.assign({}, animationOptions), { duration,
                onUpdate(length) {
                    linePath.clear({ trackChanges: true });
                    nodeData.forEach((datum, index) => {
                        if (nodeLengths[index] <= length) {
                            // Draw/move the full segment if past the end of this segment
                            if (datum.point.moveTo) {
                                linePath.moveTo(datum.point.x, datum.point.y);
                            }
                            else {
                                linePath.lineTo(datum.point.x, datum.point.y);
                            }
                        }
                        else if (index > 0 && nodeLengths[index - 1] < length) {
                            // Draw/move partial line if in between the start and end of this segment
                            const start = nodeData[index - 1].point;
                            const end = datum.point;
                            const segmentLength = nodeLengths[index] - nodeLengths[index - 1];
                            const remainingLength = nodeLengths[index] - length;
                            const ratio = (segmentLength - remainingLength) / segmentLength;
                            const x = (1 - ratio) * start.x + ratio * end.x;
                            const y = (1 - ratio) * start.y + ratio * end.y;
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
            markerSelections[contextDataIndex].each((marker, datum, index) => {
                var _a, _b, _c, _d;
                const delay = lineLength > 0 ? (nodeLengths[index] / lineLength) * duration : 0;
                const format = this.animateFormatter(datum);
                const size = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
                (_c = this.ctx.animationManager) === null || _c === void 0 ? void 0 : _c.animate(`${this.id}_empty-update-ready_${marker.id}`, Object.assign(Object.assign({}, animationOptions), { to: (_d = format === null || format === void 0 ? void 0 : format.size) !== null && _d !== void 0 ? _d : size, delay, duration: markerDuration, onUpdate(size) {
                        marker.size = size;
                    } }));
            });
            labelSelections[contextDataIndex].each((label, _, index) => {
                var _a;
                const delay = (nodeLengths[index] / lineLength) * duration;
                (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animate(`${this.id}_empty-update-ready_${label.id}`, {
                    from: 0,
                    to: 1,
                    delay,
                    duration: markerDuration,
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
        (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.reset();
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
    validation_1.Validate(validation_1.OPT_STRING)
], LineSeries.prototype, "title", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_COLOR_STRING)
], LineSeries.prototype, "stroke", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_LINE_DASH)
], LineSeries.prototype, "lineDash", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], LineSeries.prototype, "lineDashOffset", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], LineSeries.prototype, "strokeWidth", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0, 1))
], LineSeries.prototype, "strokeOpacity", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], LineSeries.prototype, "xKey", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], LineSeries.prototype, "xName", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], LineSeries.prototype, "yKey", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], LineSeries.prototype, "yName", void 0);
exports.LineSeries = LineSeries;
