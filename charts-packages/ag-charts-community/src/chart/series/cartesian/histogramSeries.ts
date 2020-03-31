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

enum HistogramSeriesNodeTag {
    Bin,
    Label
}

class HistogramSeriesLabel extends Label {
    @reactive('change') formatter?: (bin: HistogramBin) => string;
}

export class HistogramBin {
    data: any[] = [];
    total: number = 0;
    frequency: number = 0;
    domain: number[];

    constructor ([domainMin, domainMax]: [number, number]) {
        this.domain = [domainMin, domainMax];
    };

    addDatum (datum : any, yKey: string) {
        this.data.push(datum);
        this.total += yKey? datum[yKey] : 1;
        this.frequency ++;
    };

    get domainWidth() : number {
        const [domainMin, domainMax] = this.domain;
        return domainMax - domainMin;
    }

    get relativeHeight() : number {
        return this.total / this.domainWidth;
    };

    getY( constantWidth: boolean ) {
        return constantWidth? this.total : this.relativeHeight;
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

    private bins: HistogramBin[] = [];
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
        this.label.addEventListener('change', () => this.update());
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

    private _constantWidth: boolean = true;
    set constantWidth(c: boolean) {
        this._constantWidth = c;

        this.scheduleData();
    }
    get constantWidth(): boolean {
        return this._constantWidth;
    }

    private _binDomains: [number, number][];
    set binDomains(bins: [number, number][]) {
        this._binDomains = bins;

        this.scheduleData();
    }
    get binDomains(): [number, number][] {
        return this._binDomains;
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
        const { binDomains, binCount } = this;

        if( binDomains && binCount ) {
            console.warn('bin domain and bin count both specified - these are mutually exclusive properties');
        }

        if( binDomains ) {
            return binDomains;
        }

        const xData = this.data.map( datum => datum[this.xKey] );
        const xMinMax = numericExtent(xData);

        const binStarts = ticks(xMinMax[0], xMinMax[1], this.binCount || defaultBinCount);
        const binSize = tickStep(xMinMax[0], xMinMax[1], this.binCount || defaultBinCount);
        const firstBinEnd = binStarts[0];

        const expandStartToBin : (n: number) => [number, number ] = n => [n, n + binSize];

        return [
            [firstBinEnd - binSize, firstBinEnd],
            ...binStarts.map( expandStartToBin )
        ];
    }

    private distributeToBins(data: any[]): HistogramBin[] {

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
        const bins : HistogramBin[] = [new HistogramBin(derivedBins[0])];
        sortedData.forEach( datum => {

            while( datum[ xKey ] > derivedBins[currentBin][1] ) {
                currentBin++
                bins.push(new HistogramBin(derivedBins[currentBin]));
            }

            bins[currentBin].addDatum(datum, yKey)
        } );

        return bins;
    }

    get xMax(): number {
        return this.data && this.data.reduce( (acc, datum) => {
            return Math.max( acc, datum[ this.xKey ] )
        }, Number.NEGATIVE_INFINITY );
    }

    processData(): boolean {
        const { xKey, data } = this;

        this.bins = this.distributeToBins(xKey && data ? data : []);

        const yData = this.bins.map(b => b.getY(this.constantWidth));
        const yMinMax = numericExtent(yData);

        this.yDomain = this.fixNumericExtent([0, yMinMax[1]], 'y');

        const firstBin = this.bins[0];
        const lastBin = this.bins[this.bins.length -1];
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

        if (!xAxis || !yAxis || !visible || !chart || chart.layoutPending || chart.dataPending ) {
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
            xAxis : {scale : xScale},
            yAxis : {scale : yScale},
            fill, stroke, strokeWidth
        } = this;

        const selectionData: HistogramSelectionDatum[] = [];

        const defaultLabelFormatter = (b: HistogramBin) => String(b.total);
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

        this.bins.forEach(bin => {
            const {total, frequency, domain: [xDomainMin, xDomainMax], relativeHeight} = bin;

            const
                xMinPx = xScale.convert(xDomainMin),
                xMaxPx = xScale.convert(xDomainMax),
                // note: assuming can't be negative:
                y = this.constantWidth? (this.yKey? total : frequency): relativeHeight,
                yZeroPx = yScale.convert(0),
                yMaxPx = yScale.convert(y),
                w = xMaxPx - xMinPx,
                h = Math.abs(yMaxPx - yZeroPx);

            const selectionDatumLabel = y !== 0 && {
                text: labelFormatter( bin ),
                fontStyle: labelFontStyle,
                fontWeight: labelFontWeight,
                fontSize: labelFontSize,
                fontFamily: labelFontFamily,
                fill: labelColor,
                x: xMinPx + w/2,
                y: yMaxPx + h/2
            };

            selectionData.push({
                series: this,
                seriesDatum: bin,  // required by SeriesNodeDatum, but might not make sense here
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

        const { xName, yName, fill, tooltipRenderer } = this;
        const { seriesDatum } = nodeDatum;
        const {total, frequency, domain: [rangeMin, rangeMax]} = seriesDatum;

        if (tooltipRenderer) {
            return tooltipRenderer({
                datum: seriesDatum,
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
                    ${toFixed(rangeMin)} - ${toFixed(rangeMax)}
                </div>`;

            let contentHtml = `
                <b>${yName || yKey} total</b>: ${total}<br>
                <b>Frequency</b>: ${frequency}`;

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

        if( data && data.length ) {
            legendData.push({
                id,
                itemId: yKey,
                enabled: seriesItemEnabled,
                label: {
                    text: yName|| yKey || 'Frequency'
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
        if( itemId === this.yKey ) {
            this.seriesItemEnabled = enabled;
        }
        this.scheduleData();
    }
}
