import { Group } from "../../scene/group";
import { Selection } from "../../scene/selection";
import { CartesianChart } from "../cartesianChart";
import { DropShadow } from "../../scene/dropShadow";
import { Series, SeriesNodeDatum, CartesianTooltipRendererParams as AreaTooltipRendererParams } from "./series";
import ContinuousScale from "../../scale/continuousScale";
import { PointerEvents } from "../../scene/node";
import { sumPositiveValues } from "../../util/array";
import { toFixed } from "../../util/number";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
import { Path } from "../../scene/shape/path";
import palette from "../palettes";
import { numericExtent } from "../../util/array";
import { Marker } from "../marker/marker";

interface AreaSelectionDatum {
    yKey: string;
    points: { x: number, y: number }[];
}

interface MarkerSelectionDatum extends SeriesNodeDatum {
    yKey: string;
    yValue: number;
    x: number;
    y: number;
    size: number;
    fill?: string;
    stroke?: string;
    text?: string;
}

export { AreaTooltipRendererParams };

export class AreaSeries extends Series<CartesianChart> {
    static className = 'AreaSeries';

    tooltipRenderer?: (params: AreaTooltipRendererParams) => string;

    private areaGroup = this.group.appendChild(new Group);
    private strokeGroup = this.group.appendChild(new Group);
    private markerGroup = this.group.appendChild(new Group);

