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
import { SeriesTooltip, SeriesNodePickMode, valueProperty } from '../series.mjs';
import { ColorScale } from '../../../scale/colorScale.mjs';
import { LinearScale } from '../../../scale/linearScale.mjs';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesNodeBaseClickEvent, } from './cartesianSeries.mjs';
import { ChartAxisDirection } from '../../chartAxisDirection.mjs';
import { getMarker } from '../../marker/util.mjs';
import { toTooltipHtml } from '../../tooltip/tooltip.mjs';
import { ContinuousScale } from '../../../scale/continuousScale.mjs';
import { extent } from '../../../util/array.mjs';
import { sanitizeHtml } from '../../../util/sanitize.mjs';
import { Label } from '../../label.mjs';
import { HdpiCanvas } from '../../../canvas/hdpiCanvas.mjs';
import { OPT_FUNCTION, OPT_STRING, OPT_NUMBER_ARRAY, COLOR_STRING_ARRAY, Validate } from '../../../util/validation.mjs';
import { DataModel } from '../../data/dataModel.mjs';
import * as easing from '../../../motion/easing.mjs';
class ScatterSeriesLabel extends Label {
    constructor() {
        super(...arguments);
        this.formatter = undefined;
    }
}
__decorate([
    Validate(OPT_FUNCTION)
], ScatterSeriesLabel.prototype, "formatter", void 0);
class ScatterSeriesNodeBaseClickEvent extends CartesianSeriesNodeBaseClickEvent {
    constructor(sizeKey, xKey, yKey, nativeEvent, datum, series) {
        super(xKey, yKey, nativeEvent, datum, series);
        this.sizeKey = sizeKey;
    }
}
class ScatterSeriesNodeClickEvent extends ScatterSeriesNodeBaseClickEvent {
    constructor() {
        super(...arguments);
        this.type = 'nodeClick';
    }
}
class ScatterSeriesNodeDoubleClickEvent extends ScatterSeriesNodeBaseClickEvent {
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
    constructor(moduleCtx) {
        super({
            moduleCtx,
            pickModes: [
                SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST,
                SeriesNodePickMode.NEAREST_NODE,
                SeriesNodePickMode.EXACT_SHAPE_MATCH,
            ],
            pathsPerSeries: 0,
            hasMarkers: true,
        });
        this.sizeScale = new LinearScale();
        this.marker = new CartesianSeriesMarker();
        this.label = new ScatterSeriesLabel();
        this.title = undefined;
        this.labelKey = undefined;
        this.xName = undefined;
        this.yName = undefined;
        this.sizeName = 'Size';
        this.labelName = 'Label';
        this.xKey = undefined;
        this.yKey = undefined;
        this.sizeKey = undefined;
        this.colorKey = undefined;
        this.colorName = 'Color';
        this.colorDomain = undefined;
        this.colorRange = ['#ffff00', '#00ff00', '#0000ff'];
        this.colorScale = new ColorScale();
        this.tooltip = new ScatterSeriesTooltip();
        const { label } = this;
        label.enabled = false;
    }
    processData() {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            const { xKey = '', yKey = '', sizeKey, xAxis, yAxis, marker, data } = this;
            const isContinuousX = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.scale) instanceof ContinuousScale;
            const isContinuousY = (yAxis === null || yAxis === void 0 ? void 0 : yAxis.scale) instanceof ContinuousScale;
            const { colorScale, colorDomain, colorRange, colorKey } = this;
            this.dataModel = new DataModel({
                props: [
                    valueProperty(xKey, isContinuousX, { id: `xValue` }),
                    valueProperty(yKey, isContinuousY, { id: `yValue` }),
                    ...(sizeKey ? [valueProperty(sizeKey, true, { id: `sizeValue` })] : []),
                    ...(colorKey ? [valueProperty(colorKey, true, { id: `colorValue` })] : []),
                ],
                dataVisible: this.visible,
            });
            this.processedData = this.dataModel.processData(data !== null && data !== void 0 ? data : []);
            if (sizeKey) {
                const sizeKeyIdx = (_b = (_a = this.dataModel.resolveProcessedDataIndexById(`sizeValue`)) === null || _a === void 0 ? void 0 : _a.index) !== null && _b !== void 0 ? _b : -1;
                const processedSize = (_d = (_c = this.processedData) === null || _c === void 0 ? void 0 : _c.domain.values[sizeKeyIdx]) !== null && _d !== void 0 ? _d : [];
                this.sizeScale.domain = marker.domain ? marker.domain : processedSize;
            }
            if (colorKey) {
                const colorKeyIdx = (_f = (_e = this.dataModel.resolveProcessedDataIndexById(`colorValue`)) === null || _e === void 0 ? void 0 : _e.index) !== null && _f !== void 0 ? _f : -1;
                colorScale.domain = colorDomain !== null && colorDomain !== void 0 ? colorDomain : this.processedData.domain.values[colorKeyIdx];
                colorScale.range = colorRange;
                colorScale.update();
            }
        });
    }
    getDomain(direction) {
        const { dataModel, processedData } = this;
        if (!processedData || !dataModel)
            return [];
        const id = direction === ChartAxisDirection.X ? `xValue` : `yValue`;
        const dataDef = dataModel.resolveProcessedDataDefById(id);
        const domain = dataModel.getDomain(id, processedData);
        if ((dataDef === null || dataDef === void 0 ? void 0 : dataDef.valueType) === 'category') {
            return domain;
        }
        const axis = direction === ChartAxisDirection.X ? this.xAxis : this.yAxis;
        return this.fixNumericExtent(extent(domain), axis);
    }
    getNodeClickEvent(event, datum) {
        var _a, _b;
        return new ScatterSeriesNodeClickEvent(this.sizeKey, (_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    }
    getNodeDoubleClickEvent(event, datum) {
        var _a, _b;
        return new ScatterSeriesNodeDoubleClickEvent(this.sizeKey, (_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    }
    createNodeData() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __awaiter(this, void 0, void 0, function* () {
            const { visible, xAxis, yAxis, yKey = '', xKey = '', label, labelKey, ctx: { callbackCache }, } = this;
            const xDataIdx = (_a = this.dataModel) === null || _a === void 0 ? void 0 : _a.resolveProcessedDataIndexById(`xValue`);
            const yDataIdx = (_b = this.dataModel) === null || _b === void 0 ? void 0 : _b.resolveProcessedDataIndexById(`yValue`);
            if (!(xDataIdx && yDataIdx && visible && xAxis && yAxis)) {
                return [];
            }
            const { colorScale, sizeKey, colorKey, id: seriesId } = this;
            const xScale = xAxis.scale;
            const yScale = yAxis.scale;
            const xOffset = ((_c = xScale.bandwidth) !== null && _c !== void 0 ? _c : 0) / 2;
            const yOffset = ((_d = yScale.bandwidth) !== null && _d !== void 0 ? _d : 0) / 2;
            const { sizeScale, marker } = this;
            const nodeData = new Array((_f = (_e = this.processedData) === null || _e === void 0 ? void 0 : _e.data.length) !== null && _f !== void 0 ? _f : 0);
            sizeScale.range = [marker.size, marker.maxSize];
            const font = label.getFont();
            let actualLength = 0;
            for (const { values, datum } of (_h = (_g = this.processedData) === null || _g === void 0 ? void 0 : _g.data) !== null && _h !== void 0 ? _h : []) {
                const xDatum = values[xDataIdx.index];
                const yDatum = values[yDataIdx.index];
                const x = xScale.convert(xDatum) + xOffset;
                const y = yScale.convert(yDatum) + yOffset;
                if (!this.checkRangeXY(x, y, xAxis, yAxis)) {
                    continue;
                }
                let text;
                if (label.formatter) {
                    text = callbackCache.call(label.formatter, { value: yDatum, seriesId, datum });
                }
                if (text === undefined) {
                    text = labelKey ? String(datum[labelKey]) : '';
                }
                const size = HdpiCanvas.getTextSize(text, font);
                const markerSize = sizeKey ? sizeScale.convert(values[2]) : marker.size;
                const colorIdx = sizeKey ? 3 : 2;
                const fill = colorKey ? colorScale.convert(values[colorIdx]) : undefined;
                nodeData[actualLength++] = {
                    series: this,
                    itemId: yKey,
                    yKey,
                    xKey,
                    datum,
                    point: { x, y, size: markerSize },
                    nodeMidPoint: { x, y },
                    fill,
                    label: Object.assign({ text }, size),
                };
            }
            nodeData.length = actualLength;
            return [{ itemId: (_j = this.yKey) !== null && _j !== void 0 ? _j : this.id, nodeData, labelData: nodeData }];
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
            const { marker, xKey = '', yKey = '', sizeScale, marker: { fillOpacity: markerFillOpacity, strokeOpacity: markerStrokeOpacity, strokeWidth: markerStrokeWidth, }, highlightStyle: { item: { fill: highlightedFill, fillOpacity: highlightFillOpacity = markerFillOpacity, stroke: highlightedStroke, strokeWidth: highlightedDatumStrokeWidth, }, }, id: seriesId, ctx: { callbackCache }, } = this;
            const { formatter } = marker;
            sizeScale.range = [marker.size, marker.maxSize];
            const customMarker = typeof marker.shape === 'function';
            markerSelection.each((node, datum) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : (_a = datum.fill) !== null && _a !== void 0 ? _a : marker.fill;
                const fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
                const stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : marker.stroke;
                const strokeOpacity = markerStrokeOpacity;
                const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : markerStrokeWidth !== null && markerStrokeWidth !== void 0 ? markerStrokeWidth : 1;
                const size = (_c = (_b = datum.point) === null || _b === void 0 ? void 0 : _b.size) !== null && _c !== void 0 ? _c : 0;
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
                node.fill = (_d = format === null || format === void 0 ? void 0 : format.fill) !== null && _d !== void 0 ? _d : fill;
                node.stroke = (_e = format === null || format === void 0 ? void 0 : format.stroke) !== null && _e !== void 0 ? _e : stroke;
                node.strokeWidth = (_f = format === null || format === void 0 ? void 0 : format.strokeWidth) !== null && _f !== void 0 ? _f : strokeWidth;
                node.fillOpacity = fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1;
                node.strokeOpacity = strokeOpacity !== null && strokeOpacity !== void 0 ? strokeOpacity : 1;
                node.translationX = (_h = (_g = datum.point) === null || _g === void 0 ? void 0 : _g.x) !== null && _h !== void 0 ? _h : 0;
                node.translationY = (_k = (_j = datum.point) === null || _j === void 0 ? void 0 : _j.y) !== null && _k !== void 0 ? _k : 0;
                node.visible = node.size > 0;
                if (!customMarker || node.dirtyPath) {
                    return;
                }
                // Only for custom marker shapes.
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
        var _a, _b, _c, _d, _e, _f, _g;
        const { xKey, yKey, xAxis, yAxis } = this;
        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        const { marker, tooltip, xName, yName, sizeKey, sizeName, labelKey, labelName, id: seriesId, ctx: { callbackCache }, } = this;
        const { stroke } = marker;
        const fill = (_a = nodeDatum.fill) !== null && _a !== void 0 ? _a : marker.fill;
        const strokeWidth = this.getStrokeWidth((_b = marker.strokeWidth) !== null && _b !== void 0 ? _b : 1);
        const { formatter } = this.marker;
        let format = undefined;
        if (formatter) {
            format = callbackCache.call(formatter, {
                datum: nodeDatum,
                xKey,
                yKey,
                fill,
                stroke,
                strokeWidth,
                size: (_d = (_c = nodeDatum.point) === null || _c === void 0 ? void 0 : _c.size) !== null && _d !== void 0 ? _d : 0,
                highlighted: false,
                seriesId,
            });
        }
        const color = (_f = (_e = format === null || format === void 0 ? void 0 : format.fill) !== null && _e !== void 0 ? _e : fill) !== null && _f !== void 0 ? _f : 'gray';
        const title = (_g = this.title) !== null && _g !== void 0 ? _g : yName;
        const datum = nodeDatum.datum;
        const xValue = datum[xKey];
        const yValue = datum[yKey];
        const xString = sanitizeHtml(xAxis.formatDatum(xValue));
        const yString = sanitizeHtml(yAxis.formatDatum(yValue));
        let content = `<b>${sanitizeHtml(xName !== null && xName !== void 0 ? xName : xKey)}</b>: ${xString}<br>` +
            `<b>${sanitizeHtml(yName !== null && yName !== void 0 ? yName : yKey)}</b>: ${yString}`;
        if (sizeKey) {
            content += `<br><b>${sanitizeHtml(sizeName !== null && sizeName !== void 0 ? sizeName : sizeKey)}</b>: ${sanitizeHtml(datum[sizeKey])}`;
        }
        if (labelKey) {
            content = `<b>${sanitizeHtml(labelName !== null && labelName !== void 0 ? labelName : labelKey)}</b>: ${sanitizeHtml(datum[labelKey])}<br>` + content;
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
        var _a, _b, _c, _d, _e;
        const { id, data, xKey, yKey, yName, title, visible, marker } = this;
        const { fill, stroke, fillOpacity, strokeOpacity } = marker;
        if (!((data === null || data === void 0 ? void 0 : data.length) && xKey && yKey)) {
            return [];
        }
        const legendData = [
            {
                legendType: 'category',
                id,
                itemId: yKey,
                seriesId: id,
                enabled: visible,
                label: {
                    text: (_a = title !== null && title !== void 0 ? title : yName) !== null && _a !== void 0 ? _a : yKey,
                },
                marker: {
                    shape: marker.shape,
                    fill: (_c = (_b = marker.fill) !== null && _b !== void 0 ? _b : fill) !== null && _c !== void 0 ? _c : 'rgba(0, 0, 0, 0)',
                    stroke: (_e = (_d = marker.stroke) !== null && _d !== void 0 ? _d : stroke) !== null && _e !== void 0 ? _e : 'rgba(0, 0, 0, 0)',
                    fillOpacity: fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1,
                    strokeOpacity: strokeOpacity !== null && strokeOpacity !== void 0 ? strokeOpacity : 1,
                },
            },
        ];
        return legendData;
    }
    animateEmptyUpdateReady({ markerSelections, labelSelections, }) {
        const duration = 1000;
        const labelDuration = 200;
        markerSelections.forEach((markerSelection) => {
            markerSelection.each((marker, datum) => {
                var _a, _b, _c, _d;
                const format = this.animateFormatter(marker, datum);
                const size = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
                const to = (_c = format === null || format === void 0 ? void 0 : format.size) !== null && _c !== void 0 ? _c : size;
                (_d = this.animationManager) === null || _d === void 0 ? void 0 : _d.animate(`${this.id}_empty-update-ready_${marker.id}`, {
                    from: 0,
                    to: to,
                    disableInteractions: true,
                    duration,
                    ease: easing.linear,
                    repeat: 0,
                    onUpdate(size) {
                        marker.size = size;
                    },
                });
            });
        });
        labelSelections.forEach((labelSelection) => {
            labelSelection.each((label) => {
                var _a;
                (_a = this.animationManager) === null || _a === void 0 ? void 0 : _a.animate(`${this.id}_empty-update-ready_${label.id}`, {
                    from: 0,
                    to: 1,
                    delay: duration,
                    duration: labelDuration,
                    ease: easing.linear,
                    repeat: 0,
                    onUpdate: (opacity) => {
                        label.opacity = opacity;
                    },
                });
            });
        });
    }
    animateReadyUpdate({ markerSelections }) {
        markerSelections.forEach((markerSelection) => {
            this.resetMarkers(markerSelection);
        });
    }
    animateReadyHighlightMarkers(markerSelection) {
        this.resetMarkers(markerSelection);
    }
    resetMarkers(markerSelection) {
        markerSelection.each((marker, datum) => {
            var _a, _b, _c;
            const format = this.animateFormatter(marker, datum);
            const size = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
            marker.size = (_c = format === null || format === void 0 ? void 0 : format.size) !== null && _c !== void 0 ? _c : size;
        });
    }
    animateFormatter(marker, datum) {
        var _a, _b, _c;
        const { xKey = '', yKey = '', marker: { strokeWidth: markerStrokeWidth }, id: seriesId, ctx: { callbackCache }, } = this;
        const { formatter } = this.marker;
        const fill = (_a = datum.fill) !== null && _a !== void 0 ? _a : marker.fill;
        const stroke = marker.stroke;
        const strokeWidth = markerStrokeWidth !== null && markerStrokeWidth !== void 0 ? markerStrokeWidth : 1;
        const size = (_c = (_b = datum.point) === null || _b === void 0 ? void 0 : _b.size) !== null && _c !== void 0 ? _c : 0;
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
ScatterSeries.className = 'ScatterSeries';
ScatterSeries.type = 'scatter';
__decorate([
    Validate(OPT_STRING)
], ScatterSeries.prototype, "title", void 0);
__decorate([
    Validate(OPT_STRING)
], ScatterSeries.prototype, "labelKey", void 0);
__decorate([
    Validate(OPT_STRING)
], ScatterSeries.prototype, "xName", void 0);
__decorate([
    Validate(OPT_STRING)
], ScatterSeries.prototype, "yName", void 0);
__decorate([
    Validate(OPT_STRING)
], ScatterSeries.prototype, "sizeName", void 0);
__decorate([
    Validate(OPT_STRING)
], ScatterSeries.prototype, "labelName", void 0);
__decorate([
    Validate(OPT_STRING)
], ScatterSeries.prototype, "xKey", void 0);
__decorate([
    Validate(OPT_STRING)
], ScatterSeries.prototype, "yKey", void 0);
__decorate([
    Validate(OPT_STRING)
], ScatterSeries.prototype, "sizeKey", void 0);
__decorate([
    Validate(OPT_STRING)
], ScatterSeries.prototype, "colorKey", void 0);
__decorate([
    Validate(OPT_STRING)
], ScatterSeries.prototype, "colorName", void 0);
__decorate([
    Validate(OPT_NUMBER_ARRAY)
], ScatterSeries.prototype, "colorDomain", void 0);
__decorate([
    Validate(COLOR_STRING_ARRAY)
], ScatterSeries.prototype, "colorRange", void 0);
