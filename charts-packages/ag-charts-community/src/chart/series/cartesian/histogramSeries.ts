import { Group } from "../../../scene/group";
import { Selection } from "../../../scene/selection";
import { Rect } from "../../../scene/shape/rect";
import { Text, FontStyle, FontWeight } from "../../../scene/shape/text";
import { DropShadow } from "../../../scene/dropShadow";
import palette from "../../palettes";
import {
    HighlightStyle,
    SeriesNodeDatum,
    CartesianTooltipRendererParams as HistogramTooltipRendererParams
} from "../series";
import { Label } from "../../label";
import { PointerEvents } from "../../../scene/node";
import { LegendDatum } from "../../legend";
import { CartesianSeries } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { Chart } from "../../chart";
import { numericExtent } from "../../../util/array";
import { toFixed } from "../../../util/number";
import { reactive } from "../../../util/observable";
import ticks, { tickStep } from "../../../util/ticks";
import { HistogramSeriesOptions } from "../../../chartOptions";

enum HistogramSeriesNodeTag {
    Bin,
    Label
}

class HistogramSeriesLabel extends Label {
    @reactive('change') formatter?: (bin: HistogramBin) => string;
}

const defaultBinCount = 10;

export { HistogramTooltipRendererParams };

interface HistogramSelectionDatum extends SeriesNodeDatum {
    x: number;
    y: number;
    width: number;
    height: number;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    label: {
        text: string;
        x: number;
        y: number;
        fontStyle: FontStyle;
        fontWeight: FontWeight;
        fontSize: number;
        fontFamily: string;
        fill: string;
    }
}

export type aggregations = 'count' | 'sum' | 'mean';
type aggregationFunction = (bin: HistogramBin, yKey: string) => number;

const aggregationFunctions: {[key in aggregations]: aggregationFunction} = {
    count: bin => bin.data.length,
    sum: (bin, yKey) => bin.data.reduce((acc, datum) => acc + datum[yKey], 0),
    mean: (bin, yKey) => aggregationFunctions.sum(bin, yKey) / aggregationFunctions.count(bin, yKey)
};

export class HistogramBin {
    data: any[] = [];
    aggregatedValue: number = 0;
    frequency: number = 0;
    domain: number[];

    constructor([domainMin, domainMax]: [number, number]) {
        this.domain = [domainMin, domainMax];
    };

    addDatum(datum: any) {
        this.data.push(datum);
        this.frequency ++;
    };

    get domainWidth(): number {
        const [domainMin, domainMax] = this.domain;
        return domainMax - domainMin;
    }

    get relativeHeight(): number {
        return this.aggregatedValue / this.domainWidth;
    };

    calculateAggregatedValue(aggregationName: aggregations, yKey: string) {
        if (!yKey) {
            // not having a yKey forces us into a frequency plot
            aggregationName = 'count';
        }

        const aggregationFunction = aggregationFunctions[aggregationName];

        this.aggregatedValue = aggregationFunction(this, yKey);
    }

    getY(areaPlot: boolean) {
        return areaPlot ? this.relativeHeight : this.aggregatedValue;
    }
};

export class HistogramSeries extends CartesianSeries {

    static className = 'HistogramSeries';
    static type = 'histogram';

    // Need to put column and label nodes into separate groups, because even though label nodes are
    // created after the column nodes, this only guarantees that labels will always be on top of columns
    // on the first run. If on the next run more columns are added, they might clip the labels
    // rendered during the previous run.
    private rectGroup = this.group.appendChild(new Group());
    private textGroup = this.group.appendChild(new Group());

    private rectSelection: Selection<Rect, Group, any, any> = Selection.select(this.rectGroup).selectAll<Rect>();
    private textSelection: Selection<Text, Group, any, any> = Selection.select(this.textGroup).selectAll<Text>();

    private binnedData: HistogramBin[] = [];
    private xDomain: number[] = [];
    private yDomain: number[] = [];

    readonly label = new HistogramSeriesLabel();

    private seriesItemEnabled = true;

