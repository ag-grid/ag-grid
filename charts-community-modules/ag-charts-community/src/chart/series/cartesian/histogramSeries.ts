import { Selection } from '../../../scene/selection';
import { Rect } from '../../../scene/shape/rect';
import { Text } from '../../../scene/shape/text';
import { DropShadow } from '../../../scene/dropShadow';
import {
    SeriesTooltip,
    Series,
    SeriesNodeDataContext,
    SeriesNodePickMode,
    valueProperty,
    keyProperty,
} from '../series';
import { Label } from '../../label';
import { PointerEvents } from '../../../scene/node';
import { ChartLegendDatum, CategoryLegendDatum } from '../../legendDatum';
import {
    CartesianSeries,
    CartesianSeriesNodeClickEvent,
    CartesianSeriesNodeDatum,
    CartesianSeriesNodeDoubleClickEvent,
} from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { toTooltipHtml } from '../../tooltip/tooltip';
import ticks, { tickStep } from '../../../util/ticks';
import { sanitizeHtml } from '../../../util/sanitize';
import {
    BOOLEAN,
    NUMBER,
    OPT_ARRAY,
    OPT_FUNCTION,
    OPT_LINE_DASH,
    OPT_NUMBER,
    OPT_COLOR_STRING,
    Validate,
    predicateWithMessage,
    OPT_STRING,
} from '../../../util/validation';
import {
    AgCartesianSeriesLabelFormatterParams,
    AgTooltipRendererResult,
    AgHistogramSeriesOptions,
    FontStyle,
    FontWeight,
    AgHistogramSeriesTooltipRendererParams,
} from '../../agChartOptions';
import {
    AggregatePropertyDefinition,
    DataModel,
    fixNumericExtent,
    GroupByFn,
    PropertyDefinition,
} from '../../data/dataModel';
import { area, groupAverage, groupCount, sum } from '../../data/aggregateFunctions';
import { SORT_DOMAIN_GROUPS } from '../../data/processors';
import * as easing from '../../../motion/easing';

const HISTOGRAM_AGGREGATIONS = ['count', 'sum', 'mean'];
const HISTOGRAM_AGGREGATION = predicateWithMessage(
    (v: any) => HISTOGRAM_AGGREGATIONS.includes(v),
    `expecting a histogram aggregation keyword such as 'count', 'sum' or 'mean`
);

enum HistogramSeriesNodeTag {
    Bin,
    Label,
}

class HistogramSeriesLabel extends Label {
    @Validate(OPT_FUNCTION)
    formatter?: (params: AgCartesianSeriesLabelFormatterParams) => string = undefined;
}

const defaultBinCount = 10;

interface HistogramNodeDatum extends CartesianSeriesNodeDatum {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly strokeWidth: number;
    readonly aggregatedValue: number;
    readonly frequency: number;
    readonly domain: [number, number];
    readonly label?: {
        readonly text: string;
        readonly x: number;
        readonly y: number;
        readonly fontStyle?: FontStyle;
        readonly fontWeight?: FontWeight;
        readonly fontSize: number;
        readonly fontFamily: string;
        readonly fill: string;
    };
}

type HistogramAggregation = NonNullable<AgHistogramSeriesOptions['aggregation']>;

class HistogramSeriesTooltip extends SeriesTooltip {
    @Validate(OPT_FUNCTION)
    renderer?: (params: AgHistogramSeriesTooltipRendererParams) => string | AgTooltipRendererResult = undefined;
}

export class HistogramSeries extends CartesianSeries<SeriesNodeDataContext<HistogramNodeDatum>, Rect> {
    static className = 'HistogramSeries';
    static type = 'histogram' as const;

    readonly label = new HistogramSeriesLabel();

    tooltip: HistogramSeriesTooltip = new HistogramSeriesTooltip();

    @Validate(OPT_COLOR_STRING)
    fill?: string = undefined;

    @Validate(OPT_COLOR_STRING)
    stroke?: string = undefined;

    @Validate(NUMBER(0, 1))
    fillOpacity = 1;

