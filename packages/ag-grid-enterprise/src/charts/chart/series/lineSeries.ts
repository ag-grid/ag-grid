import {CartesianSeries} from "./cartesianSeries";
import {CartesianChart} from "../cartesianChart";
import {Path} from "../../scene/shape/path";
import {Path2D} from "../../scene/path2D";
import colors from "../colors";
import {Color} from "../../util/color";
import {extent} from "../../util/array";
import ContinuousScale from "../../scale/continuousScale";

export class LineSeries<D, X, Y> extends CartesianSeries<D, X, Y> {

    private domainX: X[] = [];
    private domainY: Y[] = [];
    private xData: X[] = [];
    private yData: Y[] = [];

    private linePath = new Path();

    constructor() {
        super();
        this.linePath.fillStyle = null;
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
        if (this.processData()) {
            this.update();
        }
    }
    get data(): any[] {
        return this._data;
    }

    set xField(value: Extract<keyof D, string> | null) {
        if (this._xField !== value) {
            this._xField = value;
            if (this.processData()) {
                this.update();
            }
        }
    }
    get xField(): Extract<keyof D, string> | null {
        return this._xField;
    }

    set yField(value: Extract<keyof D, string> | null) {
        if (this._yField !== value) {
            this._yField = value;
            if (this.processData()) {
                this.update();
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

        if (this.processData()) {
            this.update();
        }
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

        const domainX = chart.xAxis.scale instanceof ContinuousScale ? extent(this.xData) : this.xData;
        const domainY = extent(this.yData);

        if (domainX[0] === domainX[1]) {
            if (typeof domainX[0] === 'number' && isFinite(domainX[0])) {
                (domainX[0] as number) -= 1;
            } else {
                (domainX[0] as any) = 0;
            }
            if (typeof domainX[1] === 'number' && isFinite(domainX[1])) {
                (domainX[1] as number) += 1;
            } else {
                (domainX[1] as any) = 1;
            }
        }

        if (domainY[0] === domainY[1]) {
            if (typeof domainY[0] === 'number' && isFinite(domainY[0])) {
                (domainY[0] as number) -= 1;
            } else {
                (domainY[0] as any) = 0;
            }
            if (typeof domainY[1] === 'number' && isFinite(domainY[1])) {
                (domainY[1] as number) += 1;
            } else {
                (domainY[1] as any) = 1;
            }
        }
        this.domainX = domainX as [X, X];
        this.domainY = domainY as [Y, Y];

        chart.updateAxes();

        return true;
    }

    private color = Color.fromHexString(colors[0]).darker().toHexString();

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
        const xData = this.xData;
        const yData = this.yData;
        const n = xData.length;

        const linePath: Path = this.linePath;
        const path: Path2D = linePath.path;

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
        }

        linePath.strokeStyle = this.color;
        linePath.lineWidth = this.lineWidth;
    }

    getDomainX(): X[] {
        return this.domainX;
    }

    getDomainY(): Y[] {
        return this.domainY;
    }
}
