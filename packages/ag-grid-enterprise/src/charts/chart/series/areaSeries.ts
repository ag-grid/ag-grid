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
import { numericExtent } from "../../util/array";

interface AreaSelectionDatum {
    yField: string;
    points: {x: number, y: number}[];
}

interface MarkerSelectionDatum extends SeriesNodeDatum {
    yField: string;
    yValue: number;
    x: number;
    y: number;
    radius: number;
    fill?: string;
    stroke?: string;
    text?: string;
}

export interface AreaTooltipRendererParams {
    datum: any;
    xField: string;
    yField: string;
    title?: string;
    color?: string;
}

export class AreaSeries extends Series<CartesianChart> {

    static className = 'AreaSeries';

    tooltipRenderer?: (params: AreaTooltipRendererParams) => string;

    private areaGroup = this.group.appendChild(new Group);
    private strokeGroup = this.group.appendChild(new Group);
    private markerGroup = this.group.appendChild(new Group);

    private areaSelection: Selection<Path, Group, AreaSelectionDatum, any> = Selection.select(this.areaGroup).selectAll<Path>();
    private strokeSelection: Selection<Path, Group, AreaSelectionDatum, any> = Selection.select(this.strokeGroup).selectAll<Path>();
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

    private _strokes: string[] = ['white'];
    set strokes(values: string[]) {
        this._strokes = values;
        this.scheduleData();
    }
    get strokes(): string[] {
        return this._strokes;
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
        const ySums: number[] = this.ySums = []; // used for normalization
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

        if (isFinite(normalizedTo)) {
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

        const domainX = continuousX ? (numericExtent(xData) || [0, 1]) : xData;
        if (continuousX) {
            const [min, max] = domainX as number[];
            if (min === max) {
                domainX[0] = min - 1;
                domainX[1] = max + 1;
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

        const xCount = this.data.length;
        const xAxis = chart.xAxis;
        const yAxis = chart.yAxis;
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;
        const yFields = this.yFields;
        const enabled = this.enabled;
        const fills = this.fills;
        const strokes = this.strokes;
        const fillOpacity = this.fillOpacity;
        const strokeOpacity = this.strokeOpacity;
        const strokeWidth = this.strokeWidth;
        const data = this.data;
        const xData = this.xData;
        const yData = this.yData;
        const marker = this.marker;
        const markerSize = this.markerSize;
        const markerStrokeWidth = this.markerStrokeWidth;

        const areaSelectionData: AreaSelectionDatum[] = [];
        const markerSelectionData: MarkerSelectionDatum[] = [];

        const last = xCount * 2 - 1;
        for (let i = 0; i < xCount; i++) {
            const xDatum = xData[i];
            const yDatum = yData[i];
            const yCount = yDatum.length;
            const x = xScale.convert(xDatum) + xOffset;

            let prev = 0;
            let curr: number;
            for (let j = 0; j < yCount; j++) {
                curr = yDatum[j];

                const y = yScale.convert(prev + curr) + yOffset;
                const yField = yFields[j];
                const seriesDatum = data[i];
                const yValue = seriesDatum[yField];

                if (marker) {
                    markerSelectionData.push({
                        seriesDatum,
                        yValue,
                        yField,
                        x,
                        y,
                        fill: fills[j % fills.length],
                        stroke: strokes[j % strokes.length],
                        radius: markerSize / 2,
                        text: this.yFieldNames[j]
                    });
                }

                const areaDatum = areaSelectionData[j] || (areaSelectionData[j] = {
                    yField,
                    points: []
                });
                const areaPoints = areaDatum.points;
                areaPoints[i] = {
                    x,
                    y
                };
                areaPoints[last - i] = {
                    x,
                    y: yScale.convert(prev) + yOffset // bottom y
                };

                prev += curr;
            }
        }

        const updateAreas = this.areaSelection.setData(areaSelectionData);
        const updateStrokes = this.strokeSelection.setData(areaSelectionData);
        const updateMarkers = this.markerSelection.setData(markerSelectionData);
        updateAreas.exit.remove();
        updateStrokes.exit.remove();
        updateMarkers.exit.remove();

        const enterAreas = updateAreas.enter.append(Path)
            .each(path => {
                path.stroke = undefined;
                path.pointerEvents = PointerEvents.None;
            });
        const enterStrokes = updateStrokes.enter.append(Path)
            .each(path => {
                path.fill = undefined;
                path.lineJoin = 'round';
                path.lineCap = 'round';
                path.pointerEvents = PointerEvents.None;
            });
        const enterMarkers = updateMarkers.enter.append(Arc)
            .each(arc => arc.type = ArcType.Chord);

        const highlightedNode = this.highlightedNode;
        const areaSelection = updateAreas.merge(enterAreas);
        const strokeSelection = updateStrokes.merge(enterStrokes);
        const markerSelection = updateMarkers.merge(enterMarkers);

        areaSelection.each((shape, datum, index) => {
            const path = shape.path;

            shape.fill = fills[index % fills.length];
            shape.fillOpacity = fillOpacity;
            shape.fillShadow = this.shadow;
            shape.visible = !!enabled.get(datum.yField);

            path.clear();

            const points = datum.points;
            const n = points.length;
            for (let i = 0; i < n; i++) {
                const {x, y} = points[i];
                if (!i) {
                    path.moveTo(x, y);
                } else {
                    path.lineTo(x, y);
                }
            }
            path.closePath();
        });

        strokeSelection.each((shape, datum, index) => {
            const path = shape.path;

            shape.stroke = strokes[index % strokes.length];
            shape.strokeWidth = strokeWidth;
            shape.visible = !!enabled.get(datum.yField);
            shape.strokeOpacity = strokeOpacity;

            path.clear();

            const points = datum.points;
            // The stroke doesn't go all the way around the fill, only on top,
            // that's why we iterate until `xCount` (rather than `points.length`) and stop.
            for (let i = 0; i < xCount; i++) {
                const {x, y} = points[i];
                if (!i) {
                    path.moveTo(x, y);
                } else {
                    path.lineTo(x, y);
                }
            }
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
                : datum.stroke;
            arc.strokeWidth = markerStrokeWidth;
            arc.visible = datum.radius > 0 && !!enabled.get(datum.yField);
        });

        this.areaSelection = areaSelection;
        this.strokeSelection = strokeSelection;
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
            const strokes = this.strokes;
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
                        stroke: strokes[index % strokes.length]
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
