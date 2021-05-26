import { Path } from "../../../scene/shape/path";
import ContinuousScale from "../../../scale/continuousScale";
import { Selection } from "../../../scene/selection";
import { Group } from "../../../scene/group";
import {
    SeriesNodeDatum,
    CartesianTooltipRendererParams as LineTooltipRendererParams,
    HighlightStyle, SeriesTooltip
} from "../series";
import { numericExtent } from "../../../util/array";
import { toFixed } from "../../../util/number";
import { PointerEvents } from "../../../scene/node";
import { LegendDatum } from "../../legend";
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesMarkerFormat } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { getMarker } from "../../marker/util";
import { reactive, PropertyChangeEvent, TypedEvent } from "../../../util/observable";
import { TooltipRendererResult, toTooltipHtml } from "../../chart";
import Scale from "../../../scale/scale";
import { interpolate } from "../../../util/string";

interface LineNodeDatum extends SeriesNodeDatum {
    readonly point: {
        readonly x: number;
        readonly y: number;
    }
}

export interface LineSeriesNodeClickEvent extends TypedEvent {
    readonly type: 'nodeClick';
    readonly event: MouseEvent;
    readonly series: LineSeries;
    readonly datum: any;
    readonly xKey: string;
    readonly yKey: string;
}

export { LineTooltipRendererParams };

export class LineSeriesTooltip extends SeriesTooltip {
    @reactive('change') renderer?: (params: LineTooltipRendererParams) => string | TooltipRendererResult;
    @reactive('change') format?: string;
}

export class LineSeries extends CartesianSeries {

    static className = 'LineSeries';
    static type = 'line';

    private xDomain: any[] = [];
    private yDomain: any[] = [];
    private xData: any[] = [];
    private yData: any[] = [];

    private lineNode = new Path();

    // We use groups for this selection even though each group only contains a marker ATM
    // because in the future we might want to add label support as well.
    private nodeSelection: Selection<Group, Group, LineNodeDatum, any> = Selection.select(this.group).selectAll<Group>();
    private nodeData: LineNodeDatum[] = [];

    readonly marker = new CartesianSeriesMarker();

    @reactive('layoutChange') title?: string;

    @reactive('update') stroke?: string = '#874349';
    @reactive('update') lineDash?: number[] = undefined;
    @reactive('update') lineDashOffset: number = 0;
    @reactive('update') strokeWidth: number = 2;
    @reactive('update') strokeOpacity: number = 1;

    /**
     * @deprecated Use {@link tooltip.renderer} instead.
     */
    tooltipRenderer?: (params: LineTooltipRendererParams) => string | TooltipRendererResult;
    tooltip: LineSeriesTooltip = new LineSeriesTooltip();

    constructor() {
        super();

        const lineNode = this.lineNode;
        lineNode.fill = undefined;
        lineNode.lineJoin = 'round';
        lineNode.pointerEvents = PointerEvents.None;
        this.group.append(lineNode);

        this.addEventListener('update', this.update);

        const { marker } = this;
        marker.fill = '#c16068';
        marker.stroke = '#874349';
        marker.addPropertyListener('shape', this.onMarkerShapeChange, this);
        marker.addPropertyListener('enabled', this.onMarkerEnabledChange, this);
        marker.addEventListener('change', this.update, this);
    }

    onMarkerShapeChange() {
        this.nodeSelection = this.nodeSelection.setData([]);
        this.nodeSelection.exit.remove();
        this.update();

        this.fireEvent({ type: 'legendChange' });
    }

    protected onMarkerEnabledChange(event: PropertyChangeEvent<CartesianSeriesMarker, boolean>) {
        if (!event.value) {
            this.nodeSelection = this.nodeSelection.setData([]);
            this.nodeSelection.exit.remove();
        }
    }

    setColors(fills: string[], strokes: string[]) {
        this.stroke = fills[0];
        this.marker.stroke = strokes[0];
        this.marker.fill = fills[0];
    }

    protected _xKey: string = '';
    set xKey(value: string) {
        if (this._xKey !== value) {
            this._xKey = value;
            this.xData = [];
            this.scheduleData();
        }
    }

    get xKey(): string {
        return this._xKey;
    }

    @reactive('update') xName: string = '';

