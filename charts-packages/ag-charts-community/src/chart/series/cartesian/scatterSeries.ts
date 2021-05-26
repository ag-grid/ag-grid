import { Selection } from "../../../scene/selection";
import { Group } from "../../../scene/group";
import { SeriesNodeDatum, CartesianTooltipRendererParams, HighlightStyle, SeriesTooltip } from "../series";
import { finiteExtent } from "../../../util/array";
import { toFixed } from "../../../util/number";
import { LegendDatum } from "../../legend";
import { LinearScale } from "../../../scale/linearScale";
import { reactive, TypedEvent } from "../../../util/observable";
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesMarkerFormat } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { getMarker } from "../../marker/util";
import { TooltipRendererResult, toTooltipHtml } from "../../chart";
import ContinuousScale from "../../../scale/continuousScale";

interface ScatterNodeDatum extends SeriesNodeDatum {
    readonly point: {
        readonly x: number;
        readonly y: number;
    };
    readonly size: number;
}

export interface ScatterSeriesNodeClickEvent extends TypedEvent {
    readonly type: 'nodeClick';
    readonly event: MouseEvent;
    readonly series: ScatterSeries;
    readonly datum: any;
    readonly xKey: string;
    readonly yKey: string;
    readonly sizeKey?: string;
}

export interface ScatterTooltipRendererParams extends CartesianTooltipRendererParams {
    readonly sizeKey?: string;
    readonly sizeName?: string;

    readonly labelKey?: string;
    readonly labelName?: string;
}

export class ScatterSeriesTooltip extends SeriesTooltip {
    @reactive('change') renderer?: (params: ScatterTooltipRendererParams) => string | TooltipRendererResult;
}

export class ScatterSeries extends CartesianSeries {

    static className = 'ScatterSeries';
    static type = 'scatter';

    private xDomain: number[] = [];
    private yDomain: number[] = [];
    private xData: any[] = [];
    private yData: any[] = [];
    private sizeData: number[] = [];
    private sizeScale = new LinearScale();

    private nodeSelection: Selection<Group, Group, ScatterNodeDatum, any> = Selection.select(this.group).selectAll<Group>();
    private nodeData: ScatterNodeDatum[] = [];

    readonly marker = new CartesianSeriesMarker();

    private _fill: string | undefined = '#c16068';
    set fill(value: string | undefined) {
        if (this._fill !== value) {
            this._fill = value;
            this.scheduleData();
        }
    }

    get fill(): string | undefined {
        return this._fill;
    }

    private _stroke: string | undefined = '#874349';
    set stroke(value: string | undefined) {
        if (this._stroke !== value) {
            this._stroke = value;
            this.scheduleData();
        }
    }

    get stroke(): string | undefined {
        return this._stroke;
    }

    private _strokeWidth: number = 2;
    set strokeWidth(value: number) {
        if (this._strokeWidth !== value) {
            this._strokeWidth = value;
            this.update();
        }
    }

    get strokeWidth(): number {
        return this._strokeWidth;
    }

    private _fillOpacity: number = 1;
    set fillOpacity(value: number) {
        if (this._fillOpacity !== value) {
            this._fillOpacity = value;
            this.scheduleLayout();
        }
    }

    get fillOpacity(): number {
        return this._fillOpacity;
    }

    private _strokeOpacity: number = 1;
    set strokeOpacity(value: number) {
        if (this._strokeOpacity !== value) {
            this._strokeOpacity = value;
            this.scheduleLayout();
        }
    }

    get strokeOpacity(): number {
        return this._strokeOpacity;
    }

    highlightStyle: HighlightStyle = { fill: 'yellow' };

    onHighlightChange() {
        this.updateNodes();
    }

    @reactive('layoutChange') title?: string;
    @reactive('dataChange') xKey: string = '';
    @reactive('dataChange') yKey: string = '';
    @reactive('dataChange') sizeKey?: string;
    @reactive('dataChange') labelKey?: string;

