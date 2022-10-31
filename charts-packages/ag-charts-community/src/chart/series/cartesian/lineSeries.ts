import { Path } from '../../../scene/shape/path';
import { ContinuousScale } from '../../../scale/continuousScale';
import { Selection } from '../../../scene/selection';
import { Group } from '../../../scene/group';
import {
    SeriesNodeDatum,
    CartesianTooltipRendererParams,
    SeriesTooltip,
    SeriesNodeDataContext,
    SeriesNodePickMode,
} from '../series';
import { extent } from '../../../util/array';
import { PointerEvents } from '../../../scene/node';
import { Text, FontStyle, FontWeight } from '../../../scene/shape/text';
import { LegendDatum } from '../../legend';
import {
    CartesianSeries,
    CartesianSeriesMarker,
    CartesianSeriesMarkerFormat,
    CartesianSeriesNodeClickEvent,
} from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { getMarker } from '../../marker/util';
import { TooltipRendererResult, toTooltipHtml } from '../../tooltip/tooltip';
import { interpolate } from '../../../util/string';
import { Label } from '../../label';
import { sanitizeHtml } from '../../../util/sanitize';
import { checkDatum, isContinuous } from '../../../util/value';
import { Marker } from '../../marker/marker';
import {
    NUMBER,
    OPT_FUNCTION,
    OPT_LINE_DASH,
    OPT_STRING,
    OPT_COLOR_STRING,
    STRING,
    Validate,
} from '../../../util/validation';

interface LineNodeDatum extends SeriesNodeDatum {
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

export type LineTooltipRendererParams = CartesianTooltipRendererParams;

class LineSeriesLabel extends Label {
    @Validate(OPT_FUNCTION)
    formatter?: (params: { value: any }) => string = undefined;
}

export class LineSeriesTooltip extends SeriesTooltip {
    @Validate(OPT_FUNCTION)
    renderer?: (params: LineTooltipRendererParams) => string | TooltipRendererResult = undefined;
    @Validate(OPT_STRING)
    format?: string = undefined;
}

interface PointDatum {
    xDatum: any;
    yDatum: any;
    datum: any;
}

type LineContext = SeriesNodeDataContext<LineNodeDatum>;
export class LineSeries extends CartesianSeries<LineContext> {
    static className = 'LineSeries';
    static type = 'line' as const;

    private xDomain: any[] = [];
    private yDomain: any[] = [];
    private pointsData: PointDatum[] = [];

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
            pickGroupIncludes: ['markers'],
            features: ['markers'],
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

    setColors(fills: string[], strokes: string[]) {
        this.stroke = fills[0];
        this.marker.stroke = strokes[0];
        this.marker.fill = fills[0];
    }

    @Validate(STRING)
    protected _xKey: string = '';
    set xKey(value: string) {
        this._xKey = value;
        this.pointsData.splice(0);
    }
    get xKey(): string {
        return this._xKey;
    }

    @Validate(STRING)
    xName: string = '';

    @Validate(STRING)
    protected _yKey: string = '';
    set yKey(value: string) {
        this._yKey = value;
        this.pointsData.splice(0);
    }
    get yKey(): string {
        return this._yKey;
    }

    @Validate(STRING)
    yName: string = '';

    getDomain(direction: ChartAxisDirection): any[] {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        }
        return this.yDomain;
    }

    async processData() {
        const { xAxis, yAxis, xKey, yKey, pointsData } = this;
        const data = xKey && yKey && this.data ? this.data : [];

        if (!xAxis || !yAxis) {
            return;
        }

        const isContinuousX = xAxis.scale instanceof ContinuousScale;
        const isContinuousY = yAxis.scale instanceof ContinuousScale;

        const xData: any[] = [];
        const yData: any[] = [];
        pointsData.splice(0);

        for (const datum of data) {
            const x = datum[xKey];
            const y = datum[yKey];

            const xDatum = checkDatum(x, isContinuousX);

            if (isContinuousX && xDatum === undefined) {
                continue;
            }

            const yDatum = checkDatum(y, isContinuousY);
            xData.push(xDatum);
            yData.push(yDatum);
            pointsData.push({
                xDatum,
                yDatum,
                datum,
            });
        }

        this.xDomain = isContinuousX ? this.fixNumericExtent(extent(xData, isContinuous), xAxis) : xData;
        this.yDomain = isContinuousY ? this.fixNumericExtent(extent(yData, isContinuous), yAxis) : yData;
    }

