var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { SeriesTooltip, SeriesNodePickMode, } from '../series';
import { extent } from '../../../util/array';
import { LinearScale } from '../../../scale/linearScale';
import { CartesianSeries, CartesianSeriesMarker } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { getMarker } from '../../marker/util';
import { toTooltipHtml } from '../../chart';
import { ContinuousScale } from '../../../scale/continuousScale';
import { sanitizeHtml } from '../../../util/sanitize';
import { Label } from '../../label';
import { Text } from '../../../scene/shape/text';
import { HdpiCanvas } from '../../../canvas/hdpiCanvas';
import { checkDatum, isContinuous } from '../../../util/value';
import { Deprecated } from '../../../util/validation';
export class ScatterSeriesTooltip extends SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
    }
}
export class ScatterSeries extends CartesianSeries {
    constructor() {
        super({
            pickGroupIncludes: ['markers'],
            pickModes: [
                SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST,
                SeriesNodePickMode.NEAREST_NODE,
                SeriesNodePickMode.EXACT_SHAPE_MATCH,
            ],
            pathsPerSeries: 0,
            features: ['markers'],
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
        /**
         * @deprecated Use {@link marker.fill} instead.
         */
        this.fill = '#c16068';
        /**
         * @deprecated Use {@link marker.stroke} instead.
         */
        this.stroke = '#874349';
        /**
         * @deprecated Use {@link marker.strokeWidth} instead.
         */
        this.strokeWidth = 2;
        /**
         * @deprecated Use {@link marker.fillOpacity} instead.
         */
        this.fillOpacity = 1;
        /**
         * @deprecated Use {@link marker.strokeOpacity} instead.
         */
        this.strokeOpacity = 1;
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
    setColors(fills, strokes) {
        this.marker.fill = fills[0];
        this.marker.stroke = strokes[0];
    }
    processData() {
        const { xKey, yKey, sizeKey, xAxis, yAxis, marker } = this;
        if (!xAxis || !yAxis) {
            return false;
        }
        const data = xKey && yKey && this.data ? this.data : [];
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const isContinuousX = xScale instanceof ContinuousScale;
        const isContinuousY = yScale instanceof ContinuousScale;
        this.validData = data.filter((d) => checkDatum(d[xKey], isContinuousX) !== undefined && checkDatum(d[yKey], isContinuousY) !== undefined);
        this.xData = this.validData.map((d) => d[xKey]);
        this.yData = this.validData.map((d) => d[yKey]);
        this.sizeData = sizeKey ? this.validData.map((d) => d[sizeKey]) : [];
        this.sizeScale.domain = marker.domain ? marker.domain : extent(this.sizeData, isContinuous) || [1, 1];
        if (xAxis.scale instanceof ContinuousScale) {
            this.xDomain = this.fixNumericExtent(extent(this.xData, isContinuous), xAxis);
        }
        else {
            this.xDomain = this.xData;
        }
        if (yAxis.scale instanceof ContinuousScale) {
            this.yDomain = this.fixNumericExtent(extent(this.yData, isContinuous), yAxis);
        }
        else {
            this.yDomain = this.yData;
        }
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
    fireNodeClickEvent(event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event,
            series: this,
            datum: datum.datum,
            xKey: this.xKey,
            yKey: this.yKey,
            sizeKey: this.sizeKey,
        });
    }
    createNodeData() {
        const { chart, data, visible, xAxis, yAxis, label, labelKey } = this;
        if (!(chart && data && visible && xAxis && yAxis)) {
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
            nodeData[actualLength++] = {
                series: this,
                datum: validData[i],
                point: { x, y },
                size: sizeData.length ? sizeScale.convert(sizeData[i]) : marker.size,
                label: Object.assign({ text }, size),
            };
        }
        nodeData.length = actualLength;
        return [{ itemId: this.yKey, nodeData, labelData: nodeData }];
    }
    isPathOrSelectionDirty() {
        return this.marker.isDirty();
    }
    getLabelData() {
        var _a;
        return (_a = this.contextNodeData) === null || _a === void 0 ? void 0 : _a.reduce((r, n) => r.concat(n.labelData), []);
    }
    updateMarkerSelection(opts) {
        let { nodeData, markerSelection } = opts;
        const { marker: { enabled, shape }, } = this;
        const MarkerShape = getMarker(shape);
        if (this.marker.isDirty()) {
            markerSelection = markerSelection.setData([]);
            markerSelection.exit.remove();
        }
        const data = enabled ? nodeData : [];
        const updateMarkers = markerSelection.setData(data);
        updateMarkers.exit.remove();
        const enterMarkers = updateMarkers.enter.append(MarkerShape);
        return updateMarkers.merge(enterMarkers);
    }
    updateMarkerNodes(opts) {
        const { markerSelection, isHighlight: isDatumHighlighted } = opts;
        const { marker, xKey, yKey, strokeWidth, fillOpacity, strokeOpacity, fill: seriesFill, stroke: seriesStroke, sizeScale, highlightStyle: { fill: deprecatedFill, stroke: deprecatedStroke, strokeWidth: deprecatedStrokeWidth, item: { fill: highlightedFill = deprecatedFill, stroke: highlightedStroke = deprecatedStroke, strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth, }, }, } = this;
        const markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : strokeWidth;
        const { formatter } = marker;
        sizeScale.range = [marker.size, marker.maxSize];
        markerSelection.each((node, datum) => {
            const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill || seriesFill;
            const stroke = isDatumHighlighted && highlightedStroke !== undefined
                ? highlightedStroke
                : marker.stroke || seriesStroke;
            const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                ? highlightedDatumStrokeWidth
                : markerStrokeWidth;
            const size = datum.size;
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
                });
            }
            node.fill = (format && format.fill) || fill;
            node.stroke = (format && format.stroke) || stroke;
            node.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
            node.size = format && format.size !== undefined ? format.size : size;
            node.fillOpacity = marker.fillOpacity !== undefined ? marker.fillOpacity : fillOpacity;
            node.strokeOpacity = marker.strokeOpacity !== undefined ? marker.strokeOpacity : strokeOpacity;
            node.translationX = datum.point.x;
            node.translationY = datum.point.y;
            node.visible = node.size > 0;
        });
        if (!isDatumHighlighted) {
            this.marker.markClean();
        }
    }
    updateLabelSelection(opts) {
        var _a, _b;
        const { labelSelection } = opts;
        const placedLabels = (_b = (_a = this.chart) === null || _a === void 0 ? void 0 : _a.placeLabels().get(this), (_b !== null && _b !== void 0 ? _b : []));
        const placedNodeDatum = placedLabels.map((v) => (Object.assign(Object.assign({}, v.datum), { point: {
                x: v.x,
                y: v.y,
            } })));
        const updateLabels = labelSelection.setData(placedNodeDatum);
        updateLabels.exit.remove();
        const enterLabels = updateLabels.enter.append(Text);
        return updateLabels.merge(enterLabels);
    }
    updateLabelNodes(opts) {
        const { labelSelection } = opts;
        const { label } = this;
        labelSelection.each((text, datum) => {
            text.text = datum.label.text;
            text.fill = label.color;
            text.x = datum.point.x;
            text.y = datum.point.y;
            text.fontStyle = label.fontStyle;
            text.fontWeight = label.fontWeight;
            text.fontSize = label.fontSize;
            text.fontFamily = label.fontFamily;
            text.textAlign = 'left';
            text.textBaseline = 'top';
        });
    }
    getTooltipHtml(nodeDatum) {
        var _a, _b;
        const { xKey, yKey, xAxis, yAxis } = this;
        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        const { fill: seriesFill, stroke: seriesStroke, marker, tooltip, xName, yName, sizeKey, sizeName, labelKey, labelName, } = this;
        const fill = (_a = marker.fill, (_a !== null && _a !== void 0 ? _a : seriesFill));
        const stroke = (_b = marker.stroke, (_b !== null && _b !== void 0 ? _b : seriesStroke));
        const strokeWidth = this.getStrokeWidth(marker.strokeWidth || this.strokeWidth);
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
                size: nodeDatum.size,
                highlighted: false,
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
            }), defaults);
        }
        return toTooltipHtml(defaults);
    }
    listSeriesItems(legendData) {
        const { id, data, xKey, yKey, yName, title, visible, marker, fill, stroke, fillOpacity, strokeOpacity } = this;
        if (data && data.length && xKey && yKey) {
            legendData.push({
                id,
                itemId: undefined,
                enabled: visible,
                label: {
                    text: title || yName || yKey,
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill || fill || 'rgba(0, 0, 0, 0)',
                    stroke: marker.stroke || stroke || 'rgba(0, 0, 0, 0)',
                    fillOpacity: marker.fillOpacity !== undefined ? marker.fillOpacity : fillOpacity,
                    strokeOpacity: marker.strokeOpacity !== undefined ? marker.strokeOpacity : strokeOpacity,
                },
            });
        }
    }
}
ScatterSeries.className = 'ScatterSeries';
ScatterSeries.type = 'scatter';
__decorate([
    Deprecated('Use marker.fill instead.', { default: '#c16068' })
], ScatterSeries.prototype, "fill", void 0);
__decorate([
    Deprecated('Use marker.stroke instead.', { default: '#874349' })
], ScatterSeries.prototype, "stroke", void 0);
__decorate([
    Deprecated('Use marker.strokeWidth instead.', { default: 2 })
], ScatterSeries.prototype, "strokeWidth", void 0);
__decorate([
    Deprecated('Use marker.fillOpacity instead.', { default: 1 })
], ScatterSeries.prototype, "fillOpacity", void 0);
__decorate([
    Deprecated('Use marker.strokeOpacity instead.', { default: 1 })
], ScatterSeries.prototype, "strokeOpacity", void 0);