    tooltipRenderer?: (params: HistogramTooltipRendererParams) => string;

    @reactive('dataChange') fill: string = palette.fills[0];
    @reactive('dataChange') stroke: string = palette.strokes[0];

    @reactive('layoutChange') fillOpacity = 1;
    @reactive('layoutChange') strokeOpacity = 1;

    constructor() {
        super();

        this.label.enabled = false;
        this.label.addEventListener('change', this.update, this);
    }

    directionKeys = {
        [ChartAxisDirection.X]: ['xKey'],
        [ChartAxisDirection.Y]: ['yKey']
    };

    getKeys(direction: ChartAxisDirection): string[] {
        const { directionKeys } = this;
        const keys = directionKeys && directionKeys[ direction ];
        const values: string[] = [];

        if (keys) {
            keys.forEach(key => {
                const value = (this as any)[key];

                if (value) {
                    if (Array.isArray(value)) {
                        values.push(...value);
                    } else {
                        values.push(value);
                    }
                }
            });
        }

        return values;
    }

    protected _xKey: string = '';
    set xKey(value: string) {
        if (this._xKey !== value) {
            this._xKey = value;
            this.scheduleData();
        }
    }
    get xKey(): string {
        return this._xKey;
    }

    private _areaPlot: boolean = false;
    set areaPlot(c: boolean) {
        this._areaPlot = c;

        this.scheduleData();
    }
    get areaPlot(): boolean {
        return this._areaPlot;
    }

    private _bins: [number, number][];
    set bins(bins: [number, number][]) {
        this._bins = bins;

        this.scheduleData();
    }
    get bins(): [number, number][] {
        return this._bins;
    }

    private _aggregation: aggregations;
    set aggregation(aggregation: aggregations) {
        this._aggregation = aggregation;

        this.scheduleData();
    }
    get aggregation(): aggregations {
        return this._aggregation;
    }

    private _binCount: number;
    set binCount(binCount: number) {
        this._binCount = binCount;

        this.scheduleData();
    }
    get binCount(): number {
        return this._binCount;
    }

    protected _xName: string = '';
    set xName(value: string) {
        if (this._xName !== value) {
            this._xName = value;
            this.update();
        }
    }
    get xName(): string {
        return this._xName;
    }

    protected _yKey: string = '';
    set yKey(yKey: string) {
        this._yKey = yKey;
        this.seriesItemEnabled = true;
        this.scheduleData();
    }
    get yKey(): string {
        return this._yKey;
    }

    protected _yName: string = '';
    set yName(values: string) {
        this._yName = values;
        this.scheduleData();
    }
    get yName(): string {
        return this._yName;
    }

    private _strokeWidth: number = 1;
    set strokeWidth(value: number) {
        if (this._strokeWidth !== value) {
            this._strokeWidth = value;
            this.update();
        }
    }
    get strokeWidth(): number {
        return this._strokeWidth;
    }

    private _shadow?: DropShadow;
    set shadow(value: DropShadow | undefined) {
        if (this._shadow !== value) {
            this._shadow = value;
            this.update();
        }
    }
    get shadow(): DropShadow | undefined {
        return this._shadow;
    }

    highlightStyle: HighlightStyle = {
        fill: 'yellow'
    };

    protected highlightedDatum?: HistogramSelectionDatum;

    /*  during processData phase, used to unify different ways of the user specifying
        the bins. Returns bins in format [[min1, max1], [min2, max2] ... ] */
    private deriveBins(): [number, number][] {
        const { bins, binCount } = this;

        if (bins && binCount) {
            console.warn('bin domain and bin count both specified - these are mutually exclusive properties');
        }

        if (bins) {
            // we have explicity set bins from user. Use those.
            return bins;
        }

        const xData = this.data.map(datum => datum[this.xKey]);
        const xMinMax = numericExtent(xData);

        const binStarts = ticks(xMinMax[0], xMinMax[1], this.binCount || defaultBinCount);
        const binSize = tickStep(xMinMax[0], xMinMax[1], this.binCount || defaultBinCount);
        const firstBinEnd = binStarts[0];

        const expandStartToBin: (n: number) => [number, number ] = n => [n, n + binSize];

        return [
            [firstBinEnd - binSize, firstBinEnd],
            ...binStarts.map(expandStartToBin)
        ];
    }

