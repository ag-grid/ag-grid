import { CartesianChart } from "../cartesianChart";
import { Path } from "../../scene/shape/path";
import { Path2D } from "../../scene/path2D";
import { Color } from "../../util/color";
import ContinuousScale from "../../scale/continuousScale";
import { Selection } from "../../scene/selection";
import { Group } from "../../scene/group";
import { Arc, ArcType } from "../../scene/shape/arc";
import { extent } from "../../util/array";
import colors from "../palettes";
import { Series, SeriesNodeDatum } from "./series";
import { toFixed } from "../../util/number";
import { PointerEvents } from "../../scene/node";
import { LegendDatum } from "../legend";

interface GroupSelectionDatum extends SeriesNodeDatum {
    x: number,
    y: number,
    fillStyle: string | null,
    strokeStyle: string | null,
    lineWidth: number,
    radius: number
}

export interface LineTooltipRendererParams {
    datum: any,
    xField: string,
    yField: string
}

export class LineSeries extends Series<CartesianChart> {

    private domainX: any[] = [];
    private domainY: any[] = [];
    private xData: any[] = [];
    private yData: any[] = [];

    private lineNode = new Path();

    private groupSelection: Selection<Group, Group, any, any> = Selection.select(this.group).selectAll<Group>();

    constructor() {
        super();

        const lineNode = this.lineNode;
        lineNode.fillStyle = null;
        lineNode.lineJoin = 'round';
        lineNode.pointerEvents = PointerEvents.None;
        this.group.append(lineNode);
    }

    set chart(chart: CartesianChart | null) {
        if (this._chart !== chart) {
            this._chart = chart;
            this.scheduleData();
        }
    }
    get chart(): CartesianChart | null {
        return this._chart as CartesianChart;
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

    private _markerRadius: number = 4;
    set markerRadius(value: number) {
        if (this._markerRadius !== value) {
            this._markerRadius = Math.abs(value);
            this.update();
        }
    }
    get markerRadius(): number {
        return this._markerRadius;
    }

    private _markerLineWidth: number = 2;
    set markerLineWidth(value: number) {
        if (this._markerLineWidth !== value) {
            this._markerLineWidth = value;
            this.update();
        }
    }
    get markerLineWidth(): number {
        return this._markerLineWidth;
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
        const domainX = continuousX ? extent(this.xData) : this.xData;
        const domainY = extent(this.yData);

        if (continuousX) {
            const min = domainX[0];
            const max = domainX[1];
            if (min === max) {
                if (typeof min === 'number' && isFinite(min)) {
                    (domainX[0] as any) -= 1;
                } else {
                    (domainX[0] as any) = 0;
                }
                if (typeof max === 'number' && isFinite(max)) {
                    (domainX[1] as any) += 1;
                } else {
                    (domainX[1] as any) = 1;
                }
            }
        }

        if (domainY[0] === domainY[1]) {
            const min = domainY[0];
            const max = domainY[1];
            if (typeof min === 'number' && isFinite(min)) {
                (domainY[0] as any) -= 1;
            } else {
                (domainY[0] as any) = 0;
            }
            if (typeof max === 'number' && isFinite(max)) {
                (domainY[1] as any) += 1;
            } else {
                (domainY[1] as any) = 1;
            }
        }
        this.domainX = domainX;
        this.domainY = domainY;

        return true;
    }

    private _fill: string = colors[0];
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

    private _stroke: string = Color.fromString(colors[0]).darker().toHexString();
    set stroke(value: string) {
        if (this._stroke !== value) {
            this._stroke = value;
            this.scheduleData();
        }
    }
    get stroke(): string {
        return this._stroke;
    }

    private _lineWidth: number = 3;
    set lineWidth(value: number) {
        if (this._lineWidth !== value) {
            this._lineWidth = value;
            this.update();
        }
    }
    get lineWidth(): number {
        return this._lineWidth;
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
        const fillStyle = this.fill;
        const strokeStyle = this.stroke;
        const marker = this.marker;
        const markerLineWidth = this.markerLineWidth;
        const markerRadius = this.markerRadius;

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
                    fillStyle,
                    strokeStyle,
                    lineWidth: markerLineWidth,
                    radius: markerRadius
                });
            }
        }

        lineNode.strokeStyle = strokeStyle;
        lineNode.lineWidth = this.lineWidth;

        // ------------------------------------------

        const updateGroups = this.groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();

        const enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Arc).each(arc => arc.type = ArcType.Chord);

        const groupSelection = updateGroups.merge(enterGroups);

        groupSelection.selectByClass(Arc)
            .each((arc, datum) => {
                arc.centerX = datum.x;
                arc.centerY = datum.y;
                arc.radiusX = datum.radius;
                arc.radiusY = datum.radius;
                arc.fillStyle = datum.fillStyle;
                arc.strokeStyle = datum.strokeStyle;
                arc.lineWidth = datum.lineWidth;
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
        let html: string = '';
        const yField = this.yField;

        if (!yField) {
            return html;
        }

        if (this.tooltipRenderer && this.xField) {
            html = this.tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                xField: this.xField,
                yField
            });
        } else {
            const value = nodeDatum.seriesDatum[yField];
            if (typeof(value) === 'number') {
                html = `${toFixed(value)}`;
            } else {
                html = value.toString();
            }
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
                    fillStyle: this.fill,
                    strokeStyle: this.stroke
                }
            });
        }
    }
}
