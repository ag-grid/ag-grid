import type { Path } from '../../../scene/shape/path';
import { ContinuousScale } from '../../../scale/continuousScale';
import type { Selection } from '../../../scene/selection';
import type { SeriesNodeDatum, SeriesNodeDataContext } from '../series';
import { SeriesTooltip, SeriesNodePickMode, valueProperty, keyProperty } from '../series';
import { extent } from '../../../util/array';
import { PointerEvents } from '../../../scene/node';
import type { Path2D } from '../../../scene/path2d';
import type { Text } from '../../../scene/shape/text';
import type { ChartLegendDatum, CategoryLegendDatum } from '../../legendDatum';
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
import { interpolate } from '../../../util/string';
import { Label } from '../../label';
import { sanitizeHtml } from '../../../util/sanitize';
import type { Marker } from '../../marker/marker';
import { NUMBER, OPT_FUNCTION, OPT_LINE_DASH, OPT_STRING, OPT_COLOR_STRING, Validate } from '../../../util/validation';
import type {
    AgCartesianSeriesLabelFormatterParams,
    AgCartesianSeriesTooltipRendererParams,
    AgTooltipRendererResult,
    FontStyle,
    FontWeight,
    AgCartesianSeriesMarkerFormat,
} from '../../agChartOptions';
import type { UngroupedDataItem } from '../../data/dataModel';
import { diff } from '../../data/processors';
import type { ModuleContext } from '../../../util/moduleContext';
import type { DataController } from '../../data/dataController';

interface LineNodeDatum extends CartesianSeriesNodeDatum {
    readonly point: SeriesNodeDatum['point'] & {
        readonly moveTo: boolean;
    };
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

class LineSeriesLabel extends Label {
    @Validate(OPT_FUNCTION)
    formatter?: (params: AgCartesianSeriesLabelFormatterParams) => string = undefined;
}

class LineSeriesTooltip extends SeriesTooltip {
    @Validate(OPT_FUNCTION)
    renderer?: (params: AgCartesianSeriesTooltipRendererParams) => string | AgTooltipRendererResult = undefined;
    @Validate(OPT_STRING)
    format?: string = undefined;
}

type LineContext = SeriesNodeDataContext<LineNodeDatum>;
export class LineSeries extends CartesianSeries<LineContext> {
    static className = 'LineSeries';
    static type = 'line' as const;

    readonly marker = new CartesianSeriesMarker();

    readonly label = new LineSeriesLabel();

    @Validate(OPT_STRING)
    title?: string = undefined;

    @Validate(OPT_COLOR_STRING)
    stroke?: string = '#874349';

    @Validate(OPT_LINE_DASH)
    lineDash?: number[] = [0];

    @Validate(NUMBER(0))
    lineDashOffset: number = 0;

    @Validate(NUMBER(0))
    strokeWidth: number = 2;

    @Validate(NUMBER(0, 1))
    strokeOpacity: number = 1;

    tooltip: LineSeriesTooltip = new LineSeriesTooltip();

    constructor(moduleCtx: ModuleContext) {
        super({
            moduleCtx,
            hasMarkers: true,
            pickModes: [
                SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST,
                SeriesNodePickMode.NEAREST_NODE,
                SeriesNodePickMode.EXACT_SHAPE_MATCH,
            ],
        });

        const { marker, label } = this;

        marker.fill = '#c16068';
        marker.stroke = '#874349';

        label.enabled = false;
    }

    @Validate(OPT_STRING)
    xKey?: string = undefined;

    @Validate(OPT_STRING)
    xName?: string = undefined;

    @Validate(OPT_STRING)
    yKey?: string = undefined;

    @Validate(OPT_STRING)
    yName?: string = undefined;