    xName: string = '';
    yName: string = '';
    sizeName?: string = 'Size';
    labelName?: string = 'Label';

    /**
     * @deprecated Use {@link tooltip.renderer} instead.
     */
    tooltipRenderer?: (params: ScatterTooltipRendererParams) => string | TooltipRendererResult;
    readonly tooltip: ScatterSeriesTooltip = new ScatterSeriesTooltip();

    constructor() {
        super();

        const { marker } = this;
        marker.addPropertyListener('shape', this.onMarkerShapeChange, this);
        marker.addEventListener('change', this.update, this);

        this.addPropertyListener('xKey', () => this.xData = []);
        this.addPropertyListener('yKey', () => this.yData = []);
        this.addPropertyListener('sizeKey', () => this.sizeData = []);
    }

    onMarkerShapeChange() {
        this.nodeSelection = this.nodeSelection.setData([]);
        this.nodeSelection.exit.remove();
        this.update();

        this.fireEvent({ type: 'legendChange' });
    }

    setColors(fills: string[], strokes: string[]) {
        this.fill = fills[0];
        this.stroke = strokes[0];
        this.marker.fill = fills[0];
        this.marker.stroke = strokes[0];
    }

    processData(): boolean {
        const { xKey, yKey, sizeKey, xAxis, yAxis, marker } = this;

        const data = xKey && yKey && this.data ? this.data : [];

        this.xData = data.map(d => d[xKey]);
        this.yData = data.map(d => d[yKey]);

        if (sizeKey) {
            this.sizeData = data.map(d => d[sizeKey]);
        } else {
            this.sizeData = [];
        }

        this.sizeScale.domain = marker.domain ? marker.domain : finiteExtent(this.sizeData) || [1, 1];
        if (xAxis.scale instanceof ContinuousScale) {
            this.xDomain = this.fixNumericExtent(finiteExtent(this.xData), 'x');
        } else {
            this.xDomain = this.xData;
        }
        if (yAxis.scale instanceof ContinuousScale) {
            this.yDomain = this.fixNumericExtent(finiteExtent(this.yData), 'y');
        } else {
            this.yDomain = this.yData;
        }

        return true;
    }