    @Validate(NUMBER(0, 1))
    strokeOpacity = 1;

    @Validate(OPT_LINE_DASH)
    lineDash?: number[] = [0];

    @Validate(NUMBER(0))
    lineDashOffset: number = 0;

    constructor() {
        super({ pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH] });

        this.label.enabled = false;
    }

    @Validate(OPT_STRING)
    xKey?: string = undefined;

    @Validate(BOOLEAN)
    areaPlot: boolean = false;

    @Validate(OPT_ARRAY())
    bins: [number, number][] | undefined = undefined;

    @Validate(HISTOGRAM_AGGREGATION)
    aggregation: HistogramAggregation = 'count';

    @Validate(OPT_NUMBER(0))
    binCount?: number = undefined;

    @Validate(OPT_STRING)
    xName?: string = undefined;

    @Validate(OPT_STRING)
    yKey?: string = undefined;

    @Validate(OPT_STRING)
    yName?: string = undefined;

    @Validate(NUMBER(0))
    strokeWidth: number = 1;

    shadow?: DropShadow = undefined;
    calculatedBins: [number, number][] = [];

    protected highlightedDatum?: HistogramNodeDatum;

    // During processData phase, used to unify different ways of the user specifying
    // the bins. Returns bins in format[[min1, max1], [min2, max2], ... ].
    private deriveBins(xDomain: [number, number]): [number, number][] {
        if (this.binCount === undefined) {
            const binStarts = ticks(xDomain[0], xDomain[1], defaultBinCount);
            const binSize = tickStep(xDomain[0], xDomain[1], defaultBinCount);
            const firstBinEnd = binStarts[0];

            const expandStartToBin: (n: number) => [number, number] = (n) => [n, n + binSize];

            return [[firstBinEnd - binSize, firstBinEnd], ...binStarts.map(expandStartToBin)];
        } else {
            return this.calculateNiceBins(xDomain, this.binCount);
        }
    }

    private calculateNiceBins(domain: number[], binCount: number): [number, number][] {
        const startGuess = Math.floor(domain[0]);
        const stop = domain[1];

        const segments = binCount || 1;
        const { start, binSize } = this.calculateNiceStart(startGuess, stop, segments);

        return this.getBins(start, stop, binSize, segments);
    }

    private getBins(start: number, stop: number, step: number, count: number): [number, number][] {
        const bins: [number, number][] = [];

        for (let i = 0; i < count; i++) {
            const a = Math.round((start + i * step) * 10) / 10;
            let b = Math.round((start + (i + 1) * step) * 10) / 10;
            if (i === count - 1) {
                b = Math.max(b, stop);
            }

            bins[i] = [a, b];
        }

        return bins;
    }

    private calculateNiceStart(a: number, b: number, segments: number): { start: number; binSize: number } {
        const binSize = Math.abs(b - a) / segments;
        const order = Math.floor(Math.log10(binSize));
        const magnitude = Math.pow(10, order);

        const start = Math.floor(a / magnitude) * magnitude;

        return {
            start,
            binSize,
        };
    }

    async processData() {
        const { xKey, yKey, data, areaPlot, aggregation } = this;

        const props: PropertyDefinition<any>[] = [keyProperty(xKey, true), SORT_DOMAIN_GROUPS];
        if (yKey) {
            let aggProp: AggregatePropertyDefinition<any, any, any> = groupCount();

            if (aggregation === 'count') {
                // Nothing to do.
            } else if (aggregation === 'sum') {
                aggProp = sum([yKey]);
            } else if (aggregation === 'mean') {
                aggProp = groupAverage([yKey]);
            }
            if (areaPlot) {
                aggProp = area([yKey], aggProp);
            }
            props.push(valueProperty(yKey, true, { invalidValue: undefined }), aggProp);
        } else {
            let aggProp = groupCount();

            if (areaPlot) {
                aggProp = area([], aggProp);
            }
            props.push(aggProp);
        }

        const groupByFn: GroupByFn = (dataSet) => {
            const xExtent = fixNumericExtent(dataSet.domain.keys[0]);
            if (xExtent.length === 0) {
                // No buckets can be calculated.
                dataSet.domain.groups = [];
                return () => [];
            }

            const bins = this.bins ?? this.deriveBins(xExtent);
            const binCount = bins.length;
            this.calculatedBins = [...bins];

            return (item) => {
                const xValue = item.keys[0];
                for (let i = 0; i < binCount; i++) {
                    const nextBin = bins[i];
                    if (xValue >= nextBin[0] && xValue < nextBin[1]) {
                        return nextBin;
                    }
                    if (i === binCount - 1 && xValue <= nextBin[1]) {
                        // Handle edge case of a value being at the maximum extent, and the
                        // final bin aligning with it.
                        return nextBin;
                    }
                }

                return [];
            };
        };

        this.dataModel = new DataModel<any>({
            props,
            dataVisible: this.visible,
            groupByFn,
        });
        this.processedData = this.dataModel.processData(data ?? []);
    }

    getDomain(direction: ChartAxisDirection): any[] {
        const { processedData } = this;

        if (!processedData) return [];

        const {
            domain: { aggValues: [yDomain] = [] },
        } = processedData;
        const xDomainMin = this.calculatedBins?.[0][0];
        const xDomainMax = this.calculatedBins?.[(this.calculatedBins?.length ?? 0) - 1][1];
        if (direction === ChartAxisDirection.X) {
            return fixNumericExtent([xDomainMin, xDomainMax]);
        }

        return fixNumericExtent(yDomain);
    }

    protected getNodeClickEvent(event: MouseEvent, datum: HistogramNodeDatum): CartesianSeriesNodeClickEvent<any> {
        return new CartesianSeriesNodeClickEvent(this.xKey ?? '', this.yKey ?? '', event, datum, this);
    }

    protected getNodeDoubleClickEvent(
        event: MouseEvent,
        datum: HistogramNodeDatum
    ): CartesianSeriesNodeDoubleClickEvent<any> {
        return new CartesianSeriesNodeDoubleClickEvent(this.xKey ?? '', this.yKey ?? '', event, datum, this);
    }

    async createNodeData() {
        const { xAxis, yAxis, processedData } = this;

        if (!this.seriesItemEnabled || !xAxis || !yAxis || !processedData || processedData.type !== 'grouped') {
            return [];
        }

        const { scale: xScale } = xAxis;
        const { scale: yScale } = yAxis;
        const { fill, stroke, strokeWidth, id: seriesId, yKey = '', xKey = '' } = this;

        const nodeData: HistogramNodeDatum[] = [];

        const defaultLabelFormatter = (params: { value: number }) => String(params.value);
        const {
            label: {
                formatter: labelFormatter = defaultLabelFormatter,
                fontStyle: labelFontStyle,
                fontWeight: labelFontWeight,
                fontSize: labelFontSize,
                fontFamily: labelFontFamily,
                color: labelColor,
            },
        } = this;

        processedData.data.forEach((group) => {
            const {
                aggValues: [[negativeAgg, positiveAgg]] = [[0, 0]],
                datum,
                datum: { length: frequency },
                keys: domain,
                keys: [xDomainMin, xDomainMax],
            } = group;

            const xMinPx = xScale.convert(xDomainMin);
            const xMaxPx = xScale.convert(xDomainMax);

            const total = negativeAgg + positiveAgg;

            const yZeroPx = yScale.convert(0);
            const yMaxPx = yScale.convert(total);
            const w = xMaxPx - xMinPx;
            const h = Math.abs(yMaxPx - yZeroPx);

            const selectionDatumLabel =
                total !== 0
                    ? {
                          text: labelFormatter({ value: total, seriesId }),
                          fontStyle: labelFontStyle,
                          fontWeight: labelFontWeight,
                          fontSize: labelFontSize,
                          fontFamily: labelFontFamily,
                          fill: labelColor,
                          x: xMinPx + w / 2,
                          y: yMaxPx + h / 2,
                      }
                    : undefined;

            const nodeMidPoint = {
                x: xMinPx + w / 2,
                y: yMaxPx + h / 2,
            };

            nodeData.push({
                series: this,
                datum, // required by SeriesNodeDatum, but might not make sense here
                // since each selection is an aggregation of multiple data.
                aggregatedValue: total,
                frequency,
                domain: domain as [number, number],
                yKey,
                xKey,
                x: xMinPx,
                y: yMaxPx,
                width: w,
                height: h,
                nodeMidPoint,
                fill: fill,
                stroke: stroke,
                strokeWidth: strokeWidth,
                label: selectionDatumLabel,
            });
        });

        return [{ itemId: this.yKey ?? this.id, nodeData, labelData: nodeData }];
    }

    protected nodeFactory() {
        return new Rect();
    }

    protected async updateDatumSelection(opts: {
        nodeData: HistogramNodeDatum[];
        datumSelection: Selection<Rect, HistogramNodeDatum>;
    }) {
        const { nodeData, datumSelection } = opts;

        return datumSelection.update(nodeData, (rect) => {
            rect.tag = HistogramSeriesNodeTag.Bin;
            rect.crisp = true;
        });
    }

    protected async updateDatumNodes(opts: {
        datumSelection: Selection<Rect, HistogramNodeDatum>;
        isHighlight: boolean;
    }) {
        const { datumSelection, isHighlight: isDatumHighlighted } = opts;
        const {
            fillOpacity: seriesFillOpacity,
            strokeOpacity,
            shadow,
            highlightStyle: {
                item: {
                    fill: highlightedFill,
                    fillOpacity: highlightFillOpacity = seriesFillOpacity,
                    stroke: highlightedStroke,
                    strokeWidth: highlightedDatumStrokeWidth,
                },
            },
        } = this;

        datumSelection.each((rect, datum, index) => {
            const strokeWidth =
                isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : datum.strokeWidth;
            const fillOpacity = isDatumHighlighted ? highlightFillOpacity : seriesFillOpacity;

            rect.x = datum.x;
            rect.width = datum.width;
            rect.fill = (isDatumHighlighted ? highlightedFill : undefined) ?? datum.fill;
            rect.stroke = (isDatumHighlighted ? highlightedStroke : undefined) ?? datum.stroke;
            rect.fillOpacity = fillOpacity;
            rect.strokeOpacity = strokeOpacity;
            rect.strokeWidth = strokeWidth;
            rect.lineDash = this.lineDash;
            rect.lineDashOffset = this.lineDashOffset;
            rect.fillShadow = shadow;
            rect.zIndex = isDatumHighlighted ? Series.highlightedZIndex : index;
            rect.visible = datum.height > 0; // prevent stroke from rendering for zero height columns
        });
    }

    protected async updateLabelSelection(opts: {
        labelData: HistogramNodeDatum[];
        labelSelection: Selection<Text, HistogramNodeDatum>;
    }) {
        const { labelData, labelSelection } = opts;

        return labelSelection.update(labelData, (text) => {
            text.tag = HistogramSeriesNodeTag.Label;
            text.pointerEvents = PointerEvents.None;
            text.textAlign = 'center';
            text.textBaseline = 'middle';
        });
    }

    protected async updateLabelNodes(opts: { labelSelection: Selection<Text, HistogramNodeDatum> }) {
        const { labelSelection } = opts;
        const labelEnabled = this.label.enabled;

        labelSelection.each((text, datum) => {
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
    }

    getTooltipHtml(nodeDatum: HistogramNodeDatum): string {
        const { xKey, yKey = '', xAxis, yAxis } = this;

        if (!xKey || !xAxis || !yAxis) {
            return '';
        }

        const { xName, yName, fill: color, tooltip, aggregation, id: seriesId } = this;
        const { renderer: tooltipRenderer } = tooltip;
        const {
            aggregatedValue,
            frequency,
            domain,
            domain: [rangeMin, rangeMax],
        } = nodeDatum;
        const title = `${sanitizeHtml(xName ?? xKey)}: ${xAxis.formatDatum(rangeMin)} - ${xAxis.formatDatum(rangeMax)}`;
        let content = yKey
            ? `<b>${sanitizeHtml(yName ?? yKey)} (${aggregation})</b>: ${yAxis.formatDatum(aggregatedValue)}<br>`
            : '';

        content += `<b>Frequency</b>: ${frequency}`;

        const defaults: AgTooltipRendererResult = {
            title,
            backgroundColor: color,
            content,
        };

        if (tooltipRenderer) {
            return toTooltipHtml(
                tooltipRenderer({
                    datum: {
                        data: nodeDatum.datum,
                        aggregatedValue: nodeDatum.aggregatedValue,
                        domain: nodeDatum.domain,
                        frequency: nodeDatum.frequency,
                    },
                    xKey,
                    xValue: domain,
                    xName,
                    yKey,
                    yValue: aggregatedValue,
                    yName,
                    color,
                    title,
                    seriesId,
                }),
                defaults
            );
        }

        return toTooltipHtml(defaults);
    }

    getLegendData(): ChartLegendDatum[] {
        const { id, data, xKey, yName, visible, fill, stroke, fillOpacity, strokeOpacity } = this;

        if (!data || data.length === 0) {
            return [];
        }

        const legendData: CategoryLegendDatum[] = [
            {
                legendType: 'category',
                id,
                itemId: xKey,
                seriesId: id,
                enabled: visible,
                label: {
                    text: yName ?? xKey ?? 'Frequency',
                },
                marker: {
                    fill: fill ?? 'rgba(0, 0, 0, 0)',
                    stroke: stroke ?? 'rgba(0, 0, 0, 0)',
                    fillOpacity: fillOpacity,
                    strokeOpacity: strokeOpacity,
                },
            },
        ];
        return legendData;
    }

    animateEmptyUpdateReady({
        datumSelections,
        labelSelections,
    }: {
        datumSelections: Array<Selection<Rect, HistogramNodeDatum>>;
        labelSelections: Array<Selection<Text, HistogramNodeDatum>>;
    }) {
        const duration = 1000;

        let startingY = 0;
        datumSelections.forEach((datumSelection) =>
            datumSelection.each((_, datum) => {
                startingY = Math.max(startingY, datum.height + datum.y);
            })
        );

        datumSelections.forEach((datumSelection) => {
            datumSelection.each((rect, datum) => {
                this.animationManager?.animateMany(
                    `${this.id}_empty-update-ready_${rect.id}`,
                    [
                        { from: startingY, to: datum.y },
                        { from: 0, to: datum.height },
                    ],
                    {
                        disableInteractions: true,
                        duration,
                        ease: easing.linear,
                        repeat: 0,
                        onUpdate([y, height]) {
                            rect.y = y;
                            rect.height = height;

                            rect.x = datum.x;
                            rect.width = datum.width;
                        },
                    }
                );
            });
        });

        labelSelections.forEach((labelSelection) => {
            labelSelection.each((label) => {
                this.animationManager?.animate(`${this.id}_empty-update-ready_${label.id}`, {
                    from: 0,
                    to: 1,
                    delay: duration - duration / 10,
                    duration: duration / 10,
                    ease: easing.linear,
                    repeat: 0,
                    onUpdate: (opacity) => {
                        label.opacity = opacity;
                    },
                });
            });
        });
    }

    animateReadyUpdate({ datumSelections }: { datumSelections: Array<Selection<Rect, HistogramNodeDatum>> }) {
        datumSelections.forEach((datumSelection) => {
            this.resetSelectionRects(datumSelection);
        });
    }

    animateReadyHighlight(highlightSelection: Selection<Rect, HistogramNodeDatum>) {
        this.resetSelectionRects(highlightSelection);
    }

    animateReadyResize({ datumSelections }: { datumSelections: Array<Selection<Rect, HistogramNodeDatum>> }) {
        this.animationManager?.stop();
        datumSelections.forEach((datumSelection) => {
            this.resetSelectionRects(datumSelection);
        });
    }

    resetSelectionRects(selection: Selection<Rect, HistogramNodeDatum>) {
        selection.each((rect, datum) => {
            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
        });
    }

    protected isLabelEnabled() {
        return this.label.enabled;
    }
}
