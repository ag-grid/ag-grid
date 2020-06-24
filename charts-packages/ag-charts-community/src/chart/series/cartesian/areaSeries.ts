import { Group } from "../../../scene/group";
import { Selection } from "../../../scene/selection";
import { DropShadow } from "../../../scene/dropShadow";
import { SeriesNodeDatum, CartesianTooltipRendererParams as AreaTooltipRendererParams, HighlightStyle } from "../series";
import { PointerEvents } from "../../../scene/node";
import { LegendDatum } from "../../legend";
import { Path } from "../../../scene/shape/path";
import { Marker } from "../../marker/marker";
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesMarkerFormat } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { getMarker } from "../../marker/util";
import { Chart } from "../../chart";
import { findLargestMinMax, findMinMax } from "../../../util/array";
import { toFixed } from "../../../util/number";
import { equal } from "../../../util/equal";
import { reactive, TypedEvent } from "../../../util/observable";

interface AreaSelectionDatum {
    yKey: string;
    points: { x: number, y: number }[];
}

export interface AreaSeriesNodeClickEvent extends TypedEvent {
    type: 'nodeClick';
    series: AreaSeries;
    datum: any;
    xKey: string;
    yKey: string;
}

interface MarkerSelectionDatum extends SeriesNodeDatum {
    point: {
        x: number;
        y: number;
    };
    fill?: string;
    stroke?: string;
    yKey: string;
    yValue: number;
}

export { AreaTooltipRendererParams };

export class AreaSeries extends CartesianSeries {

    static className = 'AreaSeries';
    static type = 'area';

    tooltipRenderer?: (params: AreaTooltipRendererParams) => string;

    private areaGroup = this.group.appendChild(new Group);
    private strokeGroup = this.group.appendChild(new Group);
    private markerGroup = this.group.appendChild(new Group);

