import { Selection } from '../../../scene/selection';
import { DropShadow } from '../../../scene/dropShadow';
import { SeriesTooltip, SeriesNodeDataContext, keyProperty, valueProperty } from '../series';
import { BBox } from '../../../scene/bbox';
import { PointerEvents } from '../../../scene/node';
import { ChartLegendDatum, CategoryLegendDatum } from '../../legendDatum';
import { Path } from '../../../scene/shape/path';
import { Marker } from '../../marker/marker';
import {
    CartesianSeries,
    CartesianSeriesMarker,
    CartesianSeriesNodeClickEvent,
    CartesianSeriesNodeDatum,
    CartesianSeriesNodeDoubleClickEvent,
} from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { getMarker } from '../../marker/util';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { extent } from '../../../util/array';
import { areArrayItemsStrictlyEqual } from '../../../util/equal';
import { interpolate } from '../../../util/string';
import { Text } from '../../../scene/shape/text';
import { Label } from '../../label';
import { sanitizeHtml } from '../../../util/sanitize';
import { isContinuous, isNumber } from '../../../util/value';
import { ContinuousScale } from '../../../scale/continuousScale';
import { Point, SizedPoint } from '../../../scene/point';
import {
    BOOLEAN_ARRAY,
    NUMBER,
    OPT_FUNCTION,
    OPT_LINE_DASH,
    OPT_STRING,
    STRING_ARRAY,
    COLOR_STRING_ARRAY,
    Validate,
    OPT_NUMBER,
} from '../../../util/validation';
import {
    AgCartesianSeriesTooltipRendererParams,
    AgCartesianSeriesLabelFormatterParams,
    FontStyle,
    FontWeight,
    AgTooltipRendererResult,
    AgCartesianSeriesMarkerFormat,
} from '../../agChartOptions';
import { LogAxis } from '../../axis/logAxis';
import { DataModel } from '../../data/dataModel';
import { TimeAxis } from '../../axis/timeAxis';
import { sum } from '../../data/aggregateFunctions';
import { normaliseGroupTo } from '../../data/processors';
import { LegendItemDoubleClickChartEvent } from '../../interaction/chartEventManager';
import * as easing from '../../../motion/easing';

interface FillSelectionDatum {
    readonly itemId: string;
    readonly points: { x: number; y: number }[];
}

interface StrokeSelectionDatum extends FillSelectionDatum {
    readonly yValues: (number | undefined)[];
}

interface MarkerSelectionDatum extends Required<CartesianSeriesNodeDatum> {
    readonly index: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly yValue: number;
    readonly cumulativeValue: number;
}

interface LabelSelectionDatum {
    readonly index: number;
    readonly itemId: any;
    readonly point: Readonly<Point>;
    readonly label?: {
        readonly text: string;
        readonly fontStyle?: FontStyle;
        readonly fontWeight?: FontWeight;
        readonly fontSize: number;
        readonly fontFamily: string;
        readonly textAlign: CanvasTextAlign;
        readonly textBaseline: CanvasTextBaseline;
        readonly fill: string;
    };
}

type CumulativeValue = { left: number; right: number };

class AreaSeriesLabel extends Label {
    @Validate(OPT_FUNCTION)
    formatter?: (params: AgCartesianSeriesLabelFormatterParams) => string = undefined;
}

class AreaSeriesTooltip extends SeriesTooltip {
    @Validate(OPT_FUNCTION)
    renderer?: (params: AgCartesianSeriesTooltipRendererParams) => string | AgTooltipRendererResult = undefined;

    @Validate(OPT_STRING)
    format?: string = undefined;
}

enum AreaSeriesTag {
    Fill,
    Stroke,
    Marker,
    Label,
}

type AreaSeriesNodeDataContext = SeriesNodeDataContext<MarkerSelectionDatum, LabelSelectionDatum> & {
    fillSelectionData: FillSelectionDatum;
    strokeSelectionData: StrokeSelectionDatum;
};

export class AreaSeries extends CartesianSeries<AreaSeriesNodeDataContext> {
    static className = 'AreaSeries';
    static type = 'area' as const;

    tooltip: AreaSeriesTooltip = new AreaSeriesTooltip();

    readonly marker = new CartesianSeriesMarker();

