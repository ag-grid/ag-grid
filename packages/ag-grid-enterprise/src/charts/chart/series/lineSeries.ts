import {CartesianSeries} from "./cartesianSeries";
import {CartesianChart} from "../cartesianChart";
import {Path} from "../../scene/shape/path";
import colors from "../colors";
import {Color} from "../../util/color";

export class LineSeries<D, X = string, Y = number> extends CartesianSeries<D, X, Y> {

    private domainX: string[] = [];
    private domainY: number[] = [];
    private yData: number[] = [];

    private linePath = new Path();

    constructor() {
        super();
        this.linePath.fillStyle = null;
        this.group.append(this.linePath);
    }

    set chart(chart: CartesianChart<D, string, number> | null) {
        if (this._chart !== chart) {
            this._chart = chart;
            this.update();
        }
    }
    get chart(): CartesianChart<D, string, number> | null {
        return this._chart as CartesianChart<D, string, number>;
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

    setDataAndFields(data: any[], xField: Extract<keyof D, string>, yField: Extract<keyof D, string>) {
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

        if (!(xField && yField)) {
            return false;
        }

        const xData: string[] = this.domainX = data.map(datum => {
            const value = datum[xField];
            if (typeof value !== 'string') {
                throw new Error(`The ${xField} value is not a string. `
                    + `This error might be solved by using the 'setDataAndFields' method.`);
            }
            return value;
        });
        const yData: number[] = this.yData = data.map(datum => {
            const value = datum[yField];
            if (typeof value !== 'number') {
                throw new Error(`The ${yField} value is not a number. `
                    + `This error might be solved by using the 'setDataAndFields' method.`);
            }
            return value;
        });

        let yMin: number = Math.min(...yData);
        let yMax: number = Math.max(...yData);


        if (yMin === yMax || !isFinite(yMin) || !isFinite(yMax)) {
            yMin = 0;
            yMax = 1;
            // console.warn('Zero or infinite y-range.');
        }

        this.domainX = xData;
        this.domainY = [yMin, yMax];

        const chart = this.chart;
        if (chart) {
            chart.updateAxes();
        }

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
        const halfBandwidth = xScale.bandwidth! / 2;
        const xData = this.domainX;
        const yData = this.yData;
        const n = xData.length;
        const linePath = this.linePath;
        const path = linePath.path;

        path.clear();
        for (let i = 0; i < n; i++) {
            const xDatum = xData[i];
            const yDatum = yData[i];
            const x = xScale.convert(xDatum) + halfBandwidth;
            const y = yScale.convert(yDatum);

            if (!i) {
                path.moveTo(x, y);
            } else {
                path.lineTo(x, y);
            }
        }

        linePath.strokeStyle = this.color;
        linePath.lineWidth = this.lineWidth;
    }

    getDomainX(): string[] {
        return this.domainX;
    }

    getDomainY(): number[] {
        return this.domainY;
    }
}
