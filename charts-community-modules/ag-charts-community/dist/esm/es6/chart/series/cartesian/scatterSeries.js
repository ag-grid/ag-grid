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
import { SeriesTooltip, SeriesNodePickMode } from '../series';
import { extent } from '../../../util/array';
import { LinearScale } from '../../../scale/linearScale';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesNodeBaseClickEvent } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { getMarker } from '../../marker/util';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { ContinuousScale } from '../../../scale/continuousScale';
import { sanitizeHtml } from '../../../util/sanitize';
import { Label } from '../../label';
import { HdpiCanvas } from '../../../canvas/hdpiCanvas';
import { checkDatum } from '../../../util/value';
import { OPT_FUNCTION, OPT_STRING, STRING, Validate } from '../../../util/validation';
class ScatterSeriesNodeBaseClickEvent extends CartesianSeriesNodeBaseClickEvent {
    constructor(sizeKey, xKey, yKey, nativeEvent, datum, series) {
        super(xKey, yKey, nativeEvent, datum, series);
        this.sizeKey = sizeKey;
    }
}
export class ScatterSeriesNodeClickEvent extends ScatterSeriesNodeBaseClickEvent {
    constructor() {
        super(...arguments);
        this.type = 'nodeClick';
    }
}
export class ScatterSeriesNodeDoubleClickEvent extends ScatterSeriesNodeBaseClickEvent {
    constructor() {
        super(...arguments);
        this.type = 'nodeDoubleClick';
    }
}
class ScatterSeriesTooltip extends SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
    }
}
__decorate([
    Validate(OPT_FUNCTION)
], ScatterSeriesTooltip.prototype, "renderer", void 0);
export class ScatterSeries extends CartesianSeries {
    constructor() {
        super({
            pickModes: [
                SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST,
                SeriesNodePickMode.NEAREST_NODE,
                SeriesNodePickMode.EXACT_SHAPE_MATCH,
            ],
            pathsPerSeries: 0,
            hasMarkers: true,
        });
        this.xDomain = [];
        this.yDomain = [];
        this.xData = [];
        this.yData = [];
        this.validData = [];
        this.sizeData = [];
        this.sizeScale = new LinearScale();
        this.marker = new CartesianSeriesMarker();
        this.label = new Label();
        this.title = undefined;
        this.labelKey = undefined;
        this.xName = '';
        this.yName = '';
        this.sizeName = 'Size';
        this.labelName = 'Label';
        this._xKey = '';
        this._yKey = '';
        this._sizeKey = undefined;
        this.tooltip = new ScatterSeriesTooltip();
        const { label } = this;
        label.enabled = false;
    }
    set xKey(value) {
        this._xKey = value;
        this.xData = [];
    }
    get xKey() {
        return this._xKey;
    }
    set yKey(value) {
        this._yKey = value;
        this.yData = [];
    }
    get yKey() {
        return this._yKey;
    }
    set sizeKey(value) {
        this._sizeKey = value;
        this.sizeData = [];
    }
    get sizeKey() {
        return this._sizeKey;
    }
    processData() {
        return __awaiter(this, void 0, void 0, function* () {
            const { xKey, yKey, sizeKey, xAxis, yAxis, marker } = this;
            if (!xAxis || !yAxis) {
                return;
            }
            const data = xKey && yKey && this.data ? this.data : [];
            const xScale = xAxis.scale;
            const yScale = yAxis.scale;
            const isContinuousX = xScale instanceof ContinuousScale;
            const isContinuousY = yScale instanceof ContinuousScale;
            this.validData = data.filter((d) => checkDatum(d[xKey], isContinuousX) !== undefined && checkDatum(d[yKey], isContinuousY) !== undefined);
            this.xData = this.validData.map((d) => d[xKey]);
            this.yData = this.validData.map((d) => d[yKey]);
            this.validateXYData(this.xKey, this.yKey, data, xAxis, yAxis, this.xData, this.yData, 1);
            this.sizeData = sizeKey ? this.validData.map((d) => d[sizeKey]) : [];
            this.sizeScale.domain = marker.domain ? marker.domain : extent(this.sizeData) || [1, 1];
            if (xAxis.scale instanceof ContinuousScale) {
                this.xDomain = this.fixNumericExtent(extent(this.xData), xAxis);
            }
            else {
                this.xDomain = this.xData;
            }
            if (yAxis.scale instanceof ContinuousScale) {
                this.yDomain = this.fixNumericExtent(extent(this.yData), yAxis);
            }
            else {
                this.yDomain = this.yData;
            }
        });
    }
    getDomain(direction) {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        }
        else {
            return this.yDomain;
        }
    }
    getNodeClickEvent(event, datum) {
        return new ScatterSeriesNodeClickEvent(this.sizeKey, this.xKey, this.yKey, event, datum, this);
    }
    getNodeDoubleClickEvent(event, datum) {
        return new ScatterSeriesNodeDoubleClickEvent(this.sizeKey, this.xKey, this.yKey, event, datum, this);
    }
    createNodeData() {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, visible, xAxis, yAxis, yKey, label, labelKey } = this;
            if (!(data && visible && xAxis && yAxis)) {
                return [];
            }
            const xScale = xAxis.scale;
            const yScale = yAxis.scale;
            const isContinuousX = xScale instanceof ContinuousScale;
            const isContinuousY = yScale instanceof ContinuousScale;
            const xOffset = (xScale.bandwidth || 0) / 2;
            const yOffset = (yScale.bandwidth || 0) / 2;
            const { xData, yData, validData, sizeData, sizeScale, marker } = this;
            const nodeData = new Array(xData.length);
            sizeScale.range = [marker.size, marker.maxSize];
            const font = label.getFont();
            let actualLength = 0;
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
                const text = labelKey ? String(validData[i][labelKey]) : '';
                const size = HdpiCanvas.getTextSize(text, font);
                const markerSize = sizeData.length ? sizeScale.convert(sizeData[i]) : marker.size;
                nodeData[actualLength++] = {
                    series: this,
                    itemId: yKey,
                    datum: validData[i],
                    point: { x, y, size: markerSize },
                    label: Object.assign({ text }, size),
                };
            }
            nodeData.length = actualLength;
            return [{ itemId: this.yKey, nodeData, labelData: nodeData }];
        });
    }
    isPathOrSelectionDirty() {
        return this.marker.isDirty();
    }
    getLabelData() {
        var _a;
        return (_a = this.contextNodeData) === null || _a === void 0 ? void 0 : _a.reduce((r, n) => r.concat(n.labelData), []);
    }
    markerFactory() {
        const { shape } = this.marker;
        const MarkerShape = getMarker(shape);
        return new MarkerShape();
    }
    updateMarkerSelection(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nodeData, markerSelection } = opts;
            const { marker: { enabled }, } = this;
            if (this.marker.isDirty()) {
                markerSelection.clear();
            }
            const data = enabled ? nodeData : [];
            return markerSelection.update(data);
        });
    }
    updateMarkerNodes(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { markerSelection, isHighlight: isDatumHighlighted } = opts;
            const { marker, xKey, yKey, sizeScale, marker: { fillOpacity: markerFillOpacity, strokeOpacity: markerStrokeOpacity, strokeWidth: markerStrokeWidth, }, highlightStyle: { item: { fill: highlightedFill, fillOpacity: highlightFillOpacity = markerFillOpacity, stroke: highlightedStroke, strokeWidth: highlightedDatumStrokeWidth, }, }, id: seriesId, } = this;
            const { formatter } = marker;
            sizeScale.range = [marker.size, marker.maxSize];
            const customMarker = typeof marker.shape === 'function';
            markerSelection.each((node, datum) => {
                var _a, _b, _c, _d, _e, _f, _g;
                const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill;
                const fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
                const stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : marker.stroke;
                const strokeOpacity = markerStrokeOpacity;
                const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : markerStrokeWidth !== null && markerStrokeWidth !== void 0 ? markerStrokeWidth : 1;
                const size = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
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
                node.strokeWidth = (_c = format === null || format === void 0 ? void 0 : format.strokeWidth) !== null && _c !== void 0 ? _c : strokeWidth;
                node.size = format && format.size !== undefined ? format.size : size;
                node.fillOpacity = fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1;
                node.strokeOpacity = strokeOpacity !== null && strokeOpacity !== void 0 ? strokeOpacity : 1;
                node.translationX = (_e = (_d = datum.point) === null || _d === void 0 ? void 0 : _d.x) !== null && _e !== void 0 ? _e : 0;
                node.translationY = (_g = (_f = datum.point) === null || _f === void 0 ? void 0 : _f.y) !== null && _g !== void 0 ? _g : 0;
                node.visible = node.size > 0;
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
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { labelSelection } = opts;
            const { label: { enabled }, } = this;
            const placedLabels = enabled ? (_b = (_a = this.chart) === null || _a === void 0 ? void 0 : _a.placeLabels().get(this)) !== null && _b !== void 0 ? _b : [] : [];
            const placedNodeDatum = placedLabels.map((v) => (Object.assign(Object.assign({}, v.datum), { point: {
                    x: v.x,
                    y: v.y,
                    size: v.datum.point.size,
                } })));
            return labelSelection.update(placedNodeDatum);
        });
    }
    updateLabelNodes(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { labelSelection } = opts;
            const { label } = this;
            labelSelection.each((text, datum) => {
                var _a, _b, _c, _d;
                text.text = datum.label.text;
                text.fill = label.color;
                text.x = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.x) !== null && _b !== void 0 ? _b : 0;
                text.y = (_d = (_c = datum.point) === null || _c === void 0 ? void 0 : _c.y) !== null && _d !== void 0 ? _d : 0;
                text.fontStyle = label.fontStyle;
                text.fontWeight = label.fontWeight;
                text.fontSize = label.fontSize;
                text.fontFamily = label.fontFamily;
                text.textAlign = 'left';
                text.textBaseline = 'top';
            });
        });
    }
    getTooltipHtml(nodeDatum) {
        var _a, _b, _c;
        const { xKey, yKey, xAxis, yAxis } = this;
        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        const { marker, tooltip, xName, yName, sizeKey, sizeName, labelKey, labelName, id: seriesId } = this;
        const { fill, stroke } = marker;
        const strokeWidth = this.getStrokeWidth((_a = marker.strokeWidth) !== null && _a !== void 0 ? _a : 1);
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
                size: (_c = (_b = nodeDatum.point) === null || _b === void 0 ? void 0 : _b.size) !== null && _c !== void 0 ? _c : 0,
                highlighted: false,
                seriesId,
            });
        }
        const color = (format && format.fill) || fill || 'gray';
        const title = this.title || yName;
        const datum = nodeDatum.datum;
        const xValue = datum[xKey];
        const yValue = datum[yKey];
        const xString = sanitizeHtml(xAxis.formatDatum(xValue));
        const yString = sanitizeHtml(yAxis.formatDatum(yValue));
        let content = `<b>${sanitizeHtml(xName || xKey)}</b>: ${xString}<br>` +
            `<b>${sanitizeHtml(yName || yKey)}</b>: ${yString}`;
        if (sizeKey) {
            content += `<br><b>${sanitizeHtml(sizeName || sizeKey)}</b>: ${sanitizeHtml(datum[sizeKey])}`;
        }
        if (labelKey) {
            content = `<b>${sanitizeHtml(labelName || labelKey)}</b>: ${sanitizeHtml(datum[labelKey])}<br>` + content;
        }
        const defaults = {
            title,
            backgroundColor: color,
            content,
        };
        const { renderer: tooltipRenderer } = tooltip;
        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
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
                color,
                seriesId,
            }), defaults);
        }
        return toTooltipHtml(defaults);
    }
    getLegendData() {
        const { id, data, xKey, yKey, yName, title, visible, marker } = this;
        const { fill, stroke, fillOpacity, strokeOpacity } = marker;
        if (!(data && data.length && xKey && yKey)) {
            return [];
        }
        return [
            {
                id,
                itemId: yKey,
                seriesId: id,
                enabled: visible,
                label: {
                    text: title || yName || yKey,
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill || fill || 'rgba(0, 0, 0, 0)',
                    stroke: marker.stroke || stroke || 'rgba(0, 0, 0, 0)',
                    fillOpacity: fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1,
                    strokeOpacity: strokeOpacity !== null && strokeOpacity !== void 0 ? strokeOpacity : 1,
                },
            },
        ];
    }
    isLabelEnabled() {
        return this.label.enabled;
    }
}
ScatterSeries.className = 'ScatterSeries';
ScatterSeries.type = 'scatter';
__decorate([
    Validate(OPT_STRING)
], ScatterSeries.prototype, "title", void 0);
__decorate([
    Validate(OPT_STRING)
], ScatterSeries.prototype, "labelKey", void 0);
__decorate([
    Validate(STRING)
], ScatterSeries.prototype, "xName", void 0);
__decorate([
    Validate(STRING)
], ScatterSeries.prototype, "yName", void 0);
__decorate([
    Validate(OPT_STRING)
], ScatterSeries.prototype, "sizeName", void 0);
__decorate([
    Validate(OPT_STRING)
], ScatterSeries.prototype, "labelName", void 0);
__decorate([
    Validate(STRING)
], ScatterSeries.prototype, "_xKey", void 0);
__decorate([
    Validate(STRING)
], ScatterSeries.prototype, "_yKey", void 0);
__decorate([
    Validate(OPT_STRING)
], ScatterSeries.prototype, "_sizeKey", void 0);
