import { Rect } from '../../../scene/shape/rect';
import { Text } from '../../../scene/shape/text';
import { BandScale } from '../../../scale/bandScale';
import { SeriesTooltip, SeriesNodePickMode, } from '../series';
import { Label } from '../../label';
import { PointerEvents } from '../../../scene/node';
import { CartesianSeries } from './cartesianSeries';
import { ChartAxisDirection, flipChartAxisDirection } from '../../chartAxis';
import { toTooltipHtml } from '../../chart';
import { findMinMax } from '../../../util/array';
import { equal } from '../../../util/equal';
import { sanitizeHtml } from '../../../util/sanitize';
import { checkDatum, isNumber } from '../../../util/value';
import { clamper, ContinuousScale } from '../../../scale/continuousScale';
var BarSeriesNodeTag;
(function (BarSeriesNodeTag) {
    BarSeriesNodeTag[BarSeriesNodeTag["Bar"] = 0] = "Bar";
    BarSeriesNodeTag[BarSeriesNodeTag["Label"] = 1] = "Label";
})(BarSeriesNodeTag || (BarSeriesNodeTag = {}));
export var BarLabelPlacement;
(function (BarLabelPlacement) {
    BarLabelPlacement["Inside"] = "inside";
    BarLabelPlacement["Outside"] = "outside";
})(BarLabelPlacement || (BarLabelPlacement = {}));
export class BarSeriesLabel extends Label {
    constructor() {
        super(...arguments);
        this.formatter = undefined;
        this.placement = BarLabelPlacement.Inside;
    }
}
export class BarSeriesTooltip extends SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
    }
}
function flat(arr, target = []) {
    arr.forEach((v) => {
        if (Array.isArray(v)) {
            flat(v, target);
        }
        else {
            target.push(v);
        }
    });
    return target;
}
function is2dArray(array) {
    return array.length > 0 && Array.isArray(array[0]);
}
export class BarSeries extends CartesianSeries {
    constructor() {
        super({
            pickGroupIncludes: ['datumNodes'],
            pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH],
            pathsPerSeries: 0,
        });
        this.xData = [];
        this.yData = [];
        this.yDomain = [];
        this.label = new BarSeriesLabel();
        this.tooltip = new BarSeriesTooltip();
        this.flipXY = false;
        this.fills = ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'];
        this.strokes = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];
        this.fillOpacity = 1;
        this.strokeOpacity = 1;
        this.lineDash = [0];
        this.lineDashOffset = 0;
        this.formatter = undefined;
        /**
         * Used to get the position of bars within each group.
         */
        this.groupScale = new BandScale();
        this.directionKeys = {
            [ChartAxisDirection.X]: ['xKey'],
            [ChartAxisDirection.Y]: ['yKeys'],
        };
        this._xKey = '';
        this.xName = '';
        this.cumYKeyCount = [];
        this.flatYKeys = undefined; // only set when a user used a flat array for yKeys
        this.hideInLegend = [];
        /**
         * yKeys: [['coffee']] - regular bars, each category has a single bar that shows a value for coffee
         * yKeys: [['coffee'], ['tea'], ['milk']] - each category has three bars that show values for coffee, tea and milk
         * yKeys: [['coffee', 'tea', 'milk']] - each category has a single bar with three stacks that show values for coffee, tea and milk
         * yKeys: [['coffee', 'tea', 'milk'], ['paper', 'ink']] - each category has 2 stacked bars,
         *     first showing values for coffee, tea and milk and second values for paper and ink
         */
        this._yKeys = [];
        this._grouped = false;
        /**
         * A map of `yKeys` to their names (used in legends and tooltips).
         * For example, if a key is `product_name` it's name can be a more presentable `Product Name`.
         */
        this._yNames = {};
        this.strokeWidth = 1;
        this.shadow = undefined;
        this.smallestDataInterval = undefined;
        this.label.enabled = false;
    }
    getKeys(direction) {
        const { directionKeys } = this;
        const keys = directionKeys && directionKeys[this.flipXY ? flipChartAxisDirection(direction) : direction];
        let values = [];
        if (keys) {
            keys.forEach((key) => {
                const value = this[key];
                if (value) {
                    if (Array.isArray(value)) {
                        values = values.concat(flat(value));
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
        this._xKey = value;
        this.xData = [];
    }
    get xKey() {
        return this._xKey;
    }
    set yKeys(yKeys) {
        let flatYKeys = undefined;
        // Convert from flat y-keys to grouped y-keys.
        if (!is2dArray(yKeys)) {
            flatYKeys = yKeys;
            yKeys = this.grouped ? flatYKeys.map((k) => [k]) : [flatYKeys];
        }
        if (!equal(this._yKeys, yKeys)) {
            this.flatYKeys = flatYKeys ? flatYKeys : undefined;
            this._yKeys = yKeys;
            let prevYKeyCount = 0;
            this.cumYKeyCount = [];
            const visibleStacks = [];
            yKeys.forEach((stack, index) => {
                if (stack.length > 0) {
                    visibleStacks.push(String(index));
                }
                this.cumYKeyCount.push(prevYKeyCount);
                prevYKeyCount += stack.length;
            });
            this.yData = [];
            this.processSeriesItemEnabled();
            const { groupScale } = this;
            groupScale.domain = visibleStacks;
            groupScale.padding = 0.1;
            groupScale.round = true;
        }
    }
    get yKeys() {
        return this._yKeys;
    }
    set visibles(visibles) {
        const flattenFn = (r, n) => r.concat(...(Array.isArray(n) ? n : [n]));
        this._visibles = visibles.reduce(flattenFn, []);
        this.processSeriesItemEnabled();
    }
    get visibles() {
        return this._visibles;
    }
    processSeriesItemEnabled() {
        const { seriesItemEnabled, _visibles: visibles = [] } = this;
        seriesItemEnabled.clear();
        let visiblesIdx = 0;
        this._yKeys.forEach((stack) => {
            stack.forEach((yKey) => { var _a, _b; return seriesItemEnabled.set(yKey, (_b = (_a = visibles) === null || _a === void 0 ? void 0 : _a[visiblesIdx++], (_b !== null && _b !== void 0 ? _b : true))); });
        });
    }
    set grouped(value) {
        if (this._grouped !== value) {
            this._grouped = value;
            if (this.flatYKeys) {
                this.yKeys = this.flatYKeys;
            }
        }
    }
    get grouped() {
        return this._grouped;
    }
    set yNames(values) {
        if (Array.isArray(values) && this.flatYKeys) {
            const map = {};
            this.flatYKeys.forEach((k, i) => {
                map[k] = values[i];
            });
            values = map;
        }
        this._yNames = values;
    }
    get yNames() {
        return this._yNames;
    }
    setColors(fills, strokes) {
        this.fills = fills;
        this.strokes = strokes;
    }
    set normalizedTo(value) {
        const absValue = value ? Math.abs(value) : undefined;
        this._normalizedTo = absValue;
    }
    get normalizedTo() {
        return this._normalizedTo;
    }
    processData() {
        const { xKey, yKeys, seriesItemEnabled } = this;
        const data = xKey && yKeys.length && this.data ? this.data : [];
        const xAxis = this.getCategoryAxis();
        const yAxis = this.getValueAxis();
        if (!(xAxis && yAxis)) {
            return false;
        }
        const setSmallestXInterval = (curr, prev) => {
            if (this.smallestDataInterval === undefined) {
                this.smallestDataInterval = { x: Infinity, y: Infinity };
            }
            const { x } = this.smallestDataInterval;
            const interval = Math.abs(curr - prev);
            if (interval > 0 && interval < x) {
                this.smallestDataInterval.x = interval;
            }
        };
        const isContinuousX = xAxis.scale instanceof ContinuousScale;
        const isContinuousY = yAxis.scale instanceof ContinuousScale;
        let keysFound = true; // only warn once
        let prevX = Infinity;
        this.xData = data.map((datum) => {
            if (keysFound && !(xKey in datum)) {
                keysFound = false;
                console.warn(`The key '${xKey}' was not found in the data: `, datum);
            }
            const x = checkDatum(datum[xKey], isContinuousX);
            if (isContinuousX) {
                setSmallestXInterval(x, prevX);
            }
            prevX = x;
            return x;
        });
        this.yData = data.map((datum) => yKeys.map((stack) => {
            return stack.map((yKey) => {
                if (keysFound && !(yKey in datum)) {
                    keysFound = false;
                    console.warn(`The key '${yKey}' was not found in the data: `, datum);
                }
                const yDatum = checkDatum(datum[yKey], isContinuousY);
                if (!seriesItemEnabled.get(yKey) || yDatum === undefined) {
                    return NaN;
                }
                return yDatum;
            });
        }));
        // Contains min/max values for each stack in each group,
        // where min is zero and max is a positive total of all values in the stack
        // or min is a negative total of all values in the stack and max is zero.
        const yMinMax = this.yData.map((group) => group.map((stack) => findMinMax(stack)));
        const { yData, normalizedTo } = this;
        // Calculate the sum of the absolute values of all items in each stack in each group. Used for normalization of stacked bars.
        const yAbsTotal = this.yData.map((group) => group.map((stack) => stack.reduce((acc, stack) => {
            acc += isNaN(stack) ? 0 : Math.abs(stack);
            return acc;
        }, 0)));
        let { min: yMin, max: yMax } = this.findLargestMinMax(yMinMax);
        if (yMin === Infinity && yMax === -Infinity) {
            // There's no data in the domain.
            this.yDomain = [];
            return true;
        }
        if (normalizedTo && isFinite(normalizedTo)) {
            yMin = yMin < 0 ? -normalizedTo : 0;
            yMax = yMax > 0 ? normalizedTo : 0;
            yData.forEach((group, i) => {
                group.forEach((stack, j) => {
                    stack.forEach((y, k) => {
                        stack[k] = (y / yAbsTotal[i][j]) * normalizedTo;
                    });
                });
            });
        }
        this.yDomain = this.fixNumericExtent([yMin, yMax], this.yAxis);
        return true;
    }
    findLargestMinMax(groups) {
        let tallestStackMin = Infinity;
        let tallestStackMax = -Infinity;
        for (const group of groups) {
            for (const stack of group) {
                let { min = Infinity, max = -Infinity } = stack;
                if (min < tallestStackMin) {
                    tallestStackMin = min;
                }
                if (max > tallestStackMax) {
                    tallestStackMax = max;
                }
            }
        }
        return { min: tallestStackMin, max: tallestStackMax };
    }
    getDomain(direction) {
        if (this.flipXY) {
            direction = flipChartAxisDirection(direction);
        }
        if (direction === ChartAxisDirection.X) {
            return this.xData;
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
            yKey: datum.yKey,
        });
    }
    getCategoryAxis() {
        return this.flipXY ? this.yAxis : this.xAxis;
    }
    getValueAxis() {
        return this.flipXY ? this.xAxis : this.yAxis;
    }
    calculateStep(range) {
        var _a, _b;
        const { smallestDataInterval: smallestInterval } = this;
        const xAxis = this.getCategoryAxis();
        if (!xAxis) {
            return;
        }
        // calculate step
        let domainLength = xAxis.domain[1] - xAxis.domain[0];
        let intervals = domainLength / (_b = (_a = smallestInterval) === null || _a === void 0 ? void 0 : _a.x, (_b !== null && _b !== void 0 ? _b : 1)) + 1;
        // The number of intervals/bands is used to determine the width of individual bands by dividing the available range.
        // Allow a maximum number of bands to ensure the step does not fall below 1 pixel.
        // This means there could be some overlap of the bands in the chart.
        const maxBands = Math.floor(range); // A minimum of 1px per bar/column means the maximum number of bands will equal the available range
        const bands = Math.min(intervals, maxBands);
        const step = range / Math.max(1, bands);
        return step;
    }
    createNodeData() {
        const { chart, data, visible } = this;
        const xAxis = this.getCategoryAxis();
        const yAxis = this.getValueAxis();
        if (!(chart && data && visible && xAxis && yAxis)) {
            return [];
        }
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const { groupScale, yKeys, cumYKeyCount, fills, strokes, strokeWidth, seriesItemEnabled, xData, yData, label, flipXY, } = this;
        const { fontStyle: labelFontStyle, fontWeight: labelFontWeight, fontSize: labelFontSize, fontFamily: labelFontFamily, color: labelColor, formatter: labelFormatter, placement: labelPlacement, } = label;
        let xBandWidth = xScale.bandwidth;
        if (xScale instanceof ContinuousScale) {
            const availableRange = Math.max(xAxis.range[0], xAxis.range[1]);
            const step = this.calculateStep(availableRange);
            xBandWidth = step;
            // last node will be clipped if the scale is not a band scale
            // subtract last band width from the range so that the last band is not clipped
            xScale.range = this.flipXY ? [availableRange - ((step !== null && step !== void 0 ? step : 0)), 0] : [0, availableRange - ((step !== null && step !== void 0 ? step : 0))];
        }
        groupScale.range = [0, xBandWidth];
        const barWidth = groupScale.bandwidth >= 1
            ? // Pixel-rounded value for low-volume bar charts.
                groupScale.bandwidth
            : // Handle high-volume bar charts gracefully.
                groupScale.rawBandwidth;
        const contexts = [];
        xData.forEach((group, groupIndex) => {
            var _a, _b;
            const seriesDatum = data[groupIndex];
            const x = xScale.convert(group);
            const groupYs = yData[groupIndex]; // y-data for groups of stacks
            for (let stackIndex = 0; stackIndex < groupYs.length; stackIndex++) {
                const stackYs = groupYs[stackIndex]; // y-data for a stack within a group
                contexts[stackIndex] = (_a = contexts[stackIndex], (_a !== null && _a !== void 0 ? _a : []));
                let prevMinY = 0;
                let prevMaxY = 0;
                for (let levelIndex = 0; levelIndex < stackYs.length; levelIndex++) {
                    const currY = +stackYs[levelIndex];
                    const yKey = yKeys[stackIndex][levelIndex];
                    const barX = x + groupScale.convert(String(stackIndex));
                    contexts[stackIndex][levelIndex] = (_b = contexts[stackIndex][levelIndex], (_b !== null && _b !== void 0 ? _b : {
                        itemId: yKey,
                        nodeData: [],
                        labelData: [],
                    }));
                    // Bars outside of visible range are not rendered, so we create node data
                    // only for the visible subset of user data.
                    if (!xAxis.inRange(barX, barWidth)) {
                        continue;
                    }
                    if (isNaN(currY)) {
                        continue;
                    }
                    const prevY = currY < 0 ? prevMinY : prevMaxY;
                    const continuousY = yScale instanceof ContinuousScale;
                    const y = yScale.convert(prevY + currY, continuousY ? clamper : undefined);
                    const bottomY = yScale.convert(prevY, continuousY ? clamper : undefined);
                    const yValue = seriesDatum[yKey]; // unprocessed y-value
                    let labelText;
                    if (labelFormatter) {
                        labelText = labelFormatter({ value: isNumber(yValue) ? yValue : undefined });
                    }
                    else {
                        labelText = isNumber(yValue) ? yValue.toFixed(2) : '';
                    }
                    let labelX;
                    let labelY;
                    if (flipXY) {
                        labelY = barX + barWidth / 2;
                        if (labelPlacement === BarLabelPlacement.Inside) {
                            labelX = y + ((yValue >= 0 ? -1 : 1) * Math.abs(bottomY - y)) / 2;
                        }
                        else {
                            labelX = y + (yValue >= 0 ? 1 : -1) * 4;
                        }
                    }
                    else {
                        labelX = barX + barWidth / 2;
                        if (labelPlacement === BarLabelPlacement.Inside) {
                            labelY = y + ((yValue >= 0 ? 1 : -1) * Math.abs(bottomY - y)) / 2;
                        }
                        else {
                            labelY = y + (yValue >= 0 ? -3 : 4);
                        }
                    }
                    let labelTextAlign;
                    let labelTextBaseline;
                    if (labelPlacement === BarLabelPlacement.Inside) {
                        labelTextAlign = 'center';
                        labelTextBaseline = 'middle';
                    }
                    else {
                        labelTextAlign = flipXY ? (yValue >= 0 ? 'start' : 'end') : 'center';
                        labelTextBaseline = flipXY ? 'middle' : yValue >= 0 ? 'bottom' : 'top';
                    }
                    const colorIndex = cumYKeyCount[stackIndex] + levelIndex;
                    const nodeData = {
                        index: groupIndex,
                        series: this,
                        itemId: yKey,
                        datum: seriesDatum,
                        yValue,
                        yKey,
                        x: flipXY ? Math.min(y, bottomY) : barX,
                        y: flipXY ? barX : Math.min(y, bottomY),
                        width: flipXY ? Math.abs(bottomY - y) : barWidth,
                        height: flipXY ? barWidth : Math.abs(bottomY - y),
                        colorIndex,
                        fill: fills[colorIndex % fills.length],
                        stroke: strokes[colorIndex % strokes.length],
                        strokeWidth,
                        label: seriesItemEnabled.get(yKey) && labelText
                            ? {
                                text: labelText,
                                fontStyle: labelFontStyle,
                                fontWeight: labelFontWeight,
                                fontSize: labelFontSize,
                                fontFamily: labelFontFamily,
                                textAlign: labelTextAlign,
                                textBaseline: labelTextBaseline,
                                fill: labelColor,
                                x: labelX,
                                y: labelY,
                            }
                            : undefined,
                    };
                    contexts[stackIndex][levelIndex].nodeData.push(nodeData);
                    contexts[stackIndex][levelIndex].labelData.push(nodeData);
                    if (currY < 0) {
                        prevMinY += currY;
                    }
                    else {
                        prevMaxY += currY;
                    }
                }
            }
        });
        return contexts.reduce((r, n) => r.concat(...n), []);
    }
    updateDatumSelection(opts) {
        const { nodeData, datumSelection } = opts;
        const updateRects = datumSelection.setData(nodeData);
        updateRects.exit.remove();
        const enterRects = updateRects.enter.append(Rect).each((rect) => {
            rect.tag = BarSeriesNodeTag.Bar;
        });
        return updateRects.merge(enterRects);
    }
    updateDatumNodes(opts) {
        var _a, _b;
        const { datumSelection, isHighlight: isDatumHighlighted } = opts;
        const { fills, strokes, fillOpacity: seriesFillOpacity, strokeOpacity, shadow, formatter, xKey, flipXY, highlightStyle: { fill: deprecatedFill, stroke: deprecatedStroke, strokeWidth: deprecatedStrokeWidth, item: { fill: highlightedFill = deprecatedFill, fillOpacity: highlightFillOpacity = seriesFillOpacity, stroke: highlightedStroke = deprecatedStroke, strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth, }, }, } = this;
        const [visibleMin, visibleMax] = (_b = (_a = this.xAxis) === null || _a === void 0 ? void 0 : _a.visibleRange, (_b !== null && _b !== void 0 ? _b : []));
        const isZoomed = visibleMin !== 0 || visibleMax !== 1;
        const crisp = !isZoomed && !datumSelection.data.some((d) => d.width <= 0.5 || d.height <= 0.5);
        datumSelection.each((rect, datum) => {
            const { colorIndex } = datum;
            const fill = isDatumHighlighted && highlightedFill !== undefined
                ? highlightedFill
                : fills[colorIndex % fills.length];
            const stroke = isDatumHighlighted && highlightedStroke !== undefined
                ? highlightedStroke
                : strokes[colorIndex % fills.length];
            const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                ? highlightedDatumStrokeWidth
                : this.getStrokeWidth(this.strokeWidth, datum);
            const fillOpacity = isDatumHighlighted ? highlightFillOpacity : seriesFillOpacity;
            let format = undefined;
            if (formatter) {
                format = formatter({
                    datum: datum.datum,
                    fill,
                    stroke,
                    strokeWidth,
                    highlighted: isDatumHighlighted,
                    xKey,
                    yKey: datum.yKey,
                });
            }
            rect.crisp = crisp;
            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
            rect.fill = (format && format.fill) || fill;
            rect.stroke = (format && format.stroke) || stroke;
            rect.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
            rect.fillOpacity = fillOpacity;
            rect.strokeOpacity = strokeOpacity;
            rect.lineDash = this.lineDash;
            rect.lineDashOffset = this.lineDashOffset;
            rect.fillShadow = shadow;
            // Prevent stroke from rendering for zero height columns and zero width bars.
            rect.visible = flipXY ? datum.width > 0 : datum.height > 0;
        });
    }
    updateLabelSelection(opts) {
        const { labelData, labelSelection } = opts;
        const { enabled } = this.label;
        const data = enabled ? labelData : [];
        const updateLabels = labelSelection.setData(data);
        updateLabels.exit.remove();
        const enterLabels = updateLabels.enter.append(Text).each((text) => {
            text.tag = BarSeriesNodeTag.Label;
            text.pointerEvents = PointerEvents.None;
        });
        return updateLabels.merge(enterLabels);
    }
    updateLabelNodes(opts) {
        const { labelSelection } = opts;
        const { label: { enabled: labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color }, } = this;
        labelSelection.each((text, datum) => {
            const label = datum.label;
            if (label && labelEnabled) {
                text.fontStyle = fontStyle;
                text.fontWeight = fontWeight;
                text.fontSize = fontSize;
                text.fontFamily = fontFamily;
                text.textAlign = label.textAlign;
                text.textBaseline = label.textBaseline;
                text.text = label.text;
                text.x = label.x;
                text.y = label.y;
                text.fill = color;
                text.visible = true;
            }
            else {
                text.visible = false;
            }
        });
    }
    getTooltipHtml(nodeDatum) {
        const { xKey, yKeys, yData } = this;
        const xAxis = this.getCategoryAxis();
        const yAxis = this.getValueAxis();
        const { yKey } = nodeDatum;
        if (!yData.length || !xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        const yGroup = yData[nodeDatum.index];
        let fillIndex = 0;
        let i = 0;
        let j = 0;
        for (; j < yKeys.length; j++) {
            const stack = yKeys[j];
            i = stack.indexOf(yKey);
            if (i >= 0) {
                fillIndex += i;
                break;
            }
            fillIndex += stack.length;
        }
        const { xName, yNames, fills, strokes, tooltip, formatter } = this;
        const { renderer: tooltipRenderer } = tooltip;
        const datum = nodeDatum.datum;
        const yName = yNames[yKey];
        const fill = fills[fillIndex % fills.length];
        const stroke = strokes[fillIndex % fills.length];
        const strokeWidth = this.getStrokeWidth(this.strokeWidth);
        const xValue = datum[xKey];
        const yValue = datum[yKey];
        const processedYValue = yGroup[j][i];
        const xString = sanitizeHtml(xAxis.formatDatum(xValue));
        const yString = sanitizeHtml(yAxis.formatDatum(yValue));
        const title = sanitizeHtml(yName);
        const content = xString + ': ' + yString;
        let format = undefined;
        if (formatter) {
            format = formatter({
                datum,
                fill,
                stroke,
                strokeWidth,
                highlighted: false,
                xKey,
                yKey,
            });
        }
        const color = (format && format.fill) || fill;
        const defaults = {
            title,
            backgroundColor: color,
            content,
        };
        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
                datum,
                xKey,
                xValue,
                xName,
                yKey,
                yValue,
                processedYValue,
                yName,
                color,
                title,
            }), defaults);
        }
        return toTooltipHtml(defaults);
    }
    listSeriesItems(legendData) {
        const { id, data, xKey, yKeys, yNames, cumYKeyCount, seriesItemEnabled, hideInLegend, fills, strokes, fillOpacity, strokeOpacity, flipXY, } = this;
        if (!data || !data.length || !xKey || !yKeys.length) {
            return;
        }
        this.yKeys.forEach((stack, stackIndex) => {
            // Column stacks should be listed in the legend in reverse order, for symmetry with the
            // vertical stack display order. Bar stacks are already consistent left-to-right with
            // the legend.
            const startLevel = flipXY ? 0 : stack.length - 1;
            const endLevel = flipXY ? stack.length : -1;
            const direction = flipXY ? 1 : -1;
            for (let levelIndex = startLevel; levelIndex !== endLevel; levelIndex += direction) {
                const yKey = stack[levelIndex];
                if (hideInLegend.indexOf(yKey) >= 0) {
                    return;
                }
                const colorIndex = cumYKeyCount[stackIndex] + levelIndex;
                legendData.push({
                    id,
                    itemId: yKey,
                    enabled: seriesItemEnabled.get(yKey) || false,
                    label: {
                        text: yNames[yKey] || yKey,
                    },
                    marker: {
                        fill: fills[colorIndex % fills.length],
                        stroke: strokes[colorIndex % strokes.length],
                        fillOpacity: fillOpacity,
                        strokeOpacity: strokeOpacity,
                    },
                });
            }
        });
    }
    toggleSeriesItem(itemId, enabled) {
        super.toggleSeriesItem(itemId, enabled);
        const yKeys = this.yKeys.map((stack) => stack.slice()); // deep clone
        this.seriesItemEnabled.forEach((enabled, yKey) => {
            if (!enabled) {
                yKeys.forEach((stack) => {
                    const index = stack.indexOf(yKey);
                    if (index >= 0) {
                        stack.splice(index, 1);
                    }
                });
            }
        });
        const visibleStacks = [];
        yKeys.forEach((stack, index) => {
            if (stack.length > 0) {
                visibleStacks.push(String(index));
            }
        });
        this.groupScale.domain = visibleStacks;
        this.nodeDataRefresh = true;
    }
}
BarSeries.className = 'BarSeries';
BarSeries.type = 'bar';