    private areaSelection: Selection<Path, Group, AreaSelectionDatum, any> = Selection.select(this.areaGroup).selectAll<Path>();
    private strokeSelection: Selection<Path, Group, AreaSelectionDatum, any> = Selection.select(this.strokeGroup).selectAll<Path>();
    private markerSelection: Selection<Marker, Group, any, any> = Selection.select(this.markerGroup).selectAll<Marker>();

    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yKeys} setter.
     */
    private readonly yKeyEnabled = new Map<string, boolean>();

    constructor() {
        super();

        this.marker.onChange = this.update.bind(this);
        this.marker.onTypeChange = this.onMarkerTypeChange.bind(this);
    }

    onMarkerTypeChange() {
        this.markerSelection = this.markerSelection.setData([]);
        this.markerSelection.exit.remove();
        this.update();
    }

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
    private domainY: any[] = [];

    set chart(chart: CartesianChart | undefined) {
        if (this._chart !== chart) {
            this._chart = chart;
            this.scheduleData();
        }
    }
    get chart(): CartesianChart | undefined {
        return this._chart;
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

    protected _xName: string = '';
    set xName(value: string) {
        this._xName = value;
        this.update();
    }
    get xName(): string {
        return this._xName;
    }

    protected _yKeys: string[] = [];
    set yKeys(values: string[]) {
        this._yKeys = values;
        this.yData = [];

        const { yKeyEnabled } = this;
        yKeyEnabled.clear();
        values.forEach(key => yKeyEnabled.set(key, true));

        this.scheduleData();
    }
    get yKeys(): string[] {
        return this._yKeys;
    }

    protected _yNames: string[] = [];
    set yNames(values: string[]) {
        this._yNames = values;
        this.update();
    }
    get yNames(): string[] {
        return this._yNames;
    }

    private _normalizedTo?: number;
    set normalizedTo(value: number | undefined) {
        const absValue = value ? Math.abs(value) : undefined;

        if (this._normalizedTo !== absValue) {
            this._normalizedTo = absValue;
            this.scheduleData();
        }
    }
    get normalizedTo(): number | undefined {
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

    private _shadow?: DropShadow;
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

    private highlightedNode?: Marker;

    highlightNode(node: Shape) {
        if (!(node instanceof Marker)) {
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
        const { chart, xKey, yKeys } = this;

        if (!(chart && chart.xAxis && chart.yAxis)) {
            return false;
        }

        if (!(xKey && yKeys.length)) {
            this._data = [];
        }

        // If the data is an array of rows like so:
        //
        // [{
        //   xKy: 'Jan',
        //   yKey1: 5,
        //   yKey2: 7,
        //   yKey3: -9,
        // }, {
        //   xKey: 'Feb',
        //   yKey1: 10,
        //   yKey2: -15,
        //   yKey3: 20
        // }]
        //
        const { yKeyEnabled, data } = this;

        this.xData = data.map(datum => datum[xKey]);

        this.yData = data.map(datum => yKeys.map(yKey => {
            const value = datum[yKey];

            return isFinite(value) && yKeyEnabled.get(yKey) ? Math.abs(value) : 0;
        }));

        // xData: ['Jan', 'Feb']
        //
        // yData: [
        //   [5, 7, -9],
        //   [10, -15, 20]
        // ]

        const ySums = this.yData.map(values => sumPositiveValues(values)); // used for normalization
        const { xData, yData, normalizedTo } = this;
        const isContinuousX = chart.xAxis.scale instanceof ContinuousScale;
        const domainX = isContinuousX ? (numericExtent(xData) || [0, 1]) : xData;

        if (isContinuousX) {
            const [min, max] = domainX as number[];

            if (min === max) {
                domainX[0] = min - 1;
                domainX[1] = max + 1;
            }
        }

        let yMin: number = Infinity;
        let yMax: number = -Infinity;

        if (normalizedTo && isFinite(normalizedTo)) {
            yMin = 0;
            yMax = normalizedTo;
            yData.forEach((stack, i) => stack.forEach((y, j) => stack[j] = y / ySums[i] * normalizedTo));
        } else {
            // Find the height of each stack in the positive and negative directions,
            // then find the tallest stacks in both directions.
            yMin = Math.min(0, ...yData.map(values => values.reduce((min, value) => value < 0 ? min - value : min, 0)));
            yMax = Math.max(...yData.map(values => values.reduce((max, value) => value > 0 ? max + value : max, 0)));
        }

        if (yMin === yMax || !isFinite(yMin) || !isFinite(yMax)) {
            yMin = 0;
            yMax = 1;
            // console.warn('Zero or infinite y-range.');
        }

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

        const { areaSelectionData, markerSelectionData } = this.generateSelectionData();

        this.updateAreaSelection(areaSelectionData);
        this.updateStrokeSelection(areaSelectionData);
        this.updateMarkerSelection(markerSelectionData);
    }

    private generateSelectionData(): { areaSelectionData: AreaSelectionDatum[], markerSelectionData: MarkerSelectionDatum[] } {
        const {
            yKeys,
            fills,
            strokes,
            data,
            xData,
            yData,
            marker,
            chart,
        } = this;

        const { xAxis: { scale: xScale }, yAxis: { scale: yScale } } = chart!;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;
        const areaSelectionData: AreaSelectionDatum[] = [];
        const markerSelectionData: MarkerSelectionDatum[] = [];
        const last = xData.length * 2 - 1;
        const markerSize = this.marker.size;

        xData.forEach((xDatum, i) => {
            const yDatum = yData[i];
            const seriesDatum = data[i];
            const x = xScale.convert(xDatum) + xOffset;

            let prev = 0;

            yDatum.forEach((curr, j) => {
                const y = yScale.convert(prev + curr) + yOffset;
                const yKey = yKeys[j];
                const yValue = seriesDatum[yKey];

                if (marker) {
                    markerSelectionData.push({
                        seriesDatum,
                        yValue,
                        yKey,
                        x,
                        y,
                        fill: fills[j % fills.length],
                        stroke: strokes[j % strokes.length],
                        size: markerSize,
                        text: this.yNames[j]
                    });
                }

                const areaDatum = areaSelectionData[j] || (areaSelectionData[j] = { yKey, points: [] });
                const areaPoints = areaDatum.points;

                areaPoints[i] = { x, y };
                areaPoints[last - i] = { x, y: yScale.convert(prev) + yOffset }; // bottom y

                prev += curr;
            });
        });

        return { areaSelectionData, markerSelectionData };
    }

    private updateAreaSelection(areaSelectionData: AreaSelectionDatum[]): void {
        const { fills, fillOpacity, yKeyEnabled, shadow } = this;
        const updateAreas = this.areaSelection.setData(areaSelectionData);

        updateAreas.exit.remove();

        const enterAreas = updateAreas.enter.append(Path)
            .each(path => {
                path.stroke = undefined;
                path.pointerEvents = PointerEvents.None;
            });

        const areaSelection = updateAreas.merge(enterAreas);

        areaSelection.each((shape, datum, index) => {
            const path = shape.path;

            shape.fill = fills[index % fills.length];
            shape.fillOpacity = fillOpacity;
            shape.fillShadow = shadow;
            shape.visible = !!yKeyEnabled.get(datum.yKey);

            path.clear();

            const { points } = datum;

            points.forEach(({ x, y }, i) => {
                if (i > 0) {
                    path.lineTo(x, y);
                } else {
                    path.moveTo(x, y);
                }
            });

            path.closePath();
        });

        this.areaSelection = areaSelection;
    }

    private updateStrokeSelection(areaSelectionData: AreaSelectionDatum[]): void {
        const { strokes, strokeWidth, strokeOpacity, data, yKeyEnabled } = this;
        const updateStrokes = this.strokeSelection.setData(areaSelectionData);

        updateStrokes.exit.remove();

        const enterStrokes = updateStrokes.enter.append(Path)
            .each(path => {
                path.fill = undefined;
                path.lineJoin = path.lineCap = 'round';
                path.pointerEvents = PointerEvents.None;
            });

        const strokeSelection = updateStrokes.merge(enterStrokes);

        strokeSelection.each((shape, datum, index) => {
            const path = shape.path;

            shape.stroke = strokes[index % strokes.length];
            shape.strokeWidth = strokeWidth;
            shape.visible = !!yKeyEnabled.get(datum.yKey);
            shape.strokeOpacity = strokeOpacity;

            path.clear();

            const points = datum.points;

            // The stroke doesn't go all the way around the fill, only on top,
            // that's why we iterate until `data.length` (rather than `points.length`) and stop.
            for (let i = 0; i < data.length; i++) {
                const { x, y } = points[i];

                if (i > 0) {
                    path.lineTo(x, y);
                } else {
                    path.moveTo(x, y);
                }
            }
        });

        this.strokeSelection = strokeSelection;
    }

    private updateMarkerSelection(markerSelectionData: MarkerSelectionDatum[]): void {
        const { marker } = this;
        const Marker = marker.type;

        if (!Marker) {
            return;
        }

        const { yKeyEnabled, highlightedNode, highlightStyle: { fill, stroke } } = this;
        const updateMarkers = this.markerSelection.setData(markerSelectionData);

        updateMarkers.exit.remove();

        const enterMarkers = updateMarkers.enter.append(Marker);
        const markerSelection = updateMarkers.merge(enterMarkers);

        markerSelection.each((node, datum) => {
            node.translationX = datum.x;
            node.translationY = datum.y;
            node.size = datum.size;
            node.fill = node === highlightedNode && fill !== undefined ? fill : datum.fill;
            node.stroke = node === highlightedNode && stroke !== undefined ? stroke : datum.stroke;
            node.fillOpacity = marker.fillOpacity;
            node.strokeOpacity = marker.strokeOpacity;
            node.strokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : this.strokeWidth;
            node.visible = marker.enabled && datum.size > 0 && !!yKeyEnabled.get(datum.yKey);
        });

        this.markerSelection = markerSelection;
    }

    getTooltipHtml(nodeDatum: MarkerSelectionDatum): string {
        const { xKey } = this;
        const { yKey } = nodeDatum;

        if (!xKey || !yKey) {
            return '';
        }

        const { xName, yKeys, yNames, fills, tooltipRenderer } = this;
        const { text } = nodeDatum;
        const yKeyIndex = yKeys.indexOf(yKey);
        const yName = yNames[yKeyIndex];
        const color = fills[yKeyIndex % fills.length];

        if (tooltipRenderer) {
            return tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                xKey,
                xName,
                yKey,
                yName,
                title: text,
                color,
            });
        } else {
            const titleStyle = `style="color: white; background-color: ${color}"`;
            const title = text ? `<div class="title" ${titleStyle}>${text}</div>` : '';
            const seriesDatum = nodeDatum.seriesDatum;
            const xValue = seriesDatum[xKey];
            const yValue = seriesDatum[yKey];
            const xString = typeof xValue === 'number' ? toFixed(xValue) : String(xValue);
            const yString = typeof yValue === 'number' ? toFixed(yValue) : String(yValue);

            return `${title}<div class="content">${xString}: ${yString}</div>`;
        }
    }

    listSeriesItems(data: LegendDatum[]): void {
        if (this.data.length && this.xKey && this.yKeys.length) {
            const { fills, strokes, id } = this;

            this.yKeys.forEach((yKey, index) => {
                data.push({
                    id,
                    itemId: yKey,
                    enabled: this.yKeyEnabled.get(yKey) || false,
                    label: {
                        text: this.yNames[index] || this.yKeys[index]
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
        this.yKeyEnabled.set(itemId, enabled);
        this.scheduleData();
    }
}
