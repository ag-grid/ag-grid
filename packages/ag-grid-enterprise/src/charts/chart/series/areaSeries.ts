import { Group } from "../../scene/group";
import { Selection } from "../../scene/selection";
import { CartesianChart } from "../cartesianChart";
import { DropShadow } from "../../scene/dropShadow";
import { Series, SeriesNodeDatum } from "./series";
import ContinuousScale from "../../scale/continuousScale";
import { PointerEvents } from "../../scene/node";
import { toFixed } from "../../util/number";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
import { Path } from "../../scene/shape/path";
import { Arc, ArcType } from "../../scene/shape/arc";
import palette from "../palettes";
import { extent } from "../../util/array";

interface MarkerSelectionDatum extends SeriesNodeDatum {
    yField: string,
    yValue: number,
    x: number,
    y: number,
    radius: number,
    fill?: string,
    text?: string
}

export interface AreaTooltipRendererParams {
    datum: any,
    xField: string,
    yField: string,
    title?: string,
    color?: string
}

export class AreaSeries extends Series<CartesianChart> {

    static className = 'AreaSeries';

    tooltipRenderer?: (params: AreaTooltipRendererParams) => string;

    private areaGroup = this.group.appendChild(new Group);
    private markerGroup = this.group.appendChild(new Group);