    getDomain(direction: ChartAxisDirection): any[] {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        } else {
            return this.yDomain;
        }
    }

    getNodeData(): ScatterNodeDatum[] {
        return this.nodeData;
    }

    fireNodeClickEvent(event: MouseEvent, datum: ScatterNodeDatum): void {
        this.fireEvent<ScatterSeriesNodeClickEvent>({
            type: 'nodeClick',
            event,
            series: this,
            datum: datum.seriesDatum,
            xKey: this.xKey,
            yKey: this.yKey,
            sizeKey: this.sizeKey
        });
    }

    private generateNodeData(): ScatterNodeDatum[] {
        if (!this.data) {
            return [];
        }

        const { xAxis, yAxis } = this;
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const isContinuousX = xScale instanceof ContinuousScale;
        const isContinuousY = yScale instanceof ContinuousScale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;

        const { data, xData, yData, sizeData, sizeScale, marker } = this;

        sizeScale.range = [marker.size, marker.maxSize];

        const nodeData: ScatterNodeDatum[] = [];
        for (let i = 0; i < xData.length; i++) {
            const xDatum = xData[i];
            const yDatum = yData[i];
            const noDatum =
                yDatum == null || (isContinuousY && (isNaN(yDatum) || !isFinite(yDatum))) ||
                xDatum == null || (isContinuousX && (isNaN(xDatum) || !isFinite(xDatum)));
            if (noDatum) {
                continue;
            }

            const x = xScale.convert(xDatum) + xOffset;
            if (!xAxis.inRange(x)) {
                continue;
            }
            nodeData.push({
                series: this,
                seriesDatum: data[i],
                point: {
                    x,
                    y: yScale.convert(yData[i]) + yOffset
                },
                size: sizeData.length ? sizeScale.convert(sizeData[i]) : marker.size
            });
        }

        return nodeData;
    }

    update(): void {
        const { visible, chart, xAxis, yAxis } = this;

        this.group.visible = visible;

        if (!visible || !chart || chart.layoutPending || chart.dataPending || !xAxis || !yAxis) {
            return;
        }

        const nodeData = this.nodeData = this.generateNodeData();

        this.updateNodeSelection(nodeData);
        this.updateNodes();
    }

    private updateNodeSelection(nodeData: ScatterNodeDatum[]): void {
        const MarkerShape = getMarker(this.marker.shape);

        const updateSelection = this.nodeSelection.setData(nodeData);
        updateSelection.exit.remove();

        const enterSelection = updateSelection.enter.append(Group);
        enterSelection.append(MarkerShape);

        this.nodeSelection = updateSelection.merge(enterSelection);
    }

    private updateNodes(): void {
        if (!this.chart) {
            return;
        }

        const { highlightedDatum } = this.chart;
        const { marker, xKey, yKey, fill, stroke, strokeWidth, fillOpacity, strokeOpacity } = this;
        const { fill: highlightFill, stroke: highlightStroke } = this.highlightStyle;
        const markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : strokeWidth;
        const MarkerShape = getMarker(marker.shape);
        const markerFormatter = marker.formatter;

        this.nodeSelection.selectByClass(MarkerShape)
            .each((node, datum) => {
                const highlighted = datum === highlightedDatum;
                const markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill || fill;
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
                        size: datum.size,
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
                    : datum.size;
                node.fillOpacity = fillOpacity;
                node.strokeOpacity = strokeOpacity;
                node.translationX = datum.point.x;
                node.translationY = datum.point.y;
                node.visible = marker.enabled && node.size > 0;
            });
    }

    getTooltipHtml(nodeDatum: ScatterNodeDatum): string {
        const { xKey, yKey, xAxis, yAxis } = this;

        if (!xKey || !yKey) {
            return '';
        }

        const {
            tooltip,
            xName,
            yName,
            sizeKey,
            sizeName,
            labelKey,
            labelName
        } = this;

        const { renderer: tooltipRenderer = this.tooltipRenderer } = tooltip;
        const color = this.marker.fill || this.fill || 'gray';
        const title = this.title || yName;
        const datum = nodeDatum.seriesDatum;
        const xValue = datum[xKey];
        const yValue = datum[yKey];
        const xString = xAxis.formatDatum(xValue);
        const yString = yAxis.formatDatum(yValue);

        let content = `<b>${xName || xKey}</b>: ${xString}`
            + `<br><b>${yName || yKey}</b>: ${yString}`;

        if (sizeKey) {
            content += `<br><b>${sizeName}</b>: ${datum[sizeKey]}`;
        }

        if (labelKey) {
            content = `<b>${labelName}</b>: ${datum[labelKey]}<br>` + content;
        }

        const defaults: TooltipRendererResult = {
            title,
            backgroundColor: color,
            content
        };

        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
                datum,
                xKey,
                xValue,
                xName,
                yKey,
                yValue,
                yName,
                sizeKey,
                sizeName,
                labelKey,
                labelName,
                title,
                color
            }), defaults);
        }

        return toTooltipHtml(defaults);
    }

    listSeriesItems(legendData: LegendDatum[]): void {
        const {
            id, data, xKey, yKey, yName,
            title, visible, marker, fill, stroke, fillOpacity, strokeOpacity
        } = this;

        if (data && data.length && xKey && yKey) {
            legendData.push({
                id,
                itemId: undefined,
                enabled: visible,
                label: {
                    text: title || yName || yKey
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill || fill || 'rgba(0, 0, 0, 0)',
                    stroke: marker.stroke || stroke || 'rgba(0, 0, 0, 0)',
                    fillOpacity,
                    strokeOpacity
                }
            });
        }
    }
}
