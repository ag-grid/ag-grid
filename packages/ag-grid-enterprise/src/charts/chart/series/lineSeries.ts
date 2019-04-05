import { CartesianSeries } from "./cartesianSeries";
import { CartesianChart } from "../cartesianChart";
import { Path } from "../../scene/shape/path";
import { Path2D } from "../../scene/path2D";
import { Color } from "../../util/color";
import ContinuousScale from "../../scale/continuousScale";
import { Selection } from "../../scene/selection";
import { Group } from "../../scene/group";
import { Arc, ArcType } from "../../scene/shape/arc";
import { extent } from "../../util/array";
import colors from "../colors";
import { SeriesNodeDatum } from "./series";

interface GroupSelectionDatum<T> extends SeriesNodeDatum<T> {
    x: number,
    y: number,
    fillStyle: string | null,
    strokeStyle: string | null,
    lineWidth: number,
    radius: number
}

export class LineSeries<D, X, Y> extends CartesianSeries<D, X, Y> {

    private domainX: X[] = [];
    private domainY: Y[] = [];
    private xData: X[] = [];
    private yData: Y[] = [];

    private linePath = new Path();

    private groupSelection: Selection<Group, Group, any, any> = Selection.select(this.group).selectAll<Group>();

    constructor() {
        super();
        this.linePath.fillStyle = null;
        this.linePath.lineJoin = 'round';
        this.group.append(this.linePath);
    }

    set chart(chart: CartesianChart<D, X, Y> | null) {
        if (this._chart !== chart) {
            this._chart = chart;
            this.update();
        }
    }
    get chart(): CartesianChart<D, X, Y> | null {
        return this._chart as CartesianChart<D, X, Y>;
    }

    private _data: any[] = [];
    set data(data: any[]) {
        this._data = data;
        if (this.chart) {
            this.chart.layoutPending = true;
        }
    }
    get data(): any[] {
        return this._data;
    }

    set xField(value: Extract<keyof D, string> | null) {
        if (this._xField !== value) {
            this._xField = value;
            if (this.chart) {
                this.chart.layoutPending = true;
            }
        }
    }
    get xField(): Extract<keyof D, string> | null {
        return this._xField;
    }

    set yField(value: Extract<keyof D, string> | null) {
        if (this._yField !== value) {
            this._yField = value;
            if (this.chart) {
                this.chart.layoutPending = true;
            }
        }
    }
    get yField(): Extract<keyof D, string> | null {
        return this._yField;
    }

    setDataAndFields(data: D[], xField: Extract<keyof D, string>, yField: Extract<keyof D, string>) {
        this._xField = xField;
        this._yField = yField;
        this._data = data;

        if (this.chart) {
            this.chart.layoutPending = true;
        }
    }

    private _markerRadius: number = 5;
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
        const data = this.data;
        const xField = this.xField;
        const yField = this.yField;
        const chart = this.chart;

        if (!(xField && yField && chart && chart.xAxis && chart.yAxis)) {
            return false;
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
        this.domainX = domainX as [X, X];
        this.domainY = domainY as [Y, Y];

        return true;
    }

    private _color: string = colors[0];
    set color(value: string) {
        if (this._color !== value) {
            this._color = value;
            this.strokeColor = Color.fromString(value).darker().toHexString();
            this.update();
        }
    }
    get color(): string {
        return this._color;
    }

    private _strokeColor: string = Color.fromHexString(this.color).darker().toHexString();
    set strokeColor(value: string) {
        if (this._strokeColor !== value) {
            this._strokeColor = value;
            this.update();
        }
    }
    get strokeColor(): string {
        return this._strokeColor;
    }

    private _lineWidth: number = 2;
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

        if (!chart || chart && chart.layoutPending || !(chart.xAxis && chart.yAxis)) {
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

        const linePath: Path = this.linePath;
        const path: Path2D = linePath.path;

        const groupSelectionData: GroupSelectionDatum<D>[] = [];

        path.clear();
        for (let i = 0; i < n; i++) {
            const xDatum = xData[i];
            const yDatum = yData[i];
            const x = xScale.convert(xDatum) + xOffset;
            const y = yScale.convert(yDatum) + yOffset;

            if (!i) {
                path.moveTo(x, y);
            } else {
                path.lineTo(x, y);
            }

            groupSelectionData.push({
                seriesDatum: data[i],
                x,
                y,
                fillStyle: this.color,
                strokeStyle: this.strokeColor,
                lineWidth: this.markerLineWidth,
                radius: this.markerRadius
            });
        }

        linePath.strokeStyle = this.strokeColor;
        linePath.lineWidth = this.lineWidth;

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

    getDomainX(): X[] {
        return this.domainX;
    }

    getDomainY(): Y[] {
        return this.domainY;
    }

    showTooltip(nodeDatum: GroupSelectionDatum<D>, event: MouseEvent): void {

    }

    hideTooltip(): void {
    }
}