    private areaSelection: Selection<Path, Group, any, any> = Selection.select(this.areaGroup).selectAll<Path>();
    private markerSelection: Selection<Arc, Group, any, any> = Selection.select(this.markerGroup).selectAll<Arc>();

    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yFields} setter.
     */
    protected readonly enabled = new Map<string, boolean>();

    private _fills: string[] = palette.fills;
    set fills(values: string[]) {
        this._fills = values;
        this.scheduleData();
    }
    get fills(): string[] {
        return this._fills;
    }

    private _stroke: string = 'white';
    set stroke(value: string) {
        this._stroke = value;
        this.scheduleData();
    }
    get stroke(): string {
        return this._stroke;
    }

    private xData: string[] = [];
    private yData: number[][] = [];
    private ySums: number[] = [];
    private domainX: any[] = [];
    private domainY: any[] = [];

    set chart(chart: CartesianChart | undefined) {
        if (this._chart !== chart) {
            this._chart = chart;
            this.scheduleData();
        }
    }
    get chart(): CartesianChart | undefined {
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

    protected _yFields: string[] = [];
    set yFields(values: string[]) {
        this._yFields = values;

        const enabled = this.enabled;
        enabled.clear();
        values.forEach(field => enabled.set(field, true));

        this.yData = [];

        this.scheduleData();
    }
    get yFields(): string[] {
        return this._yFields;
    }

    protected _yFieldNames: string[] = [];
    set yFieldNames(values: string[]) {
        this._yFieldNames = values;
        this.update();
    }
    get yFieldNames(): string[] {
        return this._yFieldNames;
    }

    private _stacked: boolean = true;
    set stacked(value: boolean) {
        if (this._stacked !== value) {
            this._stacked = value;
            this.scheduleData();
        }
    }
    get stacked(): boolean {
        return this._stacked;
    }

    private _normalizedTo: number = NaN;
    set normalizedTo(value: number) {
        if (value === 0) {
            value = NaN;
        }
        const absValue = Math.abs(value);
        if (this._normalizedTo !== absValue) {
            this._normalizedTo = absValue;
            this.scheduleData();
        }
    }
    get normalizedTo(): number {
        return this._normalizedTo;
    }

    private _strokeWidth: number = 1;
    set strokeWidth(value: number) {
        if (this._strokeWidth !== value) {
            this._strokeWidth = value;
            this.update();
        }
    }
    get strokeWidth(): number {
        return this._strokeWidth;
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

    private _shadow: DropShadow | undefined = undefined;
    set shadow(value: DropShadow | undefined) {
        if (this._shadow !== value) {
            this._shadow = value;
            this.update();
        }
    }
    get shadow(): DropShadow | undefined {
        return this._shadow;
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

    processData(): boolean {
        const chart = this.chart;
        const xField = this.xField;
        const yFields = this.yFields;
        let data = this.data as any[];

        if (!(chart && chart.xAxis && chart.yAxis)) {
            return false;
        }

        if (!(xField && yFields.length)) {
            this._data = data = [];
        }

        // If the data is an array of rows like so:
        //
        // [{
        //   xField: 'Jan',
        //   yField1: 5,
        //   yField2: 7,
        //   yField3: -9,
        // }, {
        //   xField: 'Feb',
        //   yField1: 10,
        //   yField2: -15,
        //   yField3: 20
        // }]
        //
        const enabled = this.enabled;
        const normalizedTo = this.normalizedTo;
        const continuousX = chart.xAxis.scale instanceof ContinuousScale;
        const xData: string[] = this.xData = data.map(datum => datum[xField]);
        const ySums: number[] = this.ySums = []; // used for normalization of stacked areas
        const yData: number[][] = this.yData = data.map((datum, xIndex) => {
            const values: number[] = [];
            let ySum = 0;
            yFields.forEach(field => {
                let value = datum[field];
                if (!isFinite(value) || !enabled.get(field)) {
                    value = 0;
                }
                if (value < 0) {
                    value = Math.abs(value);
                }
                if (value > 0) {
                    ySum += value;
                }
                values.push(value);
            });
            ySums[xIndex] = ySum;
            return values;
        });

        // xData: ['Jan', 'Feb']
        //
        // yData: [
        //   [5, 7, -9],
        //   [10, -15, 20]
        // ]

        let yMin: number = Infinity;
        let yMax: number = -Infinity;

        if (this.stacked && isFinite(normalizedTo)) {
            yMin = 0;
            yMax = normalizedTo;
            yData.forEach((stack, i) => {
                const ySum = ySums[i];
                stack.forEach((y, j) => stack[j] = y / ySum * normalizedTo);
            });
        } else {
            // Find the height of each stack in the positive and negative directions,
            // then find the tallest stacks in both directions.
            yMin = Math.min(0, ...yData.map(stackValues => {
                let min = 0;
                stackValues.forEach(value => {
                    if (value < 0) {
                        min -= value;
                    }
                });
                return min;
            }));
            yMax = Math.max(...yData.map(stackValues => {
                let max = 0;
                stackValues.forEach(value => {
                    if (value > 0) {
                        max += value;
                    }
                });
                return max;
            }));
        }

        if (yMin === yMax || !isFinite(yMin) || !isFinite(yMax)) {
            yMin = 0;
            yMax = 1;
            // console.warn('Zero or infinite y-range.');
        }

        const domainX = continuousX ? extent(xData) : xData;
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
        this.domainX = domainX;
        this.domainY = [yMin, yMax];

        if (chart) {
            chart.updateAxes();
        }

        return true;
    }

    getDomainX(): string[] {
        return this.xData;
    }

    getDomainY(): number[] {
        return this.domainY;
    }

    update(): void {
        const chart = this.chart;
        const visible = this.group.visible = this.visible;

        if (!chart || !visible || chart.dataPending || chart.layoutPending || !(chart.xAxis && chart.yAxis)) {
            return;
        }

        const n = this.data.length;
        const xAxis = chart.xAxis;
        const yAxis = chart.yAxis;
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;
        const yFields = this.yFields;
        const fills = this.fills;
        const stroke = this.stroke;
        const strokeWidth = this.strokeWidth;
        const data = this.data;
        const xData = this.xData;
        const yData = this.yData;
        const markerSize = this.markerSize;

        const areaSelectionData: {x: number, y: number}[][] = [];
        const markerSelectionData: MarkerSelectionDatum[] = [];

        const last = n * 2 - 1;
        for (let i = 0; i < n; i++) {
            const xDatum = xData[i];
            const yDatum = yData[i];
            const x = xScale.convert(xDatum) + xOffset;

            let yFieldIndex = 0;
            yDatum.reduce((prev, curr) => {
                const y = yScale.convert(prev + curr) + yOffset;
                const yField = yFields[yFieldIndex];
                const seriesDatum = data[i];
                const yValue = seriesDatum[yField];

                markerSelectionData.push({
                    seriesDatum,
                    yValue,
                    yField,
                    x,
                    y,
                    fill: fills[yFieldIndex % fills.length],
                    radius: markerSize / 2,
                    text: this.yFieldNames[yFieldIndex]
                });

                const areaDatum = areaSelectionData[yFieldIndex] || (areaSelectionData[yFieldIndex] = []);
                areaDatum[i] = {
                    x,
                    y
                };
                areaDatum[last - i] = {
                    x,
                    y: yScale.convert(prev) + yOffset // bottom y
                };

                yFieldIndex++;
                return curr + prev;
            }, 0);
        }

        const updateAreas = this.areaSelection.setData(areaSelectionData);
        const updateMarkers = this.markerSelection.setData(markerSelectionData);
        updateAreas.exit.remove();
        updateMarkers.exit.remove();

        const enterAreas = updateAreas.enter.append(Path)
            .each(path => path.pointerEvents = PointerEvents.None);
        const enterMarkers = updateMarkers.enter.append(Arc)
            .each(arc => arc.type = ArcType.Chord);

        const highlightedNode = this.highlightedNode;
        const areaSelection = updateAreas.merge(enterAreas);
        const markerSelection = updateMarkers.merge(enterMarkers);

        areaSelection.each((shape, datum, index) => {
            const path = shape.path;

            shape.fill = fills[index % fills.length];
            shape.stroke = stroke;
            shape.strokeWidth = strokeWidth;

            path.clear();

            const n = datum.length;
            for (let i = 0; i < n; i++) {
                const {x, y} = datum[i];
                if (!i) {
                    path.moveTo(x, y);
                } else {
                    path.lineTo(x, y);
                }
            }
            path.closePath();
        });

        markerSelection.each((arc, datum) => {
            arc.centerX = datum.x;
            arc.centerY = datum.y;
            arc.radiusX = datum.radius;
            arc.radiusY = datum.radius;
            arc.fill = arc === highlightedNode && this.highlightStyle.fill !== undefined
                ? this.highlightStyle.fill
                : datum.fill;
            arc.stroke = arc === highlightedNode && this.highlightStyle.stroke !== undefined
                ? this.highlightStyle.stroke
                : stroke;
            arc.strokeWidth = strokeWidth;
            arc.visible = datum.radius > 0 && !!this.enabled.get(datum.yField);
        });

        this.areaSelection = areaSelection;
        this.markerSelection = markerSelection;
    }

    getTooltipHtml(nodeDatum: MarkerSelectionDatum): string {
        let html: string = '';
        if (this.tooltipEnabled) {
            const xField = this.xField;
            const yField = nodeDatum.yField;
            const yFields = this.yFields;
            const yFieldIndex = yFields.indexOf(yField);
            const color = this.fills[yFieldIndex % this.fills.length];

            let title = nodeDatum.text;
            if (this.tooltipRenderer && xField) {
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
        }
        return html;
    }

    listSeriesItems(data: LegendDatum[]): void {
        if (this.data.length && this.xField && this.yFields.length) {
            const fills = this.fills;
            const stroke = this.stroke;
            const id = this.id;

            this.yFields.forEach((yField, index) => {
                data.push({
                    id,
                    itemId: yField,
                    enabled: this.enabled.get(yField) || false,
                    label: {
                        text: this.yFieldNames[index] || this.yFields[index]
                    },
                    marker: {
                        fill: fills[index % fills.length],
                        stroke: stroke
                    }
                });
            });
        }
    }

    toggleSeriesItem(itemId: string, enabled: boolean): void {
        this.enabled.set(itemId, enabled);
        this.scheduleData();
    }
}
