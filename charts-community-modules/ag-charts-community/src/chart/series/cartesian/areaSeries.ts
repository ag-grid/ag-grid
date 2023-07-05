import type { Selection } from '../../../scene/selection';
import type { DropShadow } from '../../../scene/dropShadow';
import type { BBox } from '../../../scene/bbox';
import { PointerEvents } from '../../../scene/node';
import type { CategoryLegendDatum } from '../../legendDatum';
import type { Path } from '../../../scene/shape/path';
import type { Marker } from '../../marker/marker';
import type { SeriesNodeDataContext } from '../series';
import { SeriesTooltip, keyProperty, valueProperty, groupAccumulativeValueProperty } from '../series';
import type { CartesianSeriesNodeDatum } from './cartesianSeries';
import {
    CartesianSeries,
    CartesianSeriesMarker,
    CartesianSeriesNodeClickEvent,
    CartesianSeriesNodeDoubleClickEvent,
} from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { getMarker } from '../../marker/util';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { extent } from '../../../util/array';
import { interpolate } from '../../../util/string';
import type { Text } from '../../../scene/shape/text';
import { Label } from '../../label';
import { sanitizeHtml } from '../../../util/sanitize';
import { isContinuous, isNumber } from '../../../util/value';
import { ContinuousScale } from '../../../scale/continuousScale';
import type { Point, SizedPoint } from '../../../scene/point';
import {
    NUMBER,
    OPT_FUNCTION,
    OPT_LINE_DASH,
    OPT_STRING,
    Validate,
    OPT_NUMBER,
    COLOR_STRING,
} from '../../../util/validation';
import type {
    AgCartesianSeriesTooltipRendererParams,
    AgCartesianSeriesLabelFormatterParams,
    FontStyle,
    FontWeight,
    AgTooltipRendererResult,
    AgCartesianSeriesMarkerFormat,
} from '../../agChartOptions';
import { LogAxis } from '../../axis/logAxis';
import { TimeAxis } from '../../axis/timeAxis';
import { normaliseGroupTo } from '../../data/processors';
import type { ModuleContext } from '../../../util/moduleContext';
import type { DataController } from '../../data/dataController';

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

    @Validate(COLOR_STRING)
    fill: string = '#c16068';

    @Validate(COLOR_STRING)
    stroke: string = '#874349';

    @Validate(NUMBER(0, 1))
    fillOpacity = 1;

    @Validate(NUMBER(0, 1))
    strokeOpacity = 1;

    @Validate(OPT_LINE_DASH)
    lineDash?: number[] = [0];

    @Validate(NUMBER(0))
    lineDashOffset: number = 0;

    constructor(moduleCtx: ModuleContext) {
        super({
            moduleCtx,
            pathsPerSeries: 2,
            pathsZIndexSubOrderOffset: [0, 1000],
            hasMarkers: true,
        });

        const { marker, label } = this;

        marker.enabled = false;

        label.enabled = false;
    }

    @Validate(OPT_STRING)
    xKey?: string = undefined;

    @Validate(OPT_STRING)
    xName?: string = undefined;

    @Validate(OPT_STRING)
    yKey?: string;

    @Validate(OPT_STRING)
    yName?: string;

    @Validate(OPT_NUMBER(0))
    normalizedTo?: number;

    @Validate(NUMBER(0))
    strokeWidth = 2;

    shadow?: DropShadow = undefined;

    protected highlightedDatum?: MarkerSelectionDatum;

    async processData(dataController: DataController) {
        const { xKey, yKey, axes, normalizedTo, data, visible, seriesGrouping: { groupIndex = -1 } = {} } = this;

        if (!xKey || !yKey || !data) return;

        const xAxis = axes[ChartAxisDirection.X];
        const yAxis = axes[ChartAxisDirection.Y];

        const isContinuousX = xAxis?.scale instanceof ContinuousScale;
        const isContinuousY = yAxis?.scale instanceof ContinuousScale;
        const ids = [
            `area-stack-${groupIndex}-yValues`,
            `area-stack-${groupIndex}-yValues-trailing`,
            `area-stack-${groupIndex}-yValues-prev`,
            `area-stack-${groupIndex}-yValues-trailing-prev`,
            `area-stack-${groupIndex}-yValues-marker`,
        ];

        const extraProps = [];
        const normaliseTo = normalizedTo && isFinite(normalizedTo) ? normalizedTo : undefined;
        if (normaliseTo) {
            extraProps.push(normaliseGroupTo(this, [ids[0], ids[1], ids[4]], normaliseTo, 'range'));
            extraProps.push(normaliseGroupTo(this, [ids[2], ids[3]], normaliseTo, 'range'));
        }

        const { dataModel, processedData } = await dataController.request<any, any, true>(this.id, data, {
            props: [
                keyProperty(this, xKey, isContinuousX, { id: 'xValue' }),
                valueProperty(this, yKey, isContinuousY, { id: `yValue-raw`, invalidValue: null }),
                ...groupAccumulativeValueProperty(this, yKey, isContinuousY, 'window', 'current', {
                    id: `yValue-end`,
                    invalidValue: null,
                    groupId: ids[0],
                }),
                ...groupAccumulativeValueProperty(this, yKey, isContinuousY, 'window-trailing', 'current', {
                    id: `yValue-start`,
                    invalidValue: null,
                    groupId: ids[1],
                }),
                ...groupAccumulativeValueProperty(this, yKey, isContinuousY, 'window', 'last', {
                    id: `yValue-previous-end`,
                    invalidValue: null,
                    groupId: ids[2],
                }),
                ...groupAccumulativeValueProperty(this, yKey, isContinuousY, 'window-trailing', 'last', {
                    id: `yValue-previous-start`,
                    invalidValue: null,
                    groupId: ids[3],
                }),
                ...groupAccumulativeValueProperty(this, yKey, isContinuousY, 'normal', 'current', {
                    id: `yValue-cumulative`,
                    invalidValue: null,
                    groupId: ids[4],
                }),
                ...extraProps,
            ],
            groupByKeys: true,
            dataVisible: visible,
        });

        this.dataModel = dataModel;
        this.processedData = processedData;
    }

    getDomain(direction: ChartAxisDirection): any[] {
        const { processedData, dataModel, axes } = this;
        if (!processedData || !dataModel) return [];

        const xAxis = axes[ChartAxisDirection.X];
        const yAxis = axes[ChartAxisDirection.Y];

        const keyDef = dataModel.resolveProcessedDataDefById(this, `xValue`);
        const keys = dataModel.getDomain(this, `xValue`, 'key', processedData);
        const yExtent = dataModel.getDomain(this, /yValue-(previous-)?end/, 'value', processedData);

        if (direction === ChartAxisDirection.X) {
            if (keyDef?.def.type === 'key' && keyDef.def.valueType === 'category') {
                return keys;
            }

            return this.fixNumericExtent(extent(keys), xAxis);
        } else if (yAxis instanceof LogAxis || yAxis instanceof TimeAxis) {
            return this.fixNumericExtent(yExtent as any, yAxis);
        } else {
            const fixedYExtent = [yExtent[0] > 0 ? 0 : yExtent[0], yExtent[1] < 0 ? 0 : yExtent[1]];
            return this.fixNumericExtent(fixedYExtent as any, yAxis);
        }
    }

    async createNodeData() {
        const {
            axes,
            data,
            processedData: { data: groupedData } = {},
            dataModel,
            ctx: { callbackCache },
        } = this;

        const xAxis = axes[ChartAxisDirection.X];
        const yAxis = axes[ChartAxisDirection.Y];

        if (!xAxis || !yAxis || !data || !dataModel) {
            return [];
        }

        const { yKey = '', xKey = '', marker, label, fill, stroke, id: seriesId } = this;
        const { scale: xScale } = xAxis;
        const { scale: yScale } = yAxis;

        const continuousY = yScale instanceof ContinuousScale;

        const xOffset = (xScale.bandwidth ?? 0) / 2;

        const yStartIndex = dataModel.resolveProcessedDataIndexById(this, `yValue-start`).index;
        const yEndIndex = dataModel.resolveProcessedDataIndexById(this, `yValue-end`).index;
        const yRawIndex = dataModel.resolveProcessedDataIndexById(this, `yValue-raw`).index;
        const yPreviousStartIndex = dataModel.resolveProcessedDataIndexById(this, `yValue-previous-start`).index;
        const yPreviousEndIndex = dataModel.resolveProcessedDataIndexById(this, `yValue-previous-end`).index;
        const yCumulativeIndex = dataModel.resolveProcessedDataIndexById(this, `yValue-cumulative`).index;

        const createPathCoordinates = (xDatum: any, lastYEnd: number, yEnd: number): [SizedPoint, SizedPoint] => {
            const x = xScale.convert(xDatum) + xOffset;

            const prevYCoordinate = yScale.convert(lastYEnd, { strict: false });
            const currYCoordinate = yScale.convert(yEnd, { strict: false });

            return [
                { x, y: currYCoordinate, size: marker.size },
                { x, y: prevYCoordinate, size: marker.size },
            ];
        };

        const createMarkerCoordinate = (xDatum: any, yEnd: number, rawYDatum: any): SizedPoint => {
            let currY;

            // if not normalized, the invalid data points will be processed as `undefined` in processData()
            // if normalized, the invalid data points will be processed as 0 rather than `undefined`
            // check if unprocessed datum is valid as we only want to show markers for valid points
            const normalized = this.normalizedTo && isFinite(this.normalizedTo);
            const normalizedAndValid = normalized && continuousY && isContinuous(rawYDatum);

            const valid = (!normalized && !isNaN(rawYDatum)) || normalizedAndValid;

            if (valid) {
                currY = yEnd;
            }

            const x = xScale.convert(xDatum) + xOffset;
            const y = yScale.convert(currY, { strict: false });

            return { x, y, size: marker.size };
        };

        const labelSelectionData: LabelSelectionDatum[] = [];
        const markerSelectionData: MarkerSelectionDatum[] = [];
        const strokeSelectionData: StrokeSelectionDatum = { itemId: yKey, points: [], yValues: [] };
        const fillSelectionData: FillSelectionDatum = { itemId: yKey, points: [] };
        const context: AreaSeriesNodeDataContext = {
            itemId: yKey,
            fillSelectionData,
            labelData: labelSelectionData,
            nodeData: markerSelectionData,
            strokeSelectionData,
        };

        const fillPoints = fillSelectionData.points;
        const fillPhantomPoints: SizedPoint[] = [];

        const strokePoints = strokeSelectionData.points;
        const yValues = strokeSelectionData.yValues;

        let datumIdx = -1;
        let lastXDatum: any;
        groupedData?.forEach((datumGroup) => {
            const {
                keys: [xDatum],
                datum: datumArray,
                values: valuesArray,
            } = datumGroup;

            valuesArray.forEach((values, valueIdx) => {
                datumIdx++;

                const seriesDatum = datumArray[valueIdx];
                const yRawDatum = values[yRawIndex];
                const yStart = values[yStartIndex];
                const yEnd = values[yEndIndex];
                const yPreviousStart = values[yPreviousStartIndex];
                const yPreviousEnd = values[yPreviousEndIndex];
                const yCumulative = values[yCumulativeIndex];

                const validPoint = yRawDatum != null;

                // marker data
                const point = createMarkerCoordinate(xDatum, +yCumulative, yRawDatum);

                if (validPoint && marker) {
                    markerSelectionData.push({
                        index: datumIdx,
                        series: this,
                        itemId: yKey,
                        datum: seriesDatum,
                        nodeMidPoint: { x: point.x, y: point.y },
                        cumulativeValue: yEnd,
                        yValue: yRawDatum,
                        xValue: xDatum,
                        yKey,
                        xKey,
                        point,
                        fill,
                        stroke,
                    });
                }

                // label data
                if (validPoint && label) {
                    let labelText;
                    if (label.formatter) {
                        labelText = callbackCache.call(label.formatter, { value: yRawDatum, seriesId }) ?? '';
                    } else {
                        labelText = isNumber(yRawDatum) ? Number(yRawDatum).toFixed(2) : String(yRawDatum);
                    }

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
                const windowX = [lastXDatum, xDatum];
                const windowYStart = [yPreviousStart, yStart];
                const windowYEnd = [yPreviousEnd, yEnd];

                if (windowX.some((v) => v == undefined)) {
                    lastXDatum = xDatum;
                    return;
                }
                if (windowYStart.some((v) => v == undefined)) {
                    windowYStart[0] = 0;
                    windowYStart[1] = 0;
                }
                if (windowYEnd.some((v) => v == undefined)) {
                    windowYEnd[0] = 0;
                    windowYEnd[1] = 0;
                }

                const prevCoordinates = createPathCoordinates(lastXDatum, +windowYStart[0], +windowYEnd[0]!);
                fillPoints.push(prevCoordinates[0]);
                fillPhantomPoints.push(prevCoordinates[1]);

                const nextCoordinates = createPathCoordinates(xDatum, +windowYStart[1], +windowYEnd[1]!);
                fillPoints.push(nextCoordinates[0]);
                fillPhantomPoints.push(nextCoordinates[1]);

                // stroke data
                strokePoints.push({ x: NaN, y: NaN }); // moveTo
                yValues.push(undefined);

                if (yPreviousEnd != null) {
                    strokePoints.push(prevCoordinates[0]);
                    yValues.push(yPreviousEnd);
                }

                if (yEnd != undefined) {
                    strokePoints.push(nextCoordinates[0]);
                    yValues.push(yEnd);
                }

                lastXDatum = xDatum;
            });
        });

        for (let i = fillPhantomPoints.length - 1; i >= 0; i--) {
            fillPoints.push(fillPhantomPoints[i]);
        }

        return [context];
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
            fill: seriesFill,
            stroke: seriesStroke,
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
            visible,
            ctx: { callbackCache },
        } = this;

        const { size, formatter } = marker;
        const markerStrokeWidth = marker.strokeWidth ?? this.strokeWidth;

        const customMarker = typeof marker.shape === 'function';

        markerSelection.each((node, datum) => {
            const fill =
                isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill ?? seriesFill;
            const fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
            const stroke =
                isDatumHighlighted && highlightedStroke !== undefined
                    ? highlightedStroke
                    : marker.stroke ?? seriesStroke;
            const strokeWidth =
                isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : markerStrokeWidth;

            let format: AgCartesianSeriesMarkerFormat | undefined = undefined;
            if (formatter) {
                format = callbackCache.call(formatter, {
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
            node.visible = node.size > 0 && visible && !isNaN(datum.point.x) && !isNaN(datum.point.y);

            if (!customMarker || node.dirtyPath) {
                return;
            }

            // Only for custom marker shapes
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
        const {
            xKey,
            id: seriesId,
            axes,
            xName,
            yName,
            fill: seriesFill,
            stroke: seriesStroke,
            tooltip,
            marker,
            dataModel,
        } = this;
        const { yKey, xValue, yValue, datum } = nodeDatum;

        const xAxis = axes[ChartAxisDirection.X];
        const yAxis = axes[ChartAxisDirection.Y];

        if (!(xKey && yKey) || !(xAxis && yAxis && isNumber(yValue)) || !dataModel) {
            return '';
        }
        const yRawIndex = dataModel.resolveProcessedDataIndexById(this, `yValue-raw`).index;

        const {
            size,
            formatter: markerFormatter,
            strokeWidth: markerStrokeWidth,
            fill: markerFill,
            stroke: markerStroke,
        } = marker;

        const xString = xAxis.formatDatum(xValue);
        const yString = yAxis.formatDatum(yValue);
        const processedYValue = this.processedData?.data[nodeDatum.index]?.values[0][yRawIndex];
        const title = sanitizeHtml(yName);
        const content = sanitizeHtml(xString + ': ' + yString);

        const strokeWidth = markerStrokeWidth ?? this.strokeWidth;
        const fill = markerFill ?? seriesFill;
        const stroke = markerStroke ?? seriesStroke;

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

    getLegendData(): CategoryLegendDatum[] {
        const { data, id, xKey, yKey, yName, marker, fill, stroke, fillOpacity, strokeOpacity, visible } = this;

        if (!data?.length || !xKey || !yKey) {
            return [];
        }

        // Area stacks should be listed in the legend in reverse order, for symmetry with the
        // vertical stack display order.
        return [
            {
                legendType: 'category',
                id,
                itemId: yKey,
                seriesId: id,
                enabled: visible,
                label: {
                    text: yName ?? yKey,
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill ?? fill,
                    stroke: marker.stroke ?? stroke,
                    fillOpacity: marker.fillOpacity ?? fillOpacity,
                    strokeOpacity: marker.strokeOpacity ?? strokeOpacity,
                },
            },
        ];
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
        const {
            stroke: seriesStroke,
            fill: seriesFill,
            fillOpacity,
            lineDash,
            lineDashOffset,
            strokeOpacity,
            strokeWidth,
            shadow,
        } = this;

        contextData.forEach(({ fillSelectionData, strokeSelectionData, itemId }, seriesIdx) => {
            const [fill, stroke] = paths[seriesIdx];

            const duration = this.ctx.animationManager?.defaultOptions.duration ?? 1000;
            const markerDuration = 200;

            const animationOptions = {
                from: 0,
                to: seriesRect?.width ?? 0,
                duration,
            };

            // Stroke
            {
                const { points, yValues } = strokeSelectionData;

                stroke.tag = AreaSeriesTag.Stroke;
                stroke.fill = undefined;
                stroke.lineJoin = stroke.lineCap = 'round';
                stroke.pointerEvents = PointerEvents.None;

                stroke.stroke = seriesStroke;
                stroke.strokeWidth = this.getStrokeWidth(this.strokeWidth, { itemId });
                stroke.strokeOpacity = strokeOpacity;
                stroke.lineDash = lineDash;
                stroke.lineDashOffset = lineDashOffset;

                this.ctx.animationManager?.animate<number>(`${this.id}_empty-update-ready_stroke_${seriesIdx}`, {
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

                fill.fill = seriesFill;
                fill.fillOpacity = fillOpacity;
                fill.strokeOpacity = strokeOpacity;
                fill.strokeWidth = strokeWidth;
                fill.lineDash = lineDash;
                fill.lineDashOffset = lineDashOffset;
                fill.fillShadow = shadow;

                this.ctx.animationManager?.animate<number>(`${this.id}_empty-update-ready_fill_${seriesIdx}`, {
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

                this.ctx.animationManager?.animate<number>(`${this.id}_empty-update-ready_${marker.id}`, {
                    ...animationOptions,
                    to: format?.size ?? size,
                    delay,
                    duration: markerDuration,
                    onUpdate(size) {
                        marker.size = size;
                    },
                });
            });

            labelSelections[seriesIdx].each((label, datum) => {
                const delay = seriesRect?.width ? (datum.point.x / seriesRect.width) * duration : 0;
                this.ctx.animationManager?.animate(`${this.id}_empty-update-ready_${label.id}`, {
                    from: 0,
                    to: 1,
                    delay,
                    duration: markerDuration,
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
        const {
            stroke: seriesStroke,
            fill: seriesFill,
            fillOpacity,
            lineDash,
            lineDashOffset,
            strokeOpacity,
            strokeWidth,
            shadow,
        } = this;

        contextData.forEach(({ strokeSelectionData, fillSelectionData, itemId }, seriesIdx) => {
            const [fill, stroke] = paths[seriesIdx];

            // Stroke
            stroke.stroke = seriesStroke;
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

            fill.fill = seriesFill;
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
        const {
            marker,
            fill: seriesFill,
            stroke: seriesStroke,
            xKey = '',
            id: seriesId,
            ctx: { callbackCache },
        } = this;
        const { size, formatter } = marker;

        const fill = marker.fill ?? seriesFill;
        const stroke = marker.stroke ?? seriesStroke;
        const strokeWidth = marker.strokeWidth ?? this.strokeWidth;

        let format: AgCartesianSeriesMarkerFormat | undefined = undefined;
        if (formatter) {
            format = callbackCache.call(formatter, {
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