    private areaSelection: Selection<Path, Group, AreaSelectionDatum, any> = Selection.select(this.areaGroup).selectAll<Path>();
    private strokeSelection: Selection<Path, Group, AreaSelectionDatum, any> = Selection.select(this.strokeGroup).selectAll<Path>();
    private markerSelection: Selection<Marker, Group, any, any> = Selection.select(this.markerGroup).selectAll<Marker>();
    private markerSelectionData: MarkerSelectionDatum[] = [];

    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yKeys} setter.
     */
    private readonly seriesItemEnabled = new Map<string, boolean>();

    private xData: string[] = [];
    private yData: number[][] = [];
    private yDomain: any[] = [];

    directionKeys = {
        x: ['xKey'],
        y: ['yKeys']
    };

    readonly marker = new CartesianSeriesMarker();

    @reactive('dataChange') fills: string[] = [];
    @reactive('dataChange') strokes: string[] = [];

    @reactive('update') fillOpacity = 1;
    @reactive('update') strokeOpacity = 1;

    constructor() {
        super();

        this.addEventListener('update', this.update);

        this.marker.enabled = false;
        this.marker.addPropertyListener('shape', this.onMarkerShapeChange, this);
        this.marker.addEventListener('change', this.update, this);
    }

    onMarkerShapeChange() {
        this.markerSelection = this.markerSelection.setData([]);
        this.markerSelection.exit.remove();
        this.update();

        this.fireEvent({type: 'legendChange'});
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

    protected _yKeys: string[] = [];
    set yKeys(values: string[]) {
        if (!equal(this._yKeys, values)) {
            this._yKeys = values;
            this.yData = [];

            const { seriesItemEnabled } = this;
            seriesItemEnabled.clear();
            values.forEach(key => seriesItemEnabled.set(key, true));

            this.scheduleData();
        }
    }
    get yKeys(): string[] {
        return this._yKeys;
    }

    get colorCount(): number {
        return this.yKeys.length;
    }

    setColors(fills: string[], strokes: string[]) {
        this.fills = fills;
        this.strokes = strokes;
    }

    @reactive('update') yNames: string[] = [];

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

    @reactive('update') strokeWidth = 2;
    @reactive('update') shadow?: DropShadow;

    highlightStyle: HighlightStyle = { fill: 'yellow' };

    protected highlightedDatum?: MarkerSelectionDatum;

    onHighlightChange() {
        this.updateMarkerNodes();
    }

    processData(): boolean {
        const { xKey, yKeys, seriesItemEnabled } = this;
        const data = xKey && yKeys.length && this.data ? this.data : [];

        // if (!(chart && chart.xAxis && chart.yAxis)) {
        //     return false;
        // }

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

        let keysFound = true; // only warn once
        this.xData = data.map(datum => {
            if (keysFound && !(xKey in datum)) {
                keysFound = false;
                console.warn(`The key '${xKey}' was not found in the data: `, datum);
            }
            return datum[xKey];
        });

        this.yData = data.map(datum => yKeys.map(yKey => {
            if (keysFound && !(yKey in datum)) {
                keysFound = false;
                console.warn(`The key '${yKey}' was not found in the data: `, datum);
            }
            const value = datum[yKey];

            return isFinite(value) && seriesItemEnabled.get(yKey) ? value : 0;
        }));

        // xData: ['Jan', 'Feb']
        //
        // yData: [
        //   [5, 7, -9],
        //   [10, -15, 20]
        // ]

        const { yData, normalizedTo } = this;

        const yMinMax = yData.map(values => findMinMax(values)); // used for normalization
        const yLargestMinMax = findLargestMinMax(yMinMax);

        let yMin: number;
        let yMax: number;

        if (normalizedTo && isFinite(normalizedTo)) {
            yMin = yLargestMinMax.min < 0 ? -normalizedTo : 0;
            yMax = normalizedTo;
            yData.forEach((stack, i) => stack.forEach((y, j) => {
                if (y < 0) {
                    stack[j] = -y / yMinMax[i].min * normalizedTo;
                } else {
                    stack[j] = y / yMinMax[i].max * normalizedTo;
                }
            }));
        } else {
            yMin = yLargestMinMax.min;
            yMax = yLargestMinMax.max;
        }

        if (yMin === 0 && yMax === 0) {
            yMax = 1;
        }

        this.yDomain = this.fixNumericExtent([yMin, yMax], 'y');

        this.fireEvent({type: 'dataProcessed'});

        return true;
    }

    getDomain(direction: ChartAxisDirection): any[] {
        if (direction === ChartAxisDirection.X) {
            return this.xData;
        } else {
            return this.yDomain;
        }
    }

    update(): void {
        const { visible, chart, xAxis, yAxis, xData, yData } = this;

        this.group.visible = visible && !!(xData.length && yData.length);

        if (!xAxis || !yAxis || !visible || !chart || chart.layoutPending || chart.dataPending || !xData.length || !yData.length) {
            return;
        }

        const { areaSelectionData, markerSelectionData } = this.generateSelectionData();

        this.updateAreaSelection(areaSelectionData);
        this.updateStrokeSelection(areaSelectionData);
        this.updateMarkerSelection(markerSelectionData);
        this.updateMarkerNodes();
        this.markerSelectionData = markerSelectionData;
    }

    private generateSelectionData(): { areaSelectionData: AreaSelectionDatum[], markerSelectionData: MarkerSelectionDatum[] } {
        const {
            yKeys,
            data,
            xData,
            yData,
            marker,
            fills,
            strokes,
            xAxis: { scale: xScale }, yAxis: { scale: yScale }
        } = this;

        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;
        const areaSelectionData: AreaSelectionDatum[] = [];
        const markerSelectionData: MarkerSelectionDatum[] = [];
        const last = xData.length * 2 - 1;

        xData.forEach((xDatum, i) => {
            const yDatum = yData[i];
            const seriesDatum = data[i];
            const x = xScale.convert(xDatum) + xOffset;

            let prevMin = 0;
            let prevMax = 0;

            yDatum.forEach((curr, j) => {
                const prev = curr < 0 ? prevMin : prevMax;
                const y = yScale.convert(prev + curr) + yOffset;
                const yKey = yKeys[j];
                const yValue = seriesDatum[yKey];

                if (marker) {
                    markerSelectionData.push({
                        series: this,
                        seriesDatum,
                        yValue,
                        yKey,
                        point: { x, y },
                        fill: fills[j % fills.length],
                        stroke: strokes[j % strokes.length]
                    });
                }

                const areaDatum = areaSelectionData[j] || (areaSelectionData[j] = { yKey, points: [] });
                const areaPoints = areaDatum.points;

                areaPoints[i] = { x, y };
                areaPoints[last - i] = { x, y: yScale.convert(prev) + yOffset }; // bottom y

                if (curr < 0) {
                    prevMin += curr;
                } else {
                    prevMax += curr;
                }
            });
        });

        return { areaSelectionData, markerSelectionData };
    }

    private updateAreaSelection(areaSelectionData: AreaSelectionDatum[]): void {
        const {
            fills, fillOpacity, strokes, strokeOpacity, strokeWidth,
            seriesItemEnabled, shadow
        } = this;
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
            shape.stroke = strokes[index % strokes.length];
            shape.strokeOpacity = strokeOpacity;
            shape.strokeWidth = strokeWidth;
            shape.fillShadow = shadow;
            shape.visible = !!seriesItemEnabled.get(datum.yKey);

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
        const { strokes, strokeWidth, strokeOpacity, data, seriesItemEnabled } = this;
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
            shape.visible = !!seriesItemEnabled.get(datum.yKey);
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
        const data = marker.shape ? markerSelectionData : [];
        const MarkerShape = getMarker(marker.shape);
        const updateMarkers = this.markerSelection.setData(data);
        updateMarkers.exit.remove();
        const enterMarkers = updateMarkers.enter.append(MarkerShape);
        this.markerSelection = updateMarkers.merge(enterMarkers);
    }

    private updateMarkerNodes(): void {
        const { marker } = this;
        const markerFormatter = marker.formatter;
        const markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : this.strokeWidth;
        const markerSize = marker.size;
        const { xKey, seriesItemEnabled } = this;
        const { highlightedDatum } = this.chart;
        const { fill: highlightFill, stroke: highlightStroke } = this.highlightStyle;

        this.markerSelection.each((node, datum) => {
            const highlighted = datum === highlightedDatum;
            const markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill || datum.fill;
            const markerStroke = highlighted && highlightStroke !== undefined ? highlightStroke : marker.stroke || datum.stroke;
            let markerFormat: CartesianSeriesMarkerFormat | undefined = undefined;

            if (markerFormatter) {
                markerFormat = markerFormatter({
                    datum: datum.seriesDatum,
                    xKey,
                    yKey: datum.yKey,
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
            node.visible = marker.enabled && node.size > 0 && !!seriesItemEnabled.get(datum.yKey);
        });
    }

    getNodeData(): MarkerSelectionDatum[] {
        return this.markerSelectionData;
    }

    fireNodeClickEvent(datum: MarkerSelectionDatum): void {
        this.fireEvent<AreaSeriesNodeClickEvent>({
            type: 'nodeClick',
            series: this,
            datum: datum.seriesDatum,
            xKey: this.xKey,
            yKey: datum.yKey
        });
    }

    getTooltipHtml(nodeDatum: MarkerSelectionDatum): string {
        const { xKey } = this;
        const { yKey } = nodeDatum;

        if (!xKey || !yKey) {
            return '';
        }

        const { xName, yKeys, yNames, fills, tooltipRenderer } = this;
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
                color
            });
        } else {
            const titleStyle = `style="color: white; background-color: ${color}"`;
            const titleString = yName ? `<div class="${Chart.defaultTooltipClass}-title" ${titleStyle}>${yName}</div>` : '';
            const seriesDatum = nodeDatum.seriesDatum;
            const xValue = seriesDatum[xKey];
            const yValue = seriesDatum[yKey];
            const xString = typeof xValue === 'number' ? toFixed(xValue) : String(xValue);
            const yString = typeof yValue === 'number' ? toFixed(yValue) : String(yValue);

            return `${titleString}<div class="${Chart.defaultTooltipClass}-content">${xString}: ${yString}</div>`;
        }
    }

    listSeriesItems(legendData: LegendDatum[]): void {
        const {
            data, id, xKey, yKeys, yNames, seriesItemEnabled,
            marker, fills, strokes, fillOpacity, strokeOpacity
        } = this;

        if (data && data.length && xKey && yKeys.length) {
            yKeys.forEach((yKey, index) => {
                legendData.push({
                    id,
                    itemId: yKey,
                    enabled: seriesItemEnabled.get(yKey) || false,
                    label: {
                        text: yNames[index] || yKeys[index]
                    },
                    marker: {
                        shape: marker.shape,
                        fill: marker.fill || fills[index % fills.length],
                        stroke: marker.stroke || strokes[index % strokes.length],
                        fillOpacity,
                        strokeOpacity
                    }
                });
            });
        }
    }

    toggleSeriesItem(itemId: string, enabled: boolean): void {
        this.seriesItemEnabled.set(itemId, enabled);
        this.scheduleData();
    }
}