    private placeDataInBins(data: any[]): HistogramBin[] {

        const { xKey, yKey } = this;
        const derivedBins = this.deriveBins();

        // creating a sorted copy allows bining in O(n) rather than O(n²)
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
        const bins: HistogramBin[] = [new HistogramBin(derivedBins[0])];
        sortedData.forEach(datum => {

            while (datum[ xKey ] > derivedBins[currentBin][1]) {
                currentBin++;
                bins.push(new HistogramBin(derivedBins[currentBin]));
            }

            bins[currentBin].addDatum(datum);
        });

        bins.forEach(b => b.calculateAggregatedValue(this._aggregation, this.yKey));

        return bins;
    }

    get xMax(): number {
        return this.data && this.data.reduce((acc, datum) => {
            return Math.max(acc, datum[ this.xKey ]);
        }, Number.NEGATIVE_INFINITY);
    }

    processData(): boolean {
        const { xKey, data } = this;

        this.binnedData = this.placeDataInBins(xKey && data ? data : []);

        const yData = this.binnedData.map(b => b.getY(this.areaPlot));
        const yMinMax = numericExtent(yData);

        this.yDomain = this.fixNumericExtent([0, yMinMax[1]], 'y');

        const firstBin = this.binnedData[0];
        const lastBin = this.binnedData[this.binnedData.length - 1];
        const xMin = firstBin.domain[0];
        const xMax = lastBin.domain[1];
        this.xDomain = [xMin, xMax];

        this.fireEvent({type: 'dataProcessed'});

        return true;
    }

