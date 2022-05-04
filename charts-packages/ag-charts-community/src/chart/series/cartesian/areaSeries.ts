import { Group } from "../../../scene/group";
import { Selection } from "../../../scene/selection";
import { DropShadow } from "../../../scene/dropShadow";
import {
    SeriesNodeDatum,
    CartesianTooltipRendererParams as AreaTooltipRendererParams,
    SeriesTooltip
} from "../series";
import { PointerEvents } from "../../../scene/node";
import { LegendDatum } from "../../legend";
import { Path } from "../../../scene/shape/path";
import { Marker } from "../../marker/marker";
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesMarkerFormat } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { getMarker } from "../../marker/util";
import { TooltipRendererResult, toTooltipHtml } from "../../chart";
import { extent } from "../../../util/array";
import { equal } from "../../../util/equal";
import { reactive, TypedEvent } from "../../../util/observable";
import { interpolate } from "../../../util/string";
import { Text } from "../../../scene/shape/text";
import { Label } from "../../label";
import { sanitizeHtml } from "../../../util/sanitize";
import { FontStyle, FontWeight } from "../../../scene/shape/text";
import { isContinuous, isDiscrete, isNumber } from "../../../util/value";
import { clamper, ContinuousScale } from "../../../scale/continuousScale";
import { doOnce } from "../../../util/function";

interface FillSelectionDatum {
    readonly itemId: string;
    readonly points: { x: number, y: number }[];
}

interface StrokeSelectionDatum extends FillSelectionDatum {
    readonly yValues: (number | undefined)[];
}

export interface AreaSeriesNodeClickEvent extends TypedEvent {
    readonly type: 'nodeClick';
    readonly event: MouseEvent;
    readonly series: AreaSeries;
    readonly datum: any;
    readonly xKey: string;
    readonly yKey: string;
}

interface MarkerSelectionDatum extends SeriesNodeDatum {
    readonly index: number;
    readonly point: {
        readonly x: number;
        readonly y: number;
    };
    readonly fill?: string;
    readonly stroke?: string;
    readonly yKey: string;
    readonly yValue: number;
}

interface LabelSelectionDatum {
    readonly index: number;
    readonly itemId: any;
    readonly point: {
        readonly x: number;
        readonly y: number;
    }
    readonly label?: {
        readonly text: string;
        readonly fontStyle?: FontStyle;
        readonly fontWeight?: FontWeight;
        readonly fontSize: number;
        readonly fontFamily: string;
        readonly textAlign: CanvasTextAlign;
        readonly textBaseline: CanvasTextBaseline;
        readonly fill: string;
    };
}

export { AreaTooltipRendererParams };

type Coordinate = { x: number; y: number };
type CumulativeValue = { left: number; right: number };
type ProcessedXDatum = {
    xDatum: any;
    seriesDatum: any;
}

class AreaSeriesLabel extends Label {
    @reactive('change') formatter?: (params: { value: any }) => string;
}

export class AreaSeriesTooltip extends SeriesTooltip {
    @reactive('change') renderer?: (params: AreaTooltipRendererParams) => string | TooltipRendererResult;
    @reactive('change') format?: string;
}

export class AreaSeries extends CartesianSeries {

    static className = 'AreaSeries';
    static type = 'area' as const;

    tooltip: AreaSeriesTooltip = new AreaSeriesTooltip();

    private areaGroup = this.group.insertBefore(new Group, this.pickGroup);
    private strokeGroup = this.group.insertBefore(new Group, this.pickGroup);
    private markerGroup = this.pickGroup.appendChild(new Group);
    private labelGroup = this.group.appendChild(new Group);