    readonly label = new AreaSeriesLabel();

    @Validate(COLOR_STRING_ARRAY)
    fills: string[] = ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'];

    @Validate(COLOR_STRING_ARRAY)
    strokes: string[] = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];

    @Validate(NUMBER(0, 1))
    fillOpacity = 1;

    @Validate(NUMBER(0, 1))
    strokeOpacity = 1;

    @Validate(OPT_LINE_DASH)
    lineDash?: number[] = [0];

    @Validate(NUMBER(0))
    lineDashOffset: number = 0;

    constructor() {
        super({
            pathsPerSeries: 2,
            pathsZIndexSubOrderOffset: [0, 1000],
            hasMarkers: true,
            directionKeys: {
                [ChartAxisDirection.X]: ['xKey'],
                [ChartAxisDirection.Y]: ['yKeys'],
            },
            directionNames: {
                [ChartAxisDirection.X]: ['xName'],
                [ChartAxisDirection.Y]: ['yNames'],
            },
        });

        const { marker, label } = this;

        marker.enabled = false;

        label.enabled = false;
    }

    @Validate(OPT_STRING)
    xKey?: string = undefined;

    @Validate(OPT_STRING)
    xName?: string = undefined;

    @Validate(STRING_ARRAY)
    protected _yKeys: string[] = [];
    set yKeys(values: string[]) {
        if (!areArrayItemsStrictlyEqual(this._yKeys, values)) {
            this._yKeys = values;
            this.processedData = undefined;

            this.processSeriesItemEnabled();
        }
    }

    get yKeys(): string[] {
        return this._yKeys;
    }

    @Validate(BOOLEAN_ARRAY)
    protected _visibles: boolean[] = [];
    set visibles(visibles: boolean[]) {
        this._visibles = visibles;
        this.processSeriesItemEnabled();
    }
    get visibles() {
        return this._visibles;
    }

    private processSeriesItemEnabled() {
        const { seriesItemEnabled, _visibles: visibles = [] } = this;
        seriesItemEnabled.clear();
        this._yKeys.forEach((key, idx) => seriesItemEnabled.set(key, visibles[idx] ?? true));
    }

    @Validate(STRING_ARRAY)
    yNames: string[] = [];

    @Validate(OPT_NUMBER())
    private _normalizedTo?: number;
    set normalizedTo(value: number | undefined) {
        const absValue = value ? Math.abs(value) : undefined;

        if (this._normalizedTo !== absValue) {
            this._normalizedTo = absValue;
        }
    }

    get normalizedTo(): number | undefined {
        return this._normalizedTo;
    }

    @Validate(NUMBER(0))
    strokeWidth = 2;

    shadow?: DropShadow = undefined;

    protected highlightedDatum?: MarkerSelectionDatum;

    async processData() {
        const { xKey, yKeys, seriesItemEnabled, xAxis, yAxis, normalizedTo } = this;
        const data = xKey && yKeys.length && this.data ? this.data : [];

        const isContinuousX = xAxis?.scale instanceof ContinuousScale;
        const isContinuousY = yAxis?.scale instanceof ContinuousScale;

        const enabledYKeys = [...seriesItemEnabled.entries()].filter(([, enabled]) => enabled).map(([yKey]) => yKey);

        const normaliseTo = normalizedTo && isFinite(normalizedTo) ? normalizedTo : undefined;
        const extraProps = [];
        if (normaliseTo) {
            extraProps.push(normaliseGroupTo(enabledYKeys, normaliseTo, 'sum'));
        }

        this.dataModel = new DataModel<any, any, true>({
            props: [
                keyProperty(xKey, isContinuousX, { id: 'xValue' }),
                ...enabledYKeys.map((yKey) =>
                    valueProperty(yKey, isContinuousY, {
                        id: `yValue-${yKey}`,
                        missingValue: NaN,
                        invalidValue: undefined,
                    })
                ),
                sum(enabledYKeys),
                ...extraProps,
            ],
            groupByKeys: true,
            dataVisible: this.visible && enabledYKeys.length > 0,
        });

        this.processedData = this.dataModel.processData(data);
    }

    getDomain(direction: ChartAxisDirection): any[] {
        const { processedData, xAxis, yAxis } = this;
        if (!processedData) return [];

        const {
            defs: {
                keys: [keyDef],
            },
            domain: {
                keys: [keys],
                values: [yExtent],
                aggValues: [ySumExtent] = [],
            },
        } = processedData;

        if (direction === ChartAxisDirection.X) {
            if (keyDef.valueType === 'category') {
                return keys;
            }

            return this.fixNumericExtent(extent(keys), xAxis);
        } else if (yAxis instanceof LogAxis || yAxis instanceof TimeAxis) {
            return this.fixNumericExtent(yExtent as any, yAxis);
        } else {
            return this.fixNumericExtent(ySumExtent, yAxis);
        }
    }

    async createNodeData() {
        const { xAxis, yAxis, data, processedData: { data: groupedData } = {} } = this;

        if (!xAxis || !yAxis || !data) {
            return [];
        }

        const contexts: AreaSeriesNodeDataContext[] = [];
        const { yKeys, xKey = '', marker, label, fills, strokes, id: seriesId } = this;
        const { scale: xScale } = xAxis;
        const { scale: yScale } = yAxis;

        const continuousY = yScale instanceof ContinuousScale;

        const xOffset = (xScale.bandwidth ?? 0) / 2;

        const xDataCount = data.length;
        const cumulativePathValues: CumulativeValue[] = new Array(xDataCount)
            .fill(null)
            .map(() => ({ left: 0, right: 0 }));
        const cumulativeMarkerValues: number[] = new Array(xDataCount).fill(0);

        const createPathCoordinates = (
            xDatum: any,
            yDatum: number,
            idx: number,
            side: keyof CumulativeValue
        ): [SizedPoint, SizedPoint] => {
            const x = xScale.convert(xDatum) + xOffset;

            const prevY = cumulativePathValues[idx][side];
            const currY = cumulativePathValues[idx][side] + yDatum;

            const prevYCoordinate = yScale.convert(prevY, { strict: false });
            const currYCoordinate = yScale.convert(currY, { strict: false });

            cumulativePathValues[idx][side] = currY;

            return [
                { x, y: currYCoordinate, size: marker.size },
                { x, y: prevYCoordinate, size: marker.size },
            ];
        };

        const createMarkerCoordinate = (xDatum: any, yDatum: number, idx: number, rawYDatum: any): SizedPoint => {
            let currY;

            // if not normalized, the invalid data points will be processed as `undefined` in processData()
            // if normalized, the invalid data points will be processed as 0 rather than `undefined`
            // check if unprocessed datum is valid as we only want to show markers for valid points
            const normalized = this.normalizedTo && isFinite(this.normalizedTo);
            const normalizedAndValid = normalized && continuousY && isContinuous(rawYDatum);

            const valid = (!normalized && !isNaN(rawYDatum)) || normalizedAndValid;

            if (valid) {
                currY = cumulativeMarkerValues[idx] += yDatum;
            }

            const x = xScale.convert(xDatum) + xOffset;
            const y = yScale.convert(currY, { strict: false });

            return { x, y, size: marker.size };
        };

        yKeys.forEach((yKey, seriesIdx) => {
            const yKeyDataIndex = this.dataModel?.resolveProcessedDataIndexById(`yValue-${yKey}`);
            const labelSelectionData: LabelSelectionDatum[] = [];
            const markerSelectionData: MarkerSelectionDatum[] = [];
            const strokeSelectionData: StrokeSelectionDatum = { itemId: yKey, points: [], yValues: [] };
            const fillSelectionData: FillSelectionDatum = { itemId: yKey, points: [] };
            contexts[seriesIdx] = {
                itemId: yKey,
                fillSelectionData,
                labelData: labelSelectionData,
                nodeData: markerSelectionData,
                strokeSelectionData,
            };

            if (!yKeyDataIndex) {
                return;
            }

            const fillPoints = fillSelectionData.points;
            const fillPhantomPoints: SizedPoint[] = [];

            const strokePoints = strokeSelectionData.points;
            const yValues = strokeSelectionData.yValues;

            let datumIdx = -1;
            groupedData?.forEach((datumGroup, dataIdx) => {
                const {
                    keys: [xDatum],
                    datum: datumArray,
                    values: valuesArray,
                } = datumGroup;

                valuesArray.forEach((values, valueIdx) => {
                    datumIdx++;

                    const seriesDatum = datumArray[valueIdx];
                    const rawYDatum = values[yKeyDataIndex.index];
                    const yDatum = isNaN(rawYDatum) ? undefined : rawYDatum;

                    const nextValuesSameGroup = valueIdx < valuesArray.length - 1;
                    const nextDatumGroup = nextValuesSameGroup ? datumGroup : groupedData[dataIdx + 1];
                    const nextXDatum = nextDatumGroup?.keys[0];
                    const rawNextYIdx = nextValuesSameGroup ? valueIdx + 1 : 0;
                    const rawNextYDatum = nextDatumGroup?.values[rawNextYIdx][yKeyDataIndex.index];
                    const nextYDatum = isNaN(rawNextYDatum) ? undefined : rawNextYDatum;

                    // marker data
                    const point = createMarkerCoordinate(xDatum, +yDatum, datumIdx, seriesDatum[yKey]);

                    if (marker) {
                        markerSelectionData.push({
                            index: datumIdx,
                            series: this,
                            itemId: yKey,
                            datum: seriesDatum,
                            nodeMidPoint: { x: point.x, y: point.y },
                            cumulativeValue: cumulativeMarkerValues[datumIdx],
                            yValue: yDatum,
                            yKey,
                            xKey,
                            point,
                            fill: fills[seriesIdx % fills.length],
                            stroke: strokes[seriesIdx % strokes.length],
                        });
                    }

                    // label data
                    let labelText: string;

                    if (label.formatter) {
                        labelText = label.formatter({ value: yDatum, seriesId });
                    } else {
                        labelText = isNumber(yDatum) ? Number(yDatum).toFixed(2) : String(yDatum);
                    }

                    if (label) {
                        labelSelectionData.push({
                            index: datumIdx,
                            itemId: yKey,
                            point,
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
                        });
                    }

                    // fill data
                    // Handle data in pairs of current and next x and y values
                    const windowX = [xDatum, nextXDatum];
                    const windowY = [yDatum, nextYDatum];

                    if (windowX.some((v) => v == undefined)) {
                        return;
                    }
                    if (windowY.some((v) => v == undefined)) {
                        windowY[0] = 0;
                        windowY[1] = 0;
                    }

                    const currCoordinates = createPathCoordinates(windowX[0], +windowY[0]!, datumIdx, 'right');
                    fillPoints.push(currCoordinates[0]);
                    fillPhantomPoints.push(currCoordinates[1]);

                    const nextCoordinates = createPathCoordinates(windowX[1], +windowY[1]!, datumIdx, 'left');
                    fillPoints.push(nextCoordinates[0]);
                    fillPhantomPoints.push(nextCoordinates[1]);

                    // stroke data
                    strokePoints.push({ x: NaN, y: NaN }); // moveTo
                    yValues.push(undefined);

                    strokePoints.push(currCoordinates[0]);
                    yValues.push(yDatum);

                    if (nextYDatum !== undefined) {
                        strokePoints.push(nextCoordinates[0]);
                        yValues.push(yDatum);
                    }
                });
            });

            for (let i = fillPhantomPoints.length - 1; i >= 0; i--) {
                fillPoints.push(fillPhantomPoints[i]);
            }
        });

        return contexts;
    }

    protected isPathOrSelectionDirty(): boolean {
        return this.marker.isDirty();
    }

    protected markerFactory() {
        const { shape } = this.marker;
        const MarkerShape = getMarker(shape);
        return new MarkerShape();
    }

    protected async updateMarkerSelection(opts: {
        nodeData: MarkerSelectionDatum[];
        markerSelection: Selection<Marker, MarkerSelectionDatum>;
    }) {
        const { nodeData, markerSelection } = opts;
        const {
            marker: { enabled },
        } = this;
        const data = enabled && nodeData ? nodeData : [];

        if (this.marker.isDirty()) {
            markerSelection.clear();
        }

        return markerSelection.update(data, (marker) => {
            marker.tag = AreaSeriesTag.Marker;
        });
    }

    protected async updateMarkerNodes(opts: {
        markerSelection: Selection<Marker, MarkerSelectionDatum>;
        isHighlight: boolean;
    }) {
        const { markerSelection, isHighlight: isDatumHighlighted } = opts;
        const {
            id: seriesId,
            xKey = '',
            marker,
            seriesItemEnabled,
            yKeys,
            fills,
            strokes,
            fillOpacity: seriesFillOpacity,
            marker: { fillOpacity: markerFillOpacity = seriesFillOpacity },
            strokeOpacity,
            highlightStyle: {
                item: {
                    fill: highlightedFill,
                    fillOpacity: highlightFillOpacity = markerFillOpacity,
                    stroke: highlightedStroke,
                    strokeWidth: highlightedDatumStrokeWidth,
                },
            },
        } = this;

        const { size, formatter } = marker;
        const markerStrokeWidth = marker.strokeWidth ?? this.strokeWidth;

        const customMarker = typeof marker.shape === 'function';

        markerSelection.each((node, datum) => {
            const yKeyIndex = yKeys.indexOf(datum.yKey);
            const fill =
                isDatumHighlighted && highlightedFill !== undefined
                    ? highlightedFill
                    : marker.fill ?? fills[yKeyIndex % fills.length];
            const fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
            const stroke =
                isDatumHighlighted && highlightedStroke !== undefined
                    ? highlightedStroke
                    : marker.stroke ?? strokes[yKeyIndex % fills.length];
            const strokeWidth =
                isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : markerStrokeWidth;

            let format: AgCartesianSeriesMarkerFormat | undefined = undefined;
            if (formatter) {
                format = formatter({
                    datum: datum.datum,
                    xKey,
                    yKey: datum.yKey,
                    fill,
                    stroke,
                    strokeWidth,
                    size,
                    highlighted: isDatumHighlighted,
                    seriesId,
                });
            }

            node.fill = format?.fill ?? fill;
            node.stroke = format?.stroke ?? stroke;
            node.strokeWidth = format?.strokeWidth ?? strokeWidth;
            node.fillOpacity = fillOpacity ?? 1;
            node.strokeOpacity = marker.strokeOpacity ?? strokeOpacity ?? 1;
            node.size = format?.size ?? size;

            node.translationX = datum.point.x;
            node.translationY = datum.point.y;
            node.visible =
                node.size > 0 && !!seriesItemEnabled.get(datum.yKey) && !isNaN(datum.point.x) && !isNaN(datum.point.y);

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
    }

    protected async updateLabelSelection(opts: {
        labelData: LabelSelectionDatum[];
        labelSelection: Selection<Text, LabelSelectionDatum>;
    }) {
        const { labelData, labelSelection } = opts;

        return labelSelection.update(labelData, (text) => {
            text.tag = AreaSeriesTag.Label;
        });
    }

    protected async updateLabelNodes(opts: { labelSelection: Selection<Text, LabelSelectionDatum> }) {
        const { labelSelection } = opts;
        const { enabled: labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color } = this.label;
        labelSelection.each((text, datum) => {
            const { point, label } = datum;

            if (label && labelEnabled) {
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
            } else {
                text.visible = false;
            }
        });
    }

    protected getNodeClickEvent(event: MouseEvent, datum: MarkerSelectionDatum): CartesianSeriesNodeClickEvent<any> {
        return new CartesianSeriesNodeClickEvent(this.xKey ?? '', datum.yKey, event, datum, this);
    }

    protected getNodeDoubleClickEvent(
        event: MouseEvent,
        datum: MarkerSelectionDatum
    ): CartesianSeriesNodeDoubleClickEvent<any> {
        return new CartesianSeriesNodeDoubleClickEvent(this.xKey ?? '', datum.yKey, event, datum, this);
    }

    getTooltipHtml(nodeDatum: MarkerSelectionDatum): string {
        const { xKey, id: seriesId } = this;
        const { yKey } = nodeDatum;
        const yKeyDataIndex = this.dataModel?.resolveProcessedDataIndexById(`yValue-${yKey}`);

        if (!(xKey && yKey) || !yKeyDataIndex) {
            return '';
        }

        const datum = nodeDatum.datum;
        const xValue = datum[xKey];
        const yValue = datum[yKey];
        const { xAxis, yAxis, yKeys } = this;

        if (!(xAxis && yAxis && isNumber(yValue)) || !yKeyDataIndex) {
            return '';
        }

        const { xName, yNames, fills, strokes, tooltip, marker } = this;

        const {
            size,
            formatter: markerFormatter,
            strokeWidth: markerStrokeWidth,
            fill: markerFill,
            stroke: markerStroke,
        } = marker;

        const xString = xAxis.formatDatum(xValue);
        const yString = yAxis.formatDatum(yValue);
        const yKeyIndex = yKeys.indexOf(yKey);
        const processedYValue = this.processedData?.data[nodeDatum.index]?.values[0][yKeyDataIndex?.index];
        const yName = yNames[yKeyIndex];
        const title = sanitizeHtml(yName);
        const content = sanitizeHtml(xString + ': ' + yString);

        const strokeWidth = markerStrokeWidth ?? this.strokeWidth;
        const fill = markerFill ?? fills[yKeyIndex % fills.length];
        const stroke = markerStroke ?? strokes[yKeyIndex % fills.length];

        let format: AgCartesianSeriesMarkerFormat | undefined = undefined;

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

        const color = format?.fill ?? fill;

        const defaults: AgTooltipRendererResult = {
            title,
            backgroundColor: color,
            content,
        };
        const { renderer: tooltipRenderer, format: tooltipFormat } = tooltip;

        if (tooltipFormat || tooltipRenderer) {
            const params = {
                datum,
                xKey,
                xName,
                xValue,
                yKey,
                yValue,
                processedYValue,
                yName,
                color,
                title,
                seriesId,
            };
            if (tooltipFormat) {
                return toTooltipHtml(
                    {
                        content: interpolate(tooltipFormat, params),
                    },
                    defaults
                );
            }
            if (tooltipRenderer) {
                return toTooltipHtml(tooltipRenderer(params), defaults);
            }
        }

        return toTooltipHtml(defaults);
    }

    getLegendData(): ChartLegendDatum[] {
        const { data, id, xKey, yKeys, yNames, seriesItemEnabled, marker, fills, strokes, fillOpacity, strokeOpacity } =
            this;

        if (!data?.length || !xKey || !yKeys.length) {
            return [];
        }

        const legendData: CategoryLegendDatum[] = [];

        // Area stacks should be listed in the legend in reverse order, for symmetry with the
        // vertical stack display order.
        for (let index = yKeys.length - 1; index >= 0; index--) {
            const yKey = yKeys[index];
            legendData.push({
                legendType: 'category',
                id,
                itemId: yKey,
                seriesId: id,
                enabled: seriesItemEnabled.get(yKey) ?? false,
                label: {
                    text: yNames[index] || yKeys[index],
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill ?? fills[index % fills.length],
                    stroke: marker.stroke ?? strokes[index % strokes.length],
                    fillOpacity: marker.fillOpacity ?? fillOpacity,
                    strokeOpacity: marker.strokeOpacity ?? strokeOpacity,
                },
            });
        }

        return legendData;
    }

    onLegendItemDoubleClick(event: LegendItemDoubleClickChartEvent) {
        const { enabled, itemId, series, numVisibleItems } = event;

        const newEnableds: { [key: string]: boolean } = {};

        const totalVisibleItems = Object.values(numVisibleItems).reduce((p, v) => p + v, 0);
        const singleEnabledWasClicked = totalVisibleItems === 1 && enabled;

        if (series.id === this.id) {
            const singleEnabledInEachSeries =
                Object.values(numVisibleItems).filter((v) => v === 1).length === Object.keys(numVisibleItems).length;

            this.yKeys.forEach((yKey) => {
                const matches = yKey === itemId;

                const newEnabled = matches || singleEnabledWasClicked || (singleEnabledInEachSeries && enabled);

                newEnableds[yKey] = newEnableds[yKey] ?? newEnabled;
            });
        } else {
            this.yKeys.forEach((yKey) => {
                newEnableds[yKey] = singleEnabledWasClicked;
            });
        }

        Object.keys(newEnableds).forEach((yKey) => {
            super.toggleSeriesItem(yKey, newEnableds[yKey]);
        });
    }

    animateEmptyUpdateReady({
        markerSelections,
        labelSelections,
        contextData,
        paths,
        seriesRect,
    }: {
        markerSelections: Array<Selection<Marker, MarkerSelectionDatum>>;
        labelSelections: Array<Selection<Text, LabelSelectionDatum>>;
        contextData: Array<AreaSeriesNodeDataContext>;
        paths: Array<Array<Path>>;
        seriesRect?: BBox;
    }) {
        const { strokes, fills, fillOpacity, lineDash, lineDashOffset, strokeOpacity, strokeWidth, shadow } = this;

        contextData.forEach(({ fillSelectionData, strokeSelectionData, itemId }, seriesIdx) => {
            const [fill, stroke] = paths[seriesIdx];

            const duration = 1000;

            const animationOptions = {
                from: 0,
                to: seriesRect?.width ?? 0,
                disableInteractions: true,
                duration,
                ease: easing.linear,
                repeat: 0,
            };

            // Stroke
            {
                const { points, yValues } = strokeSelectionData;

                stroke.tag = AreaSeriesTag.Stroke;
                stroke.fill = undefined;
                stroke.lineJoin = stroke.lineCap = 'round';
                stroke.pointerEvents = PointerEvents.None;

                stroke.stroke = strokes[seriesIdx % strokes.length];
                stroke.strokeWidth = this.getStrokeWidth(this.strokeWidth, { itemId });
                stroke.strokeOpacity = strokeOpacity;
                stroke.lineDash = lineDash;
                stroke.lineDashOffset = lineDashOffset;

                this.animationManager?.animate<number>(`${this.id}_empty-update-ready_stroke_${seriesIdx}`, {
                    ...animationOptions,
                    onUpdate(xValue) {
                        stroke.path.clear({ trackChanges: true });

                        let moveTo = true;
                        points.forEach((point, index) => {
                            // Draw/move the full segment if past the end of this segment
                            if (yValues[index] === undefined || isNaN(point.x) || isNaN(point.y)) {
                                moveTo = true;
                            } else if (point.x <= xValue) {
                                if (moveTo) {
                                    stroke.path.moveTo(point.x, point.y);
                                    moveTo = false;
                                } else {
                                    stroke.path.lineTo(point.x, point.y);
                                }
                            } else if (
                                index > 0 &&
                                yValues[index] !== undefined &&
                                yValues[index - 1] !== undefined &&
                                points[index - 1].x <= xValue
                            ) {
                                // Draw/move partial line if in between the start and end of this segment
                                const start = points[index - 1];
                                const end = point;

                                const x = xValue;
                                const y = start.y + ((x - start.x) * (end.y - start.y)) / (end.x - start.x);

                                stroke.path.lineTo(x, y);
                            }
                        });

                        stroke.checkPathDirty();
                    },
                });
            }

            // Fill
            {
                const { points: allPoints } = fillSelectionData;
                const points = allPoints.slice(0, allPoints.length / 2);
                const bottomPoints = allPoints.slice(allPoints.length / 2);

                fill.tag = AreaSeriesTag.Fill;
                fill.stroke = undefined;
                fill.lineJoin = 'round';
                fill.pointerEvents = PointerEvents.None;

                fill.fill = fills[seriesIdx % fills.length];
                fill.fillOpacity = fillOpacity;
                fill.strokeOpacity = strokeOpacity;
                fill.strokeWidth = strokeWidth;
                fill.lineDash = lineDash;
                fill.lineDashOffset = lineDashOffset;
                fill.fillShadow = shadow;

                this.animationManager?.animate<number>(`${this.id}_empty-update-ready_fill_${seriesIdx}`, {
                    ...animationOptions,
                    onUpdate(xValue) {
                        fill.path.clear({ trackChanges: true });

                        let x = 0;
                        let y = 0;

                        points.forEach((point, index) => {
                            if (point.x <= xValue) {
                                // Draw/move the full segment if past the end of this segment
                                x = point.x;
                                y = point.y;

                                fill.path.lineTo(point.x, point.y);
                            } else if (index > 0 && points[index - 1].x < xValue) {
                                // Draw/move partial line if in between the start and end of this segment
                                const start = points[index - 1];
                                const end = point;

                                x = xValue;
                                y = start.y + ((x - start.x) * (end.y - start.y)) / (end.x - start.x);

                                fill.path.lineTo(x, y);
                            }
                        });

                        bottomPoints.forEach((point, index) => {
                            const reverseIndex = bottomPoints.length - index - 1;

                            if (point.x <= xValue) {
                                fill.path.lineTo(point.x, point.y);
                            } else if (reverseIndex > 0 && points[reverseIndex - 1].x < xValue) {
                                const start = point;
                                const end = bottomPoints[index + 1];

                                const bottomY = start.y + ((x - start.x) * (end.y - start.y)) / (end.x - start.x);

                                fill.path.lineTo(x, bottomY);
                            }
                        });

                        if (bottomPoints.length > 0) {
                            fill.path.lineTo(
                                bottomPoints[bottomPoints.length - 1].x,
                                bottomPoints[bottomPoints.length - 1].y
                            );
                        }

                        fill.path.closePath();
                        fill.checkPathDirty();
                    },
                });
            }

            markerSelections[seriesIdx].each((marker, datum) => {
                const delay = seriesRect?.width ? (datum.point.x / seriesRect.width) * duration : 0;
                const format = this.animateFormatter(datum);
                const size = datum.point?.size ?? 0;

                this.animationManager?.animate<number>(`${this.id}_empty-update-ready_${marker.id}`, {
                    ...animationOptions,
                    to: format?.size ?? size,
                    delay,
                    duration: duration / 10,
                    onUpdate(size) {
                        marker.size = size;
                    },
                });
            });

            labelSelections[seriesIdx].each((label, datum) => {
                const delay = seriesRect?.width ? (datum.point.x / seriesRect.width) * duration : 0;
                this.animationManager?.animate(`${this.id}_empty-update-ready_${label.id}`, {
                    from: 0,
                    to: 1,
                    delay,
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

    animateReadyUpdate({
        contextData,
        paths,
    }: {
        contextData: Array<AreaSeriesNodeDataContext>;
        paths: Array<Array<Path>>;
    }) {
        const { strokes, fills, fillOpacity, lineDash, lineDashOffset, strokeOpacity, strokeWidth, shadow } = this;

        contextData.forEach(({ strokeSelectionData, fillSelectionData, itemId }, seriesIdx) => {
            const [fill, stroke] = paths[seriesIdx];

            // Stroke
            stroke.stroke = strokes[seriesIdx % strokes.length];
            stroke.strokeWidth = this.getStrokeWidth(this.strokeWidth, { itemId });
            stroke.strokeOpacity = strokeOpacity;
            stroke.lineDash = lineDash;
            stroke.lineDashOffset = lineDashOffset;

            stroke.path.clear({ trackChanges: true });

            let moveTo = true;
            strokeSelectionData.points.forEach((point, index) => {
                if (strokeSelectionData.yValues[index] === undefined || isNaN(point.x) || isNaN(point.y)) {
                    moveTo = true;
                } else if (moveTo) {
                    stroke.path.moveTo(point.x, point.y);
                    moveTo = false;
                } else {
                    stroke.path.lineTo(point.x, point.y);
                }
            });

            stroke.checkPathDirty();

            // Fill

            fill.fill = fills[seriesIdx % fills.length];
            fill.fillOpacity = fillOpacity;
            fill.strokeOpacity = strokeOpacity;
            fill.strokeWidth = strokeWidth;
            fill.lineDash = lineDash;
            fill.lineDashOffset = lineDashOffset;
            fill.fillShadow = shadow;

            fill.path.clear({ trackChanges: true });

            fillSelectionData.points.forEach((point) => {
                fill.path.lineTo(point.x, point.y);
            });

            fill.path.closePath();
            fill.checkPathDirty();
        });
    }

    private animateFormatter(datum: MarkerSelectionDatum) {
        const { marker, fills, strokes, xKey = '', yKeys, id: seriesId } = this;
        const { size, formatter } = marker;

        const yKeyIndex = yKeys.indexOf(datum.yKey);

        const fill = marker.fill ?? fills[yKeyIndex % fills.length];
        const stroke = marker.stroke ?? strokes[yKeyIndex % fills.length];
        const strokeWidth = marker.strokeWidth ?? this.strokeWidth;

        let format: AgCartesianSeriesMarkerFormat | undefined = undefined;
        if (formatter) {
            format = formatter({
                datum: datum.datum,
                xKey,
                yKey: datum.yKey,
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

    protected isLabelEnabled() {
        return this.label.enabled;
    }
}