    async processData(dataController: DataController) {
        const { axes, xKey = '', yKey = '' } = this;
        const data = xKey && yKey && this.data ? this.data : [];

        const xAxis = axes[ChartAxisDirection.X];
        const yAxis = axes[ChartAxisDirection.Y];
        const isContinuousX = xAxis?.scale instanceof ContinuousScale;
        const isContinuousY = yAxis?.scale instanceof ContinuousScale;

        const props: any[] = [
            keyProperty(this, xKey, isContinuousX, { id: 'xKey2' }),
            valueProperty(this, xKey, isContinuousX, { id: 'xValue' }),
            valueProperty(this, yKey, isContinuousY, { id: 'yValue', invalidValue: undefined }),
        ];

        if (!this.ctx.animationManager?.skipAnimations && this.processedData) {
            props.push(diff(this.processedData));
        }

        const { dataModel, processedData } = await dataController.request<any>(this.id, data ?? [], {
            props,
            dataVisible: this.visible,
        });
        this.dataModel = dataModel;
        this.processedData = processedData;

        this.animationState.transition('updateData');
    }

    getDomain(direction: ChartAxisDirection): any[] {
        const { axes, dataModel, processedData } = this;
        if (!processedData || !dataModel) return [];

        const xAxis = axes[ChartAxisDirection.X];
        const yAxis = axes[ChartAxisDirection.Y];

        const xDef = dataModel.resolveProcessedDataDefById(this, `xValue`);
        if (direction === ChartAxisDirection.X) {
            const domain = dataModel.getDomain(this, `xValue`, 'value', processedData);
            if (xDef?.def.type === 'value' && xDef.def.valueType === 'category') {
                return domain;
            }

            return this.fixNumericExtent(extent(domain), xAxis);
        } else {
            const domain = dataModel.getDomain(this, `yValue`, 'value', processedData);
            return this.fixNumericExtent(domain as any, yAxis);
        }
    }

    async createNodeData() {
        const {
            processedData,
            dataModel,
            axes,
            marker: { enabled: markerEnabled, size: markerSize, strokeWidth },
            ctx: { callbackCache },
        } = this;

        const xAxis = axes[ChartAxisDirection.X];
        const yAxis = axes[ChartAxisDirection.Y];

        if (!processedData || !dataModel || !xAxis || !yAxis) {
            return [];
        }

        const { label, yKey = '', xKey = '', id: seriesId } = this;
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const xOffset = (xScale.bandwidth ?? 0) / 2;
        const yOffset = (yScale.bandwidth ?? 0) / 2;
        const nodeData: LineNodeDatum[] = new Array(processedData.data.length);
        const size = markerEnabled ? markerSize : 0;

        const xIdx = dataModel.resolveProcessedDataIndexById(this, `xValue`).index;
        const yIdx = dataModel.resolveProcessedDataIndexById(this, `yValue`).index;

        let moveTo = true;
        let prevXInRange: undefined | -1 | 0 | 1 = undefined;
        let nextPoint: UngroupedDataItem<any, any> | undefined = undefined;
        let actualLength = 0;
        for (let i = 0; i < processedData.data.length; i++) {
            const { datum, values } = nextPoint ?? processedData.data[i];
            const xDatum = values[xIdx];
            const yDatum = values[yIdx];

            if (yDatum === undefined) {
                prevXInRange = undefined;
                moveTo = true;
            } else {
                const x = xScale.convert(xDatum) + xOffset;
                if (isNaN(x)) {
                    prevXInRange = undefined;
                    moveTo = true;
                    nextPoint = undefined;
                    continue;
                }
                const tolerance = (xScale.bandwidth ?? markerSize * 0.5 + (strokeWidth ?? 0)) + 1;

                nextPoint =
                    processedData.data[i + 1]?.values[yIdx] === undefined ? undefined : processedData.data[i + 1];
                const nextXDatum = processedData.data[i + 1]?.values[xIdx];
                const xInRange = xAxis.inRangeEx(x, 0, tolerance);
                const nextXInRange = nextPoint && xAxis.inRangeEx(xScale.convert(nextXDatum) + xOffset, 0, tolerance);
                if (xInRange === -1 && nextXInRange === -1) {
                    moveTo = true;
                    continue;
                }
                if (xInRange === 1 && prevXInRange === 1) {
                    moveTo = true;
                    continue;
                }
                prevXInRange = xInRange;

                const y = yScale.convert(yDatum) + yOffset;

                let labelText;
                if (label.formatter) {
                    labelText = callbackCache.call(label.formatter, { value: yDatum, seriesId });
                }

                if (labelText !== undefined) {
                    // Label retrieved from formatter successfully.
                } else if (typeof yDatum === 'number' && isFinite(yDatum)) {
                    labelText = yDatum.toFixed(2);
                } else if (yDatum) {
                    labelText = String(yDatum);
                }
                nodeData[actualLength++] = {
                    series: this,
                    datum,
                    yKey,
                    xKey,
                    point: { x, y, moveTo, size },
                    nodeMidPoint: { x, y },
                    yValue: yDatum,
                    xValue: xDatum,
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
                };
                moveTo = false;
            }
        }
        nodeData.length = actualLength;

        return [{ itemId: yKey, nodeData, labelData: nodeData }];
    }