    protected _yKey: string = '';
    set yKey(value: string) {
        if (this._yKey !== value) {
            this._yKey = value;
            this.yData = [];
            this.scheduleData();
        }
    }

    get yKey(): string {
        return this._yKey;
    }

    @reactive('update') yName: string = '';

    processData(): boolean {
        const { xAxis, yAxis, xKey, yKey, xData, yData } = this;
        const data = xKey && yKey && this.data ? this.data : [];

        if (!xAxis) {
            return false;
        }

        const isContinuousX = xAxis.scale instanceof ContinuousScale;
        const isContinuousY = yAxis.scale instanceof ContinuousScale;

        xData.length = 0;
        yData.length = 0;

        for (let i = 0, n = data.length; i < n; i++) {
            const datum = data[i];
            const x = datum[xKey];
            const y = datum[yKey];

            xData.push(x);
            yData.push(y);
        }

        this.xDomain = isContinuousX ? this.fixNumericExtent(numericExtent(xData), 'x') : xData;
        this.yDomain = isContinuousY ? this.fixNumericExtent(numericExtent(yData), 'y') : yData;

        return true;
    }

    getDomain(direction: ChartAxisDirection): any[] {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        }
        return this.yDomain;
    }

    highlightStyle: HighlightStyle = { fill: 'yellow' };

    onHighlightChange() {
        this.updateNodes();
    }

    update(): void {
        this.group.visible = this.visible;

        const { chart, xAxis, yAxis } = this;

        if (!chart || chart.layoutPending || chart.dataPending || !xAxis || !yAxis) {
            return;
        }

        this.updateLinePath(); // this will generate node data too
        this.updateNodeSelection();
        this.updateNodes();
    }

    private getXYDatums(i: number, xData: number[], yData: number[],
                      xScale: Scale<any, any>, yScale: Scale<any, any>): [number, number] | undefined {
        const isContinuousX = xScale instanceof ContinuousScale;
        const isContinuousY = yScale instanceof ContinuousScale;
        const xDatum = xData[i];
        const yDatum = yData[i];
        const noDatum =
            yDatum == null || (isContinuousY && (isNaN(yDatum) || !isFinite(yDatum))) ||
            xDatum == null || (isContinuousX && (isNaN(xDatum) || !isFinite(xDatum)));
        return noDatum ? undefined : [xDatum, yDatum];
    }

    private updateLinePath() {
        if (!this.data) {
            return;
        }

        const { xAxis, yAxis, data, xData, yData, lineNode } = this;
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;
        const linePath = lineNode.path;
        const nodeData: LineNodeDatum[] = [];

        linePath.clear();
        let moveTo = true;
        let prevXInRange: undefined | -1 | 0 | 1 = undefined;
        let nextXYDatums: [number, number] | undefined = undefined;
        for (let i = 0; i < xData.length; i++) {
            const xyDatums = nextXYDatums || this.getXYDatums(i, xData, yData, xScale, yScale);

            if (!xyDatums) {
                prevXInRange = undefined;
                moveTo = true;
            } else {
                const [xDatum, yDatum] = xyDatums;
                const x = xScale.convert(xDatum) + xOffset;
                const tolerance = (xScale.bandwidth || (this.marker.size * 0.5 + (this.marker.strokeWidth || 0))) + 1;

                nextXYDatums = this.getXYDatums(i + 1, xData, yData, xScale, yScale);
                const xInRange = xAxis.inRangeEx(x, 0, tolerance);
                const nextXInRange = nextXYDatums && xAxis.inRangeEx(xScale.convert(nextXYDatums[0]) + xOffset, 0, tolerance);
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

                if (moveTo) {
                    linePath.moveTo(x, y);
                    moveTo = false;
                } else {
                    linePath.lineTo(x, y);
                }

                nodeData.push({
                    series: this,
                    seriesDatum: data[i],
                    point: { x, y }
                });
            }
        }

        lineNode.stroke = this.stroke;
        lineNode.strokeWidth = this.strokeWidth;
        lineNode.lineDash = this.lineDash;
        lineNode.lineDashOffset = this.lineDashOffset;
        lineNode.strokeOpacity = this.strokeOpacity;

        // Used by marker nodes and for hit-testing even when not using markers
        // when `chart.tooltipTracking` is true.
        this.nodeData = nodeData;
    }

    private updateNodeSelection() {
        const { marker } = this;
        const nodeData = marker.shape ? this.nodeData : [];
        const MarkerShape = getMarker(marker.shape);
        const updateSelection = this.nodeSelection.setData(nodeData);
        updateSelection.exit.remove();
        const enterSelection = updateSelection.enter.append(Group);
        enterSelection.append(MarkerShape);
        this.nodeSelection = updateSelection.merge(enterSelection);
    }

    private updateNodes() {
        if (!this.chart) {
            return;
        }

        const { marker, xKey, yKey, stroke, strokeWidth } = this;
        const MarkerShape = getMarker(marker.shape);
        const { highlightedDatum } = this.chart;

        const { fill: highlightFill, stroke: highlightStroke } = this.highlightStyle;
        const markerFormatter = marker.formatter;
        const markerSize = marker.size;
        const markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : strokeWidth;

        this.nodeSelection.selectByClass(MarkerShape)
            .each((node, datum) => {
                const highlighted = datum === highlightedDatum;
                const markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill;
                const markerStroke = highlighted && highlightStroke !== undefined ? highlightStroke : marker.stroke || stroke;
                let markerFormat: CartesianSeriesMarkerFormat | undefined = undefined;

                if (markerFormatter) {
                    markerFormat = markerFormatter({
                        datum: datum.seriesDatum,
                        xKey,
                        yKey,
                        fill: markerFill,
                        stroke: markerStroke,
                        strokeWidth: markerStrokeWidth,
                        size: markerSize,
                        highlighted
                    });
                }

                node.fill = markerFormat && markerFormat.fill || markerFill;
                node.stroke = markerFormat && markerFormat.stroke || markerStroke;
                node.strokeWidth = markerFormat && markerFormat.strokeWidth !== undefined
                    ? markerFormat.strokeWidth
                    : markerStrokeWidth;
                node.size = markerFormat && markerFormat.size !== undefined
                    ? markerFormat.size
                    : markerSize;

                node.translationX = datum.point.x;
                node.translationY = datum.point.y;
                node.visible = marker.enabled && node.size > 0;
            });
    }

    getNodeData(): LineNodeDatum[] {
        return this.nodeData;
    }

    fireNodeClickEvent(event: MouseEvent, datum: LineNodeDatum): void {
        this.fireEvent<LineSeriesNodeClickEvent>({
            type: 'nodeClick',
            event,
            series: this,
            datum: datum.seriesDatum,
            xKey: this.xKey,
            yKey: this.yKey
        });
    }

    getTooltipHtml(nodeDatum: LineNodeDatum): string {
        const { xKey, yKey, xAxis, yAxis } = this;

        if (!xKey || !yKey) {
            return '';
        }

        const { xName, yName, stroke: color, tooltip } = this;
        const {
            renderer: tooltipRenderer = this.tooltipRenderer,
            format: tooltipFormat
        } = tooltip;
        const datum = nodeDatum.seriesDatum;
        const xValue = datum[xKey];
        const yValue = datum[yKey];
        const xString = xAxis.formatDatum(xValue);
        const yString = yAxis.formatDatum(yValue);
        const title = this.title || yName;
        const content = xString + ': ' + yString;
        const defaults: TooltipRendererResult = {
            title,
            backgroundColor: color,
            content
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
                color
            };
            if (tooltipFormat) {
                return toTooltipHtml({
                    content: interpolate(tooltipFormat, params)
                }, defaults);
            }
            if (tooltipRenderer) {
                return toTooltipHtml(tooltipRenderer(params), defaults);
            }
        }

        return toTooltipHtml(defaults);
    }

    listSeriesItems(legendData: LegendDatum[]): void {
        const {
            id, data, xKey, yKey, yName, visible,
            title, marker, stroke, strokeOpacity
        } = this;

        if (data && data.length && xKey && yKey) {
            legendData.push({
                id: id,
                itemId: undefined,
                enabled: visible,
                label: {
                    text: title || yName || yKey
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill || 'rgba(0, 0, 0, 0)',
                    stroke: marker.stroke || stroke || 'rgba(0, 0, 0, 0)',
                    fillOpacity: 1,
                    strokeOpacity
                }
            });
        }
    }
}
