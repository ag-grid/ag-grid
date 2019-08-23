import { CartesianChart } from "../cartesianChart";
import { Path } from "../../scene/shape/path";
import { Path2D } from "../../scene/path2D";
import ContinuousScale from "../../scale/continuousScale";
import { Selection } from "../../scene/selection";
import { Group } from "../../scene/group";
import { Arc, ArcType } from "../../scene/shape/arc";
import { numericExtent } from "../../util/array";
import palette from "../palettes";
import { Series, SeriesNodeDatum } from "./series";
import { toFixed } from "../../util/number";
import { PointerEvents } from "../../scene/node";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
import { Color } from "ag-grid-community";

interface GroupSelectionDatum extends SeriesNodeDatum {
    x: number;
    y: number;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    radius: number;
}

export interface LineTooltipRendererParams {
    datum: any;
    xField: string;
    yField: string;
    title?: string;
    color?: string;
}

export class LineSeries extends Series<CartesianChart> {

    static className = 'LineSeries';

    private domainX: any[] = [];
    private domainY: any[] = [];
    private xData: any[] = [];
    private yData: any[] = [];

    private lineNode = new Path();

    private groupSelection: Selection<Group, Group, any, any> = Selection.select(this.group).selectAll<Group>();

    constructor() {
        super();

        const lineNode = this.lineNode;
        lineNode.fill = undefined;
        lineNode.lineJoin = 'round';
        lineNode.pointerEvents = PointerEvents.None;
        this.group.append(lineNode);
    }

    set chart(chart: CartesianChart | undefined) {
        if (this._chart !== chart) {
            this._chart = chart;
            this.scheduleData();
        }
    }
    get chart(): CartesianChart | undefined {
        return this._chart as CartesianChart;
    }

    protected _title: string = '';
    set title(value: string) {
        if (this._title !== value) {
            this._title = value;
            this.scheduleLayout();
        }
    }
    get title(): string {
        return this._title;
    }

    protected _xField: string = '';
    set xField(value: string) {
        if (this._xField !== value) {
            this._xField = value;
            this.xData = [];
            this.scheduleData();
        }
    }
    get xField(): string {
        return this._xField;
    }

    protected _yField: string = '';
    set yField(value: string) {
        if (this._yField !== value) {
            this._yField = value;
            this.yData = [];
            this.scheduleData();
        }
    }
    get yField(): string {
        return this._yField;
    }

    private _marker: boolean = false;
    set marker(value: boolean) {
        if (this._marker !== value) {
            this._marker = value;
            this.update();
        }
    }
    get marker(): boolean {
        return this._marker;
    }

    private _markerSize: number = 8;
    set markerSize(value: number) {
        if (this._markerSize !== value) {
            this._markerSize = Math.abs(value);
            this.update();
        }
    }
    get markerSize(): number {
        return this._markerSize;
    }

    private _markerStrokeWidth: number = 2;
    set markerStrokeWidth(value: number) {
        if (this._markerStrokeWidth !== value) {
            this._markerStrokeWidth = value;
            this.update();
        }
    }
    get markerStrokeWidth(): number {
        return this._markerStrokeWidth;
    }

    processData(): boolean {
        const chart = this.chart;
        const xField = this.xField;
        const yField = this.yField;
        let data = this.data as any[];

        if (!(chart && chart.xAxis && chart.yAxis)) {
            return false;
        }

        if (!(xField && yField)) {
            this._data = data = [];
        }

        this.xData = data.map(datum => datum[xField]);
        this.yData = data.map(datum => datum[yField]);

        const continuousX = chart.xAxis.scale instanceof ContinuousScale;
        const domainX = continuousX ? (numericExtent(this.xData) || [0, 1]) : this.xData;
        const domainY = numericExtent(this.yData) || [0, 1];

        if (continuousX) {
            const [min, max] = domainX as number[];
            if (min === max) {
                domainX[0] = min - 1;
                domainX[1] = max + 1;
            }
        }

        {
            const [min, max] = domainY as number[];
            if (min === max) {
                domainY[0] = min - 1;
                domainY[1] = max + 1;
            }
        }

        this.domainX = domainX;
        this.domainY = domainY;

        return true;
    }

    private _fill: string = palette.fills[0];
    set fill(value: string) {
        if (this._fill !== value) {
            this._fill = value;
            this.stroke = Color.fromString(value).darker().toHexString();
            this.scheduleData();
        }
    }
    get fill(): string {
        return this._fill;
    }

    private _stroke: string = palette.strokes[0];
    set stroke(value: string) {
        if (this._stroke !== value) {
            this._stroke = value;
            this.scheduleData();
        }
    }
    get stroke(): string {
        return this._stroke;
    }

