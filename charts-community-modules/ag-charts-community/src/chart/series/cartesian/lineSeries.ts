import { Path } from '../../../scene/shape/path';
import { ContinuousScale } from '../../../scale/continuousScale';
import { Selection } from '../../../scene/selection';
import { SeriesNodeDatum, SeriesTooltip, SeriesNodeDataContext, SeriesNodePickMode, valueProperty } from '../series';
import { extent } from '../../../util/array';
import { BBox } from '../../../scene/bbox';
import { PointerEvents } from '../../../scene/node';
import { Text } from '../../../scene/shape/text';
import { ChartLegendDatum, CategoryLegendDatum } from '../../legendDatum';
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
import { interpolate } from '../../../util/string';
import { Label } from '../../label';
import { sanitizeHtml } from '../../../util/sanitize';
import { Marker } from '../../marker/marker';
import { NUMBER, OPT_FUNCTION, OPT_LINE_DASH, OPT_STRING, OPT_COLOR_STRING, Validate } from '../../../util/validation';
import {
    AgCartesianSeriesLabelFormatterParams,
    AgCartesianSeriesTooltipRendererParams,
    AgTooltipRendererResult,
    FontStyle,
    FontWeight,
    AgCartesianSeriesMarkerFormat,
} from '../../agChartOptions';
import { DataModel, UngroupedDataItem } from '../../data/dataModel';
import * as easing from '../../../motion/easing';

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

    constructor() {
        super({
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

    async processData() {
        const { xAxis, yAxis, xKey = '', yKey = '' } = this;
        const data = xKey && yKey && this.data ? this.data : [];

        const isContinuousX = xAxis?.scale instanceof ContinuousScale;
        const isContinuousY = yAxis?.scale instanceof ContinuousScale;

        this.dataModel = new DataModel<any>({
            props: [
                valueProperty(xKey, isContinuousX, { id: 'xValue' }),
                valueProperty(yKey, isContinuousY, { id: 'yValue', invalidValue: undefined }),
            ],
            dataVisible: this.visible,
        });
        this.processedData = this.dataModel.processData(data ?? []);
    }

    getDomain(direction: ChartAxisDirection): any[] {
        const { xAxis, yAxis, dataModel, processedData } = this;
        if (!processedData || !dataModel) return [];

        const xDef = dataModel.resolveProcessedDataDefById(`xValue`);
        if (direction === ChartAxisDirection.X) {
            const domain = dataModel.getDomain(`xValue`, processedData);
            if (xDef?.valueType === 'category') {
                return domain;
            }

            return this.fixNumericExtent(extent(domain), xAxis);
        } else {
            const domain = dataModel.getDomain(`yValue`, processedData);
            return this.fixNumericExtent(domain as any, yAxis);
        }
    }

    async createNodeData() {
        const {
            processedData,
            dataModel,
            xAxis,
            yAxis,
            marker: { enabled: markerEnabled, size: markerSize, strokeWidth },
        } = this;

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

        const xIdx = this.dataModel?.resolveProcessedDataIndexById(`xValue`)?.index ?? -1;
        const yIdx = this.dataModel?.resolveProcessedDataIndexById(`yValue`)?.index ?? -1;

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

                let labelText = '';
                if (label.formatter) {
                    labelText = label.formatter({ value: yDatum, seriesId });
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

        return markerSelection.update(nodeData);
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
                format = formatter({
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
        const { xKey, yKey, xAxis, yAxis } = this;

        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }

        const { xName, yName, tooltip, marker, id: seriesId } = this;
        const { renderer: tooltipRenderer, format: tooltipFormat } = tooltip;
        const datum = nodeDatum.datum;
        const xValue = datum[xKey];
        const yValue = datum[yKey];
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
        seriesRect,
    }: {
        markerSelections: Array<Selection<Marker, LineNodeDatum>>;
        labelSelections: Array<Selection<Text, LineNodeDatum>>;
        contextData: Array<LineContext>;
        paths: Array<Array<Path>>;
        seriesRect?: BBox;
    }) {
        contextData.forEach(({ nodeData }, contextDataIndex) => {
            const [lineNode] = paths[contextDataIndex];

            const { path: linePath } = lineNode;

            lineNode.fill = undefined;
            lineNode.lineJoin = 'round';
            lineNode.pointerEvents = PointerEvents.None;

            lineNode.stroke = this.stroke;
            lineNode.strokeWidth = this.getStrokeWidth(this.strokeWidth);
            lineNode.strokeOpacity = this.strokeOpacity;

            lineNode.lineDash = this.lineDash;
            lineNode.lineDashOffset = this.lineDashOffset;

            const duration = 1000;
            const lineDuration = duration * 0.8;
            const markerDuration = duration - lineDuration;

            const animationOptions = {
                from: 0,
                to: seriesRect?.width ?? 0,
                disableInteractions: true,
                ease: easing.linear,
                repeat: 0,
            };

            // Clone and sort the nodes by their x-values to ensure the line is drawn smoothly between each point
            const sortedNodes = [...nodeData];
            sortedNodes.sort((a, b) => {
                if (a.point.x === b.point.x) return 0;
                return a.point.x < b.point.x ? -1 : 1;
            });

            this.animationManager?.animate<number>(`${this.id}_empty-update-ready`, {
                ...animationOptions,
                duration: lineDuration,
                onUpdate(xValue) {
                    linePath.clear({ trackChanges: true });

                    sortedNodes.forEach((datum, index) => {
                        if (datum.point.x <= xValue) {
                            // Draw/move the full segment if past the end of this segment
                            if (datum.point.moveTo) {
                                linePath.moveTo(datum.point.x, datum.point.y);
                            } else {
                                linePath.lineTo(datum.point.x, datum.point.y);
                            }
                        } else if (index > 0 && sortedNodes[index - 1].point.x < xValue) {
                            // Draw/move partial line if in between the start and end of this segment
                            const start = sortedNodes[index - 1].point;
                            const end = datum.point;

                            const x = xValue;
                            const y = start.y + ((x - start.x) * (end.y - start.y)) / (end.x - start.x);

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

            markerSelections[contextDataIndex].each((marker, datum) => {
                const delay = seriesRect?.width ? (datum.point.x / seriesRect.width) * lineDuration : 0;
                const format = this.animateFormatter(datum);
                const size = datum.point?.size ?? 0;

                this.animationManager?.animate<number>(`${this.id}_empty-update-ready_${marker.id}`, {
                    ...animationOptions,
                    to: format?.size ?? size,
                    delay,
                    duration: markerDuration,
                    onUpdate(size) {
                        marker.size = size;
                    },
                });
            });

            labelSelections[contextDataIndex].each((label, datum) => {
                const delay = seriesRect?.width ? (datum.point.x / seriesRect.width) * lineDuration : 0;
                this.animationManager?.animate(`${this.id}_empty-update-ready_${label.id}`, {
                    from: 0,
                    to: 1,
                    delay,
                    duration: markerDuration,
                    ease: easing.linear,
                    repeat: 0,
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
        this.animationManager?.stop();
        this.resetMarkersAndPaths(data);
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
                const format = this.animateFormatter(datum);
                const size = datum.point?.size ?? 0;
                marker.size = format?.size ?? size;
            });
        });
    }

    private animateFormatter(datum: LineNodeDatum) {
        const { marker, xKey = '', yKey = '', stroke: lineStroke, id: seriesId } = this;
        const { size, formatter } = marker;

        const fill = marker.fill;
        const stroke = marker.stroke ?? lineStroke;
        const strokeWidth = marker.strokeWidth ?? this.strokeWidth;

        let format: AgCartesianSeriesMarkerFormat | undefined = undefined;
        if (formatter) {
            format = formatter({
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

    protected isLabelEnabled() {
        return this.label.enabled;
    }
}
