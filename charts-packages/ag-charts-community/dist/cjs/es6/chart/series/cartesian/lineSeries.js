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
const continuousScale_1 = require("../../../scale/continuousScale");
const series_1 = require("../series");
const array_1 = require("../../../util/array");
const node_1 = require("../../../scene/node");
const text_1 = require("../../../scene/shape/text");
const cartesianSeries_1 = require("./cartesianSeries");
const chartAxis_1 = require("../../chartAxis");
const util_1 = require("../../marker/util");
const tooltip_1 = require("../../tooltip/tooltip");
const string_1 = require("../../../util/string");
const label_1 = require("../../label");
const sanitize_1 = require("../../../util/sanitize");
const value_1 = require("../../../util/value");
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
exports.LineSeriesTooltip = LineSeriesTooltip;
class LineSeries extends cartesianSeries_1.CartesianSeries {
    constructor() {
        super({
            pickGroupIncludes: ['markers'],
            features: ['markers'],
            pickModes: [
                series_1.SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST,
                series_1.SeriesNodePickMode.NEAREST_NODE,
                series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH,
            ],
        });
        this.xDomain = [];
        this.yDomain = [];
        this.pointsData = [];
        this.marker = new cartesianSeries_1.CartesianSeriesMarker();
        this.label = new LineSeriesLabel();
        this.title = undefined;
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
        const { marker, label } = this;
        marker.fill = '#c16068';
        marker.stroke = '#874349';
        label.enabled = false;
    }
    setColors(fills, strokes) {
        this.stroke = fills[0];
        this.marker.stroke = strokes[0];
        this.marker.fill = fills[0];
    }
    set xKey(value) {
        this._xKey = value;
        this.pointsData.splice(0);
    }
    get xKey() {
        return this._xKey;
    }
    set yKey(value) {
        this._yKey = value;
        this.pointsData.splice(0);
    }
    get yKey() {
        return this._yKey;
    }
    getDomain(direction) {
        if (direction === chartAxis_1.ChartAxisDirection.X) {
            return this.xDomain;
        }
        return this.yDomain;
    }
    processData() {
        return __awaiter(this, void 0, void 0, function* () {
            const { xAxis, yAxis, xKey, yKey, pointsData } = this;
            const data = xKey && yKey && this.data ? this.data : [];
            if (!xAxis || !yAxis) {
                return;
            }
            const isContinuousX = xAxis.scale instanceof continuousScale_1.ContinuousScale;
            const isContinuousY = yAxis.scale instanceof continuousScale_1.ContinuousScale;
            const xData = [];
            const yData = [];
            pointsData.splice(0);
            for (const datum of data) {
                const x = datum[xKey];
                const y = datum[yKey];
                const xDatum = value_1.checkDatum(x, isContinuousX);
                if (isContinuousX && xDatum === undefined) {
                    continue;
                }
                const yDatum = value_1.checkDatum(y, isContinuousY);
                xData.push(xDatum);
                yData.push(yDatum);
                pointsData.push({
                    xDatum,
                    yDatum,
                    datum,
                });
            }
            this.xDomain = isContinuousX ? this.fixNumericExtent(array_1.extent(xData, value_1.isContinuous), xAxis) : xData;
            this.yDomain = isContinuousY ? this.fixNumericExtent(array_1.extent(yData, value_1.isContinuous), yAxis) : yData;
        });
    }
    createNodeData() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { data, xAxis, yAxis, marker: { enabled: markerEnabled, size: markerSize, strokeWidth }, } = this;
            if (!data || !xAxis || !yAxis) {
                return [];
            }
            const { pointsData, label, yKey, id: seriesId } = this;
            const xScale = xAxis.scale;
            const yScale = yAxis.scale;
            const xOffset = (xScale.bandwidth || 0) / 2;
            const yOffset = (yScale.bandwidth || 0) / 2;
            const nodeData = new Array(data.length);
            const size = markerEnabled ? markerSize : 0;
            let moveTo = true;
            let prevXInRange = undefined;
            let nextPoint = undefined;
            let actualLength = 0;
            for (let i = 0; i < pointsData.length; i++) {
                const point = nextPoint || pointsData[i];
                if (point.yDatum === undefined) {
                    prevXInRange = undefined;
                    moveTo = true;
                }
                else {
                    const { xDatum, yDatum, datum } = point;
                    const x = xScale.convert(xDatum) + xOffset;
                    if (isNaN(x)) {
                        prevXInRange = undefined;
                        moveTo = true;
                        continue;
                    }
                    const tolerance = (xScale.bandwidth || markerSize * 0.5 + (strokeWidth || 0)) + 1;
                    nextPoint = ((_a = pointsData[i + 1]) === null || _a === void 0 ? void 0 : _a.yDatum) === undefined ? undefined : pointsData[i + 1];
                    const xInRange = xAxis.inRangeEx(x, 0, tolerance);
                    const nextXInRange = nextPoint && xAxis.inRangeEx(xScale.convert(nextPoint.xDatum) + xOffset, 0, tolerance);
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
                        labelText = label.formatter({ value: yDatum, seriesId });
                    }
                    else {
                        labelText =
                            typeof yDatum === 'number' && isFinite(yDatum)
                                ? yDatum.toFixed(2)
                                : yDatum
                                    ? String(yDatum)
                                    : '';
                    }
                    nodeData[actualLength++] = {
                        series: this,
                        datum,
                        point: { x, y, moveTo, size },
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
    updatePaths(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { contextData: { nodeData }, paths: [lineNode], } = opts;
            const { path: linePath } = lineNode;
            lineNode.fill = undefined;
            lineNode.lineJoin = 'round';
            lineNode.pointerEvents = node_1.PointerEvents.None;
            linePath.clear({ trackChanges: true });
            for (const data of nodeData) {
                if (data.point.moveTo) {
                    linePath.moveTo(data.point.x, data.point.y);
                }
                else {
                    linePath.lineTo(data.point.x, data.point.y);
                }
            }
            lineNode.checkPathDirty();
        });
    }
    updatePathNodes(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { paths: [lineNode], } = opts;
            lineNode.stroke = this.stroke;
            lineNode.strokeWidth = this.getStrokeWidth(this.strokeWidth);
            lineNode.strokeOpacity = this.strokeOpacity;
            lineNode.lineDash = this.lineDash;
            lineNode.lineDashOffset = this.lineDashOffset;
        });
    }
    updateMarkerSelection(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            let { nodeData, markerSelection } = opts;
            const { marker: { shape, enabled }, } = this;
            nodeData = shape && enabled ? nodeData : [];
            const MarkerShape = util_1.getMarker(shape);
            if (this.marker.isDirty()) {
                markerSelection = markerSelection.setData([]);
                markerSelection.exit.remove();
            }
            const updateMarkerSelection = markerSelection.setData(nodeData);
            updateMarkerSelection.exit.remove();
            const enterDatumSelection = updateMarkerSelection.enter.append(MarkerShape);
            return updateMarkerSelection.merge(enterDatumSelection);
        });
    }
    updateMarkerNodes(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { markerSelection, isHighlight: isDatumHighlighted } = opts;
            const { marker, marker: { fillOpacity: markerFillOpacity }, xKey, yKey, stroke: lineStroke, strokeOpacity, highlightStyle: { fill: deprecatedFill, stroke: deprecatedStroke, strokeWidth: deprecatedStrokeWidth, item: { fill: highlightedFill = deprecatedFill, fillOpacity: highlightFillOpacity = markerFillOpacity, stroke: highlightedStroke = deprecatedStroke, strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth, }, }, id: seriesId, } = this;
            const { size, formatter } = marker;
            const markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : this.strokeWidth;
            markerSelection.each((node, datum) => {
                var _a, _b;
                const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill;
                const fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
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
                        highlighted: isDatumHighlighted,
                        seriesId,
                    });
                }
                node.fill = (format && format.fill) || fill;
                node.stroke = (format && format.stroke) || stroke;
                node.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
                node.fillOpacity = (fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1);
                node.strokeOpacity = (_b = (_a = marker.strokeOpacity, (_a !== null && _a !== void 0 ? _a : strokeOpacity)), (_b !== null && _b !== void 0 ? _b : 1));
                node.size = format && format.size !== undefined ? format.size : size;
                node.translationX = datum.point.x;
                node.translationY = datum.point.y;
                node.visible = node.size > 0;
            });
            if (!isDatumHighlighted) {
                this.marker.markClean();
            }
        });
    }
    updateLabelSelection(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            let { labelData, labelSelection } = opts;
            const { marker: { shape, enabled }, } = this;
            labelData = shape && enabled ? labelData : [];
            const updateTextSelection = labelSelection.setData(labelData);
            updateTextSelection.exit.remove();
            const enterTextSelection = updateTextSelection.enter.append(text_1.Text);
            return updateTextSelection.merge(enterTextSelection);
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
        return new cartesianSeries_1.CartesianSeriesNodeClickEvent(this.xKey, this.yKey, event, datum, this);
    }
    getTooltipHtml(nodeDatum) {
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
                highlighted: false,
                seriesId,
            });
        }
        const color = (format && format.fill) || fill;
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
        var _a, _b, _c;
        const { id, data, xKey, yKey, yName, visible, title, marker, stroke, strokeOpacity } = this;
        if (!(data && data.length && xKey && yKey)) {
            return [];
        }
        return [
            {
                id: id,
                itemId: yKey,
                seriesId: id,
                enabled: visible,
                label: {
                    text: title || yName || yKey,
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill || 'rgba(0, 0, 0, 0)',
                    stroke: marker.stroke || stroke || 'rgba(0, 0, 0, 0)',
                    fillOpacity: (_a = marker.fillOpacity, (_a !== null && _a !== void 0 ? _a : 1)),
                    strokeOpacity: (_c = (_b = marker.strokeOpacity, (_b !== null && _b !== void 0 ? _b : strokeOpacity)), (_c !== null && _c !== void 0 ? _c : 1)),
                },
            },
        ];
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
    validation_1.Validate(validation_1.STRING)
], LineSeries.prototype, "_xKey", void 0);
__decorate([
    validation_1.Validate(validation_1.STRING)
], LineSeries.prototype, "xName", void 0);
__decorate([
    validation_1.Validate(validation_1.STRING)
], LineSeries.prototype, "_yKey", void 0);
__decorate([
    validation_1.Validate(validation_1.STRING)
], LineSeries.prototype, "yName", void 0);
exports.LineSeries = LineSeries;
