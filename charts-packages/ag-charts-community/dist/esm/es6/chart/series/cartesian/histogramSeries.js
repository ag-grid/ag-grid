var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Group } from "../../../scene/group";
import { Selection } from "../../../scene/selection";
import { Rect } from "../../../scene/shape/rect";
import { Text } from "../../../scene/shape/text";
import { SeriesTooltip, Series } from "../series";
import { Label } from "../../label";
import { PointerEvents } from "../../../scene/node";
import { CartesianSeries } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { toTooltipHtml } from "../../chart";
import { extent } from "../../../util/array";
import { reactive } from "../../../util/observable";
import ticks, { tickStep } from "../../../util/ticks";
import { sanitizeHtml } from "../../../util/sanitize";
import { isContinuous } from "../../../util/value";
var HistogramSeriesNodeTag;
(function (HistogramSeriesNodeTag) {
    HistogramSeriesNodeTag[HistogramSeriesNodeTag["Bin"] = 0] = "Bin";
    HistogramSeriesNodeTag[HistogramSeriesNodeTag["Label"] = 1] = "Label";
})(HistogramSeriesNodeTag || (HistogramSeriesNodeTag = {}));
class HistogramSeriesLabel extends Label {
}
__decorate([
    reactive('change')
], HistogramSeriesLabel.prototype, "formatter", void 0);
const defaultBinCount = 10;
const aggregationFunctions = {
    count: bin => bin.data.length,
    sum: (bin, yKey) => bin.data.reduce((acc, datum) => acc + datum[yKey], 0),
    mean: (bin, yKey) => aggregationFunctions.sum(bin, yKey) / aggregationFunctions.count(bin, yKey)
};
export class HistogramBin {
    constructor([domainMin, domainMax]) {
        this.data = [];
        this.aggregatedValue = 0;
        this.frequency = 0;
        this.domain = [domainMin, domainMax];
    }
    ;
    addDatum(datum) {
        this.data.push(datum);
        this.frequency++;
    }
    get domainWidth() {
        const [domainMin, domainMax] = this.domain;
        return domainMax - domainMin;
    }
    get relativeHeight() {
        return this.aggregatedValue / this.domainWidth;
    }
    calculateAggregatedValue(aggregationName, yKey) {
        if (!yKey) {
            // not having a yKey forces us into a frequency plot
            aggregationName = 'count';
        }
        const aggregationFunction = aggregationFunctions[aggregationName];
        this.aggregatedValue = aggregationFunction(this, yKey);
    }
    getY(areaPlot) {
        return areaPlot ? this.relativeHeight : this.aggregatedValue;
    }
}
export class HistogramSeriesTooltip extends SeriesTooltip {
}
__decorate([
    reactive('change')
], HistogramSeriesTooltip.prototype, "renderer", void 0);
export class HistogramSeries extends CartesianSeries {
    constructor() {
        super();
        // Need to put column and label nodes into separate groups, because even though label nodes are
        // created after the column nodes, this only guarantees that labels will always be on top of columns
        // on the first run. If on the next run more columns are added, they might clip the labels
        // rendered during the previous run.
        this.rectGroup = this.pickGroup.appendChild(new Group());
        this.textGroup = this.group.appendChild(new Group());
        this.rectSelection = Selection.select(this.rectGroup).selectAll();
        this.textSelection = Selection.select(this.textGroup).selectAll();
        this.binnedData = [];
        this.xDomain = [];
        this.yDomain = [];
        this.label = new HistogramSeriesLabel();
        this.seriesItemEnabled = true;
        this.tooltip = new HistogramSeriesTooltip();
        this.fill = undefined;
        this.stroke = undefined;
        this.fillOpacity = 1;
        this.strokeOpacity = 1;
        this.lineDash = [0];
        this.lineDashOffset = 0;
        this.directionKeys = {
            [ChartAxisDirection.X]: ['xKey'],
            [ChartAxisDirection.Y]: ['yKey']
        };
        this._xKey = '';
        this._areaPlot = false;
        this._bins = undefined;
        this._aggregation = 'count';
        this._binCount = undefined;
        this._xName = '';
        this._yKey = '';
        this._yName = '';
        this._strokeWidth = 1;
        this.label.enabled = false;
        this.label.addEventListener('change', this.scheduleUpdate, this);
    }
    getKeys(direction) {
        const { directionKeys } = this;
        const keys = directionKeys && directionKeys[direction];
        const values = [];
        if (keys) {
            keys.forEach(key => {
                const value = this[key];
                if (value) {
                    if (Array.isArray(value)) {
                        values.push(...value);
                    }
                    else {
                        values.push(value);
                    }
                }
            });
        }
        return values;
    }
    set xKey(value) {
        if (this._xKey !== value) {
            this._xKey = value;
            this.scheduleData();
        }
    }
    get xKey() {
        return this._xKey;
    }
    set areaPlot(c) {
        this._areaPlot = c;
        this.scheduleData();
    }
    get areaPlot() {
        return this._areaPlot;
    }
    set bins(bins) {
        this._bins = bins;
        this.scheduleData();
    }
    get bins() {
        return this._bins;
    }
    set aggregation(aggregation) {
        this._aggregation = aggregation;
        this.scheduleData();
    }
    get aggregation() {
        return this._aggregation;
    }
    set binCount(binCount) {
        this._binCount = binCount;
        this.scheduleData();
    }
    get binCount() {
        return this._binCount;
    }
    set xName(value) {
        if (this._xName !== value) {
            this._xName = value;
            this.scheduleUpdate();
        }
    }
    get xName() {
        return this._xName;
    }
    set yKey(yKey) {
        this._yKey = yKey;
        this.seriesItemEnabled = true;
        this.scheduleData();
    }
    get yKey() {
        return this._yKey;
    }
    set yName(values) {
        this._yName = values;
        this.scheduleData();
    }
    get yName() {
        return this._yName;
    }
    set strokeWidth(value) {
        if (this._strokeWidth !== value) {
            this._strokeWidth = value;
            this.scheduleUpdate();
        }
    }
    get strokeWidth() {
        return this._strokeWidth;
    }
    set shadow(value) {
        if (this._shadow !== value) {
            this._shadow = value;
            this.scheduleUpdate();
        }
    }
    get shadow() {
        return this._shadow;
    }
    onHighlightChange() {
        this.updateRectNodes();
    }
    setColors(fills, strokes) {
        this.fill = fills[0];
        this.stroke = strokes[0];
    }
    // During processData phase, used to unify different ways of the user specifying
    // the bins. Returns bins in format[[min1, max1], [min2, max2], ... ].
    deriveBins() {
        const { bins, binCount } = this;
        if (!this.data) {
            return [];
        }
        if (bins) {
            return bins;
        }
        const xData = this.data.map(datum => datum[this.xKey]);
        const xDomain = this.fixNumericExtent(extent(xData, isContinuous), 'x');
        const binStarts = ticks(xDomain[0], xDomain[1], this.binCount || defaultBinCount);
        const binSize = tickStep(xDomain[0], xDomain[1], this.binCount || defaultBinCount);
        const firstBinEnd = binStarts[0];
        const expandStartToBin = n => [n, n + binSize];
        return [
            [firstBinEnd - binSize, firstBinEnd],
            ...binStarts.map(expandStartToBin)
        ];
    }
    placeDataInBins(data) {
        const { xKey } = this;
        const derivedBins = this.deriveBins();
        // creating a sorted copy allows binning in O(n) rather than O(n²)
        // but at the expense of more temporary memory
        const sortedData = data.slice().sort((a, b) => {
            if (a[xKey] < b[xKey]) {
                return -1;
            }
            if (a[xKey] > b[xKey]) {
                return 1;
            }
            return 0;
        });
        let currentBin = 0;
        const bins = [new HistogramBin(derivedBins[0])];
        loop: for (let i = 0, ln = sortedData.length; i < ln; i++) {
            const datum = sortedData[i];
            while (datum[xKey] > derivedBins[currentBin][1]) {
                currentBin++;
                const bin = derivedBins[currentBin];
                if (!bin) {
                    break loop;
                }
                bins.push(new HistogramBin(bin));
            }
            bins[currentBin].addDatum(datum);
        }
        bins.forEach(b => b.calculateAggregatedValue(this._aggregation, this.yKey));
        return bins;
    }
    get xMax() {
        return this.data && this.data.reduce((acc, datum) => {
            return Math.max(acc, datum[this.xKey]);
        }, Number.NEGATIVE_INFINITY);
    }
    processData() {
        const { xKey, data } = this;
        this.binnedData = this.placeDataInBins(xKey && data ? data : []);
        const yData = this.binnedData.map(b => b.getY(this.areaPlot));
        const yMinMax = extent(yData, isContinuous);
        this.yDomain = this.fixNumericExtent([0, yMinMax ? yMinMax[1] : 1], 'y');
        const firstBin = this.binnedData[0];
        const lastBin = this.binnedData[this.binnedData.length - 1];
        const xMin = firstBin.domain[0];
        const xMax = lastBin.domain[1];
        this.xDomain = [xMin, xMax];
        this.fireEvent({ type: 'dataProcessed' });
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
            xKey: this.xKey
        });
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
        const nodeData = this.createNodeData();
        this.updateRectSelection(nodeData);
        this.updateTextSelection(nodeData);
    }
    updateNodes() {
        this.group.visible = this.visible;
        this.updateRectNodes();
        this.updateTextNodes();
    }
    createNodeData() {
        const { xAxis, yAxis } = this;
        if (!this.seriesItemEnabled || !xAxis || !yAxis) {
            return [];
        }
        const { scale: xScale } = xAxis;
        const { scale: yScale } = yAxis;
        const { fill, stroke, strokeWidth } = this;
        const nodeData = [];
        const defaultLabelFormatter = (params) => String(params.value);
        const { label: { formatter: labelFormatter = defaultLabelFormatter, fontStyle: labelFontStyle, fontWeight: labelFontWeight, fontSize: labelFontSize, fontFamily: labelFontFamily, color: labelColor } } = this;
        this.binnedData.forEach(binOfData => {
            const { aggregatedValue: total, frequency, domain: [xDomainMin, xDomainMax], relativeHeight } = binOfData;
            const xMinPx = xScale.convert(xDomainMin), xMaxPx = xScale.convert(xDomainMax), 
            // note: assuming can't be negative:
            y = this.areaPlot ? relativeHeight : (this.yKey ? total : frequency), yZeroPx = yScale.convert(0), yMaxPx = yScale.convert(y), w = xMaxPx - xMinPx, h = Math.abs(yMaxPx - yZeroPx);
            const selectionDatumLabel = y !== 0 ? {
                text: labelFormatter({ value: binOfData.aggregatedValue }),
                fontStyle: labelFontStyle,
                fontWeight: labelFontWeight,
                fontSize: labelFontSize,
                fontFamily: labelFontFamily,
                fill: labelColor,
                x: xMinPx + w / 2,
                y: yMaxPx + h / 2
            } : undefined;
            nodeData.push({
                series: this,
                datum: binOfData,
                // since each selection is an aggregation of multiple data.
                x: xMinPx,
                y: yMaxPx,
                width: w,
                height: h,
                fill: fill,
                stroke: stroke,
                strokeWidth: strokeWidth,
                label: selectionDatumLabel,
            });
        });
        return nodeData;
    }
    updateRectSelection(nodeData) {
        const updateRects = this.rectSelection.setData(nodeData);
        updateRects.exit.remove();
        const enterRects = updateRects.enter.append(Rect).each(rect => {
            rect.tag = HistogramSeriesNodeTag.Bin;
            rect.crisp = true;
        });
        this.rectSelection = updateRects.merge(enterRects);
    }
    updateRectNodes() {
        if (!this.chart) {
            return;
        }
        const { fillOpacity, strokeOpacity, shadow, chart: { highlightedDatum }, highlightStyle: { fill: deprecatedFill, stroke: deprecatedStroke, strokeWidth: deprecatedStrokeWidth, item: { fill: highlightedFill = deprecatedFill, stroke: highlightedStroke = deprecatedStroke, strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth, } } } = this;
        this.rectSelection.each((rect, datum, index) => {
            const isDatumHighlighted = datum === highlightedDatum;
            const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                ? highlightedDatumStrokeWidth
                : this.getStrokeWidth(datum.strokeWidth, datum);
            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
            rect.fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : datum.fill;
            rect.stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : datum.stroke;
            rect.fillOpacity = fillOpacity;
            rect.strokeOpacity = strokeOpacity;
            rect.strokeWidth = strokeWidth;
            rect.lineDash = this.lineDash;
            rect.lineDashOffset = this.lineDashOffset;
            rect.fillShadow = shadow;
            rect.zIndex = isDatumHighlighted ? Series.highlightedZIndex : index;
            rect.visible = datum.height > 0; // prevent stroke from rendering for zero height columns
            rect.opacity = this.getOpacity(datum);
        });
    }
    updateTextSelection(nodeData) {
        const updateTexts = this.textSelection.setData(nodeData);
        updateTexts.exit.remove();
        const enterTexts = updateTexts.enter.append(Text).each(text => {
            text.tag = HistogramSeriesNodeTag.Label;
            text.pointerEvents = PointerEvents.None;
            text.textAlign = 'center';
            text.textBaseline = 'middle';
        });
        this.textSelection = updateTexts.merge(enterTexts);
    }
    updateTextNodes() {
        const labelEnabled = this.label.enabled;
        this.textSelection.each((text, datum) => {
            const label = datum.label;
            if (label && labelEnabled) {
                text.text = label.text;
                text.x = label.x;
                text.y = label.y;
                text.fontStyle = label.fontStyle;
                text.fontWeight = label.fontWeight;
                text.fontSize = label.fontSize;
                text.fontFamily = label.fontFamily;
                text.fill = label.fill;
                text.visible = true;
            }
            else {
                text.visible = false;
            }
        });
    }
    getTooltipHtml(nodeDatum) {
        const { xKey, yKey, xAxis, yAxis } = this;
        if (!xKey || !xAxis || !yAxis) {
            return '';
        }
        const { xName, yName, fill: color, tooltip, aggregation } = this;
        const { renderer: tooltipRenderer } = tooltip;
        const bin = nodeDatum.datum;
        const { aggregatedValue, frequency, domain: [rangeMin, rangeMax] } = bin;
        const title = `${sanitizeHtml(xName || xKey)}: ${xAxis.formatDatum(rangeMin)} - ${xAxis.formatDatum(rangeMax)}`;
        let content = yKey ?
            `<b>${sanitizeHtml(yName || yKey)} (${aggregation})</b>: ${yAxis.formatDatum(aggregatedValue)}<br>` :
            '';
        content += `<b>Frequency</b>: ${frequency}`;
        const defaults = {
            title,
            backgroundColor: color,
            content
        };
        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
                datum: bin,
                xKey,
                xValue: bin.domain,
                xName,
                yKey,
                yValue: bin.aggregatedValue,
                yName,
                color
            }), defaults);
        }
        return toTooltipHtml(defaults);
    }
    listSeriesItems(legendData) {
        const { id, data, yKey, yName, seriesItemEnabled, fill, stroke, fillOpacity, strokeOpacity } = this;
        if (data && data.length) {
            legendData.push({
                id,
                itemId: yKey,
                enabled: seriesItemEnabled,
                label: {
                    text: yName || yKey || 'Frequency'
                },
                marker: {
                    fill: fill || 'rgba(0, 0, 0, 0)',
                    stroke: stroke || 'rgba(0, 0, 0, 0)',
                    fillOpacity: fillOpacity,
                    strokeOpacity: strokeOpacity
                }
            });
        }
    }
    toggleSeriesItem(itemId, enabled) {
        if (itemId === this.yKey) {
            this.seriesItemEnabled = enabled;
        }
        this.scheduleData();
    }
}
HistogramSeries.className = 'HistogramSeries';
HistogramSeries.type = 'histogram';
__decorate([
    reactive('dataChange')
], HistogramSeries.prototype, "fill", void 0);
__decorate([
    reactive('dataChange')
], HistogramSeries.prototype, "stroke", void 0);
__decorate([
    reactive('layoutChange')
], HistogramSeries.prototype, "fillOpacity", void 0);
__decorate([
    reactive('layoutChange')
], HistogramSeries.prototype, "strokeOpacity", void 0);
__decorate([
    reactive('update')
], HistogramSeries.prototype, "lineDash", void 0);
__decorate([
    reactive('update')
], HistogramSeries.prototype, "lineDashOffset", void 0);
//# sourceMappingURL=histogramSeries.js.map