    protected isPathOrSelectionDirty(): boolean {
        return this.marker.isDirty();
    }

    protected markerFactory() {
        const { shape } = this.marker;
        const MarkerShape = getMarker(shape);
        return new MarkerShape();
    }

    markerSelectionGarbageCollection = false;

    protected async updateMarkerSelection(opts: {
        nodeData: LineNodeDatum[];
        markerSelection: Selection<Marker, LineNodeDatum>;
    }) {
        let { nodeData } = opts;
        const { markerSelection } = opts;
        const { shape, enabled } = this.marker;
        nodeData = shape && enabled ? nodeData : [];

        if (this.marker.isDirty()) {
            markerSelection.clear();
        }

        return markerSelection.update(nodeData, undefined, (datum) => datum.xValue);
        // return markerSelection.update(nodeData);
    }

    protected async updateMarkerNodes(opts: {
        markerSelection: Selection<Marker, LineNodeDatum>;
        isHighlight: boolean;
    }) {
        const { markerSelection, isHighlight: isDatumHighlighted } = opts;
        const {
            marker,
            marker: { fillOpacity: markerFillOpacity },
            xKey = '',
            yKey = '',
            stroke: lineStroke,
            strokeOpacity,
            highlightStyle: {
                item: {
                    fill: highlightedFill,
                    fillOpacity: highlightFillOpacity = markerFillOpacity,
                    stroke: highlightedStroke,
                    strokeWidth: highlightedDatumStrokeWidth,
                },
            },
            id: seriesId,
            ctx: { callbackCache },
        } = this;
        const { size, formatter } = marker;
        const markerStrokeWidth = marker.strokeWidth ?? this.strokeWidth;

        const customMarker = typeof marker.shape === 'function';

        markerSelection.each((node, datum) => {
            const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill;
            const fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
            const stroke =
                isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : marker.stroke ?? lineStroke;
            const strokeWidth =
                isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : markerStrokeWidth;

            let format: AgCartesianSeriesMarkerFormat | undefined = undefined;
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

            node.fill = format?.fill ?? fill;
            node.stroke = format?.stroke ?? stroke;
            node.strokeWidth = format?.strokeWidth ?? strokeWidth;
            node.fillOpacity = fillOpacity ?? 1;
            node.strokeOpacity = marker.strokeOpacity ?? strokeOpacity ?? 1;
            node.size = format?.size ?? size;

            node.translationX = datum.point.x;
            node.translationY = datum.point.y;
            node.visible = node.size > 0 && !isNaN(datum.point.x) && !isNaN(datum.point.y);

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
        labelData: LineNodeDatum[];
        labelSelection: Selection<Text, LineNodeDatum>;
    }) {
        let { labelData } = opts;
        const { labelSelection } = opts;
        const { shape, enabled } = this.marker;
        labelData = shape && enabled ? labelData : [];

        return labelSelection.update(labelData);
    }

    protected async updateLabelNodes(opts: { labelSelection: Selection<Text, LineNodeDatum> }) {
        const { labelSelection } = opts;
        const { enabled: labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color } = this.label;

        labelSelection.each((text, datum) => {
            const { point, label } = datum;

            if (datum && label && labelEnabled) {
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

    protected getNodeClickEvent(event: MouseEvent, datum: LineNodeDatum): CartesianSeriesNodeClickEvent<any> {
        return new CartesianSeriesNodeClickEvent(this.xKey ?? '', this.yKey ?? '', event, datum, this);
    }

    protected getNodeDoubleClickEvent(
        event: MouseEvent,
        datum: LineNodeDatum
    ): CartesianSeriesNodeDoubleClickEvent<any> {
        return new CartesianSeriesNodeDoubleClickEvent(this.xKey ?? '', this.yKey ?? '', event, datum, this);
    }

    getTooltipHtml(nodeDatum: LineNodeDatum): string {
        const { xKey, yKey, axes } = this;

        const xAxis = axes[ChartAxisDirection.X];
        const yAxis = axes[ChartAxisDirection.Y];

        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }

        const { xName, yName, tooltip, marker, id: seriesId } = this;
        const { renderer: tooltipRenderer, format: tooltipFormat } = tooltip;
        const { datum, xValue, yValue } = nodeDatum;
        const xString = xAxis.formatDatum(xValue);
        const yString = yAxis.formatDatum(yValue);
        const title = sanitizeHtml(this.title ?? yName);
        const content = sanitizeHtml(xString + ': ' + yString);

        const { formatter: markerFormatter, fill, stroke, strokeWidth: markerStrokeWidth, size } = marker;
        const strokeWidth = markerStrokeWidth ?? this.strokeWidth;

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

        if (tooltipFormat || tooltipRenderer) {
            const params = {
                datum,
                xKey,
                xValue,
                xName,
                yKey,
                yValue,
                yName,
                title,
                color,
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
        const { id, data, xKey, yKey, yName, visible, title, marker, stroke, strokeOpacity } = this;

        if (!(data?.length && xKey && yKey)) {
            return [];
        }

        const legendData: CategoryLegendDatum[] = [
            {
                legendType: 'category',
                id: id,
                itemId: yKey,
                seriesId: id,
                enabled: visible,
                label: {
                    text: title ?? yName ?? yKey,
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill ?? 'rgba(0, 0, 0, 0)',
                    stroke: marker.stroke ?? stroke ?? 'rgba(0, 0, 0, 0)',
                    fillOpacity: marker.fillOpacity ?? 1,
                    strokeOpacity: marker.strokeOpacity ?? strokeOpacity ?? 1,
                },
            },
        ];
        return legendData;
    }

    animateEmptyUpdateReady({
        markerSelections,
        labelSelections,
        contextData,
        paths,
    }: {
        markerSelections: Array<Selection<Marker, LineNodeDatum>>;
        labelSelections: Array<Selection<Text, LineNodeDatum>>;
        contextData: Array<LineContext>;
        paths: Array<Array<Path>>;
    }) {
        contextData.forEach(({ nodeData }, contextDataIndex) => {
            const [lineNode] = paths[contextDataIndex];

            const { path: linePath } = lineNode;

            const nodeLengths: Array<number> = [0];
            const lineLength = nodeData.reduce((sum, datum, index) => {
                if (index === 0) return sum;
                const prev = nodeData[index - 1];
                if (isNaN(datum.point.x) || isNaN(datum.point.y) || isNaN(prev.point.x) || isNaN(prev.point.y)) {
                    nodeLengths.push(sum);
                    return sum;
                }
                const length = Math.sqrt(
                    Math.pow(datum.point.x - prev.point.x, 2) + Math.pow(datum.point.y - prev.point.y, 2)
                );
                nodeLengths.push(sum + length);
                return sum + length;
            }, 0);

            lineNode.fill = undefined;
            lineNode.lineJoin = 'round';
            lineNode.pointerEvents = PointerEvents.None;

            lineNode.stroke = this.stroke;
            lineNode.strokeWidth = this.getStrokeWidth(this.strokeWidth);
            lineNode.strokeOpacity = this.strokeOpacity;

            lineNode.lineDash = this.lineDash;
            lineNode.lineDashOffset = this.lineDashOffset;

            const duration = this.ctx.animationManager?.defaultOptions.duration ?? 1000;
            const markerDuration = 200;

            const animationOptions = {
                from: 0,
                to: lineLength,
            };

            this.ctx.animationManager?.animate<number>(`${this.id}_empty-update-ready`, {
                ...animationOptions,
                duration,
                onUpdate(length) {
                    linePath.clear({ trackChanges: true });

                    nodeData.forEach((datum, index) => {
                        if (nodeLengths[index] <= length) {
                            // Draw/move the full segment if past the end of this segment
                            if (datum.point.moveTo) {
                                linePath.moveTo(datum.point.x, datum.point.y);
                            } else {
                                linePath.lineTo(datum.point.x, datum.point.y);
                            }
                        } else if (index > 0 && nodeLengths[index - 1] < length) {
                            // Draw/move partial line if in between the start and end of this segment
                            const start = nodeData[index - 1].point;
                            const end = datum.point;

                            const segmentLength = nodeLengths[index] - nodeLengths[index - 1];
                            const remainingLength = nodeLengths[index] - length;
                            const ratio = (segmentLength - remainingLength) / segmentLength;

                            const x = (1 - ratio) * start.x + ratio * end.x;
                            const y = (1 - ratio) * start.y + ratio * end.y;

                            if (datum.point.moveTo) {
                                linePath.moveTo(x, y);
                            } else {
                                linePath.lineTo(x, y);
                            }
                        }
                    });

                    lineNode.checkPathDirty();
                },
            });

            markerSelections[contextDataIndex].each((marker, datum, index) => {
                const delay = lineLength > 0 ? (nodeLengths[index] / lineLength) * duration : 0;
                const format = this.animateMarkerFormatter(datum);
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

            labelSelections[contextDataIndex].each((label, _, index) => {
                const delay = (nodeLengths[index] / lineLength) * duration;
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

    animateReadyUpdate(data: {
        markerSelections: Array<Selection<Marker, LineNodeDatum>>;
        contextData: Array<LineContext>;
        paths: Array<Array<Path>>;
    }) {
        this.resetMarkersAndPaths(data);
    }

    animateReadyResize(data: {
        markerSelections: Array<Selection<Marker, LineNodeDatum>>;
        contextData: Array<LineContext>;
        paths: Array<Array<Path>>;
    }) {
        this.ctx.animationManager?.reset();
        this.resetMarkersAndPaths(data);
    }

    animateWaitingUpdateReady({
        markerSelections,
        contextData,
        paths,
    }: {
        markerSelections: Array<Selection<Marker, LineNodeDatum>>;
        contextData: Array<LineContext>;
        paths: Array<Array<Path>>;
    }) {
        const { processedData } = this;
        const diff = processedData?.reduced?.diff;

        if (!diff?.changed) {
            this.resetMarkersAndPaths({ markerSelections, contextData, paths });
            return;
        }

        const zipObject = (props: Array<any>, value = true) => {
            const zipped: { [key: string]: boolean } = {};
            props.forEach((prop: any) => {
                zipped[`${prop}`] = value;
            });
            return zipped;
        };

        console.log({ markerSelections, contextData });

        contextData.forEach(({ nodeData }, contextDataIndex) => {
            const [lineNode] = paths[contextDataIndex];
            const { path: linePath } = lineNode;

            const markerNodesList = markerSelections[contextDataIndex].nodes();
            const markerNodes: { [keyof: string]: Marker } = {};
            markerSelections[contextDataIndex].each((marker, datum) => {
                markerNodes[`${datum.xValue}`] = marker;
            });

            const addedIds = zipObject(diff.added);
            const addedIndices = zipObject(diff.addedIndices);
            const removedIndices = zipObject(diff.removedIndices);

            // Find the first and last nodes that already existed and were not just added, removed nodes will not
            // appear in `nodeData` so do not need to be checked
            let firstExistingIndex = -1;
            let lastExistingIndex = Infinity;

            for (let i = 0; i < nodeData.length; i++) {
                if (!addedIds[`${nodeData[i].xValue}`]) {
                    firstExistingIndex = i;
                    break;
                }
            }

            for (let i = nodeData.length - 1; i >= 0; i--) {
                if (!addedIds[`${nodeData[i].xValue}`]) {
                    lastExistingIndex = i;
                    break;
                }
            }

            const duration = this.ctx.animationManager?.defaultOptions.duration ?? 1000;

            // Find the points on the path before the changes, which points were removed and create a map of the new to
            // old indices of points that continue to exist
            const pathPoints = linePath.getPoints();
            const removedPoints: Array<{ x: number; y: number }> = [];
            const removedMarkers: Array<Marker> = [];
            const existingPointsPathMap: Map<number, number> = new Map();

            let j = 0;
            for (let i = 0; i < pathPoints.length; i++) {
                const point = pathPoints[i];
                if (removedIndices[`${i}`]) {
                    removedPoints.push(point);
                    removedMarkers.push(markerSelections[contextDataIndex].nodes()[i]);
                } else if (!addedIndices[`${j}`]) {
                    existingPointsPathMap.set(j++, i);
                }
            }

            j = 0;
            for (let i = 0; i < nodeData.length; i++) {
                if (!removedIndices[`${j}`] && !addedIndices[`${i}`]) {
                    existingPointsPathMap.set(i, j++);
                }
            }

            // Create the animation for all nodes at the same time to ensure the line is drawn between nodes correctly
            this.ctx.animationManager?.animate<number>(`${this.id}_waiting-update-ready`, {
                from: 0,
                to: duration,
                duration,
                onUpdate: (time) => {
                    linePath.clear({ trackChanges: true });

                    const ratio = time / duration;

                    // const existingIndex = existingPointsPathMap.get(0);
                    // const pathPoint = existingIndex != null ? pathPoints[existingIndex] : undefined;

                    // const removedBefore = [];
                    //     const removedBeforeMarkers = [];

                    //     for (let i = 0; i < removedPoints.length; i++) {
                    //         const removed = removedPoints[i];
                    //         if (pathPoint && removed.x < pathPoint.x) {
                    //             removedBefore.push(removed);
                    //         }
                    //     }

                    nodeData.forEach((datum, index) => {
                        const { point } = datum;
                        const datumId = `${datum.xValue}`;
                        const prevPoint = index > 0 ? nodeData[index - 1].point : undefined;

                        const existingIndex = existingPointsPathMap.get(index);
                        const prevExistingIndex = existingPointsPathMap.get(index - 1);

                        const pathPoint = existingIndex != null ? pathPoints[existingIndex] : undefined;
                        const prevPathPoint = prevExistingIndex != null ? pathPoints[prevExistingIndex] : undefined;

                        const marker = markerNodes[datum.xValue];
                        let markerX = point.x;
                        let markerY = point.y;

                        const markerFormat = this.animateMarkerFormatter(marker.datum);
                        let markerSize = markerFormat?.size ?? datum.point?.size ?? 0;

                        // Bucket the removed nodes into before, between and after existing nodes
                        const removedBefore = [];
                        const removedBeforeMarkers = [];
                        const removedBetween = [];
                        const removedAfter = [];

                        for (let i = 0; i < removedPoints.length; i++) {
                            const removed = removedPoints[i];
                            const removedMarker = removedMarkers[i];

                            if (index === 0 && pathPoint && removed.x < pathPoint.x) {
                                removedBefore.push(removed);
                            }

                            if (index === 0 && pathPoint && removedMarker && removedMarker.x < pathPoint.x) {
                                removedBeforeMarkers.push(removedMarker);
                            }

                            if (
                                index > 0 &&
                                prevPathPoint &&
                                pathPoint &&
                                removed.x > prevPathPoint.x &&
                                removed.x < pathPoint.x
                            ) {
                                removedBetween.push(removed);
                            }

                            if (index === nodeData.length - 1 && pathPoint && removed.x > pathPoint.x) {
                                removedAfter.push(removed);
                            }
                        }

                        // Animate out nodes that were removed before the first node
                        for (let i = 0; i < removedBefore.length; i++) {
                            const removed = removedBefore[i];

                            // Scale from the removed point to the first node's point by the ratio of the duration
                            const x = removed.x + ratio * (point.x - removed.x);
                            const y = removed.y + ratio * (point.y - removed.y);

                            linePath.lineTo(x, y);
                        }

                        for (let i = 0; i < removedBeforeMarkers.length; i++) {
                            const removed = removedBeforeMarkers[i];

                            const x = removed.x + ratio * (point.x - removed.x);
                            const y = removed.y + ratio * (point.y - removed.y);

                            removed.size = (1 - ratio) * markerSize;
                            removed.translationX = x;
                            removed.translationY = y;
                        }

                        // Animate out nodes that were removed between two other nodes
                        if (prevPoint) {
                            for (let i = 0; i < removedBetween.length; i++) {
                                const removed = removedBetween[i];

                                // Find the line between prev and point and the intersection at the fraction along that
                                // line given the number of points removed
                                const fraction = (i + 1) / (removedBetween.length + 1);
                                let x = prevPoint.x + (point.x - prevPoint.x) * fraction;
                                let y =
                                    prevPoint.y +
                                    (x - prevPoint.x) * ((point.y - prevPoint.y) / (point.x - prevPoint.x));

                                // Scale this intersection by the ratio of duration
                                x = removed.x + ratio * (x - removed.x);
                                y = removed.y + ratio * (y - removed.y);

                                linePath.lineTo(x, y);
                            }
                        }

                        if (addedIds[datumId] && index > lastExistingIndex) {
                            // Animate in nodes that were added after the last existing node
                            const startPoint = nodeData[lastExistingIndex].point;
                            const startExistingIndex = existingPointsPathMap.get(lastExistingIndex);
                            const start = startExistingIndex != null ? pathPoints[startExistingIndex] : startPoint;

                            const x = (markerX = start.x + ratio * (point.x - start.x));
                            const y = (markerY = start.y + ratio * (point.y - start.y));

                            this.extendLine(linePath, { x, y, moveTo: point.moveTo });
                        } else if (addedIds[datumId] && index < firstExistingIndex) {
                            // Animate in nodes that were added before the first existing node
                            const startPoint = nodeData[firstExistingIndex].point;
                            const startExistingIndex = existingPointsPathMap.get(firstExistingIndex);
                            const start = startExistingIndex != null ? pathPoints[startExistingIndex] : startPoint;

                            const x = (markerX = start.x + ratio * (point.x - start.x));
                            const y = (markerY = start.y + ratio * (point.y - start.y));

                            markerSize *= ratio;
                            this.extendLine(linePath, { x, y, moveTo: point.moveTo });
                        } else if (addedIds[datumId]) {
                            // Animate in nodes that were added between other nodes

                            // Find the line between the nodes that existed either side of this group of added nodes
                            // and the intersection at the fraction along that line given the number of points added
                            let startPoint = point;
                            let endPoint = point;
                            let startIndex = index;
                            let endIndex = index;
                            let addedBetweenCount = 1;

                            for (let i = index - 1; i > 0; i--) {
                                if (!addedIds[`${nodeData[i].xValue}`]) {
                                    startPoint = nodeData[i].point;
                                    startIndex = i;
                                    break;
                                }

                                addedBetweenCount++;
                            }

                            for (let i = index + 1; i < nodeData.length; i++) {
                                if (!addedIds[`${nodeData[i].xValue}`]) {
                                    endPoint = nodeData[i].point;
                                    endIndex = i;
                                    break;
                                }

                                addedBetweenCount++;
                            }

                            const startExistingIndex = existingPointsPathMap.get(startIndex);
                            const endExistingIndex = existingPointsPathMap.get(endIndex);
                            const start = startExistingIndex != null ? pathPoints[startExistingIndex] : startPoint;
                            const end = endExistingIndex != null ? pathPoints[endExistingIndex] : endPoint;

                            const fraction = (index - startIndex) / (addedBetweenCount + 1);

                            let x = start.x + (end.x - start.x) * fraction;
                            let y = start.y + (x - start.x) * ((end.y - start.y) / (end.x - start.x));

                            // Scale this intersection by the ratio of duration
                            x = markerX = x + ratio * (point.x - x);
                            y = markerY = y + ratio * (point.y - y);

                            linePath.lineTo(x, y);
                            markerSize *= ratio;
                        } else if (pathPoint) {
                            // Translate nodes that existed at other coordinates

                            const x = (markerX = (1 - ratio) * pathPoint.x + ratio * point.x);
                            const y = (markerY = (1 - ratio) * pathPoint.y + ratio * point.y);

                            const hasRemovedAllPointsBefore = index === 0 && removedBefore.length > 0;

                            if (point.moveTo && !hasRemovedAllPointsBefore) {
                                linePath.moveTo(x, y);
                            } else {
                                linePath.lineTo(x, y);
                            }
                        } else {
                            // Catch any other nodes and immediately place them at their final position
                            this.extendLine(linePath, point);
                        }

                        // Animate out nodes that were removed after the last node
                        for (let i = 0; i < removedAfter.length; i++) {
                            const removed = removedAfter[i];

                            // Scale the position along the line between the point and removed coords by the ratio of the duration
                            const x = (markerX = removed.x + ratio * (point.x - removed.x));
                            const y = (markerY = removed.y + ratio * (point.y - removed.y));

                            linePath.lineTo(x, y);
                            markerSize *= 1 - ratio;
                        }

                        marker.translationX = markerX;
                        marker.translationY = markerY;
                        marker.size = markerSize;

                        // TODO: handle removing a point before a moveTo point in the middle
                    });

                    lineNode.checkPathDirty();
                },
                onComplete: () => {
                    markerSelections.forEach((markerSelection) => {
                        markerSelection.cleanup();
                    });
                    this.resetMarkersAndPaths({ markerSelections, contextData, paths });
                },
            });

            // markerSelections.forEach((markerSelection) => {
            //     markerSelection.each((marker, datum) => {
            //         const props = [{
            //             from:
            //         }]
            //         this.ctx.animationManager?.animateMany(`${this.id}_waiting-update-ready_${marker.id}`, props, {
            //             duration,
            //             onUpdate([]) {

            //             }
            //         })
            //     })
            // })
        });
    }

    resetMarkersAndPaths({
        markerSelections,
        contextData,
        paths,
    }: {
        markerSelections: Array<Selection<Marker, LineNodeDatum>>;
        contextData: Array<LineContext>;
        paths: Array<Array<Path>>;
    }) {
        contextData.forEach(({ nodeData }, contextDataIndex) => {
            const [lineNode] = paths[contextDataIndex];

            const { path: linePath } = lineNode;

            lineNode.stroke = this.stroke;
            lineNode.strokeWidth = this.getStrokeWidth(this.strokeWidth);
            lineNode.strokeOpacity = this.strokeOpacity;

            lineNode.lineDash = this.lineDash;
            lineNode.lineDashOffset = this.lineDashOffset;

            linePath.clear({ trackChanges: true });

            nodeData.forEach((datum) => {
                if (datum.point.moveTo) {
                    linePath.moveTo(datum.point.x, datum.point.y);
                } else {
                    linePath.lineTo(datum.point.x, datum.point.y);
                }
            });

            lineNode.checkPathDirty();

            markerSelections[contextDataIndex].each((marker, datum) => {
                const format = this.animateMarkerFormatter(datum);
                const size = datum.point?.size ?? 0;
                marker.size = format?.size ?? size;
            });
        });
    }

    private animateMarkerFormatter(datum: LineNodeDatum) {
        const {
            marker,
            xKey = '',
            yKey = '',
            stroke: lineStroke,
            id: seriesId,
            ctx: { callbackCache },
        } = this;
        const { size, formatter } = marker;

        const fill = marker.fill;
        const stroke = marker.stroke ?? lineStroke;
        const strokeWidth = marker.strokeWidth ?? this.strokeWidth;

        let format: AgCartesianSeriesMarkerFormat | undefined = undefined;
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

    private extendLine(linePath: Path2D, point: { x: number; y: number; moveTo: boolean }) {
        if (point.moveTo) {
            linePath.moveTo(point.x, point.y);
        } else {
            linePath.lineTo(point.x, point.y);
        }
    }

    protected isLabelEnabled() {
        return this.label.enabled;
    }
}