    getDomain(direction: ChartAxisDirection): any[] {

        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        } else {
            return this.yDomain;
        }
    }

    update(): void {
        const {
            visible,
            chart,
            xAxis,
            yAxis
        } = this;

        this.group.visible = visible;

        if (!xAxis || !yAxis || !visible || !chart || chart.layoutPending || chart.dataPending) {
            return;
        }

        const selectionData = this.generateSelectionData();

        this.updateRectSelection(selectionData);
        this.updateTextSelection(selectionData);
    }

    private generateSelectionData(): HistogramSelectionDatum[] {

        if (!this.seriesItemEnabled) {
            return [];
        }

        const {
            xAxis: {scale: xScale},
            yAxis: {scale: yScale},
            fill, stroke, strokeWidth
        } = this;

        const selectionData: HistogramSelectionDatum[] = [];

        const defaultLabelFormatter = (b: HistogramBin) => String(b.aggregatedValue);
        const {
            label: {
                formatter: labelFormatter = defaultLabelFormatter,
                fontStyle: labelFontStyle,
                fontWeight: labelFontWeight,
                fontSize: labelFontSize,
                fontFamily: labelFontFamily,
                color: labelColor
            }
        } = this;

        this.binnedData.forEach(binOfData => {
            const {aggregatedValue: total, frequency, domain: [xDomainMin, xDomainMax], relativeHeight} = binOfData;

            const
                xMinPx = xScale.convert(xDomainMin),
                xMaxPx = xScale.convert(xDomainMax),
                // note: assuming can't be negative:
                y = this.areaPlot ? relativeHeight : (this.yKey ? total : frequency),
                yZeroPx = yScale.convert(0),
                yMaxPx = yScale.convert(y),
                w = xMaxPx - xMinPx,
                h = Math.abs(yMaxPx - yZeroPx);

            const selectionDatumLabel = y !== 0 && {
                text: labelFormatter(binOfData),
                fontStyle: labelFontStyle,
                fontWeight: labelFontWeight,
                fontSize: labelFontSize,
                fontFamily: labelFontFamily,
                fill: labelColor,
                x: xMinPx + w / 2,
                y: yMaxPx + h / 2
            };

            selectionData.push({
                series: this,
                seriesDatum: binOfData,  // required by SeriesNodeDatum, but might not make sense here
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

        return selectionData;
    }

    private updateRectSelection(selectionData: HistogramSelectionDatum[]): void {
        const {
            fillOpacity,
            strokeOpacity,
            shadow,
            highlightStyle: { fill, stroke },
            highlightedDatum
        } = this;
        const updateRects = this.rectSelection.setData(selectionData);

        updateRects.exit.remove();

        const enterRects = updateRects.enter.append(Rect).each(rect => {
            rect.tag = HistogramSeriesNodeTag.Bin;
            rect.crisp = true;
        });

        const rectSelection = updateRects.merge(enterRects);

        rectSelection.each((rect, datum) => {
            const highlighted = highlightedDatum &&
                highlightedDatum.seriesDatum === datum.seriesDatum &&
                highlightedDatum.series === datum.series;

            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
            rect.fill = highlighted && fill !== undefined ? fill : datum.fill;
            rect.stroke = highlighted && stroke !== undefined ? stroke : datum.stroke;
            rect.fillOpacity = fillOpacity;
            rect.strokeOpacity = strokeOpacity;
            rect.strokeWidth = datum.strokeWidth;
            rect.fillShadow = shadow;
            rect.visible = datum.height > 0; // prevent stroke from rendering for zero height columns
        });

        this.rectSelection = rectSelection;
    }


    private updateTextSelection(selectionData: HistogramSelectionDatum[]): void {
        const labelEnabled = this.label.enabled;
        const updateTexts = this.textSelection.setData(selectionData);

        updateTexts.exit.remove();

        const enterTexts = updateTexts.enter.append(Text).each(text => {
            text.tag = HistogramSeriesNodeTag.Label;
            text.pointerEvents = PointerEvents.None;
            text.textAlign = 'center';
            text.textBaseline = 'middle';
        });

        const textSelection = updateTexts.merge(enterTexts);

        textSelection.each((text, datum) => {
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
            } else {
                text.visible = false;
            }
        });

        this.textSelection = textSelection;
    }

    getTooltipHtml(nodeDatum: HistogramSelectionDatum): string {
        const { xKey, yKey } = this;

        if (!xKey) {
            return '';
        }

        const { xName, yName, fill, tooltipRenderer, aggregation } = this;
        const bin: HistogramBin = nodeDatum.seriesDatum;
        const {aggregatedValue, frequency, domain: [rangeMin, rangeMax]} = bin;

        if (tooltipRenderer) {
            return tooltipRenderer({
                datum: bin,
                xKey,
                xName,
                yKey,
                yName,
                color: fill
            });
        } else {
            const titleStyle = `style="color: white; background-color: ${fill}"`;
            const titleString = `
                <div class="${Chart.defaultTooltipClass}-title" ${titleStyle}>
                    ${xName || xKey} ${toFixed(rangeMin)} - ${toFixed(rangeMax)}
                </div>`;

            let contentHtml = yKey ?
                `<b>${yName || yKey} (${aggregation})</b>: ${toFixed(aggregatedValue)}<br>` :
                '';

            contentHtml += `<b>Frequency</b>: ${frequency}`;

            return `
                ${titleString}
                <div class="${Chart.defaultTooltipClass}-content">
                    ${contentHtml}
                </div>`;
        }
    }

    listSeriesItems(legendData: LegendDatum[]): void {
        const {
            id, data, yKey, yName, seriesItemEnabled,
            fill, stroke, fillOpacity, strokeOpacity
        } = this;

        if (data && data.length) {
            legendData.push({
                id,
                itemId: yKey,
                enabled: seriesItemEnabled,
                label: {
                    text: yName || yKey || 'Frequency'
                },
                marker: {
                    fill,
                    stroke,
                    fillOpacity: fillOpacity,
                    strokeOpacity: strokeOpacity
                }
            });
        }
    }

    toggleSeriesItem(itemId: string, enabled: boolean): void {
        if (itemId === this.yKey) {
            this.seriesItemEnabled = enabled;
        }
        this.scheduleData();
    }
}