    private fillSelection: Selection<Path, Group, FillSelectionDatum, any> = Selection.select(this.areaGroup).selectAll<Path>();
    private strokeSelection: Selection<Path, Group, StrokeSelectionDatum, any> = Selection.select(this.strokeGroup).selectAll<Path>();
    private markerSelection: Selection<Marker, Group, MarkerSelectionDatum, any> = Selection.select(this.markerGroup).selectAll<Marker>();
    private labelSelection: Selection<Text, Group, LabelSelectionDatum, any> = Selection.select(this.labelGroup).selectAll<Text>();

    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yKeys} setter.
     */
    private readonly seriesItemEnabled = new Map<string, boolean>();

    private xData: ProcessedXDatum[] = [];
    private yData: number[][] = [];
    private fillSelectionData: FillSelectionDatum[] = [];
    private strokeSelectionData: StrokeSelectionDatum[] = [];
    private markerSelectionData: MarkerSelectionDatum[] = [];
    private labelSelectionData: LabelSelectionDatum[] = [];
    private yDomain: any[] = [];
    private xDomain: any[] = [];

    directionKeys = {
        x: ['xKey'],
        y: ['yKeys']
    };

    readonly marker = new CartesianSeriesMarker();

    readonly label = new AreaSeriesLabel();

    @reactive('dataChange') fills: string[] = [
        '#c16068',
        '#a2bf8a',
        '#ebcc87',
        '#80a0c3',
        '#b58dae',
        '#85c0d1'
    ];

    @reactive('dataChange') strokes: string[] = [
        '#874349',
        '#718661',
        '#a48f5f',
        '#5a7088',
        '#7f637a',
        '#5d8692'
    ];

    @reactive('update') fillOpacity = 1;
    @reactive('update') strokeOpacity = 1;

    @reactive('update') lineDash?: number[] = [0];
    @reactive('update') lineDashOffset: number = 0;

    constructor() {
        super();

        this.addEventListener('update', this.scheduleUpdate);

        const { marker, label } = this;

        marker.enabled = false;
        marker.addPropertyListener('shape', this.onMarkerShapeChange, this);
        marker.addEventListener('change', this.scheduleUpdate, this);

        label.enabled = false;
        label.addEventListener('change', this.scheduleUpdate, this);
    }

    onMarkerShapeChange() {
        this.markerSelection = this.markerSelection.setData([]);
        this.markerSelection.exit.remove();

        this.fireEvent({ type: 'legendChange' });
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

    protected highlightedDatum?: MarkerSelectionDatum;

    processData(): boolean {
        const { xKey, yKeys, seriesItemEnabled, xAxis, yAxis, normalizedTo } = this;
        const data = xKey && yKeys.length && this.data ? this.data : [];

        if (!xAxis || !yAxis) {
            return false;
        }

        // If the data is an array of rows like so:
        //
        // [{
        //   xKey: 'Jan',
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

        const isContinuousX = xAxis.scale instanceof ContinuousScale;
        const isContinuousY = yAxis.scale instanceof ContinuousScale;
        const normalized = normalizedTo && isFinite(normalizedTo);

        const yData: number[][] = [];
        const xData = [];
        const xValues = [];

        for (let datum of data) {
            // X datum
            if (!(xKey in datum)) {
                doOnce(() => console.warn(`The key '${xKey}' was not found in the data: `, datum), `${xKey} not found in data`);
                continue;
            }

            const xDatum = this.checkDatum(datum[xKey], isContinuousX);
            if (isContinuousX && xDatum === undefined) {
                continue;
            } else {
                xValues.push(xDatum);
                xData.push({ xDatum, seriesDatum: datum });
            }

            // Y datum
            yKeys.forEach((yKey, i) => {
                if (!(yKey in datum)) {
                    doOnce(() => console.warn(`The key '${yKey}' was not found in the data: `, datum), `${yKey} not found in data`);
                    return;
                }
                const value = datum[yKey];
                const seriesYs = yData[i] || (yData[i] = []);

                if (!seriesItemEnabled.get(yKey)) {
                    seriesYs.push(0);
                } else {
                    const yDatum = this.checkDatum(value, isContinuousY);
                    seriesYs.push(yDatum);
                }
            });
        }

        this.yData = yData;
        this.xData = xData;

        this.xDomain = isContinuousX ? this.fixNumericExtent(extent(xValues, isContinuous), 'x', xAxis) : xValues;

        // xData: ['Jan', 'Feb', undefined]
        //
        // yData: [
        //   [5, 10], <- series 1 (yKey1)
        //   [7, -15], <- series 2 (yKey2)
        //   [-9, 20] <- series 3 (yKey3)
        // ]

        let yMin = 0;
        let yMax = 0;

        for (let i = 0; i < xData.length; i++) {
            const total = { sum: 0, absSum: 0 };
            for (let seriesYs of yData) {
                if (seriesYs[i] === undefined) {
                    continue;
                }

                const y = +seriesYs[i]; // convert to number as the value could be a Date object

                total.absSum += Math.abs(y);
                total.sum += y;

                if (total.sum > yMax) {
                    yMax = total.sum;
                } else if (total.sum < yMin) {
                    yMin = total.sum;
                }

            }

            if (!(normalized && normalizedTo)) {
                continue;
            }

            let normalizedTotal = 0;
            // normalize y values using the absolute sum of y values in the stack
            for (let seriesYs of yData) {
                const normalizedY = +seriesYs[i] / total.absSum * normalizedTo;
                seriesYs[i] = normalizedY;

                // sum normalized values to get updated yMin and yMax of normalized area
                normalizedTotal += normalizedY;

                if (normalizedTotal > yMax) {
                    yMax = normalizedTotal;
                } else if (normalizedTotal < yMin) {
                    yMin = normalizedTotal;
                }
            }
        }

        if (normalized && normalizedTo) {
            // multiplier to control the unused whitespace in the y domain, value selected by subjective visual 'niceness'.
            const domainWhitespaceAdjustment = 0.5;

            // set the yMin and yMax based on cumulative sum of normalized values
            yMin = yMin < (-normalizedTo * domainWhitespaceAdjustment) ? -normalizedTo : yMin;
            yMax = yMax > (normalizedTo * domainWhitespaceAdjustment) ? normalizedTo : yMax;
        }

        this.yDomain = this.fixNumericExtent([yMin, yMax], 'y', yAxis);

        this.fireEvent({ type: 'dataProcessed' });

        return true;
    }

    findLargestMinMax(totals: { min: number, max: number }[]): { min: number, max: number } {
        let min = 0;
        let max = 0;

        for (const total of totals) {
            if (total.min < min) {
                min = total.min;
            }
            if (total.max > max) {
                max = total.max;
            }
        }

        return { min, max };
    }

    getDomain(direction: ChartAxisDirection): any[] {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        } else {
            return this.yDomain;
        }
    }

    update(): void {
        this.updatePending = false;

        this.updateSelections();
        this.updateNodes();
    }

    updateSelections() {
        if (!this.nodeDataPending) {
            return;
        }
        this.nodeDataPending = false;

        this.createSelectionData();

        this.updateFillSelection();
        this.updateStrokeSelection();
        this.updateMarkerSelection();
        this.updateLabelSelection();
    }

    updateNodes() {
        this.group.visible = this.visible && this.xData.length > 0 && this.yData.length > 0;
        this.updateFillNodes();
        this.updateStrokeNodes();
        this.updateMarkerNodes();
        this.updateLabelNodes();
    }

    private createSelectionData() {
        const {
            data,
            xAxis,
            yAxis,
            xData,
            yData,
            labelSelectionData,
            markerSelectionData,
            strokeSelectionData,
            fillSelectionData,
            xKey
        } = this;

        if (!data || !xAxis || !yAxis || !xData.length || !yData.length) {
            return;
        }

        const { yKeys, marker, label, fills, strokes } = this;
        const { scale: xScale } = xAxis;
        const { scale: yScale } = yAxis;

        const continuousY = yScale instanceof ContinuousScale;

        const xOffset = (xScale.bandwidth || 0) / 2;

        markerSelectionData.length = 0;
        labelSelectionData.length = 0;
        strokeSelectionData.length = 0;
        fillSelectionData.length = 0;

        const cumulativePathValues: CumulativeValue[] = new Array(xData.length).fill(null).map(() => ({ left: 0, right: 0 }));
        const cumulativeMarkerValues: number[] = new Array(xData.length).fill(0);

        const createPathCoordinates = (
            xDatum: any,
            yDatum: number,
            idx: number,
            side: keyof CumulativeValue
        ): [Coordinate, Coordinate] => {

            const x = xScale.convert(xDatum) + xOffset;

            const prevY = cumulativePathValues[idx][side];
            const currY = cumulativePathValues[idx][side] + yDatum;

            const prevYCoordinate = yScale.convert(prevY, continuousY ? clamper : undefined);
            const currYCoordinate = yScale.convert(currY, continuousY ? clamper : undefined);

            cumulativePathValues[idx][side] = currY;

            return [
                { x, y: currYCoordinate },
                { x, y: prevYCoordinate },
            ];
        }

        const createMarkerCoordinate = (xDatum: any, yDatum: number, idx: number, rawYDatum: any): Coordinate => {
            let currY;

            // if not normalized, the invalid data points will be processed as `undefined` in processData()
            // if normalized, the invalid data points will be processed as 0 rather than `undefined`
            // check if unprocessed datum is valid as we only want to show markers for valid points
            const normalized = this.normalizedTo && isFinite(this.normalizedTo);
            const normalizedAndValid = normalized && continuousY && isContinuous(rawYDatum);

            const valid = (!normalized && !isNaN(yDatum)) || normalizedAndValid;

            if (valid) {
                currY = cumulativeMarkerValues[idx] += yDatum;
            }

            const x = xScale.convert(xDatum) + xOffset;
            const y = yScale.convert(currY, continuousY ? clamper : undefined);

            return { x, y };
        }

        yData.forEach((seriesYs, seriesIdx) => {
            const yKey = yKeys[seriesIdx];

            const fillSelectionForSeries = fillSelectionData[seriesIdx] || (fillSelectionData[seriesIdx] = { itemId: yKey, points: [] });
            const fillPoints = fillSelectionForSeries.points;
            const fillPhantomPoints: Coordinate[] = [];

            const strokeDatum = strokeSelectionData[seriesIdx] || (strokeSelectionData[seriesIdx] = { itemId: yKey, points: [], yValues: [] });
            const strokePoints = strokeDatum.points;
            const yValues = strokeDatum.yValues;

            seriesYs.forEach((yDatum, datumIdx) => {
                const { xDatum, seriesDatum } = xData[datumIdx];
                const nextXDatum = xData[datumIdx + 1]?.xDatum;
                const nextYDatum = seriesYs[datumIdx + 1];

                // marker data
                const point = createMarkerCoordinate(xDatum, +yDatum, datumIdx, seriesDatum[yKey]);

                if (marker) {
                    markerSelectionData.push({
                        index: datumIdx,
                        series: this,
                        itemId: yKey,
                        datum: seriesDatum,
                        yValue: yDatum,
                        yKey,
                        point,
                        fill: fills[seriesIdx % fills.length],
                        stroke: strokes[seriesIdx % strokes.length]
                    });
                }

                // label data
                let labelText: string;

                if (label.formatter) {
                    labelText = label.formatter({ value: yDatum });
                } else {
                    labelText = isNumber(yDatum) ? Number(yDatum).toFixed(2) : String(yDatum);
                }

                if (label) {
                    labelSelectionData.push({
                        index: datumIdx,
                        itemId: yKey,
                        point,
                        label: this.seriesItemEnabled.get(yKey) && labelText ? {
                            text: labelText,
                            fontStyle: label.fontStyle,
                            fontWeight: label.fontWeight,
                            fontSize: label.fontSize,
                            fontFamily: label.fontFamily,
                            textAlign: 'center',
                            textBaseline: 'bottom',
                            fill: label.color
                        } : undefined
                    });
                }

                // fill data
                // Handle data in pairs of current and next x and y values
                const windowX = [xDatum, nextXDatum];
                const windowY = [yDatum, nextYDatum];

                if (windowX.some((v) => v == undefined)) {
                    return;
                }
                if (windowY.some((v) => v == undefined)) {
                    windowY[0] = 0;
                    windowY[1] = 0;
                }

                const currCoordinates = createPathCoordinates(windowX[0], +windowY[0], datumIdx, 'right');
                fillPoints.push(currCoordinates[0]);
                fillPhantomPoints.push(currCoordinates[1]);

                const nextCoordinates = createPathCoordinates(windowX[1], +windowY[1], datumIdx, 'left');
                fillPoints.push(nextCoordinates[0]);
                fillPhantomPoints.push(nextCoordinates[1]);

                // stroke data
                strokePoints.push({ x: NaN, y: NaN }); // moveTo
                yValues.push(undefined);

                strokePoints.push(currCoordinates[0]);
                yValues.push(yDatum);

                if (nextYDatum !== undefined) {
                    strokePoints.push(nextCoordinates[0]);
                    yValues.push(yDatum);
                }
            });

            fillPoints.push(...fillPhantomPoints.slice().reverse());
        });
    }

    private updateFillSelection(): void {
        const updateFills = this.fillSelection.setData(this.fillSelectionData);

        updateFills.exit.remove();

        const enterFills = updateFills.enter.append(Path)
            .each(path => {
                path.lineJoin = 'round';
                path.stroke = undefined;
                path.pointerEvents = PointerEvents.None;
            });

        this.fillSelection = updateFills.merge(enterFills);
    }

    private updateFillNodes() {
        const { fills, fillOpacity, strokeOpacity, strokeWidth, shadow, seriesItemEnabled } = this;

        this.fillSelection.each((shape, datum, index) => {
            shape.fill = fills[index % fills.length];
            shape.fillOpacity = fillOpacity;
            shape.strokeOpacity = strokeOpacity;
            shape.strokeWidth = strokeWidth;
            shape.lineDash = this.lineDash;
            shape.lineDashOffset = this.lineDashOffset;
            shape.fillShadow = shadow;
            shape.visible = !!seriesItemEnabled.get(datum.itemId);
            shape.opacity = this.getOpacity(datum);

            const { points } = datum;

            const path = shape.path;
            path.clear();

            points.forEach(({ x, y }, i) => {
                if (i > 0) {
                    path.lineTo(x, y);
                } else {
                    path.moveTo(x, y);
                }
            });

            path.closePath();
        });
    }

    private updateStrokeSelection(): void {
        const updateStrokes = this.strokeSelection.setData(this.strokeSelectionData);

        updateStrokes.exit.remove();

        const enterStrokes = updateStrokes.enter.append(Path)
            .each(path => {
                path.fill = undefined;
                path.lineJoin = path.lineCap = 'round';
                path.pointerEvents = PointerEvents.None;
            });

        this.strokeSelection = updateStrokes.merge(enterStrokes);
    }

    private updateStrokeNodes() {
        if (!this.data) {
            return;
        }

        const { strokes, strokeOpacity, seriesItemEnabled } = this;

        let moveTo = true;

        this.strokeSelection.each((shape, datum, index) => {
            shape.visible = !!seriesItemEnabled.get(datum.itemId);
            shape.opacity = this.getOpacity(datum);
            shape.stroke = strokes[index % strokes.length];
            shape.strokeWidth = this.getStrokeWidth(this.strokeWidth, datum);
            shape.strokeOpacity = strokeOpacity;
            shape.lineDash = this.lineDash;
            shape.lineDashOffset = this.lineDashOffset;

            const { points, yValues } = datum;

            const path = shape.path
            path.clear();

            for (let i = 0; i < points.length; i++) {
                const { x, y } = points[i];

                if (yValues[i] === undefined) {
                    moveTo = true;
                } else {
                    if (moveTo) {
                        path.moveTo(x, y);
                        moveTo = false;
                    } else {
                        path.lineTo(x, y);
                    }
                }
            }
        });
    }

    private updateMarkerSelection(): void {
        const MarkerShape = getMarker(this.marker.shape);
        const data = MarkerShape ? this.markerSelectionData : [];
        const updateMarkers = this.markerSelection.setData(data);
        updateMarkers.exit.remove();
        const enterMarkers = updateMarkers.enter.append(MarkerShape);
        this.markerSelection = updateMarkers.merge(enterMarkers);
    }

    private updateMarkerNodes(): void {
        if (!this.chart) {
            return;
        }

        const {
            xKey, marker, seriesItemEnabled,
            yKeys,
            fills,
            strokes,
            chart: { highlightedDatum },
            highlightStyle: {
                fill: deprecatedFill,
                stroke: deprecatedStroke,
                strokeWidth: deprecatedStrokeWidth,
                item: {
                    fill: highlightedFill = deprecatedFill,
                    stroke: highlightedStroke = deprecatedStroke,
                    strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth,
                }
            }
        } = this;

        const { size, formatter } = marker;
        const markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : this.strokeWidth;

        this.markerSelection.each((node, datum) => {
            const yKeyIndex = yKeys.indexOf(datum.yKey);
            const isDatumHighlighted = datum === highlightedDatum;
            const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill || fills[yKeyIndex % fills.length];
            const stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : marker.stroke || strokes[yKeyIndex % fills.length];
            const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                ? highlightedDatumStrokeWidth
                : markerStrokeWidth;

            let format: CartesianSeriesMarkerFormat | undefined = undefined;
            if (formatter) {
                format = formatter({
                    datum: datum.datum,
                    xKey,
                    yKey: datum.yKey,
                    fill,
                    stroke,
                    strokeWidth,
                    size,
                    highlighted: isDatumHighlighted
                });
            }

            node.fill = format && format.fill || fill;
            node.stroke = format && format.stroke || stroke;
            node.strokeWidth = format && format.strokeWidth !== undefined
                ? format.strokeWidth
                : strokeWidth;
            node.size = format && format.size !== undefined
                ? format.size
                : size;

            node.translationX = datum.point.x;
            node.translationY = datum.point.y;
            node.visible = marker.enabled && node.size > 0 && !!seriesItemEnabled.get(datum.yKey) && !isNaN(datum.point.x) && !isNaN(datum.point.y);
            node.opacity = this.getOpacity(datum);
        });
    }

    private updateLabelSelection(): void {
        const updateLabels = this.labelSelection.setData(this.labelSelectionData);
        updateLabels.exit.remove();
        const enterLabels = updateLabels.enter.append(Text);
        this.labelSelection = updateLabels.merge(enterLabels);
    }

    private updateLabelNodes(): void {
        if (!this.chart) {
            return;
        }

        const { enabled: labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color } = this.label;
        this.labelSelection.each((text, datum) => {
            const { point, label } = datum;

            if (label && labelEnabled) {
                text.fontStyle = fontStyle;
                text.fontWeight = fontWeight;
                text.fontSize = fontSize;
                text.fontFamily = fontFamily;
                text.textAlign = label.textAlign;
                text.textBaseline = label.textBaseline;
                text.text = label.text;
                text.x = point.x;
                text.y = point.y - 10;
                text.fill = color;
                text.visible = true;
                text.opacity = this.getOpacity(datum);
            } else {
                text.visible = false;
            }
        });
    }

    getNodeData(): readonly MarkerSelectionDatum[] {
        return this.markerSelectionData;
    }

    fireNodeClickEvent(event: MouseEvent, datum: MarkerSelectionDatum): void {
        this.fireEvent<AreaSeriesNodeClickEvent>({
            type: 'nodeClick',
            event,
            series: this,
            datum: datum.datum,
            xKey: this.xKey,
            yKey: datum.yKey
        });
    }

    getTooltipHtml(nodeDatum: MarkerSelectionDatum): string {
        const { xKey } = this;
        const { yKey } = nodeDatum;

        if (!(xKey && yKey) || !this.seriesItemEnabled.get(yKey)) {
            return '';
        }

        const datum = nodeDatum.datum;
        const xValue = datum[xKey];
        const yValue = datum[yKey];
        const { xAxis, yAxis } = this;

        if (!(xAxis && yAxis && isNumber(yValue))) {
            return '';
        }

        const { xName, yKeys, yNames, yData, fills, strokes, tooltip, marker } = this;

        const { size, formatter: markerFormatter, strokeWidth: markerStrokeWidth, fill: markerFill, stroke: markerStroke } = marker;

        const xString = xAxis.formatDatum(xValue);
        const yString = yAxis.formatDatum(yValue);
        const yKeyIndex = yKeys.indexOf(yKey);
        const seriesYs = yData[yKeyIndex];
        const processedYValue = seriesYs[nodeDatum.index];
        const yName = yNames[yKeyIndex];
        const title = sanitizeHtml(yName);
        const content = sanitizeHtml(xString + ': ' + yString);

        const strokeWidth = markerStrokeWidth !== undefined ? markerStrokeWidth : this.strokeWidth;
        const fill = markerFill || fills[yKeyIndex % fills.length];
        const stroke = markerStroke || strokes[yKeyIndex % fills.length];

        let format: CartesianSeriesMarkerFormat | undefined = undefined;

        if (markerFormatter) {
            format = markerFormatter({
                datum,
                xKey,
                yKey,
                fill,
                stroke,
                strokeWidth,
                size,
                highlighted: false
            });
        }

        const color = format && format.fill || fill;

        const defaults: TooltipRendererResult = {
            title,
            backgroundColor: color,
            content
        };
        const {
            renderer: tooltipRenderer,
            format: tooltipFormat
        } = tooltip;

        if (tooltipFormat || tooltipRenderer) {
            const params = {
                datum,
                xKey,
                xName,
                xValue,
                yKey,
                yValue,
                processedYValue,
                yName,
                color
            };
            if (tooltipFormat) {
                return toTooltipHtml({
                    content: interpolate(tooltipFormat, params)
                }, defaults);
            }
            if (tooltipRenderer) {
                return toTooltipHtml(tooltipRenderer(params), defaults);
            }
        }

        return toTooltipHtml(defaults);
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