    private _strokeWidth: number = 3;
    set strokeWidth(value: number) {
        if (this._strokeWidth !== value) {
            this._strokeWidth = value;
            this.update();
        }
    }
    get strokeWidth(): number {
        return this._strokeWidth;
    }

    highlightStyle: {
        fill?: string,
        stroke?: string
    } = {
        fill: 'yellow'
    };

    private highlightedNode?: Arc;

    highlightNode(node: Shape) {
        if (!(node instanceof Arc)) {
            return;
        }

        this.highlightedNode = node;
        this.scheduleLayout();
    }

    dehighlightNode() {
        this.highlightedNode = undefined;
        this.scheduleLayout();
    }

    update(): void {
        const chart = this.chart;
        const visible = this.group.visible = this.visible;

        if (!chart || !visible || chart.dataPending || chart.layoutPending || !(chart.xAxis && chart.yAxis)) {
            return;
        }

        const xAxis = chart.xAxis;
        const yAxis = chart.yAxis;
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;
        const data = this.data;
        const xData = this.xData;
        const yData = this.yData;
        const n = xData.length;
        const fill = this.fill;
        const stroke = this.stroke;
        const marker = this.marker;
        const markerSize = this.markerSize;
        const markerStrokeWidth = this.markerStrokeWidth;

        const lineNode: Path = this.lineNode;
        const linePath: Path2D = lineNode.path;
        const groupSelectionData: GroupSelectionDatum[] = [];

        linePath.clear();
        for (let i = 0; i < n; i++) {
            const xDatum = xData[i];
            const yDatum = yData[i];
            const x = xScale.convert(xDatum) + xOffset;
            const y = yScale.convert(yDatum) + yOffset;

            if (!i) {
                linePath.moveTo(x, y);
            } else {
                linePath.lineTo(x, y);
            }

            if (marker) {
                groupSelectionData.push({
                    seriesDatum: data[i],
                    x,
                    y,
                    fill,
                    stroke,
                    strokeWidth: markerStrokeWidth,
                    radius: markerSize / 2
                });
            }
        }

        lineNode.stroke = stroke;
        lineNode.strokeWidth = this.strokeWidth;

        // ------------------------------------------

        const updateGroups = this.groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();

        const enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Arc).each(arc => arc.type = ArcType.Chord);

        const highlightedNode = this.highlightedNode;
        const groupSelection = updateGroups.merge(enterGroups);

        groupSelection.selectByClass(Arc)
            .each((arc, datum) => {
                arc.centerX = datum.x;
                arc.centerY = datum.y;
                arc.radiusX = datum.radius;
                arc.radiusY = datum.radius;
                arc.fill = arc === highlightedNode && this.highlightStyle.fill !== undefined
                    ? this.highlightStyle.fill
                    : datum.fill;
                arc.stroke = arc === highlightedNode && this.highlightStyle.stroke !== undefined
                    ? this.highlightStyle.stroke
                    : datum.stroke;
                arc.strokeWidth = datum.strokeWidth;
                arc.visible = datum.radius > 0;
            });

        this.groupSelection = groupSelection;
    }

    getDomainX(): any[] {
        return this.domainX;
    }

    getDomainY(): any[] {
        return this.domainY;
    }

    getTooltipHtml(nodeDatum: GroupSelectionDatum): string {
        const xField = this.xField;
        const yField = this.yField;
        const color = this.fill;
        let html: string = '';

        if (!xField || !yField) {
            return html;
        }

        let title = this.title;
        if (this.tooltipRenderer && this.xField) {
            html = this.tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                xField,
                yField,
                title,
                color
            });
        } else {
            const titleStyle = `style="color: white; background-color: ${color}"`;
            title = title ? `<div class="title" ${titleStyle}>${title}</div>` : '';
            const seriesDatum = nodeDatum.seriesDatum;
            const xValue = seriesDatum[xField];
            const yValue = seriesDatum[yField];
            const xString = typeof(xValue) === 'number' ? toFixed(xValue) : String(xValue);
            const yString = typeof(yValue) === 'number' ? toFixed(yValue) : String(yValue);

            html = `${title}<div class="content">${xString}: ${yString}</div>`;
        }
        return html;
    }

    tooltipRenderer?: (params: LineTooltipRendererParams) => string;

    listSeriesItems(data: LegendDatum[]): void {
        if (this.data.length && this.xField && this.yField) {
            data.push({
                id: this.id,
                itemId: undefined,
                enabled: this.visible,
                label: {
                    text: this.title || this.yField
                },
                marker: {
                    fill: this.fill,
                    stroke: this.stroke
                }
            });
        }
    }
}