    async createNodeData() {
        const {
            data,
            xAxis,
            yAxis,
            marker: { enabled: markerEnabled, size: markerSize, strokeWidth },
        } = this;

        if (!data || !xAxis || !yAxis) {
            return [];
        }

        const { pointsData, label, yKey } = this;
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;
        const nodeData: LineNodeDatum[] = new Array(data.length);
        const size = markerEnabled ? markerSize : 0;

        let moveTo = true;
        let prevXInRange: undefined | -1 | 0 | 1 = undefined;
        let nextPoint: PointDatum | undefined = undefined;
        let actualLength = 0;
        for (let i = 0; i < pointsData.length; i++) {
            const point = nextPoint || pointsData[i];

            if (point.yDatum === undefined) {
                prevXInRange = undefined;
                moveTo = true;
            } else {
                const { xDatum, yDatum, datum } = point;
                const x = xScale.convert(xDatum) + xOffset;
                if (isNaN(x)) {
                    prevXInRange = undefined;
                    moveTo = true;
                    continue;
                }
                const tolerance = (xScale.bandwidth || markerSize * 0.5 + (strokeWidth || 0)) + 1;

                nextPoint = pointsData[i + 1]?.yDatum === undefined ? undefined : pointsData[i + 1];
                const xInRange = xAxis.inRangeEx(x, 0, tolerance);
                const nextXInRange =
                    nextPoint && xAxis.inRangeEx(xScale.convert(nextPoint.xDatum) + xOffset, 0, tolerance);
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

                let labelText: string;

                if (label.formatter) {
                    labelText = label.formatter({ value: yDatum });
                } else {
                    labelText =
                        typeof yDatum === 'number' && isFinite(yDatum)
                            ? yDatum.toFixed(2)
                            : yDatum
                            ? String(yDatum)
                            : '';
                }

                nodeData[actualLength++] = {
                    series: this,
                    datum,
                    point: { x, y, moveTo, size },
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

    protected async updatePaths(opts: { seriesHighlighted?: boolean; contextData: LineContext; paths: Path[] }) {
        const {
            contextData: { nodeData },
            paths: [lineNode],
        } = opts;
        const { path: linePath } = lineNode;

        lineNode.fill = undefined;
        lineNode.lineJoin = 'round';
        lineNode.pointerEvents = PointerEvents.None;

        linePath.clear({ trackChanges: true });
        for (const data of nodeData) {
            if (data.point.moveTo) {
                linePath.moveTo(data.point.x, data.point.y);
            } else {
                linePath.lineTo(data.point.x, data.point.y);
            }
        }
        lineNode.checkPathDirty();
    }

    protected async updatePathNodes(opts: { seriesHighlighted?: boolean; paths: Path[] }) {
        const {
            paths: [lineNode],
        } = opts;

        lineNode.stroke = this.stroke;
        lineNode.strokeWidth = this.getStrokeWidth(this.strokeWidth);
        lineNode.strokeOpacity = this.strokeOpacity;

        lineNode.lineDash = this.lineDash;
        lineNode.lineDashOffset = this.lineDashOffset;
    }

    protected async updateMarkerSelection(opts: {
        nodeData: LineNodeDatum[];
        markerSelection: Selection<Marker, Group, LineNodeDatum, any>;
    }) {
        let { nodeData, markerSelection } = opts;
        const {
            marker: { shape, enabled },
        } = this;
        nodeData = shape && enabled ? nodeData : [];
        const MarkerShape = getMarker(shape);

        if (this.marker.isDirty()) {
            markerSelection = markerSelection.setData([]);
            markerSelection.exit.remove();
        }

        const updateMarkerSelection = markerSelection.setData(nodeData);
        updateMarkerSelection.exit.remove();
        const enterDatumSelection = updateMarkerSelection.enter.append(MarkerShape);
        return updateMarkerSelection.merge(enterDatumSelection);
    }

    protected async updateMarkerNodes(opts: {
        markerSelection: Selection<Marker, Group, LineNodeDatum, any>;
        isHighlight: boolean;
    }) {
        const { markerSelection, isHighlight: isDatumHighlighted } = opts;
        const {
            marker,
            marker: { fillOpacity: markerFillOpacity },
            xKey,
            yKey,
            stroke: lineStroke,
            strokeOpacity,
            highlightStyle: {
                fill: deprecatedFill,
                stroke: deprecatedStroke,
                strokeWidth: deprecatedStrokeWidth,
                item: {
                    fill: highlightedFill = deprecatedFill,
                    fillOpacity: highlightFillOpacity = markerFillOpacity,
                    stroke: highlightedStroke = deprecatedStroke,
                    strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth,
                },
            },
            id: seriesId,
        } = this;
        const { size, formatter } = marker;
        const markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : this.strokeWidth;

        markerSelection.each((node, datum) => {
            const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill;
            const fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
            const stroke =
                isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : marker.stroke || lineStroke;
            const strokeWidth =
                isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : markerStrokeWidth;

            let format: CartesianSeriesMarkerFormat | undefined = undefined;
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

            node.fill = (format && format.fill) || fill;
            node.stroke = (format && format.stroke) || stroke;
            node.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
            node.fillOpacity = fillOpacity ?? 1;
            node.strokeOpacity = marker.strokeOpacity ?? strokeOpacity ?? 1;
            node.size = format && format.size !== undefined ? format.size : size;

            node.translationX = datum.point.x;
            node.translationY = datum.point.y;
            node.visible = node.size > 0;
        });

        if (!isDatumHighlighted) {
            this.marker.markClean();
        }
    }

    protected async updateLabelSelection(opts: {
        labelData: LineNodeDatum[];
        labelSelection: Selection<Text, Group, LineNodeDatum, any>;
    }) {
        let { labelData, labelSelection } = opts;
        const {
            marker: { shape, enabled },
        } = this;
        labelData = shape && enabled ? labelData : [];

        const updateTextSelection = labelSelection.setData(labelData);
        updateTextSelection.exit.remove();
        const enterTextSelection = updateTextSelection.enter.append(Text);
        return updateTextSelection.merge(enterTextSelection);
    }

    protected async updateLabelNodes(opts: { labelSelection: Selection<Text, Group, LineNodeDatum, any> }) {
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
        return new CartesianSeriesNodeClickEvent(this.xKey, this.yKey, event, datum, this);
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
        const title = sanitizeHtml(this.title || yName);
        const content = sanitizeHtml(xString + ': ' + yString);

        const { formatter: markerFormatter, fill, stroke, strokeWidth: markerStrokeWidth, size } = marker;
        const strokeWidth = markerStrokeWidth !== undefined ? markerStrokeWidth : this.strokeWidth;

        let format: CartesianSeriesMarkerFormat | undefined = undefined;
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

        const color = (format && format.fill) || fill;

        const defaults: TooltipRendererResult = {
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

    getLegendData(): LegendDatum[] {
        const { id, data, xKey, yKey, yName, visible, title, marker, stroke, strokeOpacity } = this;

        if (!(data && data.length && xKey && yKey)) {
            return [];
        }
        return [
            {
                id: id,
                itemId: yKey,
                seriesId: id,
                enabled: visible,
                label: {
                    text: title || yName || yKey,
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill || 'rgba(0, 0, 0, 0)',
                    stroke: marker.stroke || stroke || 'rgba(0, 0, 0, 0)',
                    fillOpacity: marker.fillOpacity ?? 1,
                    strokeOpacity: marker.strokeOpacity ?? strokeOpacity ?? 1,
                },
            },
        ];
    }

    protected isLabelEnabled() {
        return this.label.enabled;
    }
}
