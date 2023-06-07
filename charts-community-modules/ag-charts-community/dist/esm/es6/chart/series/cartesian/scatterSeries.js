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
import { SeriesTooltip, SeriesNodePickMode, valueProperty } from '../series';
import { ColorScale } from '../../../scale/colorScale';
import { LinearScale } from '../../../scale/linearScale';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesNodeBaseClickEvent, } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { getMarker } from '../../marker/util';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { ContinuousScale } from '../../../scale/continuousScale';
import { extent } from '../../../util/array';
import { sanitizeHtml } from '../../../util/sanitize';
import { Label } from '../../label';
import { HdpiCanvas } from '../../../canvas/hdpiCanvas';
import { OPT_FUNCTION, OPT_STRING, OPT_NUMBER_ARRAY, COLOR_STRING_ARRAY, Validate } from '../../../util/validation';
import { DataModel } from '../../data/dataModel';
import * as easing from '../../../motion/easing';
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
            markerSelection.each((marker, datum) => {
                var _a, _b, _c;
                const format = this.animateFormatter(marker, datum);
                const size = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
                marker.size = (_c = format === null || format === void 0 ? void 0 : format.size) !== null && _c !== void 0 ? _c : size;
            });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NhdHRlclNlcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9zZXJpZXMvY2FydGVzaWFuL3NjYXR0ZXJTZXJpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsT0FBTyxFQUFFLGFBQWEsRUFBeUIsa0JBQWtCLEVBQUUsYUFBYSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRXBHLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDekQsT0FBTyxFQUNILGVBQWUsRUFDZixxQkFBcUIsRUFDckIsaUNBQWlDLEdBRXBDLE1BQU0sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUN0RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDakUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBRXBDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUd4RCxPQUFPLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxrQkFBa0IsRUFBRSxRQUFRLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQU9wSCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDakQsT0FBTyxLQUFLLE1BQU0sTUFBTSx3QkFBd0IsQ0FBQztBQVFqRCxNQUFNLGtCQUFtQixTQUFRLEtBQUs7SUFBdEM7O1FBRUksY0FBUyxHQUFrRSxTQUFTLENBQUM7SUFDekYsQ0FBQztDQUFBO0FBREc7SUFEQyxRQUFRLENBQUMsWUFBWSxDQUFDO3FEQUM4RDtBQUd6RixNQUFNLCtCQUFnQyxTQUFRLGlDQUFzQztJQUdoRixZQUNJLE9BQTJCLEVBQzNCLElBQVksRUFDWixJQUFZLEVBQ1osV0FBdUIsRUFDdkIsS0FBdUIsRUFDdkIsTUFBcUI7UUFFckIsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0NBQ0o7QUFFRCxNQUFNLDJCQUE0QixTQUFRLCtCQUErQjtJQUF6RTs7UUFDYSxTQUFJLEdBQUcsV0FBVyxDQUFDO0lBQ2hDLENBQUM7Q0FBQTtBQUVELE1BQU0saUNBQWtDLFNBQVEsK0JBQStCO0lBQS9FOztRQUNhLFNBQUksR0FBRyxpQkFBaUIsQ0FBQztJQUN0QyxDQUFDO0NBQUE7QUFFRCxNQUFNLG9CQUFxQixTQUFRLGFBQWE7SUFBaEQ7O1FBRUksYUFBUSxHQUF3RixTQUFTLENBQUM7SUFDOUcsQ0FBQztDQUFBO0FBREc7SUFEQyxRQUFRLENBQUMsWUFBWSxDQUFDO3NEQUNtRjtBQUc5RyxNQUFNLE9BQU8sYUFBYyxTQUFRLGVBQXdEO0lBcUR2RixZQUFZLFNBQXdCO1FBQ2hDLEtBQUssQ0FBQztZQUNGLFNBQVM7WUFDVCxTQUFTLEVBQUU7Z0JBQ1Asa0JBQWtCLENBQUMsbUNBQW1DO2dCQUN0RCxrQkFBa0IsQ0FBQyxZQUFZO2dCQUMvQixrQkFBa0IsQ0FBQyxpQkFBaUI7YUFDdkM7WUFDRCxjQUFjLEVBQUUsQ0FBQztZQUNqQixVQUFVLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7UUEzREMsY0FBUyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7UUFFN0IsV0FBTSxHQUFHLElBQUkscUJBQXFCLEVBQUUsQ0FBQztRQUVyQyxVQUFLLEdBQUcsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO1FBRzFDLFVBQUssR0FBWSxTQUFTLENBQUM7UUFHM0IsYUFBUSxHQUFZLFNBQVMsQ0FBQztRQUc5QixVQUFLLEdBQVksU0FBUyxDQUFDO1FBRzNCLFVBQUssR0FBWSxTQUFTLENBQUM7UUFHM0IsYUFBUSxHQUFZLE1BQU0sQ0FBQztRQUczQixjQUFTLEdBQVksT0FBTyxDQUFDO1FBRzdCLFNBQUksR0FBWSxTQUFTLENBQUM7UUFHMUIsU0FBSSxHQUFZLFNBQVMsQ0FBQztRQUcxQixZQUFPLEdBQVksU0FBUyxDQUFDO1FBRzdCLGFBQVEsR0FBWSxTQUFTLENBQUM7UUFHOUIsY0FBUyxHQUFZLE9BQU8sQ0FBQztRQUc3QixnQkFBVyxHQUF5QixTQUFTLENBQUM7UUFHOUMsZUFBVSxHQUFhLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUV6RCxlQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUVyQixZQUFPLEdBQXlCLElBQUksb0JBQW9CLEVBQUUsQ0FBQztRQWNoRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRXZCLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0lBQzFCLENBQUM7SUFFSyxXQUFXOzs7WUFDYixNQUFNLEVBQUUsSUFBSSxHQUFHLEVBQUUsRUFBRSxJQUFJLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFFM0UsTUFBTSxhQUFhLEdBQUcsQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsS0FBSyxhQUFZLGVBQWUsQ0FBQztZQUM5RCxNQUFNLGFBQWEsR0FBRyxDQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxLQUFLLGFBQVksZUFBZSxDQUFDO1lBRTlELE1BQU0sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFFL0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FBTTtnQkFDaEMsS0FBSyxFQUFFO29CQUNILGFBQWEsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDO29CQUNwRCxhQUFhLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQztvQkFDcEQsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDdkUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztpQkFDN0U7Z0JBQ0QsV0FBVyxFQUFFLElBQUksQ0FBQyxPQUFPO2FBQzVCLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxhQUFKLElBQUksY0FBSixJQUFJLEdBQUksRUFBRSxDQUFDLENBQUM7WUFFNUQsSUFBSSxPQUFPLEVBQUU7Z0JBQ1QsTUFBTSxVQUFVLEdBQUcsTUFBQSxNQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsNkJBQTZCLENBQUMsV0FBVyxDQUFDLDBDQUFFLEtBQUssbUNBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzFGLE1BQU0sYUFBYSxHQUFHLE1BQUEsTUFBQSxJQUFJLENBQUMsYUFBYSwwQ0FBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxtQ0FBSSxFQUFFLENBQUM7Z0JBQzFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQzthQUN6RTtZQUVELElBQUksUUFBUSxFQUFFO2dCQUNWLE1BQU0sV0FBVyxHQUFHLE1BQUEsTUFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLDZCQUE2QixDQUFDLFlBQVksQ0FBQywwQ0FBRSxLQUFLLG1DQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUM1RixVQUFVLENBQUMsTUFBTSxHQUFHLFdBQVcsYUFBWCxXQUFXLGNBQVgsV0FBVyxHQUFJLElBQUksQ0FBQyxhQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDbEYsVUFBVSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUM7Z0JBQzlCLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUN2Qjs7S0FDSjtJQUVELFNBQVMsQ0FBQyxTQUE2QjtRQUNuQyxNQUFNLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxHQUFHLElBQUksQ0FBQztRQUMxQyxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU8sRUFBRSxDQUFDO1FBRTVDLE1BQU0sRUFBRSxHQUFHLFNBQVMsS0FBSyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBQ3BFLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQywyQkFBMkIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxRCxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUEsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLFNBQVMsTUFBSyxVQUFVLEVBQUU7WUFDbkMsT0FBTyxNQUFNLENBQUM7U0FDakI7UUFDRCxNQUFNLElBQUksR0FBRyxTQUFTLEtBQUssa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQzFFLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRVMsaUJBQWlCLENBQUMsS0FBaUIsRUFBRSxLQUF1Qjs7UUFDbEUsT0FBTyxJQUFJLDJCQUEyQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBQSxJQUFJLENBQUMsSUFBSSxtQ0FBSSxFQUFFLEVBQUUsTUFBQSxJQUFJLENBQUMsSUFBSSxtQ0FBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMvRyxDQUFDO0lBRVMsdUJBQXVCLENBQUMsS0FBaUIsRUFBRSxLQUF1Qjs7UUFDeEUsT0FBTyxJQUFJLGlDQUFpQyxDQUN4QyxJQUFJLENBQUMsT0FBTyxFQUNaLE1BQUEsSUFBSSxDQUFDLElBQUksbUNBQUksRUFBRSxFQUNmLE1BQUEsSUFBSSxDQUFDLElBQUksbUNBQUksRUFBRSxFQUNmLEtBQUssRUFDTCxLQUFLLEVBQ0wsSUFBSSxDQUNQLENBQUM7SUFDTixDQUFDO0lBRUssY0FBYzs7O1lBQ2hCLE1BQU0sRUFDRixPQUFPLEVBQ1AsS0FBSyxFQUNMLEtBQUssRUFDTCxJQUFJLEdBQUcsRUFBRSxFQUNULElBQUksR0FBRyxFQUFFLEVBQ1QsS0FBSyxFQUNMLFFBQVEsRUFDUixHQUFHLEVBQUUsRUFBRSxhQUFhLEVBQUUsR0FDekIsR0FBRyxJQUFJLENBQUM7WUFFVCxNQUFNLFFBQVEsR0FBRyxNQUFBLElBQUksQ0FBQyxTQUFTLDBDQUFFLDZCQUE2QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pFLE1BQU0sUUFBUSxHQUFHLE1BQUEsSUFBSSxDQUFDLFNBQVMsMENBQUUsNkJBQTZCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFekUsSUFBSSxDQUFDLENBQUMsUUFBUSxJQUFJLFFBQVEsSUFBSSxPQUFPLElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxFQUFFO2dCQUN0RCxPQUFPLEVBQUUsQ0FBQzthQUNiO1lBRUQsTUFBTSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFFN0QsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztZQUMzQixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQzNCLE1BQU0sT0FBTyxHQUFHLENBQUMsTUFBQSxNQUFNLENBQUMsU0FBUyxtQ0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUMsTUFBTSxPQUFPLEdBQUcsQ0FBQyxNQUFBLE1BQU0sQ0FBQyxTQUFTLG1DQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1QyxNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztZQUNuQyxNQUFNLFFBQVEsR0FBdUIsSUFBSSxLQUFLLENBQUMsTUFBQSxNQUFBLElBQUksQ0FBQyxhQUFhLDBDQUFFLElBQUksQ0FBQyxNQUFNLG1DQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXJGLFNBQVMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVoRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDN0IsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLEtBQUssTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxNQUFBLE1BQUEsSUFBSSxDQUFDLGFBQWEsMENBQUUsSUFBSSxtQ0FBSSxFQUFFLEVBQUU7Z0JBQzVELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDO2dCQUMzQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQztnQkFFM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUU7b0JBQ3hDLFNBQVM7aUJBQ1o7Z0JBRUQsSUFBSSxJQUFJLENBQUM7Z0JBQ1QsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFO29CQUNqQixJQUFJLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztpQkFDbEY7Z0JBQ0QsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO29CQUNwQixJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztpQkFDbEQ7Z0JBRUQsTUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2hELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDeEUsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7Z0JBRXpFLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHO29CQUN2QixNQUFNLEVBQUUsSUFBSTtvQkFDWixNQUFNLEVBQUUsSUFBSTtvQkFDWixJQUFJO29CQUNKLElBQUk7b0JBQ0osS0FBSztvQkFDTCxLQUFLLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUU7b0JBQ2pDLFlBQVksRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7b0JBQ3RCLElBQUk7b0JBQ0osS0FBSyxrQkFDRCxJQUFJLElBQ0QsSUFBSSxDQUNWO2lCQUNKLENBQUM7YUFDTDtZQUVELFFBQVEsQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDO1lBRS9CLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFBLElBQUksQ0FBQyxJQUFJLG1DQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDOztLQUM1RTtJQUVTLHNCQUFzQjtRQUM1QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVELFlBQVk7O1FBQ1IsT0FBTyxNQUFBLElBQUksQ0FBQyxlQUFlLDBDQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQXVCLENBQUMsQ0FBQztJQUNsRyxDQUFDO0lBRVMsYUFBYTtRQUNuQixNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUM5QixNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsT0FBTyxJQUFJLFdBQVcsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFZSxxQkFBcUIsQ0FBQyxJQUdyQzs7WUFDRyxNQUFNLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxHQUFHLElBQUksQ0FBQztZQUMzQyxNQUFNLEVBQ0YsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQ3RCLEdBQUcsSUFBSSxDQUFDO1lBRVQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUN2QixlQUFlLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDM0I7WUFFRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3JDLE9BQU8sZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxDQUFDO0tBQUE7SUFFZSxpQkFBaUIsQ0FBQyxJQUdqQzs7WUFDRyxNQUFNLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxrQkFBa0IsRUFBRSxHQUFHLElBQUksQ0FBQztZQUNsRSxNQUFNLEVBQ0YsTUFBTSxFQUNOLElBQUksR0FBRyxFQUFFLEVBQ1QsSUFBSSxHQUFHLEVBQUUsRUFDVCxTQUFTLEVBQ1QsTUFBTSxFQUFFLEVBQ0osV0FBVyxFQUFFLGlCQUFpQixFQUM5QixhQUFhLEVBQUUsbUJBQW1CLEVBQ2xDLFdBQVcsRUFBRSxpQkFBaUIsR0FDakMsRUFDRCxjQUFjLEVBQUUsRUFDWixJQUFJLEVBQUUsRUFDRixJQUFJLEVBQUUsZUFBZSxFQUNyQixXQUFXLEVBQUUsb0JBQW9CLEdBQUcsaUJBQWlCLEVBQ3JELE1BQU0sRUFBRSxpQkFBaUIsRUFDekIsV0FBVyxFQUFFLDJCQUEyQixHQUMzQyxHQUNKLEVBQ0QsRUFBRSxFQUFFLFFBQVEsRUFDWixHQUFHLEVBQUUsRUFBRSxhQUFhLEVBQUUsR0FDekIsR0FBRyxJQUFJLENBQUM7WUFDVCxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsTUFBTSxDQUFDO1lBRTdCLFNBQVMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVoRCxNQUFNLFlBQVksR0FBRyxPQUFPLE1BQU0sQ0FBQyxLQUFLLEtBQUssVUFBVSxDQUFDO1lBRXhELGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7O2dCQUNqQyxNQUFNLElBQUksR0FDTixrQkFBa0IsSUFBSSxlQUFlLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLE1BQUEsS0FBSyxDQUFDLElBQUksbUNBQUksTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDdEcsTUFBTSxXQUFXLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDbEYsTUFBTSxNQUFNLEdBQUcsa0JBQWtCLElBQUksaUJBQWlCLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDekcsTUFBTSxhQUFhLEdBQUcsbUJBQW1CLENBQUM7Z0JBQzFDLE1BQU0sV0FBVyxHQUNiLGtCQUFrQixJQUFJLDJCQUEyQixLQUFLLFNBQVM7b0JBQzNELENBQUMsQ0FBQywyQkFBMkI7b0JBQzdCLENBQUMsQ0FBQyxpQkFBaUIsYUFBakIsaUJBQWlCLGNBQWpCLGlCQUFpQixHQUFJLENBQUMsQ0FBQztnQkFDakMsTUFBTSxJQUFJLEdBQUcsTUFBQSxNQUFBLEtBQUssQ0FBQyxLQUFLLDBDQUFFLElBQUksbUNBQUksQ0FBQyxDQUFDO2dCQUVwQyxJQUFJLE1BQU0sR0FBOEMsU0FBUyxDQUFDO2dCQUNsRSxJQUFJLFNBQVMsRUFBRTtvQkFDWCxNQUFNLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7d0JBQ25DLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSzt3QkFDbEIsSUFBSTt3QkFDSixJQUFJO3dCQUNKLElBQUk7d0JBQ0osTUFBTTt3QkFDTixXQUFXO3dCQUNYLElBQUk7d0JBQ0osV0FBVyxFQUFFLGtCQUFrQjt3QkFDL0IsUUFBUTtxQkFDWCxDQUFDLENBQUM7aUJBQ047Z0JBRUQsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFBLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxJQUFJLG1DQUFJLElBQUksQ0FBQztnQkFDakMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFBLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxNQUFNLG1DQUFJLE1BQU0sQ0FBQztnQkFDdkMsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFBLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxXQUFXLG1DQUFJLFdBQVcsQ0FBQztnQkFDdEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLGFBQVgsV0FBVyxjQUFYLFdBQVcsR0FBSSxDQUFDLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxhQUFiLGFBQWEsY0FBYixhQUFhLEdBQUksQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQUEsTUFBQSxLQUFLLENBQUMsS0FBSywwQ0FBRSxDQUFDLG1DQUFJLENBQUMsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFBLE1BQUEsS0FBSyxDQUFDLEtBQUssMENBQUUsQ0FBQyxtQ0FBSSxDQUFDLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7Z0JBRTdCLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDakMsT0FBTztpQkFDVjtnQkFFRCxpQ0FBaUM7Z0JBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDbEIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQzFCLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLGtCQUFrQixFQUFFO2dCQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO2FBQzNCO1FBQ0wsQ0FBQztLQUFBO0lBRWUsb0JBQW9CLENBQUMsSUFHcEM7OztZQUNHLE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDaEMsTUFBTSxFQUNGLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxHQUNyQixHQUFHLElBQUksQ0FBQztZQUVULE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBQSxNQUFBLElBQUksQ0FBQyxLQUFLLDBDQUFFLFdBQVcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLG1DQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRTlFLE1BQU0sZUFBZSxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQ3BDLENBQUMsQ0FBQyxFQUFvQixFQUFFLENBQUMsaUNBQ2pCLENBQUMsQ0FBQyxLQUEwQixLQUNoQyxLQUFLLEVBQUU7b0JBQ0gsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNOLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDTixJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSTtpQkFDM0IsSUFDSCxDQUNMLENBQUM7WUFDRixPQUFPLGNBQWMsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7O0tBQ2pEO0lBRWUsZ0JBQWdCLENBQUMsSUFBMkQ7O1lBQ3hGLE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDaEMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQztZQUV2QixjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFOztnQkFDaEMsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDN0IsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO2dCQUN4QixJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQUEsTUFBQSxLQUFLLENBQUMsS0FBSywwQ0FBRSxDQUFDLG1DQUFJLENBQUMsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFBLE1BQUEsS0FBSyxDQUFDLEtBQUssMENBQUUsQ0FBQyxtQ0FBSSxDQUFDLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztnQkFDakMsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO2dCQUNuQyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztnQkFDbkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQzlCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUFBO0lBRUQsY0FBYyxDQUFDLFNBQTJCOztRQUN0QyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRTFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDcEMsT0FBTyxFQUFFLENBQUM7U0FDYjtRQUVELE1BQU0sRUFDRixNQUFNLEVBQ04sT0FBTyxFQUNQLEtBQUssRUFDTCxLQUFLLEVBQ0wsT0FBTyxFQUNQLFFBQVEsRUFDUixRQUFRLEVBQ1IsU0FBUyxFQUNULEVBQUUsRUFBRSxRQUFRLEVBQ1osR0FBRyxFQUFFLEVBQUUsYUFBYSxFQUFFLEdBQ3pCLEdBQUcsSUFBSSxDQUFDO1FBRVQsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUMxQixNQUFNLElBQUksR0FBRyxNQUFBLFNBQVMsQ0FBQyxJQUFJLG1DQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDM0MsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFBLE1BQU0sQ0FBQyxXQUFXLG1DQUFJLENBQUMsQ0FBQyxDQUFDO1FBRWpFLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ2xDLElBQUksTUFBTSxHQUE4QyxTQUFTLENBQUM7UUFFbEUsSUFBSSxTQUFTLEVBQUU7WUFDWCxNQUFNLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ25DLEtBQUssRUFBRSxTQUFTO2dCQUNoQixJQUFJO2dCQUNKLElBQUk7Z0JBQ0osSUFBSTtnQkFDSixNQUFNO2dCQUNOLFdBQVc7Z0JBQ1gsSUFBSSxFQUFFLE1BQUEsTUFBQSxTQUFTLENBQUMsS0FBSywwQ0FBRSxJQUFJLG1DQUFJLENBQUM7Z0JBQ2hDLFdBQVcsRUFBRSxLQUFLO2dCQUNsQixRQUFRO2FBQ1gsQ0FBQyxDQUFDO1NBQ047UUFFRCxNQUFNLEtBQUssR0FBRyxNQUFBLE1BQUEsTUFBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLElBQUksbUNBQUksSUFBSSxtQ0FBSSxNQUFNLENBQUM7UUFDN0MsTUFBTSxLQUFLLEdBQUcsTUFBQSxJQUFJLENBQUMsS0FBSyxtQ0FBSSxLQUFLLENBQUM7UUFDbEMsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztRQUM5QixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDeEQsTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUV4RCxJQUFJLE9BQU8sR0FDUCxNQUFNLFlBQVksQ0FBQyxLQUFLLGFBQUwsS0FBSyxjQUFMLEtBQUssR0FBSSxJQUFJLENBQUMsU0FBUyxPQUFPLE1BQU07WUFDdkQsTUFBTSxZQUFZLENBQUMsS0FBSyxhQUFMLEtBQUssY0FBTCxLQUFLLEdBQUksSUFBSSxDQUFDLFNBQVMsT0FBTyxFQUFFLENBQUM7UUFFeEQsSUFBSSxPQUFPLEVBQUU7WUFDVCxPQUFPLElBQUksVUFBVSxZQUFZLENBQUMsUUFBUSxhQUFSLFFBQVEsY0FBUixRQUFRLEdBQUksT0FBTyxDQUFDLFNBQVMsWUFBWSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDakc7UUFFRCxJQUFJLFFBQVEsRUFBRTtZQUNWLE9BQU8sR0FBRyxNQUFNLFlBQVksQ0FBQyxTQUFTLGFBQVQsU0FBUyxjQUFULFNBQVMsR0FBSSxRQUFRLENBQUMsU0FBUyxZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUM7U0FDN0c7UUFFRCxNQUFNLFFBQVEsR0FBNEI7WUFDdEMsS0FBSztZQUNMLGVBQWUsRUFBRSxLQUFLO1lBQ3RCLE9BQU87U0FDVixDQUFDO1FBRUYsTUFBTSxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFOUMsSUFBSSxlQUFlLEVBQUU7WUFDakIsT0FBTyxhQUFhLENBQ2hCLGVBQWUsQ0FBQztnQkFDWixLQUFLO2dCQUNMLElBQUk7Z0JBQ0osTUFBTTtnQkFDTixLQUFLO2dCQUNMLElBQUk7Z0JBQ0osTUFBTTtnQkFDTixLQUFLO2dCQUNMLE9BQU87Z0JBQ1AsUUFBUTtnQkFDUixRQUFRO2dCQUNSLFNBQVM7Z0JBQ1QsS0FBSztnQkFDTCxLQUFLO2dCQUNMLFFBQVE7YUFDWCxDQUFDLEVBQ0YsUUFBUSxDQUNYLENBQUM7U0FDTDtRQUVELE9BQU8sYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxhQUFhOztRQUNULE1BQU0sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ3JFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFFNUQsSUFBSSxDQUFDLENBQUMsQ0FBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsTUFBTSxLQUFJLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRTtZQUNqQyxPQUFPLEVBQUUsQ0FBQztTQUNiO1FBRUQsTUFBTSxVQUFVLEdBQTBCO1lBQ3RDO2dCQUNJLFVBQVUsRUFBRSxVQUFVO2dCQUN0QixFQUFFO2dCQUNGLE1BQU0sRUFBRSxJQUFJO2dCQUNaLFFBQVEsRUFBRSxFQUFFO2dCQUNaLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixLQUFLLEVBQUU7b0JBQ0gsSUFBSSxFQUFFLE1BQUEsS0FBSyxhQUFMLEtBQUssY0FBTCxLQUFLLEdBQUksS0FBSyxtQ0FBSSxJQUFJO2lCQUMvQjtnQkFDRCxNQUFNLEVBQUU7b0JBQ0osS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO29CQUNuQixJQUFJLEVBQUUsTUFBQSxNQUFBLE1BQU0sQ0FBQyxJQUFJLG1DQUFJLElBQUksbUNBQUksa0JBQWtCO29CQUMvQyxNQUFNLEVBQUUsTUFBQSxNQUFBLE1BQU0sQ0FBQyxNQUFNLG1DQUFJLE1BQU0sbUNBQUksa0JBQWtCO29CQUNyRCxXQUFXLEVBQUUsV0FBVyxhQUFYLFdBQVcsY0FBWCxXQUFXLEdBQUksQ0FBQztvQkFDN0IsYUFBYSxFQUFFLGFBQWEsYUFBYixhQUFhLGNBQWIsYUFBYSxHQUFJLENBQUM7aUJBQ3BDO2FBQ0o7U0FDSixDQUFDO1FBQ0YsT0FBTyxVQUFVLENBQUM7SUFDdEIsQ0FBQztJQUVELHVCQUF1QixDQUFDLEVBQ3BCLGdCQUFnQixFQUNoQixlQUFlLEdBSWxCO1FBQ0csTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQztRQUUxQixnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxlQUFlLEVBQUUsRUFBRTtZQUN6QyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFOztnQkFDbkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDcEQsTUFBTSxJQUFJLEdBQUcsTUFBQSxNQUFBLEtBQUssQ0FBQyxLQUFLLDBDQUFFLElBQUksbUNBQUksQ0FBQyxDQUFDO2dCQUVwQyxNQUFNLEVBQUUsR0FBRyxNQUFBLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxJQUFJLG1DQUFJLElBQUksQ0FBQztnQkFFaEMsTUFBQSxJQUFJLENBQUMsZ0JBQWdCLDBDQUFFLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLHVCQUF1QixNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUU7b0JBQ3pFLElBQUksRUFBRSxDQUFDO29CQUNQLEVBQUUsRUFBRSxFQUFFO29CQUNOLG1CQUFtQixFQUFFLElBQUk7b0JBQ3pCLFFBQVE7b0JBQ1IsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNO29CQUNuQixNQUFNLEVBQUUsQ0FBQztvQkFDVCxRQUFRLENBQUMsSUFBSTt3QkFDVCxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztvQkFDdkIsQ0FBQztpQkFDSixDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLGNBQWMsRUFBRSxFQUFFO1lBQ3ZDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTs7Z0JBQzFCLE1BQUEsSUFBSSxDQUFDLGdCQUFnQiwwQ0FBRSxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSx1QkFBdUIsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFO29CQUN4RSxJQUFJLEVBQUUsQ0FBQztvQkFDUCxFQUFFLEVBQUUsQ0FBQztvQkFDTCxLQUFLLEVBQUUsUUFBUTtvQkFDZixRQUFRLEVBQUUsYUFBYTtvQkFDdkIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNO29CQUNuQixNQUFNLEVBQUUsQ0FBQztvQkFDVCxRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRTt3QkFDbEIsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7b0JBQzVCLENBQUM7aUJBQ0osQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxFQUFFLGdCQUFnQixFQUFvRTtRQUNyRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxlQUFlLEVBQUUsRUFBRTtZQUN6QyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFOztnQkFDbkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDcEQsTUFBTSxJQUFJLEdBQUcsTUFBQSxNQUFBLEtBQUssQ0FBQyxLQUFLLDBDQUFFLElBQUksbUNBQUksQ0FBQyxDQUFDO2dCQUVwQyxNQUFNLENBQUMsSUFBSSxHQUFHLE1BQUEsTUFBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLElBQUksbUNBQUksSUFBSSxDQUFDO1lBQ3ZDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsZ0JBQWdCLENBQUMsTUFBYyxFQUFFLEtBQXVCOztRQUNwRCxNQUFNLEVBQ0YsSUFBSSxHQUFHLEVBQUUsRUFDVCxJQUFJLEdBQUcsRUFBRSxFQUNULE1BQU0sRUFBRSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxFQUMxQyxFQUFFLEVBQUUsUUFBUSxFQUNaLEdBQUcsRUFBRSxFQUFFLGFBQWEsRUFBRSxHQUN6QixHQUFHLElBQUksQ0FBQztRQUNULE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBRWxDLE1BQU0sSUFBSSxHQUFHLE1BQUEsS0FBSyxDQUFDLElBQUksbUNBQUksTUFBTSxDQUFDLElBQUksQ0FBQztRQUN2QyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzdCLE1BQU0sV0FBVyxHQUFHLGlCQUFpQixhQUFqQixpQkFBaUIsY0FBakIsaUJBQWlCLEdBQUksQ0FBQyxDQUFDO1FBQzNDLE1BQU0sSUFBSSxHQUFHLE1BQUEsTUFBQSxLQUFLLENBQUMsS0FBSywwQ0FBRSxJQUFJLG1DQUFJLENBQUMsQ0FBQztRQUVwQyxJQUFJLE1BQU0sR0FBOEMsU0FBUyxDQUFDO1FBQ2xFLElBQUksU0FBUyxFQUFFO1lBQ1gsTUFBTSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNuQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUs7Z0JBQ2xCLElBQUk7Z0JBQ0osSUFBSTtnQkFDSixJQUFJO2dCQUNKLE1BQU07Z0JBQ04sV0FBVztnQkFDWCxJQUFJO2dCQUNKLFdBQVcsRUFBRSxLQUFLO2dCQUNsQixRQUFRO2FBQ1gsQ0FBQyxDQUFDO1NBQ047UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRVMsY0FBYztRQUNwQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO0lBQzlCLENBQUM7O0FBcmtCTSx1QkFBUyxHQUFHLGVBQWUsQ0FBQztBQUM1QixrQkFBSSxHQUFHLFNBQWtCLENBQUM7QUFTakM7SUFEQyxRQUFRLENBQUMsVUFBVSxDQUFDOzRDQUNNO0FBRzNCO0lBREMsUUFBUSxDQUFDLFVBQVUsQ0FBQzsrQ0FDUztBQUc5QjtJQURDLFFBQVEsQ0FBQyxVQUFVLENBQUM7NENBQ007QUFHM0I7SUFEQyxRQUFRLENBQUMsVUFBVSxDQUFDOzRDQUNNO0FBRzNCO0lBREMsUUFBUSxDQUFDLFVBQVUsQ0FBQzsrQ0FDTTtBQUczQjtJQURDLFFBQVEsQ0FBQyxVQUFVLENBQUM7Z0RBQ1E7QUFHN0I7SUFEQyxRQUFRLENBQUMsVUFBVSxDQUFDOzJDQUNLO0FBRzFCO0lBREMsUUFBUSxDQUFDLFVBQVUsQ0FBQzsyQ0FDSztBQUcxQjtJQURDLFFBQVEsQ0FBQyxVQUFVLENBQUM7OENBQ1E7QUFHN0I7SUFEQyxRQUFRLENBQUMsVUFBVSxDQUFDOytDQUNTO0FBRzlCO0lBREMsUUFBUSxDQUFDLFVBQVUsQ0FBQztnREFDUTtBQUc3QjtJQURDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQztrREFDbUI7QUFHOUM7SUFEQyxRQUFRLENBQUMsa0JBQWtCLENBQUM7aURBQzRCIn0=